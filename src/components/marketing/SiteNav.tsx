"use client";
import { useCallback, useEffect, useState } from "react";
import { Link, usePathname } from "@/lib/router";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/marketing";
import { isInsideDarkZone } from "@/lib/motion";
import { useScrollFrame } from "./useScrollFrame";
import { WipeLink } from "./Links";
import { enter } from "./Type";
import PillButton from "./PillButton";
import MobileMenu from "./MobileMenu";
import AnimatedLogo from "./AnimatedLogo";

/** Past this scroll offset (px) the nav settles into its compact state. */
const SCROLLED_AT = 24;

/** Sections mark themselves dark with this attribute; the nav turns white over them. */
export const NAV_DARK_ATTR = "data-nav-dark";
/** Fired by sections whose darkness changes without a scroll (e.g. the hero toggle). */
export const NAV_ZONES_EVENT = "mk:nav-zones";

/**
 * Fixed marketing nav.
 *  · desktop (≥1200): transparent over the progressive blur, links in brand
 *    teal with an underline wipe, items staggered in on load after the logo
 *    (0.5 → 0.8s), and a smooth change to all-white while it sits over any
 *    section marked `data-nav-dark="true"` (the home hero before its toggle
 *    flips, the big quote, the footer);
 *  · tablet/phone: solid bar with the logo and a Menu/Close pill (text roll) that
 *    opens the full-screen menu;
 *  · everywhere: the animated logo (AnimatedLogo), which eases down to 88% once
 *    the page scrolls (the bar also lifts with a soft shadow on tablet/phone).
 */
export default function SiteNav() {
  const [onDark, setOnDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // The home page has no theme switch; the other marketing pages keep theirs.
  const showTheme = usePathname() !== "/";

  const evaluate = useCallback(() => {
    let dark = false;
    if (window.innerWidth >= 1200) {
      for (const el of document.querySelectorAll(`[${NAV_DARK_ATTR}="true"]`)) {
        const r = el.getBoundingClientRect();
        if (isInsideDarkZone(r.top, r.bottom)) { dark = true; break; }
      }
    }
    setOnDark(dark);
    setScrolled(window.scrollY > SCROLLED_AT);
  }, []);
  useScrollFrame(evaluate);
  useEffect(() => {
    window.addEventListener(NAV_ZONES_EVENT, evaluate);
    return () => window.removeEventListener(NAV_ZONES_EVENT, evaluate);
  }, [evaluate]);

  return (
    <>
      <header
        data-on-dark={onDark}
        className={cn("mk-nav fixed inset-x-0 top-0 z-[70] bg-ink-0 desk:bg-transparent", scrolled && "is-scrolled")}
      >
        <div className="mx-auto flex h-[69px] max-w-[1600px] items-center justify-between px-4 tab:h-[79px] tab:px-10 desk:h-20 desk:items-end desk:px-16">
          <Link to="/" aria-label="Orovion home" data-cursor="snap" className="mk-logo-link">
            <AnimatedLogo light={onDark} />
          </Link>

          {/* desktop */}
          <nav aria-label="Main" className="hidden items-center gap-12 desk:flex">
            <ul className="flex items-center gap-12">
              {NAV_LINKS.map((l, i) => {
                const e = enter(0.5 + i * 0.06);
                return (
                  <li key={l.href} className={e.className} style={e.style}>
                    <WipeLink
                      href={l.href}
                      className={cn("t-eyebrow transition-colors duration-500 ease-reveal", onDark ? "!text-white" : "!text-brand-600")}
                    >
                      {l.label}
                    </WipeLink>
                  </li>
                );
              })}
            </ul>
            <div className={cn("flex items-center gap-3", enter(0.8).className)} style={enter(0.8).style}>
              {showTheme && <ThemeToggle className={cn("mk-snap transition-colors duration-500", onDark && "!text-white hover:!bg-white/10")} />}
              <PillButton to="/login" size="sm" variant={onDark ? "light" : "brand"}>Join Orovion</PillButton>
            </div>
          </nav>

          {/* tablet + phone */}
          <div className="flex items-center gap-2 desk:hidden">
            {showTheme && <ThemeToggle className="mk-snap" />}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mk-mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className={cn("pill pill--sm pill--toggle w-[110px]", menuOpen && "is-open")}
              data-menu-toggle
            >
              {/* rolls from "Menu" to "Close" as the menu opens (globals.css "Text roll") */}
              <span className="pill__label" aria-hidden>
                <span className="pill__roll">Menu</span>
                <span className="pill__roll pill__roll--in">Close</span>
              </span>
              <span className="pill__dot pill__dot--a" aria-hidden />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
