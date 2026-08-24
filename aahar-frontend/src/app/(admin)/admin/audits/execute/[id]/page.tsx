"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
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

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function AdminAuditExecutePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuthStore();
  const [audit, setAudit] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [auditorNotes, setAuditorNotes] = useState("");
  const [recommendation, setRecommendation] = useState<"approve" | "reject" | "re_audit" | "">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    fetch(`${API}/audits/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(d => {
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
  }, [id, token]);

  const handleSubmit = async () => {
    if (!recommendation) {
      toast.error("Please select a recommendation before submitting.");
      return;
    }
    setSaving(true);
    try {
      const filledChecklist = (audit.checklist || []).map((item: any) => ({
        ...item,
        score: scores[item.id],
        notes: notes[item.id] ?? null,
      }));

      const res = await fetch(`${API}/audits/${id}/submit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          checklist: filledChecklist,
          auditorNotes,
          recommendation,
          sitePhotos: [],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit audit");
      }

      toast.success("Executive Audit Submitted!");
      router.push("/admin/audits?submitted=true");
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="h-10 w-10 animate-spin text-admin-primary mx-auto" /></div>;
  if (!audit) return <div className="p-20 text-center">Audit not found</div>;

  const checklist = audit.checklist ?? [];
  const sections = [...new Set(checklist.map((i: any) => i.section))] as string[];
  const sectionItems = checklist.filter((i: any) => i.section === activeSection);
  const totalScored = checklist.filter((i: any) => scores[i.id] !== undefined).length;
  const progressPct = checklist.length ? Math.round((totalScored / checklist.length) * 100) : 0;

  const entityName = audit.application?.restaurant?.name ?? audit.application?.hotel?.name ?? "Unknown Property";

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-2">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-admin-primary transition-colors">
            <ChevronLeft className="h-4 w-4" /> BACK TO AUDITS
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{entityName}</h1>
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">Admin Override Mode</Badge>
          </div>
          <p className="text-sm font-medium text-slate-500">Standard: {audit.track.toUpperCase()} Division</p>
        </div>

        <div className="flex flex-col items-end min-w-[200px]">
          <div className="flex justify-between w-full mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completion</span>
            <span className="text-sm font-bold text-admin-primary">{progressPct}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-admin-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-xs font-medium text-slate-400 mt-2">{totalScored} of {checklist.length} checked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3">
          <Card className="p-2 border-slate-200 shadow-sm sticky top-6">
            <div className="space-y-1">
              {sections.map(section => {
                const sectionItems = checklist.filter((i: any) => i.section === section);
                const scoredInSection = sectionItems.filter((i: any) => scores[i.id] !== undefined).length;
                const isComplete = scoredInSection === sectionItems.length;

                return (
                  <button 
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between group",
                      activeSection === section 
                        ? "bg-admin-light text-admin-primary font-semibold" 
                        : "text-slate-600 hover:bg-slate-50 font-medium"
                    )}
                  >
                    <span className="text-sm">{section}</span>
                    {isComplete && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          <div className="space-y-4">
            {sectionItems.map((item: any) => (
              <Card key={item.id} className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <p className="text-base font-semibold text-slate-800 leading-snug">{item.criterion}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium bg-slate-100 text-slate-600 border-none">
                      Weight: {item.weight}/5
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 shrink-0">
                    {[0, 1, 2, 3, 4, 5].map(score => (
                      <button 
                        key={score}
                        onClick={() => setScores(prev => ({ ...prev, [item.id]: score }))}
                        className={cn(
                          "w-10 h-10 rounded-md text-sm font-semibold transition-all flex items-center justify-center",
                          scores[item.id] === score
                            ? "bg-white text-admin-primary shadow-sm border border-slate-200"
                            : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
                        )}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    className="w-full min-h-[80px] p-4 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all resize-y"
                    placeholder="Admin mediation notes or observations (optional)..."
                    value={notes[item.id] ?? ""}
                    onChange={e => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Executive Decision Area */}
          {progressPct === 100 && (
            <Card className="mt-12 p-8 border-admin-primary/20 shadow-lg bg-gradient-to-b from-white to-admin-light/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-admin-primary" />
              
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-admin-light mb-2">
                    <ShieldCheck className="h-6 w-6 text-admin-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900">Executive Audit Decision</h2>
                  <p className="text-slate-500 text-sm">Please provide your final assessment and recommendation for this establishment.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Executive Summary</label>
                  <textarea
                    className="w-full min-h-[120px] p-4 text-sm bg-white border border-slate-300 rounded-lg focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all resize-y"
                    placeholder="Enter detailed executive summary for the audit report..."
                    value={auditorNotes}
                    onChange={e => setAuditorNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Final Recommendation</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: "approve", label: "Approve Certification", color: "emerald" },
                      { value: "re_audit", label: "Require Re-Audit", color: "amber" },
                      { value: "reject", label: "Reject Application", color: "rose" }
                    ].map(opt => {
                      const isSelected = recommendation === opt.value;
                      const colorMap: any = {
                        emerald: isSelected ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500" : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 text-slate-600",
                        amber: isSelected ? "border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500" : "border-slate-200 hover:border-amber-200 hover:bg-amber-50/50 text-slate-600",
                        rose: isSelected ? "border-rose-500 bg-rose-50 text-rose-700 ring-1 ring-rose-500" : "border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 text-slate-600",
                      };
                      
                      return (
                        <button 
                          key={opt.value}
                          onClick={() => setRecommendation(opt.value as any)}
                          className={cn(
                            "flex items-center justify-center p-4 rounded-xl border transition-all text-sm font-semibold",
                            colorMap[opt.color]
                          )}
                        >
                          {isSelected && <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={saving || !recommendation}
                  className="w-full h-14 bg-admin-text hover:bg-admin-primary text-white rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Decision...
                    </>
                  ) : (
                    "Submit Executive Audit"
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
