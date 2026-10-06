"use client";
import { ABOUT, ABOUT_FAQ } from "@/lib/marketing";
import MarketingShell from "@/components/marketing/MarketingShell";
import FaqSection from "@/components/marketing/FaqSection";
import { Accent } from "@/components/marketing/Type";
import ThreadHero from "@/components/marketing/ThreadHero";
import HowWeHelp from "@/components/marketing/about/HowWeHelp";
import Founders from "@/components/marketing/about/Founders";
import TeamCards from "@/components/marketing/about/TeamCards";
import Ready from "@/components/marketing/home/Ready";
import Story from "@/components/marketing/home/Story";
import { QuoteDome, Statement } from "@/components/marketing/home/BigQuote";

/**
 * /about — laid out and animated after the reference about page: hero with
 * long threads → the way we help → founders → team cards (Read more → each
 * member's page) → statement → ready → big quote (dome + thread) → story →
 * FAQ. Copy lives in `ABOUT` (src/lib/marketing.ts); people in src/lib/team.ts.
 */
export default function About() {
  return (
    <MarketingShell>
      <ThreadHero content={ABOUT.hero} label="About Orovion" />
      <HowWeHelp />
      <Founders />
      <TeamCards />
      <Statement content={ABOUT.statement} plain />
      <Ready />
      <QuoteDome quote={ABOUT.quote} className="bg-surface" />
      <Story story={ABOUT.story} />
      <FaqSection
        title={<>Your questions.<br /><Accent>Answered.</Accent></>}
        subtitle="Curious how Orovion works, or who is behind it? These answers are a good place to start."
        items={ABOUT_FAQ}
      />
    </MarketingShell>
  );
}
