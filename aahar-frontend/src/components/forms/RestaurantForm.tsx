"use client";

import { useState, useEffect } from "react";
import { restaurantApi, adminApi, masterApi } from "@/lib/api";
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
  Eye, 
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
import { cn, getImageUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

// Sub-components
import RestaurantBasicInfoForm from "./restaurant/RestaurantBasicInfoForm";
import RestaurantCuisinesForm from "./restaurant/RestaurantCuisinesForm";
import RestaurantLocationForm from "./restaurant/RestaurantLocationForm";
import RestaurantHoursForm from "./restaurant/RestaurantHoursForm";
import RestaurantMediaForm from "./restaurant/RestaurantMediaForm";
import RestaurantAmenitiesForm from "./restaurant/RestaurantAmenitiesForm";
import RestaurantAdminForm from "./restaurant/RestaurantAdminForm";

interface RestaurantFormProps {
  initialData?: any;
  isEditing?: boolean;
  isOwnerPortal?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
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

type TabKey = "identity" | "cuisines" | "location" | "hours" | "media" | "amenities" | "admin";

const NAV_ITEMS: { key: TabKey; label: string; icon: any; adminOnly?: boolean }[] = [
  { key: "identity", label: "Basic Info", icon: Building2 },
  { key: "cuisines", label: "Cuisines", icon: Utensils },
  { key: "location", label: "Location & Contact", icon: MapPin },
  { key: "hours", label: "Operating Hours", icon: Clock },
  { key: "media", label: "Photos & Media", icon: ImageIcon },
  { key: "amenities", label: "Amenities", icon: Sparkles },
  { key: "admin", label: "Admin Controls", icon: ShieldCheck, adminOnly: true },
];

export default function RestaurantForm({ initialData, isEditing, isOwnerPortal, onSuccess, onCancel }: RestaurantFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const [activeTab, setActiveTab] = useState<TabKey>("identity");
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
    category: "",
    city: "",
    area: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    priceRange: "",
    dietary: "",
    description: "",
    image: "",
    googleLocationLink: "",
    ownerId: "",
    cuisineType: [],
    amenities: [],
    openingHours: {
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
      sunday: ""
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
        lat: formData.lat || null,
        lng: formData.lng || null,
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

      if ((isEditing || isOwnerPortal) && (initialData?.id || formData.id)) {
        const targetId = initialData?.id || formData.id;
        await restaurantApi.update(targetId, payload);
        toast.success("Restaurant profile updated successfully!");
      } else {
        await restaurantApi.create(payload);
        toast.success("New establishment registered successfully!");
      }
      
      if (onSuccess) {
        onSuccess();
      } else if (isAdmin && !isEditing) {
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
  const currentCover = getImageUrl(formData.image || formData.photos?.cover) || "";

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else if (isOwnerPortal) {
      router.push("/owner/profile");
    } else if (isAdmin) {
      router.push("/admin/establishments/restaurants");
    } else {
      router.back();
    }
  };

  const visibleNavItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  const renderPanel = () => {
    switch (activeTab) {
      case "identity":
        return (
          <RestaurantBasicInfoForm
            formData={formData}
            setFormData={setFormData}
            isAdmin={isAdmin}
            owners={owners}
            masterCategories={availableCategories}
            DIETARY_OPTIONS={DIETARY_OPTIONS}
            PRICE_TIERS={PRICE_TIERS}
          />
        );
      case "cuisines":
        return (
          <RestaurantCuisinesForm
            formData={formData}
            setFormData={setFormData}
            POPULAR_CUISINES={POPULAR_CUISINES}
            customCuisineInput={customCuisineInput}
            setCustomCuisineInput={setCustomCuisineInput}
            handleToggleCuisine={handleToggleCuisine}
            handleAddCustomCuisine={handleAddCustomCuisine}
          />
        );
      case "location":
        return (
          <RestaurantLocationForm
            formData={formData}
            setFormData={setFormData}
          />
        );
      case "hours":
        return (
          <RestaurantHoursForm
            formData={formData}
            setFormData={setFormData}
            DAYS_OF_WEEK={DAYS_OF_WEEK}
            handleApplyMondayToAll={handleApplyMondayToAll}
            handleSetPresetHours={handleSetPresetHours}
            handleToggleDayClosed={handleToggleDayClosed}
          />
        );
      case "media":
        return (
          <RestaurantMediaForm
            formData={formData}
            setFormData={setFormData}
            handleAddGalleryImage={handleAddGalleryImage}
            handleRemoveGalleryImage={handleRemoveGalleryImage}
          />
        );
      case "amenities":
        return (
          <RestaurantAmenitiesForm
            formData={formData}
            availableAmenities={availableAmenities}
            handleToggleAmenity={handleToggleAmenity}
          />
        );
      case "admin":
        return isAdmin ? (
          <RestaurantAdminForm
            formData={formData}
            setFormData={setFormData}
          />
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
            variant="ghost" 
            size="icon" 
            onClick={handleBack} 
            className="rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 h-10 w-10 shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-admin-light text-admin-primary border border-admin-border">
                {isEditing ? "Edit Establishment" : "New Establishment"}
              </span>
              {formData.isVerified && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> AAHAR Verified
                </span>
              )}
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              {formData.name || (isEditing ? "Edit Restaurant" : "New Restaurant")}
            </h1>
            <p className="text-xs font-medium text-slate-500">
              {formData.city ? `${formData.area || "Area"}, ${formData.city}` : "Configure profile, menu, timings, and branding"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isAdmin && initialData?.ownerId && (
            <Button 
              type="button"
              variant="outline" 
              onClick={handleResetPassword} 
              disabled={working}
              className="rounded-xl border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 font-semibold h-10 text-xs px-4"
            >
              <KeyRound className="w-4 h-4 mr-1.5 text-amber-600" /> Reset Password
            </Button>
          )}

          {isEditing && (initialData?.slug || initialData?.id) && (
            <Link 
              href={`/p/${initialData.slug || initialData.id}`} 
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 h-10 rounded-xl transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> Live Page
            </Link>
          )}

          <Button 
            type="button" 
            onClick={() => handleSubmit()} 
            disabled={working} 
            className="bg-admin-primary hover:bg-admin-hover text-white rounded-xl h-10 px-5 font-bold shadow-md shadow-admin-primary/20 flex items-center gap-2"
          >
            {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Settings Layout: Left Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDEBAR: Settings Navigation */}
        <div className="lg:col-span-3 space-y-2 lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Settings</p>
            </div>
            <nav className="p-2 space-y-0.5">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                const isAdminItem = item.adminOnly;
                // Badge counts
                let badge: number | null = null;
                if (item.key === "cuisines") badge = formData.cuisineType?.length || 0;
                if (item.key === "amenities") badge = formData.amenities?.length || 0;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
                      isActive && !isAdminItem && "bg-slate-900 text-white shadow-sm",
                      isActive && isAdminItem && "bg-amber-600 text-white shadow-sm",
                      !isActive && !isAdminItem && "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      !isActive && isAdminItem && "text-amber-700 bg-amber-50/50 hover:bg-amber-100",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-current" : isAdminItem ? "text-amber-600" : "text-slate-400")} />
                    <span className="flex-1 truncate text-xs">{item.label}</span>
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

          {/* Live Mini-Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-admin-primary" />
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Live Preview</p>
            </div>
            <div className="p-3 space-y-2">
              {/* Cover thumbnail */}
              <div className="relative aspect-video w-full bg-slate-100 rounded-xl overflow-hidden">
                {currentCover ? (
                  <img src={currentCover} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-black truncate leading-tight drop-shadow">
                    {formData.name || "Restaurant Name"}
                  </p>
                  <p className="text-white/70 text-[10px] font-medium truncate">
                    {formData.area ? `${formData.area}, ${formData.city}` : "Area, City"}
                  </p>
                </div>
                {formData.priceRange && (
                  <div className="absolute top-2 right-2 bg-white/90 text-slate-900 text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md">
                    {formData.priceRange}
                  </div>
                )}
              </div>

              {/* Cuisine pills */}
              <div className="flex flex-wrap gap-1">
                {Array.isArray(formData.cuisineType) && formData.cuisineType.slice(0, 3).map((c: string) => (
                  <span key={c} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">{c}</span>
                ))}
                {(formData.cuisineType?.length || 0) > 3 && (
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">+{formData.cuisineType.length - 3}</span>
                )}
              </div>
            </div>
          </div>

          {/* Tips card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
            <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-slate-500" /> Tips
            </h5>
            <ul className="text-[11px] text-slate-500 space-y-1 pl-4 list-disc font-medium">
              <li>Upload a vibrant high-res cover photo.</li>
              <li>Add 3-5 specific cuisine specialties.</li>
              <li>Include Google Maps link for routing.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT: Form Panel */}
        <div className="lg:col-span-9">
          {renderPanel()}

          {/* Save Bar */}
          <div className="mt-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All edits auto-preview in sidebar
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleBack} 
                className="rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-100"
              >
                Discard
              </Button>
              <Button 
                type="button" 
                onClick={() => handleSubmit()} 
                disabled={working} 
                className="bg-admin-primary hover:bg-admin-hover text-white rounded-xl h-10 px-6 font-bold text-xs shadow-md shadow-admin-primary/20 flex items-center gap-2"
              >
                {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Changes</span>
              </Button>
            </div>
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
