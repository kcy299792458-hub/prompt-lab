import { prompts, type Prompt } from "@/data/prompts";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://prompt-lab-drab-xi.vercel.app"
).replace(/\/$/, "");
export const MIN_INDEXABLE_TAG_PROMPTS = 3;

export type CategoryLandingPage = {
  category: string;
  slug: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  keywords: string[];
};

export type ModelLandingPage = {
  slug: string;
  label: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  keywords: string[];
  matches: (model: string) => boolean;
};

export const categoryLandingPages: CategoryLandingPage[] = [
  {
    category: "사진/시네마틱",
    slug: "photo-cinematic",
    title: "사진/시네마틱 AI 이미지 프롬프트 모음",
    h1: "사진/시네마틱 AI 이미지 프롬프트",
    description:
      "실사 사진, 필름룩, 폰카 감성, 시네마틱 장면을 만드는 AI 이미지 프롬프트 예시와 결과 이미지를 모았습니다.",
    intro:
      "사진/시네마틱 프롬프트는 카메라 질감, 조명, 렌즈, 노출, 시대감 같은 단서가 결과를 크게 좌우합니다. GPT Image, Midjourney, Stable Diffusion에서 참고할 수 있는 실제 프롬프트와 결과 이미지를 함께 확인해보세요.",
    keywords: ["AI 사진 프롬프트", "시네마틱 프롬프트", "폰카 AI 프롬프트"],
  },
  {
    category: "인물/패션",
    slug: "portrait-fashion",
    title: "인물/패션 AI 이미지 프롬프트 모음",
    h1: "인물/패션 AI 이미지 프롬프트",
    description:
      "인물 화보, 패션 룩북, 스타일링, 포트레이트 이미지 제작에 쓸 수 있는 AI 이미지 프롬프트 예시입니다.",
    intro:
      "인물/패션 프롬프트는 포즈, 의상 소재, 촬영 환경, 조명 방향을 구체적으로 잡을수록 결과가 안정됩니다. 실사 화보와 룩북 느낌을 만들 때 참고하기 좋은 프롬프트를 모았습니다.",
    keywords: ["AI 인물 프롬프트", "패션 프롬프트", "화보 프롬프트"],
  },
  {
    category: "제품/광고",
    slug: "product-ad",
    title: "제품/광고 AI 이미지 프롬프트 모음",
    h1: "제품/광고 AI 이미지 프롬프트",
    description:
      "제품 사진, 광고 비주얼, 상세페이지 이미지, 브랜드 무드컷을 만드는 AI 이미지 프롬프트 예시를 모았습니다.",
    intro:
      "제품/광고 프롬프트는 배경 재질, 조명, 카메라 앵글, 브랜드 톤을 명확히 쓰는 것이 중요합니다. 향수, 화장품, 스피커 같은 제품 이미지를 만들 때 바로 응용할 수 있는 예시를 확인하세요.",
    keywords: ["제품사진 프롬프트", "광고 이미지 프롬프트", "상세페이지 AI 이미지"],
  },
  {
    category: "캐릭터/웹툰",
    slug: "character-webtoon",
    title: "캐릭터/웹툰 AI 이미지 프롬프트 모음",
    h1: "캐릭터/웹툰 AI 이미지 프롬프트",
    description:
      "웹툰 커버, 캐릭터 키비주얼, 게임 아이콘, 콘셉트 아트에 사용할 수 있는 AI 이미지 프롬프트 예시입니다.",
    intro:
      "캐릭터/웹툰 프롬프트는 캐릭터의 역할, 의상, 실루엣, 장면 목적을 한 번에 잡아주는 것이 좋습니다. 특정 작품을 베끼지 않고 오리지널 캐릭터 이미지를 만드는 예시를 모았습니다.",
    keywords: ["웹툰 프롬프트", "캐릭터 AI 프롬프트", "게임 아이콘 프롬프트"],
  },
  {
    category: "3D/공간",
    slug: "3d-space",
    title: "3D/공간 AI 이미지 프롬프트 모음",
    h1: "3D/공간 AI 이미지 프롬프트",
    description:
      "아이소메트릭, 미니어처, 3D 렌더, 공간 콘셉트 이미지를 만드는 AI 이미지 프롬프트 예시입니다.",
    intro:
      "3D/공간 프롬프트는 공간 구조, 재질, 조명, 렌더 스타일을 같이 지정해야 원하는 분위기가 잘 나옵니다. 카페, 도시, 방, 건축 렌더 계열의 프롬프트를 확인하세요.",
    keywords: ["3D 이미지 프롬프트", "공간 프롬프트", "아이소메트릭 프롬프트"],
  },
  {
    category: "편집/콜라주",
    slug: "edit-collage",
    title: "편집/콜라주 AI 이미지 프롬프트 모음",
    h1: "편집/콜라주 AI 이미지 프롬프트",
    description:
      "Y2K 콜라주, 매거진 레이아웃, UI 편집, 콘셉트 시트 이미지를 만드는 AI 이미지 프롬프트 예시입니다.",
    intro:
      "편집/콜라주 프롬프트는 레이아웃, 종이 질감, 스티커, 프레임, 장식 요소를 구체적으로 쓰면 완성도가 올라갑니다. 소셜 콘텐츠나 콘셉트 시트에 맞는 예시를 모았습니다.",
    keywords: ["콜라주 프롬프트", "Y2K AI 이미지", "매거진 레이아웃 프롬프트"],
  },
  {
    category: "기괴/호러",
    slug: "analog-horror",
    title: "기괴/호러 AI 이미지 프롬프트 모음",
    h1: "기괴/호러 AI 이미지 프롬프트",
    description:
      "아날로그 호러, 리미널 스페이스, VHS, 2000년대 폰카 공포 이미지를 만드는 AI 프롬프트 예시입니다.",
    intro:
      "기괴/호러 프롬프트는 괴물을 직접 보여주기보다 사진의 결함, 장소의 어색함, 시선 처리, 오래된 카메라 질감을 설계할 때 더 강하게 작동합니다. 낮 공포, VHS, 리미널 스페이스 예시를 모았습니다.",
    keywords: ["아날로그 호러 프롬프트", "리미널 스페이스 프롬프트", "호러 AI 이미지"],
  },
  {
    category: "배경/세계관",
    slug: "worldbuilding-background",
    title: "배경/세계관 AI 이미지 프롬프트 모음",
    h1: "배경/세계관 AI 이미지 프롬프트",
    description:
      "판타지, SF, 솔라펑크, 세계관 배경 콘셉트 이미지를 만드는 AI 이미지 프롬프트 예시입니다.",
    intro:
      "배경/세계관 프롬프트는 장면의 규모, 시대감, 환경 규칙, 시점과 구도를 같이 잡아야 이미지가 풍부해집니다. 게임, 웹툰, 영상 콘셉트에 참고할 수 있는 배경 프롬프트를 모았습니다.",
    keywords: ["세계관 프롬프트", "배경 AI 이미지", "판타지 컨셉아트 프롬프트"],
  },
];

export const modelLandingPages: ModelLandingPage[] = [
  {
    slug: "gpt-image",
    label: "GPT Image",
    title: "GPT Image AI 이미지 프롬프트 예시",
    h1: "GPT Image 프롬프트 예시",
    description:
      "GPT Image에서 참고하기 좋은 AI 이미지 프롬프트와 결과 예시를 카테고리별로 모았습니다.",
    intro:
      "GPT Image는 자연어 설명을 길게 써도 잘 따라가는 편이라 장면, 피사체, 질감, 금지 요소를 문장으로 정리하는 방식이 잘 맞습니다. 실제 결과 이미지와 함께 프롬프트 구조를 확인하세요.",
    keywords: ["GPT Image 프롬프트", "GPT Image 예시", "AI 이미지 프롬프트"],
    matches: (model) => model.toLowerCase().includes("gpt image") || model.toLowerCase().includes("gptimage"),
  },
  {
    slug: "midjourney",
    label: "Midjourney",
    title: "Midjourney AI 이미지 프롬프트 예시",
    h1: "Midjourney 프롬프트 예시",
    description:
      "Midjourney에서 사용할 수 있는 사진, 시네마틱, 캐릭터, 3D 스타일 AI 이미지 프롬프트 예시입니다.",
    intro:
      "Midjourney 프롬프트는 핵심 장면을 간결하게 잡고, 비율과 스타일 옵션을 함께 조정하는 방식이 효율적입니다. 카테고리별 예시와 결과 이미지를 비교해보세요.",
    keywords: ["Midjourney 프롬프트", "미드저니 프롬프트", "Midjourney 이미지 예시"],
    matches: (model) => model.toLowerCase().includes("midjourney"),
  },
  {
    slug: "stable-diffusion",
    label: "Stable Diffusion",
    title: "Stable Diffusion AI 이미지 프롬프트 예시",
    h1: "Stable Diffusion 프롬프트 예시",
    description:
      "Stable Diffusion, SDXL, ControlNet에서 참고할 수 있는 프롬프트와 네거티브 프롬프트 예시입니다.",
    intro:
      "Stable Diffusion 계열은 키워드 가중치, 네거티브 프롬프트, 샘플러와 시드 같은 설정이 결과에 크게 관여합니다. 실제 프롬프트와 설정 노트를 함께 확인하세요.",
    keywords: ["Stable Diffusion 프롬프트", "SDXL 프롬프트", "네거티브 프롬프트"],
    matches: (model) => {
      const normalized = model.toLowerCase();
      return normalized.includes("stable diffusion") || normalized.includes("sdxl") || /\bsd\b/.test(normalized);
    },
  },
];

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getCategoryConfig(category: string) {
  return categoryLandingPages.find((item) => item.category === category);
}

export function getCategoryConfigBySlug(slug: string) {
  return categoryLandingPages.find((item) => item.slug === slug);
}

export function getCategoryPath(category: string) {
  const config = getCategoryConfig(category);
  return config ? `/categories/${config.slug}` : "/";
}

export function getModelConfigBySlug(slug: string) {
  return modelLandingPages.find((item) => item.slug === slug);
}

export function getModelConfigForPrompt(prompt: Prompt) {
  return modelLandingPages.find((item) => item.matches(prompt.model));
}

export function getModelPath(model: string) {
  const config = modelLandingPages.find((item) => item.matches(model));
  return config ? `/models/${config.slug}` : "/";
}

export function getAllTags() {
  return [...new Set(prompts.flatMap((prompt) => prompt.tags))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "ko"));
}

export function getTagPath(tag: string) {
  return `/tags/${encodeURIComponent(tag)}`;
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getPromptSlug(prompt: Prompt) {
  const titleSlug = slugify(prompt.title);
  return titleSlug ? `${prompt.id}-${titleSlug}` : String(prompt.id);
}

export function getPromptPath(prompt: Prompt) {
  return `/prompts/${getPromptSlug(prompt)}`;
}

export function findPromptByParam(value: string) {
  const numericId = Number(value.split("-")[0]);

  if (Number.isFinite(numericId)) {
    const promptById = prompts.find((prompt) => prompt.id === numericId);
    if (promptById) return promptById;
  }

  return prompts.find((prompt) => getPromptSlug(prompt) === value);
}

export function getPromptsByTag(tag: string) {
  return prompts.filter((prompt) => prompt.tags.some((item) => item.toLowerCase() === tag.toLowerCase()));
}

export function getTagPromptCount(tag: string) {
  return getPromptsByTag(tag).length;
}

export function isIndexableTag(tag: string) {
  return getTagPromptCount(tag) >= MIN_INDEXABLE_TAG_PROMPTS;
}

export function getIndexableTags() {
  return getAllTags().filter(isIndexableTag);
}

export function getPromptSeoTitle(prompt: Prompt) {
  const modelConfig = getModelConfigForPrompt(prompt);
  const modelLabel = modelConfig?.label || prompt.model;
  return `${prompt.title} AI 이미지 프롬프트 - ${modelLabel} 예시`;
}

export function getPromptSeoDescription(prompt: Prompt) {
  const text = `${prompt.description} ${prompt.category}, ${prompt.style}, ${prompt.model}에서 참고할 수 있는 실제 AI 이미지 프롬프트와 결과 예시입니다.`;
  return text.length > 155 ? `${text.slice(0, 152)}...` : text;
}

export function getPromptKeywords(prompt: Prompt) {
  return [
    `${prompt.title} 프롬프트`,
    `${prompt.category} 프롬프트`,
    `${prompt.model} 프롬프트`,
    `${prompt.style} 프롬프트`,
    ...prompt.tags.map((tag) => `${tag} 프롬프트`),
  ];
}

export function getPromptSeoTips(prompt: Prompt) {
  const modelConfig = getModelConfigForPrompt(prompt);
  const tags = prompt.tags.slice(0, 4).join(", ");
  const modelLabel = modelConfig?.label || prompt.model;

  return {
    core: `${prompt.title} 프롬프트는 ${prompt.category} 카테고리의 ${prompt.style} 스타일을 만들기 위한 예시입니다. 핵심 태그는 ${tags || "이미지 분위기"}이며, 결과 이미지처럼 보이도록 피사체, 장소, 질감, 분위기를 함께 지정하는 방식이 좋습니다.`,
    model: `${modelLabel}에서 사용할 때는 장면 설명을 먼저 고정하고, 카메라 질감이나 렌더 스타일 같은 표현을 뒤에 붙이면 결과를 비교하기 쉽습니다.`,
    variation: `비슷한 이미지를 만들고 싶다면 주 피사체, 배경 장소, 시간대, 카메라 질감 중 하나만 바꿔보세요. 한 번에 모든 요소를 바꾸면 어떤 키워드가 결과에 영향을 줬는지 확인하기 어렵습니다.`,
    failure: `결과가 너무 평범하게 나오면 ${prompt.style} 관련 키워드를 앞쪽으로 옮기고, 원하지 않는 분위기나 텍스트, 로고, 과한 보정은 네거티브 프롬프트나 금지 조건으로 분리하는 것이 좋습니다.`,
  };
}

export function getPromptJsonLd(prompt: Prompt) {
  const pageUrl = absoluteUrl(getPromptPath(prompt));
  const imageUrl = absoluteUrl(prompt.image);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: getPromptSeoTitle(prompt),
    description: getPromptSeoDescription(prompt),
    url: pageUrl,
    image: [imageUrl],
    mainEntityOfPage: pageUrl,
    inLanguage: prompt.language === "영어" ? "en" : "ko-KR",
    isAccessibleForFree: true,
    author: {
      "@type": "Person",
      name: prompt.authorName || "운영자",
    },
    publisher: {
      "@type": "Organization",
      name: "프롬프트랩",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
      },
    },
    keywords: getPromptKeywords(prompt).join(", "),
    about: [prompt.category, prompt.model, prompt.style, ...prompt.tags],
  };
}

export function getBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getCollectionJsonLd({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: Prompt[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((prompt, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(getPromptPath(prompt)),
        name: prompt.title,
      })),
    },
  };
}

export function getSiteJsonLd() {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "프롬프트랩",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo.png"),
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: "프롬프트랩",
        alternateName: "Prompt Lab",
        url: SITE_URL,
        description:
          "GPT Image, Midjourney, Stable Diffusion용 AI 이미지 프롬프트 예시와 결과 이미지를 함께 확인하는 프롬프트 갤러리.",
        inLanguage: "ko-KR",
        publisher: {
          "@id": organizationId,
        },
      },
    ],
  };
}
