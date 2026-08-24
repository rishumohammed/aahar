"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RestaurantBasicInfoFormProps {
  formData: any;
  setFormData: (data: any) => void;
  isAdmin: boolean;
  owners: any[];
  masterCategories: any[];
  DIETARY_OPTIONS: any[];
  PRICE_TIERS: any[];
}

export default function RestaurantBasicInfoForm({
  formData,
  setFormData,
  isAdmin,
  owners,
  masterCategories,
  DIETARY_OPTIONS,
  PRICE_TIERS
}: RestaurantBasicInfoFormProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Establishment Identity</h3>
        <p className="text-xs font-medium text-slate-500">Legal name, category classification, pricing tier, and summary.</p>
      </div>

      <div className="space-y-5">
        {/* Legal Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Restaurant Legal Name <span className="text-rose-500">*</span></span>
            <span className="text-[10px] text-slate-400 font-normal">Displayed prominently across directory</span>
          </label>
          <input 
            type="text" 
            required
            placeholder="e.g. Saffron Multi-Cuisine Restaurant" 
            className="w-full px-4 h-12 text-sm font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary outline-none transition-all"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* About Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Public Description</span>
            <span className="text-[10px] text-slate-400">Recommended 100-300 characters</span>
          </label>
          <textarea 
            rows={4}
            placeholder="Tell guests about your dining concept, specialty recipes, ambience, and heritage..."
            className="w-full p-4 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary outline-none transition-all resize-none"
            value={formData.description || ""}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Registered Owner (Admin Only) */}
        {isAdmin && (
          <div className="space-y-1.5 bg-admin-light/40 border border-admin-border/60 p-4 rounded-xl">
            <label className="text-xs font-bold text-admin-primary uppercase tracking-wider block">
              Assign Registered Property Owner
            </label>
            <select 
              className="w-full px-4 h-11 text-sm font-medium text-slate-800 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-admin-primary outline-none transition-all"
              value={formData.ownerId} 
              onChange={e => setFormData({ ...formData, ownerId: e.target.value })}
            >
              <option value="">Select an owner account...</option>
              {owners.map((owner: any) => (
                <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">The assigned owner will gain full portal management rights for this restaurant.</p>
          </div>
        )}

        {/* Category & Dietary Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Dining Category
            </label>
            <select 
              className="w-full px-4 h-12 text-sm font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
              value={formData.category} 
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {masterCategories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Dietary Classification
            </label>
            <select 
              className="w-full px-4 h-12 text-sm font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
              value={formData.dietary} 
              onChange={e => setFormData({ ...formData, dietary: e.target.value })}
            >
              {DIETARY_OPTIONS.map(d => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range Selector Chips */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Price Range / Expense Tier
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRICE_TIERS.map(tier => (
              <button
                key={tier.key}
                type="button"
                onClick={() => setFormData({ ...formData, priceRange: tier.key })}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all",
                  formData.priceRange === tier.key
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50/50 text-slate-700 border-slate-200 hover:bg-slate-100"
                )}
              >
                <span className={cn(
                  "text-base font-black font-mono block",
                  formData.priceRange === tier.key ? "text-amber-400" : "text-slate-900"
                )}>{tier.label}</span>
                <span className="text-xs font-bold block mt-0.5">{tier.title}</span>
                <span className={cn(
                  "text-[10px] block mt-0.5",
                  formData.priceRange === tier.key ? "text-slate-300" : "text-slate-500"
                )}>{tier.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
