export const timelineKeys = ["clarity", "trust", "consistency", "discoverability", "conversionReadiness"] as const;

export function buildTimelineData(rows: any[]) {
  return rows.map((item, index) => ({
    snapshot: `Snapshot ${index + 1}`,
    date: new Date(item.createdAt).toLocaleDateString(),
    ...Object.fromEntries(timelineKeys.map(key => [key, item.report?.scores?.[key]?.score ?? 0])),
  }));
}
