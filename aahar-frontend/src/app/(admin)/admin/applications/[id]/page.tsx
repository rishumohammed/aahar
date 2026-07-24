"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { applicationApi, adminApi, auditorApi } from "@/lib/api";
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
  Copy,
  RefreshCcw
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
  const [action, setAction] = useState<"approve" | "reject" | "review" | "revoke" | "reinstate" | "require_reaudit" | null>(null);
  const [notes, setNotes] = useState("");
  const [working, setWorking] = useState(false);

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

  const handleRevokeCertificate = async () => {
    if (!app.certification) return;
    if (!notes.trim()) {
      toast.error("Please provide a reason for revocation");
      return;
    }
    setWorking(true);
    try {
      await adminApi.revokeCert(app.certification.id, notes);
      toast.success("Certificate has been revoked");
      await fetchApp();
      setAction(null);
      setNotes("");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to revoke certificate");
    } finally {
      setWorking(false);
    }
  };

  const handleRequireReAudit = async () => {
    if (!app.audit) return;
    setWorking(true);
    try {
      await adminApi.reopenAudit(app.audit.id);
      toast.success("Audit reopened! The property must now undergo a re-audit before reinstatement.");
      await fetchApp();
      setAction(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to require re-audit");
    } finally {
      setWorking(false);
    }
  };

  const handleReinstateCertificate = async () => {
    if (!app.certification) return;
    setWorking(true);
    try {
      await adminApi.reinstateCert(app.certification.id);
      toast.success("Certificate has been reinstated and is active again");
      await fetchApp();
      setAction(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to reinstate certificate");
    } finally {
      setWorking(false);
    }
  };
  const handleReopenAudit = async () => {
    if (!app.audit) return;
    setWorking(true);
    try {
      await adminApi.reopenAudit(app.audit.id);
      toast.success("Audit unlocked and reverted to in_progress");
      await fetchApp();
    } catch (e) {
      toast.error("Failed to reopen audit");
    } finally {
      setWorking(false);
    }
  };

  const handleDownloadAuditReport = async () => {
    if (!app.audit) return;
    try {
      toast.info("Generating report...");
      const res = await auditorApi.downloadReport(app.audit.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `AuditReport_${app.audit.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report downloaded");
    } catch (e) {
      toast.error("Failed to download report");
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
  const entityCity = [
    app.restaurant?.address ?? app.hotel?.address ?? app.address,
    app.restaurant?.city ?? app.hotel?.city ?? app.city,
    app.restaurant?.state ?? app.hotel?.state ?? app.state,
    app.pincode
  ].filter(Boolean).join(", ") || "No location provided";
  
  const profileImage = app.restaurant?.photos?.logo ?? app.hotel?.photos?.logo ?? null;
  const googleLink = app.restaurant?.googleLocationLink ?? app.hotel?.googleLocationLink ?? null;

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
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Profile Image / Logo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center shadow-sm">
            {profileImage ? (
              <img src={profileImage} alt={entityName} className="w-full h-full object-cover" />
            ) : (
              <Building className="w-10 h-10 text-slate-300" />
            )}
          </div>
          
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
            <div className="text-slate-500 mt-3 flex flex-col gap-2 text-sm font-medium">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{entityCity}</span>
              </div>
              {googleLink && (
                <a href={googleLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-admin-primary hover:underline ml-6">
                  <ExternalLink className="w-3.5 h-3.5" />
                  View on Google Maps
                </a>
              )}
            </div>
          </div>
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
            {app.status === "audit_complete" && (!app.certification || app.certification.status !== "revoked") && (
              <Button onClick={() => setAction("approve")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Confirm & Issue License
              </Button>
            )}
            {app.status === "audit_complete" && app.certification?.status === "revoked" && (
              <Button onClick={() => setAction("reinstate")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Confirm & Reinstate License
              </Button>
            )}
            {(app.audit?.status === "submitted" || app.audit?.status === "completed" || app.audit?.status === "reviewed") && !["certified", "rejected"].includes(app.status) && (
              <Button variant="outline" onClick={handleReopenAudit} disabled={working} className="w-full mt-2 font-bold text-amber-600 border-amber-200 hover:bg-amber-500 hover:text-white transition-colors duration-300 shadow-sm">
                Unlock / Reopen Audit
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

                      {(app.audit.status === "submitted" || app.audit.status === "completed" || app.audit.status === "reviewed") && (
                        <>
                          {app.audit.sitePhotos && app.audit.sitePhotos.length > 0 && (
                            <div className="pt-6 mt-6 border-t border-slate-100">
                              <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Site Evidence Photos</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {app.audit.sitePhotos.map((photo: string, i: number) => (
                                  <a key={i} href={photo} target="_blank" rel="noopener noreferrer" className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group block shadow-sm">
                                    <img src={photo} alt="evidence" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {app.audit.checklist && app.audit.checklist.length > 0 && (
                            <div className="pt-6 mt-6 border-t border-slate-100 space-y-4">
                              <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Detailed Checklist Scores</h4>
                              {Array.from(new Set(app.audit.checklist.map((i: any) => i.section))).map((section: any) => (
                                <div key={section} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider flex justify-between items-center">
                                    {section}
                                    <span className="text-[10px] text-slate-400 font-semibold tracking-normal normal-case">
                                      {app.audit.checklist.filter((i: any) => i.section === section).length} items
                                    </span>
                                  </div>
                                  <div className="divide-y divide-slate-100 bg-white">
                                    {app.audit.checklist.filter((i: any) => i.section === section).map((item: any) => (
                                      <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="flex-1">
                                          <div className="flex items-start gap-2">
                                            <p className="text-sm font-semibold text-slate-800">{item.criterion}</p>
                                            {item.isCritical && (
                                              <Badge variant="destructive" className="shrink-0 text-[9px] uppercase tracking-widest bg-red-500">Critical</Badge>
                                            )}
                                          </div>
                                          {item.comment && (
                                            <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-100">
                                              <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px] block mb-0.5">Auditor Comment:</span>
                                              {item.comment}
                                            </div>
                                          )}
                                        </div>
                                        <div className="shrink-0 flex flex-col items-end gap-1.5 justify-center">
                                          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Weight: {item.weight}</span>
                                          <Badge className={cn(
                                            "w-9 h-9 p-0 flex items-center justify-center text-sm font-bold border-0 shadow-sm",
                                            item.score >= 4 ? "bg-emerald-500 text-white" : item.score >= 3 ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                                          )}>
                                            {item.score}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="pt-6 mt-6 border-t border-slate-100">
                            <Button onClick={handleDownloadAuditReport} variant="outline" className="w-full sm:w-auto gap-2 text-admin-primary border-admin-primary/20 hover:bg-admin-primary hover:text-white transition-colors duration-300 shadow-sm">
                              <FileText className="h-4 w-4" /> Download Complete Audit Report (PDF)
                            </Button>
                          </div>
                        </>
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

                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <a href={`/verify/${app.certification.certNumber}`} target="_blank" className="flex-1">
                      <Button variant="secondary" className="w-full bg-white text-admin-primary hover:bg-white/90">
                        View Live Badge
                      </Button>
                    </a>
                    {app.certification.pdfUrl && (
                      <a href={app.certification.pdfUrl} target="_blank" className="flex-1">
                        <Button variant="outline" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10">
                          Download PDF
                        </Button>
                      </a>
                    )}
                  </div>
                  {app.certification.status === "active" && (
                    <Button 
                      variant="destructive" 
                      className="w-full bg-red-500 hover:bg-red-600 text-white shadow-sm border-0"
                      onClick={() => { setAction("revoke"); setNotes(""); }}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" /> Revoke Certificate
                    </Button>
                  )}
                  {app.certification.status === "revoked" && !["audit_scheduled", "in_progress", "audit_complete"].includes(app.status) && (
                    <Button 
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-0"
                      onClick={() => { setAction("require_reaudit"); }}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" /> Require Re-Audit for Reinstatement
                    </Button>
                  )}
                  {app.certification.status === "revoked" && ["audit_scheduled", "in_progress"].includes(app.status) && (
                    <div className="w-full py-2 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold text-center">
                      Re-Audit in Progress...
                    </div>
                  )}
                  {app.certification.status === "revoked" && app.status === "audit_complete" && (
                     <div className="w-full py-2 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold text-center flex flex-col gap-2">
                       <span>Re-Audit Completed!</span>
                       <Button 
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm border-0"
                          onClick={() => { setAction("reinstate"); }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Reinstate Certificate
                        </Button>
                     </div>
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
                  const stepMap: Record<string, number> = {
                    "draft": -1,
                    "submitted": 0,
                    "under_review": 1,
                    "gap_analysis": 1,
                    "audit_scheduled": 2,
                    "audit_complete": 3,
                    "pending_corrections": 3,
                    "approved": 3,
                    "certified": 4,
                    "rejected": -1
                  };
                  
                  const currentIdx = stepMap[app.status] ?? -1;
                  const isRejected = app.status === "rejected";
                  const done = !isRejected && i <= currentIdx;
                  const current = !isRejected && i === currentIdx;
                  
                  return (
                    <div key={s} className="flex items-center gap-4 relative z-10">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                        isRejected && currentIdx === -1 && i === 0 ? "bg-rose-500 text-white shadow-sm ring-4 ring-rose-500/20" : 
                        done ? "bg-admin-primary text-white shadow-sm" : "bg-white border-2 border-slate-200 text-transparent",
                        current && "ring-4 ring-admin-primary/20 scale-110"
                      )}>
                        {isRejected && currentIdx === -1 && i === 0 ? "✕" : done ? "✓" : ""}
                      </div>
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wider transition-colors",
                        isRejected && currentIdx === -1 && i === 0 ? "text-rose-600" :
                        done ? "text-slate-900" : "text-slate-400"
                      )}>
                        {isRejected && i === 0 ? "REJECTED" : s.replace(/_/g, " ")}
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

      {/* Revoke Dialog */}
      <Dialog open={action === "revoke"} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Revoke Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              You are about to revoke the certificate for this property. This action will immediately mark the badge as revoked globally. Please provide a reason.
            </p>
            <div className="space-y-2">
              <Label>Revocation Reason</Label>
              <Input 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="e.g. Failed surprise compliance check" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRevokeCertificate} disabled={working || !notes.trim()}>
              {working ? "Revoking..." : "Confirm Revocation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reinstate Dialog */}
      <Dialog open={action === "reinstate"} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-emerald-600">Reinstate Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              The property has successfully completed the re-audit. This action will immediately mark the badge as active globally and restore its trusted status.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleReinstateCertificate} disabled={working}>
              {working ? "Reinstating..." : "Confirm Reinstatement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Require Re-Audit Dialog */}
      <Dialog open={action === "require_reaudit"} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-amber-600">Require Re-Audit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              This will reopen the audit and require the auditor to conduct a fresh inspection. The certificate will remain revoked until the new audit is completed and approved.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleRequireReAudit} disabled={working}>
              {working ? "Processing..." : "Confirm Re-Audit Requirement"}
            </Button>
          </DialogFooter>
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
