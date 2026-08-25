"use client";
import { Rocket, BadgeCheck, Newspaper, Stethoscope, ShieldAlert } from "lucide-react";
import { ChevronDown } from "lucide-react";
import LegalShell from "@/components/legal/LegalShell";
import { FAQ_SECTIONS, type FaqItem } from "@/lib/faq";

/** Native-details FAQ accordion — keyboard accessible out of the box. */
function Faq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="divide-y divide-ink-900/[.05] overflow-hidden rounded-2xl border border-ink-900/[.06] bg-surface shadow-card">
      {items.map(([q, a], i) => (
        <details key={i} className="group">
          <summary className="flex cursor-pointer items-center gap-3 px-4 py-3.5 text-[15px] font-semibold text-ink-900 transition hover:bg-ink-900/[.02] [&::-webkit-details-marker]:hidden">
            <span className="flex-1">{q}</span>
            <ChevronDown size={16} className="shrink-0 text-ink-400 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 text-sm leading-relaxed text-ink-600">{a}</div>
        </details>
      ))}
    </div>
  );
}

/** Section icon by id. Content itself lives in `src/lib/faq.ts`, which the
    FAQPage JSON-LD on /help also reads — one source, so markup and visible
    copy can never disagree. */
const ICONS: Record<string, any> = {
  "getting-started": Rocket,
  verification: BadgeCheck,
  "posts-feed": Newspaper,
  consultations: Stethoscope,
  safety: ShieldAlert,
};

const SECTIONS = FAQ_SECTIONS.map((s) => ({
  id: s.id,
  icon: ICONS[s.id],
  title: s.title,
  body: <Faq items={s.items} />,
}));

export default function HelpCenter() {
  return (
    <LegalShell
      eyebrow="Support"
      title="Help center"
      updated={undefined}
      sections={SECTIONS}
    />
  );
}
