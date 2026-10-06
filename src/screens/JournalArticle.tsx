"use client";
import { relatedArticles, type JournalArticle as Article } from "@/lib/journal";
import { JOURNAL_FAQ } from "@/lib/marketing";
import MarketingShell from "@/components/marketing/MarketingShell";
import FaqSection from "@/components/marketing/FaqSection";
import { Accent } from "@/components/marketing/Type";
import ArticleBody from "@/components/marketing/journal/ArticleBody";
import MoreInsights from "@/components/marketing/journal/MoreInsights";

/**
 * /journal/[slug] — laid out and animated after the reference journal
 * article: pinned blob photo + article → more insights (the other articles)
 * → FAQ. The home page's community cards open these on "Read more".
 */
export default function JournalArticle({ article }: { article: Article }) {
  return (
    <MarketingShell>
      <ArticleBody article={article} />
      <MoreInsights articles={relatedArticles(article.slug)} />
      <FaqSection
        title={<>Your questions.<br /><Accent>Answered.</Accent></>}
        subtitle="How posts, Pulses and case discussions work on Orovion — and how we keep them safe."
        items={JOURNAL_FAQ}
      />
    </MarketingShell>
  );
}
