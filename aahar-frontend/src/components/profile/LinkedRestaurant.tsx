"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { restaurantApi } from "@/lib/api";

export default function LinkedRestaurant({ restaurantId }: { restaurantId: string }) {
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    // Find restaurant by ID — use list with filter
    restaurantApi.list({ limit: 100 })
      .then(r => {
        const match = r.data.data.items.find((re: any) => re.id === restaurantId);
        setRestaurant(match ?? null);
      })
      .catch(console.error);
  }, [restaurantId]);

  if (!restaurant) return null;

  return (
    <Link href={`/restaurant/${restaurant.slug}`}
      className="flex items-center gap-4 p-4 border border-aahar-border rounded-xl bg-white
                 hover:border-aahar-teal hover:bg-aahar-teal/5 transition-all group">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-aahar-wash flex-shrink-0 relative">
        {restaurant.photos?.cover ? (
          <img src={restaurant.photos.cover} alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-md font-black text-aahar-dark truncate uppercase tracking-tight">{restaurant.name}</p>
        <p className="text-xs font-medium text-aahar-body truncate uppercase tracking-widest opacity-60">
          {restaurant.cuisineType?.join(", ")}
        </p>
        {restaurant.certification && (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-aahar-teal mt-1">
            ✓ AAHAR Certified
          </span>
        )}
      </div>
      <div className="text-aahar-teal font-black text-sm uppercase tracking-tighter group-hover:translate-x-1 transition-transform pr-2">View →</div>
    </Link>
  );
}
