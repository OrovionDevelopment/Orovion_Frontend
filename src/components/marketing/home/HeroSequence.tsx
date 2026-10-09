"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { HOME } from "@/lib/marketing";
import { pointerOffset, rangeProgress, smoothToward, toggleState, type ToggleState } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useScrollFrame } from "../useScrollFrame";
import { NAV_ZONES_EVENT } from "../SiteNav";
import PillButton from "../PillButton";
import { Accent, FillText, rise } from "../Type";
import ScrollThread, { type ThreadLine } from "./ScrollThread";
import { BlurWords } from "./TextEffects";

/** Two strands of the hero thread (original curves, 780×1140 box). */
const HERO_THREAD: ThreadLine[] = [
  { opacity: 0.5, d: "M 612 0 C 330 150, 110 380, 172 576 C 230 770, 490 786, 584 640 C 666 512, 540 420, 450 484 C 346 556, 380 778, 540 916 C 660 1024, 582 1110, 494 1140" },
  { d: "M 590 0 C 300 140, 90 360, 150 560 C 205 750, 470 760, 560 620 C 640 500, 520 410, 430 470 C 330 540, 360 760, 520 900 C 640 1010, 560 1100, 470 1140" },
];

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Home hero + trust toggle — the reference's opening scroll sequence:
 *  1. a full-bleed portrait (pinned) over a soft brand backdrop; the portrait
 *     fades 1 → 0 across the first screen of scroll, uncovering the backdrop;
 *  2. a white thread draws itself through the headline as you scroll
 *     (fades out once the toggle wakes);
 *  3. the headline arrives word by word (blur → sharp), the paragraph lags
 *     the scroll at 70% speed (desktop);
 *  4. a dot rises and becomes a switch ("off"); further down it flips "on":
 *     the stage fades to the page background, the copy swaps, and the nav
 *     (white while the stage shows) returns to its normal colors.
 */
export default function HeroSequence() {
  const { hero, trust } = HOME;
  const section = useRef<HTMLElement>(null);
  const textBlock = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const circles = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const startMark = useRef<HTMLDivElement>(null);
  const onMark = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ToggleState>("start");

  useScrollFrame(useCallback(() => {
    const tb = textBlock.current, p = portrait.current, a = startMark.current, b = onMark.current;
    if (!tb || !p || !a || !b) return;
    const r = tb.getBoundingClientRect();
    p.style.opacity = (1 - rangeProgress(-r.top, 0, r.height)).toFixed(3);
    const c = copy.current;
    if (c) {
      const lag = window.innerWidth >= 1200 && !window.matchMedia(REDUCED).matches && r.top < 0;
      c.style.transform = lag ? `translate3d(0, ${(-r.top * 0.3).toFixed(1)}px, 0)` : "";
    }
    const next = toggleState(a.getBoundingClientRect().top, b.getBoundingClientRect().top, window.innerHeight);
    setState((s) => (s === next ? s : next));
  }, []));

  // The nav reads `data-nav-dark`; tell it when the toggle changes the stage.
  useEffect(() => { window.dispatchEvent(new Event(NAV_ZONES_EVENT)); }, [state]);

  // Mouse depth (mouse/trackpad, while the hero is on screen): the portrait
  // drifts a few px against the pointer and the rings with it, eased over
  // ~0.45s — felt more than seen.
  useEffect(() => {
    const s = section.current, p = portrait.current, c = circles.current;
    if (!s || !p || !c) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia(REDUCED).matches) return;
    let inView = true, raf = 0, last = 0, x = 0, y = 0, tx = 0, ty = 0;
    const tick = (now: number) => {
      const dt = last ? now - last : 16;
      last = now;
      x = smoothToward(x, tx, dt, 450);
      y = smoothToward(y, ty, dt, 450);
      p.style.translate = `${(-x * 10).toFixed(2)}px ${(-y * 7).toFixed(2)}px`;
      c.style.translate = `${(x * 16).toFixed(2)}px ${(y * 11).toFixed(2)}px`;
      if (Math.abs(tx - x) > 0.002 || Math.abs(ty - y) > 0.002) raf = requestAnimationFrame(tick);
      else { raf = 0; last = 0; }
    };
    const onMove = (ev: PointerEvent) => {
      if (!inView || ev.pointerType === "touch") return;
      ({ x: tx, y: ty } = pointerOffset(ev.clientX, ev.clientY, window.innerWidth, window.innerHeight));
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([en]) => { inView = en.isIntersecting; });
    io.observe(s);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  // Load sequence: logo (nav, 0.05s) → headline words (0.3s, +0.08s each) →
  // paragraph (0.8s) → CTA (0.95s); the portrait settles from a slight zoom
  // underneath the whole time (globals.css .mk-hero-photo).
  const e = { text: rise(0.8), cta: rise(0.95) };
  const on = state === "on";

  return (
    <section ref={section} data-nav-dark={!on} aria-label="Introduction" className="relative">
      {/* pinned stage: backdrop → circles → portrait (fades with scroll) → grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className={cn("mk-hero-stage", on && "is-off")}>
          <div className="mk-hero-stage__inner">
            <div className="mk-hero-backdrop absolute inset-0" />
            <div ref={circles} className="mk-hero-circles absolute inset-0">
              <span style={{ width: "78vmax" }} />
              <span style={{ width: "60vmax" }} />
              <span style={{ width: "42vmax" }} />
            </div>
            <div ref={portrait} className="absolute inset-0">
              <picture>
                <source media="(max-width: 809.98px)" srcSet={hero.image.srcPhone} />
                <img src={hero.image.src} alt="" className="mk-hero-photo" decoding="async" fetchPriority="high" />
              </picture>
              <div className="mk-hero-tint absolute inset-0" />
              <div className="mk-hero-grade absolute inset-0" />
            </div>
            <div className="mk-noise absolute inset-0" style={{ opacity: 0.18 }} />
          </div>
        </div>
      </div>

      {/* hero copy */}
      <div ref={textBlock} className="relative pb-20 pt-40 tab:h-[90vh] tab:pb-0 tab:pt-0 desk:h-screen desk:max-h-[900px]">
        <div className={cn("mk-hero-thread hidden tab:block", state !== "start" && "is-hidden")}>
          <ScrollThread viewBox="0 0 780 1140" lines={HERO_THREAD} stroke="#fff" className="h-full w-full" />
        </div>
        <div className="relative tab:absolute tab:inset-x-0 tab:bottom-10 desk:bottom-16">
          <div className="mk-container grid items-end gap-10 tab:grid-cols-[4fr_1fr_3fr] tab:gap-0 desk:grid-cols-[7fr_1fr_4fr]">
            <h1 className="mk-hero-title text-white text-balance"><BlurWords text={hero.title} startDelay={0.3} step={0.08} fill /></h1>
            <div ref={copy} className="flex flex-col items-start gap-8 tab:col-start-3">
              <p className={cn("max-w-[460px] t-body text-white", e.text.className)} style={e.text.style}>{hero.text}</p>
              <div className={e.cta.className} style={e.cta.style}>
                <PillButton to={hero.cta.to}>{hero.cta.label}</PillButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* trust toggle: sticky for one screen of scroll, then hands over to the services */}
      <div className="relative" style={{ height: "calc(500px + 100vh)" }}>
        <div ref={startMark} aria-hidden className="pointer-events-none absolute inset-x-0 top-[244px] h-2" />
        <div id="verified-on" aria-hidden className="pointer-events-none absolute inset-x-0 h-2" style={{ top: "calc(500px + 300px)" }} />
        <div ref={onMark} aria-hidden className="pointer-events-none absolute inset-x-0 h-2" style={{ top: "calc(500px + 50vh - 4px)" }} />
        <div className="sticky top-0 flex flex-col items-center gap-8 px-4 pt-[244px] text-center">
          <a href="#verified-on" className={cn("mk-toggle", `is-${state}`)} aria-label={on ? `${trust.label}: on` : `Switch on — ${trust.label}`}>
            <span className="mk-toggle__label t-eyebrow">{trust.label}</span>
            <span className="mk-toggle__track" />
            <span className="mk-toggle__knob" />
          </a>
          <div className="relative w-full max-w-[1200px]">
            <div className={cn("mk-swap-after mx-auto flex max-w-[800px] desk:max-w-[1100px] flex-col items-center gap-8", on && "is-on")}>
              <h2 className="t-display-sm text-ink-900 text-balance desk:whitespace-nowrap"><FillText>{trust.after.title}<br /><Accent>{trust.after.accent}</Accent></FillText></h2>
              <p className="max-w-[640px] t-body text-ink-600 text-balance">{trust.after.text}</p>
            </div>
            <div className={cn("mk-swap-before absolute inset-x-0 top-0 mx-auto flex max-w-[800px] desk:max-w-[1100px] flex-col items-center gap-8", on && "is-on")} aria-hidden={on}>
              <p className="t-display-sm text-white text-balance desk:whitespace-nowrap"><FillText>{trust.before.title.split("\n").map((line, i) => (i ? [<br key={i} />, line] : line))}</FillText></p>
              <p className="max-w-[440px] t-body text-white">{trust.before.lines[0]}<br />{trust.before.lines[1]}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
