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

  const shouldAutoPublish =
    normalized.autoPublish &&
    process.env.PROMPT_LAB_AGENT_AUTOPUBLISH === "true" &&
    (draftInput.quality_score ?? 0) >= 8;

  if (!shouldAutoPublish) {
    return NextResponse.json({
      ok: true,
      draft,
      published: false,
      autoPublishSkipped: normalized.autoPublish,
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
