import type { MetadataRoute } from "next";
import { prompts } from "@/data/prompts";
import {
  SITE_URL,
  absoluteUrl,
  categoryLandingPages,
  getAllTags,
  getPromptPath,
  getTagPath,
  modelLandingPages,
} from "@/lib/seo";
import {
  fetchSitemapCreators,
  fetchSitemapImagePosts,
  fetchSitemapResolvedRequests,
  getPostImages,
} from "@/lib/seo-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const tags = getAllTags();
  const [uploadedPosts, creators, resolvedRequests] = await Promise.all([
    fetchSitemapImagePosts(),
    fetchSitemapCreators(),
    fetchSitemapResolvedRequests(),
  ]);

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...categoryLandingPages.map((page) => ({
      url: `${SITE_URL}/categories/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...modelLandingPages.map((page) => ({
      url: `${SITE_URL}/models/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...tags.map((tag) => ({
      url: `${SITE_URL}${getTagPath(tag)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
    ...prompts.map((prompt) => ({
      url: `${SITE_URL}${getPromptPath(prompt)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
      images: [absoluteUrl(prompt.image)],
    })),
    ...uploadedPosts.map((post) => ({
      url: `${SITE_URL}/images/${post.id}`,
      lastModified: new Date(post.updated_at || post.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.72,
      images: getPostImages(post).map(absoluteUrl),
    })),
    ...creators.map((creator) => ({
      url: `${SITE_URL}/creators/${creator.id}`,
      lastModified: creator.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.64,
    })),
    ...resolvedRequests.map((request) => ({
      url: `${SITE_URL}/requests/${request.id}`,
      lastModified: request.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.58,
    })),
  ];
}
