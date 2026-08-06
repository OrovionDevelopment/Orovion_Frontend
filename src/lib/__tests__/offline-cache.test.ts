import { describe, it, expect } from "vitest";
import { cacheKey } from "../offline-cache";

describe("cacheKey", () => {
  it("namespaces by user so accounts never collide", () => {
    expect(cacheKey("userA", "feed:home:all")).not.toBe(cacheKey("userB", "feed:home:all"));
  });

  it("is stable for the same (user, key)", () => {
    expect(cacheKey("userA", "feed:home:all")).toBe(cacheKey("userA", "feed:home:all"));
  });

  it("falls back to a 'guest' namespace when there is no user", () => {
    expect(cacheKey(null, "feed:home:all")).toBe("v1:guest:feed:home:all");
    expect(cacheKey(undefined, "feed:home:all")).toBe("v1:guest:feed:home:all");
  });

  it("carries the schema version prefix (for global invalidation)", () => {
    expect(cacheKey("userA", "x").startsWith("v1:")).toBe(true);
  });

  it("distinguishes different logical keys for the same user", () => {
    expect(cacheKey("userA", "feed:home:all")).not.toBe(cacheKey("userA", "feed:home:type:research"));
  });
});
