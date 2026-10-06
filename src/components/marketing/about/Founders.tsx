import { ABOUT } from "@/lib/marketing";
import { Accent, Display } from "../Type";

/**
 * "Meet our founders" (reference "Meet Anna"): a short story set in a narrow
 * column. The reference's portrait + pull quote was left out on purpose; the
 * team cards that follow show each founder.
 */
export default function Founders() {
  const f = ABOUT.founders;
  return (
    <section aria-label="Our founders" className="relative pt-20 tab:pt-[120px] desk:pt-40">
      <div className="mk-container">
        <div className="mx-auto flex max-w-[640px] flex-col gap-6 tab:ml-[27%]">
          <Display className="mk-reveal">{f.title.lead} <Accent>{f.title.accent}</Accent></Display>
          <p className="mk-reveal t-body text-ink-600">
            {f.lead.before}<strong className="font-semibold text-ink-900">{f.lead.strong}</strong>{f.lead.after}
          </p>
          <p className="mk-reveal t-body text-ink-600">{f.text}</p>
        </div>
      </div>
    </section>
  );
}
