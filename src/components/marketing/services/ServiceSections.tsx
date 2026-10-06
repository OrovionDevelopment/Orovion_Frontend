import { SERVICES } from "@/lib/marketing";
import { FillText } from "../Type";
import PillButton from "../PillButton";
import ParallaxImage from "../home/ParallaxImage";
import ScrollThread, { type ThreadLine } from "../home/ScrollThread";

/** One long thread winding through all four sections, a loop in each (original curve, 680×3600 box). */
const THREAD = "M 470 0 C 360 150, 230 330, 300 520 C 360 680, 570 690, 600 560 C 630 430, 470 390, 410 480 C 340 590, 470 800, 520 960 C 580 1150, 420 1290, 320 1420 C 220 1550, 280 1730, 430 1710 C 560 1690, 560 1550, 450 1570 C 330 1590, 300 1820, 380 1990 C 470 2170, 610 2260, 560 2440 C 520 2580, 340 2560, 330 2670 C 320 2790, 520 2810, 540 2690 C 560 2570, 360 2630, 300 2850 C 250 3030, 420 3210, 480 3370 C 520 3480, 470 3560, 430 3600";
const shift = (d: string, dx: number, dy: number) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${+x + dx} ${+y + dy}`);
const SERVICE_THREAD: ThreadLine[] = [{ d: shift(THREAD, -18, 12), opacity: 0.45 }, { d: THREAD }];

/**
 * The services (reference "Services"): one full-bleed section per service —
 * a drifting photo, a large white title, two paragraphs and a white pill into
 * the app — stacked so they read as one long journey. A single thread draws
 * itself down through all of them as the page scrolls (tablet + desktop).
 * Each section's id is its slug, so the home cards' "Read more" lands on it.
 */
export default function ServiceSections() {
  return (
    <div className="relative">
      {SERVICES.map((s) => (
        <section key={s.slug} id={s.slug} data-nav-dark="true" aria-label={s.title} className="relative flex min-h-[100svh] items-end overflow-hidden bg-brand-950">
          <ParallaxImage src={s.photo} alt="" intensity={200} noise={0.1} sizes="100vw" className="absolute inset-0" imgClassName="saturate-[.8]" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-brand-950/80 via-brand-950/40 to-brand-950/10" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-transparent to-brand-950/25" />
          <div className="mk-container relative z-[1] flex flex-col items-start gap-8 pb-24 pt-32 tab:pb-28 desk:pb-32">
            <h2 className="mk-reveal mk-on-dark max-w-[780px] font-display text-[48px] font-medium leading-[.98] tracking-[-.04em] text-white text-balance tab:text-[72px] desk:text-[96px]">
              <FillText>{s.title}</FillText>
            </h2>
            <div className="mk-reveal flex max-w-[640px] flex-col gap-5 t-body text-white/90">
              {s.body.map((p) => <p key={p.slice(0, 32)}>{p}</p>)}
            </div>
            <div className="mk-reveal pt-6"><PillButton to={s.cta.to} variant="light">{s.cta.label}</PillButton></div>
          </div>
        </section>
      ))}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-[4%] z-[2] hidden w-[46%] max-w-[680px] tab:block">
        <ScrollThread viewBox="0 0 680 3600" lines={SERVICE_THREAD} stroke="#fff" preserveAspectRatio="none" className="h-full w-full" />
      </div>
    </div>
  );
}
