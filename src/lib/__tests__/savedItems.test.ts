import { describe, it, expect } from "vitest";
import { SAVED_TABS, savedTypeFor, splitSaved, appendSaved } from "@/lib/savedItems";

describe("appendSaved — further pages never repeat an item", () => {
  it("appends new items and skips ids already shown", () => {
    const cur = { pulses: [{ id: "r1" }], posts: [{ id: "p1" }] };
    const next = { pulses: [{ id: "r1" }, { id: "r2" }], posts: [{ _id: "p1" }, { id: "p2" }] };
    expect(appendSaved(cur, next)).toEqual({ pulses: [{ id: "r1" }, { id: "r2" }], posts: [{ id: "p1" }, { id: "p2" }] });
  });

  it("handles a first page arriving with nothing loaded", () => {
    expect(appendSaved(null, { pulses: [{ id: "r1" }], posts: [] })).toEqual({ pulses: [{ id: "r1" }], posts: [] });
  });
});

/**
 * REGRESSION GUARDS for the Saved page. It used to read a posts-only endpoint
 * that ignored the tab (every tab showed the same list and the Pulse tab never
 * showed a Pulse), then guessed Pulses from videoUrl/thumbnailUrl, so a video
 * POST rendered as a Pulse.
 */
describe("savedTypeFor — every tab maps to a type /api/saved accepts", () => {
  it("maps each tab to its own type", () => {
    expect(savedTypeFor("all")).toBe("ALL");
    expect(savedTypeFor("post")).toBe("POST");
    expect(savedTypeFor("case_study")).toBe("CASE_STUDY");
    expect(savedTypeFor("research")).toBe("RESEARCH");
    expect(savedTypeFor("thesis")).toBe("THESIS");
    expect(savedTypeFor("pulse")).toBe("PULSE");
  });

  it("gives every visible tab a distinct type — no two tabs show the same list", () => {
    const types = SAVED_TABS.map((t) => savedTypeFor(t.key));
    expect(new Set(types).size).toBe(SAVED_TABS.length);
  });

  it("falls back to ALL for an unknown tab rather than a type the server rejects", () => {
    expect(savedTypeFor("bogus")).toBe("ALL");
  });
});

describe("splitSaved — classify by the server's contentType, never by media fields", () => {
  const pulse = { id: "r1", videoUrl: "v.mp4", caption: "a pulse" };
  const videoPost = { id: "p1", videoUrl: "post.mp4", thumbnailUrl: "t.jpg", content: "a video post" };
  const researchPost = { id: "p2", content: "paper" };

  it("puts PULSE rows in pulses and everything else in posts", () => {
    const out = splitSaved([
      { contentType: "PULSE", content: pulse },
      { contentType: "POST", content: videoPost },
      { contentType: "RESEARCH", content: researchPost },
    ]);
    expect(out.pulses).toEqual([pulse]);
    expect(out.posts).toEqual([videoPost, researchPost]);
  });

  it("keeps a video POST with a thumbnail as a post — the bug the old guess caused", () => {
    expect(splitSaved([{ contentType: "POST", content: videoPost }]).pulses).toEqual([]);
  });

  it("accepts a lower-case contentType", () => {
    expect(splitSaved([{ contentType: "pulse", content: pulse }]).pulses).toEqual([pulse]);
  });

  it("drops rows whose content was deleted, and survives an empty or missing page", () => {
    expect(splitSaved([{ contentType: "POST", content: null }])).toEqual({ pulses: [], posts: [] });
    expect(splitSaved(undefined)).toEqual({ pulses: [], posts: [] });
    expect(splitSaved([])).toEqual({ pulses: [], posts: [] });
  });
});
