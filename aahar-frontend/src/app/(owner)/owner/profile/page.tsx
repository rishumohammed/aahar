"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { restaurantApi, hotelApi, uploadApi, applicationApi, masterApi } from "@/lib/api";
import RestaurantForm from "@/components/forms/RestaurantForm";
import HotelForm from "@/components/forms/HotelForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { 
  Loader2, 
  MapPin, 
  Phone, 
  Clock, 
  UtensilsCrossed, 
  Building2,
  Edit2, 
  Power, 
  CheckCircle, 
  AlertTriangle,
  Camera,
  Send
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getImageUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function OwnerProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [establishment, setEstablishment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [masterRoomAmenities, setMasterRoomAmenities] = useState<any[]>([]);
  const [masterDietary, setMasterDietary] = useState<any[]>([]);

  const fetchEstablishment = async () => {
    if (!user?.id) return;
    try {
      const [restRes, hotelRes] = await Promise.all([
        restaurantApi.list({ ownerId: user.id, all: "true" }),
        hotelApi.list({ ownerId: user.id, all: "true" })
      ]);

      const rest = restRes.data?.data?.items?.[0] || restRes.data?.data?.[0];
      const hotel = hotelRes.data?.data?.items?.[0] || hotelRes.data?.data?.[0];

      if (rest) {
        setEstablishment({ ...rest, type: "restaurant" });
      } else if (hotel) {
        setEstablishment({ ...hotel, type: "hotel" });
      } else {
        setEstablishment(null);
      }
    } catch (err) {
      console.error("Failed to fetch owner establishment:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstablishment();
    masterApi.list("AMENITY_ROOM")
      .then(res => setMasterRoomAmenities(res.data?.data || []))
      .catch(console.error);
    masterApi.list("DIETARY")
      .then(res => setMasterDietary(res.data?.data || []))
      .catch(console.error);
  }, [user]);

  const dietaryMap: Record<string, string> = {};
  masterDietary.forEach(m => { if (m.key && m.label) dietaryMap[m.key] = m.label; });

  const toggleStatus = async () => {
    if (!establishment) return;
    setUpdatingStatus(true);
    try {
      const newStatus = !establishment.isActive;
      if (establishment.type === "restaurant") {
        await restaurantApi.update(establishment.id, { isActive: newStatus });
      } else {
        await hotelApi.update(establishment.id, { isActive: newStatus });
      }
      setEstablishment((prev: any) => ({ ...prev, isActive: newStatus }));
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to change establishment status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !establishment) return;
    setUploadingCover(true);
    try {
      const res = await uploadApi.singlePhoto(file);
      const imageUrl = res.data?.data?.url || res.data?.url;
      if (!imageUrl) throw new Error("No image URL returned from server");

      if (establishment.type === "restaurant") {
        await restaurantApi.update(establishment.id, { 
          photos: { ...(establishment.photos || {}), cover: imageUrl } 
        });
      } else {
        await hotelApi.update(establishment.id, { 
          photos: { ...(establishment.photos || {}), cover: imageUrl } 
        });
      }

      setEstablishment((prev: any) => ({ 
        ...prev, 
        image: imageUrl,
        photos: { ...(prev?.photos || {}), cover: imageUrl }
      }));
    } catch (err: any) {
      console.error("Cover upload failed", err);
      toast.error(err.message || "Failed to upload cover photo");
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-admin-primary mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Loading profile details...</p>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <Card className="p-12 space-y-4 bg-slate-50 border-slate-200">
          <Building2 className="h-12 w-12 text-slate-400 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800">No Establishment Associated</h2>
          <p className="text-slate-500 max-w-md mx-auto">Your owner account is approved, but no linked restaurant or hotel establishment was found. Please contact support or complete onboarding.</p>
        </Card>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Edit {establishment.type === "restaurant" ? "Restaurant" : "Hotel"} Profile</h1>
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel Editing</Button>
        </div>
        {establishment.type === "restaurant" ? (
          <RestaurantForm initialData={establishment} isEditing={true} isOwnerPortal={true} onSuccess={() => { fetchEstablishment(); setIsEditing(true); }} onCancel={() => setIsEditing(false)} />
        ) : (
          <HotelForm initialData={establishment} isEditing={true} isOwnerPortal={true} onSuccess={() => { fetchEstablishment(); setIsEditing(true); }} onCancel={() => setIsEditing(false)} />
        )}
      </div>
    );
  }

  const coverImage = establishment.image || establishment.photos?.cover || "";
  const amenitiesList = Array.isArray(establishment.amenities)
    ? establishment.amenities
    : (typeof establishment.amenities === "object" && establishment.amenities !== null)
      ? Object.keys(establishment.amenities).filter(k => (establishment.amenities as any)[k])
      : [];

  const roomAmenityLabelMap: Record<string, string> = {};
  masterRoomAmenities.forEach(m => {
    if (m.key && m.label) {
      roomAmenityLabelMap[m.key.toLowerCase()] = m.label;
    }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight capitalize">
            {establishment.type === "restaurant" ? "Restaurant Profile" : "Hotel Profile"}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage your public storefront identity and operating status.</p>
        </div>
        <div className="flex items-center gap-3">
          {!establishment.isVerified && (!establishment.applications?.[0]?.status || establishment.applications[0].status === "draft") && (
            <Button 
              onClick={async () => {
                try {
                  await applicationApi.submit({
                    businessType: establishment.type === "hotel" ? "accommodation" : "fnb",
                    ...(establishment.type === "restaurant" ? { restaurantId: establishment.id } : { hotelId: establishment.id }),
                    status: "submitted"
                  });
                  toast.success("Submitted for verification successfully!");
                  fetchEstablishment();
                } catch (e: any) {
                  toast.error(e.response?.data?.message || "Failed to submit for verification");
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-md px-6 shadow-md transition-all font-semibold"
            >
              <Send className="h-4 w-4 mr-2" /> Submit for Verification
            </Button>
          )}
          <Button 
            onClick={toggleStatus} 
            disabled={updatingStatus}
            variant={establishment.isActive ? "outline" : "default"}
            className={cn(
              "rounded-md px-6 shadow-sm transition-all font-semibold",
              !establishment.isActive 
                ? "bg-amber-500 hover:bg-amber-600 text-white border-0" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
            )}
          >
            {updatingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Power className="h-4 w-4 mr-2" />
            )}
            {establishment.isActive ? "Mark as Temporarily Closed" : "Re-open Establishment"}
          </Button>
          <Button 
            onClick={() => setIsEditing(true)} 
            className="bg-admin-primary hover:bg-admin-primary-hover text-white rounded-md px-6 shadow-md transition-all font-semibold"
          >
            <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-0 bg-white shadow-xl overflow-hidden relative">
        {/* Banner Image */}
        <div className="h-80 w-full relative group bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
          {getImageUrl(coverImage) ? (
            <img src={getImageUrl(coverImage)!} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 opacity-60">
              {establishment.type === "restaurant" ? (
                <UtensilsCrossed className="h-16 w-16 mb-2" />
              ) : (
                <Building2 className="h-16 w-16 mb-2" />
              )}
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">No Cover Photo Set</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          
          <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
            <Badge className={cn(
              "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-0 shadow-lg",
              establishment.isActive ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
            )}>
              {establishment.isActive ? "Open & Active" : "Temporarily Closed"}
            </Badge>

            <Badge className={cn(
              "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-0 shadow-lg",
              establishment.isVerified 
                ? "bg-emerald-600 text-white" 
                : (establishment.applications?.[0]?.status && establishment.applications[0].status !== "draft")
                  ? "bg-amber-600 text-white shadow-amber-600/30"
                  : "bg-slate-700 text-white"
            )}>
              {establishment.isVerified 
                ? "Verified" 
                : (establishment.applications?.[0]?.status && establishment.applications[0].status !== "draft")
                  ? "Submitted for Verification"
                  : "Unverified"}
            </Badge>

            {establishment.starRating > 0 && (
              <Badge className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-amber-500 text-white border-0 shadow-lg flex items-center gap-1">
                ★ {establishment.starRating} Star
              </Badge>
            )}
          </div>

          {/* Facebook-Style Add/Edit Cover Photo Button */}
          <div className="absolute top-6 right-6 z-20">
            <label className="cursor-pointer bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 shadow-xl transition-all hover:scale-105 active:scale-95">
              {uploadingCover ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 text-white" />
                  <span>{coverImage ? "Edit Cover Photo" : "Add Cover Photo"}</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleCoverUpload}
                disabled={uploadingCover}
              />
            </label>
          </div>

          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10">
            <div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">{establishment.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
                {establishment.type === "restaurant" && establishment.cuisineType?.length > 0 && (
                  <span className="flex items-center gap-1.5"><UtensilsCrossed className="h-4 w-4 text-aahar-amber" /> {establishment.cuisineType.join(", ")}</span>
                )}
                {establishment.type === "hotel" && establishment.propertyType && (
                  <span className="flex items-center gap-1.5 capitalize"><Building2 className="h-4 w-4 text-aahar-teal" /> {establishment.propertyType.replace(/_/g, " ")}</span>
                )}
                
                {(establishment.cuisineType?.length > 0 || establishment.propertyType) && (establishment.area || establishment.city) && (
                  <span>•</span>
                )}

                {(establishment.area || establishment.city) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-rose-400" /> 
                    {[establishment.area, establishment.city].filter(Boolean).join(", ")}
                  </span>
                )}

                {establishment.dietary && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 uppercase tracking-wider text-xs font-bold bg-white/20 px-2 py-0.5 rounded">{dietaryMap[establishment.dietary] || establishment.dietary}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Property Details Card */}
            {establishment.type === "hotel" && (
              <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 space-y-4 shadow-2xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4.5 w-4.5 text-aahar-teal" /> Property Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Star Rating</p>
                    <p className="text-sm font-bold text-slate-800">{establishment.starRating ? `${establishment.starRating} Star` : "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Property Type</p>
                    <p className="text-sm font-bold text-slate-800 capitalize">{establishment.propertyType?.replace(/_/g, ' ') || "Hotel"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Check-In / Out</p>
                    <p className="text-sm font-bold text-slate-800">{establishment.checkInTime || "14:00"} - {establishment.checkOutTime || "11:00"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* About Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>About the Establishment</span>
              </h4>
              <p className="text-slate-700 leading-relaxed font-medium text-base bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                {establishment.description || "No description provided. Click Edit Profile to add a compelling description for your customers."}
              </p>
            </div>

            {/* Room Types (for Hotels) */}
            {establishment.type === "hotel" && Array.isArray(establishment.roomTypes) && establishment.roomTypes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Room Types & Pricing</h4>
                  <Badge variant="secondary" className="text-[10px] font-bold bg-slate-100 text-slate-700">
                    {establishment.roomTypes.length} Room Types
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {establishment.roomTypes.map((room: any, idx: number) => (
                    <div key={room.id || idx} className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-sm space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900 text-base">{room.name}</h5>
                          <span className="text-xs font-semibold text-slate-500 capitalize">{room.bedType?.replace(/_/g, " ") || "Standard Bed"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-aahar-teal">₹{room.priceFrom ?? room.pricePerNight ?? room.price ?? 0}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">/ night</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                        <span>👥 Max: {room.maxOccupancy || 2} Adults</span>
                        {room.maxChildren > 0 && <span>👶 {room.maxChildren} Children</span>}
                      </div>
                      {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {room.amenities.map((am: string) => (
                            <span key={am} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md capitalize">
                              {roomAmenityLabelMap[am.toLowerCase()] || am.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Meal Plans (for Hotels) */}
            {establishment.type === "hotel" && Array.isArray(establishment.mealPlans) && establishment.mealPlans.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Meal Plans</h4>
                <div className="flex flex-wrap gap-2">
                  {establishment.mealPlans.map((plan: string) => (
                    <span key={plan} className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl capitalize flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {plan.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Operating Amenities */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Operating Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.length > 0 ? amenitiesList.map((am: any) => (
                  <Badge key={typeof am === "string" ? am : am.key || JSON.stringify(am)} variant="outline" className="px-3.5 py-1.5 border-slate-200 text-slate-700 font-semibold bg-slate-50/80 capitalize rounded-xl">
                    {typeof am === "string" ? am.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim() : am.label || am.key}
                  </Badge>
                )) : (
                  <span className="text-sm text-slate-400 font-medium italic">No amenities specified.</span>
                )}
              </div>
            </div>

            {/* Cancellation & Refund Policy */}
            {establishment.cancellationPolicy && (
              <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                  <span>Cancellation & Refund Policy</span>
                </h4>
                <p className="text-sm text-amber-900 font-medium leading-relaxed">
                  {establishment.cancellationPolicy}
                </p>
              </div>
            )}

            {/* Photo Gallery Section */}
            {establishment.photos && typeof establishment.photos === 'object' && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Photo Gallery</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(establishment.photos)
                    .filter(([key, val]) => key !== 'logo' && key !== 'cover' && (Array.isArray(val) ? val.length > 0 : !!val))
                    .flatMap(([catKey, val]) => {
                      const list = Array.isArray(val) ? val : [val];
                      return list.map((url: string, i: number) => ({ url, catKey, id: `${catKey}-${i}` }));
                    })
                    .slice(0, 6)
                    .map((item: any) => (
                      <div key={item.id} className="relative aspect-4/3 rounded-xl overflow-hidden group bg-slate-100 border border-slate-200/60 shadow-xs">
                        <img src={getImageUrl(item.url)!} alt={item.catKey} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {item.catKey.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8 border-l border-slate-100 pl-0 lg:pl-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact & Address</h4>
              <div className="space-y-3.5 bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Phone</span>
                    <span className="text-sm font-bold text-slate-800">{establishment.phone || "Not provided"}</span>
                  </div>
                </div>
                {establishment.email && (
                  <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60">
                    <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase">Email</span>
                      <span className="text-sm font-semibold text-slate-800">{establishment.email}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Full Address</span>
                    <span className="text-sm font-medium text-slate-700 leading-snug block mt-0.5">{establishment.address || "Address not provided"}</span>
                  </div>
                </div>
                {establishment.googleLocationLink && (
                  <div className="pt-2">
                    <a 
                      href={establishment.googleLocationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-aahar-teal hover:underline flex items-center gap-1"
                    >
                      <span>View on Google Maps</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {establishment.type === "hotel" ? "Check-In & Check-Out" : "Operating Hours"}
              </h4>
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 flex items-start gap-3">
                <Clock className="h-5 w-5 text-aahar-teal mt-0.5 shrink-0" />
                <div className="space-y-1">
                  {establishment.type === "hotel" ? (
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase block">Timing Schedule</span>
                      <span className="text-sm font-extrabold text-slate-800 block mt-1">
                        Check-In: <span className="text-emerald-700">{establishment.checkInTime || "14:00"}</span>
                      </span>
                      <span className="text-sm font-extrabold text-slate-800 block">
                        Check-Out: <span className="text-rose-700">{establishment.checkOutTime || "11:00"}</span>
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-slate-800 block">
                        {establishment.openingHours?.[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()] 
                          || (typeof establishment.openingHours === 'string' ? establishment.openingHours : null)
                          || "Not configured"}
                      </span>
                      {establishment.isActive && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm uppercase tracking-wider">Open Now</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
