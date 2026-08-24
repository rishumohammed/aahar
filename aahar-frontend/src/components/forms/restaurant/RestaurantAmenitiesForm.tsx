"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";

interface RestaurantAmenitiesFormProps {
  formData: any;
  availableAmenities: any[];
  handleToggleAmenity: (key: string) => void;
}

export default function RestaurantAmenitiesForm({
  formData,
  availableAmenities,
  handleToggleAmenity
}: RestaurantAmenitiesFormProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Amenities & Guest Facilities</h3>
        <p className="text-xs font-medium text-slate-500">Toggle amenities available at your dining establishment.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {availableAmenities.map((amenity: any) => {
          const isSelected = Array.isArray(formData.amenities) && formData.amenities.includes(amenity.key);
          const IconComp = amenity.icon || Sparkles;

          return (
            <div
              key={amenity.key}
              onClick={() => handleToggleAmenity(amenity.key)}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 select-none",
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-slate-50/50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                isSelected ? "bg-white/20 text-white" : "bg-white border border-slate-200 text-slate-600"
              )}>
                <IconComp className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold leading-snug">{amenity.label}</p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center transition-colors",
                isSelected ? "bg-emerald-500 text-white" : "border border-slate-300"
              )}>
                {isSelected && <Check className="h-3 w-3" />}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
