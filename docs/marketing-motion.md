# Marketing pages: layout & motion system

Applies to the public site only: `/`, `/about`, `/services`, `/journal`, `/journal/[slug]`, `/contact`, `/team`, `/team/[slug]`,
`/mobile-app`, `/help`, `/privacy`, `/terms`. The logged-in app (`/app/*`) keeps
its own 150–340ms motion rules from `DESIGN.md`/`PRODUCT.md`.

The values below were measured from a reference site in a real browser (WAAPI
timings, per-frame sampling) and rebuilt on Orovion's design tokens.

## Where things live

| Piece | File |
|---|---|
| Motion tokens, classes (`mk-*`, `t-*`, `pill`, `ul-wipe`, `link-u`, …) | `src/app/globals.css` (section "Marketing pages") |
| Breakpoints `tab` 810 / `desk` 1200 / `wide` 1600, easing utilities | `tailwind.config.js` |
| Pure math (parallax, nav swap, thread drawing, scroll text, toggle state, smoothing) — unit-tested | `src/lib/motion.ts` |
| Copy, numbers, people, photos (placeholders) | `src/lib/marketing.ts` → see `docs/marketing-placeholders.md` |
| Contact form options + `mailto:` builder — unit-tested | `src/lib/contact.ts` |
| Components | `src/components/marketing/` (see its README) |

## Tokens

| Token | Value | Used for |
|---|---|---|
| `--ease-load` | `cubic-bezier(.2,0,.2,1)` | page-load entrances (1s) |
| `--ease-reveal` | `cubic-bezier(.44,0,.56,1)` | focus (0.3s), link underline (0.4s), color swaps, menu close |
| `--ease-spring` | `linear(…)` sampled spring, fallback `cubic-bezier(.3,.525,.05,1)` | hovers 0.4/0.6s, FAQ 0.8s, button states, menu open |
| `--ease-premium` | `cubic-bezier(.16,1,.3,1)` — long, soft deceleration | scroll reveals, hero rise, card/button lifts, portrait settle, focus line |
| `--ease-settle` | `linear(…)` spring (damping .72, ~4% past the target), fallback `cubic-bezier(.3,1.25,.5,1)` | the logo's landing and the "i" dot |

Tailwind: `ease-load`, `ease-reveal`, `ease-spring`. Movement is small by
design: 2–4px lifts, 20–40px slides, 0.94–1.12 scales.

## Inventory

| Element | Trigger | Motion | Duration / delay | Breakpoints |
|---|---|---|---|---|
| Logo | load | see "Logo" below | ~2.4s from 0.15s | all |
| Logo | scroll past 24px | eases down to 88% | 0.7s `--ease-premium` | all |
| Nav links | load | fade + rise 20px | 1s, 0.5 → 0.74s (+0.06 each) | desktop only |
| Theme toggle + CTA | load | fade + rise 20px | 1s, 0.8s | desktop only |
| Nav bar | scroll past 24px | hairline + soft shadow under the solid bar | 0.5s | tablet + phone |
| Page eyebrow | load | fade + **drop** from −20px | 1s, 0.4s | desktop only |
| H1 | load | fade + rise 20px | 1s, 0.4s | desktop only |
| Intro paragraph | load | fade + rise 20px | 1s, 0.6s | desktop only |
| Right column (form / photo) | load | fade only | 1s, 0.6s | desktop only |
| Reach-us column / floating cards | load | fade + rise 20px | 1s, 0.8 / 1.0s | desktop only |
| Everything with `.mk-reveal` | 10% into the viewport (or fully on screen) | fade + rise 28px; a section can pick left / right (40px, 24px on phones), zoom (0.94 → 1) or fade — see "Scroll reveals" | 0.9s opacity, 1.1s move, `--ease-premium`; batch stagger 70ms | all |
| `.mk-reveal` | fully out of view | snaps back (replays on re-entry) | instant | all |
| Large story photo (`.mk-mask`) | enters viewport | rounded window opens from a 9%/7% inset while the photo settles from 1.14 | 1.4s / 1.8s `--ease-premium` | all |
| Smooth scroll (Lenis) | wheel | `duration: 2` | — | desktop only |
| Progressive blur strip | static, 220px | 8 backdrop-blur layers 0.16 → 20px | — | desktop only |
| Sticky columns | scroll | `position: sticky; top: 160px` | — | tablet + desktop |
| Footer scene parallax | scroll | `translateY` 0 → 320px (tablet 160) | linear | tablet + desktop |
| Depth layers (`data-depth="N"`, site-wide) | scroll | one rAF loop in `MotionRoot` moves each tagged element N px over its pass (`depthOffset`: +N entering → 0 centred → −N leaving; positive rises faster than the page, negative lags), measured on its parent or the nearest `[data-depth-frame]` (pinned content). Sets `translate`, so it sits on wrappers, never on `.mk-reveal` elements; promoted to its own GPU layer (`will-change`) | linear in scroll (Lenis-smoothed on desktop) | desktop full, tablet half (`depthScale`), phones off |
| Blob photos (`BlobPhoto`: community posts, team cards, journal cards, article photo) | scroll | the photo drifts as a far layer inside the blob (−24px; the article's pinned photo −32px over the whole read) while the faint outline drifts the other way (+14px), so the outline seems to slide around the shape | depth layers | desktop, tablet (half) |
| Staggered card columns | scroll | the lower middle card rises faster than its neighbours (+40px: home Community, About team cards); on /journal and "More insights" the right-hand column rises faster (+48px) | depth layers | desktop, tablet (half) |
| Team profile card (/team, /team/[slug]) | scroll | cover art lags (−12px), the avatar floats forward (+10px), measured over the member's whole story (the card is sticky) | depth layers | desktop, tablet (half) |
| Nav → white over dark blocks | a `data-nav-dark="true"` block (footer, home hero stage, big quote) spans the 44px line | link and logo colors change smoothly | 0.5s | desktop only |
| Pill button | hover / keyboard focus | text roll (Althea reference): the label slides up out of the pill (one pill height) and fades while an identical copy rises from below into its place; the fade trails the move; leaving reverses it. The pill itself stays put; light pills also turn the label brand. | 0.7s `--ease-premium` (~95% of travel by 0.35s), fade 0.55s | hover: pointer devices; focus: all |
| Pill button | press | 0.97 scale | 0.12s | all |
| Menu toggle (tablet/phone) | open / close | the same roll, from "Menu" to "Close" and back | 0.7s `--ease-premium` | tablet + phone |
| Cards (`.mk-lift`: community posts, team cards) | hover | lift 4px (+ soft shadow, photo zoom 1.04 where set) | 0.6s / 0.9s `--ease-premium` | pointer devices |
| FAQ card | hover | border tints brand, soft shadow | 0.5s | pointer devices |
| Pill button | submit | right dot → 31px disc with spinner | 0.6s; spin 1s linear | all |
| Nav / sitemap link | hover | 1px underline wipes in from left, out to right | 0.4s spring | pointer devices |
| Inline text link | hover | underline fades in, offset 8px → 5px | 0.4s | all |
| Social icon | hover | opacity → 0.5 | 0.6s spring | pointer devices |
| FAQ card | click | height, answer fade, icon −135° | 0.8s spring | all |
| Form field | focus | a 2px brand line grows in from the left along the underline | 0.7s `--ease-premium` | all |
| Checkbox | check | fill + tick fade | 0.3s | all |
| Mobile menu | open | sheet drops (0.6s spring) → content fades in (+0.2s) → links rise one by one (0.4 → 0.9s, 1s each) | — | tablet + phone |
| Mobile menu | close | content fades (0.6s) → sheet lifts after 0.2s | — | tablet + phone |

## Logo

`AnimatedLogo` inlines the wordmark (`public/brand/wordmark-*.svg`) in
`currentColor`, so its parts can move. It also lets the nav change it from
ink to white with a smooth color transition.

Entrance, on every screen size (all from page load):

| Part | Motion | Timing |
|---|---|---|
| Whole wordmark | from 92%, 8px blur and 20px left, landing on `--ease-settle` | 1.3s from 0.15s |
| Ring mark (the segmented first "o", 3 arcs 120° apart) | turns one notch (−120° → 0) while growing from 0.6; it is 3-fold symmetric, so it lands exactly as drawn | 1.5s from 0.2s |
| Letters r-o-v-i-o-n | rise 80 units (~10px) and fade | 1s each from 0.38s, +0.05s apart |
| Dot of the "i" | drops in from above onto its stem | 0.9s `--ease-settle` from 0.72s |
| Sheen | a soft teal band crosses the letters once | 1.3s from 1.3s |

After the entrance:

- **Hover:** the ring turns one more notch, always forward.
- **Scroll:** past 24px the logo eases to 88%.
- **Reduced motion:** the logo is static.

## Scroll reveals

- **Default:** `.mk-reveal` fades in and rises 28px.
- **Direction:** a section (any ancestor) picks the direction for everything
  inside it:

  | Class | Motion |
  |---|---|
  | `.mk-from-left` / `.mk-from-right` | 40px slide (24px on phones) |
  | `.mk-from-zoom` | 0.94 → 1 |
  | `.mk-from-fade` | fade only |
  | `.mk-mask` | opens a large photo from an inset window |

- **On the home page:** Ready, the
  statement, Numbers, FAQ and Contact bring the left column from the left
  and the right column from the right; cards and steps rise.
- **Stagger:** reveals arriving in the same frame are staggered in reading
  order, 70ms apart and capped at the 7th (`revealStagger`). One arriving
  alone starts at once.
- **No conflicts:** reveals use the individual `translate` / `scale`
  properties, and hover lifts use `transform`, so the two never fight.

## Home page (`/`)

Section order follows the reference home page: hero → trust toggle →
services → philosophy → how it works → ready → statement + big quote
→ community → numbers → get the app → FAQ → contact. Components live in
`src/components/marketing/home/`; copy and photos come from `HOME` in
`src/lib/marketing.ts`.

> The **numbers** section is currently switched off everywhere: commented out
> in `src/screens/Landing.tsx` (import and element) and removed from
> `/services`. Uncomment both lines on the home page to bring it back.

Scroll-linked values are written straight to the DOM from one rAF-throttled
scroll frame (`useScrollFrame`). React never re-renders per frame; only the
toggle's three states go through React state.

| Element | Trigger | Motion | Duration / easing | Breakpoints |
|---|---|---|---|---|
| Hero backdrop | load | fade in, so the white logo and headline animate over color | 0.4s | all |
| Hero rings | load | fade in | 2s after 0.2s | all |
| Portrait | load | fade in 1.4s while settling from a slight zoom (1.12 → 1.03) | 2.8s `--ease-premium`, from 0.1s | all |
| Portrait / rings | mouse move | portrait drifts up to 10px against the pointer, rings up to 16px with it (depth); eased τ 450ms | — | mouse/trackpad |
| Hero stage | scroll | pinned (`sticky`) behind the hero and the toggle | — | all |
| Portrait | scroll | opacity 1 → 0 over the hero's height, uncovering the brand backdrop | linear | all |
| Headline | load | word by word: blur 10px → 0, rise 10px, fade | 1.6s `--ease-reveal`, from 0.3s, +0.08s per word | all |
| Headline letters | hover | letter fill — see "Letter fill" below | 0.45s | mouse/trackpad |
| Paragraph / CTA | load | fade + rise 24px (`rise()`) | 1.1s `--ease-premium`, at 0.8s / 0.95s | all |
| Paragraph + CTA | scroll | lag the page (move at 70% speed) | — | desktop |
| Hero thread | scroll | two strokes draw (`stroke-dashoffset` 1 → 0) from "box top at 50% of the screen" to "box bottom at 50%"; smoothed (τ 150ms) | — | tablet + desktop |
| Hero thread | load / toggle wakes / back to start | fade in / out / in | 2s after 0.4s / 0.8s / 1.2s `cubic-bezier(.6,0,.4,1)` | tablet + desktop |
| Trust toggle | a marker crosses mid-screen | 2px dot → switch "off" → "on": track grows, knob 58 → 88 → 112px | 1.2s spring (track color 0.8s) | all |
| Hero stage | toggle on / off | fades out; the nav returns to its normal colors | 1.2s / 0.8s spring | all |
| Toggle copy | toggle on | "before" fades out; "after" fades in | 0.3s; 0.6s after 0.4s, `--ease-reveal` | all |
| Service cards — wheel (Althea reference) | scroll | the section slides 44vh up under the trust headline; a 220vh track pins a 100vh stage while that headline is still on screen. The four cards ride the top of a big wheel (radius 139vw, top at 52% of the stage), 13° apart and tilted along the curve: the first peeks in at 22° (right edge), each stands upright in the middle in turn, and the pin ends with the last one 8° left of centre; before and after the pin the wheel keeps turning at the same rate (≈6.4°/100px at a 900px screen). Linear in scroll, smoothed by Lenis. Cards ~360×480 (`min(25vw·4/3, 62vh)` tall) | — | desktop (≥1200, motion allowed) |
| Service cards — carousel | swipe / dot | horizontal scroll that snaps card by card (1 per view on phones, 2 on tablet); dots follow and jump; all four simply sit in a row on desktop with reduced motion | native snap; dot jump smooth | phone, tablet, desktop + reduced motion |
| Service card | pointer move | 3D tilt toward the pointer: the corner nearest it comes forward, up to 20° at the edges (500px perspective), measured in the card's own frame on the wheel; flat again on leave. Replaces the old 4px lift | 0.4s `--ease-premium` (≈0.25s to catch up) | mouse/trackpad, motion allowed |
| Service card (keyboard) | focus | on the wheel, the page scrolls so the focused card stands upright in the middle | instant | desktop |
| Service card photos | scroll | layer 200px taller than the card, `translateY` −200 → 0 while the card crosses the screen | linear | all |
| Service card | hover | "Read more" + dot fade in | 0.6s spring | pointer devices |
| Philosophy text | scroll | words light up 0.2 → 1 in reading order as the block rises from the screen bottom to 25% from the top; smoothed (τ 90ms) | — | all |
| Get the app — thread | scroll | two strands (main 2px + echo 1.25px at 45%) enter from the page's left edge behind the copy, curl once and trace a phone (screen + bezel) clockwise; drawn from "stage top at 85% of the screen" to "stage bottom at 98%"; smoothed (τ 150ms); the camera pill draws over the last 6% | — | all |
| Get the app — phone | outline closes (progress ≥ 0.985; resets below 0.9) | body fills with the surface colour (+ soft drop shadow), then its content rises 14px + scales .96 → 1 and fades in, 0.1s apart: QR card ("Scan to get Orovion") on mouse/trackpad screens, app icon + "Get the app" pill on touch screens | 0.8s fill; 0.9s `--ease-premium` | all |
| Get the app — copy | enters viewport | eyebrow, headline (letter fill), text, badges, facts rise, staggered | 1.1s `--ease-premium` | all |
| Get the app — depth parallax | scroll | three depths over the section's pass (`depthOffset`, centred: +range entering → 0 centred → −range leaving): copy moves with the page; phone + thread (near) +36 → −36px, so they rise a little faster; faint rings behind the phone (far, the hero's motif) −56 → +56px, so they lag | linear in scroll (Lenis-smoothed on desktop) | all |
| Get the app — mouse depth | pointer move (while on screen) | the phone leans up to 10/7px against the pointer, the rings 16/11px with it | eased τ 450ms | mouse/trackpad |
| Story photos | scroll | main photo parallax 120px, inset 80px | linear | all |
| Thread waves (fixed layer) | scroll | fade in as How It Works enters, out as the big quote enters | linear | all |
| How It Works number | scroll | sticky "0" + a rolling digit; the last step whose top passed 60% of the screen sets it | 0.8s `cubic-bezier(.6,0,.4,1)` | tablet + desktop (phones show inline numbers) |
| Big quote | scroll | dome reveal `clip-path: ellipse(rx 100% at 50% 100%)`, rx = 60% + 200%·t² while its top moves from the screen bottom to the top; photo parallax 300px; thread draws | linear | all (thread tablet + desktop) |
| Community photos | hover | scale 1 → 1.06 | 1.2s spring | pointer devices |
| Numbers | enters viewport | count up | 1.6s | all |

Building blocks: `ScrollThread` draws any SVG paths on scroll. It uses
`pathLength={1}`, so dash values are 0–1 whatever the path length; give it
new `d` strings to change a thread's shape. `ParallaxImage` takes
`intensity` in px. `BlurWords` and `ScrollWords` handle the two text effects.
The reference drives its hero thread with GSAP ScrollTrigger (scrub 0.5).
Here the same curve comes from the exponential smoothing in `smoothToward`,
so no GSAP dependency is needed.

## Cursor

Measured from a second reference site and rebuilt on Orovion's tokens.

- **Where it runs:** devices with a mouse or trackpad only (`(hover: hover) and
  (pointer: fine)`). It is off under reduced motion.
- **Scope:** `MarketingShell` mounts it, so `/app` and `/login` keep the
  native cursor.
- **Code:** `src/components/marketing/Cursor.tsx`; the springs and frame math
  are in `src/lib/motion.ts` (unit-tested).

| Part | Behavior | Values |
|---|---|---|
| Dot | pinned to the pointer | 4px, `--tx-brand-600`, 1px ring in the page color (so it reads on brand fills) |
| Water blob | an irregular outline that never stops changing shape; trails the pointer and inverts what it passes over (`mix-blend-mode: difference`); plain white over `data-nav-dark` blocks | ~36px, 1px line; 6 points whose radii follow layered sines (periods 1.6–4.2s, golden-angle phases) ±20%; follow spring 220 / 26 / mass 0.6, so no overshoot and ~90% of a jump in 0.26s |
| Blob in motion | stretches along its direction of travel (area kept), gets more irregular (up to ±34%), jiggles once it stops | stretch up to +35%: `0.35 · (1 − e^(−speed/1500))`; wobble spring 260 / 14 |
| Blob over a link or button | grows | ×1.5; shape spring 380 / 26 (~6% bounce) |
| Snap (text links, buttons) | glides to the element's center and becomes a frame around it; the blob shrinks to ×0.4 and fades | 5px outside every edge, radius = element radius + 5 (at most a pill); shape spring |
| Snap target resizes (FAQ card opening) | the frame follows, even with a still pointer | ResizeObserver |
| Label (cards) | brand pill 20px right of and below the pointer | scale 0.4 → 1 + fade; shape spring |
| Text fields | the custom cursor steps aside; the native I-beam shows | — |
| Pointer leaves the window | fades out, back in on the next move | 0.3s |

Which mode an element gets:

- **Snap by default:** `.pill`, `.ul-wipe`, `.link-u`, `.soc`, `.chip` and
  `.mk-snap`. Use `.mk-snap` for components that only take a `className`,
  such as `ThemeToggle`.
- **`data-cursor="snap"`:** frames that element, e.g. a whole FAQ card or team
  row. A snap-styled control inside it keeps its own frame.
- **`data-cursor="<Text>"`:** shows that label. Current labels: service
  cards "Explore", community posts "Read", team cards "View".
- **`data-cursor="native"`:** hides the custom cursor over that area.
- **Any other link or button:** the ring grows.

## About page (`/about`)

The section order follows the reference about page:

1. Hero with long threads
2. The way we help
3. Founders
4. Team cards
5. Statement
6. Ready
7. Big quote
8. Story
9. FAQ

Components live in `src/components/marketing/about/`. The hero is the
shared `ThreadHero`. The statement, quote, story, ready and FAQ sections
reuse the home components (`Statement` / `QuoteDome` from
`home/BigQuote.tsx`, `Story`, `Ready`, `FaqSection`).

| Element | Trigger | Motion | Duration / easing | Breakpoints |
|---|---|---|---|---|
| Hero threads (two long thin lines, `.mk-draw`) | load | draw themselves in (`stroke-dashoffset` 1 → 0) | 2.8s `--ease-premium`, from 0.2s / 0.45s | all |
| Hero threads | scroll | drift up at 25% of the scroll, so the header gains depth | — | desktop |
| Headline | load | word by word, blur → sharp (`BlurWords`), first line in the brand color | from 0.3s / 0.5s | all |
| Side note, eyebrow, intro | load | rise 24px + fade (`rise()`) | at 0.8s / 1s / 1.1s | all |
| "The way we help" | scroll | sky photo parallax 180px; words light up one by one (`ScrollWords`); the nav turns white | — | all |
| Team cards | enters viewport / hover | rise, staggered; lift 4px, photo zoom 1.06 | — | all / pointer |
| Big quote | scroll | dome reveal + thread, as on the home page | — | all |

Every big heading and quote has the letter fill.

## Services page (`/services`)

The section order follows the reference services page:

1. Hero (`ThreadHero`, threads mirrored)
2. Four stories, one per service in the home card order (Clinical Cases,
   Medical Pulses, Research & Thesis, Private Consults), photos alternating
   right → left → right → left (`flip` on every second; the shared `Story`
   section, as on /about). Each story's id is its service slug, so a home
   card's "Read more" (`/services#clinical-cases` …) lands right on it.
3. FAQ
4. Contact

(The reference's pricing section, its four full-bleed service sections and
the numbers band were left out on purpose.) Content comes from
`SERVICES_PAGE`; every section reuses shared components, so its motion is
described with them (hero threads, Story, FAQ, Contact).

## Journal page (`/journal`)

The section order follows the reference journal page: `ThreadHero`
("Insights That Matter.") → every article as an `ArticleCard` (blob photo,
title, excerpt, "Read more"), two to a row, rising in staggered → `Ready`.
The home page's "Insights for sharper thinking" CTA opens it.

## Journal articles (`/journal/[slug]`)

The section order follows the reference journal article: the article (a
pinned photo beside the text) → more insights → FAQ. The home page's
community cards open these on "Read more". Content lives in
`src/lib/journal.ts`; components in `src/components/marketing/journal/`.

| Element | Trigger | Motion | Duration / easing | Breakpoints |
|---|---|---|---|---|
| Long threads behind the photo | load / scroll | draw in; drift at 25% of the scroll | 2.8s | tablet + desktop |
| Photo (organic blob) | load / scroll | rises in; stays pinned (`sticky`, 150px) while the article scrolls, leaves with it | 1.1s `rise()` | tablet + desktop pin |
| Icon + kicker, title, lede, date | load | rise in, staggered | 0.2 → 0.55s `rise()` | all |
| Section headings and paragraphs | enters viewport | fade + rise, batch stagger; headings have the letter fill | 1.1s | all |
| Pull quote | enters viewport | slides in from the right; letter fill | 1.1s | all |
| More-insights cards | enters viewport / hover | rise; photo zoom 1.06, lift | — | all / pointer |

## Letter fill

After the "b" reference wordmark. While the pointer is over a letter of a
heading or other big text, color rises inside that letter from the bottom
(0.45s, `cubic-bezier(.22,1,.36,1)`). It drains when the pointer leaves.
Mouse and trackpad only: touch screens keep plain text.

- **Where:** every `Display` heading, plus the hero headline, the
  trust-toggle text, the big quote and its statement heading, How It Works
  (title and step titles), the Philosophy text, the service card titles and
  the footer heading. Numbers that count up are left out.
- **How:** `FillText` (in `Type.tsx`) splits text into plain inline letter
  spans, so words keep their kerning, and gives screen readers the sentence
  once. Each letter paints two text-clipped backgrounds: the fill over its
  own color (`currentColor`).
- **Colors:**

  | Text | Fill |
  |---|---|
  | ink text | `--brand-500` (`--brand-400` in dark mode) |
  | teal accent words (`<Accent>`, `.mk-accent`) | `--ink-900` |
  | on always-dark blocks (`data-nav-dark`, `.mk-on-dark`) | `--brand-400`; accent words fill white |

- **New big text:** wrap it in `<FillText>`. It only splits text-level
  content; a heading containing a link is left as is.

## Using it on a new section

```tsx
import { Accent, Display, Eyebrow, enter } from "@/components/marketing/Type";

const e = enter(0.4);                     // load entrance, desktop only
<Display as="h1" className={e.className} style={e.style}>Title <Accent>accent.</Accent></Display>

<p className="mk-reveal t-body text-ink-600">Fades in and rises on scroll.</p>
<div className="mk-from-left">…reveals inside slide in from the left…</div>
<a className="mk-lift mk-lift--shadow">…card lifts on hover…</a>
<div className="mk-split">…left…/…right…</div>   // 6/1/5 desktop, 3/1/4 tablet, stacked phone
<section className="mk-section">…</section>      // 160 / 120 / 80px vertical rhythm
```

## Accessibility

- `prefers-reduced-motion: reduce` → no Lenis, no load entrances (the logo is
  static), no parallax or mouse depth, reveals shown immediately with no
  movement (plus the global reduced-motion rule). The "Get the app" phone is
  drawn in full with no depth or mouse parallax, and no `data-depth` layer
  moves anywhere (they are also off on phones). Pill labels crossfade in
  place instead of rolling (`--pill-roll: 0`). The home service wheel is not
  pinned or turned: the cards sit in a plain row (a snap carousel on smaller
  screens) and never tilt.
- Reveals only hide content when JS runs (the `.js` class is set pre-paint).
- FAQ items are real buttons with `aria-expanded`/`aria-controls`; the mobile
  menu is `inert` when closed, locks scroll, closes on Esc and restores focus.
- Form fields have visually hidden labels; focus is visible on every control.
- Cursor: decorative only. Its layers are `aria-hidden` and never take
  pointer events. Keyboard focus rings are unchanged, and it is off for touch
  input and reduced motion.
- Home: under reduced motion, threads are drawn in full, every word is visible,
  and there is no parallax or copy lag; the toggle still switches instantly.
  `ScrollWords` keeps a screen-reader copy of the full sentence (the lit-up
  word spans are `aria-hidden`). The toggle is a real link to `#verified-on`,
  and threads and waves are `aria-hidden`.
