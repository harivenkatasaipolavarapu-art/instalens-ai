import { describe, expect, it } from "vitest";
import { buildComparisonChartData } from "../shared/historyComparison";
import { buildDeterministicScores } from "../shared/scoring";

describe("history comparison", () => {
  it("creates five graph rows for two or more accounts", () => {
    const rows = buildComparisonChartData([
      { username: "alpha", report: { scores: { clarity: { score: 60 }, trust: { score: 61 }, consistency: { score: 62 }, discoverability: { score: 63 }, conversionReadiness: { score: 64 } } } },
      { username: "beta", report: { scores: { clarity: { score: 70 }, trust: { score: 71 }, consistency: { score: 72 }, discoverability: { score: 73 }, conversionReadiness: { score: 74 } } } },
    ]);
    expect(rows).toHaveLength(5);
    expect(rows[0]).toMatchObject({ dimension: "Clarity", alpha: 60, beta: 70 });
    expect(rows[4]).toMatchObject({ dimension: "Conversion Readiness", alpha: 64, beta: 74 });
  });

  it("labels evidence, inference, and missing signals", () => {
    const scores = buildDeterministicScores({ bio: "", title: "", captions: [], hashtags: [], contactInfo: { emails: [], phones: [], links: [] } }, { services: [] });
    expect(scores.clarity.explanation).toContain("Evidence:");
    expect(scores.clarity.explanation).toContain("AI inference:");
    expect(scores.clarity.explanation).toContain("Missing signals:");
  });
});
