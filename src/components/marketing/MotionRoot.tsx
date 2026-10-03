"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { revealStagger } from "@/lib/motion";

const DESKTOP = "(min-width: 1200px)";
const REDUCED = "(prefers-reduced-motion: reduce)";
/** Fixed nav height + breathing room, so anchor targets don't hide under the bar. */
const ANCHOR_OFFSET = -96;

/**
 * Motion runtime for the marketing pages. Renders nothing; it
 *  1. runs Lenis smooth scrolling on desktop only (tablet/phone keep native
 *     scrolling, as in the reference), and never under reduced motion;
 *  2. drives every `.mk-reveal` element: `is-in` is added once the element is
 *     10% into the viewport (so the motion is seen) and removed only when it
 *     is fully out of view, so reveals replay on every re-entry without ever
 *     vanishing on screen. Elements arriving in the same frame are staggered
 *     in reading order (`--mk-rd`, 70ms apart); one arriving alone starts at
 *     once. New nodes (route changes, accordions) are picked up by a
 *     MutationObserver.
 */
export default function MotionRoot() {
  const pathname = usePathname();

  // ── Lenis ────────────────────────────────────────────────────────────
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP);
    const reduced = window.matchMedia(REDUCED);
    let lenis: { destroy(): void } | null = null;
    let cancelled = false;

    const sync = async () => {
      const want = desktop.matches && !reduced.matches;
      if (want && !lenis) {
        const { default: Lenis } = await import("lenis");
        if (cancelled || lenis) return;
        lenis = new Lenis({ duration: 2, smoothWheel: true, autoRaf: true, anchors: { offset: ANCHOR_OFFSET }, stopInertiaOnNavigate: true });
      } else if (!want && lenis) {
        lenis.destroy();
        lenis = null;
      }
    };
    sync();
    desktop.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      cancelled = true;
      desktop.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      lenis?.destroy();
    };
  }, []);

  // ── scroll reveals ───────────────────────────────────────────────────
  useEffect(() => {
    // Reveal a batch in reading order, 70ms apart.
    const reveal = (els: Element[]) => {
      const arriving = els.filter((el) => !el.classList.contains("is-in")) as HTMLElement[];
      arriving.sort((a, b) => {
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return Math.abs(ra.top - rb.top) > 8 ? ra.top - rb.top : ra.left - rb.left;
      });
      arriving.forEach((el, i) => {
        el.style.setProperty("--mk-rd", `${revealStagger(i)}s`);
        el.classList.add("is-in");
      });
    };
    // In: 10% into the viewport…
    const enter = new IntersectionObserver((entries) => {
      reveal(entries.filter((e) => e.isIntersecting).map((e) => e.target));
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
    // …or fully on screen (the last rows of a page never get 10% in). Out:
    // only once fully off screen, so nothing disappears while visible.
    const exit = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (!e.isIntersecting) e.target.classList.remove("is-in"); });
      reveal(entries.filter((e) => e.intersectionRatio >= 0.99).map((e) => e.target));
    }, { threshold: [0, 1] });
    const seen = new WeakSet<Element>();
    const watch = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      enter.observe(el);
      exit.observe(el);
    };
    const scan = (root: ParentNode) => root.querySelectorAll(".mk-reveal").forEach(watch);
    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => {
        if (!(n instanceof Element)) return;
        if (n.classList.contains("mk-reveal")) watch(n);
        scan(n);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { enter.disconnect(); exit.disconnect(); mo.disconnect(); };
  }, [pathname]);

  return null;
}
