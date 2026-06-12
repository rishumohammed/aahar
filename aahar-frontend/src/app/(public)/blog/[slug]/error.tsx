"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-32 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-aahar-rose/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-aahar-rose" />
      </div>
      <h2 className="text-2xl font-bold text-aahar-dark mb-2">Post not found!</h2>
      <p className="text-aahar-body mb-8 max-w-md">
        The blog post you're looking for might have been moved or deleted.
      </p>
      <div className="flex gap-4">
        <Button 
          variant="outline"
          asChild
          className="rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-[10px] border-aahar-border"
        >
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Link>
        </Button>
        <Button 
          onClick={() => reset()}
          className="bg-aahar-teal text-white hover:bg-aahar-teal/90 px-8 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px]"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
