import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReportView } from "../client/src/pages/Home";

const report = {
  businessCategory: "Bakery",
  services: ["Custom cakes"],
  brandPersonality: ["Friendly"],
  audienceIndicators: ["Families"],
  scores: {
    clarity: { score: 70, explanation: "Evidence: bio present." },
    trust: { score: 70, explanation: "Evidence: contact path." },
    consistency: { score: 70, explanation: "Evidence: captions." },
    discoverability: { score: 70, explanation: "Evidence: hashtags." },
    conversionReadiness: { score: 70, explanation: "Evidence: CTA." },
  },
  contentThemes: [],
  personas: [],
  recommendations: [],
};

describe("ReportView confidence label", () => {
  it("shows high evidence confidence for rich source signals", () => {
    const element = React.createElement(ReportView, {
      report,
      username: "bakery",
      profileUrl: "https://instagram.com/bakery",
      sourceSignals: { bio: "Detailed bakery bio", title: "Bakery", contactInfo: { links: ["https://bakery.example"], emails: ["hello@bakery.example"], phones: ["1234567890"] }, captions: ["one", "two"], hashtags: ["#cakes", "#bakery"] },
    });
    const html = renderToStaticMarkup(element);
    expect(html).toContain("High evidence confidence");
    expect(html).not.toContain("Insufficient public evidence");
  });
});
