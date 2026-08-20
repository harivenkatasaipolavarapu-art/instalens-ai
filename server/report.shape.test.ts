import { describe, expect, it } from "vitest";
import { createReportFilename, reportJsonSchema } from "./routers";
import { canAccessAnalysis } from "./db";
import { buildBusinessDnaPdf, reportPdfFilename } from "../shared/reportPdf";

describe("Business DNA report contract", () => {
  it("contains the required business intelligence sections", () => {
    const properties = reportJsonSchema.properties as Record<string, unknown>;
    expect(properties).toHaveProperty("businessCategory");
    expect(properties).toHaveProperty("services");
    expect(properties).toHaveProperty("scores");
    expect(properties).toHaveProperty("contentThemes");
    expect(properties).toHaveProperty("personas");
    expect(properties).toHaveProperty("recommendations");
    expect(reportJsonSchema.required).toEqual(expect.arrayContaining(["businessCategory", "scores", "personas", "recommendations"]));
  });

  it("creates stable PDF download filenames", () => {
    expect(createReportFilename("brightbakery")).toBe("instalens-brightbakery-report.pdf");
    expect(reportPdfFilename(null)).toBe("instalens-business-report.pdf");
  });

  it("generates a real PDF byte stream", async () => {
    const bytes = await buildBusinessDnaPdf({ businessCategory: "Local bakery", services: ["Custom cakes"], audienceIndicators: ["Celebration shoppers"], scores: { clarity: { score: 80 }, trust: { score: 70 }, consistency: { score: 75 }, discoverability: { score: 65 }, conversionReadiness: { score: 60 } }, recommendations: [{ priority: "High", title: "Add pricing highlight", detail: "Make price ranges easier to find." }] }, "https://instagram.com/brightbakery", 70, "brightbakery");
    expect(bytes.length).toBeGreaterThan(500);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
  });
});

describe("analysis access control", () => {
  it("allows the owner and rejects another user", () => {
    expect(canAccessAnalysis(7, 7)).toBe(true);
    expect(canAccessAnalysis(7, 8)).toBe(false);
  });
});
