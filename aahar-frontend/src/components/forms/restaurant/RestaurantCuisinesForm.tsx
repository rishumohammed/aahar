"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Plus, X } from "lucide-react";

interface RestaurantCuisinesFormProps {
  formData: any;
  setFormData: (data: any) => void;
  POPULAR_CUISINES: string[];
  customCuisineInput: string;
  setCustomCuisineInput: (val: string) => void;
  handleToggleCuisine: (cuisine: string) => void;
  handleAddCustomCuisine: (e: React.FormEvent) => void;
}

export default function RestaurantCuisinesForm({
  formData,
  POPULAR_CUISINES,
  customCuisineInput,
  setCustomCuisineInput,
  handleToggleCuisine,
  handleAddCustomCuisine
}: RestaurantCuisinesFormProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Cuisines & Dining Specialties</h3>
        <p className="text-xs font-medium text-slate-500">Select all cuisine styles that best represent your menu.</p>
      </div>

      {/* Selected Cuisines Pills */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Active Selected Cuisines ({formData.cuisineType?.length || 0})</span>
          <span className="text-[10px] text-slate-400">Click tag to remove</span>
        </label>
        <div className="flex flex-wrap gap-2 min-h-[48px] p-3 bg-slate-50 rounded-xl border border-slate-200 items-center">
          {Array.isArray(formData.cuisineType) && formData.cuisineType.length > 0 ? (
            formData.cuisineType.map((cuisine: string) => (
              <span 
                key={cuisine} 
                onClick={() => handleToggleCuisine(cuisine)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer hover:bg-rose-600 transition-colors shadow-sm"
              >
                {cuisine}
                <X className="h-3.5 w-3.5" />
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">No cuisines selected yet. Pick from the suggestions below.</span>
          )}
        </div>
      </div>

      {/* Popular Cuisine Presets */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Quick Select Popular Cuisines
        </label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CUISINES.map((cuisine) => {
            const isSelected = Array.isArray(formData.cuisineType) && formData.cuisineType.includes(cuisine);
            return (
              <button
                key={cuisine}
                type="button"
                onClick={() => handleToggleCuisine(cuisine)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5",
                  isSelected
                    ? "bg-admin-primary text-white border-admin-primary shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5 text-slate-400" />}
                {cuisine}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Custom Cuisine Input */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Add Custom Cuisine / Specialization
        </label>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="e.g. Hyderabadi Dum, Japanese Sushi, Thai Bowls..." 
            className="flex-1 px-4 h-11 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
            value={customCuisineInput}
            onChange={e => setCustomCuisineInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomCuisine(e); } }}
          />
          <Button 
            type="button" 
            onClick={handleAddCustomCuisine}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-5 font-semibold text-xs"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
