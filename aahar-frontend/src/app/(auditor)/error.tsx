"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AuditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-20 text-center space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Inspection Portal Error</h2>
      <p className="text-slate-500">Something went wrong while loading the auditor interface.</p>
      <Button onClick={() => reset()} className="bg-admin-primary hover:bg-admin-hover text-white rounded-lg px-6 py-2">
        Try Again
      </Button>
    </div>
  );
}
