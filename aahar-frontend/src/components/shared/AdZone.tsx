import { cn } from "@/lib/utils";

interface AdZoneProps {
  size?: "300x250" | "300x600" | "fluid";
  label?: string;
  className?: string;
}

export default function AdZone({ size = "fluid", label = "ADVERTISEMENT", className }: AdZoneProps) {
  const sizeStyles = {
    "300x250": "w-[300px] h-[250px]",
    "300x600": "w-[300px] h-[600px]",
    fluid: "w-full min-h-[100px]",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center border-2 border-dashed border-aahar-rose/30 bg-aahar-wash/50 rounded-lg overflow-hidden",
        sizeStyles[size],
        className
      )}
    >
      <span className="absolute top-2 left-2 text-[10px] font-bold tracking-widest text-aahar-rose/50">
        {label.toUpperCase()}
      </span>
      <div className="flex flex-col items-center gap-2 text-aahar-body/40">
        <div className="text-sm font-medium">Space Available</div>
        <div className="text-xs">{size}</div>
      </div>
    </div>
  );
}
