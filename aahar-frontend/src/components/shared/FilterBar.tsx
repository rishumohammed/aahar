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
    if (initialCertified !== undefined && initialCertified !== isCertified) setIsCertified(initialCertified);
  }, [initialCertified, isCertified]);

  useEffect(() => {
    if (initialQuery !== undefined && initialQuery !== searchQuery) setSearchQuery(initialQuery);
  }, [initialQuery, searchQuery]);

  useEffect(() => {
    if (initialCity !== undefined && initialCity !== location) setLocation(initialCity);
  }, [initialCity, location]);

  // Google Places Autocomplete Integration
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).google && locationInputRef.current) {
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
      <div className="w-full bg-white border border-aahar-border rounded-[2.5rem] shadow-xl shadow-aahar-teal/5 p-2 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-0">
        
        {!hideTrustStandard && (
          <div className="px-6 py-2 border-r border-aahar-wash flex flex-col gap-3 min-w-[200px]">
            {!hideLabels && <span className="text-[10px] font-black uppercase tracking-widest text-aahar-body/40">Trust Standard</span>}
            <button
              onClick={() => setIsCertified(!isCertified)}
              className={cn(
                "flex items-center gap-3 px-6 h-14 rounded-2xl border-2 transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                isCertified 
                  ? "bg-aahar-teal/5 border-aahar-teal text-aahar-teal shadow-lg shadow-aahar-teal/10" 
                  : "bg-white border-aahar-wash text-aahar-body/40 hover:border-aahar-border"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors",
                isCertified ? "bg-aahar-teal border-aahar-teal text-white" : "border-aahar-wash text-transparent"
              )}>
                <Check className="h-3 w-3 stroke-[4]" />
              </div>
              Aahar Certified
            </button>
          </div>
        )}



        {/* Search Input Section */}
        <div className="px-6 py-2 border-r border-aahar-wash flex flex-col gap-3 flex-[2]">
          {!hideLabels && <span className="text-[10px] font-black uppercase tracking-widest text-aahar-body/40">Search & Explore</span>}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-aahar-body/40 group-focus-within:text-aahar-teal transition-colors z-10" />
            <Input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Restaurants, hotels, or cuisines..."
              className="h-14 bg-aahar-wash/30 border-aahar-wash rounded-2xl pl-12 text-sm font-bold text-aahar-dark placeholder:text-aahar-body/30 placeholder:font-medium focus-visible:border-aahar-teal focus-visible:ring-aahar-teal/5 transition-all"
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="px-6 py-2 border-r border-aahar-wash flex flex-col gap-3 flex-1">
          {!hideLabels && <span className="text-[10px] font-black uppercase tracking-widest text-aahar-body/40">Location</span>}
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-aahar-body/40 group-focus-within:text-aahar-rose transition-colors z-10" />
            <Input 
              ref={locationInputRef}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Any City"
              className="h-14 bg-aahar-wash/30 border-aahar-wash rounded-2xl pl-12 pr-10 text-sm font-bold text-aahar-dark placeholder:text-aahar-body/30 focus-visible:border-aahar-rose focus-visible:ring-aahar-rose/5 transition-all"
            />
            <button
              onClick={() => detectLocation()}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-aahar-body/40 hover:text-aahar-teal transition-colors"
            >
              {locationLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Crosshair className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {/* Actions Section */}
        <div className="pl-6 pr-2 py-2 flex items-center gap-4">
          {!hideReset && (
            <button 
              onClick={handleReset}
              className="w-14 h-14 bg-aahar-wash rounded-2xl text-[10px] font-black uppercase tracking-widest text-aahar-dark hover:bg-aahar-teal/10 transition-all duration-300 active:scale-95 flex items-center justify-center"
              title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          
          <button 
            onClick={handleSearchTrigger}
            className="bg-aahar-teal text-white px-10 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-aahar-teal/90 transition-all duration-300 active:scale-95 shadow-lg shadow-aahar-teal/20 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
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
