# src/lib

Framework-free logic. Repo rule: anything worth unit-testing lives here rather
than inside a component, so it can be tested without React or a DOM.

## API + auth

- `api.ts` — the axios instance (`withCredentials`) and the `dok.*` endpoint map.
  The access token is held **in memory only**; the refresh token is an httpOnly
  cookie. A 401 triggers a single silent refresh-and-retry, and a hard failure
  fires `dl:auth-expired` for `AuthContext` to act on.
- `backend.ts` — picks the deployment (AWS via same-origin `proxy` rewrite, or
  Render directly) and caches the choice.
- `firebaseAuth.ts`, `qrLogin.ts`, `socketReauth.ts`, `socket.ts` — auth and
  realtime transport helpers.

## Offline

- `offline.ts` — `swStrategyFor`, the pure mirror of `public/sw.js` routing.
  `/api`, `/auth`, `/socket.io`, `/health` and every non-GET **bypass** the
  service worker, so no shared cache can ever hold user-specific data.
- `offline-cache.ts` + `idb.ts` — the app-layer half: per-user IndexedDB payload
  cache, namespaced by user id so accounts can never read each other's data.
  Screens use it for an instant first paint while the network is in flight; the
  live response always wins.

## Feed freshness

- `feedFreshness.ts` — `shouldForceFresh(key, userIntent)` decides when a feed
  load must carry `?refresh=1` and so bypass the api-gateway's stale-while-
  revalidate cache.

  Intent-scoped rather than blanket force-fresh: a reload or an explicit refresh
  gesture must show current data, while flipping between filter chips can still
  ride the cached hero page. The last-fresh timestamps live in **module scope on
  purpose** — a hard browser reload discards the module, so the first load after
  F5 is always fresh. That is the whole mechanism behind "reload actually
  reloads". `FRESH_WINDOW_MS` (20s) matches `HOME_FEED_FRESH_MS` on the gateway so
  client and server age out together.

## Pull-to-refresh

- `pullToRefresh.ts` — the gesture maths (`damp`, `accumulate`, `shouldRefresh`,
  `startsNewGesture`) behind `src/hooks/usePullToRefresh.ts`, which owns the DOM
  half (listeners, `preventDefault`, awaiting `onRefresh`).

  Two devices feed one model. Touch has a real `touchend` to settle on; the
  trackpad/wheel path — added because **touch events never fire on desktop web,
  so the gesture was dead on every non-touch device** — has no `wheelend`, so it
  settles on an idle timer (`WHEEL_SETTLE_MS`). The important rule is
  `startsNewGesture`: a pull only counts when the gesture *begins* with the
  surface already at the top. A fling from further down the page arrives as one
  unbroken ~16ms stream, so its momentum tail slamming into the top can never
  self-trigger a refresh; a deliberate second flick, made after a pause, can.

## Other

`utils.ts`, `theme.ts`, `appearance.ts`, `schema.ts`, `seo.ts`, `faq.ts`,
`team.ts`, `notify.ts`, `router.tsx`, `relationships.ts`, `followBus.ts`,
`profileForms.ts`, `chatDeletedConversations.ts`, `callClient.ts`,
`webrtcService.ts`, `offline-queue.ts`, `consultations/`.

Tests live in `src/lib/__tests__/` and run under vitest (`npm test`).
