import { describe, expect, it } from "vitest";
import { rankDiscoveryRows, validateDiscoveryScope } from "../shared/discovery";

describe("top profiles discovery", () => {
  it("requires category, location, and a bounded approved URL dataset", () => {
    expect(validateDiscoveryScope("bakeries", "Mumbai", ["https://instagram.com/a"])).toBe(true);
    expect(validateDiscoveryScope("", "Mumbai", ["https://instagram.com/a"])).toBe(false);
    expect(validateDiscoveryScope("bakeries", "", ["https://instagram.com/a"])).toBe(false);
    expect(validateDiscoveryScope("bakeries", "Mumbai", [])).toBe(false);
  });

  it("returns the requested top 10 or top 50 in descending order", () => {
    const rows = Array.from({ length: 12 }, (_, index) => ({ username: `profile-${index}`, average: index }));
    expect(rankDiscoveryRows(rows, 10)).toHaveLength(10);
    expect(rankDiscoveryRows(rows, 10)[0].average).toBe(11);
    expect(rankDiscoveryRows(rows, 50)).toHaveLength(12);
  });
});
