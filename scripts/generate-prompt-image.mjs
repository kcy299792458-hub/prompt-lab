#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const usage = `
Usage:
  node scripts/generate-prompt-image.mjs --file .hermes-draft.json

Required env:
  OPENAI_API_KEY

Optional env:
  OPENAI_IMAGE_MODEL=gpt-image-1
  OPENAI_IMAGE_QUALITY=medium
  PROMPT_LAB_AGENT_AUTOPUBLISH_MIN_SCORE=8.5
`.trim();

const LOCAL_ENV_FILES = [".env.local", ".env.production.local", ".env.vercel.local", ".env.hermes.local"];
const DEFAULT_MODEL = "gpt-image-1";
const DEFAULT_QUALITY = "medium";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
}

async function loadLocalEnvFiles() {
  for (const fileName of LOCAL_ENV_FILES) {
    let raw = "";

    try {
      raw = await readFile(resolve(fileName), "utf8");
    } catch {
      continue;
    }

    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
      if (!match) continue;

      const [, key, rawValue] = match;
      if (process.env[key]) continue;

      const value = rawValue.trim().replace(/^['"]|['"]$/g, "");
      if (value) process.env[key] = value;
    }
  }
}

function slugify(input) {
  return String(input || "prompt-lab-image")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48) || "prompt-lab-image";
}

function sizeForAspectRatio(aspectRatio) {
  const ratio = String(aspectRatio || "").toLowerCase().replace(/\s/g, "");

  if (["16:9", "3:2", "16:10", "2:1"].includes(ratio)) return "1536x1024";
  if (["4:5", "9:16", "2:3", "3:4"].includes(ratio)) return "1024x1536";
  return "1024x1024";
}

function getQualityScore(payload) {
  const score = Number(payload.qualityScore ?? payload.quality_score ?? 0);
  return Number.isFinite(score) ? score : 0;
}

function buildImagePrompt(payload) {
  const title = payload.title || "";
  const description = payload.description || "";
  const promptBody = payload.promptBody || payload.prompt_body || payload.body || payload.prompt || "";
  const aspectRatio = payload.aspectRatio || payload.aspect_ratio || "1:1";

  return [
    "Generate a single polished result image for a public Prompt Lab gallery post.",
    "The image must be an original AI-generated sample for the prompt below, not a screenshot, not an Instagram UI mockup, and not copied from any referenced source.",
    "Avoid readable logos, real brand names, copyrighted characters, celebrity likenesses, private people, watermarks, QR codes, unsafe content, and random text artifacts.",
    "If text-like marks are useful, make them abstract and unreadable unless the prompt explicitly asks for one simple generic label.",
    `Korean post title: ${title}`,
    `Korean post description: ${description}`,
    `Target aspect ratio: ${aspectRatio}`,
    "",
    "Prompt to render:",
    promptBody,
  ].join("\n");
}

async function generateImage({ apiKey, model, quality, prompt, size }) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      size,
      quality,
      n: 1,
    }),
  });

  const text = await response.text();
  let body;

  try {
    body = JSON.parse(text);
  } catch {
    body = { error: { message: text } };
  }

  if (!response.ok) {
    throw new Error(body?.error?.message || `OpenAI image request failed: ${response.status}`);
  }

  const item = body?.data?.[0];
  const b64 = item?.b64_json;

  if (b64) return Buffer.from(b64, "base64");

  if (item?.url) {
    const imageResponse = await fetch(item.url);
    if (!imageResponse.ok) {
      throw new Error(`Generated image URL download failed: ${imageResponse.status}`);
    }
    return Buffer.from(await imageResponse.arrayBuffer());
  }

  throw new Error("OpenAI image response did not include b64_json or url.");
}

async function main() {
  await loadLocalEnvFiles();

  const apiKey = process.env.OPENAI_API_KEY;
  const filePath = getArg("--file");

  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY.");
    console.error(usage);
    process.exit(2);
  }

  if (!filePath) {
    console.error("Missing --file.");
    console.error(usage);
    process.exit(2);
  }

  const absoluteFilePath = resolve(filePath);
  const payload = JSON.parse((await readFile(absoluteFilePath, "utf8")).replace(/^\uFEFF/, ""));
  const promptBody = payload.promptBody || payload.prompt_body || payload.body || payload.prompt || "";

  if (!promptBody) {
    throw new Error("Draft JSON must include promptBody, prompt_body, body, or prompt.");
  }

  const minScore = Number(process.env.PROMPT_LAB_AGENT_AUTOPUBLISH_MIN_SCORE || 8.5);
  const qualityScore = getQualityScore(payload);
  const model = process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL;
  const quality = process.env.OPENAI_IMAGE_QUALITY || DEFAULT_QUALITY;
  const size = sizeForAspectRatio(payload.aspectRatio || payload.aspect_ratio);
  const prompt = buildImagePrompt(payload);
  const imageBuffer = await generateImage({ apiKey, model, quality, prompt, size });
  const today = new Date().toISOString().slice(0, 10);
  const outputPath = resolve(".hermes", "images", today, `${slugify(payload.title)}-${randomUUID()}.png`);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, imageBuffer);

  payload.imageFile = outputPath.replace(/\\/g, "/");
  payload.autoPublish = qualityScore >= minScore;
  payload.riskNotes = [
    payload.riskNotes || payload.risk_notes || "",
    `Original sample image generated with ${model}, ${quality} quality, ${size}.`,
  ]
    .filter(Boolean)
    .join("\n");

  await writeFile(absoluteFilePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({
    ok: true,
    imageFile: payload.imageFile,
    autoPublish: payload.autoPublish,
    qualityScore,
    minScore,
    model,
    quality,
    size,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
