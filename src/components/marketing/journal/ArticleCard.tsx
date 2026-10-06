import { Link } from "@/lib/router";
import type { JournalArticle } from "@/lib/journal";
import { Eyebrow, FillText } from "../Type";
import PillButton from "../PillButton";
import BlobPhoto from "../home/BlobPhoto";

/**
 * A journal article as a card (reference journal cards): photo in an organic
 * blob with a faint outline, tag, title in the brand color, excerpt and a
 * "Read more" pill. The photo eases in and lifts on hover. `index` varies the
 * blob shape between neighbours.
 */
export default function ArticleCard({ article: a, index }: { article: JournalArticle; index: number }) {
  return (
    <article className="mk-reveal group flex flex-col items-center gap-6 text-center">
      <Link to={`/journal/${a.slug}`} data-cursor="Read" aria-label={a.title} className="mk-lift block w-full max-w-[460px]">
        <BlobPhoto src={a.image.src} alt="" index={index} sizes="(min-width: 810px) 34vw, 90vw" frame="aspect-[1.12] max-w-[460px]" />
      </Link>
      <Eyebrow>{a.tag}</Eyebrow>
      <h3 className="mk-accent max-w-[400px] font-display text-[30px] font-medium leading-[1.12] tracking-[-.03em] text-brand-600 tab:text-[34px]">
        <FillText>{a.title}</FillText>
      </h3>
      <p className="max-w-[380px] t-small text-ink-600">{a.excerpt}</p>
      <PillButton to={`/journal/${a.slug}`}>Read more</PillButton>
    </article>
  );
}
