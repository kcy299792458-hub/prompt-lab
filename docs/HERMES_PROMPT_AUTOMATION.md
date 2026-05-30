# Hermes Prompt Automation

Prompt Lab uses Hermes as a research and draft-generation worker.

The safe default flow is:

1. Hermes researches public AI image prompt trends.
2. Hermes extracts patterns and source URLs.
3. Hermes writes original prompts instead of copying source prompts.
4. Hermes submits drafts to Prompt Lab.
5. An admin reviews and publishes drafts from `/admin`.

Auto-publishing is supported by the API, but keep it disabled until draft quality is stable.

## Required Environment Variables

Set these in Vercel Project Settings.

```text
SUPABASE_SERVICE_ROLE_KEY=...
PROMPT_LAB_AGENT_TOKEN=...
PROMPT_LAB_AGENT_AUTOPUBLISH=false
PROMPT_LAB_AGENT_AUTHOR_ID=
```

Use a long random value for `PROMPT_LAB_AGENT_TOKEN`.

Set `PROMPT_LAB_AGENT_AUTOPUBLISH=true` only after manual review works reliably.
Set `PROMPT_LAB_AGENT_AUTHOR_ID` to the profile/user UUID that should own automated posts.

## Draft API

Endpoint:

```text
POST https://prompt-lab-drab-xi.vercel.app/api/agent/prompt-drafts
Authorization: Bearer <PROMPT_LAB_AGENT_TOKEN>
Content-Type: application/json
```

Example payload:

```json
{
  "title": "GPT Image 액션 피규어 패키지 프롬프트",
  "description": "투명 블리스터 팩과 소품 칸이 있는 피규어 패키지 이미지 프롬프트.",
  "promptBody": "Create a vertical 4:5 premium product photograph...",
  "category": "제품/광고",
  "model": "GPT Image",
  "aspectRatio": "4:5",
  "style": "Action Figure Package",
  "tags": ["GPT Image", "액션피규어", "피규어패키지", "인스타트렌드"],
  "imageUrl": "https://...",
  "sourceUrls": ["https://..."],
  "sourceNotes": "Trend pattern only. Prompt rewritten from scratch.",
  "qualityScore": 8.4,
  "riskNotes": "No brand names, no celebrity likeness, no copied prompt.",
  "agentName": "hermes",
  "autoPublish": false
}
```

## Hermes Research Prompt

Use this for the first scheduled draft job:

```text
Every day at 9am, research recent AI image prompt trends from public web sources.

Goal: create Prompt Lab draft posts, not public posts.

Rules:
- Do not copy any prompt verbatim.
- Do not reuse copyrighted characters, celebrities, brand names, or logos.
- Use source URLs only as reference evidence.
- Rewrite every prompt from scratch as an original long-form prompt.
- Prefer Korean users' search intent.
- Prefer prompts that can produce useful, inspectable images.
- Avoid NSFW, gore, hate, scams, medical/legal/financial claims, and private-person targeting.

Find 10 candidate ideas and rank them by:
- search demand
- visual appeal
- originality
- safety
- usefulness for Korean users

Select the top 3 ideas.

For each selected idea, create:
- Korean SEO title, 2-80 characters
- Korean description, under 1000 characters
- English prompt body, detailed and copy-ready
- category
- model
- aspect ratio
- style
- 4-6 tags
- source URLs
- source notes
- quality score from 0 to 10
- risk notes
- image URL if an original generated sample is available

Submit each item to:
POST https://prompt-lab-drab-xi.vercel.app/api/agent/prompt-drafts

Use Authorization: Bearer ${PROMPT_LAB_AGENT_TOKEN}

Set autoPublish to false.

Implementation detail:
- Write one draft at a time as valid JSON to `.hermes-draft.json`.
- Submit it with `node scripts/submit-prompt-draft.mjs --file .hermes-draft.json`.
- If Hermes creates a local sample image, set `"imageFile": "C:/absolute/path/to/image.png"` in the JSON.
  The submit script will send it to Prompt Lab and the API will upload it to Supabase Storage.
- If the API returns an error, fix the JSON and retry once.
```

## Later Auto-Publish Prompt

Use only after manual review quality is stable:

```text
Every day at 10am and 4pm, create one high-quality Prompt Lab post draft from current AI image prompt trends.

Only set autoPublish to true when:
- qualityScore is 8.0 or higher
- an original generated sample image URL is available
- source material was used only for trend research
- no prompt was copied verbatim
- no brand, celebrity, copyrighted character, or unsafe content is included

Otherwise submit it as a pending draft with autoPublish false.
```
