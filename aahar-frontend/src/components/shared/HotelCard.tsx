"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HotelCardProps {
  hotel: {
    name: string;
    slug: string;
    location: string;
    rating: number;
    image: string;
  };
  className?: string;
}

export function HotelCard({ hotel, className }: HotelCardProps) {
  const fallbackImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800";
  
  return (
    <Link 
      href={`/hotel/${hotel.slug}`}
      className={`group flex flex-col relative overflow-hidden rounded-2xl bg-white border border-aahar-border transition-all duration-500 hover:shadow-2xl hover:shadow-aahar-dark/5 hover:-translate-y-2 w-full ${className || ""}`}
    >
      {/* Top Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={hotel.image || fallbackImage}
          alt={hotel.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = fallbackImage;
          }}
        />
        
        {/* Floating Star Badge (Top Left) */}
        <div className="absolute top-4 left-4">
          <div className="bg-aahar-dark/80 backdrop-blur-xl text-white flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.15em] shadow-xl border border-white/10">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {(hotel as any).starRating || 4} Stars
          </div>
        </div>
      </div>

      {/* Bottom Text Section */}
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-aahar-rose uppercase tracking-[0.15em] bg-aahar-rose/5 px-3 py-1.5 rounded-lg border border-aahar-rose/10">
            {(hotel as any).propertyType || "Resort"}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-aahar-dark">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {hotel.rating || 4.8}
          </div>
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-aahar-dark uppercase tracking-tight leading-tight group-hover:text-aahar-teal transition-colors line-clamp-1">
            {hotel.name}
          </h3>
          
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-aahar-body/60 uppercase tracking-widest line-clamp-1">
            <MapPin className="h-3.5 w-3.5 text-aahar-body/40" />
            {hotel.location || (hotel as any).area || (hotel as any).city || "Location details"}
          </div>
        </div>
      </div>
    </Link>
  );
}
