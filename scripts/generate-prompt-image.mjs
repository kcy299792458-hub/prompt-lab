#!/usr/bin/env node

import { spawn } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const usage = `
Usage:
  node scripts/generate-prompt-image.mjs --file .hermes-draft.json

Optional env:
  PROMPT_LAB_IMAGE_PROVIDER=openai-codex
  HERMES_HOME=C:/Users/PC/AppData/Local/hermes
  OPENAI_API_KEY
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

function hermesAspectRatio(aspectRatio) {
  const ratio = String(aspectRatio || "").toLowerCase().replace(/\s/g, "");

  if (["16:9", "3:2", "16:10", "2:1"].includes(ratio)) return "landscape";
  if (["4:5", "9:16", "2:3", "3:4"].includes(ratio)) return "portrait";
  return "square";
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

function cleanRiskNotes(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/원본 샘플 이미지를 생성할 수 없어|자동 발행은 요청하지 않습니다|image generation unavailable|Missing OPENAI_API_KEY/i.test(line))
    .join("\n");
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

function getHermesHome() {
  if (process.env.HERMES_HOME) return process.env.HERMES_HOME;
  if (process.env.LOCALAPPDATA) return resolve(process.env.LOCALAPPDATA, "hermes");
  return "";
}

async function hermesConfigUsesOpenAICodex() {
  const hermesHome = getHermesHome();
  if (!hermesHome) return false;

  try {
    const config = await readFile(resolve(hermesHome, "config.yaml"), "utf8");
    let insideImageGen = false;

    for (const line of config.split(/\r?\n/)) {
      if (/^image_gen:\s*$/.test(line)) {
        insideImageGen = true;
        continue;
      }

      if (insideImageGen && /^[A-Za-z_][A-Za-z0-9_-]*:/.test(line)) {
        break;
      }

      if (insideImageGen && /^\s+provider:\s*openai-codex\b/.test(line)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function runPython({ cwd, env, input }) {
  return new Promise((resolvePromise, reject) => {
    const python = process.env.HERMES_PYTHON || "python";
    const script = String.raw`
import importlib
import json
import sys

request = json.loads(sys.stdin.buffer.read().decode("utf-8"))
plugin = importlib.import_module("plugins.image_gen.openai-codex")
provider = plugin.OpenAICodexImageGenProvider()
result = provider.generate(
    request["prompt"],
    aspect_ratio=request.get("aspectRatio") or "square",
)
print(json.dumps(result, ensure_ascii=True))
`;

    const child = spawn(python, ["-c", script], {
      cwd,
      env,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    const stdout = [];
    const stderr = [];

    child.stdout.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
    child.on("error", reject);
    child.on("close", (code) => {
      const out = Buffer.concat(stdout).toString("utf8").trim();
      const err = Buffer.concat(stderr).toString("utf8").trim();

      if (code !== 0) {
        reject(new Error(err || out || `Python exited with code ${code}.`));
        return;
      }

      try {
        resolvePromise(JSON.parse(out));
      } catch {
        reject(new Error(`Hermes image provider returned invalid JSON: ${out || err}`));
      }
    });

    child.stdin.end(JSON.stringify(input));
  });
}

async function generateImageWithHermesCodex({ prompt, aspectRatio }) {
  const hermesHome = getHermesHome();

  if (!hermesHome) {
    throw new Error("HERMES_HOME is not configured and LOCALAPPDATA is unavailable.");
  }

  const hermesAgentDir = resolve(hermesHome, "hermes-agent");
  const result = await runPython({
    cwd: hermesAgentDir,
    env: {
      ...process.env,
      HERMES_HOME: hermesHome,
    },
    input: {
      prompt,
      aspectRatio: hermesAspectRatio(aspectRatio),
    },
  });

  if (!result?.success || !result.image) {
    throw new Error(result?.error || "Hermes Codex image generation failed.");
  }

  await access(result.image);

  return {
    imageFile: result.image,
    model: result.model || "gpt-image-2",
    provider: result.provider || "openai-codex",
    quality: result.quality || "medium",
    size: result.size || hermesAspectRatio(aspectRatio),
  };
}

async function main() {
  await loadLocalEnvFiles();

  const apiKey = process.env.OPENAI_API_KEY;
  const filePath = getArg("--file");

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
  const providerPreference = String(
    process.env.PROMPT_LAB_IMAGE_PROVIDER ||
      process.env.HERMES_IMAGE_PROVIDER ||
      process.env.OPENAI_IMAGE_PROVIDER ||
      "",
  ).toLowerCase();
  const useHermesCodex =
    providerPreference === "openai-codex" ||
    providerPreference === "hermes-openai-codex" ||
    (await hermesConfigUsesOpenAICodex());

  let generated;

  if (useHermesCodex) {
    generated = await generateImageWithHermesCodex({
      prompt,
      aspectRatio: payload.aspectRatio || payload.aspect_ratio,
    });
  } else {
    if (!apiKey) {
      console.error("Missing OPENAI_API_KEY, and Hermes openai-codex image provider is not configured.");
      console.error(usage);
      process.exit(2);
    }

    const imageBuffer = await generateImage({ apiKey, model, quality, prompt, size });
    const today = new Date().toISOString().slice(0, 10);
    const outputPath = resolve(".hermes", "images", today, `${slugify(payload.title)}-${randomUUID()}.png`);

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, imageBuffer);

    generated = {
      imageFile: outputPath,
      model,
      provider: "openai-api",
      quality,
      size,
    };
  }

  payload.imageFile = generated.imageFile.replace(/\\/g, "/");
  payload.autoPublish = qualityScore >= minScore;
  payload.riskNotes = [
    cleanRiskNotes(payload.riskNotes || payload.risk_notes),
    `Original sample image generated with ${generated.provider}, ${generated.model}, ${generated.quality} quality, ${generated.size}.`,
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
    provider: generated.provider,
    model: generated.model,
    quality: generated.quality,
    size: generated.size,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
