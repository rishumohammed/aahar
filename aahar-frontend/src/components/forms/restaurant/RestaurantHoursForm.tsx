"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X, Sparkle } from "lucide-react";

interface RestaurantHoursFormProps {
  formData: any;
  setFormData: (data: any) => void;
  DAYS_OF_WEEK: string[];
  handleApplyMondayToAll: () => void;
  handleSetPresetHours: (timing: string) => void;
  handleToggleDayClosed: (day: string) => void;
}

export default function RestaurantHoursForm({
  formData,
  setFormData,
  DAYS_OF_WEEK,
  handleApplyMondayToAll,
  handleSetPresetHours,
  handleToggleDayClosed
}: RestaurantHoursFormProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Operating Schedule</h3>
          <p className="text-xs font-medium text-slate-500">Configure weekly open and close timings.</p>
        </div>
        
        {/* 1-Click Fast Sync */}
        <Button 
          type="button" 
          onClick={handleApplyMondayToAll}
          variant="outline"
          className="rounded-xl border-admin-border text-admin-primary bg-admin-light/50 hover:bg-admin-light font-bold text-xs h-10 px-3.5"
        >
          <Sparkle className="h-3.5 w-3.5 mr-1.5 text-admin-primary" /> Apply Monday to All Days
        </Button>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Quick Presets:</span>
        <button
          type="button"
          onClick={() => handleSetPresetHours("11:00 - 23:00")}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors"
        >
          11:00 AM - 11:00 PM
        </button>
        <button
          type="button"
          onClick={() => handleSetPresetHours("12:00 - 00:00")}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors"
        >
          12:00 PM - 12:00 AM
        </button>
        <button
          type="button"
          onClick={() => handleSetPresetHours("08:00 - 22:00")}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors"
        >
          08:00 AM - 10:00 PM (Cafe)
        </button>
      </div>

      {/* 7 Days List */}
      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => {
          const currentTiming = formData.openingHours?.[day] || "11:00 - 23:00";
          const isClosed = currentTiming.toLowerCase().includes("closed");

          return (
            <div 
              key={day} 
              className={cn(
                "flex items-center justify-between gap-4 p-3.5 rounded-xl border transition-all",
                isClosed ? "bg-slate-50/60 border-slate-200/60 opacity-75" : "bg-white border-slate-200 shadow-sm"
              )}
            >
              <div className="flex items-center gap-3 w-32 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleDayClosed(day)}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-colors",
                    isClosed ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                  )}
                  title={isClosed ? "Mark Open" : "Mark Closed"}
                >
                  {isClosed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </button>
                <span className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
                  {day}
                </span>
              </div>

              <div className="flex-1 flex items-center gap-3">
                {isClosed ? (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                    Closed on this day
                  </span>
                ) : (
                  <input 
                    type="text" 
                    className="w-full max-w-sm px-3.5 h-10 text-xs font-mono font-bold text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                    value={currentTiming}
                    onChange={e => setFormData({
                      ...formData,
                      openingHours: { ...formData.openingHours, [day]: e.target.value }
                    })}
                    placeholder="e.g. 11:00 - 23:00"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={() => handleToggleDayClosed(day)}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 shrink-0"
              >
                {isClosed ? "Set Open" : "Mark Closed"}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
