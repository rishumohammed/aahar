"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuditorDashboard() {
  const router = useRouter();

  useEffect(() => {
    // For now, redirect to audits list as it's the main function
    router.replace("/auditor/audits");
  }, [router]);

  return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-aahar-teal" />
        <p className="text-sm font-bold text-aahar-body">Loading Auditor Dashboard...</p>
      </div>
    </div>
  );
}
