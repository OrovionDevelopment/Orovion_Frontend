"use client";
import { JOURNAL } from "@/lib/journal";
import { JOURNAL_PAGE } from "@/lib/marketing";
import MarketingShell from "@/components/marketing/MarketingShell";
import ThreadHero from "@/components/marketing/ThreadHero";
import ArticleCard from "@/components/marketing/journal/ArticleCard";
import Ready from "@/components/marketing/home/Ready";

/**
 * /journal — laid out after the reference journal page: long-thread hero →
 * every article as a blob card, two to a row → ready. The home page's
 * "Insights for sharper thinking" CTA opens it; articles live in
 * src/lib/journal.ts.
 */
export default function Journal() {
  return (
    <MarketingShell>
      <ThreadHero content={JOURNAL_PAGE.hero} label="Orovion journal" />
      <section aria-label="Articles" className="relative pb-20 tab:pb-[120px] desk:pb-40">
        <div className="mk-container grid gap-16 tab:grid-cols-2 tab:gap-x-10 tab:gap-y-24">
          {JOURNAL.map((a, i) => (
            // depth wrapper: the right-hand column rises a little faster (masonry-style offset)
            <div key={a.slug} data-depth={i % 2 === 1 ? 48 : undefined}><ArticleCard article={a} index={i} /></div>
          ))}
        </div>
      </section>
      <Ready />
    </MarketingShell>
  );
}
