# src/components/layout

| File | Role |
|---|---|
| `AppLayout.tsx` | the signed-in app shell (navigation around every `/app/*` screen) |
| `RightRail.tsx` | the right-hand sidebar on wide screens (Feed and Explore): **Suggested for you** (`dok.follows.suggestions()`) and the footer line |

The sidebar no longer shows a **Trending** hashtags card. It was removed on
request. Trending hashtags are still shown on the Search screen ("Trending in
medicine"), which is why `dok.posts.trendingTags` stays in `src/lib/api.ts`.
