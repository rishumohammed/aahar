"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function RestaurantError({
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
      <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-aahar-dark">Something went wrong</h2>
        <p className="text-aahar-body max-w-md mx-auto">
          We couldn&apos;t load this restaurant profile. It might be temporarily unavailable or the link might be broken.
        </p>
      </div>
      <div className="flex gap-4">
        <Button 
          onClick={() => reset()}
          className="bg-aahar-teal text-white rounded-full px-8"
        >
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline" className="rounded-full px-8 border-aahar-border">
            Go back home
          </Button>
        </Link>
      </div>
    </div>
  );
}
