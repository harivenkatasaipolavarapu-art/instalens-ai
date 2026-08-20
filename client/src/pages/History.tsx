import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowUpRight, Clock3, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ReportView } from "./Home";

export default function History() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const history = trpc.analysis.list.useQuery(undefined, { enabled: isAuthenticated });
  const detail = trpc.analysis.get.useQuery({ id: selectedId ?? 0 }, { enabled: Boolean(selectedId) && isAuthenticated });

  if (!isAuthenticated) return <main className="app-frame history-locked"><nav className="top-nav"><Link href="/" className="brand"><span className="brand-mark">◎</span><span>InstaLens <em>AI</em></span></Link><Button variant="outline" size="sm" onClick={() => startLogin()}>Sign in</Button></nav><section className="locked-panel"><div className="locked-signal"><Sparkles size={24}/><span>Saved intelligence / archive</span></div><p className="eyebrow">Analysis history / protected workspace</p><h1>Keep every insight<br/><span>within reach.</span></h1><p>Your Business DNA Reports stay organized here so you can revisit profile signals, compare decisions, and track what changed.</p><Button onClick={() => startLogin()}>Sign in to unlock history <ArrowUpRight size={16}/></Button><div className="locked-proof"><span>01</span> Save reports <span>02</span> Revisit evidence <span>03</span> Export again</div></section></main>;
  if (selectedId && detail.isLoading) return <main className="app-frame centered-state"><Loader2 className="spin"/><h1>Loading report</h1><p>Reassembling the saved business intelligence.</p></main>;
  if (selectedId && detail.error) return <main className="app-frame centered-state"><Sparkles size={28}/><h1>Report unavailable</h1><p>{detail.error.message}</p><Button onClick={() => setSelectedId(null)}>Back to history</Button></main>;
  if (selectedId && detail.data) return <div className="history-detail"><Button variant="ghost" onClick={() => setSelectedId(null)}><ArrowLeft size={17}/> Back to history</Button><ReportView report={detail.data.report as any} username={detail.data.username} profileUrl={detail.data.profileUrl}/></div>;
  if (history.error) return <main className="app-frame centered-state"><Sparkles size={28}/><h1>History could not load</h1><p>{history.error.message}</p><Button onClick={() => history.refetch()}>Try again</Button></main>;
  return <main className="app-frame history-page"><nav className="top-nav"><Link href="/" className="brand"><span className="brand-mark">◎</span><span>InstaLens <em>AI</em></span></Link><Link href="/" className="nav-link">New analysis <ArrowUpRight size={15}/></Link></nav><div className="history-head"><div><p className="eyebrow">Saved intelligence / archive</p><h1>Analysis history</h1><p className="muted">Every saved report, ready to revisit.</p></div><div className="history-count"><strong>{history.data?.length ?? 0}</strong><span>reports</span></div></div>{history.isLoading ? <div className="centered-state"><Loader2 className="spin"/></div> : history.data?.length ? <div className="history-list">{history.data.map((item: any) => <button className="history-row" key={item.id} onClick={() => setSelectedId(item.id)}><div className="history-icon"><FileText size={20}/></div><div className="history-main"><strong>{item.report?.businessCategory ?? "Business profile analysis"}</strong><span>{item.username ? `@${item.username}` : item.profileUrl}</span></div><div className="history-score"><strong>{Math.round(Object.values(item.report?.scores ?? {}).reduce((sum: number, score: any) => sum + (score?.score ?? 0), 0) / 5)}</strong><small>DNA signal</small></div><div className="history-date"><Clock3 size={15}/>{new Date(item.createdAt).toLocaleDateString()}</div><Badge variant="secondary">View report</Badge></button>)}</div> : <div className="empty-state"><FileText size={28}/><h2>No saved reports yet</h2><p>Analyze your first public business profile to build your archive.</p><Button onClick={() => setLocation("/")}>Start an analysis <ArrowUpRight size={16}/></Button></div>}</main>;
}
