#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const usage = `
Usage:
  node scripts/submit-prompt-draft.mjs --file draft.json
  type draft.json | node scripts/submit-prompt-draft.mjs

Required env:
  PROMPT_LAB_AGENT_ENDPOINT
  PROMPT_LAB_AGENT_TOKEN
`.trim();

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
}

async function readStdin() {
  if (process.stdin.isTTY) return "";

  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const endpoint = process.env.PROMPT_LAB_AGENT_ENDPOINT;
  const token = process.env.PROMPT_LAB_AGENT_TOKEN;

  if (!endpoint || !token) {
    console.error("Missing PROMPT_LAB_AGENT_ENDPOINT or PROMPT_LAB_AGENT_TOKEN.");
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
    payload = JSON.parse(raw);
  } catch (error) {
    console.error(`Invalid JSON: ${error.message}`);
    process.exit(2);
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
