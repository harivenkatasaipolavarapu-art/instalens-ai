import { describe, expect, it } from "vitest";
import { filterDiscoveryRows, formatDiscoveryCsv, getEvidenceConfidence, reportConfidenceLabel } from "../shared/discovery";

describe("discovery enhancements", () => {
  it("derives evidence confidence from available public signals", () => {
    expect(getEvidenceConfidence({ sourceSignals: { bio: "bio", title: "title", contactInfo: { links: ["site"] }, captions: ["caption"], hashtags: ["tag"] } })).toBe("High");
    expect(getEvidenceConfidence({ sourceSignals: { bio: "bio" } })).toBe("Low");
  });

  it("filters by minimum score and confidence", () => {
    const high = { average: 80, sourceSignals: { bio: "bio", title: "title", contactInfo: { links: ["site"] }, captions: ["caption"], hashtags: ["tag"] } };
    const low = { average: 80, sourceSignals: { bio: "bio" } };
    const below = { average: 40, sourceSignals: { bio: "bio", title: "title", contactInfo: { links: ["site"] }, captions: ["caption"], hashtags: ["tag"] } };
    expect(filterDiscoveryRows([high, low, below], 60, "All")).toEqual([high, low]);
    const medium = { average: 80, sourceSignals: { bio: "bio", title: "title" } };
    expect(filterDiscoveryRows([high, low, below], 0, "High")).toEqual([high, below]);
    expect(filterDiscoveryRows([high, medium, low], 0, "Medium")).toEqual([medium]);
    expect(filterDiscoveryRows([high, medium, low], 0, "Low")).toEqual([low]);
  });

  it("does not label rich source signals as insufficient evidence", () => {
    const confidence = getEvidenceConfidence({ sourceSignals: { bio: "A detailed business bio", title: "Business", contactInfo: { links: ["site"], emails: ["hello@example.com"], phones: ["1234567890"] }, captions: ["one", "two", "three"], hashtags: ["#one", "#two", "#three"] } });
    expect(confidence).not.toBe("Low");
    expect(reportConfidenceLabel({ bio: "A detailed business bio", title: "Business", contactInfo: { links: ["site"], emails: ["hello@example.com"], phones: ["1234567890"] }, captions: ["one", "two", "three"], hashtags: ["#one", "#two", "#three"] })).toBe("High evidence confidence");
  });

  it("formats all five scores into a CSV export", () => {
    const csv = formatDiscoveryCsv([{ username: "demo", profileUrl: "https://instagram.com/demo", average: 72, report: { scores: { clarity: { score: 70 }, trust: { score: 71 }, consistency: { score: 72 }, discoverability: { score: 73 }, conversionReadiness: { score: 74 } } }, sourceSignals: {} }]);
    expect(csv).toContain("Clarity,Trust,Consistency,Discoverability,Conversion Readiness");
    expect(csv).toContain('"demo"');
    expect(csv).toContain('"Low"');
  });
});
