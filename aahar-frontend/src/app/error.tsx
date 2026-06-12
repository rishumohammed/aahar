'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center space-y-8">
      <div className="h-24 w-24 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-red-500" />
      </div>
      <div className="space-y-3">
        <h2 className="text-4xl font-bold text-aahar-dark">System Error</h2>
        <p className="text-aahar-body max-w-md mx-auto text-lg">
          We encountered a critical error. Our technical team has been alerted and is working to resolve it.
        </p>
      </div>
      <Button
        onClick={() => reset()}
        className="px-12 py-7 bg-aahar-teal text-white rounded-full hover:bg-aahar-teal/90 transition-all text-xl font-bold shadow-xl shadow-aahar-teal/20"
      >
        Restart Application
      </Button>
    </div>
  );
}
