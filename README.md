# Orovion — Web (Next.js)

Next.js 14 **App Router** port of the Orovion web client (migrated from the Vite SPA, which still lives in `../Orovion Frontend`). Same UI, API layer, Firebase auth, and socket.io — re-homed onto Next file-based routing in **TypeScript**.

## Quick start

```bash
npm install
cp .env.example .env.local     # set backend URL + Firebase keys
npm run dev                    # http://localhost:5173
```

`npm run build` → production build · `npm run start` → serve the build.

## How the migration maps

| Vite / React Router | Next.js |
|---|---|
| `src/main.jsx`, `index.html` | `src/app/layout.tsx` (fonts, metadata, `<Providers>`) |
| `src/App.jsx` routes | `src/app/**/page.tsx` (file-based) |
| `src/pages/*` screens | `src/screens/*` (imported by the route files; **not** `pages/`, which Next treats as the old Pages Router) |
| `<Protected>` / `<RequireProfile>` | guards inside `src/components/layout/AppLayout.tsx` |
| `react-router-dom` | `@/lib/router.tsx` — a thin shim over `next/navigation` (`useNavigate`, `Link`, `NavLink`, `useParams`, `useSearchParams`, `useLocation`, `Navigate`) so screens import it unchanged |
| `import.meta.env.VITE_*` | `process.env.NEXT_PUBLIC_*` |
| Vite dev proxy | `next.config.mjs` rewrites (only when `NEXT_PUBLIC_API_BASE` is blank) |

- `/` , `/login`, `/onboarding` render statically; everything under `/app/*` is `force-dynamic` (auth-gated, client-driven).
- All interactive code is marked `"use client"`.

## Admin console (secret path)

A standalone operator console (`src/screens/Admin.tsx`) is completely separate from the
product app — no link points to it, and it's `robots: noindex`. To keep it from being
guessed, it is **not** served at `/admin`:

- `src/middleware.ts` serves the console only at **`/<ADMIN_PANEL_SLUG>`** (a server-only env
  var — set it to a long random value per deployment; the real path never ships to the
  client). The literal `/admin` path is made to **404**.
- Local example: `http://localhost:5173/<your-slug>`. The default fallback slug is only for
  local dev — **override `ADMIN_PANEL_SLUG` in production.**

It has its own identity, **not** a Orovion user account:

- **Login** with the backend's `ADMIN_USERNAME` / `ADMIN_PASSWORD` (env). The backend returns
  an admin JWT pair that the client holds in `sessionStorage` via `ADMIN_TOKENS` (in
  `src/lib/api.ts`) — separate from the product user session, attached as `Authorization:
  Bearer` on `/admin/*` calls only, and auto-refreshed on 401.
- **Sections:** Overview (dashboard metrics + live online count), Users (search, block
  temporary/permanent, deactivate, permanent delete), Content (super-delete any
  post/reel/thesis/case), Verifications (doctor + student KYC), Reports, Feedback, Deletions,
  and the Audit log.
- All calls go through `dok.admin.*` in `src/lib/api.ts`. The previous `x-admin-key` shared
  secret has been removed.

## SEO & search indexing

Full playbook: **[docs/SEO.md](docs/SEO.md)** — including Google Search Console
setup and an honest account of what code can and cannot do for ranking.

- `src/lib/seo.ts` is the single source of truth — origin, default title and
  description, and a `pageMetadata()` helper that emits canonical + OpenGraph +
  Twitter tags in one call. Route files should use it rather than hand-rolling
  tags.
- `src/lib/schema.ts` builds the JSON-LD entity graph (Organization, WebSite,
  Person, FAQPage, SoftwareApplication, Breadcrumb); `src/components/seo/JsonLd.tsx`
  renders it. The Organization and WebSite blocks ship on every page.
- `/robots.txt` and `/sitemap.xml` are **generated** (`src/app/robots.ts`,
  `src/app/sitemap.ts`) — never checked-in static files, so they cannot go stale.
- `/opengraph-image` is a 1200×630 social card generated at build from
  `src/app/opengraph-image.tsx` (no binary asset to maintain). It runs on the
  **edge** runtime: `@vercel/og`'s Node build crashes during `next build` on
  Windows.
- `src/lib/faq.ts` holds the help-centre Q&A as plain data, consumed by *both*
  the accordion and the FAQPage markup — if those two ever disagree, Google
  drops the rich result.
- Indexable: `/`, `/team`, `/team/<slug>`, `/help`, `/mobile-app`, `/privacy`,
  `/terms`. Excluded via robots.txt **and** a `noindex` meta: `/app/*`,
  `/login`, `/onboarding`, `/admin`, `/api/*`.
- **Set `NEXT_PUBLIC_SITE_URL`** (defaults to `https://www.orovion.com`; the
  apex 301s to `www`, so `www` is the canonical host). It is
  inlined at build time — set it before `npm run build`, and set it explicitly
  on preview deployments so they don't emit production canonicals.
  `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` is optional (HTML-tag verification).

## Notes / TODO to tighten later

- `next.config.mjs` currently sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds`, and `tsconfig.json` is lenient — this kept the large JS→TS port building. Remove these and add real types incrementally.
- Backend CORS already allows any `localhost` port in dev, so the direct `NEXT_PUBLIC_API_BASE=http://localhost:5000` works. For deploys, set it to the public backend URL and add the web origin to the backend `FRONTEND_URL` + Firebase Authorized domains.
