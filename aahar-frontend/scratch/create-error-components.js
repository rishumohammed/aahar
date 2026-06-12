const fs = require('fs');
const path = require('path');

const loadingTemplate = `"use client";
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
    </div>
  );
}
`;

const errorTemplate = `"use client";
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
`;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let hasPage = false;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file === 'page.tsx') {
      hasPage = true;
    }
  }

  if (hasPage) {
    const loadingPath = path.join(dir, 'loading.tsx');
    const errorPath = path.join(dir, 'error.tsx');
    
    if (!fs.existsSync(loadingPath)) {
      console.log('Creating', loadingPath);
      fs.writeFileSync(loadingPath, loadingTemplate);
    }
    
    if (!fs.existsSync(errorPath)) {
      console.log('Creating', errorPath);
      fs.writeFileSync(errorPath, errorTemplate);
    }
  }
}

const targetDirs = [
  path.join(__dirname, '../src/app/(owner)'),
  path.join(__dirname, '../src/app/(hotel-manager)'),
  path.join(__dirname, '../src/app/(admin)'),
  path.join(__dirname, '../src/app/(auditor)'),
  path.join(__dirname, '../src/app/(consumer)'),
];

for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
}
console.log('Done creating required components.');
