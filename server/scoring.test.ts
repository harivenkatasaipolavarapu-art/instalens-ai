import { describe, expect, it } from "vitest";
import { buildDeterministicScores } from "./routers";

describe("deterministic Business DNA scoring", () => {
  it("returns the same scores for identical signals", () => {
    const signals = { bio: "Custom cakes and desserts. DM to order.", title: "Bright Bakery", captions: ["Birthday cakes #cakes", "Wedding desserts #desserts"], hashtags: ["#cakes", "#desserts", "#bakery"], contactInfo: { emails: ["hello@example.com"], phones: [], links: ["https://example.com"] } };
    const report = { services: ["Custom cakes", "Desserts"] };
    expect(buildDeterministicScores(signals, report)).toEqual(buildDeterministicScores(signals, report));
  });

  it("returns all exact dimensions with evidence-based explanations", () => {
    const scores = buildDeterministicScores({ bio: "", title: "", captions: [], hashtags: [], contactInfo: { emails: [], phones: [], links: [] } }, { services: [] });
    expect(Object.keys(scores)).toEqual(["clarity", "trust", "consistency", "discoverability", "conversionReadiness"]);
    expect(scores.trust.explanation).toContain("missing");
    expect(scores.discoverability.score).toBeGreaterThanOrEqual(0);
  });
});
