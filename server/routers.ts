import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { buildOutreachPrompt } from "../shared/agencyUtils";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createAnalysis, getAnalysisById, listAnalysesByUser } from "./db";

const scoreSchema = {
  type: "object",
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    explanation: { type: "string" },
  },
  required: ["score", "explanation"],
  additionalProperties: false,
};

export const reportJsonSchema = {
  type: "object",
  properties: {
    businessCategory: { type: "string" },
    services: { type: "array", items: { type: "string" } },
    brandPersonality: { type: "array", items: { type: "string" } },
    audienceIndicators: { type: "array", items: { type: "string" } },
    scores: {
      type: "object",
      properties: {
        clarity: scoreSchema,
        trust: scoreSchema,
        consistency: scoreSchema,
        discoverability: scoreSchema,
        conversionReadiness: scoreSchema,
      },
      required: ["clarity", "trust", "consistency", "discoverability", "conversionReadiness"],
      additionalProperties: false,
    },
    contentThemes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          percentage: { type: "integer", minimum: 0, maximum: 100 },
          explanation: { type: "string" },
        },
        required: ["label", "percentage", "explanation"],
        additionalProperties: false,
      },
    },
    personas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          evidence: { type: "string" },
        },
        required: ["name", "description", "evidence"],
        additionalProperties: false,
      },
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          priority: { type: "string", enum: ["High", "Medium", "Low"] },
        },
        required: ["title", "detail", "priority"],
        additionalProperties: false,
      },
    },
  },
  required: ["businessCategory", "services", "brandPersonality", "audienceIndicators", "scores", "contentThemes", "personas", "recommendations"],
  additionalProperties: false,
};

function cleanHtml(input: string) {
  return input.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

export function createReportFilename(username?: string | null) {
  return `instalens-${username ?? "business"}-report.pdf`;
}

export function isInstagramProfileUrl(profileUrl: string) {
  try {
    const parsed = new URL(profileUrl);
    return (/instagram\.com$/i.test(parsed.hostname) || /\.instagram\.com$/i.test(parsed.hostname)) && /^\/[a-zA-Z0-9._-]+\/?$/.test(parsed.pathname);
  } catch {
    return false;
  }
}

function getUsername(profileUrl: string) {
  return new URL(profileUrl).pathname.split("/").filter(Boolean)[0] ?? null;
}

function metaContent(html: string, key: string) {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=[\\"']${key}[\\"'][^>]+content=[\\"']([^\\"']*)[\\"']`, "i");
  return pattern.exec(html)?.[1] ?? "";
}

function collectCaptions(html: string) {
  const matches = Array.from(html.matchAll(/<meta[^>]+(?:name|property)=[\\"'](?:og:description|description)[\\"'][^>]+content=[\\"']([^\\"']*)[\\"']/gi)).map((match) => match[1]).filter(Boolean);
  return Array.from(new Set(matches.map((value) => cleanHtml(value)).filter((value) => value.length > 15))).slice(0, 12);
}

async function collectPublicSignals(profileUrl: string) {
  const username = getUsername(profileUrl);
  try {
    const response = await fetch(profileUrl, { headers: { "User-Agent": "Mozilla/5.0 InstaLensAI/1.0" } });
    const html = await response.text();
    const bio = cleanHtml(metaContent(html, "description") || metaContent(html, "og:description"));
    const title = cleanHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const text = cleanHtml(html).slice(0, 8000);
    const captions = collectCaptions(html);
    const combined = `${bio} ${captions.join(" ")} ${text}`;
    const hashtags = Array.from(new Set(combined.match(/#[a-zA-Z0-9_]+/g) ?? [])).slice(0, 40);
    const emails = Array.from(new Set(combined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/gi) ?? [])).slice(0, 5);
    const phones = Array.from(new Set(combined.match(/(?:\\+?\\d[\\d ()-]{7,}\\d)/g) ?? [])).slice(0, 5);
    const links = Array.from(new Set(Array.from(html.matchAll(/https?:\/\/[^\"'\s<>]+/gi)).map((match) => match[0]).filter((link) => !link.includes("instagram.com")))).slice(0, 10);
    return { username, profileUrl, fetched: response.ok, title, bio, contactInfo: { emails, phones, links }, captions, hashtags, visibleTextSample: text.slice(0, 3000), extractionNote: response.ok ? "Signals collected from the public page response." : "The public page response was limited; conclusions should be treated as low-confidence." };
  } catch (error) {
    return { username, profileUrl, fetched: false, title: "", bio: "", contactInfo: { emails: [], phones: [], links: [] }, captions: [], hashtags: [], visibleTextSample: "", extractionNote: "The profile could not be fetched in this environment. The report must avoid inventing profile facts and should clearly mark limited evidence." };
  }
}

function messageText(content: unknown) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((item) => typeof item === "object" && item && "text" in item ? String((item as { text: unknown }).text) : "").join("");
  return "";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  analysis: router({
    create: protectedProcedure.input(z.object({ profileUrl: z.string().url().max(512) })).mutation(async ({ input, ctx }) => {
      if (!isInstagramProfileUrl(input.profileUrl)) {
        throw new Error("Please enter a valid public Instagram profile URL.");
      }
      const sourceSignals = await collectPublicSignals(input.profileUrl);
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are InstaLens AI, a careful business-profile analyst. Use only the supplied public signals. Never claim private data. Clearly label personas as AI inferences. If evidence is limited, lower confidence through conservative scores and mention the limitation in explanations. Use exact score dimensions: Clarity, Trust, Consistency, Discoverability, and Conversion Readiness. Use theme labels such as product showcase, testimonials, and promotions when supported." },
          { role: "user", content: `Analyze this public Instagram profile signal payload and return the structured Business DNA Report.\n\n${JSON.stringify(sourceSignals)}` },
        ],
        response_format: { type: "json_schema", json_schema: { name: "business_dna_report", strict: true, schema: reportJsonSchema } },
      });
      const reportText = messageText(response.choices?.[0]?.message?.content);
      const report = JSON.parse(reportText);
      const saved = await createAnalysis({ userId: ctx.user.id, profileUrl: input.profileUrl, username: sourceSignals.username, status: "completed", sourceSignals, report });
      return { analysis: saved ?? { id: 0, userId: ctx.user.id, profileUrl: input.profileUrl, username: sourceSignals.username, status: "completed", sourceSignals, report, createdAt: new Date(), updatedAt: new Date() } };
    }),
    list: protectedProcedure.query(({ ctx }) => listAnalysesByUser(ctx.user.id)),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input, ctx }) => {
      const analysis = await getAnalysisById(ctx.user.id, input.id);
      if (!analysis) throw new Error("Analysis not found.");
      return analysis;
    }),
    outreach: protectedProcedure.input(z.object({ profileUrl: z.string().url(), username: z.string().nullable().optional(), report: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
      const response = await invokeLLM({ messages: [
        { role: "system", content: "You write concise, respectful B2B outreach messages for an agency. Use only the supplied Business DNA report. Mention one genuine strength, one evidence-based improvement opportunity, and a low-pressure next step. Do not claim private information. Return only the message body." },
        { role: "user", content: buildOutreachPrompt(input.profileUrl, input.username, input.report) },
      ] });
      return { message: messageText(response.choices?.[0]?.message?.content) };
    }),
  }),
});

export type AppRouter = typeof appRouter;
