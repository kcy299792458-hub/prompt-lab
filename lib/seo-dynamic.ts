import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/seo";

export type SeoProfile = {
  id: string;
  nickname: string;
  created_at: string;
};

export type SeoImagePost = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  category: string;
  model: string;
  aspect_ratio: string;
  style: string;
  image_url: string;
  image_urls?: string[] | null;
  tags: string[] | null;
  created_at: string;
  updated_at?: string;
  profiles?: { nickname: string } | { nickname: string }[] | null;
};

export type SeoPromptVersion = {
  id: string;
  label: string;
  language: string;
  body: string;
};

export type SeoPromptRequest = {
  id: string;
  author_id: string | null;
  guest_nickname: string | null;
  title: string;
  body: string;
  target_model: string;
  request_type: string;
  reference_image_urls: string[] | null;
  status: "open" | "resolved";
  created_at: string;
  updated_at?: string;
  profiles?: { nickname: string } | { nickname: string }[] | null;
};

export type SeoPromptRequestAnswer = {
  id: string;
  author_id: string | null;
  guest_nickname: string | null;
  prompt_body: string;
  negative_prompt: string;
  model: string;
  settings: string;
  explanation: string;
  is_accepted: boolean;
  created_at: string;
  profiles?: { nickname: string } | { nickname: string }[] | null;
};

export function getProfileNickname(profile: SeoImagePost["profiles"]) {
  if (Array.isArray(profile)) return profile[0]?.nickname || "회원";
  return profile?.nickname || "회원";
}

export function getRequestAuthorName(item: {
  guest_nickname: string | null;
  profiles?: { nickname: string } | { nickname: string }[] | null;
}) {
  return item.guest_nickname || getProfileNickname(item.profiles);
}

export function getPostImages(post: Pick<SeoImagePost, "image_url" | "image_urls">) {
  return post.image_urls && post.image_urls.length > 0 ? post.image_urls : [post.image_url];
}

function truncateDescription(value: string, fallback: string) {
  const text = (value || fallback).replace(/\s+/g, " ").trim();
  return text.length > 155 ? `${text.slice(0, 152)}...` : text;
}

export function noindexMetadata(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export async function fetchSeoImagePost(id: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const postResult = await supabase
    .from("image_posts")
    .select(
      "id, author_id, title, description, category, model, aspect_ratio, style, image_url, image_urls, tags, created_at, updated_at, profiles(nickname)",
    )
    .eq("id", id)
    .eq("is_hidden", false)
    .maybeSingle();

  if (postResult.error || !postResult.data) return null;

  const versionResult = await supabase
    .from("prompt_versions")
    .select("id, label, language, body")
    .eq("image_post_id", id)
    .order("created_at", { ascending: true })
    .limit(5);

  return {
    post: postResult.data as SeoImagePost,
    versions: (versionResult.data ?? []) as SeoPromptVersion[],
  };
}

export async function fetchSeoCreator(id: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const [profileResult, postsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nickname, created_at")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("image_posts")
      .select("id, title, description, category, model, aspect_ratio, style, image_url, image_urls, tags, created_at, updated_at")
      .eq("author_id", id)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (profileResult.error || !profileResult.data) return null;

  return {
    profile: profileResult.data as SeoProfile,
    posts: (postsResult.data ?? []) as SeoImagePost[],
  };
}

export async function fetchSeoPromptRequest(id: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const [requestResult, answerResult] = await Promise.all([
    supabase
      .from("prompt_requests")
      .select(
        "id, author_id, guest_nickname, title, body, target_model, request_type, reference_image_urls, status, created_at, updated_at, profiles(nickname)",
      )
      .eq("id", id)
      .eq("is_hidden", false)
      .maybeSingle(),
    supabase
      .from("prompt_request_answers")
      .select(
        "id, author_id, guest_nickname, prompt_body, negative_prompt, model, settings, explanation, is_accepted, created_at, profiles(nickname)",
      )
      .eq("prompt_request_id", id)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true }),
  ]);

  if (requestResult.error || !requestResult.data) return null;

  return {
    request: requestResult.data as SeoPromptRequest,
    answers: (answerResult.data ?? []) as SeoPromptRequestAnswer[],
  };
}

export async function fetchSitemapImagePosts() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const result = await supabase
    .from("image_posts")
    .select("id, image_url, image_urls, updated_at, created_at")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(1000);

  return result.error ? [] : ((result.data ?? []) as SeoImagePost[]);
}

export async function fetchSitemapCreators() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const result = await supabase
    .from("image_posts")
    .select("author_id, updated_at, created_at")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (result.error) return [];

  const creatorMap = new Map<string, Date>();
  (result.data ?? []).forEach((post) => {
    const authorId = String(post.author_id || "");
    if (!authorId) return;

    const postDate = new Date(post.updated_at || post.created_at);
    const currentDate = creatorMap.get(authorId);

    if (!currentDate || postDate > currentDate) {
      creatorMap.set(authorId, postDate);
    }
  });

  return [...creatorMap.entries()].map(([id, lastModified]) => ({ id, lastModified }));
}

export async function fetchSitemapResolvedRequests() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const result = await supabase
    .from("prompt_requests")
    .select("id, updated_at, created_at, prompt_request_answers(id)")
    .eq("is_hidden", false)
    .eq("status", "resolved")
    .order("created_at", { ascending: false })
    .limit(500);

  if (result.error) return [];

  return (result.data ?? [])
    .filter((request) => {
      const answers = request.prompt_request_answers as unknown[] | null;
      return Array.isArray(answers) && answers.length > 0;
    })
    .map((request) => ({
      id: String(request.id),
      lastModified: new Date(request.updated_at || request.created_at),
    }));
}

export function getImagePostMetadata(post: SeoImagePost): Metadata {
  const authorName = getProfileNickname(post.profiles);
  const images = getPostImages(post).map(absoluteUrl);
  const title = `${post.title} AI 이미지 프롬프트 - ${post.model || "GPT Image"} 결과`;
  const description = truncateDescription(
    post.description,
    `${post.category} 카테고리의 ${post.style || "AI 이미지"} 프롬프트 예시입니다. 실제 결과 이미지와 프롬프트 원문을 확인하세요.`,
  );

  return {
    title,
    description,
    keywords: [
      `${post.title} 프롬프트`,
      `${post.category} 프롬프트`,
      `${post.model || "GPT Image"} 프롬프트`,
      ...(post.tags ?? []).map((tag) => `${tag} 프롬프트`),
    ],
    alternates: {
      canonical: `/images/${post.id}`,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/images/${post.id}`),
      siteName: "프롬프트랩",
      locale: "ko_KR",
      type: "article",
      images: images.map((url) => ({ url, alt: `${post.title} 결과 이미지` })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
    authors: [{ name: authorName, url: `/creators/${post.author_id}` }],
  };
}

export function getImagePostJsonLd(post: SeoImagePost, versions: SeoPromptVersion[]) {
  const authorName = getProfileNickname(post.profiles);
  const images = getPostImages(post).map(absoluteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${post.title} AI 이미지 프롬프트`,
    description: truncateDescription(post.description, `${post.title} AI 이미지 프롬프트 예시입니다.`),
    image: images,
    mainEntityOfPage: absoluteUrl(`/images/${post.id}`),
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      "@type": "Person",
      name: authorName,
      url: absoluteUrl(`/creators/${post.author_id}`),
    },
    publisher: {
      "@type": "Organization",
      name: "프롬프트랩",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
      },
    },
    keywords: [post.category, post.model, post.style, ...(post.tags ?? [])].filter(Boolean).join(", "),
    about: [post.category, post.model, post.style, ...(post.tags ?? [])].filter(Boolean),
    hasPart: versions.slice(0, 3).map((version) => ({
      "@type": "CreativeWork",
      name: version.label,
      text: version.body.slice(0, 500),
    })),
  };
}

export function getCreatorMetadata(profile: SeoProfile, posts: SeoImagePost[]): Metadata {
  const topCategory =
    Object.entries(
      posts.reduce<Record<string, number>>((acc, post) => {
        acc[post.category] = (acc[post.category] ?? 0) + 1;
        return acc;
      }, {}),
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "AI 이미지";
  const title = `@${profile.nickname}의 AI 이미지 프롬프트 모음`;
  const description = `@${profile.nickname} 크리에이터가 올린 ${topCategory} 중심 AI 이미지 프롬프트 ${posts.length}개와 결과 이미지를 확인하세요.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/creators/${profile.id}`,
    },
    robots:
      posts.length > 0
        ? { index: true, follow: true }
        : { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/creators/${profile.id}`),
      siteName: "프롬프트랩",
      locale: "ko_KR",
      type: "profile",
      images: posts[0] ? [{ url: absoluteUrl(getPostImages(posts[0])[0]), alt: `${profile.nickname} 대표 이미지` }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: posts[0] ? [absoluteUrl(getPostImages(posts[0])[0])] : ["/og-image-v2.png"],
    },
  };
}

export function getCreatorProfileJsonLd(profile: SeoProfile, posts: SeoImagePost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: profile.nickname,
      alternateName: `@${profile.nickname}`,
      identifier: profile.id,
    },
    url: absoluteUrl(`/creators/${profile.id}`),
    hasPart: posts.slice(0, 12).map((post) => ({
      "@type": "CreativeWork",
      name: post.title,
      url: absoluteUrl(`/images/${post.id}`),
      image: absoluteUrl(getPostImages(post)[0]),
    })),
  };
}

export function getPromptRequestMetadata(
  request: SeoPromptRequest,
  answers: SeoPromptRequestAnswer[],
): Metadata {
  const shouldIndex = request.status === "resolved" && answers.length > 0;
  const title = `${request.title} - 프롬프트 요청 답변`;
  const description = truncateDescription(
    request.body,
    `${request.request_type} 이미지 요청에 대한 AI 이미지 프롬프트 답변입니다.`,
  );

  return {
    title,
    description,
    keywords: [
      `${request.title} 프롬프트`,
      `${request.request_type} 프롬프트 요청`,
      `${request.target_model || "AI 이미지"} 프롬프트`,
    ],
    alternates: {
      canonical: `/requests/${request.id}`,
    },
    robots: shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/requests/${request.id}`),
      siteName: "프롬프트랩",
      locale: "ko_KR",
      type: "article",
      images: request.reference_image_urls?.length
        ? request.reference_image_urls.map((url) => ({
            url: absoluteUrl(url),
            alt: `${request.title} 참고 이미지`,
          }))
        : [{ url: "/og-image-v2.png", width: 1200, height: 630, alt: "프롬프트랩" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: request.reference_image_urls?.length
        ? request.reference_image_urls.map(absoluteUrl)
        : ["/og-image-v2.png"],
    },
  };
}

export function getPromptRequestJsonLd(
  request: SeoPromptRequest,
  answers: SeoPromptRequestAnswer[],
) {
  const acceptedAnswer = answers.find((answer) => answer.is_accepted) || answers[0];

  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: request.title,
      text: request.body,
      dateCreated: request.created_at,
      author: {
        "@type": "Person",
        name: getRequestAuthorName(request),
      },
      answerCount: answers.length,
      acceptedAnswer: acceptedAnswer
        ? {
            "@type": "Answer",
            text: acceptedAnswer.prompt_body,
            dateCreated: acceptedAnswer.created_at,
            author: {
              "@type": "Person",
              name: getRequestAuthorName(acceptedAnswer),
            },
          }
        : undefined,
      suggestedAnswer: answers.slice(0, 5).map((answer) => ({
        "@type": "Answer",
        text: answer.prompt_body,
        dateCreated: answer.created_at,
        author: {
          "@type": "Person",
          name: getRequestAuthorName(answer),
        },
      })),
    },
  };
}
