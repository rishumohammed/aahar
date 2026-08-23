"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ShieldCheck, ArrowRight, Bed, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";

interface HotelRowCardProps {
  hotel: {
    name: string;
    slug: string;
    propertyType: string;
    location: string;
    city: string;
    rating: number;
    starRating: number;
    image: string;
    certified: boolean;
  };
}

export function HotelRowCard({ hotel }: HotelRowCardProps) {
  const fallbackImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800";
  const displayImage = getImageUrl(hotel.image) || fallbackImage;
  const rawRating = Number(hotel.rating);
  const formattedRating = !isNaN(rawRating) && rawRating > 0 ? rawRating.toFixed(1) : "4.8";

  return (
    <Link 
      href={`/hotel/${hotel.slug}`}
      className="group block relative overflow-hidden rounded-2xl bg-white border border-aahar-border transition-all hover:border-aahar-rose hover:shadow-2xl hover:shadow-aahar-rose/5"
    >
      <div className="flex flex-col md:flex-row p-4 md:p-6 gap-6 md:gap-10">
        <div className="relative w-full md:w-80 aspect-[4/3] md:aspect-square shrink-0 overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
          <Image
            src={displayImage}
            alt={hotel.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-4 left-4">
             <div className="bg-white/90 backdrop-blur-md text-aahar-rose flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl">
                <Bed className="h-4 w-4" />
                {hotel.starRating || 4} Stars
             </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between py-2">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-aahar-rose uppercase tracking-[0.2em]">{hotel.propertyType ? hotel.propertyType.replace(/_/g, " ") : "Resort"}</span>
                  <div className="w-1 h-1 rounded-full bg-aahar-body/20" />
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-aahar-dark">{formattedRating}</span>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-aahar-dark uppercase tracking-tight group-hover:text-aahar-rose transition-colors">
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-2 text-aahar-body/60">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-bold">{hotel.location}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
               <Badge variant="outline" className="rounded-xl border-aahar-border text-[9px] font-bold text-aahar-body/40 px-3 py-1 uppercase tracking-tighter">
                  Breakfast Included
               </Badge>
               <Badge variant="outline" className="rounded-xl border-aahar-border text-[9px] font-bold text-aahar-body/40 px-3 py-1 uppercase tracking-tighter">
                  Verified Stay
               </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-aahar-wash mt-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-aahar-rose/10 flex items-center justify-center text-aahar-rose">
                  <ShieldCheck className="h-4 w-4" />
               </div>
               <span className="text-[10px] font-bold text-aahar-body/60 uppercase tracking-widest">Certified Partner</span>
            </div>
            <div className="flex items-center gap-2 text-aahar-rose font-bold uppercase text-[10px] tracking-widest group-hover:translate-x-2 transition-transform">
              Explore Property <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
