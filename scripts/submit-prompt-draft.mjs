#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const usage = `
Usage:
  node scripts/submit-prompt-draft.mjs --file draft.json
  type draft.json | node scripts/submit-prompt-draft.mjs

Required env:
  PROMPT_LAB_AGENT_TOKEN

Optional env:
  PROMPT_LAB_AGENT_ENDPOINT
`.trim();

const DEFAULT_ENDPOINT = "https://prompt-lab-drab-xi.vercel.app/api/agent/prompt-drafts";
const LOCAL_ENV_FILES = [".env.local", ".env.production.local", ".env.vercel.local"];

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
}

function mimeTypeForPath(filePath) {
  switch (extname(filePath).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "";
  }
}

async function readStdin() {
  if (process.stdin.isTTY) return "";

  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
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

async function main() {
  await loadLocalEnvFiles();

  const endpoint = process.env.PROMPT_LAB_AGENT_ENDPOINT || DEFAULT_ENDPOINT;
  const token = process.env.PROMPT_LAB_AGENT_TOKEN;

  if (!token) {
    console.error("Missing PROMPT_LAB_AGENT_TOKEN.");
    console.error(usage);
    process.exit(2);
  }

  const filePath = getArg("--file");
  const raw = filePath ? await readFile(filePath, "utf8") : await readStdin();

  if (!raw.trim()) {
    console.error("No JSON payload provided.");
    console.error(usage);
    process.exit(2);
  }

  let payload;
  try {
    payload = JSON.parse(raw.replace(/^\uFEFF/, ""));
  } catch (error) {
    console.error(`Invalid JSON: ${error.message}`);
    process.exit(2);
  }

  if (payload && typeof payload === "object" && typeof payload.imageFile === "string") {
    const imagePath = resolve(payload.imageFile);
    const mimeType = mimeTypeForPath(imagePath);

    if (!mimeType) {
      console.error("imageFile must be a .jpg, .jpeg, .png, .webp, or .gif file.");
      process.exit(2);
    }

    payload.imageBase64 = (await readFile(imagePath)).toString("base64");
    payload.imageMimeType = mimeType;
    delete payload.imageFile;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let body = text;
  try {
    body = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    // Keep non-JSON responses as-is.
  }

  if (!response.ok) {
    console.error(`Prompt Lab API request failed: ${response.status}`);
    console.error(body);
    process.exit(1);
  }

  console.log(body);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
