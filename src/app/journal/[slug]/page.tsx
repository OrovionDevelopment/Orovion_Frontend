import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JournalArticle from "@/screens/JournalArticle";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JOURNAL, findArticle } from "@/lib/journal";

/** Prerender one page per article at build time. */
export function generateStaticParams() {
  return JOURNAL.map((a) => ({ slug: a.slug }));
}

// Unknown slugs are real 404s, not empty 200s (no soft 404s for crawlers).
export const dynamicParams = false;

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = findArticle(params.slug);
  if (!a) return { title: "Not found — Orovion", robots: { index: false, follow: false } };
  return pageMetadata({
    title: a.title,
    description: `${a.excerpt} ${a.lede}`.slice(0, 300),
    path: `/journal/${a.slug}`,
    image: a.image.src,
    type: "article",
  });
}

export default function Page({ params }: { params: { slug: string } }) {
  const article = findArticle(params.slug);
  if (!article) notFound();

  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Journal", path: "/journal" }, { name: article.title, path: `/journal/${article.slug}` }])]} />
      <JournalArticle article={article} />
    </>
  );
}
