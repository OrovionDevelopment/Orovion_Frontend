import { Activity, FlaskConical, Stethoscope } from "lucide-react";
import { formatArticleDate, readingMinutes, type JournalArticle, type JournalSection } from "@/lib/journal";
import { Display, Eyebrow, FillText, rise } from "../Type";
import { LongThreads } from "../ThreadHero";
import BlobPhoto from "../home/BlobPhoto";

const ICONS = { Pulse: Activity, "Case study": Stethoscope, Research: FlaskConical } as const;

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
 * icon, title (word fill), lede, date and reading time, then the sections —
 * a pull quote with a brand rule after the first — and the signature.
 */
export default function ArticleBody({ article: a }: { article: JournalArticle }) {
  const Icon = ICONS[a.tag];
  const [first, ...rest] = a.sections;
  const minutes = readingMinutes(a);

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
            <div className={`flex items-center gap-4 ${rise(0.2).className}`} style={rise(0.2).style}>
              <Icon aria-hidden size={40} strokeWidth={1.4} className="text-brand-600" />
              <Eyebrow as="span">{a.tag} · {minutes} min read</Eyebrow>
            </div>
            <Display as="h1" className={rise(0.3).className} style={rise(0.3).style}>{a.title}</Display>
            <p className={`t-body-lg text-ink-700 ${rise(0.45).className}`} style={rise(0.45).style}>{a.lede}</p>
            <p className={`t-small text-ink-500 ${rise(0.55).className}`} style={rise(0.55).style}>
              <time dateTime={a.date}>{formatArticleDate(a.date)}</time>
            </p>
          </header>

          {first && <ArticleSection section={first} />}

          <figure className="mk-reveal mk-from-right border-l border-brand-600/50 pl-8 tab:pl-10">
            <blockquote className="mk-accent font-display text-[32px] font-medium leading-[1.18] tracking-[-.03em] text-brand-600 tab:text-[40px] desk:text-[44px]">
              <FillText>{`“${a.quote}”`}</FillText>
            </blockquote>
          </figure>

          {rest.map((s) => <ArticleSection key={s.heading} section={s} />)}

          <footer className="flex flex-col gap-6">
            <p className="mk-reveal t-small text-ink-500">— {a.author}</p>
            <p className="mk-reveal rounded-2xl bg-ink-50 px-5 py-4 t-small text-ink-500">
              This article is for general education and does not replace individual medical advice.
            </p>
          </footer>
        </div>
      </div>
    </article>
  );
}
