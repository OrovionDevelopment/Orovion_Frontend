# Marketing placeholder content — replace before launch

Everything below is illustrative. Nothing here is real data about Orovion's
users, ratings or numbers.

## Copy & numbers (`src/lib/marketing.ts`)

| Constant | What it is |
|---|---|
| `STATS` | 12,000+ clinicians, 40+ specialties, 180k case discussions, 24/7 consults (the Numbers band — not shown anywhere right now) |
| `HOME.quote` | quote from "Dr. Arjun Malhotra" — invented person |
| `HOME.community.posts` | three sample posts — titles and teasers are invented; they link to the feed, not to real posts |
| `HOME.hero`, `.trust`, `.services`, `.philosophy`, `.how` (`STEPS`), `.ready`, `.statement`, `.numbers` | product copy — adjust to taste |
| `ABOUT.founders`, `ABOUT.statement`, `ABOUT.quote` | about-page copy — the founder story wording, the statement and the quote ("The Orovion team") are drafts to confirm |
| `ABOUT.story` | about-page story — "Ravi" and his mother are invented people |
| `SERVICES` | the four services: the home card wheel (product description — check every feature claim) |
| `HOME.app` | home "Get the app" copy — the three facts ("Free to join", "iOS & Android", "Verified clinicians only") are claims to confirm. The QR encodes `SITE_URL` + `/mobile-app` and the badges/button go there too, until the store listings exist (then set the store URLs in `src/screens/MobileAppPage.tsx`). If `SITE_URL` changes length, re-check `QR_SIZE` in `GetApp.tsx` (5px per module) |
| `SERVICES_PAGE.stories` | the four services-page stories, one per service — "Dr. Ananya Mehra" (cases), "Priya" (Pulses), "Arjun" (research) and "Meera" (second-opinion consult) are invented people |
| `JOURNAL` (`src/lib/journal.ts`) | three journal articles (ECG, case discussions, biomarkers) behind the home "Read more" cards — written to be generally accurate but **not clinically reviewed**; dates and "The Orovion editorial team" byline are placeholders. Have a clinician review them, or replace them, before launch |

`/about` reads from `ABOUT`, plus the real founders in `src/lib/team.ts`: the
three team cards, each linking to its member page.

The home page (`/`) reads everything from `HOME`; section order and motion
are described in `docs/marketing-motion.md` ("Home page").

Only show ratings, counts and quotes you can substantiate.

Real data already in use: contact email/phone/address (`src/lib/contact.ts`),
social links (`SOCIALS`), the team (`src/lib/team.ts`), FAQ answers
(`src/lib/faq.ts`).

## Photos (`/public/marketing`)

Free images from Unsplash (Unsplash License — free for commercial use, no
attribution required). Swap any file by keeping the same name, or change the
path in `src/lib/marketing.ts`.

| File | Used for | Unsplash photo id |
|---|---|---|
| `hero-portrait.jpg` | home hero, tablet + desktop (2400×1600) | 1614608682850-e0d6ed316d47 |
| `hero-portrait-tall.jpg` | home hero on phones (1000×1700, same photo) | 1614608682850-e0d6ed316d47 |
| `service-cases.jpg` | "Clinical Cases" card | 1550831107-1553da8c8464 |
| `service-pulses.jpg` | "Medical Pulses" card | 1576086213369-97a306d36557 |
| `service-research.jpg` | "Research & Thesis" card | 1559757175-5700dde675bc |
| `service-consults.jpg` | "Private Consults" card | 1576091160399-112ba8d25d1d |
| `story-a-main.jpg` | **unused** since the home stories were removed — safe to delete | 1666214280557-f1b5022eb634 |
| `story-a-detail.jpg` | **unused** (as above) — safe to delete | 1612531386530-97286d97c2d2 |
| `story-b-main.jpg` | **unused** (as above) — safe to delete | 1584515933487-779824d29309 |
| `story-b-detail.jpg` | **unused** (as above) — safe to delete | 1631815588090-d4bfec5b1ccb |
| `quote-theatre.jpg` | big quote (full-bleed, dome reveal) | 1504813184591-01572f98c85f |
| `journal-heart.jpg` | community post 1 | 1530026405186-ed1f139313f8 |
| `journal-brain.jpg` | community post 2 | 1559757148-5c350d0d3c56 |
| `journal-lab.jpg` | community post 3 | 1581594693702-fbdc51b2763b |
| `about-help.jpg` | about: "The way we help" background (grey-blue clouds) | 1517685352821-92cf88aee5a5 |
| `about-quote.jpg` | about: big quote (dark clouds, warm light) | 1504608524841-42fe6f032b4b |
| `about-story-main.jpg` | about: story, large photo | 1631217868264-e5b90bb7e133 |
| `about-story-detail.jpg` | about: story, inset photo | 1622253692010-333f2da6031d |
| `svc-cases.jpg`, `svc-pulses.jpg`, `svc-research.jpg`, `svc-consults.jpg` | **unused** since the /services full-bleed sections were removed — safe to delete | same ids as `service-*.jpg` |
| `svc-story-main.jpg` | services story 2 (Pulses), large photo | 1527613426441-4da17471b66d |
| `svc-story-detail.jpg` | services story 2, inset photo | 1581595219315-a187dd40c322 |
| `svc-story-research-main.jpg` | services story 3 (research), large photo — cropped to the two faces | 1666214280391-8ff5bd3c0bf0 |
| `svc-story-research-detail.jpg` | services story 3, inset photo | 1609188076864-c35269136b09 |
| `svc-story-consult-main.jpg` | services story 4 (consult), large photo | 1612349317150-e413f6a5b16d |
| `svc-story-consult-detail.jpg` | services story 4, inset photo | 1576091160550-2173dba999ef |
| `svc-story-cases-main.jpg` | services story 1 (cases), large photo | 1579684385127-1ef15d508118 |
| `svc-story-cases-detail.jpg` | services story 1, inset photo — cropped to the scans | 1588776814546-1ffcf47267a5 |
| `avatar-1.jpg` … `avatar-5.jpg` | **unused** since the trust block was removed — safe to delete | in order: 1438761681033-6461ffad8d80, 1500648767791-00dcc994a43e, 1494790108377-be9c29b29330, 1507003211169-0a1dd7228f2d, 1580489944761-15a19d654956 |
| `avatar-6.jpg` … `avatar-8.jpg` | **unused** — safe to delete | 1506794778202-cad84cf45f1d, 1544005313-94ddf0286df2, 1472099645785-5658abf4ff4e |

(Each id resolves as `https://images.unsplash.com/photo-<id>`.)

Recommended replacements — real (consented) photos of Orovion clinicians and
users, at least:

- **Hero:** 2400×1600 landscape with the person in the right half. From
  tablet up the photo covers the right ~80% and fades out to the left under
  the headline. Also supply a 1000×1700 portrait crop for phones.
- **Service cards:** 1000×1100. The card shows a moving window of the photo,
  so leave headroom above and below the subject.
- **Stories:** 1400×1600 for the main photo and 900×1100 for the inset.
- **Big quote:** 2400×1500, darkened under the white quote text.
- **Community:** 1000×1000. These are cropped to soft blob shapes, so keep the
  subject centered.
- **Avatars:** 192×192 square.

## Form

`/contact` opens the visitor's email app pre-filled to `hello@orovion.com`
(no public contact API exists). When a backend endpoint is added, replace the
`window.location.href = buildContactMailto(...)` hand-off in
`src/components/marketing/ContactForm.tsx` with a `dok.*` call; the button
already has `loading` / `success` states.

Also ask the API team to add **`contact`**, **`about`** and **`services`**
to the reserved-usernames list — these pages now shadow profiles with those
usernames (same as `/help`, `/team`).
