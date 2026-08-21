function clampScore(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }

export function buildDeterministicScores(sourceSignals: any, report: any) {
  const bio = String(sourceSignals?.bio ?? "");
  const captions = Array.isArray(sourceSignals?.captions) ? sourceSignals.captions : [];
  const hashtags = Array.isArray(sourceSignals?.hashtags) ? sourceSignals.hashtags : [];
  const contacts = sourceSignals?.contactInfo ?? {};
  const links = Array.isArray(contacts.links) ? contacts.links : [];
  const emails = Array.isArray(contacts.emails) ? contacts.emails : [];
  const phones = Array.isArray(contacts.phones) ? contacts.phones : [];
  const text = `${bio} ${captions.join(" ")} ${sourceSignals?.visibleTextSample ?? ""}`.toLowerCase();
  const ctaTerms = ["dm", "message", "book", "order", "buy", "shop", "contact", "whatsapp", "call", "visit", "link"].filter(term => text.includes(term)).length;
  const serviceTerms = Array.isArray(report?.services) ? report.services.length : 0;
  const clarity = clampScore(35 + (bio.length >= 40 ? 22 : bio.length >= 15 ? 12 : 0) + (serviceTerms >= 3 ? 18 : serviceTerms >= 1 ? 10 : 0) + (sourceSignals?.title ? 8 : 0));
  const trust = clampScore(30 + (emails.length ? 16 : 0) + (phones.length ? 16 : 0) + (links.length ? 12 : 0) + (captions.length >= 3 ? 10 : captions.length ? 5 : 0));
  const consistency = clampScore(35 + (captions.length >= 6 ? 22 : captions.length >= 3 ? 14 : captions.length ? 7 : 0) + (hashtags.length >= 8 ? 18 : hashtags.length >= 3 ? 10 : 0) + (new Set(hashtags.map((tag: string) => tag.toLowerCase())).size >= 3 ? 8 : 0));
  const discoverability = clampScore(28 + Math.min(34, hashtags.length * 3) + (text.includes("location") || text.includes("city") || text.includes("delivery") ? 16 : 0) + (sourceSignals?.title ? 8 : 0));
  const conversion = clampScore(28 + (serviceTerms >= 2 ? 17 : serviceTerms ? 9 : 0) + Math.min(25, ctaTerms * 5) + (emails.length || phones.length || links.length ? 15 : 0));
  const evidence = `${bio ? "bio present" : "bio missing"}; ${captions.length} caption signal(s); ${hashtags.length} hashtag(s); ${emails.length + phones.length + links.length} contact path(s)`;
  const missing = `${bio ? "no major bio gap" : "add a clearer bio"}; ${captions.length ? "caption evidence available" : "add more caption context"}; ${hashtags.length ? "hashtag evidence available" : "add searchable hashtags"}; ${emails.length + phones.length + links.length ? "contact path available" : "add a contact path"}`;
  const explain = (score: number, strong: string, weak: string) => `${score >= 70 ? strong : weak} Evidence: ${evidence}. AI inference: this score reflects only the available public signals and should not be treated as a verified business fact. Missing signals: ${missing}.`;
  return {
    clarity: { score: clarity, explanation: explain(clarity, "The profile communicates a clear offer.", "The score is conservative because the profile has limited clarity signals.") },
    trust: { score: trust, explanation: explain(trust, "The profile includes useful trust and contact paths.", "The score is lower because trust signals or contact paths are missing.") },
    consistency: { score: consistency, explanation: explain(consistency, "The profile has a repeatable content signal pattern.", "The score is lower because there are too few repeated content signals to confirm consistency.") },
    discoverability: { score: discoverability, explanation: explain(discoverability, "The profile provides discoverability signals through hashtags or searchable context.", "The score is lower because searchable signals such as hashtags or location context are limited.") },
    conversionReadiness: { score: conversion, explanation: explain(conversion, "The profile gives visitors several paths toward action.", "The score is lower because the profile does not expose enough clear action or contact signals.") },
  };
}
