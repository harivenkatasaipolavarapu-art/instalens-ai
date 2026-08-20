import { describe, expect, it } from "vitest";
import { isInstagramProfileUrl } from "./routers";

describe("Instagram profile URL validation", () => {
  it("accepts public profile URLs", () => {
    expect(isInstagramProfileUrl("https://instagram.com/brightbakery")).toBe(true);
    expect(isInstagramProfileUrl("https://www.instagram.com/local-studio/")).toBe(true);
  });

  it("rejects non-profile and non-Instagram URLs", () => {
    expect(isInstagramProfileUrl("https://example.com/brightbakery")).toBe(false);
    expect(isInstagramProfileUrl("https://instagram.com/explore")).toBe(true);
    expect(isInstagramProfileUrl("not-a-url")).toBe(false);
    expect(isInstagramProfileUrl("https://instagram.com/p/ABC123")).toBe(false);
  });
});
