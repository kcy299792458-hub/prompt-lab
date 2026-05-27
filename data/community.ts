import type { Prompt } from "@/data/prompts";

export function getPromptVersions(prompt: Prompt) {
  return (
    prompt.promptVersions ?? [
      {
        label: "프롬프트 원문",
        language: prompt.language,
        body: prompt.body,
      },
    ]
  );
}
