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
} from "@/lib/seo-dynamic";

function sitemapUrl(pathOrUrl: string) {
  return new URL(pathOrUrl.startsWith("http") ? pathOrUrl : absoluteUrl(pathOrUrl)).toString();
}

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
      url: sitemapUrl(SITE_URL),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...categoryLandingPages.map((page) => ({
      url: sitemapUrl(`${SITE_URL}/categories/${page.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...modelLandingPages.map((page) => ({
      url: sitemapUrl(`${SITE_URL}/models/${page.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...tags.map((tag) => ({
      url: sitemapUrl(`${SITE_URL}${getTagPath(tag)}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
    ...prompts.map((prompt) => ({
      url: sitemapUrl(`${SITE_URL}${getPromptPath(prompt)}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...uploadedPosts.map((post) => ({
      url: sitemapUrl(`${SITE_URL}/images/${post.id}`),
      lastModified: new Date(post.updated_at || post.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.72,
    })),
    ...creators.map((creator) => ({
      url: sitemapUrl(`${SITE_URL}/creators/${creator.id}`),
      lastModified: creator.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.64,
    })),
    ...resolvedRequests.map((request) => ({
      url: sitemapUrl(`${SITE_URL}/requests/${request.id}`),
      lastModified: request.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.58,
    })),
  ];
}
