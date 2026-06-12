"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PublicError({
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-aahar-wash p-4 text-center">
      <div className="space-y-6 max-w-lg">
        <h1 className="text-9xl font-black text-aahar-teal/20 italic font-serif">Oops!</h1>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-aahar-dark">Something went wrong</h2>
          <p className="text-aahar-body">
            We encountered an unexpected error while loading the AAHAR platform. Our team has been notified.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => reset()}
            className="bg-aahar-teal text-white rounded-full px-8 py-6 h-auto font-bold text-lg"
          >
            Try Refreshing
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/"}
            className="rounded-full px-8 py-6 h-auto border-aahar-border font-bold text-lg"
          >
            Return to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
