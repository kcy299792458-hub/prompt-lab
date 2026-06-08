import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  normalizePromptDraftInput,
  publishPromptDraft,
  type PromptDraftRow,
} from "@/lib/prompt-drafts";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const token = process.env.PROMPT_LAB_AGENT_TOKEN;
  const header = request.headers.get("authorization") || "";

  if (!token) return false;
  return header === `Bearer ${token}`;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

const HERMES_AGENT_AUTHOR = {
  id: "10000000-0000-4000-8000-000000000099",
  email: "hermes-agent@promptlab.example",
  authNickname: "hermes_agent",
  nickname: "\uD5E4\uB974\uBA54\uC2A4\uB7A9",
  bio: "\uC6F9\uC5D0\uC11C AI \uC774\uBBF8\uC9C0 \uD504\uB86C\uD504\uD2B8 \uD750\uB984\uC744 \uC870\uC0AC\uD558\uACE0, \uD504\uB86C\uD504\uD2B8\uB7A9\uC6A9 \uC608\uC2DC\uB97C \uC815\uB9AC\uD558\uB294 \uC790\uB3D9 \uC791\uC131\uC790\uC785\uB2C8\uB2E4.",
  specialty:
    "AI \uC774\uBBF8\uC9C0 \uD2B8\uB80C\uB4DC \uB9AC\uC11C\uCE58, \uD504\uB86C\uD504\uD2B8 \uC7AC\uC791\uC131, \uACB0\uACFC \uC608\uC2DC \uD050\uB808\uC774\uC158",
};

function getAutoPublishMinScore() {
  const score = Number(process.env.PROMPT_LAB_AGENT_AUTOPUBLISH_MIN_SCORE);
  return Number.isFinite(score) ? score : 8.5;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(input: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = input[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pickStringValue(input: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = input[key];
    if (typeof value === "string") return value.trim();
  }
  return "";
}

function clip(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function extensionForMime(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "";
  }
}

async function attachUploadedImage(payload: unknown, supabase: NonNullable<ReturnType<typeof createSupabaseServiceRoleClient>>) {
  if (!isRecord(payload)) return payload;

  const imageBase64Input = pickString(payload, ["imageBase64", "image_base64", "imageData", "image_data"]);
  if (!imageBase64Input) return payload;

  const dataUrlMatch = imageBase64Input.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  const mimeType = dataUrlMatch
    ? dataUrlMatch[1].toLowerCase()
    : pickString(payload, ["imageMimeType", "image_mime_type"]).toLowerCase();
  const extension = extensionForMime(mimeType);

  if (!extension) {
    throw new Error("imageBase64 must be a JPEG, PNG, WebP, or GIF image.");
  }

  const rawBase64 = dataUrlMatch ? dataUrlMatch[2] : imageBase64Input;
  const imageBuffer = Buffer.from(rawBase64.replace(/\s/g, ""), "base64");

  if (imageBuffer.length === 0 || imageBuffer.length > 10 * 1024 * 1024) {
    throw new Error("imageBase64 must decode to an image between 1 byte and 10MB.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const path = `agent/${today}/${randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage.from("prompt-images").upload(path, imageBuffer, {
    cacheControl: "31536000",
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicData } = supabase.storage.from("prompt-images").getPublicUrl(data.path);
  const publicUrl = publicData.publicUrl;
  const existingImageUrls = Array.isArray(payload.imageUrls)
    ? payload.imageUrls
    : Array.isArray(payload.image_urls)
      ? payload.image_urls
      : [];
  const imageUrls = [publicUrl, ...existingImageUrls.filter((url) => typeof url === "string" && url !== publicUrl)];

  return {
    ...payload,
    imageUrl: typeof payload.imageUrl === "string" && payload.imageUrl.trim() ? payload.imageUrl : publicUrl,
    imageUrls,
  };
}

async function ensureHermesAgentAuthor(
  supabase: NonNullable<ReturnType<typeof createSupabaseServiceRoleClient>>,
  authorId: string,
) {
  if (authorId !== HERMES_AGENT_AUTHOR.id) return;

  const { data: existingProfile, error: profileReadError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", HERMES_AGENT_AUTHOR.id)
    .maybeSingle();

  if (profileReadError) {
    throw new Error(profileReadError.message);
  }

  if (existingProfile) return;

  const existingUser = await supabase.auth.admin.getUserById(HERMES_AGENT_AUTHOR.id);

  if (existingUser.error) {
    const created = await supabase.auth.admin.createUser({
      id: HERMES_AGENT_AUTHOR.id,
      email: HERMES_AGENT_AUTHOR.email,
      email_confirm: true,
      user_metadata: { nickname: HERMES_AGENT_AUTHOR.authNickname },
      app_metadata: { provider: "email", providers: ["email"] },
    });

    if (created.error) {
      throw new Error(created.error.message);
    }
  } else {
    const updated = await supabase.auth.admin.updateUserById(HERMES_AGENT_AUTHOR.id, {
      email: HERMES_AGENT_AUTHOR.email,
      email_confirm: true,
      user_metadata: { nickname: HERMES_AGENT_AUTHOR.authNickname },
      app_metadata: { provider: "email", providers: ["email"] },
    });

    if (updated.error) {
      throw new Error(updated.error.message);
    }
  }

  const { error: profileWriteError } = await supabase.from("profiles").upsert(
    {
      id: HERMES_AGENT_AUTHOR.id,
      nickname: HERMES_AGENT_AUTHOR.nickname,
      bio: HERMES_AGENT_AUTHOR.bio,
      specialty: HERMES_AGENT_AUTHOR.specialty,
      website_url: "",
      instagram_url: "",
      x_url: "",
      role: "user",
    },
    { onConflict: "id" },
  );

  if (profileWriteError) {
    throw new Error(profileWriteError.message);
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return jsonError("Unauthorized.", 401);
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return jsonError("Supabase service role is not configured.", 503);
  }

  const status = request.nextUrl.searchParams.get("status") || "pending";
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") || 20), 50);

  const { data, error } = await supabase
    .from("prompt_drafts")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ ok: true, drafts: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return jsonError("Unauthorized.", 401);
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return jsonError("Supabase service role is not configured.", 503);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError("Request body must be JSON.", 400);
  }

  let payloadWithImage = payload;

  try {
    payloadWithImage = await attachUploadedImage(payload, supabase);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Image upload failed.", 400);
  }

  const normalized = normalizePromptDraftInput(payloadWithImage);

  if ("error" in normalized) {
    return jsonError(normalized.error, 400);
  }

  const draftInput = normalized.data;

  const { data: draft, error } = await supabase
    .from("prompt_drafts")
    .insert(draftInput)
    .select("*")
    .single();

  if (error || !draft) {
    return jsonError(error?.message || "Draft could not be created.", 500);
  }

  const autoPublishEnabled = process.env.PROMPT_LAB_AGENT_AUTOPUBLISH === "true";
  const autoPublishMinScore = getAutoPublishMinScore();
  const hasPublishableImage = Boolean(draftInput.image_url || draftInput.image_urls.length > 0);
  const meetsQualityBar = (draftInput.quality_score ?? 0) >= autoPublishMinScore;
  const shouldAutoPublish =
    normalized.autoPublish &&
    autoPublishEnabled &&
    hasPublishableImage &&
    meetsQualityBar;

  if (!shouldAutoPublish) {
    const autoPublishSkipReason = !normalized.autoPublish
      ? "not_requested"
      : !autoPublishEnabled
        ? "disabled"
        : !hasPublishableImage
          ? "missing_image"
          : !meetsQualityBar
            ? "quality_score_below_minimum"
            : "unknown";

    return NextResponse.json({
      ok: true,
      draft,
      published: false,
      autoPublishSkipped: normalized.autoPublish,
      autoPublishSkipReason,
      autoPublishMinScore,
    });
  }

  const authorId = process.env.PROMPT_LAB_AGENT_AUTHOR_ID;

  if (!authorId) {
    return NextResponse.json({
      ok: true,
      draft,
      published: false,
      warning: "PROMPT_LAB_AGENT_AUTHOR_ID is not configured.",
    });
  }

  try {
    await ensureHermesAgentAuthor(supabase, authorId);
    const postId = await publishPromptDraft(supabase, draft as PromptDraftRow, authorId);
    return NextResponse.json({
      ok: true,
      draft: { ...draft, status: "published", published_image_post_id: postId },
      published: true,
      postId,
      postPath: `/images/${postId}`,
    });
  } catch (error) {
    await supabase
      .from("prompt_drafts")
      .update({
        status: "failed",
        risk_notes: error instanceof Error ? error.message : "Auto publish failed.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", (draft as PromptDraftRow).id);

    return jsonError(error instanceof Error ? error.message : "Auto publish failed.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return jsonError("Unauthorized.", 401);
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return jsonError("Supabase service role is not configured.", 503);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError("Request body must be JSON.", 400);
  }

  if (!isRecord(payload)) {
    return jsonError("Request body must be an object.", 400);
  }

  const rawUpdates = Array.isArray(payload.updates) ? payload.updates : [payload];
  const updates = rawUpdates.slice(0, 50);
  const authorId = process.env.PROMPT_LAB_AGENT_AUTHOR_ID;
  const now = new Date().toISOString();
  const results = [];

  for (const item of updates) {
    if (!isRecord(item)) {
      results.push({ ok: false, error: "Update item must be an object." });
      continue;
    }

    const postId = pickString(item, [
      "postId",
      "post_id",
      "publishedImagePostId",
      "published_image_post_id",
    ]);
    const draftId = pickString(item, ["draftId", "draft_id", "id"]);
    const description = clip(
      pickStringValue(item, [
        "promptNote",
        "prompt_note",
        "usageNote",
        "usage_note",
        "description",
        "summary",
      ]),
      240,
    );

    if (!postId) {
      results.push({ ok: false, draftId, error: "Post id is required." });
      continue;
    }

    const imagePostUpdate = supabase
      .from("image_posts")
      .update({ description, updated_at: now })
      .eq("id", postId);
    const scopedImagePostUpdate = authorId ? imagePostUpdate.eq("author_id", authorId) : imagePostUpdate;
    const { data: imagePost, error: imagePostError } = await scopedImagePostUpdate
      .select("id, title, description")
      .maybeSingle();

    if (imagePostError) {
      results.push({ ok: false, postId, draftId, error: imagePostError.message });
      continue;
    }

    if (!imagePost) {
      results.push({ ok: false, postId, draftId, error: "Published post was not found." });
      continue;
    }

    if (draftId) {
      const { error: draftError } = await supabase
        .from("prompt_drafts")
        .update({ description, updated_at: now })
        .eq("id", draftId)
        .eq("published_image_post_id", postId);

      if (draftError) {
        results.push({ ok: false, postId, draftId, error: draftError.message });
        continue;
      }
    }

    results.push({
      ok: true,
      postId,
      draftId,
      title: imagePost.title,
      description: imagePost.description,
    });
  }

  const updatedCount = results.filter((result) => result.ok).length;
  const failedCount = results.length - updatedCount;

  return NextResponse.json(
    {
      ok: failedCount === 0,
      updatedCount,
      failedCount,
      results,
    },
    { status: failedCount === 0 ? 200 : 207 },
  );
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return jsonError("Unauthorized.", 401);
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return jsonError("Supabase service role is not configured.", 503);
  }

  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return jsonError("Draft id is required.", 400);
  }

  const { data, error } = await supabase
    .from("prompt_drafts")
    .delete()
    .eq("id", id)
    .in("status", ["pending", "rejected", "failed"])
    .select("id")
    .maybeSingle();

  if (error) {
    return jsonError(error.message, 500);
  }

  if (!data) {
    return jsonError("Draft was not found or cannot be deleted.", 404);
  }

  return NextResponse.json({ ok: true, deletedId: data.id });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
