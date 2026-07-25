"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center space-y-6">
      <div className="h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-rose-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-aahar-dark">Portal Error</h2>
        <p className="text-aahar-body max-w-sm mx-auto text-sm">
          Failed to load your profile details or order history. Please verify your connection and try again.
        </p>
      </div>
      <Button
        onClick={() => reset()}
        className="px-8 py-5 bg-aahar-teal text-white rounded-full hover:bg-aahar-teal/90 transition-all text-sm font-bold shadow-xl shadow-aahar-teal/20"
      >
        Retry Portal Loading
      </Button>
    </div>
  );
}
