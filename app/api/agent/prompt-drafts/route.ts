import { NextRequest, NextResponse } from "next/server";
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

  const normalized = normalizePromptDraftInput(payload);

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
