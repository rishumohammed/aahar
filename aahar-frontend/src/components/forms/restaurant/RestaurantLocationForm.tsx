"use client";

import { Card } from "@/components/ui/card";
import { Phone, Mail, Globe, MapPin, ExternalLink } from "lucide-react";

interface RestaurantLocationFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function RestaurantLocationForm({
  formData,
  setFormData
}: RestaurantLocationFormProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Location & Contact Channels</h3>
        <p className="text-xs font-medium text-slate-500">Physical address, neighborhood zone, direct phone, and navigation link.</p>
      </div>

      <div className="space-y-5">
        {/* City & Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              City <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Mumbai, Bengaluru, Kochi" 
              className="w-full px-4 h-12 text-sm font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Area / Neighborhood <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Bandra West, Indiranagar, Marine Drive" 
              className="w-full px-4 h-12 text-sm font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
              value={formData.area}
              onChange={e => setFormData({ ...formData, area: e.target.value })}
            />
          </div>
        </div>

        {/* Street Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Full Street Address
          </label>
          <input 
            type="text" 
            placeholder="Building, Landmark, Street No., Postal PIN" 
            className="w-full px-4 h-12 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" /> Direct Phone Number
            </label>
            <input 
              type="text" 
              placeholder="+91 98765 43210" 
              className="w-full px-4 h-12 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" /> Contact Email (Optional)
            </label>
            <input 
              type="email" 
              placeholder="contact@restaurant.com" 
              className="w-full px-4 h-12 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
              value={formData.email || ""}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        {/* Website & Google Location Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-400" /> Official Website (Optional)
            </label>
            <input 
              type="url" 
              placeholder="https://myrestaurant.com" 
              className="w-full px-4 h-12 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
              value={formData.website || ""}
              onChange={e => setFormData({ ...formData, website: e.target.value })}
            />
          </div>


        </div>

        {/* GPS Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              Latitude
            </label>
            <input 
              type="number" 
              step="any"
              placeholder="e.g. 19.0760" 
              className="w-full px-4 h-12 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
              value={formData.lat || ""}
              onChange={e => setFormData({ ...formData, lat: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              Longitude
            </label>
            <input 
              type="number" 
              step="any"
              placeholder="e.g. 72.8777" 
              className="w-full px-4 h-12 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
              value={formData.lng || ""}
              onChange={e => setFormData({ ...formData, lng: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
