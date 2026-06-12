"use client";

import { useState, useEffect } from "react";
import { restaurantApi, uploadApi, adminApi, masterApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { 
  Plus, 
  Trash2, 
  Utensils, 
  LayoutGrid, 
  ListOrdered, 
  Image as ImageIcon,
  PlusCircle,
  X,
  Loader2,
  Save,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { useRouter } from "next/navigation";
import { MaterialInput } from "@/components/ui/material-input";

interface RestaurantFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function RestaurantForm({ initialData, isEditing }: RestaurantFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const [working, setWorking] = useState(false);
  const [owners, setOwners] = useState<any[]>([]);
  const [masterCategories, setMasterCategories] = useState<any[]>([]);
  const [masterDietary, setMasterDietary] = useState<any[]>([]);
  const [masterAmenities, setMasterAmenities] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    name: "", category: "casual_dining", city: "", area: "", address: "", 
    cuisineType: ["Indian"], priceRange: "₹₹", dietary: "mixed",
    description: "", phone: "", image: "", ownerId: "",
    amenities: [],
    openingHours: {
      monday: "11:00 - 23:00", tuesday: "11:00 - 23:00", wednesday: "11:00 - 23:00",
      thursday: "11:00 - 23:00", friday: "11:00 - 23:00", saturday: "11:00 - 23:00", sunday: "11:00 - 23:00"
    },
    menu: []
  });

  const primaryBg = isAdmin ? "bg-admin-primary hover:bg-admin-hover" : "bg-aahar-teal hover:bg-aahar-teal/90";
  const primaryText = isAdmin ? "text-admin-text" : "text-aahar-teal";
  const checkboxChecked = isAdmin ? "checked:bg-admin-primary checked:border-admin-primary" : "checked:bg-aahar-teal checked:border-aahar-teal";
  const shadowPrimary = isAdmin ? "shadow-admin-primary/30" : "shadow-aahar-teal/30";

  useEffect(() => {
    if (isAdmin) {
      adminApi.users({ role: "owner" })
        .then(res => setOwners(res.data.data.items || []))
        .catch(err => {
          console.error("Failed to fetch owners:", err);
          setOwners([]);
        });
    }
    
    // Fetch Master Data
    masterApi.list("CATEGORY_RESTAURANT").then(res => setMasterCategories(res.data.data || []));
    masterApi.list("DIETARY").then(res => setMasterDietary(res.data.data || []));
    masterApi.list("AMENITY_RESTAURANT").then(res => setMasterAmenities(res.data.data || []));
  }, [isAdmin]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        cuisineType: Array.isArray(initialData.cuisineType) ? initialData.cuisineType : ["Indian"],
        amenities: Array.isArray(initialData.amenities) ? initialData.amenities : [],
        image: initialData.image || initialData.photos?.cover || "",
        openingHours: initialData.openingHours || {
          monday: "11:00 - 23:00", tuesday: "11:00 - 23:00", wednesday: "11:00 - 23:00",
          thursday: "11:00 - 23:00", friday: "11:00 - 23:00", saturday: "11:00 - 23:00", sunday: "11:00 - 23:00"
        },
        menu: initialData.menu || []
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorking(true);
    try {
      const payload = { ...formData };
      delete payload.id;
      delete payload.slug;
      delete payload.owner;
      delete payload.certification;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.image; // Frontend-only helper

      if (isEditing && initialData?.id) {
        await restaurantApi.update(initialData.id, payload);
      } else {
        await restaurantApi.create(payload);
      }
      router.push("/admin/establishments/restaurants");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save restaurant");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm border border-slate-200">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">{isEditing ? "Edit Restaurant" : "New Establishment"}</h1>
            <p className="text-slate-500 font-medium mt-1">{formData.name || "Enter profile details"}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <Card className="rounded-2xl border-0 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-10 lg:p-14">
          <div className="grid grid-cols-1 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Core Definition */}
            <div className="space-y-10">
              <div className="space-y-6">
                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", primaryText)}>Basic Information</h4>
                <div className="space-y-6">
                  <MaterialInput 
                    required 
                    label="Legal Name"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />

                  {isAdmin && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Select Registered Owner</label>
                      <select 
                        className="w-full px-4 py-4 text-base text-slate-800 bg-transparent rounded-xl border border-slate-200 focus:outline-none focus:ring-0 focus:border-admin-primary transition-colors"
                        value={formData.ownerId} 
                        onChange={e => setFormData({...formData, ownerId: e.target.value})}
                      >
                        <option value="">Select owner...</option>
                        {owners.map((owner: any) => (
                          <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="relative">
                    <textarea 
                      id="restaurant-description"
                      className="block px-4 pb-2.5 pt-6 w-full text-base text-slate-800 bg-transparent rounded-xl border border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-aahar-teal peer transition-colors min-h-[120px] resize-none"
                      placeholder=" "
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                    <label
                      htmlFor="restaurant-description"
                      className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-aahar-teal peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-6 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2 font-medium cursor-text"
                    >
                      Short Description
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Division Category</label>
                  <select 
                    className="w-full px-4 py-4 text-base text-slate-800 bg-transparent rounded-xl border border-slate-200 focus:outline-none focus:ring-0 focus:border-aahar-teal transition-colors"
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select Category...</option>
                    {masterCategories.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Dietary Type</label>
                  <select 
                    className="w-full px-4 py-4 text-base text-slate-800 bg-transparent rounded-xl border border-slate-200 focus:outline-none focus:ring-0 focus:border-aahar-teal transition-colors"
                    value={formData.dietary} 
                    onChange={e => setFormData({...formData, dietary: e.target.value})}
                  >
                    <option value="">Select Dietary Type...</option>
                    {masterDietary.map(diet => (
                      <option key={diet.key} value={diet.key}>{diet.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", primaryText)}>Amenities</h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-6 rounded-xl border border-slate-200">
                  {masterAmenities.map(amenity => (
                    <label key={amenity.key} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox"
                        className={cn("w-5 h-5 rounded border-2 border-slate-300 transition-all", checkboxChecked)}
                        checked={Array.isArray(formData.amenities) && formData.amenities.includes(amenity.key)}
                        onChange={e => {
                          const cur = Array.isArray(formData.amenities) ? formData.amenities : [];
                          setFormData({
                            ...formData,
                            amenities: e.target.checked ? [...cur, amenity.key] : cur.filter((a: string) => a !== amenity.key)
                          });
                        }}
                      />
                      <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Global Position */}
            <div className="space-y-10">
              <div className="space-y-6">
                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", primaryText)}>Location</h4>
                <div className="grid grid-cols-2 gap-5">
                  <MaterialInput 
                    required 
                    label="City"
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})} 
                  />
                  <MaterialInput 
                    required 
                    label="Area"
                    value={formData.area} 
                    onChange={e => setFormData({...formData, area: e.target.value})} 
                  />
                </div>
                <MaterialInput 
                  label="Direct Phone"
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
                <MaterialInput 
                  label="Full Address"
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                />
              </div>

              <div className="space-y-6">
                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", primaryText)}>Operations</h4>
                <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200 grid grid-cols-1 gap-4">
                  {Object.keys(formData.openingHours || {}).map(day => (
                    <div key={day} className="flex items-center justify-between gap-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 w-24">{day}</label>
                      <MaterialInput 
                        label={`${day.charAt(0).toUpperCase() + day.slice(1)} Hours`}
                        className="h-12 text-sm"
                        value={formData.openingHours[day]} 
                        onChange={e => setFormData({
                          ...formData, 
                          openingHours: { ...formData.openingHours, [day]: e.target.value }
                        })} 
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", primaryText)}>Cover Image</h4>
                <p className="text-xs text-slate-500 font-medium max-w-xl">Upload a high-quality hero image to represent your property across the platform.</p>
                <div className="max-w-xl">
                  <ImageUpload 
                    value={formData.image || formData.photos?.cover} 
                    onChange={url => setFormData({
                      ...formData, 
                      image: url,
                      photos: { ...(formData.photos || {}), cover: url }
                    })} 
                  />
                </div>
              </div>

              {isAdmin && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h4 className={cn("text-[10px] font-black uppercase tracking-widest", primaryText)}>Administrative Overrides</h4>
                  <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">Force Verification Status</p>
                      <p className="text-xs text-slate-500 mt-1">Manually mark this property as verified (certified), bypassing the standard audit workflow.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.isVerified || false}
                        onChange={e => setFormData({ ...formData, isVerified: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Action Footer */}
          <div className="mt-12 pt-8 flex items-center justify-end gap-4 border-t border-slate-100">
            <Button type="button" onClick={() => router.back()} variant="ghost" className="px-6 py-6 rounded-xl font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors">
              Discard Changes
            </Button>
            <Button type="submit" disabled={working} className={cn("px-8 py-6 rounded-xl font-black uppercase tracking-widest text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5", primaryBg, shadowPrimary)}>
              {working ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              Save Changes
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
