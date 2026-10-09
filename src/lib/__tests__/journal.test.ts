import { describe, it, expect } from "vitest";
import { JOURNAL, findArticle, relatedArticles, readingMinutes } from "../journal";
import { HOME } from "../marketing";

describe("journal articles", () => {
  it("have unique, URL-safe slugs and complete content", () => {
    const slugs = JOURNAL.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const a of JOURNAL) {
      expect(a.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(a.sections.length).toBeGreaterThanOrEqual(2);
      for (const s of a.sections) expect(s.paragraphs.length).toBeGreaterThan(0);
    }
  });

  it("are what the home page's community cards open on Read more", () => {
    expect(HOME.community.posts.map((p) => p.href)).toEqual(JOURNAL.map((a) => `/journal/${a.slug}`));
  });

  it("finds an article by slug, or nothing", () => {
    expect(findArticle(JOURNAL[1].slug)).toBe(JOURNAL[1]);
    expect(findArticle("nope")).toBeUndefined();
  });

  it("suggests every other article, never the one being read", () => {
    for (const a of JOURNAL) {
      const more = relatedArticles(a.slug);
      expect(more).not.toContain(a);
      expect(more).toHaveLength(Math.min(2, JOURNAL.length - 1));
    }
  });

  it("estimates reading time at ~200 words a minute, at least 1", () => {
    const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");
    const art = (n: number) => ({ ...JOURNAL[0], lede: words(n), sections: [{ heading: "", paragraphs: [""] }] });
    expect(readingMinutes(art(10))).toBe(1);
    expect(readingMinutes(art(450))).toBe(3);
    for (const a of JOURNAL) expect(readingMinutes(a)).toBeGreaterThanOrEqual(1);
  });
});
