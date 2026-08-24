const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');

const loadingTemplate = `"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center p-8">
      <div className="flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-sm font-semibold animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
`;

const errorTemplate = `"use client";

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
`;

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      if (file === 'page.tsx') {
        results.push(dir);
      }
    }
  });
  
  return results;
}

const pageDirs = walkDir(srcDir);
let addedCount = 0;

pageDirs.forEach(dir => {
  const loadingPath = path.join(dir, 'loading.tsx');
  const errorPath = path.join(dir, 'error.tsx');
  
  if (!fs.existsSync(loadingPath)) {
    fs.writeFileSync(loadingPath, loadingTemplate, 'utf8');
    console.log(`Created loading.tsx in ${dir}`);
    addedCount++;
  }
  
  if (!fs.existsSync(errorPath)) {
    fs.writeFileSync(errorPath, errorTemplate, 'utf8');
    console.log(`Created error.tsx in ${dir}`);
    addedCount++;
  }
});

console.log(`Finished. Created ${addedCount} files.`);
