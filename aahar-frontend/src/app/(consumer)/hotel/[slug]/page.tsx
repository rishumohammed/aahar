"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  MapPin,
  Star,
  Info,
  BedDouble,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Utensils,
  Users,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Building2,
  Bed
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { hotelApi, masterApi } from "@/lib/api";
import { EnquiryForm } from "@/components/shared/EnquiryForm";
import AaharBadge from "@/components/shared/AaharBadge";
import LinkedRestaurant from "@/components/profile/LinkedRestaurant";
import { CertificateWidget } from "@/components/shared/CertificateWidget";
import { cn, getImageUrl } from "@/lib/utils";
import { notFound } from "next/navigation";

export default function HotelProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [photoCategory, setPhotoCategory] = useState("all");
  const [masterAmenities, setMasterAmenities] = useState<any[]>([]);
  const [masterRoomAmenities, setMasterRoomAmenities] = useState<any[]>([]);
  const [masterPhotoCategories, setMasterPhotoCategories] = useState<any[]>([]);
  const [masterMealPlans, setMasterMealPlans] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  useEffect(() => {
    Promise.all([
      hotelApi.get(params.slug).then(res => res.data.data),
      masterApi.list("AMENITY_HOTEL").then(res => res.data?.data || []).catch(() => []),
      masterApi.list("AMENITY_ROOM").then(res => res.data?.data || []).catch(() => []),
      masterApi.list("PHOTO_CATEGORY_HOTEL").then(res => res.data?.data || []).catch(() => []),
      masterApi.list("MEAL_PLAN").then(res => res.data?.data || []).catch(() => [])
    ])
      .then(([hotelData, masterData, roomData, photoData, mealPlansData]) => {
        setHotel(hotelData);
        setMasterAmenities(masterData);
        setMasterRoomAmenities(roomData);
        setMasterPhotoCategories(photoData);
        setMasterMealPlans(mealPlansData);
      })
      .catch(() => notFound())
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <div className="p-20 text-center font-black text-aahar-rose animate-pulse uppercase tracking-widest">Loading property...</div>;
  if (!hotel) return null;

  const TABS = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "rooms", label: "Rooms", icon: BedDouble },
    { id: "photos", label: "Photos", icon: ImageIcon },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "amenities", label: "Amenities", icon: Sparkles },
  ];

  const SCORE_METRICS = hotel.certification?.application?.audit?.checklist || [
    { label: "Housekeeping Standards", score: hotel.accommodationScore?.housekeeping || 4.2 },
    { label: "Room & Guest Safety", score: hotel.accommodationScore?.roomSafety || 4.5 },
    { label: "Guest Facilities", score: hotel.accommodationScore?.guestFacilities || 3.8 },
    { label: "F&B Hygiene (In-house)", score: hotel.accommodationScore?.fnb || 4.0 },
  ];

  const roomAmenityLabelMap: Record<string, string> = {};
  masterRoomAmenities.forEach(m => {
    if (m.key && m.label) {
      roomAmenityLabelMap[m.key.toLowerCase()] = m.label;
    }
  });

  const photoCategories = masterPhotoCategories.length > 0
    ? [
      { id: "all", label: "All Photos" },
      ...masterPhotoCategories.map((m: any) => ({ id: m.key, label: m.label }))
    ]
    : [
      { id: "all", label: "All Photos" },
      { id: "rooms", label: "Rooms & Suites" },
      { id: "exterior", label: "Property Exterior" },
      { id: "lobby", label: "Lobby & Reception" },
      { id: "amenities", label: "Amenities & Facilities" },
      { id: "dining", label: "Dining Area" },
      { id: "pool", label: "Pool & Spa" }
    ];

  return (
    <div className="flex flex-col min-h-screen bg-aahar-wash pb-20">
      {/* Hero Section */}
      <section className="relative h-[350px] md:h-[450px] w-full overflow-hidden bg-slate-800 flex items-center justify-center">
        {getImageUrl(hotel.photos?.cover || hotel.image) ? (
          <Image
            src={getImageUrl(hotel.photos?.cover || hotel.image)!}
            alt={hotel.name}
            fill
            unoptimized
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <Building2 className="h-16 w-16 mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">No Image Uploaded</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-aahar-dark/90 via-aahar-dark/30 to-transparent" />

        <div className="container mx-auto max-w-7xl px-4 absolute bottom-0 left-0 right-0 pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-aahar-rose text-white border-0 px-4 py-1">{hotel.starRating} Star Property</Badge>
                <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm px-4 py-1">
                  {hotel.propertyType?.replace('_', ' ')}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-3 text-white/90 font-medium">
                <MapPin className="h-5 w-5 text-aahar-rose" />
                <span className="text-lg">{hotel.area}, {hotel.city}</span>
              </div>
            </div>

            {hotel.certification && (
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-2xl">
                <AaharBadge
                  type="accommodation"
                  status={hotel.certification.status}
                  starRating={hotel.starRating}
                  expiresAt={hotel.certification.expiresAt}
                  certNumber={hotel.certification.certNumber}
                  size="lg"
                  variant="badge"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Sub-Nav */}
      <div className="sticky top-0 z-40 bg-white border-b border-aahar-border shadow-sm">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex gap-10 overflow-x-auto no-scrollbar py-5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap px-1 group border-b-2 pb-1",
                  activeTab === tab.id
                    ? "text-aahar-rose border-aahar-rose"
                    : "text-aahar-body/60 border-transparent hover:text-aahar-rose"
                )}
              >
                <tab.icon className={cn("h-4 w-4 group-hover:scale-110 transition-transform", activeTab === tab.id ? "text-aahar-rose" : "")} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="container mx-auto max-w-7xl px-4 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-16 min-h-[600px]">

            {/* Overview Section */}
            {activeTab === "overview" && (
              <section className="space-y-16 animate-in fade-in duration-500">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-aahar-dark tracking-tight uppercase">About the Property</h2>
                  <p className="text-lg text-aahar-body leading-relaxed">
                    {hotel.description || "No description provided for this property yet."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-aahar-border pt-12">
                  {/* Left Column: Contact & Info */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-aahar-dark uppercase tracking-tight">Property Details</h3>
                    <div className="space-y-4 text-sm text-aahar-body">
                      {(hotel.checkInTime || hotel.checkOutTime) && (
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-aahar-dark">⏰ Check-In / Out:</span>
                          <span>{hotel.checkInTime || "14:00"} - {hotel.checkOutTime || "11:00"}</span>
                        </div>
                      )}
                      {hotel.phone && (
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-aahar-dark">📞 Phone:</span>
                          <span>{hotel.phone}</span>
                        </div>
                      )}
                      {hotel.email && (
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-aahar-dark">✉️ Email:</span>
                          <span>{hotel.email}</span>
                        </div>
                      )}
                      {hotel.website && (
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-aahar-dark">🌐 Website:</span>
                          <a href={hotel.website.startsWith('http') ? hotel.website : `https://${hotel.website}`} target="_blank" rel="noopener noreferrer" className="text-aahar-rose hover:underline font-bold">
                            {hotel.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Location & Coordinates */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-aahar-dark uppercase tracking-tight">Location Information</h3>
                    <div className="space-y-4 text-sm text-aahar-body">
                      <div className="flex items-start gap-3">
                        <span className="font-semibold text-aahar-dark flex-shrink-0">📍 Address:</span>
                        <span>{hotel.address || ""}{hotel.area ? `, ${hotel.area}` : ""}{hotel.city ? `, ${hotel.city}` : ""}</span>
                      </div>
                      {hotel.lat && hotel.lng && (
                        <div className="pt-4 overflow-hidden rounded-xl shadow-sm border border-slate-200">
                          <iframe
                            width="100%"
                            height="200"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://maps.google.com/maps?q=${hotel.lat},${hotel.lng}&z=15&output=embed`}
                          ></iframe>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meal plans (Moved from Dining Tab) */}
                {hotel.mealPlans?.length > 0 && (
                  <div className="space-y-6 pt-12 border-t border-aahar-border">
                    <h3 className="text-lg font-bold text-aahar-dark uppercase tracking-tight">Available Meal Plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(masterMealPlans.length > 0 ? masterMealPlans.map(m => ({
                        key: m.key,
                        label: m.label,
                        desc: "" // Master data meal plans don't have descriptions by default
                      })) : [
                        { key: "ep", label: "EP - European Plan", desc: "Room only — no meals included" },
                        { key: "cp", label: "CP - Continental Plan", desc: "Bed & Breakfast included" },
                        { key: "map", label: "MAP - Modified American", desc: "Breakfast & choice of Lunch/Dinner" },
                        { key: "ap", label: "AP - American Plan", desc: "All three major meals included" },
                        { key: "break_fast", label: "Breakfast Included", desc: "Continental/Local Breakfast menu" },
                        { key: "lunch", label: "Lunch Option Available", desc: "A la carte or Buffet Lunch service" },
                        { key: "dinner", label: "Dinner Option Available", desc: "Premium Buffet or Fine Dining Dinner" }
                      ])
                        .filter(mp => (hotel.mealPlans || []).includes(mp.key) || (hotel.mealPlans || []).includes(mp.key.toLowerCase()))
                        .map(mp => (
                          <div key={mp.key}
                            className="p-6 border-2 border-aahar-rose/10 bg-white rounded-2xl shadow-sm hover:border-aahar-rose/30 transition-all">
                            <p className="text-sm font-black text-aahar-rose uppercase tracking-tight">{mp.label}</p>
                            {mp.desc && <p className="text-xs text-aahar-body mt-2 font-medium">{mp.desc}</p>}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {hotel.cancellationPolicy && (
                  <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl space-y-3">
                    <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                      🛡️ Cancellation & Refund Policy
                    </h3>
                    <p className="text-sm text-amber-800 leading-relaxed font-medium">
                      {hotel.cancellationPolicy}
                    </p>
                  </div>
                )}

              </section>
            )}

            {/* Rooms Section */}
            {activeTab === "rooms" && (
              <section id="rooms" className="space-y-10 animate-in fade-in duration-500">
                <div className="flex items-end justify-between">
                  <h2 className="text-2xl font-bold text-aahar-dark tracking-tight uppercase">Available Room Types</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {hotel.roomTypes?.map((room: any) => (
                    <Card
                      key={room.id}
                      className={cn(
                        "overflow-hidden rounded-xl border-2 transition-all hover:shadow-xl",
                        room.isPopular ? "border-aahar-teal ring-4 ring-aahar-teal/5" : "border-aahar-border"
                      )}
                    >
                      <div className="relative h-64 bg-slate-100 flex items-center justify-center">
                        {getImageUrl(room.photos?.[0]) ? (
                          <img
                            src={getImageUrl(room.photos?.[0])!}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300">
                            <Bed className="h-10 w-10 mb-1" />
                            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">No Image Uploaded</span>
                          </div>
                        )}
                        {room.isPopular && (
                          <Badge className="absolute top-6 left-6 bg-aahar-teal text-white border-0 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">
                            Most Popular
                          </Badge>
                        )}
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-aahar-dark tracking-tight">{room.name}</h3>
                            <p className="text-sm text-aahar-body leading-relaxed line-clamp-2">{room.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                            <div>
                              <span className="text-xl font-black text-aahar-teal">₹{room.priceFrom ?? room.pricePerNight ?? room.price ?? 0}</span>
                              <span className="text-[10px] text-aahar-body/50 block font-semibold">/ night</span>
                            </div>
                            <Button 
                              onClick={() => {
                                setSelectedRoomId(room.id);
                                document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="bg-aahar-teal hover:bg-aahar-teal/90 text-white font-bold h-8 text-xs px-6 rounded-full"
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs font-bold text-aahar-body">
                          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <BedDouble className="h-3.5 w-3.5 text-aahar-teal" />
                            <span>{room.bedConfig}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <Users className="h-3.5 w-3.5 text-aahar-teal" />
                            <span>Max {room.maxOccupancy} Adults</span>
                          </div>
                          {room.maxChildren > 0 && (
                            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                              <span>👶 {room.maxChildren} Children</span>
                            </div>
                          )}
                          {room.totalRooms > 0 && (
                            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                              <span>🏢 {room.totalRooms} Rooms</span>
                            </div>
                          )}
                        </div>
                        {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100">
                            {room.amenities.map((am: string) => (
                              <span key={am} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                                {roomAmenityLabelMap[am.toLowerCase()] || am.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Photos Section */}
            {activeTab === "photos" && (
              <div className="py-4 animate-in fade-in duration-500">
                <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
                  {photoCategories.map(({ id, label }) => {
                    const count = id === "all"
                      ? Object.values(hotel.photos ?? {}).flat().length
                      : (hotel.photos as any)?.[id]?.length ?? 0;
                    if (id !== "all" && count === 0) return null;
                    return (
                      <button key={id}
                        onClick={() => setPhotoCategory(id)}
                        className={cn(
                          "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                          photoCategory === id
                            ? "bg-aahar-dark text-white shadow-xl"
                            : "bg-white text-aahar-body border border-aahar-border hover:bg-aahar-wash"
                        )}>
                        {label}
                        {count > 0 && (
                          <span className="ml-2 opacity-50">({count})</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {(() => {
                  const photos = photoCategory === "all"
                    ? Object.values(hotel.photos ?? {}).flat() as string[]
                    : hotel.photos?.[photoCategory] ?? [];

                  if (!photos.length) {
                    return (
                      <div className="text-center py-20 bg-aahar-wash/30 rounded-xl border-2 border-dashed border-aahar-border">
                        <ImageIcon className="h-10 w-10 text-aahar-body/20 mx-auto mb-4" />
                        <p className="text-aahar-body font-bold">No photos available yet.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map((url: string, i: number) => (
                        <div key={i} className="aspect-video rounded-xl overflow-hidden border border-aahar-border shadow-sm hover:shadow-lg transition-all group">
                          <img src={url} alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Reviews Section */}
            {activeTab === "reviews" && (
              <div className="py-4 animate-in fade-in duration-500">
                <div className="p-20 text-center bg-aahar-wash/30 rounded-xl border-2 border-dashed border-aahar-border">
                  <MessageSquare className="h-10 w-10 text-aahar-body/20 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-aahar-dark">Guest Experiences</h3>
                  <p className="text-sm text-aahar-body font-medium mt-2">Verified reviews coming soon via AAHAR Guest Connect.</p>
                </div>
              </div>
            )}

            {/* Amenities Section */}
            {activeTab === "amenities" && (
              <div className="py-4 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(masterAmenities.length > 0
                    ? masterAmenities.map(m => {
                      const amenityIconMap: Record<string, string> = {
                        pool: "🏊",
                        spa: "💆",
                        gym: "🏋️",
                        beach: "🏖️",
                        kidsclub: "🎠",
                        kids_club: "🎠",
                        conference: "🏢",
                        restaurant: "🍽️",
                        airporttransfer: "🚐",
                        airport_transfer: "🚐",
                        parking: "🅿️",
                        evcharging: "⚡",
                        ev_charging: "⚡",
                        wifi: "📶",
                        petfriendly: "🐾",
                        pet_friendly: "🐾",
                        accessible: "♿",
                        smokingarea: "🚬",
                        smoking_area: "🚬"
                      };
                      return {
                        key: m.key,
                        label: m.label,
                        icon: m.icon || amenityIconMap[m.key.toLowerCase()] || amenityIconMap[m.key.replace(/_/g, "")] || "✨"
                      };
                    })
                    : [
                      { key: "pool", icon: "🏊", label: "Swimming pool" },
                      { key: "spa", icon: "💆", label: "Spa & wellness" },
                      { key: "gym", icon: "🏋️", label: "Fitness centre" },
                      { key: "beach", icon: "🏖️", label: "Beach access" },
                      { key: "kidsClub", icon: "🎠", label: "Kids club" },
                      { key: "conference", icon: "🏢", label: "Conference room" },
                      { key: "restaurant", icon: "🍽️", label: "In-house restaurant" },
                      { key: "airportTransfer", icon: "🚐", label: "Airport transfer" },
                      { key: "parking", icon: "🅿️", label: "Free parking" },
                      { key: "evCharging", icon: "⚡", label: "EV charging" },
                      { key: "wifi", icon: "📶", label: "Free WiFi" },
                      { key: "petFriendly", icon: "🐾", label: "Pet friendly" },
                      { key: "accessible", icon: "♿", label: "Accessible rooms" },
                      { key: "smokingArea", icon: "🚬", label: "Smoking area" },
                    ]
                  ).filter(({ key }) => !!(
                    hotel.amenities?.[key] ||
                    hotel.amenities?.[key.toLowerCase()] ||
                    hotel.amenities?.[key.replace(/_/g, "")] ||
                    hotel.amenities?.[key.toLowerCase().replace(/_/g, "")]
                  )).map(({ key, icon, label }) => {
                    return (
                      <div key={key} className="flex items-center gap-4 p-5 rounded-2xl border-2 border-emerald-100 bg-white shadow-sm transition-all">
                        <span className="text-2xl">{icon}</span>
                        <span className="font-bold text-aahar-dark capitalize text-sm">{label}</span>
                        <div className="ml-auto flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}



          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-10">

            {/* Enquiry Form Widget */}
            <EnquiryForm
              hotelId={hotel.id}
              hotelSlug={hotel.slug}
              roomTypes={hotel.roomTypes?.map((rt: any) => ({ id: rt.id, name: rt.name })) || []}
              defaultRoomType={selectedRoomId}
            />

            {/* AAHAR Certification Side Widget */}
            {hotel.certification && (
              <CertificateWidget certification={hotel.certification} mode="consumer" />
            )}

          </aside>

        </div>
      </main>
    </div>
  );
}
