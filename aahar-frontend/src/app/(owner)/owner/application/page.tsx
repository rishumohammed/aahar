"use client";

import { toast } from"sonner";
import { useState, useEffect, useRef, useCallback } from"react";
import { 
 FileText, 
 Upload, 
 CheckCircle2, 
 AlertCircle, 
 Clock, 
 FileCheck,
 AlertTriangle,
 RefreshCw,
 Calendar,
 Trash2,
 X
} from"lucide-react";
import { format, differenceInDays, isPast, parseISO } from"date-fns";
import { Button } from"@/components/ui/button";
import { Card } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { Label } from"@/components/ui/label";
import { Progress } from"@/components/ui/progress";
import { cn } from"@/lib/utils";
import { applicationApi, ownerApi, masterApi } from "@/lib/api";
import { uploadDocument, MAX_DOC_SIZE_MB, validateFileSize } from "@/lib/upload";

// ── Types & Constants ───────────────────────────────────────
interface DocRequirement {
  id: string;
  label: string;
  hasExpiry: boolean;
}

interface DocMetadata {
  url: string;
  documentId: string;
  name: string;
  size: string;
  uploadedAt: string;
  expiryDate?: string;
}

export default function DocumentUploadPage() {
  const [docUrls, setDocUrls] = useState<Record<string, DocMetadata | null>>({});
  const [docProgress, setDocProgress] = useState<Record<string, number>>({});
  const [docStatus, setDocStatus] = useState<Record<string, string>>({});
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocType, setActiveDocType] = useState<string | null>(null);
  const [requiredDocs, setRequiredDocs] = useState<DocRequirement[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // ── Load or Create Draft Application ───────────────────────
  const loadApplicationData = useCallback(async () => {
    try {
      const statsRes = await ownerApi.stats();
      const restId = statsRes.data?.data?.restaurantId;
      setRestaurantId(restId);

      if (!restId) {
        showToast("No associated restaurant found for this owner.", "error");
        return;
      }

      const listRes = await applicationApi.list({ limit: 1 });
      let app = listRes.data?.data?.items?.[0];

      const masterRes = await masterApi.list("DOCUMENT_RESTAURANT");
      const docs = masterRes.data?.data?.filter((d: any) => d.isActive).map((d: any) => ({
        id: d.key,
        label: d.label,
        hasExpiry: d.icon === "true"
      })) || [];
      setRequiredDocs(docs);

      if (!app) {
        const createRes = await applicationApi.submit({
          businessType: "fnb",
          restaurantId: restId,
          status: "draft"
        });
        app = createRes.data?.data;
      }

      if (app) {
        setApplicationId(app.id);
        setApplicationStatus(app.status);
        
        const mapped: any = {};
        app.documents?.forEach((d: any) => {
          mapped[d.type] = {
            url: d.url,
            documentId: d.id,
            name: d.name || "document",
            size: d.size ? `${(d.size / 1024 / 1024).toFixed(1)} MB` : "unknown",
            uploadedAt: d.uploadedAt,
            expiryDate: d.expiresAt
          };
        });
        setDocUrls(mapped);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to load application data", "error");
    }
  }, [showToast]);

  useEffect(() => {
    loadApplicationData();
  }, [loadApplicationData]);

  const handleProceed = async () => {
    if (!applicationId || !restaurantId) return;
    setIsSubmitting(true);
    try {
      await applicationApi.submit({
        businessType: "fnb",
        restaurantId,
        status: "submitted"
      });
      showToast("Application submitted successfully", "success");
      await loadApplicationData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to submit application", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = applicationStatus ? !["draft", "audit_scheduled"].includes(applicationStatus) : false;

  // ── Handlers ─────────────────────────────────────────────
  const handleDocUpload = async (docType: string, file: File) => {
    if (!applicationId) {
      showToast("No active application found", "error");
      return;
    }

    const sizeError = validateFileSize(file, MAX_DOC_SIZE_MB);
    if (sizeError) {
      showToast(sizeError, "error");
      return;
    }

    setDocProgress(prev => ({ ...prev, [docType]: 0 }));
    setDocStatus(prev => ({ ...prev, [docType]: "uploading" }));

    try {
      const { url, documentId } = await uploadDocument(
        applicationId,
        docType,
        file,
        (pct) => setDocProgress(prev => ({ ...prev, [docType]: pct })),
      );

      setDocStatus(prev => ({ ...prev, [docType]: "uploaded" }));
      setDocUrls(prev => ({
        ...prev,
        [docType]: {
          url,
          documentId,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadedAt: new Date().toISOString(),
        }
      }));
      showToast(`${docType} uploaded`, "success");
    } catch (err: any) {
      setDocStatus(prev => ({ ...prev, [docType]: "error" }));
      showToast(err.message ?? `Upload failed (Max allowed size: ${MAX_DOC_SIZE_MB}MB)`, "error");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeDocType) {
      const sizeError = validateFileSize(file, MAX_DOC_SIZE_MB);
      if (sizeError) {
        showToast(sizeError, "error");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      handleDocUpload(activeDocType, file);
      setActiveDocType(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeDoc = (id: string) => {
    setDocUrls(prev => ({ ...prev, [id]: null }));
    setDocStatus(prev => ({ ...prev, [id]: "pending" }));
  };

  const updateExpiry = (id: string, date: string) => {
    setDocUrls(prev => ({
      ...prev,
      [id]: prev[id] ? { ...prev[id]!, expiryDate: date } : null
    }));
  };

  const getStatus = (id: string) => {
    const doc = docUrls[id];
    if (!doc) return docStatus[id] || "pending";
    if (!doc.expiryDate) return "uploaded";

    const expiry = parseISO(doc.expiryDate);
    if (isPast(expiry)) return "expired";
    const daysLeft = differenceInDays(expiry, new Date());
    if (daysLeft <= 30) return "expiring";
    
    return "uploaded";
  };

  const uploadedCount = Object.values(docUrls).filter(Boolean).length;
  const isComplete = requiredDocs.length > 0 && uploadedCount >= requiredDocs.length;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      {/* Header & Overall Progress */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Verification Documents</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Upload the required legal and operational documents to verify your business. (PDF, JPG, PNG, WEBP, DOCX — Max {MAX_DOC_SIZE_MB}MB per file)</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-800 tracking-wider uppercase mb-2">
              {uploadedCount} of {requiredDocs.length} Uploaded
            </p>
            <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-admin-primary transition-all duration-500 ease-out"
                style={{ width: `${(uploadedCount / (requiredDocs.length || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {!isComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm font-medium text-amber-800">Upload all required documents to proceed with your certification application.</p>
          </div>
        )}
      </div>

 {/* Document Rows */}
 <div className="space-y-4">
 {requiredDocs.map((docReq) => {
 const doc = docUrls[docReq.id];
 const status = getStatus(docReq.id);
 const isUploading = docStatus[docReq.id] ==="uploading";
 const progress = docProgress[docReq.id] || 0;

 return (
 <Card key={docReq.id} className={cn(
"p-6 rounded-lg border-slate-200 transition-all hover:shadow-md shadow-sm",
 doc ?"bg-white":"bg-slate-50 border-dashed"
 )}>
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
 <div className="flex items-center gap-4 lg:w-1/3">
 <div className={cn(
"p-3 rounded-full shrink-0",
 doc ?"bg-admin-light text-admin-text":"bg-slate-100 text-slate-400"
 )}>
 {doc ? <FileCheck className="h-6 w-6"/> : <FileText className="h-6 w-6"/>}
 </div>
 <div>
 <h3 className="font-semibold text-slate-800 tracking-tight leading-tight">
 {docReq.label} <span className="text-rose-500">*</span>
 </h3>
 <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Required Document</p>
 </div>
 </div>

 <div className="flex-1">
 {isUploading ? (
 <div className="space-y-2 px-4">
 <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-admin-text">
 <span>Uploading...</span>
 <span>{progress}%</span>
 </div>
 <Progress value={progress} className="h-2 bg-admin-light"/>
 </div>
 ) : doc ? (
 <div className="flex flex-wrap items-center gap-4 px-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="text-sm font-semibold text-slate-800 truncate max-w-[150px]">{doc.name}</span>
 <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">• {doc.size}</span>
 </div>
 <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
 <Clock className="h-3 w-3"/>
 <span>Uploaded {format(parseISO(doc.uploadedAt),"MMM dd, yyyy")}</span>
 </div>
 </div>

 <div className="flex items-center gap-2">
 {status ==="uploaded"&& (
 <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] font-semibold uppercase tracking-wider px-3 py-1">
 Uploaded ✓
 </Badge>
 )}
 {status ==="expiring"&& (
 <Badge className="bg-amber-50 text-amber-700 border-0 text-[10px] font-semibold uppercase tracking-wider px-3 py-1">
 Expiring soon
 </Badge>
 )}
 </div>
 </div>
 ) : (
 <div className="px-4">
 <Badge variant="outline"className="bg-slate-100 border-slate-200 text-slate-500 text-[10px] font-medium uppercase tracking-wider px-3 py-1">
 Not Uploaded
 </Badge>
 </div>
 )}
 </div>

 <div className="flex items-center gap-3 lg:w-48 justify-end">
 {doc ? (
 <>
 {!isReadOnly && (
 <Button 
 variant="ghost"
 size="icon"
 onClick={() => removeDoc(docReq.id)}
 className="h-10 w-10 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50"
 >
 <Trash2 className="h-4 w-4"/>
 </Button>
 )}
 <Button 
 variant="outline"
 onClick={() => {
 if (isReadOnly) return;
 setActiveDocType(docReq.id);
 fileInputRef.current?.click();
 }}
 disabled={isReadOnly}
 className="rounded-md border-slate-200 font-semibold text-xs px-5 h-10 gap-2"
 >
 <RefreshCw className="h-3.5 w-3.5"/>
 Replace
 </Button>
 </>
 ) : (
 <Button 
 onClick={() => {
 if (isReadOnly) return;
 setActiveDocType(docReq.id);
 fileInputRef.current?.click();
 }}
 disabled={isReadOnly}
 className="rounded-md bg-admin-primary hover:bg-admin-primary-hover text-white font-semibold text-xs px-6 h-10 gap-2 shadow-sm"
 >
 <Upload className="h-3.5 w-3.5"/>
 Upload
 </Button>
 )}
 </div>
 </div>

 {docReq.hasExpiry && doc && (
 <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
 <div className="flex items-center gap-2 text-slate-500">
 <Calendar className="h-4 w-4"/>
 <Label className="text-xs font-semibold uppercase tracking-wider">Expiry Date:</Label>
 </div>
 <input 
 type="date"
 value={doc.expiryDate?.split('T')[0] ||""}
 onChange={(e) => updateExpiry(docReq.id, e.target.value)}
 disabled={isReadOnly}
 className="bg-white border border-slate-200 rounded-md px-4 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-admin-primary outline-none transition-all disabled:opacity-50"
 />
 </div>
 )}
 </Card>
 );
 })}
 </div>

  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" className="hidden"/>

 {/* Form Action Footer */}
 <div className="mt-12 pt-8 flex justify-end border-t border-slate-200">
 {applicationStatus === "audit_scheduled" ? (
 <Button 
 disabled
 className="bg-admin-primary/70 text-white rounded-md px-10 h-14 font-bold shadow-md flex items-center gap-3"
 >
 <RefreshCw className="h-5 w-5"/>
 Updates Saved Automatically
 </Button>
 ) : isReadOnly ? (
 <Button 
 disabled
 className="bg-admin-primary text-white rounded-md px-10 h-14 font-bold shadow-md flex items-center gap-3"
 >
 <CheckCircle2 className="h-5 w-5"/>
 Application Submitted
 </Button>
 ) : (
 <Button 
 onClick={handleProceed} 
 disabled={!isComplete || isSubmitting}
 className="bg-admin-primary text-white rounded-md px-10 h-14 font-bold shadow-md hover:bg-admin-primary-hover transition-all disabled:opacity-50 flex items-center gap-3"
 >
 {isSubmitting ? (
 <RefreshCw className="h-5 w-5 animate-spin"/>
 ) : isComplete ? (
 <CheckCircle2 className="h-5 w-5"/>
 ) : (
 <Clock className="h-5 w-5"/>
 )}
 Proceed with Application
 </Button>
 )}
 </div>

 {/* Toasts */}
 <div className="fixed bottom-24 right-8 z-[100] flex flex-col gap-3 items-end">
 {toasts.map(toast => (
 <div key={toast.id} className={cn(
"px-6 py-4 rounded-lg text-white font-semibold text-sm shadow-lg flex items-center gap-4 animate-in slide-in-from-right-10",
 toast.type === 'success' ?"bg-admin-primary":"bg-rose-500"
 )}>
 <span>{toast.message}</span>
 <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
 <X className="h-4 w-4 opacity-70 hover:opacity-100"/>
 </button>
 </div>
 ))}
 </div>
 </div>
 );
}
