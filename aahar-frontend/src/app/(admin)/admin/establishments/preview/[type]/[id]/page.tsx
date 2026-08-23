"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { restaurantApi, hotelApi, adminApi, masterApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Utensils, 
  Hotel, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  FileText,
  Bed,
  Sparkles,
  ShieldCheck,
  CalendarDays,
  UtensilsCrossed
} from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";

export default function EstablishmentPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string; // 'restaurant' | 'hotel'
  const id = params.id as string;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [masterCategories, setMasterCategories] = useState<any[]>([]);
  const [masterMealPlans, setMasterMealPlans] = useState<any[]>([]);
  const [masterRoomAmenities, setMasterRoomAmenities] = useState<any[]>([]);
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res;
        if (type === "restaurant") {
          res = await restaurantApi.get(id);
        } else if (type === "hotel") {
          res = await hotelApi.get(id);
        } else {
          throw new Error("Invalid establishment type");
        }
        setItem(res?.data?.data);
      } catch (err) {
        console.error("Failed to load details:", err);
        alert("Failed to load establishment details.");
      } finally {
        setLoading(false);
      }
    };

    // Load Master Data for Photo Categories & Meal Plans
    const masterType = type === "hotel" ? "PHOTO_CATEGORY_HOTEL" : "PHOTO_CATEGORY_RESTAURANT";
    masterApi.list(masterType)
      .then(res => setMasterCategories(res.data?.data || []))
      .catch(console.error);

    if (type === "hotel") {
      masterApi.list("MEAL_PLAN")
        .then(res => setMasterMealPlans(res.data?.data || []))
        .catch(console.error);

      masterApi.list("AMENITY_ROOM")
        .then(res => setMasterRoomAmenities(res.data?.data || []))
        .catch(console.error);
    }

    if (id && type) fetchData();
  }, [id, type]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-admin-primary animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading comprehensive profile...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-slate-800">Establishment Not Found</h2>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    );
  }

  // Map master categories to readable labels
  const categoryLabelMap: Record<string, string> = {
    rooms: "Rooms & Suites",
    exterior: "Property Exterior",
    lobby: "Lobby & Reception",
    amenities: "Amenities & Facilities",
    dining: "Dining Area",
    pool: "Pool & Spa",
    kitchen: "Kitchen",
    interior: "Interior",
    counter: "Counter & Bar",
    restroom: "Restroom",
    food: "Food & Dishes"
  };

  masterCategories.forEach(m => {
    if (m.key && m.label) {
      categoryLabelMap[m.key] = m.label;
    }
  });

  // Map master meal plans dynamically
  const mealPlanLabelMap: Record<string, string> = {};
  masterMealPlans.forEach(m => {
    if (m.key && m.label) {
      mealPlanLabelMap[m.key.toLowerCase()] = m.label;
      mealPlanLabelMap[m.key.toUpperCase()] = m.label;
    }
  });

  // Map master room amenities
  const roomAmenityLabelMap: Record<string, string> = {};
  masterRoomAmenities.forEach(m => {
    if (m.key && m.label) {
      roomAmenityLabelMap[m.key.toLowerCase()] = m.label;
    }
  });

  // Extract cover image
  const getCoverImage = () => {
    let cover = item.image || item.photos?.cover || "";
    if (!cover && item.photos && typeof item.photos === "object") {
      const keys = Object.keys(item.photos).filter(k => k !== "cover");
      for (const k of keys) {
        if (Array.isArray(item.photos[k]) && item.photos[k].length > 0) {
          cover = item.photos[k][0];
          break;
        }
      }
    }
    return getImageUrl(cover);
  };

  // Group photos category wise
  const getCategorizedPhotos = () => {
    const grouped: { key: string; label: string; photos: string[] }[] = [];
    const photosObj = item.photos || {};

    if (typeof photosObj === "object" && photosObj !== null) {
      Object.keys(photosObj).forEach(catKey => {
        if (catKey === "cover") return;
        const list = photosObj[catKey];
        if (Array.isArray(list) && list.length > 0) {
          const label = categoryLabelMap[catKey] || catKey.replace(/_/g, ' ').toUpperCase();
          const parsedUrls = list.map(url => getImageUrl(url)).filter(Boolean);
          if (parsedUrls.length > 0) {
            grouped.push({
              key: catKey,
              label,
              photos: parsedUrls
            });
          }
        }
      });
    }

    // Fallback for legacy item.images array if no category-wise photos exist
    if (grouped.length === 0) {
      let legacyImgs: string[] = [];
      if (Array.isArray(item.images)) legacyImgs = item.images;
      else if (typeof item.images === "string") {
        try { legacyImgs = JSON.parse(item.images); } catch {}
      }
      if (legacyImgs.length > 0) {
        grouped.push({
          key: "general",
          label: "General Photos",
          photos: legacyImgs.map(url => getImageUrl(url)).filter(Boolean)
        });
      }
    }

    return grouped;
  };

  const coverUrl = getCoverImage();
  const categorizedPhotos = getCategorizedPhotos();
  const totalPhotosCount = categorizedPhotos.reduce((sum, cat) => sum + cat.photos.length, 0);

  const visibleCategorizedPhotos = selectedPhotoCategory === "all"
    ? categorizedPhotos
    : categorizedPhotos.filter(cat => cat.key === selectedPhotoCategory);

  // Extract amenities list
  const amenitiesList = Array.isArray(item.amenities)
    ? item.amenities
    : (typeof item.amenities === "object" && item.amenities !== null)
      ? Object.keys(item.amenities).filter(k => (item.amenities as any)[k])
      : [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="text-slate-500 hover:text-admin-primary flex items-center gap-2 px-0 hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        {/* Cover Image Header */}
        <div className="h-64 md:h-80 w-full relative bg-slate-800">
          {coverUrl ? (
            <img src={coverUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
              <Building2Icon className="h-16 w-16 text-slate-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
          
          <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 right-6">
            <div className="flex items-center gap-3 mb-3">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md", 
                type === "restaurant" ? "bg-amber-500/20 text-amber-300 border border-amber-400/30" : "bg-blue-500/20 text-blue-300 border border-blue-400/30"
              )}>
                {type}
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5", 
                item.isVerified ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-slate-500/50 text-slate-200 border border-slate-400/30"
              )}>
                {item.isVerified ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {item.isVerified ? "Certified" : "Unverified"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">{item.name}</h1>
            <p className="text-slate-200 flex items-center gap-2 text-sm md:text-base">
              <MapPin className="h-4 w-4" /> {item.area ? `${item.area}, ` : ""}{item.city}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-admin-primary" /> About
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {item.description || "No description provided."}
              </p>
            </div>

            {/* Type Specific Details */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-6">
              <h3 className="text-md font-semibold text-slate-800 flex items-center gap-2">
                {type === "restaurant" ? <Utensils className="h-4 w-4 text-admin-primary" /> : <Hotel className="h-4 w-4 text-admin-primary" />}
                {type === "restaurant" ? "Dining Details" : "Property Details"}
              </h3>
              
              {type === "restaurant" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                  {!!item.cuisineType && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cuisine</p>
                      <p className="text-sm font-medium text-slate-800">{Array.isArray(item.cuisineType) ? item.cuisineType.join(", ") : item.cuisineType}</p>
                    </div>
                  )}
                  {!!item.dietary && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dietary</p>
                      <p className="text-sm font-medium text-slate-800 capitalize">{item.dietary.replace(/_/g, ' ')}</p>
                    </div>
                  )}
                  {!!item.priceRange && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Price Range</p>
                      <p className="text-sm font-medium text-slate-800">{item.priceRange}</p>
                    </div>
                  )}
                  {!!item.category && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                      <p className="text-sm font-medium text-slate-800 capitalize">{item.category.replace(/_/g, ' ')}</p>
                    </div>
                  )}
                  {!!item.fssaiNo && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">FSSAI Number</p>
                      <p className="text-sm font-medium text-slate-800">{item.fssaiNo}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                  {!!item.starRating && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Star Rating</p>
                      <p className="text-sm font-medium text-slate-800">{item.starRating} Star</p>
                    </div>
                  )}
                  {!!item.propertyType && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Property Type</p>
                      <p className="text-sm font-medium text-slate-800 capitalize">{item.propertyType.replace(/_/g, ' ')}</p>
                    </div>
                  )}
                  {(item.checkInTime || item.checkOutTime) && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Check-In / Out</p>
                      <p className="text-sm font-medium text-slate-800">{item.checkInTime || "14:00"} - {item.checkOutTime || "11:00"}</p>
                    </div>
                  )}
                  {item.mealPlans && item.mealPlans.length > 0 && (
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Supported Meal Plans</p>
                      <div className="flex flex-wrap gap-2">
                        {item.mealPlans.map((planKey: string) => {
                          const lowerKey = planKey.toLowerCase();
                          const label = mealPlanLabelMap[lowerKey] || planKey.toUpperCase();
                          return (
                            <span key={planKey} className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1 rounded-md shadow-2xs flex items-center gap-1.5">
                              <UtensilsCrossed className="h-3 w-3 text-admin-primary" />
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Separate Card for Cancellation Policy */}
            {type === "hotel" && item.cancellationPolicy && (
              <div className="bg-amber-50/60 rounded-xl p-5 border border-amber-200/80 space-y-2">
                <h3 className="text-md font-semibold text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-600" /> Cancellation & Refund Policy
                </h3>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {item.cancellationPolicy}
                </p>
              </div>
            )}

            {/* Room Types Section (Hotel only) */}
            {type === "hotel" && (
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Bed className="h-5 w-5 text-admin-primary" /> Room Types ({item.roomTypes?.length || 0})
                </h3>
                {item.roomTypes && item.roomTypes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.roomTypes.map((room: any, index: number) => (
                      <div key={room.id || index} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-800">{room.name}</h4>
                          <span className="text-sm font-bold text-emerald-600">₹{room.priceFrom || 0} / night</span>
                        </div>
                        {room.description && <p className="text-xs text-slate-500 line-clamp-2">{room.description}</p>}
                        <div className="flex flex-wrap gap-2 pt-1 text-2xs text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">🛏 {room.bedConfig || "Standard"}</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">👥 Max {room.maxOccupancy || 2} Guests</span>
                          {room.totalRooms && <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">🏢 {room.totalRooms} Rooms</span>}
                        </div>
                        {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                            {room.amenities.map((am: string) => (
                              <span key={am} className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                                ✨ {roomAmenityLabelMap[am.toLowerCase()] || am.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg border border-slate-100">No room types added yet by hotel owner.</p>
                )}
              </div>
            )}

            {/* Amenities Section */}
            {amenitiesList.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-admin-primary" /> Amenities & Facilities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((a: string) => (
                    <span key={a} className="bg-admin-primary/10 text-admin-primary text-xs font-semibold px-3 py-1.5 rounded-full capitalize border border-admin-primary/20">
                      ✓ {a.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category-Wise Photo Gallery Section */}
            {totalPhotosCount > 0 && (
              <div className="space-y-6 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-admin-primary" /> Photo Gallery ({totalPhotosCount})
                  </h3>

                  {/* Category Filter Pills */}
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button
                      onClick={() => setSelectedPhotoCategory("all")}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                        selectedPhotoCategory === "all" 
                          ? "bg-admin-primary text-white border-admin-primary shadow-2xs" 
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      )}
                    >
                      All Categories ({totalPhotosCount})
                    </button>
                    {categorizedPhotos.map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedPhotoCategory(cat.key)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border",
                          selectedPhotoCategory === cat.key 
                            ? "bg-admin-primary text-white border-admin-primary shadow-2xs" 
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        )}
                      >
                        <span>{cat.label}</span>
                        <span className={cn(
                          "px-1.5 py-0.2 rounded-full text-[10px]", 
                          selectedPhotoCategory === cat.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                        )}>
                          {cat.photos.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categorized Photo Blocks */}
                <div className="space-y-6">
                  {visibleCategorizedPhotos.map(catGroup => (
                    <div key={catGroup.key} className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-admin-primary"></span>
                          {catGroup.label}
                        </h4>
                        <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                          {catGroup.photos.length} {catGroup.photos.length === 1 ? 'photo' : 'photos'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                        {catGroup.photos.map((img: string, idx: number) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-white border border-slate-200 shadow-2xs group relative">
                            <img 
                              src={img} 
                              alt={`${catGroup.label} photo ${idx + 1}`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-950/20 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Platform Status</p>
              <div className="flex items-center gap-3">
                <div className={cn("h-3 w-3 rounded-full", item.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]")} />
                <span className="font-semibold text-slate-800">{item.isActive ? "Active Listing" : "Inactive Listing"}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Registered on {new Date(item.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Contact Card */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 className="font-semibold text-slate-800">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600">{item.phone || "No phone provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600">{item.email || "No email provided"}</span>
                </div>
                {item.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                    <a href={item.website} target="_blank" rel="noreferrer" className="text-admin-primary hover:underline truncate">
                      {item.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Location Card */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 className="font-semibold text-slate-800">Location</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="font-medium text-slate-800">{item.name}</p>
                <p>{item.address}</p>
                <p>{item.area ? `${item.area}, ` : ""}{item.city}</p>
                <p>{item.state} {item.pincode ? `- ${item.pincode}` : ""}</p>
                <p>{item.country || "India"}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-3">
              {!item.isVerified && (
                <Button 
                  onClick={async () => {
                    try {
                      await adminApi.verifyEstablishment(type as any, id);
                      toast.success("Establishment verified and listed successfully!");
                      setItem({ ...item, isVerified: true });
                    } catch (err) {
                      toast.error("Failed to verify establishment");
                    }
                  }} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify & List Publicly
                </Button>
              )}
              <Button onClick={() => router.push(`/admin/establishments/${type}s/${id}`)} className="w-full bg-admin-primary hover:bg-admin-hover text-white">
                Edit Establishment
              </Button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

function Building2Icon(props: any) {
  return <Hotel {...props} />;
}
