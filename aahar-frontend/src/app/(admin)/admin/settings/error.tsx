"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 p-8 text-center">
      <div className="bg-rose-100 p-4 rounded-full">
        <AlertCircle className="h-12 w-12 text-rose-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Something went wrong!</h2>
      <p className="text-slate-500 max-w-md">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <Button 
        onClick={() => reset()}
        className="bg-admin-primary hover:bg-admin-primary-hover text-white mt-4"
      >
        Try again
      </Button>
    </div>
  );
}
