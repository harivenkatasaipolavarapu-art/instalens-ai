export const agencyScoreKeys = ["clarity", "trust", "consistency", "discoverability", "conversionReadiness"] as const;

export function scoreAverage(report: any) {
  return Math.round(agencyScoreKeys.reduce((sum, key) => sum + (report?.scores?.[key]?.score ?? 0), 0) / agencyScoreKeys.length);
}

export function rankAnalyses(rows: any[]) {
  return [...rows].sort((a, b) => scoreAverage(b.report) - scoreAverage(a.report));
}

export function scoreDeltas(first: any, latest: any) {
  if (!first || !latest) return [];
  return agencyScoreKeys.map(key => ({ key, delta: (latest.scores?.[key]?.score ?? 0) - (first.scores?.[key]?.score ?? 0) }));
}

export function buildOutreachPrompt(profileUrl: string, username: string | null | undefined, report: any) {
  return `Draft a concise, respectful B2B outreach message for ${username ? `@${username}` : profileUrl}. Use only this Business DNA report: ${JSON.stringify(report)}`;
}

export function hasFiveDimensionScores(row: any) {
  return agencyScoreKeys.every(key => typeof row?.report?.scores?.[key]?.score === "number");
}

export function formatLeadCard(row: any) {
  return `Lead card — ${row.username ? `@${row.username}` : row.profileUrl}\nCategory: ${row.report?.businessCategory ?? "Unknown"}\nAudience: ${(row.report?.audienceIndicators ?? []).join(", ")}\nTop opportunity: ${row.report?.recommendations?.[0]?.title ?? "Review profile CTA"}\nBusiness DNA signal: ${row.average ?? scoreAverage(row.report)}/100`;
}
