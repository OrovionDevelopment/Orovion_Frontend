# src/screens

Full-page components. The thin files under `src/app/**/page.tsx` do nothing but
render one of these, so routing stays declarative and the screens stay testable.
Profile share links (`Profile.tsx` for your own, `UserProfile.tsx` for others)
come from `profileUrl()` in `src/lib/shareLinks.ts`: `https://www.orovion.com/<username>`.
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

Refresh is **gesture-only** — there is deliberately no refresh button. Two
triggers funnel through `refresh()` (scroll to top → bump `refreshKey`):
pull-to-refresh and `useAutoRefresh` on tab return. The gesture works on **trackpad/wheel as well as touch** — see
`src/hooks/README.md`; before that it was touch-only and so did nothing at all in
a desktop browser. `refresh()` returns a promise resolved in the load effect's
`.finally()`, on success *and* failure, because the hook awaits it to hold the
spinner.

## `Pulses.tsx` — Pulse

A vertical, **one-pulse-at-a-time** discovery feed (not a tile grid). Slides are a
native CSS scroll-snap column (`snap-y snap-mandatory`) where each slide fills the
content viewport, so exactly one pulse is on screen; trackpad, touch and the arrow
keys all step one pulse without a custom gesture lock. An `IntersectionObserver`
(threshold .6) picks the active slide, and **only the active slide mounts a
player** — every other slide stays a poster, so a long feed never accumulates
`<video>`/hls.js instances or fires phantom view pings.

Each slide renders `PulseCard`, shared with `PulseViewer` (the overlay opened from
the profile pulses grid) so the two surfaces cannot drift apart. Engagement
overrides (`liked`/`likesCount`/`saved`/`commentsCount`) are held **here**, keyed
by pulse id, so state survives scrolling away and back.

**Pagination — `cursor` is mandatory.** media-service materialises a ranked
session once and every later page is an OFFSET slice of it, but it only honours a
continuation when **both** `sessionId` *and* a non-zero `cursor` arrive
(`feedSession.service.js`). Sending `sessionId` alone makes the server discard the
session and re-serve page 1 — which the client's id-dedupe then drops, freezing
the feed on its first page forever. So continuation pages send
`sessionId` + `cursor`, and the real end-of-feed signal is `nextCursor === null`,
**not** `exhausted` (that is just `!hasMore`, already true on page 1 of a small
catalogue; it is surfaced only as a "replaying top Pulses" note).

**Reload:** gesture-first — there is no refresh button in the header.
Pull-to-refresh (touch *and* trackpad/wheel — see `src/hooks/README.md`) and
`useAutoRefresh` on tab return both call `reload()`, which clears `sessionId` +
`cursor` and starts a fresh session at slide 0. The one remaining button is the
end-of-feed CTA, which exists because the pull gesture is armed only on slide 0
and would otherwise be unreachable from the tail. Because this screen scrolls an inner element rather than the
window, it must pass `disabled` to the hook itself: the gesture is armed only on
slide 0 at `scrollTop === 0`, otherwise the hook's `preventDefault` would fight
the vertical swipe between pulses. Auto-refresh is skipped unless the user is
still on slide 0, so returning to the tab never yanks them out of a deep
position. Needs no `refresh=1`: this path has no gateway cache.

## Debugging an empty feed

Both feeds fail soft, so an empty screen never tells you why. `src/lib/diagnostics.ts`
puts the reason in the console instead. Filter DevTools by `[feed]` or `[pulse]`:

- `console.error` → the request failed (status, method, url, server message; or
  `noResponse: true` when nothing came back, the offline signature).
- `console.warn` → the request *succeeded* and still produced nothing. For Pulse
  this carries `sessionId` / `nextCursor` / `exhausted`, which is what separates a
  genuinely empty catalogue from a broken continuation.

If neither line appears when a feed looks stuck, the request never fired — look at
the effect's guards rather than the network.

## `Login.tsx`

Carries `data-clarity-mask="true"` on its root. `/login` is one of the few routes
Microsoft Clarity records (`src/lib/clarity.ts`) and this screen handles email,
phone, OTP and the QR-login challenge, so masking is enforced in our code rather
than via Clarity's dashboard masking mode — which anyone with dashboard access
could flip. Masking hides content only; clicks and scroll still register, so
heatmaps are unaffected. Any new sensitive UI on a recorded route needs the same
attribute.

**Why a person can't sign in.** When the API refuses an account with a coded
403, Login shows the reason instead of a generic error:

- suspended: until when, and the admin's reason;
- archived;
- recovery period ended.

The message comes from `blockMessage` in `src/lib/accountBlock.ts` and is shown
as a banner on the first step, which is where a signed-out person lands. It is
read after the boot session restore finishes, because on a cold load of `/login`
that restore is what discovers the block. It works
both when the refusal arrives on the login attempt itself and when a signed-in
tab was logged out by it: the reason is stashed before the logout and read back
here once.

## `Saved.tsx` — category tabs

Each tab (All, Posts, Case studies, Research, Theses, Pulse) loads its own list
from `dok.saved.list(type)` and renders Pulses as a poster grid and everything
else as `PostCard`s, with **Load more** for further pages. Tab→type mapping and
the Pulse/post split live in `src/lib/savedItems.ts` (see that README for why the
old `/feed/saved?tab=` source showed the same list on every tab).

## Others

`Create.tsx`, `PostDetail.tsx`, `Profile.tsx`, `UserProfile.tsx`, `Explore.tsx`,
`Search.tsx`, `Messages.tsx`, `Notifications.tsx`, `Network.tsx`,
`Connections.tsx`, `Saved.tsx`, `Insights.tsx`, `Settings.tsx`, `EditProfile.tsx`,
`Onboarding.tsx`, `Login.tsx`, `Landing.tsx`, `Admin.tsx`, `HashtagWorkspace.tsx`,
`MobileAppPage.tsx`, `CallDebug.tsx`,
plus `consults/` and `legal/`.

## Admin panel (`Admin.tsx`)

Tabs: Overview, Users, Content, Verifications, Reports, Feedback, Consultation
ratings, Deletions, Audit log, Transactions, Settlements. Endpoints:
`dok.admin.*` in `src/lib/api.ts`; server side: `Api_service/docs/modules/admin.md`.

**Showing numbers and failures**

- Every number goes through `formatStat`. A missing value shows "—", never
  "NaN" or a misleading 0.
- A failed request shows `ErrorState` with **Retry**, never an empty list that
  looks like "no data".
- When part of the overview failed, a banner names the sections that are
  missing (`partial`).

**Content counts** come from media-service through api-service: Posts,
Research, Case studies and Pulses. Case studies also include any legacy
clinical cases. When media is down the API sends `null`, shown as "—".

**Users**

- Status chips and filters include **Archived** (FROZEN).
- The drawer shows the lifecycle dates (deletion requested, recovery ends,
  archived) and consultation counts.
- **Suspend**: presets 1, 3, 7 or 30 days, Custom (up to 365) or Permanent, and
  a required reason of 5–500 characters. The person sees that reason.
- **Lift suspension** ends it early.
- **Erase permanently**: type `DELETE` and give a reason. When money or
  consultations are still open, the server's blockers are listed in plain
  words; when one service fails, its error is shown.

**Content**

- Posts, research, case studies and Pulses come from media; clinical cases are
  local. Remove asks for confirmation.

**Reports**

- Kinds: Posts, Pulses and Profiles. Status: Open, Actioned, Dismissed or All.
- Actions: **Dismiss**, **Remove post/Pulse** (closes every open report on it),
  or for a profile **Review person**, which opens their drawer to suspend.
- Actions update the list optimistically and roll back if the server refuses.

**Verifications**

- Doctor and student queues, oldest first.
- The drawer loads the documents as signed links: images as thumbnails, PDFs as
  "Open document". The links expire 5 minutes after loading, and every view is
  audited. It also shows the ID type, the submission and the review history.
- Reject needs a reason. Rejecting an approved doctor removes their badge.

**Feedback**

- Category and status filters, rating, platform and screenshots.
- Mark Reviewed or Resolved, with a private note.

**Deletions**

- Pending: "Requested {date}", "Recovery ends {date} (in N days)".
- Archived: the frozen accounts.
- The **How accounts work** card (`AccountRulesCard`) explains the rules,
  using the server's recovery period.

**Money tabs**

- **Payments**: a failed load shows an error with **Retry**. A payment whose
  details can't be loaded says so in the drawer.
- **Transactions**: a failed list shows an error with Retry instead of "No
  transactions yet".
- **Settlements**: a figure that can't be loaded shows "—" (never ₹0), with a
  banner naming which figures are missing. A failed list is an error, not "No
  settlements".

**User drawer** also lists the last admin actions on the person (suspended,
lifted, deactivated…). Its "Reports" tile counts open reports on the profile
and on their content.

**Lists** all use the server's `nextCursor` with **Load more**. Each loader is
sequenced (`useRequestSeq`): a slow answer for the previous filter or tab is
dropped, so it can never overwrite the current list or be appended to it.

**After a suspension or deactivation**, the drawer stays open with a notice
when not every device could be signed out (access ends when the current
sign-in expires, about 15 minutes) or when a doctor still has consultations in
progress. Otherwise it closes.

## `Settings.tsx` — feedback and leaving

**Send feedback**

- Category chips, a message of up to 2000 characters, an optional 1–5 rating,
  and up to 5 images.
- Sent to `POST /api/account/feedback`: as `FormData` when there are images,
  as JSON otherwise.
- A 429 means the hourly limit was reached (5 per person).
- The form keeps its content when sending fails.

**Danger zone**

- **Deactivate** hides the account until the next login.
- **Delete** is a soft delete. The confirmation and the explainer text use the
  server's recovery period (`useAccountPolicy`). After deleting, the person is
  told the exact date by which logging in restores the account.
- Errors from the server are shown, never swallowed.

## Feed session handling (`Feed.tsx`, `Explore.tsx`)

Both screens send a feed `sessionId` (see `src/lib/feedSession.ts`) and store the
one the server returns, and **neither rotates it on refresh or reload**. The
server excludes what it already served in that session, so keeping it is what
makes a refresh surface new posts; rotating (as these screens once did) re-served
the identical top posts, because the ranking is deterministic. A refresh still
sets `refresh=1` to bypass the gateway's page cache — that is independent of the
session.

**One exception: an exhausted session.** The session lives in sessionStorage, so
it survives a reload. On a small catalogue (a fresh database, say) the first load
serves every post, and each reload then asks the server for posts not yet served
in that session — none — and the feed went blank. This hit only the web: the app
keeps its session in memory, so a restart always starts over. Now, when a FIRST
page comes back empty and a session was sent (`isExhaustedSession` in
`src/lib/feedSession.ts`), the screen rotates that session and asks once more. New
posts still come first when there are any; otherwise you get the full feed again
instead of an empty one. Cursor pages and session-less requests are never retried,
so there is no loop. Both `Feed.tsx` and `Explore.tsx` do this.

`Explore.tsx` uses the `explore` scope, never `home` — all three feed routes
share one media pipeline, so a shared session would let the two feeds hide each
other's content.

When a feed load fails and cached posts are shown instead, `Feed.tsx` says so with
a toast ("Couldn't refresh — showing saved posts"). It used to fall back silently,
which made a backend outage indistinguishable from "refresh does nothing".

`Feed.tsx` also refuses to overwrite a populated offline cache with an empty
response (`shouldWriteFeedCache`).

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

## Chat thread ordering (`Messages.tsx`)

**chat-service returns a page of messages newest-first.** `GET /api/chat/:id/messages`
sorts by `_id` descending, pages backwards in time (`_id: { $lt: cursor }`), and
returns `nextCursor` = the oldest item on the page. api-service's proxy
(`getMessagesDecorated`) decorates each message but preserves that order.

The thread renders top-to-bottom (`msgs.map`), and every path that inserts into
`msgs` assumes the opposite — **oldest-first**:

| Path | Insert |
|---|---|
| socket `new_message` / `message_sent` (`appendToThread`) | `[...prev, m]` |
| optimistic send | `[...(m \|\| []), temp]` |
| `loadMore` (older page) | `[...older, ...prev]` |
| auto-scroll | scrolls to `endRef`, i.e. the bottom, to reach the newest |

So **every fetched page is flipped through `toAscending()`** before it reaches
state. This is not cosmetic: without it the entire thread rendered upside down,
and because the view auto-scrolls to the bottom (which was then the *oldest* end)
a just-sent message appeared to vanish on reopening the conversation — it had
moved to the top, far above the viewport.

`hasMore` and `nextCursor` are read from the raw response, never derived from the
local array, so reversing locally cannot affect pagination.

> The same endpoint has a second mode, `?sinceSeq=<n>`, which returns messages
> **ascending** with `nextSinceSeq`. This screen never sends it. Anyone adding
> delta sync must not pass that response through `toAscending()`.
