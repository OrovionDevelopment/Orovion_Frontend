# Recommendation Engine — Home Feed & Pulse Discovery

How the **home post feed** and **pulse feed** select, order, de-duplicate, and recycle
content. Run `npm run migrate` (adds `pulse_watch_history`) before using the pulse
engine. See [index.md](index.md) for setup.

The pure ranking math lives in `src/shared/utils/feed.ranking.js` (unit-tested);
the orchestration is in the feed/pulse controllers, backed by Redis.

---

## 1. Home Post Feed — `GET /api/feed/home` 🔒

Session-based, weighted pseudo-random feed with seen de-duplication and a
"caught-up → past discussions" fallback.

```
GET /api/feed/home?sessionId=&specialty=&type=&page=0&limit=20
```

| Param | Meaning |
|---|---|
| `sessionId` | Omit on first load / pull-to-refresh → server mints a **new** session (returned in the response). Pass it back on subsequent pages to keep a stable, de-duplicated order. |
| `specialty` | Chip filter: keeps posts whose **author's specialization** matches **OR** whose own `specialties` tags (set at create time) include it. Omit = "All". |
| `type` | `post \| research \| thesis \| case_study` (optional). |
| `page` | 0-based page index (not a cursor). |

**Response `data`:**
```json
{
  "sessionId": "clx…",
  "page": 0,
  "posts": [ { "id": "…", "author": { …, "isFollowing": false, "connectionStatus": "none" },
              "isLiked": false, "isSaved": false, "…": "…" } ],
  "hasMore": true,
  "nextPage": 1,
  "exhausted": false,
  "caughtUp": false
}
```

**How it works**
1. **Session order (once per session+filter):** the server compiles up to 400 eligible
   posts (not deleted, public, author active, matching specialty/type, **excluding**
   muted authors, "not interested" posts, and already-**seen** posts), then applies a
   **weighted pseudo-random shuffle** — high engagement (likes + comments) and recency
   trend toward the top, the rest spread randomly. The ordered id list is cached in
   Redis for ~6h (`feed:order:{userId}:{sessionId}:{specialty}:{type}`). Every page of
   the session slices this same list → stable, no duplicates across refreshes.
2. **Seen de-duplication:** the client reports cards seen >1.5s via `POST /feed/seen`
   (below); those ids are excluded when the next session's order is built.
3. **Exhaustion fallback:** when fewer than **5** fresh posts remain (or the page runs
   past the order), the server tops the page up with previously-**seen** posts from the
   same specialty — minus "not interested"/muted — fully shuffled, and sets
   `exhausted: true`, `caughtUp: true` ("Explore Past Discussions").
4. **Degraded mode:** if Redis is unavailable, it falls back to a plain
   chronological, offset-paginated feed (`degraded: true`) — no session/de-dup.

### `POST /api/feed/seen` 🔒 — log viewed cards

```jsonc
{ "sessionId": "clx…", "postIds": ["clxA", "clxB"] }   // ids that entered the viewport >1.5s
// → data: { recorded: 2 }
```
Up to 200 ids per call; appended to the session "seen" set (Redis, ~6h TTL).

```js
// frontend
let sessionId;
async function loadFeed(page = 0, specialty) {
  const d = await api.get(`/feed/home?page=${page}&limit=20${sessionId ? `&sessionId=${sessionId}` : ''}${specialty ? `&specialty=${specialty}` : ''}`);
  sessionId = d.sessionId;            // reuse for the rest of the session
  return d;                            // d.exhausted → show "caught up" banner
}
function refresh() { sessionId = undefined; return loadFeed(0); }      // pull-to-refresh = new session
// on scroll, batch ids seen >1.5s:
api.post('/feed/seen', { sessionId, postIds: seenBatch });
```

---

## 2. Pulse Discovery — `GET /api/pulses/feed` 🔓

Discovery-first vertical feed: **true-random** global selection, **48-hour** watched
suppression, per-session de-dup, and an exhaustion loop that recycles watched pulses.

```
GET /api/pulses/feed?sessionId=&cursor=&specialty=&limit=10
```
- Omit `sessionId` (e.g. every time the user enters the Pulse tab) → a **fresh**
  session, returned in the response.
- ⚠️ **Pass back `sessionId` AND `cursor` together** on every continuation.
  `cursor` is the numeric OFFSET into the frozen ranked list, echoed as
  `nextCursor`. The server only continues a session when both are present —
  `sessionId` on its own is ignored and the session is rebuilt from offset 0,
  re-serving page 1 (`feedSession.service.js`). End of feed is
  `nextCursor === null`; `exhausted` is only `!hasMore` and is **not** a stop
  signal.

**Response `data`:** `{ sessionId, pulses: [ { …, author:{…isFollowing, connectionStatus} } ], hasMore, exhausted }`

**How it works**
1. **True-random selection:** picks pulses in random order from the whole eligible pool
   (completed, public, active author, matching specialty) — discovery-first, *not*
   limited to the follow graph.
2. **48h watched lockout:** pulses the viewer watched in the last 48h (recorded via
   `POST /pulses/:id/watched`) are hidden. Session-served pulses and "not interested"
   pulses and muted authors are also excluded.
3. **Exhaustion loop:** when the un-watched pool runs dry, the 48h filter is unlocked
   and watched pulses are **recycled**, prioritized by: **new comments since last view →
   saved → highest global retention (views)**, then random. If even that is exhausted
   (everything served this session), the served set resets so the infinite scroll never
   dead-ends. `exhausted: true` flags the recycled state.

### `POST /api/pulses/:id/watched` 🔒

Call when a pulse is watched past 50% or for >10s. Upserts `pulse_watch_history`
(refreshes `watchedAt`). → `"Watch recorded."`

```js
// frontend (per pulse, once threshold met)
api.post(`/pulses/${pulseId}/watched`);
// feed:
let pulseSession, pulseCursor;
async function loadPulses({ fresh = false } = {}) {
  const q = new URLSearchParams({ limit: '10' });
  if (!fresh && pulseSession && pulseCursor) { q.set('sessionId', pulseSession); q.set('cursor', pulseCursor); }
  const d = await api.get(`/pulses/feed?${q}`);
  pulseSession = d.sessionId;
  pulseCursor  = d.nextCursor ?? null;           // null → genuine end of feed
  return d;                                     // d.exhausted → "replaying top pulses"
}
function enterPulseTab() { pulseSession = pulseCursor = undefined; return loadPulses({ fresh: true }); }
```

---

## Comparison

| Mechanism | Home Post Feed | Pulse Section |
|---|---|---|
| Ordering | Specialty-filtered + weighted pseudo-random (session-stable) | True-random global |
| Refresh trigger | pull-to-refresh / specialty chip / boot (omit `sessionId`) | every Pulse-tab entry (omit `sessionId`) |
| View threshold (client) | card visible >1.5s → `POST /feed/seen` | watched >50% or >10s → `POST /pulses/:id/watched` |
| Exclusion window | current session (Redis seen set) | hard 48h watched lockout |
| Exhaustion fallback | shuffle previously-seen posts of the active specialty | unlock 48h; prioritize new-comments / saved / high-retention |
