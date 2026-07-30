"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RestaurantRowCardProps {
  restaurant: {
    name: string;
    slug: string;
    category: string;
    location: string;
    city: string;
    rating: number;
    image: string;
    certified: boolean;
    priceRange: string;
    cuisineType: string[];
  };
}

export function RestaurantRowCard({ restaurant }: RestaurantRowCardProps) {
  const fallbackImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800";

  return (
    <Link 
      href={`/restaurant/${restaurant.slug}`}
      className="group block relative overflow-hidden rounded-xl bg-white border-2 border-aahar-border transition-all hover:border-aahar-teal hover:shadow-2xl hover:shadow-aahar-teal/5"
    >
      <div className="flex flex-col md:flex-row p-4 md:p-6 gap-6 md:gap-10">
        {/* Left Image Section */}
        <div className="relative w-full md:w-80 aspect-[4/3] md:aspect-square shrink-0 overflow-hidden rounded-xl bg-aahar-wash">
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
          {restaurant.certified && (
            <div className="absolute top-4 left-4">
              <div className="bg-white/90 backdrop-blur-md text-aahar-teal flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl">
                <ShieldCheck className="h-4 w-4" />
                Certified
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between py-2">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-aahar-teal uppercase tracking-[0.2em]">{restaurant.category}</span>
                  <div className="w-1 h-1 rounded-full bg-aahar-body/20" />
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-aahar-dark">{restaurant.rating || 4.5}</span>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-aahar-dark uppercase tracking-tight group-hover:text-aahar-teal transition-colors">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-2 text-aahar-body/60">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-bold">{restaurant.location}</span>
                </div>
              </div>
              <Badge className="bg-aahar-wash text-aahar-dark border-0 rounded-xl px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest">
                {restaurant.priceRange || "₹₹"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {(restaurant.cuisineType || ["Indian", "Chinese"]).map(tag => (
                <Badge key={tag} variant="outline" className="rounded-xl border-aahar-border text-[9px] font-bold text-aahar-body/40 px-3 py-1 uppercase tracking-tighter">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-aahar-wash mt-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-aahar-teal/10 flex items-center justify-center text-aahar-teal">
                  <ShieldCheck className="h-4 w-4" />
               </div>
               <span className="text-[10px] font-bold text-aahar-body/60 uppercase tracking-widest">Verified Identity</span>
            </div>
            <div className="flex items-center gap-2 text-aahar-teal font-bold uppercase text-[10px] tracking-widest group-hover:translate-x-2 transition-transform">
              Experience Details <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
