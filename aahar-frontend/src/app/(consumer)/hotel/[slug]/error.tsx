"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BedDouble, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function HotelError({
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
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center space-y-6">
      <div className="h-20 w-20 rounded-full bg-aahar-rose/10 flex items-center justify-center">
        <BedDouble className="h-10 w-10 text-aahar-rose" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-aahar-dark">Property not found</h2>
        <p className="text-aahar-body max-w-md mx-auto">
          We couldn&apos;t retrieve the details for this hotel or resort. Please check the URL or try searching again.
        </p>
      </div>
      <div className="flex gap-4">
        <Button 
          onClick={() => reset()}
          className="bg-aahar-teal text-white rounded-full px-8"
        >
          Retry
        </Button>
        <Link href="/">
          <Button variant="outline" className="rounded-full px-8 border-aahar-border">
            Browse properties
          </Button>
        </Link>
      </div>
    </div>
  );
}
