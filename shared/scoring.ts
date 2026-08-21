function clampScore(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }

export function buildDeterministicScores(sourceSignals: any, report: any) {
  const bio = String(sourceSignals?.bio ?? "").trim();
  const captions = Array.isArray(sourceSignals?.captions) ? sourceSignals.captions.map(String).filter(Boolean) : [];
  const hashtags = Array.isArray(sourceSignals?.hashtags) ? sourceSignals.hashtags.map(String).filter(Boolean) : [];
  const contacts = sourceSignals?.contactInfo ?? {};
  const links = Array.isArray(contacts.links) ? contacts.links : [];
  const emails = Array.isArray(contacts.emails) ? contacts.emails : [];
  const phones = Array.isArray(contacts.phones) ? contacts.phones : [];
  const text = `${bio} ${captions.join(" ")} ${sourceSignals?.visibleTextSample ?? ""}`.toLowerCase();
  const words = new Set((text.match(/[a-z0-9]{3,}/g) ?? []).filter(word => !["the", "and", "for", "with", "this", "from", "instagram"].includes(word)));
  const ctaTerms = ["dm", "message", "book", "order", "buy", "shop", "contact", "whatsapp", "call", "visit", "link"].filter(term => text.includes(term)).length;
  const locationTerms = ["location", "city", "delivery", "local", "visit", "based"].filter(term => text.includes(term)).length;
  const serviceTerms = Array.isArray(report?.services) ? report.services.filter(Boolean).length : 0;
  const uniqueHashtags = new Set(hashtags.map((tag: string) => tag.toLowerCase())).size;
  const contactPaths = emails.length + phones.length + links.length;
  const titleSignal = sourceSignals?.title ? 1 : 0;
  const contentDepth = Math.min(18, Math.round(words.size * 0.55) + Math.min(8, Math.round(text.length / 180)));
  const clarity = clampScore(24 + Math.min(26, Math.round(bio.length * 0.42)) + Math.min(22, serviceTerms * 6) + titleSignal * 6 + contentDepth);
  const trust = clampScore(24 + Math.min(18, emails.length * 18) + Math.min(18, phones.length * 18) + Math.min(16, links.length * 8) + Math.min(14, captions.length * 2) + Math.min(10, words.size * 0.25));
  const consistency = clampScore(22 + Math.min(24, captions.length * 3) + Math.min(24, uniqueHashtags * 2.5) + Math.min(12, Math.max(0, uniqueHashtags - 2) * 2) + Math.min(12, words.size * 0.18));
  const discoverability = clampScore(20 + Math.min(36, uniqueHashtags * 3.2) + Math.min(18, locationTerms * 6) + titleSignal * 6 + Math.min(12, words.size * 0.2));
  const conversion = clampScore(20 + Math.min(24, serviceTerms * 7) + Math.min(24, ctaTerms * 4) + Math.min(18, contactPaths * 6) + Math.min(10, captions.length * 1.5));
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
