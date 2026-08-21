import { describe, expect, it } from "vitest";
import { buildDeterministicScores } from "./routers";

describe("deterministic Business DNA scoring", () => {
  it("returns the same scores for identical signals", () => {
    const signals = { bio: "Custom cakes and desserts. DM to order.", title: "Bright Bakery", captions: ["Birthday cakes #cakes", "Wedding desserts #desserts"], hashtags: ["#cakes", "#desserts", "#bakery"], contactInfo: { emails: ["hello@example.com"], phones: [], links: ["https://example.com"] } };
    const report = { services: ["Custom cakes", "Desserts"] };
    expect(buildDeterministicScores(signals, report)).toEqual(buildDeterministicScores(signals, report));
  });

  it("changes scores when the available evidence changes", () => {
    const sparse = buildDeterministicScores({ bio: "", title: "", captions: [], hashtags: [], contactInfo: { emails: [], phones: [], links: [] } }, { services: [] });
    const rich = buildDeterministicScores({ bio: "Custom cakes and desserts for birthdays and weddings. DM to order in Mumbai.", title: "Bright Bakery", captions: ["Birthday cakes #cakes", "Wedding desserts #desserts", "Behind the scenes #bakery"], hashtags: ["#cakes", "#desserts", "#bakery", "#mumbai"], contactInfo: { emails: ["hello@example.com"], phones: ["+911234567890"], links: ["https://example.com"] } }, { services: ["Custom cakes", "Desserts", "Wedding cakes"] });
    expect(rich.clarity.score).toBeGreaterThan(sparse.clarity.score);
    expect(rich.trust.score).toBeGreaterThan(sparse.trust.score);
    expect(rich.discoverability.score).toBeGreaterThan(sparse.discoverability.score);
  });

  it("returns all exact dimensions with evidence-based explanations", () => {
    const scores = buildDeterministicScores({ bio: "", title: "", captions: [], hashtags: [], contactInfo: { emails: [], phones: [], links: [] } }, { services: [] });
    expect(Object.keys(scores)).toEqual(["clarity", "trust", "consistency", "discoverability", "conversionReadiness"]);
    expect(scores.trust.explanation).toContain("missing");
    expect(scores.discoverability.score).toBeGreaterThanOrEqual(0);
  });
});
