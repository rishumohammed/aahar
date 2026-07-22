"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ownerApi, applicationApi, uploadApi } from "@/lib/api";
import { Loader2, AlertCircle, Upload, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CorrectionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [failedItems, setFailedItems] = useState<any[]>([]);
  const [correctionNote, setCorrectionNote] = useState("");

  useEffect(() => {
    // In a real implementation, you'd fetch the specific application in "pending_corrections"
    // For now, we use owner stats to find the active application ID
    const fetchCorrections = async () => {
      try {
        const stats = await ownerApi.stats();
        const appId = stats.data?.data?.applicationId;
        if (!appId) {
          setLoading(false);
          return;
        }

        const appRes = await applicationApi.get(appId);
        const app = appRes.data.data;
        
        if (app.status === "pending_corrections" && app.audit?.checklist) {
          setApplication(app);
          // Find criteria where score < 3 (or whatever indicates a failure)
          // Also any item that is critical and failed
          const failures = app.audit.checklist.filter((item: any) => 
            (item.isCritical && item.score === 0) || (item.score < 3)
          );
          setFailedItems(failures);
        }
      } catch (err) {
        console.error("Failed to load corrections", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCorrections();
  }, []);

  const handleSubmitCorrections = async () => {
    if (!application) return;
    setSubmitting(true);
    try {
      await applicationApi.submitCorrections(application.id, correctionNote);
      toast.success("Corrections submitted for review!");
      router.push("/owner/compliance");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit corrections");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (!file || !application) return;
    
    const loadingToast = toast.loading("Uploading evidence...");
    try {
      // 1. Upload the photo
      const uploadRes = await uploadApi.singlePhoto(file);
      const url = uploadRes.data.data.url;
      
      // 2. Attach to the application as a document for now, 
      // or send a message referencing the item ID.
      await applicationApi.sendMessage(
        application.id, 
        `Evidence uploaded for failed item: ${itemId}`, 
        url
      );
      
      toast.success("Evidence uploaded successfully", { id: loadingToast });
    } catch (err) {
      toast.error("Upload failed", { id: loadingToast });
    }
  };

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-owner-primary" />
    </div>
  );

  if (!application) return (
    <div className="max-w-md mx-auto p-12 text-center bg-white rounded-lg border border-slate-200 shadow-sm mt-12">
      <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-slate-800">No Pending Corrections</h2>
      <p className="text-slate-500 text-sm mt-2">You do not have any active applications requiring corrective actions at this time.</p>
      <Button onClick={() => router.back()} variant="outline" className="mt-6">Return to Compliance</Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Corrective Action Plan (CAPA)</h1>
          <p className="text-sm text-slate-500 mt-1">Review the non-conformities from your recent audit and upload evidence of remediation.</p>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
          Action Required
        </Badge>
      </div>

      <div className="space-y-4 mt-8">
        {failedItems.length === 0 ? (
          <p className="text-slate-500 text-sm">No specific failed items could be extracted, but the auditor requested corrections. Please review the audit narrative.</p>
        ) : (
          failedItems.map((item, idx) => (
            <Card key={item.id} className="p-5 border-l-4 border-l-red-500 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm">{item.criterion}</h3>
                  {item.isCritical && <Badge variant="destructive" className="text-[10px]">CRITICAL</Badge>}
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Section: {item.section}</p>
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md mt-2">
                  <span className="font-semibold">Auditor Notes: </span>
                  {item.comment || "No specific comment provided."}
                </div>
              </div>
              
              <div className="shrink-0 flex flex-col items-center justify-center space-y-2 border-l border-slate-100 pl-6">
                <label className="flex flex-col items-center justify-center w-full min-w-[120px] h-20 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <Upload className="h-5 w-5 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-600">Upload Proof</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleEvidenceUpload(e, item.id)} />
                </label>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="p-6 mt-8">
        <h3 className="font-bold text-slate-800 mb-2">Submit Corrections to Auditor</h3>
        <p className="text-sm text-slate-500 mb-4">Once you have uploaded all necessary photo evidence, provide a brief summary of the actions taken and submit to the auditor for review.</p>
        <textarea
          className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm min-h-[100px] focus:border-owner-primary focus:ring-1 focus:ring-owner-primary/20 outline-none"
          placeholder="e.g. All staff have been retrained on handwashing. Deep cleaning schedule implemented..."
          value={correctionNote}
          onChange={(e) => setCorrectionNote(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <Button 
            className="bg-owner-primary hover:bg-owner-hover text-white" 
            onClick={handleSubmitCorrections}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Submit for Re-evaluation
          </Button>
        </div>
      </Card>
    </div>
  );
}
