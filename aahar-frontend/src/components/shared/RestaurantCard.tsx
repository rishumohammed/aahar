"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";

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
  const defaultPlaceholder = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800";
  const displayImage = getImageUrl(restaurant.image) || defaultPlaceholder;
  const rawRating = Number((restaurant as any).rating || (restaurant as any).googleRating);
  const formattedRating = !isNaN(rawRating) && rawRating > 0 ? rawRating.toFixed(1) : "4.5";

  return (
    <Link 
      href={`/restaurant/${restaurant.slug}`}
      className="group flex flex-col relative overflow-hidden rounded-2xl bg-white border border-aahar-border transition-all duration-500 hover:shadow-2xl hover:shadow-aahar-dark/5 hover:-translate-y-2"
    >
      {/* Top Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={displayImage}
          alt={restaurant.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Top Badges Over Image */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <Badge variant="secondary" className="bg-white/95 backdrop-blur-xl text-aahar-dark font-bold text-[10px] uppercase tracking-wider border-none shadow-xl">
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
            {restaurant.category ? restaurant.category.replace(/_/g, " ") : "Casual Dining"}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-aahar-dark">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {formattedRating}
          </div>
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-aahar-dark uppercase tracking-tight leading-tight group-hover:text-aahar-teal transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-aahar-body/60 uppercase tracking-widest line-clamp-1">
            <MapPin className="h-3.5 w-3.5 text-aahar-body/40" />
            {restaurant.location || (restaurant as any).area || (restaurant as any).city || "Kerala, India"}
          </div>
        </div>
      </div>
    </Link>
  );
}
