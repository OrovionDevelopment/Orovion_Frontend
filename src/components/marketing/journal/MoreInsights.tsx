import type { JournalArticle } from "@/lib/journal";
import { Accent, Display, Eyebrow } from "../Type";
import ArticleCard from "./ArticleCard";

/**
 * "More insights for you." (reference "Journal" on an article): centered
 * header, then the other articles as cards (`ArticleCard`).
 */
export default function MoreInsights({ articles }: { articles: JournalArticle[] }) {
  return (
    <section aria-label="More insights" className="relative mk-section">
      <div className="mk-container flex flex-col items-center gap-6 text-center">
        <Eyebrow className="mk-reveal">EXPLORE OROVION</Eyebrow>
        <Display size="sm" className="mk-reveal">More ways to be part of <Accent>the network..</Accent></Display>
        <p className="mk-reveal max-w-[460px] t-body text-ink-600">
          Orovion is built for healthcare professionals, medical students and people. Explore how each role can connect, learn, share and engage with healthcare.
        </p>
      </div>

      <div className="mk-container mt-16 grid gap-16 tab:mt-20 tab:grid-cols-2 tab:gap-10">
        {articles.map((a, i) => (
          // depth wrapper: the right-hand card rises a little faster, as on /journal
          <div key={a.slug} data-depth={i % 2 === 1 ? 48 : undefined}><ArticleCard article={a} index={i + 1} /></div>
        ))}
      </div>
    </section>
  );
}
