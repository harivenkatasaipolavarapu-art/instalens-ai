export function validateDiscoveryScope(category: string, location: string, urls: string[]) {
  return Boolean(category.trim() && location.trim() && urls.length > 0 && urls.length <= 50);
}

export function rankDiscoveryRows(rows: any[], limit: 10 | 50) {
  return [...rows].sort((a, b) => (b.average ?? 0) - (a.average ?? 0)).slice(0, limit);
}

export function getEvidenceConfidence(row: any): "High" | "Medium" | "Low" {
  const signals = row?.sourceSignals ?? {};
  const checks = [Boolean(signals.bio), Boolean(signals.title), Boolean(signals.contactInfo?.emails?.length || signals.contactInfo?.phones?.length || signals.contactInfo?.links?.length), Boolean(signals.captions?.length), Boolean(signals.hashtags?.length)];
  const count = checks.filter(Boolean).length;
  return count >= 4 ? "High" : count >= 2 ? "Medium" : "Low";
}

export function reportConfidenceLabel(sourceSignals: any) {
  const confidence = getEvidenceConfidence({ sourceSignals });
  return confidence === "Low" ? "Insufficient public evidence" : `${confidence} evidence confidence`;
}

export function filterDiscoveryRows(rows: any[], minimumScore: number, confidence: "All" | "High" | "Medium" | "Low") {
  return rows.filter(row => (row.average ?? 0) >= minimumScore && (confidence === "All" || getEvidenceConfidence(row) === confidence));
}

export function formatDiscoveryCsv(rows: any[]) {
  const header = ["Rank", "Username", "Profile URL", "Clarity", "Trust", "Consistency", "Discoverability", "Conversion Readiness", "Average", "Evidence Confidence"];
  const lines = rows.map((row, index) => [index + 1, row.username ?? "", row.profileUrl ?? "", ...["clarity", "trust", "consistency", "discoverability", "conversionReadiness"].map(key => row.report?.scores?.[key]?.score ?? 0), row.average ?? 0, getEvidenceConfidence(row)].map(value => `"${String(value).replaceAll('"', '""')}"`).join(","));
  return [header.join(","), ...lines].join("\n");
}
