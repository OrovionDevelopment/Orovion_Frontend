# src/lib/__tests__

Vitest unit tests for the framework-free logic in `src/lib/` (`npm test`).
Node environment, no DOM; `@` resolves to `src/`.

Share links:

- `shareLinks.test.ts` — URL shapes, handle parsing and canonical redirects,
  Android intent / scheme links, platform detection.
- `publicPreview.test.ts` — the titles and descriptions that end up in
  link-preview cards.
- `publicContent.test.ts` — the server fetch maps 200 / 404 / 5xx / timeout to
  `ok` / `notFound` / `error` and never throws, and sends `PUBLIC_SSR_KEY`.
  React's `cache()` is mocked: it only exists in the server build Next bundles.

`qrLogin.test.ts` has two stale expectations: `qrDeepLink` now appends
`&platform=web`, and the test predates that.
