"use client";

import { Progress } from "@/components/ui/progress";

interface HygieneScoreProps {
  label: string;
  score: number; // 0 to 5
  max?: number;
}

export function HygieneScore({ label, score, max = 5 }: HygieneScoreProps) {
  const percentage = (score / max) * 100;
  
  // Color logic based on score
  const getScoreColor = (s: number) => {
    if (s >= 4.5) return "bg-aahar-teal";
    if (s >= 3.5) return "bg-green-500";
    if (s >= 2.5) return "bg-yellow-500";
    return "bg-aahar-rose";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-aahar-body">{label}</span>
        <span className="text-aahar-dark font-bold">{score.toFixed(1)} / {max}</span>
      </div>
      <div className="h-2 w-full bg-aahar-border rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${getScoreColor(score)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
