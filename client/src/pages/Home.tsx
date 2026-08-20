import { FormEvent, useMemo, useState } from "react";
import { buildBusinessDnaPdf, reportPdfFilename } from "../../../shared/reportPdf";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Check, ChevronRight, CircleAlert, Loader2, Sparkles, Target, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const dimensions = ["Clarity", "Trust", "Consistency", "Discoverability", "Conversion Readiness"];


type Report = {
  businessCategory: string;
  services: string[];
  brandPersonality: string[];
  audienceIndicators: string[];
  scores: Record<string, { score: number; explanation: string }>;
  contentThemes: { label: string; percentage: number; explanation: string }[];
  personas: { name: string; description: string; evidence: string }[];
  recommendations: { title: string; detail: string; priority: string }[];
};

function ReportView({ report, username, profileUrl }: { report: Report; username?: string | null; profileUrl: string }) {
  const scoreKeys = ["clarity", "trust", "consistency", "discoverability", "conversionReadiness"];
  const average = Math.round(scoreKeys.reduce((sum, key) => sum + (report.scores?.[key]?.score ?? 0), 0) / scoreKeys.length);
  const exportPdf = async () => {
    const bytes = await buildBusinessDnaPdf(report, profileUrl, average, username);
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = reportPdfFilename(username);
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <div className="report-shell">
    <div className="report-topline"><div><p className="eyebrow">Business DNA Report / {username ? `@${username}` : "Profile analysis"}</p><h1>{report.businessCategory}</h1><p className="muted">Generated from permitted public profile signals. <span className="inference-label">AI interpretations are clearly labeled.</span></p></div><Button variant="outline" className="export-button" onClick={exportPdf}>Export PDF <ArrowUpRight size={16}/></Button></div>
    <section className="report-hero"><div><span className="label">Overall signal</span><div className="overall-score">{average}<span>/100</span></div><p>How clearly the profile communicates, builds trust, and moves visitors toward action.</p></div><div className="hero-meta"><div><span className="label">Category</span><strong>{report.businessCategory}</strong></div><div><span className="label">Personality</span><strong>{report.brandPersonality.join(" · ")}</strong></div></div></section>
    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">01 / Diagnostic</p><h2>Business DNA Score</h2></div><span className="section-note">Every score includes evidence</span></div><div className="score-grid">{dimensions.map((label, index) => { const key = scoreKeys[index]; const value = report.scores?.[key]?.score ?? 0; return <div className="score-card" key={label}><div className="score-card-top"><span>{label}</span><strong>{value}</strong></div><div className="score-track"><div style={{width: `${value}%`}} /></div><p>{report.scores?.[key]?.explanation}</p></div>})}</div></section>
    <div className="report-grid-2"><section className="section-block"><div className="section-heading compact"><div><p className="eyebrow">02 / Content intelligence</p><h2>Theme map</h2></div></div><div className="theme-list">{report.contentThemes.map((theme) => <div className="theme-row" key={theme.label}><div><strong>{theme.label}</strong><span>{theme.explanation}</span></div><b>{theme.percentage}%</b></div>)}</div></section><section className="section-block"><div className="section-heading compact"><div><p className="eyebrow">03 / Audience signals</p><h2>Likely personas</h2></div></div><div className="persona-list">{report.personas.map((persona) => <div className="persona" key={persona.name}><div className="persona-title"><Target size={17}/><strong>{persona.name}</strong><Badge variant="secondary">AI inference</Badge></div><p>{persona.description}</p><small>Evidence: {persona.evidence}</small></div>)}</div></section></div>
    <section className="section-block recommendations"><div className="section-heading"><div><p className="eyebrow">04 / Priority actions</p><h2>What to improve next</h2></div><Sparkles className="sparkle" size={26}/></div><div className="recommendation-list">{report.recommendations.map((item) => <div className="recommendation" key={item.title}><div className={`priority ${item.priority.toLowerCase()}`}>{item.priority}</div><div><strong>{item.title}</strong><p>{item.detail}</p></div><ChevronRight size={19}/></div>)}</div></section>
    <div className="report-footnote"><CircleAlert size={16}/> Public-profile extraction may be limited by platform availability. The report separates visible signals from AI inferences and recommendations.</div>
  </div>;
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [profileUrl, setProfileUrl] = useState("");
  const [activeReport, setActiveReport] = useState<{ report: Report; username?: string | null; profileUrl: string } | null>(null);
  const createAnalysis = trpc.analysis.create.useMutation({ onSuccess: (result) => { const analysis = result.analysis as any; setActiveReport({ report: analysis.report, username: analysis.username, profileUrl: analysis.profileUrl }); } });
  const isValidUrl = useMemo(() => /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/.test(profileUrl.trim()), [profileUrl]);
  const handleSubmit = (event: FormEvent) => { event.preventDefault(); if (!isAuthenticated) { startLogin(); return; } if (!isValidUrl) return; createAnalysis.mutate({ profileUrl: profileUrl.trim() }); };

  if (activeReport) return <ReportView report={activeReport.report} username={activeReport.username} profileUrl={activeReport.profileUrl} />;

  return <main className="app-frame"><nav className="top-nav"><Link href="/" className="brand"><span className="brand-mark">◎</span><span>InstaLens <em>AI</em></span></Link><div className="nav-actions"><Link href="/history" className="nav-link">History</Link>{user ? <span className="user-pill">{user.name ?? user.email ?? "Account"}</span> : <Button variant="outline" size="sm" onClick={() => startLogin()}>Sign in</Button>}</div></nav><section className="hero-section"><div className="hero-copy"><p className="eyebrow">Public profile intelligence / 01</p><h1>See the business<br/><span>behind the profile.</span></h1><p className="hero-lead">Paste a public Instagram business profile. InstaLens AI turns scattered signals into a clear, actionable Business DNA Report.</p><form className="analysis-form" onSubmit={handleSubmit}><Input aria-label="Instagram profile URL" placeholder="https://instagram.com/yourbusiness" value={profileUrl} onChange={(event) => setProfileUrl(event.target.value)} /><Button type="submit" disabled={createAnalysis.isPending}>{createAnalysis.isPending ? <><Loader2 className="spin" size={17}/> Analyzing...</> : <>Analyze profile <ArrowUpRight size={17}/></>}</Button></form>{profileUrl && !isValidUrl && <p className="field-hint">Use a public Instagram URL, for example instagram.com/yourbusiness.</p>}{createAnalysis.error && <p className="error-hint">{createAnalysis.error.message}</p>}<div className="hero-trust"><Check size={16}/> Public signals only <Check size={16}/> Evidence-led AI <Check size={16}/> Practical next actions</div></div><div className="hero-art"><div className="art-topline"><span>Business DNA / live lens</span><span>01—05</span></div><div className="art-orbit orbit-one">◎</div><div className="art-orbit orbit-two">✦</div><div className="art-number">5</div><div className="art-caption">signals<br/><strong>to decisions</strong></div></div></section><section className="feature-strip"><div><span>01</span><strong>Extract</strong><p>Bio, services, themes, contact paths.</p></div><div><span>02</span><strong>Interpret</strong><p>Brand personality and audience indicators.</p></div><div><span>03</span><strong>Act</strong><p>Prioritized improvements with clear rationale.</p></div></section><section className="intro-section"><div><p className="eyebrow">Why InstaLens</p><h2>Not another vanity-metrics dashboard.</h2></div><p>It answers the questions a marketer or business owner actually needs: what does this profile sell, who is it for, where does trust break, and what should happen next?</p></section></main>;
}

export { ReportView, dimensions };
