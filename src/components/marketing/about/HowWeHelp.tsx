import { HeartPulse } from "lucide-react";
import { ABOUT } from "@/lib/marketing";
import { Eyebrow } from "../Type";
import ParallaxImage from "../home/ParallaxImage";
import { ScrollWords } from "../home/TextEffects";

/**
 * "The way we help" (reference "The Way We Help"): a full-bleed sky photo
 * drifting behind (parallax), a heart icon and eyebrow, then a large
 * statement whose words light up one by one as it scrolls into view.
 */
export default function HowWeHelp() {
  const h = ABOUT.help;
  return (
    <section data-nav-dark="true" aria-label={h.eyebrow} className="relative flex min-h-[100svh] items-center overflow-hidden bg-brand-950">
      <ParallaxImage src={h.image.src} alt={h.image.alt} intensity={180} noise={0.1} sizes="100vw" className="absolute inset-0" imgClassName="saturate-[.8]" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-brand-950/25 via-brand-950/35 to-brand-950/80" />
      <div className="mk-container relative flex flex-col items-center gap-5 py-32 text-center">
        <HeartPulse aria-hidden size={44} strokeWidth={1.3} className="mk-reveal text-white" />
        <Eyebrow className="mk-reveal !text-white">{h.eyebrow}</Eyebrow>
        <ScrollWords
          as="p"
          text={h.text}
          className="mk-on-dark mt-8 max-w-[1200px] font-display text-[30px] font-medium leading-[1.18] tracking-[-.03em] text-white tab:text-[40px] desk:text-[50px]"
        />
      </div>
    </section>
  );
}
