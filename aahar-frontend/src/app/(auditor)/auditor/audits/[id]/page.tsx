"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auditorApi, uploadApi } from "@/lib/api";
import { MAX_PHOTO_SIZE_MB, validateFileSize } from "@/lib/upload";
import { toast } from "sonner";
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
  MessageSquare,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComplianceChatDialog } from "@/components/shared/ComplianceChatDialog";

export default function AuditChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [audit, setAudit] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [auditorNotes, setAuditorNotes] = useState("");
  const [recommendation, setRecommendation] = useState<"approve" | "reject" | "re_audit" | "needs_corrections" | "">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [sitePhotos, setSitePhotos] = useState<string[]>([]);

  // Load from local storage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedScores = localStorage.getItem(`audit_scores_${id}`);
      const savedComments = localStorage.getItem(`audit_comments_${id}`);
      if (savedScores) setScores(JSON.parse(savedScores));
      if (savedComments) setComments(JSON.parse(savedComments));
    }
  }, [id]);

  // Save to local storage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (Object.keys(scores).length > 0) localStorage.setItem(`audit_scores_${id}`, JSON.stringify(scores));
      if (Object.keys(comments).length > 0) localStorage.setItem(`audit_comments_${id}`, JSON.stringify(comments));
    }
  }, [scores, comments, id]);

  useEffect(() => {
    auditorApi.get(id)
    .then(res => {
      const d = res.data;
      setAudit(d.data);
      if (d.data.checklist) {
        // Only load API scores if local storage is empty or audit is already read-only
        const isReadOnlyState = d.data.status === "submitted" || d.data.status === "completed" || d.data.status === "reviewed";
        const existingScores: Record<string, number> = {};
        const existingComments: Record<string, string> = {};
        d.data.checklist.forEach((item: any) => {
          if (item.score !== undefined) existingScores[item.id] = item.score;
          if (item.comment) existingComments[item.id] = item.comment;
        });
        
        if (isReadOnlyState) {
          setScores(existingScores);
          setComments(existingComments);
        } else {
          setScores(prev => Object.keys(prev).length > 0 ? prev : existingScores);
          setComments(prev => Object.keys(prev).length > 0 ? prev : existingComments);
        }

        if (d.data.recommendation) setRecommendation(d.data.recommendation);
        if (d.data.auditorNotes) setAuditorNotes(d.data.auditorNotes);
        if (d.data.sitePhotos && Array.isArray(d.data.sitePhotos)) setSitePhotos(d.data.sitePhotos);
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

  const isReadOnly = audit.status === "submitted" || audit.status === "completed" || audit.status === "reviewed";

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
    
    // Get Geolocation
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        await processSubmit(lat, lng);
      },
      async (error) => {
        console.warn("Geolocation failed or denied, submitting without GPS data", error);
        await processSubmit(null, null);
      },
      { timeout: 10000 }
    );
  };

  const processSubmit = async (lat: number | null, lng: number | null) => {
    try {
      const filledChecklist = checklist.map((item: any) => ({
        ...item,
        score: scores[item.id],
        comment: comments[item.id] ?? null,
      }));

      await auditorApi.submit(id, {
        checklist: filledChecklist,
        auditorNotes,
        recommendation,
        sitePhotos,
        lat,
        lng
      });

      // Clear local storage
      localStorage.removeItem(`audit_scores_${id}`);
      localStorage.removeItem(`audit_comments_${id}`);

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
        
        <div className="flex flex-col gap-4 items-end">
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
          
          <ComplianceChatDialog 
            applicationId={audit?.applicationId} 
            trigger={
              <Button variant="outline" className="w-full bg-white text-admin-text border-slate-200 gap-2 hover:bg-admin-primary hover:text-white transition-colors shadow-sm">
                <MessageSquare className="h-4 w-4 text-admin-primary" />
                Message Property
              </Button>
            } 
          />
        </div>
      </div>

      {isReadOnly && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-emerald-800">Audit Finalized & Submitted</h3>
              <p className="text-xs text-emerald-600 mt-0.5">This report is locked for editing. You are viewing it in read-only mode.</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">Final Score: {audit.totalScore}/5</span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{audit.recommendation}</span>
          </div>
        </div>
      )}

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
                      {item.isCritical && (
                        <Badge variant="destructive" className="text-[10px] font-medium bg-red-500">
                          CRITICAL
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400">ID: {item.id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                  
                  {/* Score Selector */}
                  <div className="space-y-2 shrink-0">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map(score => (
                        <button 
                          key={score}
                          disabled={isReadOnly}
                          onClick={() => setScores(prev => ({ ...prev, [item.id]: score }))}
                          className={cn(
                            "w-10 h-10 rounded-full text-sm font-semibold transition-all transform border",
                            !isReadOnly && "active:scale-95 hover:border-admin-primary hover:bg-slate-50",
                            isReadOnly && "cursor-default opacity-90",
                            scores[item.id] === score
                              ? score >= 4 ? "bg-admin-primary text-white border-admin-primary shadow-sm"
                                : score >= 3 ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                                : "bg-red-500 text-white border-red-500 shadow-sm"
                              : "bg-white border-slate-200 text-slate-600"
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
                    className="w-full pl-11 pr-4 py-2.5 text-sm rounded-md bg-slate-50 border border-slate-200 focus:bg-white focus:border-admin-primary focus:ring-1 focus:ring-admin-primary/20 outline-none text-slate-700 transition-colors disabled:opacity-70 disabled:bg-slate-100"
                    placeholder="Physical evidence observations or remediation requirements..."
                    value={comments[item.id] ?? ""}
                    onChange={e => setComments(prev => ({ ...prev, [item.id]: e.target.value }))}
                    disabled={isReadOnly}
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Site Photos Block */}
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4 mt-6">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Site Evidence Photos</h3>
              <p className="text-xs text-slate-400 font-medium ml-1 mt-1">Attach supporting images for your findings.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sitePhotos.map((photo, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                  <img src={photo} alt="evidence" className="w-full h-full object-cover" />
                  {!isReadOnly && (
                    <button 
                      onClick={() => setSitePhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {!isReadOnly && (
                <label className="aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-admin-primary hover:bg-admin-light/30 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer">
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Upload Photo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const sizeErr = validateFileSize(file, MAX_PHOTO_SIZE_MB);
                      if (sizeErr) {
                        toast.error(sizeErr);
                        e.target.value = "";
                        return;
                      }
                      const loadToast = toast.loading("Uploading site photo...");
                      try {
                        const res = await uploadApi.singlePhoto(file);
                        const url = res.data.data.url;
                        const fullUrl = url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}${url}`;
                        setSitePhotos(prev => [...prev, fullUrl]);
                        toast.success("Site photo uploaded", { id: loadToast });
                      } catch (error: any) {
                        toast.error(error.response?.data?.message || error.message || `Upload failed (Max allowed: ${MAX_PHOTO_SIZE_MB}MB)`, { id: loadToast });
                      }
                    }} 
                  />
                </label>
              )}
            </div>
          </div>

          {/* General Notes Block - Always Visible */}
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm space-y-2 mt-6">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Overall Inspection Narrative</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-4 text-sm font-medium outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary/20 transition-all min-h-[120px] resize-none text-slate-800 placeholder:text-slate-400 disabled:opacity-70 disabled:bg-slate-100"
              placeholder="Summarize the establishment's operational readiness, hygiene culture, and significant findings..."
              value={auditorNotes}
              onChange={e => setAuditorNotes(e.target.value)}
              disabled={isReadOnly}
            />
          </div>

          {/* Final Submission Block */}
          {progressPct === 100 && !isReadOnly && (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { key: "approve", label: "Recommended Approval", icon: CheckCircle2, active: "bg-emerald-500 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-admin-primary" },
                      { key: "needs_corrections", label: "Require Corrections", icon: AlertCircle, active: "bg-blue-500 text-white border-blue-500 shadow-md ring-2 ring-blue-500/30 ring-offset-2 ring-offset-admin-primary" },
                      { key: "re_audit", label: "Require Re-Audit", icon: AlertCircle, active: "bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-500/30 ring-offset-2 ring-offset-admin-primary" },
                      { key: "reject", label: "Mandatory Rejection", icon: XCircle, active: "bg-red-500 text-white border-red-500 shadow-md ring-2 ring-red-500/30 ring-offset-2 ring-offset-admin-primary" },
                    ].map(opt => (
                      <button 
                        key={opt.key}
                        onClick={() => setRecommendation(opt.key as any)}
                        className={cn(
                          "flex items-center justify-center gap-2 py-3.5 px-4 rounded-md border font-semibold uppercase tracking-wider text-[11px] transition-all",
                          recommendation === opt.key ? opt.active : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
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
                  className="w-full py-6 bg-white hover:bg-slate-50 text-admin-primary rounded-md text-sm font-black uppercase tracking-wider shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
