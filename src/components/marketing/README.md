# components/marketing

Building blocks for the public marketing pages. Motion spec and inventory:
`docs/marketing-motion.md`. Placeholder content: `docs/marketing-placeholders.md`.

| Component | Role |
|---|---|
| `MarketingShell` | Page frame: skip link, `MotionRoot`, `BlurGradient`, `SiteNav`, `<main>`, `SiteFooter`. Wrap every public page in it. |
| `MotionRoot` | Lenis smooth scroll (desktop, not under reduced motion) and the shared `.mk-reveal` observers (reveal 10% in, batch stagger, reset only when fully out). Renders nothing. |
| `Cursor` | Custom cursor (mouse/trackpad only): dot + a trailing water blob that keeps changing shape and stretches as it moves, a frame that snaps around text links and buttons, label pills over cards. Modes come from `data-cursor` (see Rules). |
| `BlurGradient` | 220px progressive blur under the transparent desktop nav. |
| `SiteNav` / `MobileMenu` | Fixed nav (load stagger, white over dark blocks, compact once scrolled) and the full-screen tablet/phone menu. |
| `AnimatedLogo` | The inline wordmark with its entrance (ring turns into place, letters rise, the "i" dot drops, a sheen), a ring turn on hover, and smooth ink ⇄ white. |
| `SiteFooter` / `FooterBackdrop` | Full-viewport footer on the parallax brand scene. |
| `PillButton` | Text-roll pill (`variant` brand/light, `state` idle/loading/success). Link or button. The label is rendered twice (second copy `aria-hidden`) so it can roll; the menu toggle in `SiteNav` reuses the markup with `pill--toggle`. |
| `Type` | `Eyebrow`, `Display`, `Accent`, `enter(delay, from)` (desktop load entrance), `rise(delay)` (all screens), and `FillText` — big text whose letters fill with color on hover (used inside `Display`). |
| `Links` | `WipeLink` (underline wipe) and `SocialLinks`. |
| `Trust` | `AvatarStack` and `TrustBlock` (label, faces, rating). |
| `Accordion` / `FaqSection` | FAQ cards and the two-column FAQ band. |
| `ContactForm` | The `/contact` form (mailto hand-off). |
| `ContactSection` | Contact block: intro, sticky trust + `ReachUs`, form. `page` → `/contact` hero (h1, load entrances); otherwise a section (used at the end of `/`). |
| `ReachUs` | Email · phone · address line with the social icons. |
| `useScrollFrame` | rAF-throttled scroll/resize callback. |

### Inner pages

`ThreadHero` is the shared hero of `/about` and `/services`: a two-line
headline, side note and indented intro, with two long threads that draw in
on load and drift on scroll (`flip` mirrors them). The threads alone are
`LongThreads` (also behind journal articles).

### `about/` — the `/about` page

| Component | Role |
|---|---|
| `HowWeHelp` | Full-bleed sky photo with a scroll-lit statement. |
| `Founders` | "Meet our founders" story in a narrow column (the reference portrait + quote is left out). |
| `TeamCards` | One blob-photo card per team member with focus areas and "Read more" → `/team/[slug]`. |

The rest of the page reuses `Statement` / `QuoteDome` (from `home/BigQuote`),
`Ready`, `Story` and `FaqSection`.

### `services/` — the `/services` page

| Component | Role |
|---|---|
| `ServiceSections` | One full-bleed photo section per service (`id` = slug, the target of the home cards' "Read more"), with one thread drawn through all of them. |

The rest of the page reuses `ThreadHero`, `Numbers` (`plain`), `Story`,
`FaqSection` and `ContactSection`.

### `journal/` — `/journal` and `/journal/[slug]`

| Component | Role |
|---|---|
| `ArticleCard` | One article as a blob-photo card: tag, title, excerpt, "Read more" pill. Used on `/journal` and under articles. |
| `ArticleBody` | Pinned blob photo (with the long threads behind) beside the article: kicker, title, lede, date, sections, pull quote, signature, education note. |
| `MoreInsights` | "More insights for you." — the other articles as `ArticleCard`s. |

`/journal` itself (`screens/Journal.tsx`) is `ThreadHero` + every
`ArticleCard` + `Ready`.

Articles live in `src/lib/journal.ts`; adding one there publishes its page,
its card on the home page and its sitemap entry.

### `home/` — the `/` page (order as on the page)

| Component | Role |
|---|---|
| `ThreadWaves` | Fixed background thread layer; fades in/out between two section ids. |
| `HeroSequence` | Hero + trust toggle: pinned stage, portrait fade, scroll-drawn thread, word-by-word headline, the dot → switch → on sequence. |
| `Services` | `#features` — four photo cards with parallax and a hover "Read more" that opens the service's section on `/services`. Desktop: they ride a scroll-driven wheel (pinned stage); tablet/phone: a snap carousel with dots; every card tilts toward the pointer (Althea reference; math in `motion.ts` `WHEEL`, `wheelRotation`, `cardTilt`). |
| `Philosophy` | Scroll-lit statement (`ScrollWords`). |
| `Story` | Text + two overlapping parallax photos; `flip` mirrors it. |
| `HowItWorks` | `#how-it-works` — big title, steps, sticky odometer number. |
| `Ready` | Join CTA with trust block and `ReachUs`. |
| `BigQuote` | Statement band, then the full-bleed quote with the dome reveal and a thread. Exports `Statement` and `QuoteDome` separately (content as props) for other pages. |
| `Community` | `#community` — three blob-shaped journal cards; "Read more" opens the article at `/journal/[slug]`. |
| `Numbers` | Statement + count-up `STATS`. |
| `ScrollThread` | SVG strokes that draw themselves on scroll (`pathLength=1` + dash offset, smoothed). |
| `ParallaxImage` | Image that drifts inside its frame on scroll (`intensity` px), optional grain. |
| `BlobPhoto` | Photo in an organic blob shape with a faint rotated outline (community posts, team cards). |
| `TextEffects` | `BlurWords` (load, word by word; `fill` adds the letter fill, used on the hero headline) and `ScrollWords` (scroll-lit words, letters fill too). Both are screen-reader safe. |

Rules:

- Colors come from theme tokens only (`brand-*`, `ink-*`, `surface`), so dark
  mode and Appearance accent changes keep working.
- Literal white is used only over surfaces that are always dark: the footer,
  the home hero stage and the big quote.
- Mark any such block with `data-nav-dark="true"` so the desktop nav turns
  white over it. If a block turns dark or light without a scroll, dispatch
  `NAV_ZONES_EVENT`, as `HeroSequence` does.
- Cursor modes:
  - Links and buttons styled `.pill`, `.ul-wipe`, `.link-u`, `.soc` or `.chip`
    get the snap frame automatically.
  - For anything else that should snap, add `data-cursor="snap"`, or the
    `mk-snap` class if the component only takes a `className`.
  - A card that opens something gets `data-cursor="<Verb>"` for a label
    pill, e.g. `"Read"`.
