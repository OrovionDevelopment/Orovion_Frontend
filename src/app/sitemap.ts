import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { JOURNAL } from "@/lib/journal";

/**
 * Served at /sitemap.xml — the URL submitted to Google Search Console.
 *
 * Public pages only, and only pages the site links to: the navbar, footer and home
 * page cards. The Team pages and the Journal list are not linked from anywhere, so
 * they are left out. It must agree with robots.txt (listing a disallowed URL is
 * a Search Console warning). Journal articles are derived from `JOURNAL`, so
 * adding an article to `src/lib/journal.ts` lists its page automatically.
 *
 * `lastModified` uses build time. That is honest for a statically generated
 * marketing site: every deploy is the last time this content could have changed.
 */
const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/features", changeFrequency: "monthly", priority: 0.8 },
  { path: "/mobile-app", changeFrequency: "monthly", priority: 0.8 },
  { path: "/help", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...STATIC_ROUTES.map((r) => ({
      url: absoluteUrl(r.path),
      lastModified,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...JOURNAL.map((a) => ({
      url: absoluteUrl(`/journal/${a.slug}`),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
