# scripts

- `verify-deeplinks.mjs` — checks what Android and iOS check before opening
  `orovion.com` links in the app: both `.well-known` files answer 200 as
  `application/json` with no redirect, `assetlinks.json` names
  `com.orovion.app` with well-formed SHA-256 fingerprints, the AASA file has a
  real Team ID, `www` redirects to the apex, and (optionally) a live share page
  carries `og:title`. Exits 1 on any failure.

  ```bash
  node scripts/verify-deeplinks.mjs                              # https://orovion.com
  node scripts/verify-deeplinks.mjs https://orovion.com p/<id>
  ```

  Both platforms fail silently — a broken file just opens links in the browser —
  so run it after any deploy touching the domain, `public/.well-known/` or
  `next.config.mjs`.
