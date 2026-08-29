# src/screens

Full-page components. The thin files under `src/app/**/page.tsx` do nothing but
render one of these, so routing stays declarative and the screens stay testable.
`src/app/app/layout.tsx` is `force-dynamic`, and `AppLayout` renders
`<AppLoading />` until `AuthContext` finishes bootstrapping — so no screen mounts
before the access token has been re-minted from the refresh cookie.

## `Feed.tsx` — the home feed ("post section")

Offline-first, then live:

1. On a fresh mount the per-user IndexedDB cache paints the last-known first page
   instantly, guarded by a `settled` flag so a live response is never overwritten
   by stale cache.
2. The live request always fires and always wins; on failure the cache is the
   fallback so the feed is never empty.
3. The first page is re-cached on every successful load.

**Cache bypass.** The api-gateway caches page 1 for up to 45s, so a load has to
opt out to be genuinely fresh. `buildQuery(filter, cursor, fresh)` appends
`refresh=1` when `shouldForceFresh` says so — on a fresh mount (reload) or a
`refreshKey` bump (refresh button, pull-to-refresh, return-to-tab), but **not**
on a filter-chip switch and **never** on cursor pages. See
`src/lib/feedFreshness.ts`. Without this the refresh gestures were silently
no-ops: the flag existed server-side but nothing ever sent it.

Pagination is cursor-based via an `IntersectionObserver` sentinel; `reqSeq`
discards superseded payloads when chips are tapped quickly.

## `Reels.tsx` — Pulse

Resets `sessionId` and refetches on every mount, so a reload always starts a new
discovery session and the backend re-ranks. Continuation pages send the
`sessionId` back so the frozen ranked list is sliced rather than recomputed.
Needs no `refresh=1`: this path has no gateway cache.

## Others

`Create.tsx`, `PostDetail.tsx`, `Profile.tsx`, `UserProfile.tsx`, `Explore.tsx`,
`Search.tsx`, `Messages.tsx`, `Notifications.tsx`, `Network.tsx`,
`Connections.tsx`, `Saved.tsx`, `Insights.tsx`, `Settings.tsx`, `EditProfile.tsx`,
`Onboarding.tsx`, `Login.tsx`, `Landing.tsx`, `Admin.tsx`, `HashtagWorkspace.tsx`,
`MobileAppPage.tsx`, `TeamPage.tsx`, `TeamMemberPage.tsx`, `CallDebug.tsx`,
plus `consults/` and `legal/`.
