"use client";

import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Trash2 } from "lucide-react";

interface RestaurantMediaFormProps {
  formData: any;
  setFormData: (data: any) => void;
  handleAddGalleryImage: (url: string) => void;
  handleRemoveGalleryImage: (index: number) => void;
}

export default function RestaurantMediaForm({
  formData,
  setFormData,
  handleAddGalleryImage,
  handleRemoveGalleryImage
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

      {/* Gallery Photos Array */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Interior & Dining Gallery ({formData.photos?.gallery?.length || 0})
            </label>
            <p className="text-[11px] text-slate-500 font-medium">Add photos of your ambience, dining seating, and signature dishes.</p>
          </div>
        </div>

        {/* Upload New Gallery Photo */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-700 mb-2">Upload Photo to Gallery:</p>
          <ImageUpload 
            value="" 
            onChange={handleAddGalleryImage} 
          />
        </div>

        {/* Gallery List Preview */}
        {Array.isArray(formData.photos?.gallery) && formData.photos.gallery.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {formData.photos.gallery.map((imgUrl: string, idx: number) => (
              <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-md"
                  title="Remove Photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
