export function validateDiscoveryScope(category: string, location: string, urls: string[]) {
  return Boolean(category.trim() && location.trim() && urls.length > 0 && urls.length <= 50);
}

export function rankDiscoveryRows(rows: any[], limit: 10 | 50) {
  return [...rows].sort((a, b) => (b.average ?? 0) - (a.average ?? 0)).slice(0, limit);
}
