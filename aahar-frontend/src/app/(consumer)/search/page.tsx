"use client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchApi } from "@/lib/api";
import type { Restaurant, Hotel } from "@/types";
import { RestaurantCard } from "@/components/shared/RestaurantCard";
import { HotelCard } from "@/components/shared/HotelCard";
import { RestaurantRowCard } from "@/components/shared/RestaurantRowCard";
import { HotelRowCard } from "@/components/shared/HotelRowCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import FilterBar from "@/components/shared/FilterBar";

export default function SearchPage() {
  const params  = useSearchParams();
  const router  = useRouter();

  const [results, setResults]   = useState<{ restaurants: Restaurant[]; hotels: Hotel[] }>({ restaurants:[], hotels:[] });
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [filters, setFilters]   = useState({
    certified: params.get("certified") !== "false", // Default to true for Aahar trust-first approach
    price: params.get("price") || "",
    category: params.get("category") || "",
    query: params.get("q") || "",
    city: params.get("city") || "",
    tags: [] as string[],
  });

  const mode  = (params.get("mode")  ?? "eat") as any;
  const query = params.get("q")    ?? "";
  const city  = params.get("city") ?? "";

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await searchApi.search({
          mode, 
          q: filters.query, 
          city: filters.city,
          certified: filters.certified || undefined,
          priceRange: filters.price || undefined,
          category: filters.category || undefined,
          page, limit: 20,
        });
        const data = res.data.data;
        setResults({ 
          restaurants: data.restaurants ?? [], 
          hotels: data.hotels ?? [] 
        });
        setTotal(data.total ?? 0);
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [mode, page, filters.query, filters.city, filters.certified, filters.price, filters.category]);

  // Sync filters when URL params change (e.g. Navbar navigation)
  useEffect(() => {
    setFilters(prev => {
      const nextQuery = params.get("q") || "";
      const nextCity = params.get("city") || "";
      const nextCertified = params.get("certified") !== "false";
      
      if (prev.query === nextQuery && prev.city === nextCity && prev.certified === nextCertified) {
        return prev;
      }
      
      return {
        ...prev,
        certified: nextCertified,
        query: nextQuery,
        city: nextCity,
      };
    });
    setPage(1);
  }, [params]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 space-y-12">
      {/* Search Header & Filter Control Bar */}
      <div className="space-y-10">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold text-aahar-dark tracking-tight uppercase leading-tight">
            {mode === "eat" ? "Certified Dining" : "Verified Stays"} <span className="text-aahar-teal">in {city || "All Cities"}</span>
          </h1>
          <p className="text-aahar-body font-medium mt-4 text-lg">{total} results found for "{query || 'everything'}"</p>
        </div>

        {/* Premium Filter Bar */}
        <FilterBar 
          hideLabels
          initialCertified={filters.certified}
          initialQuery={filters.query}
          initialCity={filters.city}
          onFilterChange={(newFilters) => {
            setFilters(prev => {
              if (
                prev.certified === newFilters.certified &&
                prev.query === newFilters.query &&
                prev.city === newFilters.city &&
                JSON.stringify(prev.tags) === JSON.stringify(newFilters.tags)
              ) return prev;
              return {
                ...prev,
                certified: newFilters.certified,
                query: newFilters.query,
                city: newFilters.city,
                tags: newFilters.tags
              };
            });
          }}
        />
      </div>

      {/* Results Section */}
      <div className="space-y-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white border border-aahar-border animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {mode === "eat" ? (
                results.restaurants.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r as any} />
                ))
              ) : (
                results.hotels.map((h) => (
                  <HotelCard key={h.id} hotel={h as any} />
                ))
              )}
            </div>

            {results.restaurants.length === 0 && results.hotels.length === 0 && (
              <div className="text-center py-40 bg-white rounded-2xl border border-dashed border-aahar-border space-y-6 shadow-sm">
                <div className="w-20 h-20 bg-aahar-wash rounded-full flex items-center justify-center mx-auto text-aahar-body/30">
                  <Filter className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-aahar-dark uppercase tracking-tight">No results matched</h3>
                  <p className="text-aahar-body font-medium mt-1">Try broadening your search or adjusting the trust filters.</p>
                </div>
                <Button 
                  variant="link" 
                  onClick={() => setFilters(prev => ({ ...prev, certified: false, price: "", category: "" }))}
                  className="text-aahar-teal font-black uppercase tracking-widest text-xs mt-4"
                >
                  Clear Standard Filters
                </Button>
              </div>
            )}
          </>
        )}

        {!loading && total > 20 && (
          <div className="pt-12 flex items-center justify-center gap-6">
            <Button 
              variant="outline" 
              disabled={page === 1} 
              onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
              className="h-14 px-8 rounded-xl border border-aahar-border font-black uppercase text-xs tracking-wider hover:border-aahar-teal hover:text-aahar-teal transition-all disabled:opacity-20 shadow-sm"
            >
              Previous Page
            </Button>
            <div className="flex items-center gap-2">
               {[...Array(Math.ceil(total / 20))].map((_, i) => (
                 <div key={i} className={cn("w-2 h-2 rounded-full transition-all", page === i + 1 ? "w-8 bg-aahar-teal" : "bg-aahar-border")} />
               ))}
            </div>
            <Button 
              variant="outline" 
              disabled={page * 20 >= total} 
              onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
              className="h-14 px-8 rounded-xl border border-aahar-border font-black uppercase text-xs tracking-wider hover:border-aahar-teal hover:text-aahar-teal transition-all disabled:opacity-20 shadow-sm"
            >
              Next Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
