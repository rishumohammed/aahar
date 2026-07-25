"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RestaurantCard } from "@/components/shared/RestaurantCard";
import { HotelCard } from "@/components/shared/HotelCard";
import { searchApi } from "@/lib/api";
import { useLocationStore } from "@/store/locationStore";

export function NearbySection() {
  const { city, loading: locationLoading, error: locationError } = useLocationStore();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return;

    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      searchApi.search({ mode: "eat", city, limit: 4 }).then((r) => r.data.data.restaurants),
      searchApi.search({ mode: "stay", city, limit: 4 }).then((r) => r.data.data.hotels),
    ]).then(([resRes, hotRes]) => {
      if (isMounted) {
        setRestaurants(resRes.status === "fulfilled" ? resRes.value || [] : []);
        setHotels(hotRes.status === "fulfilled" ? hotRes.value || [] : []);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [city]);

  // If no city is detected and not loading, simply hide this section (as location options are already present in the Hero)
  if (!city && !locationLoading) {
    return null;
  }

  return (
    <div className="space-y-12 py-8">
      {loading && !locationLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-aahar-teal" />
        </div>
      )}

      {!loading && city && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-l-4 border-aahar-teal pl-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-aahar-dark tracking-tight">Nearby Restaurants in {city}</h2>
              <p className="text-xs sm:text-sm font-medium text-aahar-body/80">Great dining options around your current location</p>
            </div>
            {restaurants.length > 0 && (
              <Link href={`/search?mode=eat&city=${encodeURIComponent(city)}`} className="shrink-0">
                <Button variant="link" className="text-aahar-teal font-black text-xs uppercase tracking-wider p-0 group">
                  View all <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}
          </div>
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {restaurants.map((r: any) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-aahar-body italic py-4">No restaurants found near {city} yet.</p>
          )}
        </div>
      )}

      {!loading && city && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-l-4 border-aahar-rose pl-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-aahar-dark tracking-tight">Nearby Hotels in {city}</h2>
              <p className="text-xs sm:text-sm font-medium text-aahar-body/80">Comfortable stays around your current location</p>
            </div>
            {hotels.length > 0 && (
              <Link href={`/search?mode=stay&city=${encodeURIComponent(city)}`} className="shrink-0">
                <Button variant="link" className="text-aahar-teal font-black text-xs uppercase tracking-wider p-0 group">
                  Explore all <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}
          </div>
          {hotels.length > 0 ? (
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
              {hotels.map((h: any) => (
                <HotelCard key={h.id} hotel={h} className="w-[260px] sm:w-[320px] shrink-0 snap-start" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-aahar-body italic py-4">No hotels found near {city} yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
