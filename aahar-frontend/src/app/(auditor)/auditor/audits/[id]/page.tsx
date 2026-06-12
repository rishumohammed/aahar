"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auditorApi } from "@/lib/api";
import { 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  FileText, 
  ClipboardCheck, 
  Info,
  Loader2,
  MapPin,
  TrendingUp,
  ShieldCheck,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AuditChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [audit, setAudit] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [auditorNotes, setAuditorNotes] = useState("");
  const [recommendation, setRecommendation] = useState<"approve" | "reject" | "re_audit" | "">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    auditorApi.get(id)
    .then(res => {
      const d = res.data;
      setAudit(d.data);
      if (d.data.checklist) {
        const existingScores: Record<string, number> = {};
        const existingNotes: Record<string, string> = {};
        d.data.checklist.forEach((item: any) => {
          if (item.score !== undefined) existingScores[item.id] = item.score;
          if (item.notes) existingNotes[item.id] = item.notes;
        });
        setScores(existingScores);
        setNotes(existingNotes);
        if (d.data.recommendation) setRecommendation(d.data.recommendation);
        if (d.data.auditorNotes) setAuditorNotes(d.data.auditorNotes);
      }
      const sections = [...new Set(d.data.checklist?.map((i: any) => i.section))] as string[];
      if (sections.length) setActiveSection(sections[0]);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
    </div>
  );

  if (!audit) return (
    <div className="max-w-md mx-auto p-12 text-center bg-white rounded-lg border border-slate-200 shadow-md space-y-4 mt-16">
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Audit Not Found</h2>
      <p className="text-slate-500 text-sm">The requested audit details could not be found or retrieved.</p>
      <button onClick={() => router.back()} className="text-admin-text font-semibold hover:underline text-sm">
        Return to Dashboard
      </button>
    </div>
  );

  if (audit.status === "submitted") return (
    <div className="max-w-md mx-auto p-12 text-center bg-white rounded-lg border border-slate-200 shadow-md space-y-6 mt-16 animate-in zoom-in-95">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Audit Finalized</h2>
        <p className="text-slate-500 text-sm">
          Score: <span className="text-admin-text font-bold">{audit.totalScore}/5</span> · 
          Recommendation: <span className="uppercase text-slate-700 font-bold">{audit.recommendation}</span>
        </p>
      </div>
      <Button onClick={() => router.push("/auditor/dashboard")} className="bg-admin-primary hover:bg-admin-hover text-white rounded-lg px-8 py-3 w-full">
        Back to Dashboard
      </Button>
    </div>
  );

  const checklist = audit.checklist ?? [];
  const sections = [...new Set(checklist.map((i: any) => i.section))] as string[];
  const sectionItems = checklist.filter((i: any) => i.section === activeSection);

  const totalScored = checklist.filter((i: any) => scores[i.id] !== undefined).length;
  const progressPct = checklist.length ? Math.round((totalScored / checklist.length) * 100) : 0;

  const entityName = audit.application?.restaurant?.name ?? audit.application?.hotel?.name ?? "Unknown Property";
  const entityAddr = audit.application?.restaurant?.address ?? audit.application?.hotel?.address ?? "Location not specified";

  const handleSubmit = async () => {
    if (!recommendation) {
      alert("Please select a recommendation before submitting.");
      return;
    }
    const unscoredCount = checklist.filter((i: any) => scores[i.id] === undefined).length;
    if (unscoredCount > 0) {
      if (!confirm(`${unscoredCount} items have not been scored. Submit anyway?`)) return;
    }

    setSaving(true);
    try {
      const filledChecklist = checklist.map((item: any) => ({
        ...item,
        score: scores[item.id],
        notes: notes[item.id] ?? null,
      }));

      await auditorApi.submit(id, {
        checklist: filledChecklist,
        auditorNotes,
        recommendation,
        sitePhotos: [],
      });

      router.push("/auditor/dashboard?submitted=true");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-2">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-admin-text transition-colors">
            <ChevronLeft className="h-4 w-4" /> Exit Checklist
          </button>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{entityName}</h1>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-admin-primary" />
              {entityAddr}
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1 uppercase tracking-wider text-[11px] font-semibold text-slate-600">
              {audit.track.toUpperCase()} Audit Standard
            </div>
          </div>
        </div>
        
        {/* Progress Card */}
        <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-lg min-w-[280px]">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Audit Progress</div>
              <div className="text-xl font-bold text-slate-800">{totalScored} / {checklist.length}</div>
            </div>
            <div className="text-sm font-bold text-admin-text">{progressPct}%</div>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className="h-full bg-admin-primary transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 ml-1">Standard Sections</h3>
          {sections.map(section => {
            const sItems = checklist.filter((i: any) => i.section === section);
            const sDone = sItems.filter((i: any) => scores[i.id] !== undefined).length;
            const isComplete = sDone === sItems.length;
            
            return (
              <button 
                key={section}
                onClick={() => setActiveSection(section)}
                className={cn(
                  "w-full text-left p-4 rounded-lg transition-all flex items-start gap-3 border",
                  activeSection === section 
                    ? "bg-admin-primary text-white border-admin-primary shadow-sm" 
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  activeSection === section ? "bg-white" : isComplete ? "bg-emerald-500" : "bg-slate-200"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider leading-tight">{section}</div>
                  <div className="text-[10px] mt-0.5 uppercase tracking-wide opacity-80">
                    {sDone} / {sItems.length} scored
                  </div>
                </div>
                {isComplete && <CheckCircle2 className={cn("h-4 w-4 shrink-0 mt-0.5", activeSection === section ? "text-white" : "text-emerald-500")} />}
              </button>
            );
          })}
        </div>

        {/* Main Checklist Area */}
        <div className="lg:col-span-9 space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{activeSection}</h2>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <TrendingUp className="h-4 w-4 text-slate-400" /> Section Weight: {sectionItems.reduce((acc: number, cur: any) => acc + cur.weight, 0)}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sectionItems.map((item: any) => (
              <Card 
                key={item.id}
                className={cn(
                  "p-6 rounded-lg border border-slate-200 bg-white transition-all shadow-sm",
                  scores[item.id] !== undefined ? "ring-2 ring-admin-primary/10 border-admin-primary/30" : ""
                )}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                  <div className="space-y-2 flex-1">
                    <p className="text-base font-bold text-slate-800 leading-snug">{item.criterion}</p>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px] font-medium text-slate-600 bg-slate-100">
                        Weight: {item.weight}/5
                      </Badge>
                      <span className="text-xs text-slate-400">ID: {item.id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                  
                  {/* Score Selector */}
                  <div className="space-y-2 shrink-0">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map(score => (
                        <button 
                          key={score}
                          onClick={() => setScores(prev => ({ ...prev, [item.id]: score }))}
                          className={cn(
                            "w-10 h-10 rounded-full text-sm font-semibold transition-all transform active:scale-95 border",
                            scores[item.id] === score
                              ? score >= 4 ? "bg-admin-primary text-white border-admin-primary shadow-sm"
                                : score >= 3 ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                                : "bg-red-500 text-white border-red-500 shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:border-admin-primary hover:bg-slate-50"
                          )}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[9px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                      <span>FAIL</span>
                      <span>PASS</span>
                      <span>EXCELLENT</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full pl-11 pr-4 py-2.5 text-sm rounded-md bg-slate-50 border border-slate-200 focus:bg-white focus:border-admin-primary focus:ring-1 focus:ring-admin-primary/20 outline-none text-slate-700 transition-colors"
                    placeholder="Physical evidence observations or remediation requirements..."
                    value={notes[item.id] ?? ""}
                    onChange={e => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* General Notes Block - Always Visible */}
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm space-y-2 mt-6">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Overall Inspection Narrative</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-4 text-sm font-medium outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary/20 transition-all min-h-[120px] resize-none text-slate-800 placeholder:text-slate-400"
              placeholder="Summarize the establishment's operational readiness, hygiene culture, and significant findings..."
              value={auditorNotes}
              onChange={e => setAuditorNotes(e.target.value)}
            />
          </div>

          {/* Final Submission Block */}
          {progressPct === 100 && (
            <div className="mt-8 p-6 bg-admin-primary text-white rounded-lg shadow-md relative overflow-hidden animate-in slide-in-from-bottom-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-full text-white">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Final Inspection Summary</h2>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Audit ID: {id.slice(-12).toUpperCase()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 ml-1">Official Auditor Recommendation</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { key: "approve", label: "Recommended Approval", icon: CheckCircle2, color: "border-emerald-500 text-emerald-500", active: "bg-emerald-600 text-white border-emerald-600" },
                      { key: "re_audit", label: "Require Remediation", icon: AlertCircle, color: "border-amber-500 text-amber-500", active: "bg-amber-600 text-white border-amber-600" },
                      { key: "reject", label: "Mandatory Rejection", icon: XCircle, color: "border-red-500 text-red-500", active: "bg-red-600 text-white border-red-600" },
                    ].map(opt => (
                      <button 
                        key={opt.key}
                        onClick={() => setRecommendation(opt.key as any)}
                        className={cn(
                          "flex items-center justify-center gap-2 py-3.5 px-4 rounded-md border font-semibold uppercase tracking-wider text-[11px] transition-all",
                          recommendation === opt.key ? opt.active : cn(opt.color, "bg-transparent hover:bg-white/5")
                        )}
                      >
                        <opt.icon className="h-4 w-4 shrink-0" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={saving || !recommendation}
                  className="w-full py-6 bg-admin-primary hover:bg-admin-hover text-white rounded-md text-sm font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Commit Audit Report"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
