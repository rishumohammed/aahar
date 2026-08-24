import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ShieldCheck, Download, AlertCircle } from "lucide-react";
import { useBrandingStore } from "@/store/brandingStore";
import { getImageUrl, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Certification {
  id?: string;
  certNumber: string;
  expiresAt: string;
  issuedAt?: string;
  status: string;
  pdfUrl?: string | null;
  track?: string;
}

interface CertificateWidgetProps {
  certification: Certification;
  mode?: "consumer" | "owner" | "admin";
  onRevoke?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function CertificateWidget({
  certification,
  mode = "consumer",
  onRevoke,
  className,
  children
}: CertificateWidgetProps) {
  const { branding, fetchBranding } = useBrandingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchBranding();
  }, []);

  const handleDownload = async () => {
    // Prefer calling the API endpoint so the PDF is always freshly generated
    if (certification.id) {
      try {
        const { default: api } = await import("@/lib/api");
        const response = await api.get(`/certifications/${certification.id}/pdf?t=${Date.now()}`, {
          responseType: "blob",
          timeout: 30000,
        });
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `${certification.certNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        // fallback to static URL
        if (certification.pdfUrl) window.open(certification.pdfUrl, "_blank");
      }
      return;
    }
    if (certification.pdfUrl) {
      window.open(certification.pdfUrl, "_blank");
    }
  };

  // Safe defaults for dates if missing
  const issueDate = certification.issuedAt 
    ? format(parseISO(certification.issuedAt), "dd MMM yyyy")
    : format(new Date(), "dd MMM yyyy");
  
  const expiryDate = certification.expiresAt
    ? format(parseISO(certification.expiresAt), "dd MMM yyyy")
    : "N/A";

  return (
    <div className={cn("p-6 sm:p-8 rounded-xl bg-[#0A7B7B] shadow-xl text-white relative overflow-hidden font-sans space-y-6", className)}>
      {/* Header section */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          {mounted && branding.certificateLogo ? (
            <img src={getImageUrl(branding.certificateLogo)} alt="Certificate Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
          ) : (
            <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          )}
        </div>
        <div>
          <h4 className="text-lg sm:text-2xl font-bold tracking-tight text-white mb-0.5">
            Official Certification Issued
          </h4>
          <p className="text-sm text-white/80 font-medium">
            AAHAR Trust Standard Verified
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="bg-white/10 rounded-xl p-5 sm:p-6 border border-white/10 grid grid-cols-2 gap-y-6 gap-x-4 relative z-10">
        <div className="space-y-1.5">
          <p className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-widest">
            License No.
          </p>
          <p className="text-sm sm:text-base font-bold text-white">
            {certification.certNumber || "N/A"}
          </p>
        </div>
        
        <div className="space-y-1.5">
          <p className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-widest">
            Issue Date
          </p>
          <p className="text-sm sm:text-base font-bold text-white">
            {issueDate}
          </p>
        </div>
        
        <div className="space-y-1.5">
          <p className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-widest">
            Expiry Date
          </p>
          <p className="text-sm sm:text-base font-bold text-white">
            {expiryDate}
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-widest">
            Global Status
          </p>
          <p className={cn("text-sm sm:text-base font-bold capitalize", certification.status === "revoked" ? "text-red-300" : "text-white")}>
            {certification.status}
          </p>
        </div>
      </div>

      {/* Buttons - Conditional Render based on Mode */}
      {(mode === "owner" || mode === "admin" || children) && (
        <div className="space-y-3 relative z-10">
          {(mode === "owner" || mode === "admin") && (
            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={handleDownload}
                disabled={!certification.pdfUrl}
                variant="outline"
                className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white h-12 rounded-lg font-semibold tracking-wide"
              >
                {certification.pdfUrl ? "Download PDF" : "PDF Not Available"}
              </Button>
            </div>
          )}

          {children}

          {mode === "admin" && certification.status !== "revoked" && (
            <Button
              onClick={onRevoke}
              variant="destructive"
              className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white border-none h-12 rounded-lg font-semibold tracking-wide flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Revoke Certificate
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
