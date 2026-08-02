"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function SearchError({
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
    <div className="container mx-auto max-w-7xl px-4 py-32">
      <div className="max-w-md mx-auto text-center space-y-8">
        <div className="w-20 h-20 bg-rose-50 rounded-xl flex items-center justify-center mx-auto">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-aahar-dark uppercase tracking-tight">Discovery Interrupted</h2>
          <p className="text-aahar-body font-medium">We encountered a trust standard error while searching. Please try refreshing the search wave.</p>
        </div>

        <Button 
          onClick={() => reset()}
          className="bg-aahar-dark text-white rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Wave
        </Button>
      </div>
    </div>
  );
}
