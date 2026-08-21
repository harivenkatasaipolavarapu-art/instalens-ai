import { describe, expect, it } from "vitest";
import { buildTimelineData } from "../shared/agencyTimeline";
import { rankAnalyses, scoreAverage } from "../shared/agencyUtils";

const report = (value: number) => ({ scores: { clarity: { score: value }, trust: { score: value }, consistency: { score: value }, discoverability: { score: value }, conversionReadiness: { score: value } } });

describe("agency timeline and ranking", () => {
  it("builds ordered timeline rows from saved snapshots", () => {
    const rows = buildTimelineData([{ createdAt: "2026-01-01T00:00:00.000Z", report: report(40) }, { createdAt: "2026-01-02T00:00:00.000Z", report: report(64) }]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ snapshot: "Snapshot 1", clarity: 40 });
    expect(rows[1]).toMatchObject({ snapshot: "Snapshot 2", conversionReadiness: 64 });
  });

  it("ranks saved profiles by latest deterministic signal", () => {
    const ranked = rankAnalyses([{ username: "first", report: report(35) }, { username: "second", report: report(78) }]);
    expect(ranked[0].username).toBe("second");
    expect(scoreAverage(ranked[0].report)).toBe(78);
  });
});
