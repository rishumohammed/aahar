"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

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
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-rose-50 p-4">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Something went wrong!</h2>
          <p className="text-sm text-slate-500">
            {error.message || "An unexpected error occurred while loading this page."}
          </p>
        </div>
        <Button 
          onClick={() => reset()}
          className="mt-4 gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 px-6"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
