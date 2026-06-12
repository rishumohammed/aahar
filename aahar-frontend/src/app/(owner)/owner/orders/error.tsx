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
 <div className="flex flex-col items-center justify-center min-h-screen bg-aahar-wash p-6 text-center">
 <AlertCircle className="h-16 w-16 text-rose-500 mb-4"/>
 <h3 className="text-xl font-bold text-aahar-dark uppercase tracking-tight">Orders Board Sync Glitch</h3>
 <p className="text-sm text-aahar-body max-w-sm mt-2 mb-6">
 We encountered a problem loading or syncing the live kitchen orders dashboard.
 </p>
 <Button onClick={() => reset()} className="bg-aahar-teal text-white rounded-2xl py-6 px-8 font-bold uppercase tracking-wider text-xs">
 Reconnect Board
 </Button>
 </div>
 );
}
