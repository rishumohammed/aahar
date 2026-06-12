"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="p-20 text-center space-y-6">
      <h2 className="text-2xl font-bold text-aahar-dark">Administrative Error</h2>
      <p className="text-aahar-body">Something went wrong while loading the management interface.</p>
      <Button onClick={() => reset()} className="bg-admin-primary hover:bg-admin-hover text-white rounded-xl">Try Again</Button>
    </div>
  );
}
