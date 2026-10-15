/**
 * Account-block messages.
 *
 * A suspended, archived or expired account is signed out by the API; the
 * reason must survive that sign-out (sessionStorage, read once) so the login
 * screen can explain it instead of showing nothing. Runs in vitest's node
 * environment, so `window` is stubbed.
 */
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { blockFromError, stashBlock, takeBlock, describeBlock, blockMessage } from "../accountBlock";

const memoryStorage = (): Storage => {
  const map = new Map<string, string>();
  return {
    get length() { return map.size; },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => { map.delete(k); },
    setItem: (k, v) => { map.set(k, String(v)); },
  };
};

beforeEach(() => { vi.stubGlobal("window", { sessionStorage: memoryStorage() }); });
afterEach(() => { vi.unstubAllGlobals(); });

const err = (data: unknown) => ({ response: { status: 403, data: { success: false, data, message: "x" } } });

describe("blockFromError", () => {
  test("recognises the three coded refusals", () => {
    expect(blockFromError(err({ code: "ACCOUNT_SUSPENDED", suspendedUntil: null, permanent: true, reason: "Spam" })))
      .toEqual({ code: "ACCOUNT_SUSPENDED", suspendedUntil: null, permanent: true, reason: "Spam" });
    expect(blockFromError(err({ code: "ACCOUNT_ARCHIVED" }))?.code).toBe("ACCOUNT_ARCHIVED");
    expect(blockFromError(err({ code: "RECOVERY_EXPIRED" }))?.code).toBe("RECOVERY_EXPIRED");
  });

  test("anything else is not a block", () => {
    expect(blockFromError(err(null))).toBeNull();
    expect(blockFromError(err({ code: "ACCOUNT_ACTIVE" }))).toBeNull();
    expect(blockFromError({})).toBeNull();
    expect(blockFromError(undefined)).toBeNull();
  });
});

describe("stash / take", () => {
  test("survives the sign-out and is read exactly once", () => {
    stashBlock({ code: "ACCOUNT_ARCHIVED" });
    expect(takeBlock()).toEqual({ code: "ACCOUNT_ARCHIVED" });
    expect(takeBlock()).toBeNull();
  });

  test("garbage in storage is ignored", () => {
    window.sessionStorage.setItem("dl:account-block", "{not json");
    expect(takeBlock()).toBeNull();
    window.sessionStorage.setItem("dl:account-block", JSON.stringify({ code: "HACKED" }));
    expect(takeBlock()).toBeNull();
  });

  test("no window (SSR) is safe", () => {
    vi.unstubAllGlobals();
    expect(() => stashBlock({ code: "ACCOUNT_ARCHIVED" })).not.toThrow();
    expect(takeBlock()).toBeNull();
  });
});

describe("describeBlock", () => {
  test("timed suspension: when access returns, and why", () => {
    const d = describeBlock({ code: "ACCOUNT_SUSPENDED", suspendedUntil: "2026-10-22T09:30:00.000Z", permanent: false, reason: "Spamming patients" }, "en-GB");
    expect(d.title).toBe("Your account is suspended");
    expect(d.body).toMatch(/You can sign in again from 22 Oct 2026/);
    expect(d.body).toMatch(/Reason: Spamming patients\./);
  });

  test("permanent suspension says there is no end date", () => {
    const d = describeBlock({ code: "ACCOUNT_SUSPENDED", suspendedUntil: null, permanent: true, reason: null });
    expect(d.body).toMatch(/no end date/);
    expect(d.body).not.toMatch(/Reason:/);
  });

  test("archived and expired explain what the person can still do", () => {
    expect(blockMessage({ code: "ACCOUNT_ARCHIVED" })).toMatch(/archived.*create a new account/);
    expect(blockMessage({ code: "RECOVERY_EXPIRED" })).toMatch(/recovery period has ended.*same phone number/);
  });
});
