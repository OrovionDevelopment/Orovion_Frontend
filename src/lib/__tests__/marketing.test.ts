import { describe, it, expect } from "vitest";
import { LANDING_FAQ, CONTACT_FAQ, ABOUT_FAQ, SERVICES_FAQ, JOURNAL_FAQ, NAV_LINKS, SITEMAP, HOME, SERVICES } from "../marketing";
import { ALL_FAQ_ITEMS } from "../faq";

const questions = new Set(ALL_FAQ_ITEMS.map(([q]) => q));

describe("marketing FAQ selections", () => {
  // The marketing FAQs reuse Help center answers; if a question is renamed in
  // faq.ts the selection must follow, never silently fall out of sync.
  it.each([["landing", LANDING_FAQ], ["contact", CONTACT_FAQ], ["about", ABOUT_FAQ], ["services", SERVICES_FAQ], ["journal", JOURNAL_FAQ]] as const)("%s FAQ only uses Help center questions", (_, items) => {
    expect(items.length).toBeGreaterThanOrEqual(4);
    for (const [q, a] of items) {
      expect(questions.has(q)).toBe(true);
      expect(a.length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate questions", () => {
    for (const items of [LANDING_FAQ, CONTACT_FAQ, ABOUT_FAQ, SERVICES_FAQ, JOURNAL_FAQ]) {
      expect(new Set(items.map(([q]) => q)).size).toBe(items.length);
    }
  });
});

describe("site links", () => {
  it("points every nav and sitemap link at an internal path", () => {
    for (const l of [...NAV_LINKS, ...SITEMAP.flat()]) expect(l.href.startsWith("/")).toBe(true);
  });
});

describe("services", () => {
  it("gives every service a unique, URL-safe slug", () => {
    const slugs = SERVICES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("links each landing card's Read more to its own section of /services", () => {
    expect(HOME.services.map((c) => c.href)).toEqual(SERVICES.map((s) => `/services#${s.slug}`));
  });
});

describe("journal links", () => {
  it("sends the home community CTA to the journal page", () => {
    expect(HOME.community.cta.to).toBe("/journal");
  });

  it("lists the journal in the footer sitemap", () => {
    expect(SITEMAP.flat().some((l) => l.href === "/journal")).toBe(true);
  });
});
