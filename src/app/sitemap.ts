import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { products } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.4 },
    ...products.map((p) => ({ url: `${base}/shop/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
