"use client";
import { useRef, useState, type FocusEvent, type PointerEvent } from "react";
import { Link } from "@/lib/router";
import { HOME } from "@/lib/marketing";
import { WHEEL, cardTilt, wheelCenterProgress, wheelRotation } from "@/lib/motion";
import ParallaxImage from "./ParallaxImage";
import { FillText } from "../Type";
import { useScrollFrame } from "../useScrollFrame";

/** Desktop with motion allowed: the cards ride the wheel (globals.css "Services wheel"). */
const WHEEL_QUERY = "(min-width: 1200px) and (prefers-reduced-motion: no-preference)";
/** Mouse/trackpad with motion allowed: cards tilt toward the pointer. */
const TILT_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * The four service cards right after the trust toggle — moody photo drifting
 * inside the card (200px parallax + grain), title top-left, description low,
 * and a dot whose "Read more" fades in on hover. Each card opens its story on
 * /services (`#slug`).
 *
 * Motion (Althea reference):
 *  · desktop: a 200vh track pins a 100vh stage and the cards ride the top of a
 *    big wheel, 13° apart and tilted along the curve; scrolling turns the
 *    wheel, so they roll in from the lower right, stand upright in the middle
 *    and roll out to the left (smoothed by Lenis);
 *  · tablet/phone (and desktop with reduced motion): a swipe carousel that
 *    snaps card by card, with dots (all four simply fit on desktop);
 *  · mouse/trackpad: the card under the pointer tilts in 3D so the corner
 *    nearest the pointer comes forward (up to 20°, 500px perspective).
 */
export default function Services() {
  const services = HOME.services;
  const track = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const wheel = useRef({ on: false, rotation: 0 });
  const hovered = useRef<{ index: number; x: number; y: number } | null>(null);
  const media = useRef<{ wheel: MediaQueryList; tilt: MediaQueryList } | null>(null);
  const [active, setActive] = useState(0);

  const queries = () => (media.current ??= { wheel: window.matchMedia(WHEEL_QUERY), tilt: window.matchMedia(TILT_QUERY) });

  const setTilt = (index: number, x: number, y: number) => {
    const li = items.current[index], card = li?.firstElementChild as HTMLElement | null;
    if (!li || !card) return;
    const r = li.getBoundingClientRect(); // a rotated box keeps its centre
    const angle = wheel.current.on ? wheel.current.rotation + index * WHEEL.step : 0;
    const t = cardTilt(x, y, r.left + r.width / 2, r.top + r.height / 2, li.offsetWidth, li.offsetHeight, angle);
    card.style.setProperty("--tilt-x", `${t.x.toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${t.y.toFixed(2)}deg`);
  };

  // useScrollFrame always calls the latest closure, so no memoising is needed.
  useScrollFrame(() => {
    const t = track.current, l = list.current;
    if (!t || !l) return;
    const on = queries().wheel.matches;
    if (on !== wheel.current.on) {
      wheel.current.on = on;
      if (!on) l.style.rotate = "";
    }
    if (on) {
      const r = t.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom > -vh && r.top < 2 * vh) {
        wheel.current.rotation = wheelRotation(r.top, r.height, vh, services.length);
        l.style.rotate = `${wheel.current.rotation.toFixed(3)}deg`;
      }
    }
    // The wheel turns under a still pointer: keep the hovered card's tilt true.
    const h = hovered.current;
    if (h) setTilt(h.index, h.x, h.y);
  });

  const onPointerMove = (index: number) => (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch" || !queries().tilt.matches) return;
    hovered.current = { index, x: e.clientX, y: e.clientY };
    setTilt(index, e.clientX, e.clientY);
  };
  const onPointerLeave = (e: PointerEvent<HTMLElement>) => {
    hovered.current = null;
    e.currentTarget.style.setProperty("--tilt-x", "0deg");
    e.currentTarget.style.setProperty("--tilt-y", "0deg");
  };

  // Keyboard focus on the wheel: scroll so the focused card stands in the middle.
  const onFocus = (index: number) => (e: FocusEvent<HTMLElement>) => {
    const t = track.current;
    if (!t || !queries().wheel.matches || !e.currentTarget.matches(":focus-visible")) return;
    const r = t.getBoundingClientRect();
    const pinned = r.height - window.innerHeight;
    window.scrollTo({ top: Math.round(window.scrollY + r.top + wheelCenterProgress(index, services.length) * pinned) });
  };

  // Carousel: the dot of the first fully shown card (the last one at the end).
  const onListScroll = () => {
    const l = list.current, a = items.current[0], b = items.current[1];
    if (!l || !a || !b || wheel.current.on) return;
    const step = b.offsetLeft - a.offsetLeft, max = l.scrollWidth - l.clientWidth;
    const i = l.scrollLeft >= max - 4 ? services.length - 1 : Math.round(l.scrollLeft / step);
    setActive((prev) => (prev === i ? prev : i));
  };
  const goTo = (index: number) => {
    const l = list.current, a = items.current[0], b = items.current[1];
    if (!l || !a || !b) return;
    const max = l.scrollWidth - l.clientWidth;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    l.scrollTo({ left: Math.min(index * (b.offsetLeft - a.offsetLeft), max), behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <section id="features" aria-label="What you can do on Orovion" className="mk-wheel relative scroll-mt-24">
      <div ref={track} className="mk-wheel__track">
        <div className="mk-wheel__stage mk-reveal">
          <ul ref={list} className="mk-wheel__list" onScroll={onListScroll}>
            {services.map((s, i) => (
              <li
                key={s.title}
                ref={(el) => { items.current[i] = el; }}
                className="mk-wheel__item"
                style={{ ["--a" as string]: `${i * WHEEL.step}deg` }}
              >
                <Link
                  to={s.href}
                  data-cursor="Explore"
                  className="mk-wheel__card group"
                  onPointerMove={onPointerMove(i)}
                  onPointerLeave={onPointerLeave}
                  onFocus={onFocus(i)}
                >
                  <ParallaxImage
                    src={s.image}
                    alt=""
                    intensity={200}
                    sizes="(min-width: 1200px) 25vw, (min-width: 810px) 50vw, 100vw"
                    className="absolute inset-0"
                    imgClassName="saturate-[.8]"
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-brand-950/55 via-brand-950/10 to-brand-950/75" />
                  <h3 className="mk-on-dark absolute left-6 right-6 top-6 font-display text-[32px] font-medium leading-[1.02] tracking-[-.03em] text-white desk:text-[34px] wide:text-[38px]">
                    <FillText>{s.title}</FillText>
                  </h3>
                  <p className="absolute bottom-20 left-6 right-6 max-w-[300px] t-small text-white/90">{s.text}</p>
                  <span className="absolute bottom-6 left-6 flex items-center gap-4">
                    <span aria-hidden className="h-1 w-1 rounded-full bg-white" />
                    <span className="mk-hover-reveal t-eyebrow !text-white">Read more</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mk-wheel__dots" role="group" aria-label="Service cards">
            {services.map((s, i) => (
              <button key={s.title} type="button" aria-label={`Show ${s.title}`} aria-current={i === active || undefined} onClick={() => goTo(i)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
