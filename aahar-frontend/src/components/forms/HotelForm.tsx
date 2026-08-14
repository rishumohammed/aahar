"use client";

import { useState, useEffect } from "react";
import { hotelApi, uploadApi, adminApi, masterApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { 
  Plus, 
  Trash2, 
  LayoutGrid, 
  Bed,
  Image as ImageIcon,
  PlusCircle,
  X,
  Loader2,
  Save,
  ArrowLeft,
  Users,
  Sparkles,
  KeyRound,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { useRouter } from "next/navigation";
import { MaterialInput } from "@/components/ui/material-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MEAL_PLANS = [
  { code: "ep", label: "European Plan (Room only)" },
  { code: "cp", label: "Continental Plan (Breakfast)" },
  { code: "map", label: "Modified American Plan (BF + Lunch/Dinner)" },
  { code: "ap", label: "American Plan (All Meals)" }
];

interface HotelFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function HotelForm({ initialData, isEditing }: HotelFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const [working, setWorking] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [owners, setOwners] = useState<any[]>([]);
  const [masterCategories, setMasterCategories] = useState<any[]>([]);
  const [masterAmenities, setMasterAmenities] = useState<any[]>([]);
  const [masterRoomAmenities, setMasterRoomAmenities] = useState<any[]>([]);
  const [masterBedTypes, setMasterBedTypes] = useState<any[]>([]);
  const [masterRoomTypes, setMasterRoomTypes] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    name: "", propertyType: "resort", starRating: 4, city: "", area: "", address: "", 
    description: "", phone: "", image: "", ownerId: "", googleLocationLink: "",
    checkInTime: "14:00", checkOutTime: "11:00",
    cancellationPolicy: "Full refund if cancelled 24 hours prior to check-in.",
    approvalPreference: "instant",
    mealPlans: ["ep", "cp"],
    amenities: { pool: false, spa: false, gym: false, wifi: true, parking: true, restaurant: false },
    roomTypes: []
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
    masterApi.list("CATEGORY_HOTEL").then(res => setMasterCategories(res.data.data || []));
    masterApi.list("AMENITY_HOTEL").then(res => setMasterAmenities(res.data.data || []));
    masterApi.list("AMENITY_ROOM").then(res => setMasterRoomAmenities(res.data.data || []));
    masterApi.list("BED_TYPE").then(res => setMasterBedTypes(res.data.data || []));
    masterApi.list("ROOM_TYPE").then(res => setMasterRoomTypes(res.data.data || []));
  }, [isAdmin]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        image: initialData.image || initialData.photos?.cover || "",
        googleLocationLink: initialData.googleLocationLink || "",
        checkInTime: initialData.checkInTime || "14:00",
        checkOutTime: initialData.checkOutTime || "11:00",
        cancellationPolicy: initialData.cancellationPolicy || "Full refund if cancelled 24 hours prior to check-in.",
        approvalPreference: initialData.approvalPreference || "instant",
        mealPlans: Array.isArray(initialData.mealPlans) ? initialData.mealPlans : ["ep", "cp"],
        amenities: typeof initialData.amenities === 'object' && initialData.amenities !== null ? initialData.amenities : {},
        roomTypes: initialData.roomTypes || []
      });
    }
  }, [initialData]);

  const addRoomType = () => {
    setFormData({
      ...formData,
      roomTypes: [
        ...(formData.roomTypes || []),
        { name: "", bedConfig: "", maxOccupancy: 2, priceFrom: 0, totalRooms: 1, description: "", amenities: [] }
      ]
    });
  };

  const updateRoomType = (index: number, field: string, value: any) => {
    const updated = [...(formData.roomTypes || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, roomTypes: updated });
  };

  const removeRoomType = (index: number) => {
    const updated = (formData.roomTypes || []).filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, roomTypes: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorking(true);
    try {
      const payload = { ...formData };
      delete payload.id;
      delete payload.slug;
      delete payload.owner;
      delete payload.manager;
      delete payload.certification;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.image; // Frontend-only helper

      if (isEditing && initialData?.id) {
        await hotelApi.update(initialData.id, payload);
      } else {
        await hotelApi.create(payload);
      }
      router.push("/admin/establishments/hotels");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save hotel");
    } finally {
      setWorking(false);
    }
  };

  const handleResetPassword = async () => {
    if (!initialData?.ownerId) {
      toast.error("This establishment does not have an owner assigned.");
      return;
    }
    setWorking(true);
    try {
      const res = await adminApi.resetPassword(initialData.ownerId);
      setCredentials(res.data.data);
      setCredentialsOpen(true);
      toast.success("Owner credentials reset successfully");
    } catch (e) {
      toast.error("Failed to reset credentials");
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
            <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">{isEditing ? "Edit Property" : "Register Resort"}</h1>
            <p className="text-slate-500 font-medium mt-1">{formData.name || "Enter profile details"}</p>
          </div>
        </div>
        {isAdmin && isEditing && (
          <Button 
            variant="outline" 
            onClick={handleResetPassword} 
            disabled={working}
            className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <KeyRound className="w-4 h-4" /> Reset Owner Credentials
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <Card className="rounded-2xl border-0 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-10 lg:p-14">
          <div className="grid grid-cols-1 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Identity section */}
            <div className="space-y-10">
              <div className="space-y-6">
                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", primaryText)}>Basic Information</h4>
                <div className="space-y-6">
                  {isAdmin && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Assign Owner</label>
                      <select 
                        required
                        className="w-full px-4 py-4 text-base text-slate-800 bg-transparent rounded-xl border border-slate-200 focus:outline-none focus:ring-0 focus:border-admin-primary transition-colors"
                        value={formData.ownerId} 
                        onChange={e => setFormData({...formData, ownerId: e.target.value})}
                      >
                        <option value="">Select Owner</option>
                        {owners.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <MaterialInput 
                    required 
                    label="Property Name"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Type</label>
                      <select 
                        className="w-full px-4 py-4 text-base text-slate-800 bg-transparent rounded-xl border border-slate-200 focus:outline-none focus:ring-0 focus:border-aahar-teal transition-colors"
                        value={formData.propertyType} 
                        onChange={e => setFormData({...formData, propertyType: e.target.value})}
                      >
                        <option value="">Select Property Type...</option>
                        {masterCategories.map(cat => (
                          <option key={cat.key} value={cat.key}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Star Rating</label>
                      <select 
                        className="w-full px-4 py-4 text-base text-slate-800 bg-transparent rounded-xl border border-slate-200 focus:outline-none focus:ring-0 focus:border-aahar-teal transition-colors"
                        value={formData.starRating} 
                        onChange={e => setFormData({...formData, starRating: Number(e.target.value)})}
                      >
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Details */}
              <div className="space-y-6">
                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", primaryText)}>Operations</h4>
                <div className="grid grid-cols-2 gap-5">
                  <MaterialInput 
                    label="Check-In Time"
                    value={formData.checkInTime} 
                    onChange={e => setFormData({...formData, checkInTime: e.target.value})} 
                  />
                  <MaterialInput 
                    label="Check-Out Time"
                    value={formData.checkOutTime} 
                    onChange={e => setFormData({...formData, checkOutTime: e.target.value})} 
                  />
                </div>
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Available Meal Plans</label>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-6 rounded-xl border border-slate-200">
                    {MEAL_PLANS.map(plan => (
                      <label key={plan.code} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox"
                          className={cn("w-5 h-5 rounded border-2 border-slate-300 transition-all", checkboxChecked)}
                          checked={Array.isArray(formData.mealPlans) && formData.mealPlans.includes(plan.code)}
                          onChange={e => {
                            const cur = Array.isArray(formData.mealPlans) ? formData.mealPlans : [];
                            setFormData({
                              ...formData,
                              mealPlans: e.target.checked ? [...cur, plan.code] : cur.filter((p: string) => p !== plan.code)
                            });
                          }}
                        />
                        <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{plan.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Cancellation Policy</label>
                  <textarea 
                    className="w-full px-4 py-4 text-base text-slate-800 bg-transparent rounded-xl border border-slate-200 focus:outline-none focus:border-aahar-teal min-h-[100px]"
                    placeholder="Describe your cancellation policy..."
                    value={formData.cancellationPolicy}
                    onChange={e => setFormData({...formData, cancellationPolicy: e.target.value})}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Approval Preference</label>
                  <select 
                    className="w-full px-4 py-4 text-base text-slate-800 bg-transparent rounded-xl border border-slate-200 focus:outline-none focus:border-aahar-teal transition-colors"
                    value={formData.approvalPreference || "instant"}
                    onChange={e => setFormData({...formData, approvalPreference: e.target.value})}
                  >
                    <option value="instant">Instant Approval (Auto-verify bookings immediately)</option>
                    <option value="manual_30m">30-Minute Review (Manual verification window before auto-approve)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location section */}
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
                  label="Google Location Link (Maps URL)"
                  value={formData.googleLocationLink} 
                  onChange={e => setFormData({...formData, googleLocationLink: e.target.value})} 
                />
              </div>

              <div className="space-y-6">
                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", primaryText)}>Amenities</h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-6 rounded-xl border border-slate-200">
                  {masterAmenities.map(opt => (
                    <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox"
                        className={cn("w-5 h-5 rounded border-2 border-slate-300 transition-all", checkboxChecked)}
                        checked={formData.amenities?.[opt.key]}
                        onChange={e => setFormData({
                          ...formData,
                          amenities: { ...formData.amenities, [opt.key]: e.target.checked }
                        })}
                      />
                      <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Room Categories */}
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={cn("text-[10px] font-black uppercase tracking-widest", primaryText)}>Room Categories & Inventory</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">Define the types of rooms available at this property.</p>
                  </div>
                  <Button type="button" onClick={addRoomType} variant="outline" className={cn("rounded-lg border-2 font-bold text-xs flex items-center gap-2", isAdmin ? "border-admin-primary text-admin-primary hover:bg-admin-light" : "border-aahar-teal text-aahar-teal hover:bg-aahar-teal/10")}>
                    <PlusCircle className="h-4 w-4" /> Add Room
                  </Button>
                </div>

                <div className="space-y-4">
                  {!formData.roomTypes?.length ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center border-dashed">
                      <Bed className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-600">No rooms configured</p>
                      <p className="text-xs text-slate-500 mt-1">Click "Add Room" to create your first room category.</p>
                    </div>
                  ) : (
                    formData.roomTypes.map((room: any, index: number) => (
                      <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group transition-all hover:border-slate-300">
                        <button type="button" onClick={() => removeRoomType(index)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Remove Room">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pr-10 mb-5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Room Name / Type</label>
                            <select 
                              required
                              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 appearance-none"
                              value={room.name}
                              onChange={e => updateRoomType(index, "name", e.target.value)}
                            >
                              <option value="">Select Room Type...</option>
                              {masterRoomTypes.map(opt => (
                                <option key={opt.key} value={opt.label}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Rooms in Category</label>
                            <input 
                              required
                              type="number" 
                              min="1"
                              placeholder="Inventory count"
                              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400"
                              value={room.totalRooms}
                              onChange={e => updateRoomType(index, "totalRooms", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bed Configuration</label>
                            <select 
                              required
                              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 appearance-none"
                              value={room.bedConfig}
                              onChange={e => updateRoomType(index, "bedConfig", e.target.value)}
                            >
                              <option value="">Select Bed Type...</option>
                              {masterBedTypes.map(opt => (
                                <option key={opt.key} value={opt.label}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Starting Price / Night (₹)</label>
                            <input 
                              required
                              type="number" 
                              min="0"
                              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400"
                              value={room.priceFrom}
                              onChange={e => updateRoomType(index, "priceFrom", Number(e.target.value))}
                            />
                          </div>
                        </div>

                        <div className="space-y-4 pr-10">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Room Description</label>
                            <textarea 
                              placeholder="e.g. The spacious quadruple room offers air conditioning, a minibar..."
                              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 min-h-[80px]"
                              value={room.description}
                              onChange={e => updateRoomType(index, "description", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                              <span>Room Amenities & Features</span>
                              <span className="text-[9px] font-medium text-slate-400 normal-case tracking-normal">Select from Master Data</span>
                            </label>
                            
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-4 rounded-lg max-h-[150px] overflow-y-auto">
                              {masterRoomAmenities.map(opt => (
                                <label key={opt.key} className="flex items-center gap-2 cursor-pointer group">
                                  <input 
                                    type="checkbox"
                                    className={cn("w-4 h-4 rounded border-slate-300 transition-all", checkboxChecked)}
                                    checked={Array.isArray(room.amenities) && room.amenities.includes(opt.label)}
                                    onChange={e => {
                                      const cur = Array.isArray(room.amenities) ? room.amenities : [];
                                      updateRoomType(index, "amenities", e.target.checked ? [...cur, opt.label] : cur.filter((a: string) => a !== opt.label));
                                    }}
                                  />
                                  <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{opt.label}</span>
                                </label>
                              ))}
                              {masterRoomAmenities.length === 0 && (
                                <p className="text-xs text-slate-400 italic col-span-2">No room amenities configured in Master Data.</p>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", primaryText)}>Media & Imagery</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-800">Profile Image / Logo</p>
                    <p className="text-xs text-slate-500 font-medium max-w-sm">Upload a logo or profile image to represent your property on the dashboard.</p>
                    <ImageUpload 
                      value={formData.photos?.logo || ""} 
                      onChange={url => setFormData({
                        ...formData, 
                        photos: { ...(formData.photos || {}), logo: url }
                      })} 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-800">Cover Image</p>
                    <p className="text-xs text-slate-500 font-medium max-w-sm">Upload a high-quality hero image to represent your property across the platform.</p>
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

      {/* Credentials Dialog */}
      <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-admin-primary" />
              Owner Credentials Reset
            </DialogTitle>
          </DialogHeader>
          {credentials && (
            <div className="py-2 space-y-4">
              <p className="text-sm text-slate-600">
                The password for the owner account has been reset to the system default. Please copy and share these details securely with the owner.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Login Email</Label>
                  <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                    <span className="text-sm font-semibold">{credentials.email}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => {
                      navigator.clipboard.writeText(credentials.email);
                      toast.success("Email copied");
                    }} className="h-6 w-6 p-0 text-slate-400 hover:text-slate-900">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Temporary Password</Label>
                  <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                    <span className="text-sm font-semibold">{credentials.password}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => {
                      navigator.clipboard.writeText(credentials.password);
                      toast.success("Password copied");
                    }} className="h-6 w-6 p-0 text-slate-400 hover:text-slate-900">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={() => setCredentialsOpen(false)} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                  Acknowledge & Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
