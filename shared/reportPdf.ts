import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function buildBusinessDnaPdf(report: any, profileUrl: string, average: number, username?: string | null) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.08, 0.16, 0.12);
  const green = rgb(0.12, 0.42, 0.27);
  let y = 744;
  const draw = (text: string, size = 11, isBold = false, color = ink) => { page.drawText(String(text).slice(0, 105), { x: 42, y, size, font: isBold ? bold : font, color }); y -= size + 8; };
  draw("InstaLens AI — Business DNA Report", 22, true, green); draw(profileUrl, 9, false, rgb(0.4, 0.48, 0.42)); y -= 10;
  draw(report.businessCategory ?? "Business profile", 18, true); draw(`Overall signal: ${average}/100`, 13, true, green); y -= 8;
  draw("Business DNA Score", 14, true, green);
  const dimensions = ["Clarity", "Trust", "Consistency", "Discoverability", "Conversion Readiness"];
  const scoreKeys = ["clarity", "trust", "consistency", "discoverability", "conversionReadiness"];
  dimensions.forEach((label, index) => { const score = report.scores?.[scoreKeys[index]]?.score ?? 0; page.drawRectangle({ x: 42, y: y - 4, width: 528, height: 22, color: rgb(0.94, 0.97, 0.94) }); page.drawText(`${label}: ${score}/100`, { x: 52, y: y + 3, size: 10, font: bold, color: ink }); y -= 32; });
  y -= 8; draw("Services", 14, true, green); draw((report.services ?? []).join(", "), 10); y -= 8; draw("Audience indicators", 14, true, green); draw((report.audienceIndicators ?? []).join(" • "), 10); y -= 8; draw("Priority recommendations", 14, true, green);
  (report.recommendations ?? []).forEach((item: any) => { draw(`${item.priority} · ${item.title}`, 11, true); draw(item.detail, 9); });
  draw("Personas are AI inferences based on available public profile signals and should not be treated as verified facts.", 8, false, rgb(0.4, 0.48, 0.42));
  return pdf.save();
}

export function reportPdfFilename(username?: string | null) {
  return `instalens-${username ?? "business"}-report.pdf`;
}
