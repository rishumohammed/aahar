"use client";

import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Trash2 } from "lucide-react";

interface RestaurantMediaFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function RestaurantMediaForm({
  formData,
  setFormData
}: RestaurantMediaFormProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Visual Media & Showcase</h3>
        <p className="text-xs font-medium text-slate-500">Upload high resolution logo, cover banner, and dining gallery photos.</p>
      </div>

      {/* Logo & Cover Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Brand Logo */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Establishment Logo</label>
            <p className="text-[11px] text-slate-500 font-medium">Square format (1:1), 500x500px recommended</p>
          </div>
          <ImageUpload 
            value={formData.photos?.logo || ""} 
            onChange={url => setFormData({
              ...formData, 
              photos: { ...(formData.photos || {}), logo: url }
            })} 
          />
        </div>

        {/* Hero Cover Banner */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Cover / Hero Image</label>
            <p className="text-[11px] text-slate-500 font-medium">Landscape format (16:9), 1200x675px recommended</p>
          </div>
          <ImageUpload 
            value={formData.image || formData.photos?.cover || ""} 
            onChange={url => setFormData({
              ...formData, 
              image: url,
              photos: { ...(formData.photos || {}), cover: url }
            })} 
          />
        </div>
      </div>
    </Card>
  );
}
