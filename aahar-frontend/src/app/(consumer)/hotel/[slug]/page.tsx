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
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { hotelApi } from "@/lib/api";
import { EnquiryForm } from "@/components/shared/EnquiryForm";
import AaharBadge from "@/components/shared/AaharBadge";
import LinkedRestaurant from "@/components/profile/LinkedRestaurant";
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

  useEffect(() => {
    hotelApi.get(params.slug)
      .then(res => setHotel(res.data.data))
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
    { id: "dining", label: "Dining", icon: Utensils },
  ];

  const SCORE_METRICS = hotel.certification?.application?.audit?.checklist || [
    { label: "Housekeeping Standards", score: hotel.accommodationScore?.housekeeping || 4.2 },
    { label: "Room & Guest Safety", score: hotel.accommodationScore?.roomSafety || 4.5 },
    { label: "Guest Facilities", score: hotel.accommodationScore?.guestFacilities || 3.8 },
    { label: "F&B Hygiene (In-house)", score: hotel.accommodationScore?.fnb || 4.0 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-aahar-wash pb-20">
      {/* Hero Section */}
      <section className="relative h-[550px] w-full overflow-hidden">
        <Image
          src={getImageUrl(hotel.photos?.cover || hotel.image) || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"}
          alt={hotel.name}
          fill
          unoptimized
          className="object-cover"
          priority
        />
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
                    {hotel.description || "Indulge in unparalleled luxury at this AAHAR verified property. Each room is designed with the highest standards of safety and comfort."}
                  </p>
                </div>

                {/* AAHAR Accommodation Score */}
                {hotel.certification ? (
                  <div className="bg-white rounded-xl p-12 border-2 border-aahar-border shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-aahar-rose/5 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative z-10">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-aahar-dark tracking-tight uppercase">Trust Score</h2>
                        <p className="text-sm text-aahar-body font-medium">Verified by AAHAR Regional Inspectors</p>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-aahar-rose/10 rounded-xl border border-aahar-rose/20">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-aahar-rose">{hotel.accommodationScore?.overall ? hotel.accommodationScore.overall.toFixed(1) : (hotel.starRating || "4.0")}</div>
                          <div className="text-[10px] uppercase font-black text-aahar-rose tracking-widest">Trust Index</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 relative z-10">
                      {SCORE_METRICS.map((metric: any) => (
                        <div key={metric.label || metric.section} className="space-y-4">
                          <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest">
                            <span className="text-aahar-dark">{metric.label || metric.section || metric.criterion}</span>
                            <span className="text-aahar-rose">{metric.score?.toFixed(1) || "—"} / 5</span>
                          </div>
                          <div className="h-2.5 w-full bg-aahar-wash rounded-full overflow-hidden border border-aahar-border">
                            <div 
                              className="h-full bg-aahar-rose transition-all duration-1000"
                              style={{ width: `${((metric.score || 0) / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-aahar-wash/30 rounded-xl border-2 border-dashed border-aahar-border">
                    <p className="text-aahar-body font-bold">This hotel has not been AAHAR certified yet.</p>
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
                      <div className="relative h-64">
                        <img 
                          src={getImageUrl(room.photos?.[0]) || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80"} 
                          alt={room.name} 
                          className="w-full h-full object-cover"
                        />
                        {room.isPopular && (
                          <Badge className="absolute top-6 left-6 bg-aahar-teal text-white border-0 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">
                            Most Popular
                          </Badge>
                        )}
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-aahar-dark tracking-tight">{room.name}</h3>
                          <p className="text-sm text-aahar-body leading-relaxed line-clamp-2">{room.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-aahar-body">
                          <div className="flex items-center gap-1.5">
                            <BedDouble className="h-4 w-4 text-aahar-teal" />
                            {room.bedConfig}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-aahar-teal" />
                            Max {room.maxOccupancy} Guests
                          </div>
                        </div>
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
                  {["all","rooms","pool","lobby","spa","exterior","gardens","beach","events"].map(cat => {
                    const count = cat === "all"
                      ? Object.values(hotel.photos ?? {}).flat().length
                      : hotel.photos?.[cat]?.length ?? 0;
                    if (cat !== "all" && count === 0) return null;
                    return (
                      <button key={cat}
                        onClick={() => setPhotoCategory(cat)}
                        className={cn(
                          "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                          photoCategory === cat 
                            ? "bg-aahar-dark text-white shadow-xl" 
                            : "bg-white text-aahar-body border border-aahar-border hover:bg-aahar-wash"
                        )}>
                        {cat === "all" ? "All photos" : cat}
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
                          <img src={url} alt={`Photo ${i+1}`}
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
                  {[
                    { key:"pool",            icon:"🏊", label:"Swimming pool" },
                    { key:"spa",             icon:"💆", label:"Spa & wellness" },
                    { key:"gym",             icon:"🏋️", label:"Fitness centre" },
                    { key:"beach",           icon:"🏖️", label:"Beach access" },
                    { key:"kidsClub",        icon:"🎠", label:"Kids club" },
                    { key:"conference",      icon:"🏢", label:"Conference room" },
                    { key:"restaurant",      icon:"🍽️", label:"In-house restaurant" },
                    { key:"airportTransfer", icon:"🚐", label:"Airport transfer" },
                    { key:"parking",         icon:"🅿️", label:"Free parking" },
                    { key:"evCharging",      icon:"⚡", label:"EV charging" },
                    { key:"wifi",            icon:"📶", label:"Free WiFi" },
                    { key:"petFriendly",     icon:"🐾", label:"Pet friendly" },
                    { key:"accessible",      icon:"♿", label:"Accessible rooms" },
                    { key:"smokingArea",     icon:"🚬", label:"Smoking area" },
                  ].map(({ key, icon, label }) => {
                    const available = hotel.amenities?.[key as keyof typeof hotel.amenities];
                    return (
                      <div key={key}
                        className={cn(
                          "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all",
                          available
                            ? "border-emerald-100 bg-white shadow-sm"
                            : "border-aahar-wash bg-aahar-wash/30 opacity-40 grayscale"
                        )}>
                        <span className="text-2xl">{icon}</span>
                        <span className={cn(
                          "text-xs font-black uppercase tracking-tight",
                          available ? "text-aahar-dark" : "text-aahar-body line-through"
                        )}>
                          {label}
                        </span>
                        {available && (
                          <div className="ml-auto w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dining Tab */}
            {activeTab === "dining" && (
              <div className="py-4 animate-in fade-in duration-500 space-y-12">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-aahar-dark tracking-tight uppercase">Culinary Experience</h3>
                  {hotel.linkedRestaurantId ? (
                    <div className="space-y-6">
                      <p className="text-lg text-aahar-body leading-relaxed">
                        This property features an independently certified AAHAR restaurant, ensuring the highest standards of hygiene for your meals.
                      </p>
                      <LinkedRestaurant restaurantId={hotel.linkedRestaurantId} />
                    </div>
                  ) : hotel.amenities?.restaurant ? (
                    <div className="p-8 bg-aahar-wash/50 border border-aahar-border rounded-xl">
                      <p className="text-sm font-medium text-aahar-body leading-relaxed">
                        This property features an in-house restaurant. 
                        Detailed hygiene metrics will be visible once the linked F&B audit is finalized.
                      </p>
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-aahar-wash/30 rounded-xl border-2 border-dashed border-aahar-border">
                      <p className="text-sm font-bold text-aahar-body">No in-house restaurant available at this property.</p>
                    </div>
                  )}
                </div>

                {/* Meal plans */}
                {hotel.mealPlans?.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-aahar-body/40">Available Meal Plans</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key:"ep",  label:"EP - European Plan",  desc:"Room only — no meals included" },
                        { key:"cp",  label:"CP - Continental Plan",  desc:"Bed & Breakfast included" },
                        { key:"map", label:"MAP - Modified American", desc:"Breakfast & choice of Lunch/Dinner" },
                        { key:"ap",  label:"AP - American Plan", desc:"All three major meals included" },
                      ]
                      .filter(mp => hotel.mealPlans.includes(mp.key))
                      .map(mp => (
                        <div key={mp.key}
                          className="p-6 border-2 border-aahar-rose/10 bg-white rounded-2xl shadow-sm hover:border-aahar-rose/30 transition-all">
                          <p className="text-sm font-black text-aahar-rose uppercase tracking-tight">{mp.label}</p>
                          <p className="text-xs text-aahar-body mt-2 font-medium">{mp.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
            />

            {/* AAHAR Certification Side Widget */}
            {hotel.certification && (
              <div className="p-8 rounded-xl border-2 border-aahar-rose bg-white relative overflow-hidden group shadow-xl">
                <div className="space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-aahar-rose/10 flex items-center justify-center text-aahar-rose">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-aahar-dark text-xl tracking-tight">CERTIFIED STAY</h4>
                    <p className="text-[10px] text-aahar-body uppercase font-black tracking-[0.2em]">Regional Compliance Passed</p>
                  </div>
                  <div className="bg-aahar-wash rounded-xl p-6 border border-aahar-border space-y-4">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-black text-aahar-body tracking-widest">Certificate ID</div>
                      <div className="text-sm font-mono font-bold text-aahar-dark">{hotel.certification.certNumber}</div>
                    </div>
                    <div className="text-[9px] text-aahar-body/60 font-bold uppercase tracking-widest">
                      Expires: {new Date(hotel.certification.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </aside>

        </div>
      </main>
    </div>
  );
}
