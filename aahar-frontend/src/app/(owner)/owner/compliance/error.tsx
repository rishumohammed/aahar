"use client";

import { AlertCircle } from"lucide-react";
import { Button } from"@/components/ui/button";

export default function Error({
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
 <div className="p-4 bg-rose-50 rounded-full text-rose-500 mb-6">
 <AlertCircle className="h-12 w-12"/>
 </div>
 <h3 className="text-2xl font-black text-aahar-dark tracking-tight">Compliance Portal Error</h3>
 <p className="text-sm text-aahar-body max-w-md mt-2 mb-8 font-medium">
 We encountered a problem loading your compliance and audit history dashboard. Please ensure you are connected and try again.
 </p>
 <Button onClick={() => reset()} className="bg-aahar-dark text-white rounded-2xl py-6 px-8 font-bold uppercase tracking-wider text-xs shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all">
 Try Reconnecting
 </Button>
 </div>
 );
}
