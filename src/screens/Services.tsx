"use client";
import { SERVICES_FAQ, SERVICES_PAGE } from "@/lib/marketing";
import MarketingShell from "@/components/marketing/MarketingShell";
import ThreadHero from "@/components/marketing/ThreadHero";
import FaqSection from "@/components/marketing/FaqSection";
import ContactSection from "@/components/marketing/ContactSection";
import { Accent } from "@/components/marketing/Type";
import Story from "@/components/marketing/home/Story";

/**
 * /services — laid out and animated after the reference services page: hero
 * with long threads → four stories, one per service (photos right, left,
 * right, left) → FAQ → contact. Each home service card's "Read more" lands on
 * its story (`#slug`). Copy lives in `SERVICES_PAGE` (src/lib/marketing.ts).
 */
export default function Services() {
  return (
    <MarketingShell>
      <ThreadHero content={SERVICES_PAGE.hero} label="Orovion services" flip />
      {/* one story per service; `id` = its slug, where that home card's "Read more" lands */}
      {SERVICES_PAGE.stories.map((s, i) => <Story key={s.slug} id={s.slug} story={s} flip={i % 2 === 1} />)}
      <FaqSection
        title={<>Your questions.<br /><Accent>Answered.</Accent></>}
        subtitle="How consultations, Pulses and the feed work — the answers most people look for first."
        items={SERVICES_FAQ}
      />
      <ContactSection id="contact" />
    </MarketingShell>
  );
}
