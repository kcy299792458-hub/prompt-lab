import type { SupabaseClient } from "@supabase/supabase-js";

export type PromptDraftStatus = "pending" | "approved" | "rejected" | "published" | "failed";

export type PromptDraftRow = {
  id: string;
  title: string;
  description: string;
  prompt_body: string;
  category: string;
  model: string;
  aspect_ratio: string;
  style: string;
  image_url: string;
  image_urls: string[];
  tags: string[];
  source_urls: string[];
  source_notes: string;
  status: PromptDraftStatus;
  quality_score: number | null;
  risk_notes: string;
  agent_name: string;
  published_image_post_id: string | null;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
};

export type NormalizedPromptDraft = {
  title: string;
  description: string;
  prompt_body: string;
  category: string;
  model: string;
  aspect_ratio: string;
  style: string;
  image_url: string;
  image_urls: string[];
  tags: string[];
  source_urls: string[];
  source_notes: string;
  quality_score: number | null;
  risk_notes: string;
  agent_name: string;
  scheduled_for: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickString(input: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = input[key];
    if (typeof value === "string") return value.trim();
  }

  return fallback;
}

function pickStringList(input: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = input[key];

    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeScore(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(10, Math.round(value * 100) / 100));
}

function left(value: string, length: number) {
  return value.slice(0, length);
}

export function normalizePromptDraftInput(payload: unknown):
  | { data: NormalizedPromptDraft; autoPublish: boolean }
  | { error: string } {
  const input = asRecord(payload);
  const title = left(pickString(input, ["title", "seoTitle"]), 80);
  const description = left(pickString(input, ["description", "summary"]), 1000);
  const promptBody = left(pickString(input, ["prompt_body", "promptBody", "body", "prompt"]), 12000);

  if (title.length < 2) {
    return { error: "title must be 2-80 characters." };
  }

  if (!promptBody) {
    return { error: "prompt_body is required." };
  }

  const imageUrls = pickStringList(input, ["image_urls", "imageUrls"])
    .map((url) => left(url, 1000))
    .slice(0, 8);
  const imageUrl = left(pickString(input, ["image_url", "imageUrl"], imageUrls[0] || ""), 1000);

  return {
    data: {
      title,
      description,
      prompt_body: promptBody,
      category: left(pickString(input, ["category"], "제품/광고"), 80),
      model: left(pickString(input, ["model"], "GPT Image"), 80),
      aspect_ratio: left(pickString(input, ["aspect_ratio", "aspectRatio"], "4:5"), 40),
      style: left(pickString(input, ["style"], "AI Prompt Trend"), 120),
      image_url: imageUrl,
      image_urls: imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [],
      tags: pickStringList(input, ["tags"]).map((tag) => left(tag, 40)).slice(0, 10),
      source_urls: pickStringList(input, ["source_urls", "sourceUrls", "sources"])
        .map((url) => left(url, 1000))
        .slice(0, 10),
      source_notes: left(pickString(input, ["source_notes", "sourceNotes", "notes"]), 2000),
      quality_score: normalizeScore(input.quality_score ?? input.qualityScore),
      risk_notes: left(pickString(input, ["risk_notes", "riskNotes"]), 2000),
      agent_name: left(pickString(input, ["agent_name", "agentName"], "hermes"), 80),
      scheduled_for: pickString(input, ["scheduled_for", "scheduledFor"]) || null,
    },
    autoPublish: input.auto_publish === true || input.autoPublish === true,
  };
}

export async function publishPromptDraft(
  supabase: SupabaseClient,
  draft: PromptDraftRow,
  authorId: string,
) {
  const imageUrls = (draft.image_urls?.length ? draft.image_urls : [draft.image_url]).filter(Boolean);

  if (imageUrls.length === 0) {
    throw new Error("발행하려면 결과 이미지 URL이 필요합니다.");
  }

  const { data: postData, error: postError } = await supabase
    .from("image_posts")
    .insert({
      author_id: authorId,
      title: draft.title,
      description: draft.description,
      category: draft.category,
      model: draft.model,
      aspect_ratio: draft.aspect_ratio,
      style: draft.style,
      image_url: imageUrls[0],
      image_urls: imageUrls,
      tags: draft.tags || [],
    })
    .select("id")
    .single();

  if (postError || !postData) {
    throw new Error(postError?.message || "이미지 게시글을 발행할 수 없습니다.");
  }

  const { error: versionError } = await supabase.from("prompt_versions").insert({
    image_post_id: postData.id as string,
    label: "Hermes 생성 프롬프트",
    language: "mixed",
    body: draft.prompt_body,
  });

  if (versionError) {
    throw new Error(versionError.message);
  }

  const { error: updateError } = await supabase
    .from("prompt_drafts")
    .update({
      status: "published",
      published_image_post_id: postData.id,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", draft.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return postData.id as string;
}
