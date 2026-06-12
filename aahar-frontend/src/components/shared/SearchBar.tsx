"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Crosshair, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useLocationStore } from "@/store/locationStore";

export default function SearchBar() {
  const router = useRouter();
  const { city: storeCity, loading: locationLoading, detectLocation } = useLocationStore();
  const [category, setCategory] = useState("Both");
  const [query, setQuery]       = useState("");
  const [location, setLocation] = useState("");

  // Sync detected city to local state if local state is empty
  useEffect(() => {
    if (storeCity && !location) {
      setLocation(storeCity);
    }
  }, [storeCity]);

  // Auto-detect on mount if no city is currently known
  useEffect(() => {
    if (!storeCity) {
      detectLocation();
    }
  }, [storeCity, detectLocation]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("city", location);
    
    if (category === "Eat") {
      params.set("mode", "eat");
    } else if (category === "Stay") {
      params.set("mode", "stay");
    } else {
      params.set("mode", "both");
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex w-full max-w-4xl items-center gap-0 rounded-full border bg-white p-1 shadow-lg border-aahar-border relative z-40">
      <Select value={category} onValueChange={(val) => { if (val) setCategory(val); }}>
        <SelectTrigger className="h-12 border-0 rounded-l-full px-6 text-aahar-dark hover:bg-aahar-wash focus:ring-0 focus:ring-offset-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" className="z-[100]">
          <SelectItem value="Eat">Eat</SelectItem>
          <SelectItem value="Stay">Stay</SelectItem>
          <SelectItem value="Both">Both</SelectItem>
        </SelectContent>
      </Select>

      <div className="h-8 w-[1px] bg-aahar-border" />

      {/* Main Search Input */}
      <div className="flex flex-1 items-center px-4">
        <Search className="h-5 w-5 text-aahar-body" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search restaurants or hotels..."
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-aahar-dark placeholder:text-aahar-body/50"
        />
      </div>

      <div className="h-8 w-[1px] bg-aahar-border" />

      {/* Location Input */}
      <div className="flex flex-1 items-center px-4 relative">
        <MapPin className="h-5 w-5 text-aahar-body" />
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Location"
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-aahar-dark placeholder:text-aahar-body/50 pr-8"
        />
        <button
          type="button"
          onClick={() => detectLocation()}
          disabled={locationLoading}
          className="absolute right-4 p-1 text-aahar-body hover:text-aahar-teal transition-colors"
          title="Detect my location"
        >
          {locationLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Search Button */}
      <Button 
        onClick={handleSearch}
        className="h-12 rounded-full bg-aahar-teal px-8 text-white hover:bg-aahar-teal/90"
      >
        Search
      </Button>
    </div>
  );
}
