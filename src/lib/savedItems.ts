/**
 * The Saved page's data rules, kept pure so they are unit-tested
 * (src/lib/__tests__/savedItems.test.ts).
 *
 * The page reads GET /api/saved?type=… — the unified saved list that filters by
 * category in SQL, includes Pulses, and labels every item with its real
 * `contentType`. It used to read /api/feed/saved?tab=…, a posts-only list that
 * ignored `tab` (every tab returned every saved post, and the Pulse tab never
 * returned a Pulse), and then GUESSED which items were Pulses from videoUrl /
 * thumbnailUrl — so video posts appeared as Pulses.
 */

export type SavedTab = "all" | "post" | "case_study" | "research" | "thesis" | "pulse";

export const SAVED_TABS: { key: SavedTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "post", label: "Posts" },
  { key: "case_study", label: "Case studies" },
  { key: "research", label: "Research" },
  { key: "thesis", label: "Theses" },
  { key: "pulse", label: "Pulse" },
];

// The `type` values GET /api/saved accepts. `PULSE` is the wire value for a Pulse.
const TYPE_FOR_TAB: Record<SavedTab, string> = {
  all: "ALL",
  post: "POST",
  case_study: "CASE_STUDY",
  research: "RESEARCH",
  thesis: "THESIS",
  pulse: "PULSE",
};

export const savedTypeFor = (tab: string): string => TYPE_FOR_TAB[tab as SavedTab] ?? "ALL";

type SavedRow = { contentType?: string; content?: Record<string, any> | null };

/**
 * Split one page of /api/saved rows into Pulses and posts by the server's own
 * `contentType` — never by guessing from media fields. Rows whose content was
 * deleted come back as `content: null` and are dropped.
 */
type Split = { pulses: Record<string, any>[]; posts: Record<string, any>[] };
const idOf = (x: Record<string, any>) => x?._id || x?.id;

/**
 * Append a further page, skipping ids already shown. Keyset paging makes overlap
 * rare, but an unsave + re-save between pages can repeat an item, which React
 * reports as a duplicate key.
 */
export function appendSaved(cur: Split | null | undefined, next: Split): Split {
  const add = (have: Record<string, any>[] = [], more: Record<string, any>[] = []) => {
    const seen = new Set(have.map(idOf));
    return [...have, ...more.filter((x) => !seen.has(idOf(x)))];
  };
  return { pulses: add(cur?.pulses, next.pulses), posts: add(cur?.posts, next.posts) };
}

export function splitSaved(rows: SavedRow[] | null | undefined) {
  const pulses: Record<string, any>[] = [];
  const posts: Record<string, any>[] = [];
  for (const row of rows || []) {
    if (!row || !row.content) continue;
    if (String(row.contentType).toUpperCase() === "PULSE") pulses.push(row.content);
    else posts.push(row.content);
  }
  return { pulses, posts };
}
