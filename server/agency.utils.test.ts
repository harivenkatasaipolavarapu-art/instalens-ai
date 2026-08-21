import { describe, expect, it } from "vitest";
import { buildOutreachPrompt, formatLeadCard, hasFiveDimensionScores, rankAnalyses, scoreDeltas, scoreAverage } from "../shared/agencyUtils";

const report = (value: number) => ({ scores: { clarity: { score: value }, trust: { score: value }, consistency: { score: value }, discoverability: { score: value }, conversionReadiness: { score: value } }, businessCategory: "Local bakery", audienceIndicators: ["Celebration shoppers"], recommendations: [{ title: "Add pricing highlight" }] });

describe("agency utilities", () => {
  it("ranks analyses by overall Business DNA signal", () => {
    const rows = rankAnalyses([{ username: "low", report: report(40) }, { username: "high", report: report(80) }]);
    expect(rows.map(row => row.username)).toEqual(["high", "low"]);
    expect(scoreAverage(rows[0].report)).toBe(80);
  });

  it("calculates per-dimension deltas", () => {
    const deltas = scoreDeltas(report(40), report(55));
    expect(deltas).toHaveLength(5);
    expect(deltas.every(item => item.delta === 15)).toBe(true);
  });

  it("builds an outreach prompt grounded in the supplied report", () => {
    const prompt = buildOutreachPrompt("https://instagram.com/brightbakery", "brightbakery", report(72));
    expect(prompt).toContain("@brightbakery");
    expect(prompt).toContain("Business DNA report");
  });

  it("validates the five-dimension batch output shape", () => {
    expect(hasFiveDimensionScores({ report: report(72) })).toBe(true);
    expect(hasFiveDimensionScores({ report: { scores: { clarity: { score: 72 } } } })).toBe(false);
  });

  it("formats a CRM-ready lead card", () => {
    expect(formatLeadCard({ username: "brightbakery", profileUrl: "https://instagram.com/brightbakery", report: report(72), average: 72 })).toContain("Top opportunity: Add pricing highlight");
  });
});
