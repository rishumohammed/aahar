"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Check, RotateCcw, Wifi, Car, Utensils, Music, Waves, ShieldCheck, MapPin, Loader2, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocationStore } from "@/store/locationStore";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface FilterBarProps {
  onFilterChange?: (filters: any) => void;
  className?: string;
  hideTrustStandard?: boolean;
  hideMoreFilters?: boolean;
  hideReset?: boolean;
  hideLabels?: boolean;
  initialCertified?: boolean;
  initialQuery?: string;
  initialCity?: string;
}

const AMENITIES = [
  { id: "wifi", label: "Free WiFi", icon: Wifi },
  { id: "parking", label: "Parking", icon: Car },
  { id: "ac", label: "AC", icon: ShieldCheck },
  { id: "restaurant", label: "In-house Dining", icon: Utensils },
  { id: "pool", label: "Pool", icon: Waves },
  { id: "liveMusic", label: "Live Music", icon: Music },
];

export default function FilterBar({ 
  onFilterChange, 
  className,
  hideTrustStandard = false,
  hideMoreFilters = false,
  hideReset = false,
  hideLabels = false,
  initialCertified = true,
  initialQuery = "",
  initialCity = ""
}: FilterBarProps) {
  const router = useRouter();
  const { city: storeCity, loading: locationLoading, detectLocation } = useLocationStore();
  const [isCertified, setIsCertified] = useState(initialCertified);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialCity);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTags, setShowTags] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Sync detected city only if no initial city provided
  useEffect(() => {
    if (storeCity && !location && !initialCity) setLocation(storeCity);
  }, [storeCity, initialCity]);

  useEffect(() => {
    if (initialCertified !== undefined) setIsCertified(initialCertified);
  }, [initialCertified]);

  useEffect(() => {
    if (initialQuery !== undefined) setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialCity !== undefined) setLocation(initialCity);
  }, [initialCity]);

  // Google Places Autocomplete Integration
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && (window as any).google && (window as any).google.maps && (window as any).google.maps.places && locationInputRef.current) {
        autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ["(cities)"],
            componentRestrictions: { country: ["in", "ae", "sa", "qa", "kw", "om", "bh"] }, // India & GCC
          }
        );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (place.address_components) {
          const city = place.address_components.find((c: any) => 
            c.types.includes("locality") || c.types.includes("administrative_area_level_2")
          )?.long_name || place.name;
          
          setLocation(city);
          // Auto-trigger search if on search page
          if (onFilterChange) {
            onFilterChange({
              certified: isCertified,
              query: searchQuery,
              city: city,
              tags: selectedTags
            });
          }
        }
      });
    }
    } catch(err) { console.error(err) }
  }, [onFilterChange, isCertified, searchQuery, selectedTags]);



  const handleReset = () => {
    setIsCertified(true);
    setSearchQuery("");
    setLocation(storeCity || "");
    setSelectedTags([]);
  };

  const toggleTag = (id: string) => {
    setSelectedTags(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSearchTrigger = () => {
    if (onFilterChange) {
      onFilterChange({
        certified: isCertified,
        query: searchQuery,
        city: location,
        tags: selectedTags
      });
    } else {
      const params = new URLSearchParams();
      if (isCertified) params.set("certified", "true");
      if (searchQuery) params.set("q", searchQuery);
      if (location) params.set("city", location);
      if (selectedTags.length) params.set("tags", selectedTags.join(","));
      params.set("mode", "both");
      router.push(`/search?${params.toString()}`);
    }
  };

  // Sync with parent if needed (debounce-like)
  useEffect(() => {
    if (onFilterChange) {
      const timer = setTimeout(() => {
        onFilterChange({
          certified: isCertified,
          query: searchQuery,
          city: location,
          tags: selectedTags
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isCertified, searchQuery, location, selectedTags, onFilterChange]);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Main Filter Bar */}
      <div className="w-full bg-white border border-aahar-border rounded-2xl shadow-lg shadow-black/5 p-1.5 flex flex-col md:flex-row items-stretch md:items-center gap-0">

        {!hideTrustStandard && (
          <div className="px-4 py-1 flex flex-col justify-center min-w-[200px]">
            {!hideLabels && <span className="text-[10px] font-black uppercase tracking-widest text-aahar-body/40 ml-2 mb-1">Trust Standard</span>}
            <button
              onClick={() => setIsCertified(!isCertified)}
              className={cn(
                "flex items-center gap-3 px-4 h-14 rounded-[1.5rem] border-2 transition-all duration-300 font-bold text-sm",
                isCertified 
                  ? "bg-aahar-teal/5 border-aahar-teal text-aahar-teal shadow-sm" 
                  : "bg-transparent border-aahar-border text-aahar-body/60 hover:border-aahar-teal/50"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors",
                isCertified ? "bg-aahar-teal border-aahar-teal text-white" : "border-aahar-border text-transparent"
              )}>
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
              Aahar Certified
            </button>
          </div>
        )}
        {!hideTrustStandard && <div className="hidden md:block w-px h-10 bg-aahar-border/60 self-center" />}
        {!hideTrustStandard && <div className="block md:hidden h-px bg-aahar-border/40 mx-4" />}

        {/* Search Input */}
        <div className="px-3 py-1 flex-[2] flex items-center">
          <Search className="shrink-0 h-[18px] w-[18px] text-aahar-body/40" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchTrigger()}
            placeholder="Search restaurant or hotel name..."
            className="h-12 w-full bg-transparent border-transparent pl-3 text-[15px] font-normal text-aahar-dark placeholder:text-aahar-body/40 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-aahar-border/50 self-center shrink-0" />

        {/* Location */}
        <div className="px-3 py-1 flex-[1.2] flex items-center">
          <MapPin className="shrink-0 h-[18px] w-[18px] text-aahar-body/40" />
          <Input
            ref={locationInputRef}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Any city"
            className="h-12 w-full bg-transparent border-transparent pl-3 pr-2 text-[15px] font-normal text-aahar-dark placeholder:text-aahar-body/40 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          />
          <button
            onClick={() => detectLocation()}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-aahar-body/50 hover:text-aahar-teal hover:bg-aahar-wash transition-all"
            title="Detect Location"
          >
            {locationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crosshair className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="p-1 flex items-center gap-2 shrink-0">
          {!hideReset && (
            <button
              onClick={handleReset}
              className="w-11 h-11 bg-aahar-wash rounded-xl text-aahar-dark hover:bg-aahar-border/60 transition-all active:scale-95 flex items-center justify-center"
              title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={handleSearchTrigger}
            className="bg-aahar-dark text-white pl-5 pr-4 h-12 rounded-xl text-[14px] font-semibold hover:bg-aahar-dark/90 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Search
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {!hideMoreFilters && (
        <div className="flex flex-wrap items-center gap-2 px-4">
          <button 
            onClick={() => setShowTags(!showTags)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              showTags ? "bg-aahar-dark text-white" : "bg-white border border-aahar-wash text-aahar-body hover:border-aahar-border"
            )}
          >
            {showTags ? "Hide Amenities" : "More Filters"}
          </button>
          
          <AnimatePresence>
            {showTags && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-wrap items-center gap-2"
              >
                <div className="w-[1px] h-4 bg-aahar-wash mx-2" />
                {AMENITIES.map((tag) => {
                  const Icon = tag.icon;
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        isSelected 
                          ? "bg-aahar-teal text-white shadow-lg shadow-aahar-teal/20" 
                          : "bg-white border border-aahar-wash text-aahar-body hover:border-aahar-border"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {tag.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
