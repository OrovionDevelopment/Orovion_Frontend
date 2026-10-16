"use client";
import Roll from "@/components/ui/Roll";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Loader2, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { TileGridSkeleton } from "@/components/ui/Skeletons";
import PulseCard from "@/components/PulseCard";
import { dok } from "@/lib/api";
import { usePullToRefresh, useAutoRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import { logFeedError, logFeedEmpty } from "@/lib/diagnostics";
import { IDLE_WHEEL, clampSlide, wheelPage, wheelPixels } from "@/lib/wheelPaging";

const rid = (r) => r?._id || r?.id;
const PAGE = 10;

/**
 * Pulse tab — a vertical, one-pulse-at-a-time discovery feed.
 *
 * Layout: a snap-scrolling column where every slide fills the content viewport, so
 * exactly one pulse is ever on screen. Touch keeps native snapping
 * (`snap-y snap-mandatory`). Wheel and trackpad input is taken over so that one
 * gesture moves exactly one pulse (`src/lib/wheelPaging.ts`): with native snapping
 * a trackpad could hold the feed half-way between two pulses, and a flick's
 * momentum could skip several. Only the slide the user is looking at mounts a
 * player (`active`) — the rest stay posters, so a long feed never spawns a stack
 * of <video>/hls.js instances.
 *
 * Pagination (docs/modules/recommendation.md §2): media-service materialises a
 * ranked session ONCE and every later page is an OFFSET slice of it. A continuation
 * is only honoured when BOTH `sessionId` and a non-zero `cursor` are sent —
 * otherwise the server discards the session and re-serves page 1. So `cursor` is
 * mandatory here, and the real end-of-feed signal is `nextCursor === null`, NOT
 * `exhausted` (which is just `!hasMore` and is already true on page 1 of a small
 * catalogue).
 */
export default function Pulses() {
  const [pulses, setPulses] = useState<any[] | null>(null);
  const [active, setActive] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [muted, setMuted] = useState(true);
  const [over, setOver] = useState<Record<string, any>>({});
  const [atTop, setAtTop] = useState(true);

  const sessionId = useRef<string | null>(null); // discovery session — fresh per tab entry / refresh
  const cursor = useRef<string | null>(null);    // numeric OFFSET into the ranked session
  const seenIds = useRef<Set<string>>(new Set());
  const loadingRef = useRef(false);
  const gen = useRef(0); // bumped on every refresh; invalidates in-flight pages
  const scroller = useRef<HTMLDivElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null); // the feed plus its nav buttons: the wheel target
  const activeRef = useRef(0);
  activeRef.current = active;
  // The slide the feed rests on or is heading to. Steps count from here, not from
  // `active`, which only flips once a slide is 60% visible, so a quick second step
  // made during the scroll would otherwise be lost.
  const target = useRef(0);
  const wheel = useRef(IDLE_WHEEL);

  const list = pulses || [];
  const hasSlides = list.length > 0; // the feed (and its scroller) is mounted
  // the tail (spinner / end-of-feed) is a slide too, so arrows can reach it
  const totalSlides = list.length + (loadingMore || atEnd ? 1 : 0);

  /* ---------------------------------------------------------------- data --- */

  const fetchPage = useCallback(async (fresh) => {
    const g = gen.current;
    const params = new URLSearchParams({ limit: String(PAGE) });
    // Continuation needs the session id AND its offset; sending one without the
    // other silently rebuilds the session from offset 0 (feedSession.service.js).
    if (!fresh && sessionId.current && cursor.current) {
      params.set("sessionId", sessionId.current);
      params.set("cursor", cursor.current);
    }
    const d = await dok.pulses.feed(`?${params.toString()}`);
    // A refresh that landed while this was in flight owns the session now —
    // never let a superseded page overwrite its cursor or end-of-feed state.
    if (g !== gen.current) return [];
    if (!(d.pulses || []).length) {
      logFeedEmpty("pulse", fresh ? "fresh session" : "continuation page", {
        sessionId: d.sessionId, nextCursor: d.nextCursor ?? null, exhausted: Boolean(d.exhausted),
      });
    }
    sessionId.current = d.sessionId || sessionId.current;
    cursor.current = d.nextCursor ?? null;
    setAtEnd(!d.nextCursor);
    setExhausted(Boolean(d.exhausted));
    return d.pulses || [];
  }, []);

  // Both touch refs only, so they are stable for the effects/callbacks below.
  const take = useCallback((rows: any[]) => rows.filter((r) => {
    const k = rid(r);
    if (!k || seenIds.current.has(k)) return false;
    seenIds.current.add(k);
    return true;
  }), []);

  const resetSession = useCallback(() => {
    gen.current += 1;
    sessionId.current = null;
    cursor.current = null;
    seenIds.current = new Set();
  }, []);

  // fresh session on every entry into the tab
  useEffect(() => {
    let alive = true;
    resetSession();
    fetchPage(true)
      .then((r) => { if (alive) setPulses(take(r)); })
      .catch((err) => { logFeedError("pulse", "initial load", err); if (alive) setPulses([]); });
    return () => { alive = false; };
  }, [fetchPage, take, resetSession]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || atEnd || !cursor.current) return;
    const g = gen.current;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const rows = await fetchPage(false);
      if (g !== gen.current) return; // a refresh superseded this page
      const fresh = take(rows);
      // A page that adds nothing new means we are genuinely at the end — stop,
      // rather than letting the tail observer spin on it.
      if (fresh.length) setPulses((rs) => [...(rs || []), ...fresh]);
      else setAtEnd(true);
    } catch (err) { logFeedError("pulse", "next page", err); /* keep what we have */ }
    finally { loadingRef.current = false; setLoadingMore(false); }
  }, [fetchPage, atEnd, take]);

  /** Fresh discovery session — pull-to-refresh, tab return, end-of-feed CTA. */
  const reload = useCallback(async () => {
    resetSession();
    setAtEnd(false);
    setExhausted(false);
    setRefreshing(true);
    try {
      const r = take(await fetchPage(true));
      setPulses(r);
      setOver({});
      setActive(0);
      target.current = 0;
      scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { logFeedError("pulse", "refresh", err); setPulses((x) => x || []); }
    finally { setRefreshing(false); }
  }, [fetchPage, take, resetSession]);

  // Only auto-refresh on tab return when the user is still on the first pulse —
  // otherwise returning to the tab would yank them out of a deep scroll position.
  const autoReload = useCallback(() => { if (activeRef.current === 0) reload(); }, [reload]);
  useAutoRefresh(autoReload);

  // Pull-to-refresh competes with the vertical swipe between pulses, so it is only
  // armed at the very top of the first slide.
  const { pull, refreshing: pulling } = usePullToRefresh(reload, { disabled: !(atTop && active === 0) });

  /* ------------------------------------------------------------ navigation --- */

  const goTo = useCallback((idx: number) => {
    const root = scroller.current;
    const node = root?.querySelector(`[data-slide="${idx}"]`);
    if (!root || !node) return;
    target.current = idx;
    // Scroll the feed only; scrollIntoView would also scroll the page around it.
    const top = root.scrollTop + node.getBoundingClientRect().top - root.getBoundingClientRect().top;
    root.scrollTo({ top, behavior: "smooth" });
  }, []);

  const step = useCallback((dir: number) => {
    goTo(clampSlide(target.current + dir, totalSlides));
  }, [goTo, totalSlides]);

  // Once the feed comes to rest (after a swipe, a key press or a wheel step), the
  // slide it rests on is where the next step counts from.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      setAtTop(root.scrollTop <= 4);
      clearTimeout(settle);
      settle = setTimeout(() => {
        if (root.clientHeight) target.current = Math.round(root.scrollTop / root.clientHeight);
      }, 150);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => { root.removeEventListener("scroll", onScroll); clearTimeout(settle); };
  }, [hasSlides]);

  // The visible slide drives `active` (which pulse plays and counts a view).
  useEffect(() => {
    const root = scroller.current;
    if (!root || !list.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            setActive(Number(e.target.getAttribute("data-slide")) || 0);
          }
        }
      },
      { root, threshold: [0.6] }
    );
    root.querySelectorAll("[data-slide]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [list.length]);

  // Arrow keys step one pulse, unless a sheet or a text field owns the keyboard.
  useEffect(() => {
    const onKey = (e) => {
      if (document.body.style.overflow === "hidden") return; // a sheet/modal is open
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowDown") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); step(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  // Wheel and trackpad: one gesture moves exactly one pulse. Pinch-zoom (ctrlKey)
  // and sideways swipes are left to the browser. Sheets and modals render in a
  // portal, so scrolling inside them never reaches this listener.
  useEffect(() => {
    const el = stage.current;
    const root = scroller.current;
    if (!el || !root) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      const r = wheelPage(wheel.current, Date.now(), wheelPixels(e.deltaY, e.deltaMode, root.clientHeight));
      wheel.current = r.state;
      if (r.step) step(r.step);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [hasSlides, step]);

  // Prefetch the next page well before the tail.
  useEffect(() => {
    if (list.length && active >= list.length - 3) loadMore();
  }, [active, list.length, loadMore]);

  /* ---------------------------------------------------------------- render --- */

  const patch = useCallback((pulseId: string, p: Record<string, any>) => {
    setOver((o) => ({ ...o, [pulseId]: { ...o[pulseId], ...p } }));
  }, []);

  // The id stays in `seenIds` on purpose: a deleted / "not interested" pulse must
  // not reappear if a later page still carries it.
  const removePulse = (id: string) => setPulses((rs) => (rs || []).filter((r) => rid(r) !== id));

  const slide = "h-[calc(100dvh-13rem)] min-h-[420px] lg:h-[calc(100dvh-10.5rem)]";

  return (
    <div>
      <PullToRefreshIndicator pull={pull} refreshing={pulling} />

      {/* Refresh is gesture-only: pull down on slide 0. No button in the header. */}
      <header className="mb-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Pulse</h1>
          <p className="truncate text-sm text-ink-500">
            {exhausted && list.length
              ? "You're all caught up — replaying top Pulses."
              : "Short-form medical teaching from verified clinicians."}
          </p>
        </div>
      </header>

      {pulses === null ? (
        <TileGridSkeleton count={1} className={slide} tile="h-full w-full rounded-3xl" />
      ) : list.length === 0 ? (
        <div className={`card grid ${slide} place-items-center gap-2 text-center`}>
          <div className="grid place-items-center gap-2">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600"><Play size={24} /></span>
            <p className="text-lg font-semibold text-ink-900">No Pulses yet</p>
            <p className="max-w-xs text-sm text-ink-500">Short clinical videos from people you follow will show up here.</p>
          </div>
        </div>
      ) : (
        <div ref={stage} className="relative">
          <div
            ref={scroller}
            className={`no-scrollbar ${slide} snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-3xl`}
          >
            {list.map((r, idx) => (
              <section
                key={rid(r)}
                data-slide={idx}
                className={`flex ${slide} w-full snap-start snap-always items-center justify-center`}
              >
                <PulseCard
                  pulse={r}
                  active={idx === active}
                  over={over[rid(r)] || {}}
                  onPatch={patch}
                  muted={muted}
                  onToggleMute={() => setMuted((m) => !m)}
                  onRemoved={removePulse}
                  onEnded={() => goTo(Math.min(idx + 1, list.length - 1))}
                  loop={atEnd && idx === list.length - 1}
                  className="h-full w-full max-w-full rounded-2xl sm:aspect-[9/16] sm:w-auto sm:rounded-3xl"
                />
              </section>
            ))}

            {/* tail: end-of-feed / loading the next page */}
            {(loadingMore || atEnd) && (
              <section data-slide={list.length} className={`flex ${slide} w-full snap-start flex-col items-center justify-center gap-3 text-center`}>
                {loadingMore ? (
                  <Loader2 size={24} className="animate-spin text-brand-600" />
                ) : (
                  <>
                    <p className="text-lg font-semibold text-ink-900">That's every Pulse for now</p>
                    <p className="max-w-xs text-sm text-ink-500">Refresh to start a new discovery session.</p>
                    <button onClick={reload} disabled={refreshing} className="btn-primary mt-1 px-4 py-2 text-sm">
                      <RefreshCw size={15} className={refreshing ? "animate-spin" : undefined} /> <Roll>Refresh</Roll>
                    </button>
                  </>
                )}
              </section>
            )}
          </div>

          {/* desktop up/down nav */}
          <div className="pointer-events-none absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
            <button
              onClick={() => step(-1)}
              disabled={active === 0}
              aria-label="Previous Pulse"
              className="press pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-ink-950/40 text-white backdrop-blur transition hover:bg-ink-950/60 disabled:opacity-30"
            >
              <ChevronUp size={20} />
            </button>
            <button
              onClick={() => step(1)}
              disabled={active >= totalSlides - 1}
              aria-label="Next Pulse"
              className="press pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-ink-950/40 text-white backdrop-blur transition hover:bg-ink-950/60 disabled:opacity-30"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
