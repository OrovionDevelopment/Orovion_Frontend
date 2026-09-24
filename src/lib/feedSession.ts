// Per-tab feed session id, echoed back to the api-gateway on every feed request.
//
// WHY THIS EXISTS
// media's personalized feed keeps a Redis "already served" set keyed by
// `posts:served:{viewer}:{session}` so page 2 never repeats page 1. When the
// client sends no session id, media used to fall back to a single literal
// 'default' key shared by every request, every tab and every guest, whose TTL
// was renewed on each call — so it never expired, accumulated every post, and
// the feed went blank. media now MINTS an id and returns it; this module is the
// client half of that contract: store what the server minted and send it back.
//
// ROTATION IS THE WHOLE DESIGN. A session must be discarded on an explicit
// refresh gesture (that is what makes "pull to refresh shows new things" work)
// and kept otherwise. Rotating per request would defeat cross-page dedup AND
// multiply Redis keys — Redis runs `maxmemory-policy noeviction`, so once full
// it REJECTS writes rather than evicting, which would take out far more than
// the feed. Never call rotateFeedSession outside a real refresh gesture.
//
// sessionStorage, not localStorage: it is per-tab, so two tabs get independent
// served-sets instead of corrupting each other's pagination. It is also cleared
// by the browser when the tab closes, which is exactly the desired lifetime.
//
// Framework-free so it is unit-testable without React (repo rule: testable logic
// belongs in src/lib, not inside a component effect).

/** Feeds with independent served-sets. Home and explore must never share one. */
export type FeedScope = "home" | "explore";

const storageKey = (scope: FeedScope) => `orovion:feed:session:${scope}`;

// Every access is guarded: sessionStorage is absent during SSR and throws
// outright in Safari private mode. A feed that cannot read its session id still
// works — it just gets a freshly minted one from the server each time.
const store = (): Storage | null => {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
};

/** The current session id for this tab, or null if none is established yet. */
export function getFeedSessionId(scope: FeedScope): string | null {
  try {
    return store()?.getItem(storageKey(scope)) || null;
  } catch {
    return null;
  }
}

/** Remember the id the server minted, so the next request can echo it. */
export function setFeedSessionId(scope: FeedScope, id: string | null | undefined): void {
  if (!id || typeof id !== "string") return;
  try {
    store()?.setItem(storageKey(scope), id);
  } catch {
    /* private mode / quota — the server just mints another one next request */
  }
}

/**
 * Drop this tab's session so the next request omits the id and the server mints
 * a fresh one, clearing the served-set. Call ONLY on an explicit refresh
 * gesture — pull-to-refresh, reload, or return-to-tab.
 */
export function rotateFeedSession(scope: FeedScope): void {
  try {
    store()?.removeItem(storageKey(scope));
  } catch {
    /* nothing to clear is not an error */
  }
}

/** Test seam — clears every scope. */
export function _resetFeedSessions(): void {
  (["home", "explore"] as FeedScope[]).forEach(rotateFeedSession);
}
