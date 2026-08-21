import { useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, Copy, FileDown, LineChart as LineChartIcon, Loader2, Mail, RefreshCw, Sparkles, Trophy } from "lucide-react";
import { Link } from "wouter";
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { buildBusinessDnaPdf, reportPdfFilename } from "../../../shared/reportPdf";
import { formatLeadCard, rankAnalyses, scoreAverage, scoreDeltas } from "../../../shared/agencyUtils";
import { dimensions } from "./Home";
import { buildTimelineData } from "../../../shared/agencyTimeline";
import { filterDiscoveryRows, formatDiscoveryCsv, getEvidenceConfidence, rankDiscoveryRows, validateDiscoveryScope } from "../../../shared/discovery";

const scoreKeys = ["clarity", "trust", "consistency", "discoverability", "conversionReadiness"] as const;
const chartColors = ["#0f4630", "#7fa96b", "#d3a93d", "#8e654e"];

export default function Agency() {
  const { isAuthenticated } = useAuth();
  const history = trpc.analysis.list.useQuery(undefined, { enabled: isAuthenticated });
  const create = trpc.analysis.create.useMutation();
  const outreachMutation = trpc.analysis.outreach.useMutation({ onSuccess: result => setOutreach(result.message) });
  const [compareUrls, setCompareUrls] = useState("");
  const [discoveryCategory, setDiscoveryCategory] = useState("");
  const [discoveryLocation, setDiscoveryLocation] = useState("");
  const [discoveryUrls, setDiscoveryUrls] = useState("");
  const [discoveryRows, setDiscoveryRows] = useState<any[]>([]);
  const [discoveryLimit, setDiscoveryLimit] = useState<10 | 50>(10);
  const [expandedDiscoveryId, setExpandedDiscoveryId] = useState<number | null>(null);
  const [minDiscoveryScore, setMinDiscoveryScore] = useState(0);
  const [confidenceFilter, setConfidenceFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [compareRows, setCompareRows] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState("");
  const [brandName, setBrandName] = useState("Your Agency");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [outreach, setOutreach] = useState("");
  const [feedback, setFeedback] = useState("");
  const [copied, setCopied] = useState(false);
  const [rankLimit, setRankLimit] = useState<10 | 50>(10);

  const runUrls = (value: string) => value.split(/[\n,]+/).map(v => v.trim()).filter(Boolean).slice(0, 3);
  const runCompare = async () => {
    const urls = runUrls(compareUrls);
    if (urls.length < 2) { setFeedback("Add at least two public Instagram profile URLs."); return; }
    try { setFeedback(""); const rows = await Promise.all(urls.map(async profileUrl => { const result = await create.mutateAsync({ profileUrl }); const item = result.analysis as any; return { ...item, average: scoreAverage(item.report) }; })); setCompareRows(rankAnalyses(rows)); }
    catch (error: any) { setFeedback(error.message ?? "Comparison could not be completed."); }
  };

  const runDiscovery = async () => {
    const urls = discoveryUrls.split(/[\n,]+/).map(value => value.trim()).filter(Boolean).slice(0, 50);
    if (!validateDiscoveryScope(discoveryCategory, discoveryLocation, urls)) { setFeedback(!discoveryCategory || !discoveryLocation ? "Add a business category and location to define the discovery scope." : "Paste 1–50 approved public Instagram profile URLs."); return; }
    try { setFeedback(""); const rows = await Promise.all(urls.map(async profileUrl => { const result = await create.mutateAsync({ profileUrl }); const item = result.analysis as any; return { ...item, average: scoreAverage(item.report) }; })); setDiscoveryRows(rankDiscoveryRows(rows, 50)); }
    catch (error: any) { setFeedback(error.message ?? "Profile discovery could not be completed."); }
  };

  const filteredDiscoveryRows = useMemo(() => filterDiscoveryRows(rankDiscoveryRows(discoveryRows, 50), minDiscoveryScore, confidenceFilter), [discoveryRows, minDiscoveryScore, confidenceFilter]);
  const exportDiscoveryCsv = () => { const csv = formatDiscoveryCsv(rankDiscoveryRows(filteredDiscoveryRows, discoveryLimit)); const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `instalens-${discoveryCategory}-${discoveryLocation}-top-${discoveryLimit}.csv`.replace(/[^a-z0-9-]+/gi, "-").toLowerCase(); anchor.click(); URL.revokeObjectURL(url); };

  const selectedRows = useMemo(() => (history.data ?? []).filter((item: any) => item.username === selectedHistory).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [history.data, selectedHistory]);
  const timelineData = buildTimelineData(selectedRows);
  const first = selectedRows[0]?.report;
  const latest = selectedRows[selectedRows.length - 1]?.report;
  const deltas = scoreDeltas(first, latest).map((item, index) => ({ label: dimensions[index], delta: item.delta }));
  const savedProfiles = useMemo(() => { const latestByUsername = new Map<string, any>(); (history.data ?? []).forEach((item: any) => { if (!item.username || !latestByUsername.has(item.username)) latestByUsername.set(item.username, { ...item, average: scoreAverage(item.report) }); }); return Array.from(latestByUsername.values()).sort((a, b) => b.average - a.average).slice(0, rankLimit); }, [history.data, rankLimit]);
  const draftOutreach = (row: any) => outreachMutation.mutate({ profileUrl: row.profileUrl, username: row.username ?? null, report: row.report });
  const copyLead = async (row: any) => { await navigator.clipboard.writeText(formatLeadCard(row)); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const exportWhiteLabel = async (row: any) => { const bytes = await buildBusinessDnaPdf(row.report, row.profileUrl, row.average, row.username, brandName, logoDataUrl); const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = reportPdfFilename(row.username, brandName); a.click(); URL.revokeObjectURL(url); };

  if (!isAuthenticated) return <main className="app-frame centered-state"><Sparkles size={28}/><h1>Agency workspace</h1><p>Sign in to compare profiles, track change, and rank saved opportunities.</p><Button onClick={() => startLogin()}>Sign in to unlock workspace</Button></main>;
  return <main className="app-frame agency-page">
    <nav className="top-nav"><Link href="/" className="brand"><span className="brand-mark">◎</span><span>InstaLens <em>AI</em></span></Link><div className="nav-actions"><Link href="/history" className="nav-link">History</Link><Link href="/" className="nav-link">New analysis <ArrowUpRight size={15}/></Link></div></nav>
    <header className="agency-head"><div><p className="eyebrow">Agency workspace / live intelligence</p><h1>Turn profile signals<br/><span>into a pipeline.</span></h1><p>Compare prospects, see what changed, and focus on the saved profiles with the strongest Business DNA signal.</p></div><div className="agency-mark"><BarChart3 size={25}/><strong>01—05</strong><span>same dimensions<br/>better decisions</span></div></header>
    {feedback && <div className="agency-feedback">{feedback}</div>}
    <section className="agency-section discovery-section"><div className="section-heading"><div><p className="eyebrow">00 / Top Profiles Discovery</p><h2>Find the strongest profiles in a defined scope</h2></div><span className="section-note">Top 10 / Top 50 in dataset</span></div><p className="discovery-note">This ranks profiles found in your approved dataset—not every Instagram account. Choose a category and location, then paste the profile URLs supplied by your data source.</p><div className="provider-empty"><div><b>Automatic discovery is not connected</b><p>To discover profiles automatically, connect an approved Instagram/Meta or business-directory provider. Until then, use the supplied profile URL dataset below.</p></div><Button size="sm" variant="outline" onClick={() => setFeedback("Provider connection is the next setup step. No global rankings are generated without an approved source.")}>See provider requirement</Button></div><div className="discovery-scope"><Input value={discoveryCategory} onChange={e => setDiscoveryCategory(e.target.value)} placeholder="Business category, e.g. bakeries"/><Input value={discoveryLocation} onChange={e => setDiscoveryLocation(e.target.value)} placeholder="Location, e.g. Mumbai"/></div><textarea value={discoveryUrls} onChange={e => setDiscoveryUrls(e.target.value)} placeholder="Paste approved public Instagram profile URLs, one per line (up to 50)"/><Button onClick={runDiscovery} disabled={create.isPending}>{create.isPending ? <Loader2 className="spin"/> : <Trophy size={16}/>} {create.isPending ? "Ranking…" : "Rank discovered profiles"}</Button>{discoveryRows.length > 0 && <div className="discovery-results"><div className="rank-toggle discovery-toggle"><Button size="sm" variant={discoveryLimit === 10 ? "default" : "outline"} onClick={() => setDiscoveryLimit(10)}>Top 10</Button><Button size="sm" variant={discoveryLimit === 50 ? "default" : "outline"} onClick={() => setDiscoveryLimit(50)}>Top 50</Button><span className="muted">Ranking scope: {discoveryCategory} in {discoveryLocation}</span><label className="filter-label">Min score <input type="number" min="0" max="100" value={minDiscoveryScore} onChange={e => setMinDiscoveryScore(Number(e.target.value) || 0)}/></label><label className="filter-label">Confidence <select value={confidenceFilter} onChange={e => setConfidenceFilter(e.target.value as any)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></label><Button size="sm" variant="outline" onClick={exportDiscoveryCsv}><FileDown size={14}/> CSV</Button></div><div className="discovery-header"><span>Rank</span><span>Profile</span>{dimensions.map(d => <span key={d}>{d}</span>)}<span>Signal</span></div>{filteredDiscoveryRows.slice(0, discoveryLimit).map((row, index) => <div className="discovery-item" key={row.id}><button type="button" className="discovery-row" onClick={() => setExpandedDiscoveryId(expandedDiscoveryId === row.id ? null : row.id)}><strong>#{index + 1}</strong><span>@{row.username ?? "profile"}</span>{scoreKeys.map(key => <b key={key}>{row.report?.scores?.[key]?.score ?? 0}</b>)}<em>{row.average}/100 · {getEvidenceConfidence(row)}</em></button>{expandedDiscoveryId === row.id && <div className="discovery-rationale"><b>Why this score?</b><p>{row.report?.scores?.clarity?.explanation}</p><p>{row.report?.scores?.conversionReadiness?.explanation}</p></div>}</div>)}</div>}</section>
    <section className="agency-section"><div className="section-heading"><div><p className="eyebrow">01 / Prospect comparison</p><h2>Compare 2–3 profiles</h2></div><span className="section-note">Ranked by Business DNA signal</span></div><div className="agency-input-row"><textarea value={compareUrls} onChange={e => setCompareUrls(e.target.value)} placeholder="Paste 2–3 public Instagram URLs, one per line"/><Button onClick={runCompare} disabled={create.isPending}>{create.isPending ? <Loader2 className="spin"/> : <Trophy size={16}/>} {create.isPending ? "Comparing…" : "Compare profiles"}</Button></div>{compareRows.length > 1 && <div className="compare-table"><div className="compare-header"><span>Rank</span><span>Profile</span>{dimensions.map(d => <span key={d}>{d}</span>)}<span>Signal</span></div>{compareRows.map((row, i) => <div className="compare-row" key={row.id}><strong>0{i + 1}</strong><span>@{row.username ?? "profile"}</span>{scoreKeys.map(key => <b key={key}>{row.report?.scores?.[key]?.score ?? 0}</b>)}<strong className="rank-score">{row.average}</strong></div>)}</div>}</section>
    <section className="agency-section"><div className="section-heading"><div><p className="eyebrow">02 / Track changes over time</p><h2>See the score timeline</h2></div><span className="section-note">Manual weekly or on-demand snapshots</span></div><div className="agency-input-row compact"><select value={selectedHistory} onChange={e => setSelectedHistory(e.target.value)}><option value="">Choose a saved profile</option>{Array.from(new Set((history.data ?? []).map((item: any) => item.username).filter(Boolean))).map((username: any) => <option key={username} value={username}>@{username}</option>)}</select><Button variant="outline" onClick={async () => { const profileUrl = selectedRows[0]?.profileUrl; if (profileUrl) { await create.mutateAsync({ profileUrl }); await history.refetch(); } }} disabled={!selectedHistory || create.isPending}><RefreshCw size={15}/> Re-run now</Button></div>{history.isLoading && <p className="muted">Loading saved snapshots…</p>}{history.error && <p className="error-hint">History could not load: {history.error.message}</p>}{timelineData.length > 0 ? <div className="timeline-grid"><div className="timeline-chart"><div className="chart-title"><LineChartIcon size={18}/> Score movement for @{selectedHistory}</div><ResponsiveContainer width="100%" height={330}><LineChart data={timelineData}><CartesianGrid strokeDasharray="3 3" stroke="#dce5d4"/><XAxis dataKey="snapshot" tick={{ fill: "#557064", fontSize: 11 }}/><YAxis domain={[0, 100]} tick={{ fill: "#557064", fontSize: 11 }}/><Tooltip/><Legend/>{scoreKeys.map((key, index) => <Line key={key} type="monotone" dataKey={key} name={dimensions[index]} stroke={chartColors[index % chartColors.length]} strokeWidth={2} dot={{ r: 3 }}/>)}</LineChart></ResponsiveContainer></div><div className="delta-strip vertical">{deltas.map(item => <div key={item.label}><span>{item.label}</span><strong className={item.delta >= 0 ? "positive" : "negative"}>{item.delta > 0 ? "+" : ""}{item.delta}</strong></div>)}</div></div> : <div className="compare-empty"><LineChartIcon size={22}/><p>Select a saved profile and capture another snapshot to build its timeline.</p></div>}</section>
    <section className="agency-section"><div className="section-heading"><div><p className="eyebrow">03 / Saved profile ranking</p><h2>Profiles that look strongest in your archive</h2></div><span className="section-note">Not a global Instagram ranking</span></div><div className="rank-toggle"><Button size="sm" variant={rankLimit === 10 ? "default" : "outline"} onClick={() => setRankLimit(10)}>Top 10</Button><Button size="sm" variant={rankLimit === 50 ? "default" : "outline"} onClick={() => setRankLimit(50)}>Top 50</Button><span className="muted">Based only on your saved analyses and latest deterministic scores.</span></div>{savedProfiles.length ? <div className="saved-ranking">{savedProfiles.map((row, index) => <div className="saved-rank-row" key={row.id}><strong>#{index + 1}</strong><span><b>@{row.username}</b><small>{row.report?.businessCategory ?? "Business profile"}</small></span><em>{row.average}/100</em><Button size="sm" variant="ghost" onClick={() => draftOutreach(row)}><Mail size={14}/> Outreach</Button><Button size="sm" variant="outline" onClick={() => exportWhiteLabel(row)}><FileDown size={14}/> PDF</Button><Button size="sm" variant="ghost" onClick={() => copyLead(row)}><Copy size={14}/>{copied ? "Copied" : "Lead"}</Button></div>)}</div> : <div className="compare-empty"><Trophy size={22}/><p>Saved profile rankings will appear after you analyze business accounts.</p></div>}</section>
  </main>;
}
