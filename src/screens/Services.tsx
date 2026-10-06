"use client";
import { SERVICES_FAQ, SERVICES_PAGE } from "@/lib/marketing";
import MarketingShell from "@/components/marketing/MarketingShell";
import ThreadHero from "@/components/marketing/ThreadHero";
import FaqSection from "@/components/marketing/FaqSection";
import ContactSection from "@/components/marketing/ContactSection";
import { Accent } from "@/components/marketing/Type";
import ServiceSections from "@/components/marketing/services/ServiceSections";
import Numbers from "@/components/marketing/home/Numbers";
import Story from "@/components/marketing/home/Story";

/**
 * /services — laid out and animated after the reference services page: hero
 * with long threads → one full-bleed section per service (a single thread
 * runs through them; the home cards' "Read more" lands on `#slug`) → numbers
 * → three stories (photos right, left, right) → FAQ → contact. Copy lives in
 * `SERVICES` and `SERVICES_PAGE` (src/lib/marketing.ts).
 */
export default function Services() {
  return (
    <MarketingShell>
      <ThreadHero content={SERVICES_PAGE.hero} label="Orovion services" flip />
      <ServiceSections />
      <Numbers plain />
      {SERVICES_PAGE.stories.map((s, i) => <Story key={s.title} story={s} flip={i % 2 === 1} />)}
      <FaqSection
        title={<>Your questions.<br /><Accent>Answered.</Accent></>}
        subtitle="How consultations, Pulses and the feed work — the answers most people look for first."
        items={SERVICES_FAQ}
      />
      <ContactSection id="contact" />
    </MarketingShell>
  );
}
