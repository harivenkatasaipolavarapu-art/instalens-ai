export const comparisonDimensions = ["Clarity", "Trust", "Consistency", "Discoverability", "Conversion Readiness"] as const;
export const comparisonKeys = ["clarity", "trust", "consistency", "discoverability", "conversionReadiness"] as const;

export function buildComparisonChartData(rows: any[]) {
  return comparisonDimensions.map((dimension, index) => {
    const row: Record<string, number | string> = { dimension };
    const key = comparisonKeys[index];
    rows.forEach(item => { row[item.username ?? item.profileUrl] = item.report?.scores?.[key]?.score ?? 0; });
    return row;
  });
}
