"use client";

import { useState, useEffect } from "react";
import { restaurantApi, uploadApi, adminApi, masterApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { 
  Building2, 
  Utensils, 
  MapPin, 
  Clock, 
  Image as ImageIcon, 
  Sparkles, 
  ShieldCheck, 
  Save, 
  ArrowLeft, 
  Plus, 
  X, 
  Check, 
  Loader2, 
  KeyRound, 
  Copy, 
  ExternalLink, 
  Phone, 
  Mail, 
  Globe, 
  Eye, 
  Sparkle, 
  Trash2, 
  HelpCircle,
  Car,
  Wifi,
  Wind,
  Coffee,
  Music,
  CreditCard,
  Baby,
  Sun,
  Shield,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

interface RestaurantFormProps {
  initialData?: any;
  isEditing?: boolean;
}

const POPULAR_CUISINES = [
  "North Indian", "South Indian", "Biryani", "Mughlai", 
  "Chinese", "Arabian / Lebanese", "Continental", "Italian & Pizza", 
  "Seafood", "Street Food", "Bakery & Desserts", "Fast Food", 
  "Kerala Traditional", "Chettinad", "Beverages & Cafe", "Asian Fusion"
];

const DIETARY_OPTIONS = [
  { key: "mixed", label: "Mixed (Veg & Non-Veg)", desc: "Serves both vegetarian and meat selections" },
  { key: "pure_veg", label: "Pure Vegetarian (100% Veg)", desc: "Strictly vegetarian kitchen and preparation" },
  { key: "halal_friendly", label: "Halal Certified / Friendly", desc: "100% Halal sourced poultry & meats" },
  { key: "vegan", label: "Vegan Friendly", desc: "Plant-based dining options available" },
  { key: "jain_friendly", label: "Jain Friendly", desc: "No onion, garlic, or root vegetables on request" },
];

const PRICE_TIERS = [
  { key: "₹", label: "₹", title: "Budget Friendly", desc: "Under ₹300 for two" },
  { key: "₹₹", label: "₹₹", title: "Moderate", desc: "₹300 - ₹800 for two" },
  { key: "₹₹₹", label: "₹₹₹", title: "Premium Dining", desc: "₹800 - ₹1,800 for two" },
  { key: "₹₹₹₹", label: "₹₹₹₹", title: "Luxury / Fine Dining", desc: "₹1,800+ for two" },
];

const DEFAULT_AMENITIES_LIST = [
  { key: "ac", label: "Air Conditioned", icon: Wind },
  { key: "wifi", label: "Free High-Speed WiFi", icon: Wifi },
  { key: "parking", label: "Customer Parking", icon: Car },
  { key: "valet", label: "Valet Parking Service", icon: Car },
  { key: "outdoor_seating", label: "Outdoor / Rooftop Seating", icon: Sun },
  { key: "family_section", label: "Family Dining Section", icon: Baby },
  { key: "live_music", label: "Live Music & Entertainment", icon: Music },
  { key: "cards_accepted", label: "Cards & Digital UPI Accepted", icon: CreditCard },
  { key: "cafe_beverages", label: "Specialty Coffee & Beverages", icon: Coffee },
  { key: "buffet", label: "Buffet Spread Available", icon: Utensils },
  { key: "takeaway", label: "Quick Takeaway / Delivery", icon: Layers },
  { key: "clean_restroom", label: "Sanitized Restrooms", icon: Shield },
];

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function RestaurantForm({ initialData, isEditing }: RestaurantFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const [activeTab, setActiveTab] = useState<"identity" | "cuisines" | "location" | "hours" | "media" | "amenities" | "admin">("identity");
  const [working, setWorking] = useState(false);
  
  // Credentials Reset Dialog
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);

  // Master Data
  const [owners, setOwners] = useState<any[]>([]);
  const [masterCategories, setMasterCategories] = useState<any[]>([]);
  const [masterDietary, setMasterDietary] = useState<any[]>([]);
  const [masterAmenities, setMasterAmenities] = useState<any[]>([]);

  // Custom Cuisine Input
  const [customCuisineInput, setCustomCuisineInput] = useState("");

  // Form State
  const [formData, setFormData] = useState<any>({
    name: "",
    category: "casual_dining",
    city: "",
    area: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    priceRange: "₹₹",
    dietary: "mixed",
    description: "",
    image: "",
    googleLocationLink: "",
    ownerId: "",
    cuisineType: ["North Indian", "South Indian"],
    amenities: ["ac", "wifi", "parking", "cards_accepted"],
    openingHours: {
      monday: "11:00 - 23:00",
      tuesday: "11:00 - 23:00",
      wednesday: "11:00 - 23:00",
      thursday: "11:00 - 23:00",
      friday: "11:00 - 23:00",
      saturday: "11:00 - 23:00",
      sunday: "11:00 - 23:00"
    },
    photos: {
      logo: "",
      cover: "",
      gallery: []
    },
    isVerified: false,
    isActive: true,
    isFeatured: false,
    isSponsored: false
  });

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
      const photosObj = typeof initialData.photos === "object" && initialData.photos !== null ? initialData.photos : {};
      const galleryList = Array.isArray(photosObj.gallery) ? photosObj.gallery : [];
      
      let parsedAmenities = [];
      if (Array.isArray(initialData.amenities)) {
        parsedAmenities = initialData.amenities;
      } else if (typeof initialData.amenities === "object" && initialData.amenities !== null) {
        parsedAmenities = Object.keys(initialData.amenities).filter(k => initialData.amenities[k]);
      }

      setFormData({
        ...initialData,
        cuisineType: Array.isArray(initialData.cuisineType) && initialData.cuisineType.length > 0 
          ? initialData.cuisineType 
          : ["Indian"],
        amenities: parsedAmenities,
        image: initialData.image || photosObj.cover || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        website: initialData.website || "",
        googleLocationLink: initialData.googleLocationLink || "",
        priceRange: initialData.priceRange || "₹₹",
        dietary: initialData.dietary || "mixed",
        category: initialData.category || "casual_dining",
        openingHours: initialData.openingHours || {
          monday: "11:00 - 23:00",
          tuesday: "11:00 - 23:00",
          wednesday: "11:00 - 23:00",
          thursday: "11:00 - 23:00",
          friday: "11:00 - 23:00",
          saturday: "11:00 - 23:00",
          sunday: "11:00 - 23:00"
        },
        photos: {
          logo: photosObj.logo || "",
          cover: initialData.image || photosObj.cover || "",
          gallery: galleryList
        },
        isVerified: initialData.isVerified || false,
        isActive: initialData.isActive !== false,
        isFeatured: initialData.isFeatured || false,
        isSponsored: initialData.isSponsored || false
      });
    }
  }, [initialData]);

  // Cuisine Helpers
  const handleToggleCuisine = (cuisine: string) => {
    const list = Array.isArray(formData.cuisineType) ? formData.cuisineType : [];
    if (list.includes(cuisine)) {
      setFormData({ ...formData, cuisineType: list.filter((c: string) => c !== cuisine) });
    } else {
      setFormData({ ...formData, cuisineType: [...list, cuisine] });
    }
  };

  const handleAddCustomCuisine = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customCuisineInput.trim();
    if (!trimmed) return;
    const list = Array.isArray(formData.cuisineType) ? formData.cuisineType : [];
    if (!list.includes(trimmed)) {
      setFormData({ ...formData, cuisineType: [...list, trimmed] });
    }
    setCustomCuisineInput("");
  };

  // Amenities Helpers
  const handleToggleAmenity = (key: string) => {
    const list = Array.isArray(formData.amenities) ? formData.amenities : [];
    if (list.includes(key)) {
      setFormData({ ...formData, amenities: list.filter((a: string) => a !== key) });
    } else {
      setFormData({ ...formData, amenities: [...list, key] });
    }
  };

  // Operating Hours Quick Actions
  const handleApplyMondayToAll = () => {
    const mondayVal = formData.openingHours?.monday || "11:00 - 23:00";
    const updated: any = {};
    DAYS_OF_WEEK.forEach(day => {
      updated[day] = mondayVal;
    });
    setFormData({ ...formData, openingHours: updated });
    toast.success("Applied Monday hours to all 7 days!");
  };

  const handleSetPresetHours = (timing: string) => {
    const updated: any = {};
    DAYS_OF_WEEK.forEach(day => {
      updated[day] = timing;
    });
    setFormData({ ...formData, openingHours: updated });
    toast.success(`Schedule set to ${timing} for all days!`);
  };

  const handleToggleDayClosed = (day: string) => {
    const current = formData.openingHours?.[day] || "11:00 - 23:00";
    const isClosed = current.toLowerCase().includes("closed");
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: isClosed ? "11:00 - 23:00" : "Closed"
      }
    });
  };

  // Gallery Helpers
  const handleAddGalleryImage = (url: string) => {
    if (!url) return;
    const current = Array.isArray(formData.photos?.gallery) ? formData.photos.gallery : [];
    setFormData({
      ...formData,
      photos: {
        ...formData.photos,
        gallery: [...current, url]
      }
    });
  };

  const handleRemoveGalleryImage = (index: number) => {
    const current = Array.isArray(formData.photos?.gallery) ? formData.photos.gallery : [];
    setFormData({
      ...formData,
      photos: {
        ...formData.photos,
        gallery: current.filter((_: string, i: number) => i !== index)
      }
    });
  };

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.name?.trim()) {
      setActiveTab("identity");
      toast.error("Please enter the restaurant name");
      return;
    }
    if (!formData.city?.trim() || !formData.area?.trim()) {
      setActiveTab("location");
      toast.error("Please provide city and area for the restaurant");
      return;
    }

    setWorking(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        city: formData.city,
        area: formData.area,
        address: formData.address || "",
        phone: formData.phone || "",
        email: formData.email || "",
        website: formData.website || "",
        priceRange: formData.priceRange || "₹₹",
        dietary: formData.dietary || "mixed",
        description: formData.description || "",
        googleLocationLink: formData.googleLocationLink || "",
        cuisineType: formData.cuisineType,
        amenities: formData.amenities,
        openingHours: formData.openingHours,
        photos: {
          logo: formData.photos?.logo || "",
          cover: formData.image || formData.photos?.cover || "",
          gallery: formData.photos?.gallery || []
        },
        isVerified: formData.isVerified || false,
        isActive: formData.isActive !== false,
        isFeatured: formData.isFeatured || false,
        isSponsored: formData.isSponsored || false,
        ...(formData.ownerId ? { ownerId: formData.ownerId } : {})
      };

      if (isEditing && initialData?.id) {
        await restaurantApi.update(initialData.id, payload);
        toast.success("Restaurant profile updated successfully!");
      } else {
        await restaurantApi.create(payload);
        toast.success("New establishment registered successfully!");
      }
      
      if (isAdmin) {
        router.push("/admin/establishments/restaurants");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save restaurant details");
    } finally {
      setWorking(false);
    }
  };

  const handleResetPassword = async () => {
    if (!initialData?.ownerId) return;
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

  const availableCategories = masterCategories.length > 0 ? masterCategories : [
    { key: "casual_dining", label: "Casual Dining" },
    { key: "fine_dining", label: "Fine Dining" },
    { key: "cafe", label: "Cafe & Bistro" },
    { key: "cloud_kitchen", label: "Cloud Kitchen / Delivery Only" },
    { key: "fast_food", label: "Quick Service / Fast Food" },
    { key: "family_restaurant", label: "Family Restaurant" },
    { key: "sweet_shop", label: "Sweets & Confectionery" },
  ];

  const availableAmenities = masterAmenities.length > 0 ? masterAmenities : DEFAULT_AMENITIES_LIST;

  const currentCover = formData.image || formData.photos?.cover || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80";

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 h-11 w-11 shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-admin-light text-admin-primary border border-admin-border">
                {isEditing ? "Edit Establishment" : "New Establishment"}
              </span>
              {formData.isVerified && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> AAHAR Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {formData.name || (isEditing ? "Edit Restaurant" : "New Restaurant")}
            </h1>
            <p className="text-xs md:text-sm font-medium text-slate-500 mt-0.5">
              {formData.city ? `${formData.area || "Area"}, ${formData.city}` : "Configure profile, menu, timings, and branding"}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {isAdmin && isEditing && initialData?.ownerId && (
            <Button 
              type="button"
              variant="outline" 
              onClick={handleResetPassword} 
              disabled={working}
              className="rounded-xl border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 font-semibold h-11 text-xs px-4"
            >
              <KeyRound className="w-4 h-4 mr-1.5 text-amber-600" /> Reset Password
            </Button>
          )}

          {isEditing && (initialData?.slug || initialData?.id) && (
            <Link 
              href={`/p/${initialData.slug || initialData.id}`} 
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 h-11 rounded-xl transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> Live Page
            </Link>
          )}

          <Button 
            type="button" 
            onClick={() => handleSubmit()} 
            disabled={working} 
            className="bg-admin-primary hover:bg-admin-hover text-white rounded-xl h-11 px-6 font-bold shadow-md shadow-admin-primary/20 flex items-center gap-2"
          >
            {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Profile</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Tabs & Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Modern Tab Navigation & Form Panels */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Navigation Tab Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("identity")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeTab === "identity" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Building2 className="h-4 w-4" /> Identity & Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cuisines")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeTab === "cuisines" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Utensils className="h-4 w-4" /> Cuisines & Dining
              {Array.isArray(formData.cuisineType) && formData.cuisineType.length > 0 && (
                <span className="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {formData.cuisineType.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("location")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeTab === "location" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <MapPin className="h-4 w-4" /> Location & Contact
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("hours")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeTab === "hours" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Clock className="h-4 w-4" /> Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeTab === "media" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <ImageIcon className="h-4 w-4" /> Photos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("amenities")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeTab === "amenities" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Sparkles className="h-4 w-4" /> Amenities
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                  activeTab === "admin" 
                    ? "bg-amber-600 text-white shadow-sm" 
                    : "text-amber-700 bg-amber-50 hover:bg-amber-100"
                )}
              >
                <ShieldCheck className="h-4 w-4" /> Admin Controls
              </button>
            )}
          </div>

          {/* TAB 1: IDENTITY & BASIC INFO */}
          {activeTab === "identity" && (
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
                      {availableCategories.map(cat => (
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

                {/* Description */}
                <div className="space-y-1.5 pt-2">
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
              </div>
            </Card>
          )}

          {/* TAB 2: CUISINES & DINING STYLE */}
          {activeTab === "cuisines" && (
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
          )}

          {/* TAB 3: LOCATION & CONTACT */}
          {activeTab === "location" && (
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> Google Maps Link</span>
                      {formData.googleLocationLink && (
                        <a href={formData.googleLocationLink} target="_blank" rel="noreferrer" className="text-[10px] text-admin-primary hover:underline flex items-center gap-0.5">
                          Test Link <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </label>
                    <input 
                      type="url" 
                      placeholder="https://maps.app.goo.gl/..." 
                      className="w-full px-4 h-12 text-sm font-medium text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-admin-primary outline-none transition-all"
                      value={formData.googleLocationLink || ""}
                      onChange={e => setFormData({ ...formData, googleLocationLink: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 4: OPERATING SCHEDULE */}
          {activeTab === "hours" && (
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
          )}

          {/* TAB 5: PHOTOS & MEDIA */}
          {activeTab === "media" && (
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
          )}

          {/* TAB 6: AMENITIES & FACILITIES */}
          {activeTab === "amenities" && (
            <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Amenities & Guest Facilities</h3>
                <p className="text-xs font-medium text-slate-500">Toggle amenities available at your dining establishment.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {availableAmenities.map((amenity: any) => {
                  const isSelected = Array.isArray(formData.amenities) && formData.amenities.includes(amenity.key);
                  const IconComp = amenity.icon || Sparkles;

                  return (
                    <div
                      key={amenity.key}
                      onClick={() => handleToggleAmenity(amenity.key)}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 select-none",
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-slate-50/50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected ? "bg-white/20 text-white" : "bg-white border border-slate-200 text-slate-600"
                      )}>
                        <IconComp className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold leading-snug">{amenity.label}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center transition-colors",
                        isSelected ? "bg-emerald-500 text-white" : "border border-slate-300"
                      )}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* TAB 7: ADMIN CONTROLS (ADMIN ONLY) */}
          {isAdmin && activeTab === "admin" && (
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
          )}

          {/* Sticky Bottom Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All edits update live in preview
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.back()} 
                className="rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-100"
              >
                Discard
              </Button>
              <Button 
                type="button" 
                onClick={() => handleSubmit()} 
                disabled={working} 
                className="bg-admin-primary hover:bg-admin-hover text-white rounded-xl h-11 px-6 font-bold text-xs shadow-md shadow-admin-primary/20 flex items-center gap-2"
              >
                {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Live Diners Card Preview (Sticky) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <Eye className="h-3.5 w-3.5 text-admin-primary" /> Live Storefront Preview
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              Directory Card
            </span>
          </div>

          {/* Live Card */}
          <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md hover:shadow-lg transition-all">
            {/* Cover Image Container */}
            <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
              <img 
                src={currentCover} 
                alt="Live Preview Cover" 
                className="w-full h-full object-cover transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />

              {/* Status Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                {formData.isVerified && (
                  <span className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Certified
                  </span>
                )}
                {formData.isFeatured && (
                  <span className="bg-admin-primary text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                    Featured
                  </span>
                )}
              </div>

              {/* Price Tier Badge Top Right */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-black font-mono px-2.5 py-0.5 rounded-md shadow-sm">
                {formData.priceRange || "₹₹"}
              </div>

              {/* Logo & Name on Cover */}
              <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
                {formData.photos?.logo ? (
                  <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md shrink-0 overflow-hidden border border-white">
                    <img src={formData.photos.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-900/80 backdrop-blur-sm p-1 shadow-md shrink-0 flex items-center justify-center border border-white/20 text-white">
                    <Utensils className="h-6 w-6 text-amber-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1 text-white">
                  <h4 className="text-base font-black tracking-tight leading-snug drop-shadow-md truncate">
                    {formData.name || "Restaurant Name"}
                  </h4>
                  <p className="text-[11px] text-white/80 font-medium truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                    {formData.area ? `${formData.area}, ${formData.city || "City"}` : "Area, City"}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body Details */}
            <div className="p-4 space-y-3 bg-white">
              {/* Cuisines Pills */}
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(formData.cuisineType) && formData.cuisineType.length > 0 ? (
                  formData.cuisineType.slice(0, 3).map((c: string) => (
                    <span key={c} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400 italic">No cuisines selected</span>
                )}
                {Array.isArray(formData.cuisineType) && formData.cuisineType.length > 3 && (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                    +{formData.cuisineType.length - 3} more
                  </span>
                )}
              </div>

              {/* Dietary & Category Row */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="font-semibold text-slate-500 capitalize">
                  {formData.category?.replace(/_/g, " ")}
                </span>
                <span className={cn(
                  "font-bold text-[10px] uppercase px-2 py-0.5 rounded-full border",
                  formData.dietary === "pure_veg" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  formData.dietary === "halal_friendly" ? "bg-teal-50 text-teal-700 border-teal-200" :
                  "bg-slate-100 text-slate-700 border-slate-200"
                )}>
                  {formData.dietary?.replace(/_/g, " ")}
                </span>
              </div>

              {/* Operating Hours Today */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3 text-admin-primary" /> Today's Hours:
                </span>
                <span className="font-bold text-slate-800">
                  {formData.openingHours?.monday || "11:00 - 23:00"}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Help Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
            <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-slate-500" /> Tips for Better Engagement
            </h5>
            <ul className="text-[11px] text-slate-600 space-y-1 pl-4 list-disc font-medium">
              <li>Upload a vibrant high-res landscape cover photo.</li>
              <li>Include at least 3-5 specific cuisine specialties.</li>
              <li>Fill out direct phone and Google Maps link for easy diner routing.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Owner Credentials Reset Dialog (Admin only) */}
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
                The password for this establishment's owner account has been reset. Copy and share these credentials securely.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Login Email</Label>
                  <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                    <span className="text-xs font-bold text-slate-900">{credentials.email}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        navigator.clipboard.writeText(credentials.email);
                        toast.success("Email copied to clipboard");
                      }} 
                      className="h-7 px-2 text-slate-500 hover:text-slate-900"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">New Password</Label>
                  <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                    <span className="text-xs font-mono font-bold text-slate-900">{credentials.password}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        navigator.clipboard.writeText(credentials.password);
                        toast.success("Password copied to clipboard");
                      }} 
                      className="h-7 px-2 text-slate-500 hover:text-slate-900"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  onClick={() => setCredentialsOpen(false)} 
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-10 font-bold text-xs"
                >
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
