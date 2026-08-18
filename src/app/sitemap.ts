import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/routes";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
