"use client";
import { useCallback, useRef } from "react";
import { useScrollFrame } from "./useScrollFrame";
import { Eyebrow, rise } from "./Type";
import { BlurWords } from "./home/TextEffects";

/** Two long, thin threads that loop behind the headline (original curves, 1600×680 box). */
const LONG_THREADS = [
  "M -40 520 C 120 640, 300 600, 380 460 C 470 300, 500 110, 640 80 C 790 50, 850 230, 780 380 C 710 530, 560 540, 568 430 C 576 310, 760 250, 960 320 C 1110 372, 1190 470, 1090 486 C 990 502, 984 400, 1090 378 C 1270 340, 1430 490, 1660 430",
  "M -40 556 C 140 676, 330 630, 412 486 C 502 326, 538 140, 672 112 C 812 84, 870 262, 800 408 C 732 552, 592 566, 598 458 C 604 342, 784 282, 982 352 C 1130 404, 1206 504, 1104 520 C 1004 536, 1000 432, 1104 410 C 1286 372, 1446 524, 1660 470",
];

const REDUCED = "(prefers-reduced-motion: reduce)";

export type ThreadHeroContent = { lead: string; title: string; side: string; eyebrow: string; intro: string };

/**
 * The two long threads on their own: draw in on load (`.mk-draw`) and drift
 * up at 25% of the scroll on desktop. Position it with `className`.
 */
export function LongThreads({ className, flip = false }: { className?: string; flip?: boolean }) {
  const threads = useRef<SVGSVGElement>(null);

  useScrollFrame(useCallback(() => {
    const el = threads.current;
    if (!el) return;
    const on = window.innerWidth >= 1200 && !window.matchMedia(REDUCED).matches && window.scrollY < 1400;
    el.style.translate = on ? `0 ${(window.scrollY * 0.25).toFixed(1)}px` : "";
  }, []));

  return (
    <svg ref={threads} aria-hidden focusable="false" viewBox="0 0 1600 680" preserveAspectRatio="xMidYMid slice" className={`mk-draw pointer-events-none ${className ?? ""}`} fill="none">
      <g transform={flip ? "translate(1600 0) scale(-1 1)" : undefined}>
        {LONG_THREADS.map((d, i) => (
          <path key={i} d={d} pathLength={1} strokeWidth={1.2} strokeLinecap="round" style={{ stroke: "rgb(var(--brand-600))", opacity: i ? 0.22 : 0.38, ["--mk-d" as string]: `${0.2 + i * 0.25}s` }} />
        ))}
      </g>
    </svg>
  );
}

/**
 * Inner-page hero (reference about / services "Header"): two long threads
 * draw themselves in behind a two-line headline (brand-colored first line), a
 * short note on the right, then the indented introduction. The threads drift
 * up a little slower than the page (desktop), so the header gains depth as it
 * scrolls away. `flip` mirrors the threads so neighbouring pages differ.
 */
export default function ThreadHero({ content: h, label, flip = false }: { content: ThreadHeroContent; label: string; flip?: boolean }) {
  return (
    <section aria-label={label} className="relative overflow-x-clip pb-20 pt-40 tab:pb-[120px] tab:pt-[200px] desk:pb-40 desk:pt-[260px]">
      <LongThreads flip={flip} className="absolute left-1/2 top-[110px] h-[680px] w-[max(100%,1200px)] -translate-x-1/2" />

      <div className="mk-container relative">
        <div className="grid items-start gap-10 desk:grid-cols-[minmax(0,1fr)_260px]">
          <h1 className="mk-hero-title text-ink-900">
            <span className="mk-accent block text-brand-600"><BlurWords text={h.lead} startDelay={0.3} step={0.08} fill /></span>{" "}
            <span className="block"><BlurWords text={h.title} startDelay={0.5} step={0.08} fill /></span>
          </h1>
          <p className={`max-w-[260px] t-small text-ink-600 desk:mt-6 ${rise(0.8).className}`} style={rise(0.8).style}>{h.side}</p>
        </div>

        <div className="mt-20 grid gap-6 tab:mt-28 tab:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] desk:grid-cols-[minmax(0,1fr)_minmax(0,3.2fr)]">
          <Eyebrow className={rise(1).className} style={rise(1).style}>{h.eyebrow}</Eyebrow>
          <p className={`mk-indent max-w-[980px] text-[20px] leading-[1.5] tracking-[-.01em] text-ink-800 tab:text-[24px] desk:text-[28px] ${rise(1.1).className}`} style={rise(1.1).style}>
            {h.intro}
          </p>
        </div>
      </div>
    </section>
  );
}
