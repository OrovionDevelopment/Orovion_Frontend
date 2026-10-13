# src/components

Shared UI. Screens (`src/screens/`) compose these; route files never do.
Everything here is `"use client"`. Subfolders group by domain (`analytics/`,
`call/`, `comments/`, `consult/`, `landing/`, `legal/`, `profile/`, `pwa/`,
`search/`, `seo/`, `settings/`), `layout/` holds the app shell, and `ui/` holds
the primitives (`Primitives`, `Overlays`, `Skeletons`, `Toast`, `FollowButton`, …).

`analytics/` holds **third-party** tags (Microsoft Clarity) and has its own
README — note it is scoped to public routes and must never load inside `/app/*`.

`public/` is the exception to "everything is client": server-rendered cards for
the public share-link pages (its own README). `ShareSheet`, `PostCard` and
`PulseCard` take every share URL from `src/lib/shareLinks.ts` — no request, no
`window.location.origin`, no hardcoded domain.
Orovion's own admin dashboard is `src/features/analytics/`, a different thing.

Follow the theming rules in the root `CLAUDE.md`: `bg-surface` for cards and
sheets (never `bg-white`), the flipping `ink` ramp for content, and the static
`ink-950` for always-dark contexts such as pulse posters and image scrims.

## Pulse (pulses) trio

`PulseCard` is the single source of truth for **one pulse**: player, mute toggle,
right action rail (like / comment / share / save / more), author + `FollowButton`
+ caption, double-tap-to-like, the view/watched pings, and every sheet it opens
(3-dot `BottomSheet`, delete `Modal`, `ShareSheet`, `LikesSheet`, `CommentsSheet`,
`EditPostModal`). Two surfaces render it, so they cannot drift apart:

| Consumer | Shape |
|---|---|
| `PulseViewer` | Full-screen portal overlay opened from a grid (profile pulses). Owns the portal, close/up-down chrome and the current index. |
| `screens/Pulses` | The Pulse tab's one-pulse-at-a-time snap-scrolling feed. |

Two contracts matter when touching these:

- **`active`** means "the pulse the user is looking at". Only an active card mounts
  a `<video>` and fires view/watched pings — that is what stops a feed of N slides
  from spawning N players or N phantom views. Inactive cards render the poster.
- **Engagement overrides live in the parent** (`over` + `onPatch`, keyed by pulse
  id), not in the card, so optimistic like/save/comment counts survive navigating
  away from a pulse and back within a session.
- **Save trusts the server.** `POST /pulses/:id/save` *toggles* whatever is stored,
  so the card applies the reply's `{ saved }` after its optimistic flip. Without
  that, a stale screen (saved from the app, a double click, an older feed page)
  left every later click inverted.

`PulseVideo` is the player underneath: native HLS on Safari/iOS, lazy-loaded
`hls.js` elsewhere, and a poster + status overlay while `processingStatus` is
still `PENDING`/`PROCESSING` (or `FAILED`).

## Pulse posters

`pulsePoster()` (`src/lib/utils.ts`) returns `undefined` whenever a pulse has no
genuine thumbnail, which is the normal case for pulses uploaded via
`POST /api/pulses`. Every call site therefore guards the image:

```jsx
{pulsePoster(r) && <img src={pulsePoster(r)} … />}
```

The surrounding tile is already `bg-ink-950` with a play-icon overlay, so the
guard degrades to a dark placeholder rather than a broken image. Do not
reintroduce a derived `.jpg` URL — S3 has no on-the-fly frame generation, so it
only produces failed requests.
