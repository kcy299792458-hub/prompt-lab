import type { Prompt } from "@/data/prompts";

export const commentSamples = [
  "이 프롬프트는 조명 키워드가 진짜 잘 먹히네요.",
  "비율만 4:5로 바꾸니까 인스타용으로 딱 맞았습니다.",
  "네거티브에 watermark 추가하니까 훨씬 깔끔해졌어요.",
  "한글 설명이 같이 있으니까 따라 하기 편합니다.",
  "비슷한 스타일로 제품컷도 만들어보고 싶네요.",
];

export function getComments(prompt: Prompt) {
  const comments = [
    {
      author: "prompt_user",
      body: commentSamples[prompt.id % commentSamples.length],
      time: "방금 전",
    },
    {
      author: "image_maker",
      body: "원문이 영어라서 한국어 버전도 같이 올려주면 더 좋을 것 같아요.",
      time: "12분 전",
    },
    {
      author: "copycat",
      body: `${prompt.aspectRatio} 비율 그대로 넣으니까 구도가 안정적으로 나왔습니다.`,
      time: "28분 전",
    },
    {
      author: "negative_note",
      body: "네거티브에 watermark, unreadable text를 추가하면 결과물이 더 깔끔해져요.",
      time: "1시간 전",
    },
  ];

  return comments.slice(0, prompt.id % 6);
}

export function getCommentCount(prompt: Prompt) {
  return getComments(prompt).length;
}

export function getLatestComment(prompt: Prompt) {
  return getComments(prompt)[0]?.body ?? "아직 댓글이 없습니다. 첫 의견을 남겨보세요.";
}

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
