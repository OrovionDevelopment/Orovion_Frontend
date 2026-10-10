import { Sparkles } from "lucide-react";
import { Link } from "@/lib/router";
import { HOME } from "@/lib/marketing";
import { cn } from "@/lib/utils";
import { Display, Eyebrow } from "../Type";
import BlobPhoto from "./BlobPhoto";

/**
 * Community highlights (reference "Journal"): centered header, then three
 * posts whose photos sit in organic blob shapes with a faint offset outline;
 * the middle one is set lower. Photos ease in slightly on hover.
 */
export default function Community() {
  const c = HOME.community;
  return (
    <section id="community" className="relative scroll-mt-24 mk-section">
      <div className="mk-container flex flex-col items-center gap-6 text-center">
        <Sparkles aria-hidden size={40} strokeWidth={1.4} className="mk-reveal text-brand-600" />
        <Eyebrow className="mk-reveal">{c.eyebrow}</Eyebrow>
        <Display size="sm" className="mk-reveal max-w-[640px]">{c.title.split("\n").map((line, i) => (i ? [<br key={i} />, line] : line))}</Display>
        <p className="mk-reveal max-w-[420px] t-body text-ink-600">{c.text}</p>
      </div>

      <div className="mk-container mt-16 grid gap-16 tab:mt-20 tab:grid-cols-3 tab:gap-8">
        {c.posts.map((p, i) => (
          // depth wrapper (reveals own the card's `translate`): the lower middle post rises faster
          <div key={p.title} data-depth={i === 1 ? 40 : undefined} className={cn(i === 1 && "tab:mt-28")}>
            <Link to={p.href} data-cursor="Read" className="mk-reveal mk-lift group flex flex-col items-center gap-8 text-center">
              <BlobPhoto src={p.image} index={i} sizes="(min-width: 810px) 30vw, 90vw" />
              <div className="flex max-w-[340px] flex-col items-center gap-3">
                <h3 className="t-title !text-[22px] text-ink-900">{p.title}</h3>
                <p className="t-small text-ink-600">{p.text}</p>
                <span className="ul-wipe mt-2 t-eyebrow">Read more</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
