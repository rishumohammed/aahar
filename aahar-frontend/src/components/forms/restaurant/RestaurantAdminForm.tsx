"use client";

import { Card } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

interface RestaurantAdminFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function RestaurantAdminForm({
  formData,
  setFormData
}: RestaurantAdminFormProps) {
  return (
    <Card className="rounded-2xl border border-amber-200 bg-amber-50/30 p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-amber-200/60 pb-4">
        <h3 className="text-lg font-bold text-amber-950 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-600" /> Platform Administrative Overrides
        </h3>
        <p className="text-xs font-medium text-amber-800/80">Super Admin and Admin verification, featuring, and operational overrides.</p>
      </div>

      <div className="space-y-4">
        {/* Verified Trust Badge */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-slate-900">AAHAR Verified Trust Certification</p>
            <p className="text-xs text-slate-500">Manually grant verified trust badge status and public certification stamp.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={formData.isVerified || false}
              onChange={e => setFormData({ ...formData, isVerified: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>

        {/* Featured on Home */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-slate-900">Feature on Homepage</p>
            <p className="text-xs text-slate-500">Include in the curated homepage hero spotlight and top recommendations.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={formData.isFeatured || false}
              onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
          </label>
        </div>

        {/* Sponsored Listing */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-slate-900">Sponsored Rank Placement</p>
            <p className="text-xs text-slate-500">Boost search ranking and add sponsored indicator badge.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={formData.isSponsored || false}
              onChange={e => setFormData({ ...formData, isSponsored: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>
    </Card>
  );
}
