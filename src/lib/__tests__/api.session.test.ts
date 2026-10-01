import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Session restore: where the CSRF value comes from, and that a refresh is
 * single-flighted.
 *
 * REGRESSION GUARDS for two separate causes of "I get logged out when I reopen
 * the site":
 *
 * 1. The CSRF header used to come only from `localStorage.dl_csrf`. The server
 *    compares it against the `csrfToken` COOKIE, and localStorage is scoped to one
 *    exact origin while the cookie is scoped to the whole domain — so a cleared
 *    localStorage, a visit to the apex instead of `www`, or a rotation in another
 *    tab all produced a 403 on refresh and a logout.
 * 2. The refresh token ROTATES on every use and the old session row is retired, so
 *    two concurrent refreshes mean the second is answered 401 "Session not found".
 *    The session restore, the socket reauth, the call client and the 401 interceptor
 *    each used to refresh independently.
 */

const h = vi.hoisted(() => {
  const posts: string[] = [];
  const instance = {
    get: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    post: vi.fn((url: string) => {
      posts.push(url);
      return Promise.resolve({
        data: { data: { accessToken: `AT${posts.length}`, csrfToken: `CS${posts.length}` } },
      });
    }),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: () => {} }, response: { use: () => {} } },
  };
  return { posts, instance };
});

vi.mock("axios", () => ({ default: { create: () => h.instance } }));

import { dok, TOKENS, refreshOnce } from "@/lib/api";

const refreshCalls = () => h.posts.filter((u) => u.includes("/auth/refresh-token"));

// The test environment is `node`, so neither global exists by default — which is
// itself the condition the guards in api.ts have to survive.
const setDocumentCookie = (cookie: string) => { (globalThis as any).document = { cookie }; };
const setLocalStorage = (impl: any) => { (globalThis as any).localStorage = impl; };

beforeEach(() => { h.posts.length = 0; });
afterEach(() => {
  delete (globalThis as any).document;
  delete (globalThis as any).localStorage;
});

describe("TOKENS.csrf — the cookie is authoritative", () => {
  it("prefers the csrfToken cookie over localStorage", () => {
    // The server compares our header against the cookie, so taking the value from
    // the cookie makes the double-submit match by construction. Preferring a stale
    // localStorage copy is what caused 403s after another tab rotated the pair.
    setDocumentCookie("foo=1; csrfToken=FROM_COOKIE; bar=2");
    setLocalStorage({ getItem: () => "FROM_STORAGE" });
    expect(TOKENS.csrf).toBe("FROM_COOKIE");
  });

  it("falls back to localStorage when the cookie is not readable", () => {
    setDocumentCookie("other=1");
    setLocalStorage({ getItem: (k: string) => (k === "dl_csrf" ? "FROM_STORAGE" : null) });
    expect(TOKENS.csrf).toBe("FROM_STORAGE");
  });

  it("url-decodes the cookie value", () => {
    setDocumentCookie("csrfToken=a%2Bb%3D");
    expect(TOKENS.csrf).toBe("a+b=");
  });

  it("does not match a cookie whose name merely ends in csrfToken", () => {
    setDocumentCookie("notcsrfToken=WRONG");
    expect(TOKENS.csrf).toBeNull();
  });

  it("survives localStorage throwing, and a missing document", () => {
    // Private-mode browsers throw on access rather than returning null, and this
    // getter runs inside the request interceptor — an exception would break every
    // request, not just the refresh.
    setLocalStorage({ getItem: () => { throw new Error("blocked"); } });
    expect(() => TOKENS.csrf).not.toThrow();
    expect(TOKENS.csrf).toBeNull();
  });

  it("set() still records the value, and tolerates a blocked write", () => {
    const seen: Record<string, string> = {};
    setLocalStorage({ setItem: (k: string, v: string) => { seen[k] = v; }, getItem: () => null });
    TOKENS.set({ accessToken: "a", csrfToken: "c" });
    expect(seen.dl_csrf).toBe("c");

    setLocalStorage({ setItem: () => { throw new Error("blocked"); }, getItem: () => null });
    expect(() => TOKENS.set({ accessToken: "a", csrfToken: "c" })).not.toThrow();
  });
});

describe("refreshOnce — one in-flight refresh per tab", () => {
  it("coalesces concurrent callers into a single request", async () => {
    const a = refreshOnce();
    const b = refreshOnce();
    const c = refreshOnce();
    expect(refreshCalls()).toHaveLength(1);
    await expect(Promise.all([a, b, c])).resolves.toEqual(["AT1", "AT1", "AT1"]);
  });

  it("is shared with dok.auth.refresh — they must not rotate against each other", async () => {
    const viaHelper = refreshOnce();
    const viaDok = dok.auth.refresh();
    expect(refreshCalls()).toHaveLength(1);
    await Promise.all([viaHelper, viaDok]);
  });

  it("starts a fresh request once the previous one has settled", async () => {
    await refreshOnce();
    await refreshOnce();
    expect(refreshCalls()).toHaveLength(2);
  });

  it("resolves with the new access token and stores it", async () => {
    setLocalStorage({ setItem: () => {}, getItem: () => null });
    await expect(refreshOnce()).resolves.toBe("AT1");
    expect(TOKENS.access).toBe("AT1");
  });

  it("does not cache a rejection — the next caller retries", async () => {
    h.instance.post.mockImplementationOnce(() => Promise.reject(new Error("boom")));
    await expect(refreshOnce()).rejects.toThrow("boom");
    await expect(refreshOnce()).resolves.toMatch(/^AT/);
  });
});
