import { cn } from "@/lib/utils";

interface AdZoneProps {
  size?: "300x250" | "300x600" | "fluid";
  label?: string;
  className?: string;
  promotion?: any;
}

export default function AdZone({ size = "fluid", label = "ADVERTISEMENT", className, promotion }: AdZoneProps) {
  const sizeStyles = {
    "300x250": "w-full max-w-[300px] h-[250px] mx-auto",
    "300x600": "w-full max-w-[300px] h-[600px] mx-auto",
    fluid: "w-full min-h-[120px]",
  };

  if (promotion && promotion.imageUrl) {
    const content = (
      <img 
        src={promotion.imageUrl} 
        alt={promotion.title} 
        className={cn("object-cover w-full h-full", sizeStyles[size], className)}
      />
    );
    
    if (promotion.linkUrl) {
      return (
        <a href={promotion.linkUrl} target="_blank" rel="noreferrer" className={cn("block overflow-hidden rounded-lg hover:opacity-95 transition-opacity shadow-sm border border-slate-100", sizeStyles[size], className)}>
          {content}
        </a>
      );
    }
    
    return (
      <div className={cn("overflow-hidden rounded-lg shadow-sm border border-slate-100", sizeStyles[size], className)}>
        {content}
      </div>
    );
  }

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
