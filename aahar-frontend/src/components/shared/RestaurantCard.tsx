"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RestaurantCardProps {
  restaurant: {
    name: string;
    slug: string;
    category: string;
    location: string;
    rating: number;
    image: string;
    certified: boolean;
  };
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const fallbackImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800";

  return (
    <Link 
      href={`/restaurant/${restaurant.slug}`}
      className="group flex flex-col relative overflow-hidden rounded-[3rem] bg-white border border-aahar-border transition-all duration-500 hover:shadow-2xl hover:shadow-aahar-dark/5 hover:-translate-y-2"
    >
      {/* Top Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={restaurant.image || fallbackImage}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = fallbackImage;
          }}
        />
        
        {/* Top Badges Over Image */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <Badge className="bg-aahar-dark/80 hover:bg-aahar-dark backdrop-blur-xl text-white border border-white/10 rounded-xl px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-xl">
            {(restaurant as any).priceRange || "₹₹"}
          </Badge>

          {restaurant.certified && (
            <div className="bg-white/95 backdrop-blur-xl text-aahar-teal flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-xl border border-aahar-teal/10">
              <ShieldCheck className="h-3.5 w-3.5" />
              Certified
            </div>
          )}
        </div>
      </div>

      {/* Bottom Text Section */}
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-aahar-teal uppercase tracking-[0.15em] bg-aahar-teal/5 px-3 py-1.5 rounded-lg border border-aahar-teal/10">
            {restaurant.category?.replace("_", " ") || "FINE DINING"}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-aahar-dark">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {restaurant.rating || 4.5}
          </div>
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-aahar-dark uppercase tracking-tight leading-tight group-hover:text-aahar-teal transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-aahar-body/60 uppercase tracking-widest line-clamp-1">
            <MapPin className="h-3.5 w-3.5 text-aahar-body/40" />
            {restaurant.location || (restaurant as any).area || (restaurant as any).city || "Location details"}
          </div>
        </div>
      </div>
    </Link>
  );
}

