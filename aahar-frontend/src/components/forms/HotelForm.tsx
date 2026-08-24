"use client";

import { useState, useEffect } from "react";
import { hotelApi, adminApi, masterApi } from "@/lib/api";
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
  Copy,
  MapPin,
  Clock,
  ShieldCheck
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

type HotelTabKey = "identity" | "location" | "rooms" | "amenities" | "media" | "admin";

interface HotelFormProps {
  initialData?: any;
  isEditing?: boolean;
  isOwnerPortal?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function HotelForm({ initialData, isEditing, isOwnerPortal, onSuccess, onCancel }: HotelFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const [activeTab, setActiveTab] = useState<HotelTabKey>("identity");
  const [working, setWorking] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [owners, setOwners] = useState<any[]>([]);
  const [masterCategories, setMasterCategories] = useState<any[]>([]);
  const [masterAmenities, setMasterAmenities] = useState<any[]>([]);
  const [masterRoomAmenities, setMasterRoomAmenities] = useState<any[]>([]);
  const [masterBedTypes, setMasterBedTypes] = useState<any[]>([]);
  const [masterRoomTypes, setMasterRoomTypes] = useState<any[]>([]);
  const [masterMealPlans, setMasterMealPlans] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    name: "", propertyType: "", starRating: null, city: "", area: "", address: "", 
    description: "", phone: "", image: "", ownerId: "", googleLocationLink: "",
    checkInTime: "", checkOutTime: "",
    cancellationPolicy: "",
    approvalPreference: "instant",
    mealPlans: [],
    amenities: { pool: false, spa: false, gym: false, wifi: false, parking: false, restaurant: false },
    roomTypes: []
  });

  const checkboxChecked = isAdmin ? "checked:bg-admin-primary checked:border-admin-primary" : "checked:bg-aahar-teal checked:border-aahar-teal";

  useEffect(() => {
    if (isAdmin) {
      adminApi.users({ role: "owner" })
        .then(res => setOwners(res.data.data.items || []))
        .catch(err => {
          console.error("Failed to fetch owners:", err);
          setOwners([]);
        });
    }
    masterApi.list("CATEGORY_HOTEL").then(res => setMasterCategories(res.data.data || []));
    masterApi.list("AMENITY_HOTEL").then(res => setMasterAmenities(res.data.data || []));
    masterApi.list("AMENITY_ROOM").then(res => setMasterRoomAmenities(res.data.data || []));
    masterApi.list("BED_TYPE").then(res => setMasterBedTypes(res.data.data || []));
    masterApi.list("ROOM_TYPE").then(res => setMasterRoomTypes(res.data.data || []));
    masterApi.list("MEAL_PLAN").then(res => setMasterMealPlans(res.data.data || []));
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
        mealPlans: Array.isArray(initialData.mealPlans) ? initialData.mealPlans : [],
        amenities: typeof initialData.amenities === 'object' && initialData.amenities !== null ? initialData.amenities : {},
        roomTypes: initialData.roomTypes || []
      });
    }
  }, [initialData]);

  const addRoomType = () => {
    setFormData({
      ...formData,
      roomTypes: [
        { name: "", bedConfig: "", maxOccupancy: 2, priceFrom: 0, pricePerNight: 0, price: 0, totalRooms: 1, description: "", amenities: [] },
        ...(formData.roomTypes || [])
      ]
    });
  };

  const updateRoomType = (index: number, field: string, value: any) => {
    const updated = [...(formData.roomTypes || [])];
    const item = { ...updated[index], [field]: value };
    if (field === "priceFrom" || field === "pricePerNight" || field === "price") {
      const numVal = Number(value) || 0;
      item.priceFrom = numVal;
      item.pricePerNight = numVal;
      item.price = numVal;
    }
    updated[index] = item;
    setFormData({ ...formData, roomTypes: updated });
  };

  const removeRoomType = (index: number) => {
    const updated = (formData.roomTypes || []).filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, roomTypes: updated });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setWorking(true);
    try {
      const payload = { ...formData };
      delete payload.id;
      delete payload.slug;
      delete payload.owner;
      delete payload.manager;
      delete payload.managerId;
      delete payload.type;
      delete payload.certification;
      delete payload.enquiries;
      delete payload.applications;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.image;

      if ((isEditing || isOwnerPortal) && (initialData?.id || formData.id)) {
        const targetId = initialData?.id || formData.id;
        await hotelApi.update(targetId, payload);
        toast.success("Hotel profile updated successfully!");
      } else {
        await hotelApi.create(payload);
        toast.success("New property registered successfully!");
      }

      if (onSuccess) {
        onSuccess();
      } else if (isAdmin && !isEditing) {
        router.push("/admin/establishments/hotels");
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save hotel profile");
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

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else if (isOwnerPortal) {
      router.push("/owner/profile");
    } else if (isAdmin) {
      router.push("/admin/establishments/hotels");
    } else {
      router.back();
    }
  };

  const NAV_ITEMS: { key: HotelTabKey; label: string; icon: any; adminOnly?: boolean }[] = [
    { key: "identity", label: "Basic Info", icon: LayoutGrid },
    { key: "location", label: "Location & Contact", icon: MapPin },
    { key: "rooms", label: "Rooms & Pricing", icon: Bed },
    { key: "amenities", label: "Hotel Amenities", icon: Sparkles },
    { key: "media", label: "Photos & Media", icon: ImageIcon },
    ...(isAdmin ? [{ key: "admin" as HotelTabKey, label: "Admin Controls", icon: ShieldCheck, adminOnly: true }] : []),
  ];

  const renderPanel = () => {
    switch (activeTab) {
      case "identity":
        return (
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Property Identity</h3>
              <p className="text-xs font-medium text-slate-500">Name, type, star rating, description, and operational policies.</p>
            </div>
            <div className="space-y-5">
              {isAdmin && (
                <div className="space-y-1.5 bg-admin-light/40 border border-admin-border/60 p-4 rounded-xl">
                  <label className="text-xs font-bold text-admin-primary uppercase tracking-wider block">Assign Registered Owner</label>
                  <select 
                    className="w-full px-4 h-11 text-sm font-medium text-slate-800 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-admin-primary outline-none transition-all"
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Property Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  required
                  className="w-full px-4 h-12 text-sm font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                  placeholder="e.g. Taj Resort & Spa"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">About Property</label>
                <textarea 
                  rows={4}
                  placeholder="Write a brief overview of your property, key highlights, hospitality services..."
                  className="w-full px-4 py-3 text-sm text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all resize-none"
                  value={formData.description || ""}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Property Type</label>
                  <select 
                    className="w-full px-4 h-12 text-sm font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                    value={formData.propertyType} 
                    onChange={e => setFormData({...formData, propertyType: e.target.value})}
                  >
                    <option value="">Select Property Type...</option>
                    {masterCategories.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Star Rating</label>
                  <select 
                    className="w-full px-4 h-12 text-sm font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                    value={formData.starRating} 
                    onChange={e => setFormData({...formData, starRating: Number(e.target.value)})}
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /> Check-In Time</label>
                  <input 
                    type="text"
                    className="w-full px-4 h-12 text-sm font-mono font-bold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                    placeholder="14:00"
                    value={formData.checkInTime}
                    onChange={e => setFormData({...formData, checkInTime: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /> Check-Out Time</label>
                  <input 
                    type="text"
                    className="w-full px-4 h-12 text-sm font-mono font-bold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                    placeholder="11:00"
                    value={formData.checkOutTime}
                    onChange={e => setFormData({...formData, checkOutTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Available Meal Plans</label>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  {(masterMealPlans.length > 0
                    ? masterMealPlans.map(m => ({ code: m.key.toLowerCase(), label: m.label }))
                    : MEAL_PLANS
                  ).map(plan => (
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cancellation Policy</label>
                <textarea 
                  className="w-full px-4 py-3 text-sm text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all min-h-[80px] resize-none"
                  placeholder="Describe your cancellation policy..."
                  value={formData.cancellationPolicy}
                  onChange={e => setFormData({...formData, cancellationPolicy: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Approval Preference</label>
                <select 
                  className="w-full px-4 h-12 text-sm font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                  value={formData.approvalPreference || "instant"}
                  onChange={e => setFormData({...formData, approvalPreference: e.target.value})}
                >
                  <option value="instant">Instant Approval (Auto-verify bookings immediately)</option>
                  <option value="manual_30m">30-Minute Review (Manual verification window)</option>
                </select>
              </div>
            </div>
          </Card>
        );

      case "location":
        return (
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Location & Contact</h3>
              <p className="text-xs font-medium text-slate-500">Physical address, city, area, and contact details.</p>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">City <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" required
                    className="w-full px-4 h-12 text-sm font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                    placeholder="e.g. Goa, Kochi"
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Area / Locality <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" required
                    className="w-full px-4 h-12 text-sm font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                    placeholder="e.g. Calangute, Fort Kochi"
                    value={formData.area}
                    onChange={e => setFormData({...formData, area: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Address</label>
                <input 
                  type="text"
                  className="w-full px-4 h-12 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                  placeholder="Building, Landmark, Street, PIN"
                  value={formData.address || ""}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Direct Phone</label>
                <input 
                  type="text"
                  className="w-full px-4 h-12 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Latitude</label>
                  <input 
                    type="number" step="any"
                    className="w-full px-4 h-12 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                    placeholder="e.g. 19.0760"
                    value={formData.lat || ""}
                    onChange={e => setFormData({...formData, lat: e.target.value ? parseFloat(e.target.value) : null})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Longitude</label>
                  <input 
                    type="number" step="any"
                    className="w-full px-4 h-12 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                    placeholder="e.g. 72.8777"
                    value={formData.lng || ""}
                    onChange={e => setFormData({...formData, lng: e.target.value ? parseFloat(e.target.value) : null})}
                  />
                </div>
              </div>
            </div>
          </Card>
        );

      case "rooms":
        return (
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Rooms & Pricing</h3>
                <p className="text-xs font-medium text-slate-500">Define room categories, inventory, and nightly rates.</p>
              </div>
              <Button type="button" onClick={addRoomType} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-4 font-bold text-xs flex items-center gap-1.5">
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
                          className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400"
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
                          required type="number" min="1"
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
                          className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400"
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
                          required type="number" min="0"
                          className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400"
                          value={room.priceFrom}
                          onChange={e => updateRoomType(index, "priceFrom", Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pr-10">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Room Description</label>
                          <textarea 
                            placeholder="e.g. Spacious room with city view..."
                            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 min-h-[80px]"
                            value={room.description}
                            onChange={e => updateRoomType(index, "description", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span>Room Amenities</span>
                            <span className="text-[9px] font-medium text-slate-400 normal-case">Select from master data</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-3 rounded-lg max-h-[150px] overflow-y-auto">
                            {(masterRoomAmenities.length > 0 ? masterRoomAmenities : [
                              { key: "kettle", label: "Electric Kettle" },
                              { key: "fridge", label: "Mini Fridge" },
                              { key: "bath_tub", label: "Bathtub" },
                              { key: "ac", label: "Air Conditioning" },
                              { key: "wifi", label: "Free Wi-Fi" },
                              { key: "tv", label: "Smart TV" },
                              { key: "balcony", label: "Private Balcony" }
                            ]).map(opt => (
                              <label key={opt.key} className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                  type="checkbox"
                                  className={cn("w-4 h-4 rounded border-slate-300 transition-all", checkboxChecked)}
                                  checked={Array.isArray(room.amenities) && (room.amenities.includes(opt.key) || room.amenities.includes(opt.label) || room.amenities.includes(opt.key.toLowerCase()))}
                                  onChange={e => {
                                    const available = masterRoomAmenities.length > 0 ? masterRoomAmenities : [
                                      { key: "kettle", label: "Electric Kettle" },
                                      { key: "fridge", label: "Mini Fridge" },
                                      { key: "bath_tub", label: "Bathtub" },
                                      { key: "ac", label: "Air Conditioning" },
                                      { key: "wifi", label: "Free Wi-Fi" },
                                      { key: "tv", label: "Smart TV" },
                                      { key: "balcony", label: "Private Balcony" }
                                    ];
                                    const curValid = (Array.isArray(room.amenities) ? room.amenities : [])
                                      .map((a: any) => {
                                        const found = available.find(x => x.key === a || x.label === a || x.key.toLowerCase() === a.toLowerCase() || x.label.toLowerCase() === a.toLowerCase());
                                        return found ? found.key : null;
                                      })
                                      .filter(Boolean) as string[];
                                    const newAmenities = e.target.checked 
                                      ? [...new Set([...curValid, opt.key])]
                                      : curValid.filter(a => a !== opt.key);
                                    updateRoomType(index, "amenities", newAmenities);
                                  }}
                                />
                                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Room Category Image</label>
                        <p className="text-xs text-slate-500 font-medium">Upload a representative photo for this room type.</p>
                        <ImageUpload 
                          value={Array.isArray(room.photos) ? room.photos[0] || "" : (typeof room.photos === "string" ? room.photos : "")} 
                          onChange={url => updateRoomType(index, "photos", [url])} 
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        );

      case "amenities":
        return (
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Hotel Amenities</h3>
              <p className="text-xs font-medium text-slate-500">Toggle amenities and facilities available at this property.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
              {(masterAmenities.length > 0 ? masterAmenities : [
                { key: "pool", label: "Swimming Pool" },
                { key: "spa", label: "Spa & Wellness" },
                { key: "gym", label: "Fitness Center / Gym" },
                { key: "wifi", label: "High-Speed Wi-Fi" },
                { key: "parking", label: "Free Parking" },
                { key: "restaurant", label: "In-house Restaurant" }
              ]).map(opt => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    className={cn("w-5 h-5 rounded border-2 border-slate-300 transition-all", checkboxChecked)}
                    checked={!!formData.amenities?.[opt.key]}
                    onChange={e => setFormData({
                      ...formData,
                      amenities: { ...formData.amenities, [opt.key]: e.target.checked }
                    })}
                  />
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>
          </Card>
        );

      case "media":
        return (
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Photos & Media</h3>
              <p className="text-xs font-medium text-slate-500">Upload your property logo and hero cover image.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Property Logo</label>
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
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Cover / Hero Image</label>
                  <p className="text-[11px] text-slate-500 font-medium">Landscape (16:9), 1200x675px recommended</p>
                </div>
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
          </Card>
        );

      case "admin":
        return isAdmin ? (
          <Card className="rounded-2xl border border-amber-200 bg-amber-50/30 p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-amber-200/60 pb-4">
              <h3 className="text-lg font-bold text-amber-950 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-600" /> Administrative Overrides
              </h3>
              <p className="text-xs font-medium text-amber-800/80">Manually manage verification and certification status.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-900">Force Verification Status</p>
                <p className="text-xs text-slate-500">Manually mark this property as verified (certified).</p>
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
          </Card>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-20">

      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 px-6 py-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" size="icon" onClick={handleBack} 
            className="rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 h-10 w-10 shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-admin-light text-admin-primary border border-admin-border">
                {isEditing ? "Edit Property" : "New Property"}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              {formData.name || (isEditing ? "Edit Hotel / Resort" : "Register Hotel / Resort")}
            </h1>
            <p className="text-xs font-medium text-slate-500">
              {formData.city ? `${formData.area || "Area"}, ${formData.city}` : "Configure profile, rooms, amenities, and media"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isAdmin && isEditing && (
            <Button 
              type="button" variant="outline"
              onClick={handleResetPassword} disabled={working}
              className="rounded-xl border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 font-semibold h-10 text-xs px-4"
            >
              <KeyRound className="w-4 h-4 mr-1.5 text-amber-600" /> Reset Password
            </Button>
          )}
          <Button 
            type="button" onClick={() => handleSubmit()} disabled={working}
            className="bg-admin-primary hover:bg-admin-hover text-white rounded-xl h-10 px-5 font-bold shadow-md shadow-admin-primary/20 flex items-center gap-2"
          >
            {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-2 lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Settings</p>
            </div>
            <nav className="p-2 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                const isAdminItem = item.adminOnly;
                let badge: number | null = null;
                if (item.key === "rooms") badge = formData.roomTypes?.length || 0;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left",
                      isActive && !isAdminItem && "bg-slate-900 text-white shadow-sm",
                      isActive && isAdminItem && "bg-amber-600 text-white shadow-sm",
                      !isActive && !isAdminItem && "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      !isActive && isAdminItem && "text-amber-700 bg-amber-50/50 hover:bg-amber-100",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-current" : isAdminItem ? "text-amber-600" : "text-slate-400")} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {badge !== null && badge > 0 && (
                      <span className={cn(
                        "text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none",
                        isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                      )}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mini summary card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">Summary</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Name</span>
                <span className="font-bold text-slate-800 truncate ml-2 max-w-[120px]">{formData.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Location</span>
                <span className="font-bold text-slate-800 truncate ml-2 max-w-[120px]">{formData.city ? `${formData.city}` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Rating</span>
                <span className="font-bold text-slate-800">{"★".repeat(formData.starRating || 0) || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Rooms</span>
                <span className="font-bold text-slate-800">{formData.roomTypes?.length || 0} types</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="lg:col-span-9">
          {renderPanel()}

          {/* Save Bar */}
          <div className="mt-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All changes are saved on submit
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Button type="button" variant="ghost" onClick={handleBack} className="rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-100">
                Discard
              </Button>
              <Button 
                type="button" onClick={() => handleSubmit()} disabled={working}
                className="bg-admin-primary hover:bg-admin-hover text-white rounded-xl h-10 px-6 font-bold text-xs shadow-md shadow-admin-primary/20 flex items-center gap-2"
              >
                {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Credentials Dialog */}
      <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-admin-primary" />
              Owner Credentials Reset
            </DialogTitle>
          </DialogHeader>
          {credentials && (
            <div className="py-2 space-y-4">
              <p className="text-xs text-slate-600">
                The password for the owner account has been reset. Copy and share these details securely.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Login Email</Label>
                  <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                    <span className="text-xs font-bold text-slate-900">{credentials.email}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(credentials.email); toast.success("Email copied"); }} className="h-7 px-2 text-slate-500 hover:text-slate-900">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Temporary Password</Label>
                  <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                    <span className="text-xs font-mono font-bold text-slate-900">{credentials.password}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(credentials.password); toast.success("Password copied"); }} className="h-7 px-2 text-slate-500 hover:text-slate-900">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={() => setCredentialsOpen(false)} className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-10 font-bold text-xs">
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
