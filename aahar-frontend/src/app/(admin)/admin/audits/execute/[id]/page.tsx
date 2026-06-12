"use client";

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
      alert("Please select a recommendation before submitting.");
      return;
    }
    setSaving(true);
    try {
      const filledChecklist = (audit.checklist || []).map((item: any) => ({
        ...item,
        score: scores[item.id],
        notes: notes[item.id] ?? null,
      }));

      await fetch(`${API}/audits/${id}/submit`, {
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

      router.push("/admin/audits?submitted=true");
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
    <div className="max-w-7xl mx-auto space-y-6">
       <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="space-y-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-admin-text transition-colors">
            <ChevronLeft className="h-4 w-4" /> Exit Audit Mode
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{entityName}</h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase tracking-widest text-[9px] font-black py-1.5 px-4">Admin Override Mode</Badge>
          </div>
          <p className="text-sm font-bold text-slate-600 uppercase tracking-widest opacity-60">Standard: {audit.track.toUpperCase()} Division</p>
        </div>
        
        <div className="card p-6 bg-white border-slate-200 shadow-xl min-w-[280px] rounded-[2rem]">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Audit Completion</div>
              <div className="text-2xl font-black text-slate-900 tracking-tighter">{totalScored} / {checklist.length}</div>
            </div>
            <div className="text-sm font-black text-admin-text">{progressPct}%</div>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className="h-full bg-admin-primary transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3 space-y-2">
          {sections.map(section => (
            <button 
              key={section}
              onClick={() => setActiveSection(section)}
              className={cn(
                "w-full text-left p-5 rounded-[1.5rem] transition-all flex items-start gap-4 group",
                activeSection === section 
                  ? "bg-admin-primary text-white shadow-xl" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black uppercase tracking-widest leading-tight">{section}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-9 space-y-8">
           <div className="grid grid-cols-1 gap-6">
            {sectionItems.map((item: any) => (
              <Card key={item.id} className="p-8 rounded-[2.5rem] border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
                  <div className="space-y-3 flex-1">
                    <p className="text-lg font-black text-slate-900 leading-snug">{item.criterion}</p>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest py-1 border-slate-200">
                      Weight: {item.weight}/5
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map(score => (
                      <button 
                        key={score}
                        onClick={() => setScores(prev => ({ ...prev, [item.id]: score }))}
                        className={cn(
                          "w-11 h-11 rounded-xl text-xs font-black transition-all border-2",
                          scores[item.id] === score
                            ? "bg-admin-primary text-white border-admin-primary"
                            : "bg-white border-slate-200 text-slate-600 hover:border-admin-primary"
                        )}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  className="input py-4 text-xs rounded-xl bg-slate-50 border-none"
                  placeholder="Admin mediation notes or observations..."
                  value={notes[item.id] ?? ""}
                  onChange={e => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                />
              </Card>
            ))}
          </div>

          {progressPct === 100 && (
            <div className="mt-20 p-12 bg-admin-primary text-white rounded-[3.5rem] shadow-2xl space-y-10">
                <h2 className="text-3xl font-black uppercase tracking-tight">Executive Audit Decision</h2>
                <textarea
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-8 text-sm outline-none focus:border-white/50 transition-all min-h-[160px]"
                  placeholder="Enter executive summary for the audit report..."
                  value={auditorNotes}
                  onChange={e => setAuditorNotes(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["approve", "re_audit", "reject"].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => setRecommendation(opt as any)}
                      className={cn(
                        "p-6 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all",
                        recommendation === opt ? "bg-white text-admin-text border-white" : "border-white/10 text-white/40 hover:border-white/30"
                      )}
                    >
                      {opt.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={handleSubmit}
                  disabled={saving || !recommendation}
                  className="w-full py-10 bg-white text-admin-text hover:bg-white/90 rounded-[2rem] text-xl font-black uppercase tracking-[0.4em]"
                >
                  {saving ? "Processing..." : "Submit Executive Audit"}
                </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
