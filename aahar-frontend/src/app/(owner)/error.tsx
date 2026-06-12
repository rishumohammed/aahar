"use client";

import { useEffect } from"react";
import { Button } from"@/components/ui/button";

export default function OwnerError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 useEffect(() => { console.error(error); }, [error]);

 return (
 <div className="p-20 text-center space-y-6">
 <h2 className="text-2xl font-bold text-aahar-dark">Establishment Access Error</h2>
 <p className="text-aahar-body">We couldn't load your establishment dashboard. Please try again.</p>
 <Button onClick={() => reset()} className="bg-aahar-rose text-white rounded-xl">Try Again</Button>
 </div>
 );
}
