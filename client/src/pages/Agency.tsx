import { useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, Copy, FileDown, Loader2, Mail, RefreshCw, Sparkles, Trophy, Users } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { buildBusinessDnaPdf, reportPdfFilename } from "../../../shared/reportPdf";
import { dimensions } from "./Home";
import { formatLeadCard, rankAnalyses, scoreAverage, scoreDeltas } from "../../../shared/agencyUtils";

const scoreKeys = ["clarity", "trust", "consistency", "discoverability", "conversionReadiness"] as const;
const average = scoreAverage;

export default function Agency() {
  const { isAuthenticated } = useAuth();
  const history = trpc.analysis.list.useQuery(undefined, { enabled: isAuthenticated });
  const create = trpc.analysis.create.useMutation();
  const outreachMutation = trpc.analysis.outreach.useMutation({ onSuccess: (result) => setOutreach(result.message) });
  const [compareUrls, setCompareUrls] = useState("");
  const [batchUrls, setBatchUrls] = useState("");
  const [compareRows, setCompareRows] = useState<any[]>([]);
  const [batchRows, setBatchRows] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState("");
  const [brandName, setBrandName] = useState("Your Agency");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [outreach, setOutreach] = useState("");
  const [feedback, setFeedback] = useState("");
  const [copied, setCopied] = useState(false);

  const runUrls = (value: string, limit: number) => value.split(/[\n,]+/).map(v => v.trim()).filter(Boolean).slice(0, limit);
  const runCompare = async () => {
    const urls = runUrls(compareUrls, 3);
    if (urls.length < 2) { setFeedback("Add at least two public Instagram profile URLs."); return; }
    try { setFeedback(""); const rows = await Promise.all(urls.map(async profileUrl => { const result = await create.mutateAsync({ profileUrl }); const item = result.analysis as any; return { ...item, average: average(item.report) }; })); setCompareRows(rankAnalyses(rows)); }
    catch (error: any) { setFeedback(error.message ?? "Comparison could not be completed."); }
  };
  const runBatch = async () => {
    const urls = runUrls(batchUrls, 10);
    if (!urls.length) { setFeedback("Add at least one public Instagram profile URL."); return; }
    try { setFeedback(""); const rows = await Promise.all(urls.map(async profileUrl => { const result = await create.mutateAsync({ profileUrl }); const item = result.analysis as any; return { ...item, average: average(item.report) }; })); setBatchRows(rankAnalyses(rows)); }
    catch (error: any) { setFeedback(error.message ?? "Batch analysis could not be completed."); }
  };
  const selectedRows = useMemo(() => (history.data ?? []).filter((item: any) => item.username === selectedHistory).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [history.data, selectedHistory]);
  const first: any = selectedRows[0]?.report;
  const latest: any = selectedRows[selectedRows.length - 1]?.report;
  const deltas = scoreDeltas(first, latest).map((item, index) => ({ label: dimensions[index], delta: item.delta }));
  const insights = dimensions.map((label, index) => { const key = scoreKeys[index]; const scores = compareRows.map(row => row.report?.scores?.[key]?.score ?? 0); const winner = compareRows.reduce((best, row) => (row.report?.scores?.[key]?.score ?? 0) > (best?.report?.scores?.[key]?.score ?? -1) ? row : best, compareRows[0]); return { label, winner: winner?.username ?? "profile", score: winner?.report?.scores?.[key]?.score ?? 0, gap: scores.length ? Math.max(...scores) - Math.min(...scores) : 0 }; });
  const rerunSelected = async () => { const profileUrl = selectedRows[0]?.profileUrl; if (!profileUrl) return; try { setFeedback(""); await create.mutateAsync({ profileUrl }); await history.refetch(); } catch (error: any) { setFeedback(error.message ?? "Re-analysis failed."); } };
  const draftOutreach = (row: any) => outreachMutation.mutate({ profileUrl: row.profileUrl, username: row.username ?? null, report: row.report });
  const copyLead = async (row: any) => { await navigator.clipboard.writeText(formatLeadCard(row)); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const exportWhiteLabel = async (row: any) => { const bytes = await buildBusinessDnaPdf(row.report, row.profileUrl, row.average, row.username, brandName, logoDataUrl); const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = reportPdfFilename(row.username, brandName); a.click(); URL.revokeObjectURL(url); };

  if (!isAuthenticated) return <main className="app-frame centered-state"><Sparkles size={28}/><h1>Agency workspace</h1><p>Sign in to compare prospects, track change, and create client-ready outputs.</p><Button onClick={() => startLogin()}>Sign in to unlock workspace</Button></main>;
  return <main className="app-frame agency-page">
    <nav className="top-nav"><Link href="/" className="brand"><span className="brand-mark">◎</span><span>InstaLens <em>AI</em></span></Link><div className="nav-actions"><Link href="/history" className="nav-link">History</Link><Link href="/" className="nav-link">New analysis <ArrowUpRight size={15}/></Link></div></nav>
    <header className="agency-head"><div><p className="eyebrow">Agency workspace / live intelligence</p><h1>Turn profile signals<br/><span>into a pipeline.</span></h1><p>Compare prospects, surface the next move, and turn one analysis into an outreach-ready lead.</p></div><div className="agency-mark"><BarChart3 size={25}/><strong>01—05</strong><span>same dimensions<br/>better decisions</span></div></header>
    {feedback && <div className="agency-feedback">{feedback}</div>}
    <section className="agency-section"><div className="section-heading"><div><p className="eyebrow">01 / Prospect triage</p><h2>Compare 2–3 profiles</h2></div><span className="section-note">Ranked by Business DNA signal</span></div><div className="agency-input-row"><textarea value={compareUrls} onChange={e => setCompareUrls(e.target.value)} placeholder="Paste 2–3 public Instagram URLs, one per line"/><Button onClick={runCompare} disabled={create.isPending}>{create.isPending ? <Loader2 className="spin"/> : <Trophy size={16}/>} Compare profiles</Button></div>{compareRows.length > 1 && <><div className="compare-table"><div className="compare-header"><span>Rank</span><span>Profile</span>{dimensions.map(d => <span key={d}>{d}</span>)}<span>Signal</span></div>{compareRows.map((row, i) => <div className="compare-row" key={row.id}><strong>0{i + 1}</strong><span>@{row.username ?? "profile"}</span>{scoreKeys.map(key => <b key={key}>{row.report?.scores?.[key]?.score ?? 0}</b>)}<strong className="rank-score">{row.average}</strong></div>)}</div><div className="insight-grid">{insights.map(item => <div className="insight" key={item.label}><span>{item.label}</span><strong>@{item.winner} leads at {item.score}</strong><small>{item.gap === 0 ? "Profiles are even on this dimension." : `${item.gap}-point spread between the strongest and weakest profile.`}</small></div>)}</div></>}</section>
    <section className="agency-section"><div className="section-heading"><div><p className="eyebrow">02 / Impact story</p><h2>Track changes over time</h2></div><span className="section-note">Manual weekly or on-demand snapshots</span></div><div className="agency-input-row compact">{history.isLoading && <span className="muted">Loading saved history…</span>}<select value={selectedHistory} onChange={e => setSelectedHistory(e.target.value)}><option value="">Choose a profile from history</option>{Array.from(new Set((history.data ?? []).map((item: any) => item.username).filter(Boolean))).map((username: any) => <option key={username} value={username}>@{username}</option>)}</select><Button variant="outline" onClick={rerunSelected} disabled={!selectedHistory || create.isPending}><RefreshCw size={15}/> Re-run now</Button><div className="delta-strip">{deltas.length ? deltas.map(item => <div key={item.label}><span>{item.label}</span><strong className={item.delta >= 0 ? "positive" : "negative"}>{item.delta > 0 ? "+" : ""}{item.delta}</strong></div>) : <span className="muted">Run a new snapshot to reveal score deltas.</span>}</div></div>{history.error && <p className="error-hint">History could not load: {history.error.message}</p>}{selectedRows.length > 1 && <div className="change-note"><RefreshCw size={17}/><span>From {new Date(selectedRows[0].createdAt).toLocaleDateString()} to {new Date(selectedRows[selectedRows.length - 1].createdAt).toLocaleDateString()}, the profile moved from <b>{average(first)}/100</b> to <b>{average(latest)}/100</b>.</span></div>}</section>
    <section className="agency-section"><div className="section-heading"><div><p className="eyebrow">03 / Outreach engine</p><h2>Make the first message relevant</h2></div><span className="section-note">AI-drafted from report evidence</span></div><div className="outreach-grid"><div className="prospect-list">{[...compareRows, ...batchRows].slice(0, 5).map(row => <button key={`${row.id}-${row.profileUrl}`} className="prospect" onClick={() => draftOutreach(row)}><Mail size={17}/><span><strong>@{row.username ?? "profile"}</strong><small>{row.report?.businessCategory}</small></span><ArrowUpRight size={15}/></button>)}{compareRows.length === 0 && <p className="muted">Compare prospects above to draft a message grounded in their Business DNA Report.</p>}</div><div className="outreach-box"><div className="box-label"><Sparkles size={16}/> {outreachMutation.isPending ? "Generating outreach…" : "AI-drafted outreach"}</div><textarea value={outreach} onChange={e => setOutreach(e.target.value)} placeholder="Select a prospect to generate a tailored pitch message."/><Button variant="outline" onClick={() => navigator.clipboard.writeText(outreach)} disabled={!outreach}><Copy size={15}/> Copy message</Button></div></div></section>
    <section className="agency-section"><div className="section-heading"><div><p className="eyebrow">04 / Scale the workflow</p><h2>Batch triage + client-ready output</h2></div><span className="section-note">Up to 10 prospects</span></div><div className="batch-grid"><div><textarea value={batchUrls} onChange={e => setBatchUrls(e.target.value)} placeholder="Paste up to 10 public profile URLs, one per line"/><Button onClick={runBatch} disabled={create.isPending}>{create.isPending ? <Loader2 className="spin"/> : <Users size={16}/>} {create.isPending ? "Ranking…" : "Rank batch"}</Button></div><div className="brand-box"><label>White-label agency name</label><Input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Your Agency"/><label>Logo reference URL</label><Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://youragency.com/logo.png"/><label>Upload logo for PDF</label><Input type="file" accept="image/png,image/jpeg" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setLogoDataUrl(String(reader.result)); reader.readAsDataURL(file); }}/><p>Brand name and uploaded logo are embedded in client-ready PDF exports.</p></div></div>{batchRows.length > 0 && <div className="batch-results"><div className="batch-header"><span>Rank</span><span>Profile</span>{dimensions.map(d => <span key={d}>{d}</span>)}<span>Signal</span><span>Outputs</span></div>{batchRows.map((row, i) => <div className="batch-row" key={row.id}><strong>#{i + 1}</strong><span>@{row.username ?? "profile"}</span>{scoreKeys.map(key => <b key={key}>{row.report?.scores?.[key]?.score ?? 0}</b>)}<b>{row.average}</b><div className="batch-actions"><Button size="sm" variant="outline" onClick={() => exportWhiteLabel(row)}><FileDown size={14}/></Button><Button size="sm" variant="ghost" onClick={() => copyLead(row)}><Copy size={14}/>{copied ? "Copied" : "Lead"}</Button></div></div>)}</div>}</section>
  </main>;
}
