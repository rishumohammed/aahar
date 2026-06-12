"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { applicationApi, adminApi } from "@/lib/api";
import { 
  ChevronLeft, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  MessageSquare,
  ClipboardCheck,
  User,
  Loader2,
  Building,
  ArrowLeft,
  KeyRound,
  Copy
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [action, setAction] = useState<"approve" | "reject" | "review" | null>(null);
  const [notes, setNotes] = useState("");
  const [working, setWorking] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);

  useEffect(() => {
    fetchApp();
  }, [id]);

  const fetchApp = async () => {
    try {
      const r = await applicationApi.get(id);
      setApp(r.data.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    setWorking(true);
    try {
      await applicationApi.updateStatus(id, status, notes);
      toast.success(`Application moved to ${status}`);
      await fetchApp();
      setAction(null);
      setNotes("");
    } catch (e) {
      toast.error("Failed to update status");
    } finally {
      setWorking(false);
    }
  };

  const handleCertify = async () => {
    setWorking(true);
    try {
      await adminApi.certify(id);
      toast.success("Application certified successfully!");
      await fetchApp();
      setAction(null);
    } catch (e) {
      toast.error("Failed to issue certification");
    } finally {
      setWorking(false);
    }
  };

  const handleResetPassword = async () => {
    setWorking(true);
    try {
      const res = await adminApi.resetPassword(app.applicantId);
      setCredentials(res.data.data);
      setCredentialsOpen(true);
      toast.success("Owner credentials reset successfully");
    } catch (e) {
      toast.error("Failed to reset credentials");
    } finally {
      setWorking(false);
    }
  };

  if (loading) return (
    <div className="p-20 flex justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-admin-primary" />
    </div>
  );

  if (!app) return (
    <div className="p-20 text-center">
      <h2 className="text-2xl font-bold text-slate-900">Application not found</h2>
      <Button variant="link" onClick={() => router.back()} className="mt-4">Return to Pipeline</Button>
    </div>
  );

  const entityName = app.restaurant?.name ?? app.hotel?.name ?? app.businessName ?? "Unknown";
  const entityCity = app.restaurant?.city ?? app.hotel?.city ?? app.city ?? "";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="mb-2 flex items-center justify-between">
        <Link href="/admin/applications" className="text-sm font-bold text-admin-primary flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Pipeline
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white shadow-sm border-slate-200 text-slate-600 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            Last Updated: {format(new Date(app.updatedAt), "dd MMM yyyy, HH:mm")}
          </Badge>
        </div>
      </div>

      {/* Header Card */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-0">
              {app.businessType === "fnb" ? "F&B Division" : "Accommodation"}
            </Badge>
            <Badge variant="outline" className="uppercase text-[10px] tracking-widest bg-slate-50 border-slate-200 text-slate-600 font-bold">
              {app.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{entityName}</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2 font-medium">
            <MapPin className="w-4 h-4" />
            {entityCity}
          </p>
        </div>
        
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-w-[250px] w-full md:w-auto">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="flex flex-col gap-2">
            {app.status === "submitted" && (
              <Button onClick={() => handleStatusChange("under_review")} disabled={working} className="w-full bg-admin-primary hover:bg-admin-hover text-white font-bold">
                {working ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Move to Under Review
              </Button>
            )}
            {["submitted", "under_review", "gap_analysis"].includes(app.status) && (
              <Button variant="outline" onClick={() => setAction("review")} className="w-full font-bold">
                Schedule Site Audit
              </Button>
            )}
            {app.status === "audit_complete" && (
              <Button onClick={() => setAction("approve")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Confirm & Issue License
              </Button>
            )}
            {!["certified", "rejected"].includes(app.status) && (
              <Button variant="ghost" onClick={() => setAction("reject")} className="w-full mt-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold">
                Reject Application
              </Button>
            )}
            {app.status === "certified" && (
               <Badge className="w-full justify-center py-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-sm">
                 <CheckCircle2 className="w-4 h-4 mr-2" /> Fully Certified
               </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200">
        {["overview", "documents", "audit"].map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)}
            className={cn(
              "pb-4 text-sm font-semibold capitalize transition-all border-b-2 -mb-px",
              tab === t 
                ? "text-admin-primary border-admin-primary" 
                : "text-slate-500 hover:text-slate-800 border-transparent"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main content column */}
        <div className="lg:col-span-8 space-y-8 min-h-[500px]">

          {/* Overview tab */}
          {tab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 px-6 pt-6">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-admin-light flex items-center justify-center text-admin-primary">
                      <Building className="w-4 h-4" />
                    </div>
                    Business Registration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    {[
                      ["Business Identity", entityName, FileText],
                      ["Owner / Applicant", app.applicant?.name, User],
                      ["Primary Email", app.applicant?.email, MessageSquare],
                      ["Contact Phone", app.applicant?.phone ?? "—", Clock],
                      ["Submission Date", app.submittedAt ? format(new Date(app.submittedAt), "dd MMM yyyy") : "—", Calendar],
                    ].map(([label, value, Icon]: any) => (
                      <div key={label}>
                        <dt className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 flex items-center gap-1.5">
                          <Icon className="h-3 w-3" />
                          {label}
                        </dt>
                        <dd className="text-sm font-semibold text-slate-900">{value ?? "—"}</dd>
                        {label === "Primary Email" && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={handleResetPassword} 
                            disabled={working}
                            className="px-0 h-auto text-xs mt-1 text-admin-primary flex items-center gap-1"
                          >
                            <KeyRound className="w-3 h-3" /> Reset Credentials
                          </Button>
                        )}
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>

              {app.adminNotes && (
                <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Administrative Notes</h4>
                    <p className="text-sm font-medium text-amber-800 leading-relaxed">{app.adminNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents tab */}
          {tab === "documents" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Compliance Documents</h3>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">{app.documents?.length ?? 0} Files</Badge>
              </div>
              
              {!app.documents?.length ? (
                <div className="p-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">No verification documents uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {app.documents.map((doc: any) => (
                    <Card key={doc.id} className="p-5 rounded-xl border-slate-200 shadow-sm hover:border-admin-primary transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                          {doc.type.includes("pdf") ? <FileText className="h-5 w-5" /> : <ClipboardCheck className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">
                            {doc.size ? `${(doc.size / 1024 / 1024).toFixed(1)} MB · ` : ""}
                            Uploaded {format(new Date(doc.uploadedAt), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          View <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Audit tab */}
          {tab === "audit" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-slate-900">Technical Audit Status</h3>
              
              {!app.audit ? (
                <div className="p-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <ShieldCheck className="h-10 w-10 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-6">Physical site audit has not been initiated for this application.</p>
                  <Button onClick={() => setAction("review")}>Schedule Regional Audit</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                    <CardContent className="p-6">
                      <dl className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                        {[
                          ["Assigned Auditor", app.audit.auditor?.name],
                          ["Inspection Date", format(new Date(app.audit.scheduledAt), "dd MMM yyyy")],
                          ["Audit Status", app.audit.status],
                          ["Overall Score", app.audit.totalScore ? `${app.audit.totalScore} / 5.0` : "Pending"],
                          ["Recommendation", app.audit.recommendation ?? "Pending Review"],
                          ["Close Date", app.audit.completedAt ? format(new Date(app.audit.completedAt), "dd MMM yyyy") : "—"],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <dt className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</dt>
                            <dd className="text-sm font-semibold text-slate-900 capitalize">{value ?? "—"}</dd>
                          </div>
                        ))}
                      </dl>

                      {app.audit.auditorNotes && (
                        <div className="pt-6 mt-6 border-t border-slate-100">
                          <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Field Notes</h4>
                          <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 font-medium leading-relaxed border border-slate-100">
                            {app.audit.auditorNotes}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Certificate display */}
          {app.certification && (
            <div className="mt-8 p-8 bg-admin-primary text-white rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl text-white">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Official Certification Issued</h2>
                    <p className="text-sm text-white/70 font-medium">AAHAR Trust Standard Verified</p>
                  </div>
                </div>
                
                <dl className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-xl border border-white/10">
                  {[
                    ["License No.", app.certification.certNumber],
                    ["Issue Date", format(new Date(app.certification.issuedAt), "dd MMM yyyy")],
                    ["Expiry Date", format(new Date(app.certification.expiresAt), "dd MMM yyyy")],
                    ["Global Status", app.certification.status],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">{label}</dt>
                      <dd className="text-sm font-bold">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex gap-4">
                  <a href={`/verify/${app.certification.certNumber}`} target="_blank" className="flex-1">
                    <Button variant="secondary" className="w-full bg-white text-admin-primary hover:bg-white/90">
                      View Live Badge
                    </Button>
                  </a>
                  {app.certification.pdfUrl && (
                    <a href={app.certification.pdfUrl} target="_blank" className="flex-1">
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        Download PDF
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Status Tracker */}
        <aside className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-800">Lifecycle Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />
                {[
                  "submitted", "under_review", "audit_scheduled",
                  "audit_complete", "certified"
                ].map((s, i) => {
                  const steps = [
                    "submitted", "under_review", "audit_scheduled",
                    "audit_complete", "certified"
                  ];
                  const currentIdx = steps.indexOf(app.status);
                  const done = i <= currentIdx;
                  const current = i === currentIdx;
                  return (
                    <div key={s} className="flex items-center gap-4 relative z-10">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                        done ? "bg-admin-primary text-white shadow-sm" : "bg-white border-2 border-slate-200 text-transparent",
                        current && "ring-4 ring-admin-primary/20 scale-110"
                      )}>
                        {done ? "✓" : ""}
                      </div>
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wider transition-colors",
                        done ? "text-slate-900" : "text-slate-400"
                      )}>
                        {s.replace(/_/g, " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Schedule Audit Dialog */}
      <Dialog open={action === "review"} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">Schedule Site Audit</DialogTitle>
          </DialogHeader>
          <ScheduleAuditForm 
            applicationId={id} 
            onSuccess={() => {
              setAction(null);
              fetchApp();
            }}
            onCancel={() => setAction(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={action === "approve"} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border-emerald-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-emerald-600">Confirm Certification</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm font-medium text-slate-600 mb-6">
              Warning: This action will trigger global indexing and generate a cryptographically signed AAHAR license for {entityName}.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
              <Button onClick={handleCertify} disabled={working} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                {working ? "Processing..." : "Issue Certification"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={action === "reject"} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border-rose-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-rose-600">Reject Application</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 uppercase">Rejection Reason</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
                placeholder="Provide feedback for the applicant..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setAction(null); setNotes(""); }}>Cancel</Button>
              <Button onClick={() => handleStatusChange("rejected")} disabled={!notes.trim() || working} variant="destructive" className="font-bold">
                {working ? "Rejecting..." : "Finalize Rejection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-admin-primary" />
              Owner Credentials Reset
            </DialogTitle>
          </DialogHeader>
          {credentials && (
            <div className="py-2 space-y-4">
              <p className="text-sm text-slate-600">
                The password for the owner account has been reset to the system default. Please copy and share these details securely with the owner.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Login Email</Label>
                  <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                    <span className="text-sm font-semibold">{credentials.email}</span>
                    <Button variant="ghost" size="sm" onClick={() => {
                      navigator.clipboard.writeText(credentials.email);
                      toast.success("Email copied");
                    }} className="h-6 w-6 p-0 text-slate-400 hover:text-slate-900">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Temporary Password</Label>
                  <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                    <span className="text-sm font-semibold">{credentials.password}</span>
                    <Button variant="ghost" size="sm" onClick={() => {
                      navigator.clipboard.writeText(credentials.password);
                      toast.success("Password copied");
                    }} className="h-6 w-6 p-0 text-slate-400 hover:text-slate-900">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setCredentialsOpen(false)} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                  Acknowledge & Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

// ── Schedule Audit Form ─────────────────────────
function ScheduleAuditForm({
  applicationId, onSuccess, onCancel
}: {
  applicationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [auditors, setAuditors] = useState<any[]>([]);
  const [auditorId, setAuditorId] = useState("");
  const [date, setDate] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    adminApi.auditors()
      .then(r => setAuditors(r.data.data))
      .catch(console.error);
  }, []);

  const handleAssign = async () => {
    if (!auditorId || !date) return;
    setWorking(true);
    try {
      await adminApi.assignAudit(applicationId, auditorId, date);
      toast.success("Audit scheduled successfully");
      onSuccess();
    } catch (e) {
      toast.error("Failed to schedule audit");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div className="space-y-3">
        <Label className="text-xs font-bold text-slate-600 uppercase">Select Regional Auditor</Label>
        <Select value={auditorId} onValueChange={setAuditorId}>
          <SelectTrigger className="h-12 bg-slate-50 rounded-xl font-semibold">
            <SelectValue placeholder="Choose an auditor..." />
          </SelectTrigger>
          <SelectContent>
            {auditors.map((a: any) => (
              <SelectItem key={a.id} value={a.id} className="font-medium">{a.name} ({a.city || 'Regional'})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <Label className="text-xs font-bold text-slate-600 uppercase">Preferred Audit Window</Label>
        <Input 
          type="datetime-local"
          value={date} 
          onChange={e => setDate(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          className="h-12 bg-slate-50 rounded-xl font-semibold"
        />
      </div>
      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onCancel} className="h-11">Cancel</Button>
        <Button onClick={handleAssign} disabled={!auditorId || !date || working} className="bg-admin-primary hover:bg-admin-hover text-white font-bold h-11">
          {working ? "Assigning..." : "Confirm Schedule"}
        </Button>
      </DialogFooter>
    </div>
  );
}
