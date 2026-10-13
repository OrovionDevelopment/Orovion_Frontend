"use client";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@/lib/router";
import { Bookmark, Play } from "lucide-react";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/Primitives";
import { useAuth } from "@/context/AuthContext";
import { dok } from "@/lib/api";
import { cn, pulsePoster } from "@/lib/utils";
import { SAVED_TABS as TABS, savedTypeFor, splitSaved, appendSaved } from "@/lib/savedItems";

/**
 * Private Saved repository (docs/feed.md §6) — visible only to the owner,
 * organized by content category. Reads the unified GET /api/saved?type=…, which
 * filters per category server-side and says which rows are Pulses; see
 * src/lib/savedItems.ts for why the old /feed/saved?tab=… source was wrong.
 */
const idOf = (x) => x?._id || x?.id;

export default function Saved() {
  const { demo } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState(null); // { pulses, posts } | null while loading
  const [cursor, setCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Which tab the newest request belongs to. A 'Load more' that resolves after
  // the user switched tabs must be dropped, or it appends the old tab's items
  // (and its cursor) to the new tab.
  const tabRef = useRef(tab);

  useEffect(() => {
    tabRef.current = tab;
    let alive = true;
    setItems(null);
    setCursor(null);
    setFailed(false);
    setLoadingMore(false);
    dok.saved
      .list(savedTypeFor(tab))
      .then((d) => {
        if (!alive) return;
        setItems(splitSaved(d?.data));
        setCursor(d?.hasMore ? d.nextCursor : null);
      })
      .catch(() => { if (alive) { setItems({ pulses: [], posts: [] }); setFailed(true); } });
    return () => { alive = false; };
  }, [tab, reloadKey]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    const forTab = tab;
    setLoadingMore(true);
    try {
      const d = await dok.saved.list(savedTypeFor(forTab), cursor);
      if (tabRef.current !== forTab) return; // tab changed while loading
      setItems((cur) => appendSaved(cur, splitSaved(d?.data)));
      setCursor(d?.hasMore ? d.nextCursor : null);
    } catch { /* keep what we have; the button stays for a retry */ }
    finally { if (tabRef.current === forTab) setLoadingMore(false); }
  };

  const pulses = items?.pulses || [];
  const posts = items?.posts || [];
  // Only empty when there is truly nothing left to load — unsaving every
  // loaded card must still leave 'Load more' reachable.
  const empty = items !== null && pulses.length === 0 && posts.length === 0 && !cursor;

  // Tapping the (already-saved) bookmark un-saves → drop the card; restore it if the call fails.
  const onSavedChange = (post, isSaved) => {
    const id = idOf(post);
    setItems((x) => {
      const list = x?.posts || [];
      const nextPosts = isSaved
        ? (list.some((y) => idOf(y) === id) ? list : [post, ...list])
        : list.filter((y) => idOf(y) !== id);
      return { pulses: x?.pulses || [], posts: nextPosts };
    });
  };

  return (
    <div className="mx-auto max-w-xl pb-24">
      <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold text-ink-900">
        <Bookmark size={22} className="text-brand-600" /> Saved
      </h1>
      <p className="text-sm text-ink-500">Your private bookmarks — only you can see this.</p>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "press whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition",
              tab === t.key ? "bg-brand-600 text-white shadow-glow" : "bg-surface text-ink-600 ring-1 ring-ink-900/[.06] hover:bg-brand-50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {items === null ? (
        <div className="mt-5 space-y-5">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : failed ? (
        <div className="card mt-5 grid place-items-center gap-3 py-14 text-center">
          <p className="font-semibold text-ink-900">Couldn't load your saved items</p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="press rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      ) : empty ? (
        <div className="card mt-5 grid place-items-center gap-2 py-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600"><Bookmark size={20} /></span>
          <p className="font-semibold text-ink-900">Nothing saved here yet</p>
          <p className="max-w-xs text-sm text-ink-500">Tap the bookmark on any post, case, paper or Pulse to keep it for later.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {pulses.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {pulses.map((r) => (
                <button key={idOf(r)} onClick={() => nav("/app/pulse")} className="press group relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink-950">
                  {pulsePoster(r) && <img src={pulsePoster(r)} alt="" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />}
                  <span className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent" />
                  <span className="absolute bottom-2 left-2 right-2 truncate text-left text-xs font-semibold text-white">{r.caption}</span>
                  <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-ink-950/40 text-white backdrop-blur"><Play size={13} /></span>
                </button>
              ))}
            </div>
          )}
          {posts.map((p) => (
            <PostCard
              key={idOf(p)}
              post={{ ...p, isSaved: true }}
              demo={demo}
              onRemoved={(pid) => setItems((x) => ({ pulses: x?.pulses || [], posts: (x?.posts || []).filter((y) => idOf(y) !== pid) }))}
              onSavedChange={onSavedChange}
            />
          ))}
          {cursor && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="press mx-auto block rounded-full bg-surface px-5 py-2 text-sm font-semibold text-ink-700 ring-1 ring-ink-900/[.06] hover:bg-brand-50 disabled:opacity-60"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
