import { UsersRound } from "lucide-react";
import { Link } from "@/lib/router";
import { ABOUT } from "@/lib/marketing";
import { TEAM } from "@/lib/team";
import { cn } from "@/lib/utils";
import { Display, Eyebrow, FillText } from "../Type";
import BlobPhoto from "../home/BlobPhoto";

/**
 * Team cards (reference "Team"): centered header, then one card per team
 * member — photo in an organic blob with a faint outline, name in the brand
 * color, focus areas and a "Read more" link to their page. The middle card
 * sits lower; cards lift and the photo eases in on hover.
 */
export default function TeamCards() {
  const t = ABOUT.team;
  return (
    <section id="team" aria-label={t.title} className="relative scroll-mt-24 mk-section">
      <div className="mk-container flex flex-col items-center gap-6 text-center">
        <UsersRound aria-hidden size={40} strokeWidth={1.4} className="mk-reveal text-brand-600" />
        <Eyebrow className="mk-reveal">{t.eyebrow}</Eyebrow>
        <Display size="sm" className="mk-reveal max-w-[720px]">{t.title}</Display>
        <p className="mk-reveal max-w-[480px] t-body text-ink-600">{t.text}</p>
      </div>

      <div className="mk-container mt-16 grid gap-16 tab:mt-20 tab:grid-cols-3 tab:gap-8">
        {TEAM.map((m, i) => (
          // depth wrapper (reveals own the card's `translate`): the lower middle card rises faster
          <div key={m.slug} data-depth={i === 1 ? 40 : undefined} className={cn(i === 1 && "tab:mt-28")}>
            <Link
              to={`/team/${m.slug}`}
              data-cursor="View"
              className="mk-reveal mk-lift group flex flex-col items-center gap-6 text-center"
            >
              <BlobPhoto src={m.photo ?? "/team/Cover.png"} alt={m.name} index={i} position="50% 28%" sizes="(min-width: 810px) 30vw, 90vw" />
              <div className="flex max-w-[340px] flex-col items-center gap-3">
                <h3 className="mk-accent font-display text-[30px] font-medium leading-[1.1] tracking-[-.03em] text-brand-600 desk:text-[34px]">
                  <FillText>{m.name}</FillText>
                </h3>
                <p className="t-small text-ink-600">{m.focus.join(" · ")}</p>
                <span className="ul-wipe mt-2 t-eyebrow">Read more</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
