import { describe, it, expect } from "vitest";
import { LANDING_FAQ, CONTACT_FAQ, ABOUT_FAQ, SERVICES_FAQ, JOURNAL_FAQ, NAV_LINKS, SITEMAP, HOME, SERVICES, SERVICES_PAGE } from "../marketing";
import { ALL_FAQ_ITEMS } from "../faq";

const questions = new Set(ALL_FAQ_ITEMS.map(([q]) => q));

describe("marketing FAQ selections", () => {
  // The marketing FAQs reuse Help center answers; if a question is renamed in
  // faq.ts the selection must follow, never silently fall out of sync.
  // The landing FAQ is written in marketing.ts on purpose, so it is not checked here.
  it.each([["contact", CONTACT_FAQ], ["about", ABOUT_FAQ], ["services", SERVICES_FAQ], ["journal", JOURNAL_FAQ]] as const)("%s FAQ only uses Help center questions", (_, items) => {
    expect(items.length).toBeGreaterThanOrEqual(4);
    for (const [q, a] of items) {
      expect(questions.has(q)).toBe(true);
      expect(a.length).toBeGreaterThan(0);
    }
  });

  it("has a complete landing FAQ", () => {
    expect(LANDING_FAQ.length).toBeGreaterThanOrEqual(4);
    for (const [q, a] of LANDING_FAQ) {
      expect(q.length).toBeGreaterThan(0);
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

  it("links each landing card's Read more to its own story on /services", () => {
    expect(HOME.services.map((c) => c.href)).toEqual(SERVICES.map((s) => `/services#${s.slug}`));
  });

  it("has one /services story per service, so no card lands on a missing anchor", () => {
    expect(SERVICES_PAGE.stories.map((s) => s.slug)).toEqual(SERVICES.map((s) => s.slug));
  });
});

describe("home: get the app", () => {
  it("sends the QR, badges and button to the mobile-app page", () => {
    expect(HOME.app.to).toBe("/mobile-app");
  });
  it("has a headline, a line of copy, facts and both device prompts", () => {
    expect(HOME.app.title.length).toBeGreaterThan(0);
    expect(HOME.app.accent.length).toBeGreaterThan(0);
    expect(HOME.app.facts.length).toBe(3);
    expect(HOME.app.scan.title).toMatch(/scan/i);
    expect(HOME.app.tap.cta.length).toBeGreaterThan(0);
  });
});

describe("journal links", () => {
  it("opens a journal article from every home community card", () => {
    expect(HOME.community.posts.length).toBeGreaterThan(0);
    for (const p of HOME.community.posts) expect(p.href.startsWith("/journal/")).toBe(true);
  });

  it("keeps footer anchors to home sections that still exist", () => {
    // in-page anchors only — the removed home stories took #stories with them
    const anchors = SITEMAP.flat().map((l) => l.href).filter((h) => h.startsWith("/#"));
    for (const h of anchors) expect(["/#how-it-works", "/#community", "/#features", "/#contact", "/#get-the-app"]).toContain(h);
  });

  it("lists the journal in the footer sitemap", () => {
    expect(SITEMAP.flat().some((l) => l.href === "/journal")).toBe(true);
  });
});
