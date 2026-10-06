"use client";
import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "@/lib/router";
import { HOME } from "@/lib/marketing";
import { absoluteUrl } from "@/lib/seo";
import { depthOffset, drawProgress, pointerOffset, rangeProgress, smoothToward } from "@/lib/motion";
import StoreBadge from "@/components/ui/StoreBadge";
import PillButton from "../PillButton";
import { Accent, Display, Eyebrow } from "../Type";

/*
 * Stage geometry (viewBox 640×760). The phone's screen is a 300×620 rounded
 * rect at (190, 70), r 46; the bezel sits 12px outside it. Each strand enters
 * from far left (x −980 reaches the page edge on desktop, running under the
 * copy below its last line), curls once, rises along the phone's left edge
 * and traces the outline clockwise back past where it joined — one unbroken
 * thread per strand, like the hero's double-strand thread. The section clips
 * sideways only, so the lead-in never widens the page.
 */
const SCREEN = { x: 190, y: 70, w: 300, h: 620 };
const STAGE = { w: 640, h: 760 };
const STRAND = "M -980 712 C -640 730, -300 690, -40 640 C 40 632, 118 604, 138 548 C 152 506, 134 462, 100 464 C 66 466, 58 512, 98 520 C 148 530, 190 456, 190 360 L 190 116 A 46 46 0 0 1 236 70 L 444 70 A 46 46 0 0 1 490 116 L 490 644 A 46 46 0 0 1 444 690 L 236 690 A 46 46 0 0 1 190 644 L 190 340";
const ECHO = "M -980 736 C -640 756, -300 714, -40 664 C 44 656, 128 626, 150 556 C 166 500, 140 444, 98 448 C 52 452, 44 518, 96 534 C 152 548, 178 470, 178 380 L 178 116 A 58 58 0 0 1 236 58 L 444 58 A 58 58 0 0 1 502 116 L 502 644 A 58 58 0 0 1 444 702 L 236 702 A 58 58 0 0 1 178 644 L 178 360";
const ISLAND = "M 314 94 L 366 94";
/**
 * QR edge in px: the /mobile-app URL needs 33×33 modules at level H, drawn at
 * 5px each so modules land on whole pixels on 1× monitors. Re-check if the
 * site URL grows (a longer URL means more modules).
 */
const QR_SIZE = 165;
/** The outline counts as closed (phone comes alive) above this; it resets below `REOPEN`. */
const READY = 0.985, REOPEN = 0.9;
/**
 * Depth (px over the section's pass through the screen, see `depthOffset`):
 * the phone + thread rise a little faster than the page, the rings lag
 * behind it. Mouse depth on top, as in the hero: the phone leans up to 10/7px
 * against the pointer, the rings 16/11px with it, eased τ 450ms.
 */
const NEAR = 36, FAR = -56;
const MOUSE = { near: { x: -10, y: -7 }, far: { x: 16, y: 11 } };

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/**
 * "Get the app" (home, above the FAQ). Copy on the left — eyebrow, headline,
 * one line, store badges, three facts. On the right a thread draws itself as
 * the stage scrolls up: it sweeps in, curls once and traces a phone; when the
 * outline closes the phone fills in and a QR code to /mobile-app settles
 * inside (mouse/trackpad screens). Touch screens get the app icon and a
 * button instead — nobody scans a code on the phone they are holding.
 * Depth: faint rings behind the phone lag the page while the phone + thread
 * rise slightly faster than it, and on mouse/trackpad screens both lean with
 * the pointer (see NEAR / FAR / MOUSE). Reduced motion: drawn, still.
 * Store badges point to /mobile-app until the store listings are live.
 */
export default function GetApp() {
  const a = HOME.app;
  const stage = useRef<HTMLDivElement>(null); // measured, never moved
  const nearBack = useRef<HTMLDivElement>(null); // thread + phone outline
  const nearFront = useRef<HTMLDivElement>(null); // phone screen content
  const far = useRef<HTMLDivElement>(null); // rings

  useEffect(() => {
    const el = stage.current, back = nearBack.current, front = nearFront.current, farEl = far.current;
    if (!el || !back || !front || !farEl) return;
    const strands = Array.from(el.querySelectorAll<SVGPathElement>("[data-strand]"));
    const island = el.querySelector<SVGPathElement>("[data-island]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced;
    let current = 0, target = 0, raf = 0, last = 0, ready = false;
    let nearY = 0, farY = 0, inView = false; // scroll depth (px)
    let mx = 0, my = 0, tx = 0, ty = 0; // pointer, −1..1 (eased → target)

    const draw = (p: number) => {
      strands.forEach((s) => { s.style.strokeDashoffset = String(1 - p); });
      if (island) island.style.strokeDashoffset = String(1 - rangeProgress(p, 0.94, 1));
      const next = ready ? p > REOPEN : p >= READY;
      if (next !== ready) { ready = next; el.classList.toggle("is-ready", ready); }
    };
    const place = () => {
      back.style.translate = front.style.translate = `${(mx * MOUSE.near.x).toFixed(2)}px ${(nearY + my * MOUSE.near.y).toFixed(2)}px`;
      farEl.style.translate = `${(mx * MOUSE.far.x).toFixed(2)}px ${(farY + my * MOUSE.far.y).toFixed(2)}px`;
    };
    const tick = (now: number) => {
      const dt = last ? now - last : 16;
      last = now;
      current = smoothToward(current, target, dt, 150);
      if (Math.abs(target - current) < 0.0005) current = target;
      mx = smoothToward(mx, tx, dt, 450);
      my = smoothToward(my, ty, dt, 450);
      if (Math.abs(tx - mx) < 0.002) mx = tx;
      if (Math.abs(ty - my) < 0.002) my = ty;
      draw(current);
      place();
      if (current !== target || mx !== tx || my !== ty) raf = requestAnimationFrame(tick);
      else { raf = 0; last = 0; }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const measure = () => {
      if (reduced) { current = target = 1; draw(1); return; } // drawn in full, no depth
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      // the thread starts as the stage top passes 85% of the screen; closes as its bottom reaches the screen bottom
      target = drawProgress(r.top, r.height, vh, 0.85, 0.98);
      nearY = depthOffset(r.top, r.height, vh, NEAR);
      farY = depthOffset(r.top, r.height, vh, FAR);
      inView = r.bottom > 0 && r.top < vh;
      kick();
    };
    const onPointer = (e: PointerEvent) => {
      if (!inView || e.pointerType === "touch") return;
      ({ x: tx, y: ty } = pointerOffset(e.clientX, e.clientY, window.innerWidth, window.innerHeight));
      kick();
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    if (mouse) window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  const screen = { left: pct(SCREEN.x, STAGE.w), top: pct(SCREEN.y, STAGE.h), width: pct(SCREEN.w, STAGE.w), height: pct(SCREEN.h, STAGE.h) };

  return (
    <section id="get-the-app" aria-label="Get the Orovion app" className="relative isolate scroll-mt-24 overflow-x-clip bg-ink-50 pt-20 tab:pt-[120px] desk:pt-40">
      <div className="mk-container mk-split items-center" style={{ ["--mk-gap" as string]: "48px" }}>
        <div className="flex flex-col items-start gap-6">
          <Eyebrow className="mk-reveal">{a.eyebrow}</Eyebrow>
          <Display className="mk-reveal max-w-[560px]">{a.title} <Accent>{a.accent}</Accent></Display>
          <p className="mk-reveal max-w-[460px] t-body text-ink-600">{a.text}</p>
          <div className="mk-reveal flex flex-wrap gap-3 pt-4">
            <Link to={a.to} data-cursor="snap" className="group rounded-xl" aria-label="Orovion on the App Store — learn more"><StoreBadge store="apple" /></Link>
            <Link to={a.to} data-cursor="snap" className="group rounded-xl" aria-label="Orovion on Google Play — learn more"><StoreBadge store="google" /></Link>
          </div>
          <ul className="mk-reveal flex flex-wrap gap-x-6 gap-y-3 pt-2">
            {a.facts.map((f) => (
              <li key={f} className="flex items-center gap-2 t-small text-ink-700">
                <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full bg-brand-600/10 text-brand-600"><Check size={12} strokeWidth={3} /></span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div ref={stage} className="mk-app relative mx-auto w-full max-w-[560px]" style={{ aspectRatio: `${STAGE.w} / ${STAGE.h}` }}>
          {/* Depth layers. The drawn ones sit below the copy inside the isolated
              section (negative z), so the lead-in passes behind the text and
              badges. Far: faint rings (the hero's motif) that lag the page. */}
          <div ref={far} aria-hidden className="mk-app__rings absolute inset-0 -z-20">
            <span />
            <span />
            <span />
          </div>
          {/* Near, back half: the thread + phone outline, rising a little faster than the page. */}
          <div ref={nearBack} className="absolute inset-0 -z-10">
            <svg viewBox={`0 0 ${STAGE.w} ${STAGE.h}`} className="absolute inset-0 h-full w-full overflow-visible text-brand-600" fill="none" aria-hidden focusable="false">
              <rect className="mk-app__body" x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={46} />
              <path data-strand d={ECHO} stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" opacity={0.45} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1} />
              <path data-strand d={STRAND} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1} />
              <path data-island d={ISLAND} stroke="currentColor" strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1} />
            </svg>
          </div>
          {/* Near, front half: the screen content, moved with the back half but
              stacked normally so the touch button stays tappable (negative-z
              layers sit under the page's in-flow boxes for the pointer too). */}
          <div ref={nearFront} className="absolute inset-0">
            <div className="mk-app__screen absolute flex flex-col items-center justify-center px-[6%] text-center" style={screen}>
              {/* mouse/trackpad: scan with your phone */}
              <div className="mk-app__scan w-full flex-col items-center gap-4">
                <span className="mk-app__in flex items-center gap-2 text-[13px] font-semibold text-ink-900">
                  <img src="/brand/icon-secondary.svg" alt="" aria-hidden width={20} height={20} className="h-5 w-5 dark:hidden" />
                  <img src="/brand/icon-primary.svg" alt="" aria-hidden width={20} height={20} className="hidden h-5 w-5 dark:block" />
                  Orovion
                </span>
                <div className="mk-app__in relative rounded-2xl bg-white p-2.5 ring-1 ring-ink-900/10" role="img" aria-label={`QR code — opens ${absoluteUrl(a.to).replace(/^https?:\/\//, "")}`}>
                  {/* Dark-on-white in every theme — scanners need the contrast. Level H
                      recovers far more than the ~4% the logo badge covers. */}
                  <QRCodeSVG value={absoluteUrl(a.to)} size={QR_SIZE} level="H" marginSize={0} className="block" aria-hidden />
                  <span className="pointer-events-none absolute inset-0 grid place-items-center">
                    <span className="grid h-[20%] w-[20%] place-items-center rounded-lg bg-white shadow-[0_2px_10px_rgba(0,0,0,.14)] ring-1 ring-ink-900/10">
                      <img src="/brand/icon-secondary.svg" alt="" aria-hidden width={24} height={24} className="h-[55%] w-[55%]" />
                    </span>
                  </span>
                </div>
                <span className="mk-app__in flex flex-col gap-1">
                  <span className="text-[15px] font-semibold leading-tight text-ink-900">{a.scan.title}</span>
                  <span className="text-[12px] leading-snug text-ink-500">{a.scan.hint}</span>
                </span>
              </div>
              {/* touch screens: the button */}
              <div className="mk-app__tap w-full flex-col items-center gap-4">
                <span className="mk-app__in grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-[0_6px_18px_-6px_rgba(0,0,0,.25)] ring-1 ring-ink-900/10">
                  <img src="/brand/icon-secondary.svg" alt="" aria-hidden width={32} height={32} className="h-8 w-8" />
                </span>
                <span className="mk-app__in flex flex-col gap-1">
                  <span className="text-[15px] font-semibold text-ink-900">Orovion</span>
                  <span className="text-[12px] leading-snug text-ink-500">{a.tap.text}</span>
                </span>
                <span className="mk-app__in"><PillButton to={a.to} size="sm">{a.tap.cta}</PillButton></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
