import type { JournalArticle, JournalSection } from "@/lib/journal";
import { Display, FillText, rise } from "../Type";
import { LongThreads } from "../ThreadHero";
import BlobPhoto from "../home/BlobPhoto";

function ArticleSection({ section: s }: { section: JournalSection }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="mk-reveal font-display text-[26px] font-medium leading-[1.2] tracking-[-.02em] text-ink-900 tab:text-[30px]">
        <FillText>{s.heading}</FillText>
      </h2>
      {s.paragraphs.map((p) => <p key={p.slice(0, 32)} className="mk-reveal t-body text-ink-600">{p}</p>)}
    </section>
  );
}

/**
 * Journal article (reference "Article"): the photo sits in a large organic
 * blob, pinned on the left while the article scrolls past on the right
 * (tablet + desktop), with the long threads drawn in behind. The right column:
 * title (word fill) and lede, then the sections.
 */
export default function ArticleBody({ article: a }: { article: JournalArticle }) {
  return (
    // depth frame: the pinned photo drifts across the whole read, not its own (fixed) box
    <article data-depth-frame className="relative overflow-x-clip pb-20 pt-36 tab:pb-[120px] tab:pt-[170px] desk:pb-40">
      <LongThreads className="absolute left-1/2 top-[110px] hidden h-[680px] w-[max(100%,1200px)] -translate-x-1/2 tab:block" />

      <div className="mk-container relative grid items-start gap-14 tab:grid-cols-2 tab:gap-10">
        {/* pinned photo */}
        <div className={`tab:sticky tab:top-[150px] ${rise(0.15).className}`} style={rise(0.15).style}>
          <BlobPhoto src={a.image.src} alt={a.image.alt} index={0} outline={false} drift={32} priority frame="aspect-[1.45] max-w-[660px]" sizes="(min-width: 810px) 46vw, 92vw" />
        </div>

        {/* article */}
        <div className="flex max-w-[560px] flex-col gap-12 tab:pl-[6%] desk:pl-[10%]">
          <header className="flex flex-col gap-8">
            <Display as="h1" className={rise(0.3).className} style={rise(0.3).style}>{a.title}</Display>
            <p className={`t-body-lg text-ink-700 ${rise(0.45).className}`} style={rise(0.45).style}>{a.lede}</p>
          </header>

          {a.sections.map((s) => <ArticleSection key={s.heading} section={s} />)}
        </div>
      </div>
    </article>
  );
}
