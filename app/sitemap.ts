import type { MetadataRoute } from "next";
import { prompts } from "@/data/prompts";

const siteUrl = "https://prompt-lab-drab-xi.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/boards`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/saved`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...prompts.map((prompt) => ({
      url: `${siteUrl}/prompts/${prompt.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
