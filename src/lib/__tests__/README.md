# src/lib/__tests__

Vitest unit tests for the framework-free logic in `src/lib/` (`npm test`).
Node environment, no DOM; `@` resolves to `src/`.

Session:

- `api.session.test.ts` — where the CSRF value is read from (the `csrfToken` cookie
  first, `localStorage.dl_csrf` as a fallback) and that `refreshOnce()` coalesces
  concurrent refreshes. Both guard real logout bugs: the server rotates the refresh
  token on every use, so racing refreshes kill a healthy session, and a localStorage-
  only CSRF read 403s whenever storage and cookie disagree. The `node` environment
  has no `document`/`localStorage`, which is also the condition the guards in
  `api.ts` must survive — the tests stub both globals per case.

Saved page:

- `savedItems.test.ts` — every Saved tab maps to its own `/api/saved` type (no
  two tabs return the same list), and items are split into Pulses vs posts by the
  server's `contentType`, so a video post with a thumbnail stays a post.

Share links:

- `shareDetect.test.ts` — which chat messages render as share cards. Guards three
  real bugs: `/pulse/<id>` links (and the canonical `/p/<id>` post link) were not
  recognised and showed as plain text, and a typed share carrying a URL was looked
  up by the whole URL. Also pins that `/pulses/…` is not mistaken for `/pulse/…`.

- `shareLinks.test.ts` — URL shapes, handle parsing and canonical redirects,
  Android intent / scheme links, platform detection.
- `publicPreview.test.ts` — the titles and descriptions that end up in
  link-preview cards.
- `publicContent.test.ts` — the server fetch maps 200 / 404 / 5xx / timeout to
  `ok` / `notFound` / `error` and never throws, and sends `PUBLIC_SSR_KEY`.
  React's `cache()` is mocked: it only exists in the server build Next bundles.

`qrLogin.test.ts` has two stale expectations: `qrDeepLink` now appends
`&platform=web`, and the test predates that.

Pulse feed:

- `wheelPaging.test.ts` — one wheel or trackpad gesture moves exactly one Pulse.
  Small trackpad deltas add up before anything moves, the rest of the gesture
  (momentum tail included) is swallowed, a pause starts the next gesture, and
  the index never leaves the feed.

Accounts and admin:

- `accountBlock.test.ts` — the three coded refusals are recognised and nothing
  else is. The stash survives the sign-out and is read exactly once. Garbage in
  storage and a missing `window` (SSR) are safe. The messages cover a timed
  suspension (when access returns, and why), a permanent one (no end date), and
  archived/expired accounts (what the person can still do).
- `utils.format.test.ts` — `formatStat` never prints "NaN" and shows "—" for
  missing values; `formatDate` and `daysUntil` handle junk and past dates.
