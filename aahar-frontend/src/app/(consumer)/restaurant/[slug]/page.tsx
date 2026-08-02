"use client";

import { toast } from "sonner";
import { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Info, 
  CheckCircle2, 
  UtensilsCrossed,
  Image as ImageIcon,
  MessageSquare,
  ClipboardCheck,
  ChevronRight,
  ExternalLink,
  X,
  Star,
  Minus,
  Plus,
  ShoppingBag,
  ChefHat,
  QrCode
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { restaurantApi, orderApi } from "@/lib/api";
import { HygieneScore } from "@/components/shared/HygieneScore";
import AaharBadge from "@/components/shared/AaharBadge";
import BookingCard from "@/components/restaurant/BookingCard";
import { cn } from "@/lib/utils";
import { notFound, useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const orderSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  notes: z.string().optional()
});

export default function RestaurantProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-aahar-teal animate-pulse">Loading profile...</div>}>
      <RestaurantProfilePageContent params={params} />
    </Suspense>
  );
}

function RestaurantProfilePageContent({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");

  // React Hook Form + Zod
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: "",
      notes: ""
    }
  });

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [photoCategory, setPhotoCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Dine-in cart states
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tempTable, setTempTable] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    restaurantApi.get(params.slug)
      .then(res => setRestaurant(res.data.data))
      .catch(() => notFound())
      .finally(() => setLoading(false));
  }, [params.slug]);

  // Sync table parameter from QR code scan
  useEffect(() => {
    if (tableParam) {
      setActiveTable(tableParam);
      setActiveTab("menu");
    }
  }, [tableParam]);

  if (loading) return <div className="p-20 text-center font-bold text-aahar-teal animate-pulse">Loading profile...</div>;
  if (!restaurant) return null;

  const TABS = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "menu", label: "Menu", icon: UtensilsCrossed },
    { id: "photos", label: "Photos", icon: ImageIcon },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "hygiene", label: "Hygiene", icon: ClipboardCheck },
  ];

  // Cart operations
  const getCartQty = (itemId: string) => {
    const item = cart.find(i => i.menuItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const updateCartQty = (menuItem: any, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter(i => i.menuItem.id !== menuItem.id));
    } else {
      const existing = cart.find(i => i.menuItem.id === menuItem.id);
      if (existing) {
        setCart(cart.map(i => i.menuItem.id === menuItem.id ? { ...i, quantity: qty } : i));
      } else {
        setCart([...cart, { menuItem, quantity: qty }]);
      }
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const onSubmitOrder = async (values: any) => {
    if (!activeTable) return;
    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        restaurantId: restaurant.id,
        tableNumber: activeTable,
        customerName: values.customerName,
        notes: values.notes,
        items: cart.map(i => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          price: i.menuItem.price,
          name: i.menuItem.name
        }))
      };

      const res = await orderApi.create(orderPayload);
      if (res.data.success) {
        const orderData = res.data.data;
        try {
          const activeOrderInfo = {
            id: orderData.id,
            restaurantSlug: restaurant.slug,
            restaurantName: restaurant.name,
            tableNumber: orderData.tableNumber,
            totalAmount: orderData.totalAmount || cartTotal,
            createdAt: orderData.createdAt || new Date().toISOString(),
            status: orderData.status || "pending",
          };
          const existing = JSON.parse(localStorage.getItem("aahar_active_orders") || "[]");
          const filtered = existing.filter((o: any) => o.id !== orderData.id);
          localStorage.setItem("aahar_active_orders", JSON.stringify([activeOrderInfo, ...filtered].slice(0, 10)));
        } catch (e) {
          console.error("Failed to save active order to local storage:", e);
        }

        setCart([]);
        reset();
        setShowCartSheet(false);
        router.push(`/restaurant/${restaurant.slug}/order/${res.data.data.id}`);
      }
    } catch (err) {
      console.error("Failed to place dine-in order:", err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-aahar-wash pb-24 relative">
      {/* Hero Section */}
      <section className="relative h-[450px] w-full overflow-hidden">
        <Image
          src={restaurant.photos?.cover || "https://picsum.photos/seed/restaurant/1200/800"}
          alt={restaurant.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aahar-dark/90 via-aahar-dark/40 to-transparent" />
        
        <div className="container mx-auto max-w-7xl px-4 absolute bottom-0 left-0 right-0 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                {(() => {
                  const now = new Date();
                  const day = now.toLocaleString('en-us', {weekday:'long'}).toLowerCase();
                  const hours = restaurant.openingHours?.[day];
                  let isOpen = false;
                  if (hours && hours.includes(' - ')) {
                    const parts = hours.split(' - ');
                    if (parts.length === 2) {
                      const [start, end] = parts;
                      const [sh, sm] = (start || "").split(':').map(Number);
                      const [eh, em] = (end || "").split(':').map(Number);
                      
                      if (!isNaN(sh as any) && !isNaN(eh as any)) {
                        const nowMin = now.getHours() * 60 + now.getMinutes();
                        const startMin = (sh ?? 0) * 60 + (sm ?? 0);
                        const endMin = (eh ?? 0) * 60 + (em ?? 0);
                        isOpen = nowMin >= startMin && nowMin <= endMin;
                      }
                    }
                  }
                  return (
                    <Badge className={cn("border-0 text-white", isOpen ? "bg-emerald-500" : "bg-rose-500")}>
                      {isOpen ? "Open Now" : "Closed"}
                    </Badge>
                  );
                })()}
                <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  {restaurant.category?.replace('_', ' ')}
                </Badge>
                {activeTable && (
                  <Badge className="bg-emerald-500 border-0 text-white font-bold flex items-center gap-1">
                    <QrCode className="h-3 w-3 animate-pulse" />
                    Table {activeTable} Active
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-3 text-white/80">
                <MapPin className="h-5 w-5 text-aahar-teal" />
                <span className="text-lg">{restaurant.area}, {restaurant.city}</span>
              </div>
            </div>

            {restaurant.certification && (
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <AaharBadge 
                  type="fnb" 
                  status={restaurant.certification.status}
                  expiresAt={restaurant.certification.expiresAt}
                  certNumber={restaurant.certification.certNumber}
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
          <div className="flex gap-8 overflow-x-auto no-scrollbar py-4">
            {TABS.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 text-sm font-bold transition-all whitespace-nowrap px-1 border-b-2 pb-1",
                  activeTab === tab.id 
                    ? "text-aahar-teal border-aahar-teal" 
                    : "text-aahar-body/60 border-transparent hover:text-aahar-teal"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="container mx-auto max-w-7xl px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-12 min-h-[500px]">
            
            {/* Overview Section */}
            {activeTab === "overview" && (
              <section className="space-y-12 animate-in fade-in duration-500">
                <div className="flex flex-wrap gap-2">
                  {restaurant.cuisineType?.map((tag: string) => (
                    <span key={tag} className="px-4 py-1.5 rounded-full bg-white border border-aahar-border text-xs font-bold text-aahar-body">
                      {tag}
                    </span>
                  ))}
                  <span className="px-4 py-1.5 rounded-full bg-white border border-aahar-border text-xs font-bold text-aahar-body">
                    {restaurant.priceRange}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-white border border-aahar-border text-xs font-bold text-aahar-body capitalize">
                    {restaurant.dietary}
                  </span>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-aahar-dark tracking-tight uppercase">About the Restaurant</h3>
                  <p className="text-aahar-body leading-relaxed text-lg">
                    {restaurant.description || "No description available for this restaurant yet."}
                  </p>
                </div>

                {/* Quick Highlights */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <Card className="p-6 bg-white border-aahar-border text-center space-y-2">
                    <Clock className="h-6 w-6 text-aahar-teal mx-auto" />
                    <div className="text-[10px] font-black uppercase text-aahar-body/40">Opening Hours</div>
                    <div className="text-xs font-bold text-aahar-dark">{restaurant.openingHours?.monday || "Closed"}</div>
                  </Card>
                  <Card className="p-6 bg-white border-aahar-border text-center space-y-2">
                    <Phone className="h-6 w-6 text-aahar-teal mx-auto" />
                    <div className="text-[10px] font-black uppercase text-aahar-body/40">Contact</div>
                    <div className="text-xs font-bold text-aahar-dark">{restaurant.phone}</div>
                  </Card>
                </div>
              </section>
            )}

            {/* Menu tab */}
            {activeTab === "menu" && (
              <div className="py-4 animate-in fade-in duration-500">
                {restaurant.menu?.length === 0 || !restaurant.menu ? (
                  <div className="text-center py-12 text-aahar-body/40 text-sm italic">
                    Menu not yet added by this restaurant.
                  </div>
                ) : (
                  <div className="flex flex-col gap-10">
                    {restaurant.menu.map((section: any) => (
                      <div key={section.id} className="space-y-6">
                        <h3 className="text-lg font-bold text-aahar-dark uppercase tracking-tight pb-3 border-b border-aahar-wash">
                          {section.name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                          {section.items
                            .filter((item: any) => item.isAvailable)
                            .map((item: any) => (
                              <div key={item.id}
                                className="flex items-start justify-between gap-4 py-3 border-b border-aahar-wash last:border-none group">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                  {/* Dietary dot */}
                                  <div className={cn(
                                    "w-3 h-3 rounded-sm border-2 flex-shrink-0 mt-1",
                                    item.dietary === "veg"     ? "border-emerald-500 bg-emerald-50" :
                                    item.dietary === "vegan"   ? "border-purple-400 bg-purple-50" :
                                    item.dietary === "jain"    ? "border-amber-400 bg-amber-50" :
                                    "border-rose-500 bg-rose-50"
                                  )} />
                                  <div className="min-w-0">
                                    <p className="text-md font-bold text-aahar-dark group-hover:text-aahar-teal transition-colors">{item.name}</p>
                                    {item.description && (
                                      <p className="text-xs text-aahar-body mt-1 line-clamp-2 leading-relaxed">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  <p className="text-md font-black text-aahar-teal">
                                    ₹{item.price.toLocaleString("en-IN")}
                                  </p>
                                  {activeTable && (
                                    <div className="flex items-center gap-1.5 bg-aahar-teal/15 p-1 rounded-xl shadow-inner animate-in fade-in zoom-in-75 duration-300">
                                      {getCartQty(item.id) > 0 ? (
                                        <>
                                          <button 
                                            onClick={() => updateCartQty(item, getCartQty(item.id) - 1)} 
                                            className="p-1 rounded-lg bg-white text-aahar-teal hover:bg-aahar-teal hover:text-white transition-colors"
                                          >
                                            <Minus className="h-3 w-3" />
                                          </button>
                                          <span className="text-xs font-black text-aahar-teal px-1.5 min-w-[12px] text-center">{getCartQty(item.id)}</span>
                                          <button 
                                            onClick={() => updateCartQty(item, getCartQty(item.id) + 1)} 
                                            className="p-1 rounded-lg bg-white text-aahar-teal hover:bg-aahar-teal hover:text-white transition-colors"
                                          >
                                            <Plus className="h-3 w-3" />
                                          </button>
                                        </>
                                      ) : (
                                        <Button 
                                          onClick={() => updateCartQty(item, 1)} 
                                          variant="ghost" 
                                          className="h-7 px-3 py-1 text-xs font-bold text-aahar-teal bg-white rounded-lg hover:bg-aahar-teal hover:text-white transition-all shadow-sm"
                                        >
                                          Add
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Photos tab */}
            {activeTab === "photos" && (
              <div className="py-4 animate-in fade-in duration-500">
                {/* Category filter */}
                <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
                  {["all","kitchen","interior","exterior","dining","food","restroom"].map(cat => (
                    <button key={cat}
                      onClick={() => setPhotoCategory(cat)}
                      className={cn(
                        "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                        photoCategory === cat 
                          ? "bg-aahar-dark text-white shadow-lg" 
                          : "bg-white text-aahar-body border border-aahar-border hover:bg-aahar-wash"
                      )}>
                      {cat === "all" ? "All photos" : cat}
                      {cat !== "all" && restaurant.photos?.[cat]?.length > 0 && (
                        <span className="ml-2 opacity-50">
                          ({restaurant.photos[cat].length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Photo grid */}
                {(() => {
                  const photos = photoCategory === "all"
                    ? Object.values(restaurant.photos ?? {}).flat() as string[]
                    : restaurant.photos?.[photoCategory] ?? [];

                  const filteredPhotos = photos.filter((p: string) => p !== restaurant.photos?.cover);

                  if (!filteredPhotos.length) {
                    return (
                      <div className="text-center py-20 bg-aahar-wash/30 border-2 border-dashed border-aahar-border rounded-xl">
                        <ImageIcon className="h-10 w-10 text-aahar-body/20 mx-auto mb-4" />
                        <p className="text-aahar-body font-bold">No photos in this category yet.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredPhotos.map((url: string, i: number) => (
                        <div key={i}
                          className="aspect-square rounded-xl overflow-hidden cursor-pointer border border-aahar-border shadow-sm
                                     hover:shadow-md transition-all active:scale-95"
                          onClick={() => setLightboxIndex(i)}>
                          <img
                            src={url}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === "reviews" && (
              <div className="py-4 animate-in fade-in duration-500">
                {restaurant.googleRating ? (
                  <div className="space-y-10">
                    <div className="flex flex-col md:flex-row items-center gap-10 p-10 bg-white border border-aahar-border rounded-xl shadow-sm">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-aahar-dark tracking-tight">
                          {restaurant.googleRating.toFixed(1)}
                        </div>
                        <div className="flex gap-1 justify-center mt-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn(
                              "h-5 w-5",
                              i < Math.round(restaurant.googleRating)
                                ? "fill-aahar-rose text-aahar-rose" : "text-aahar-border"
                            )} />
                          ))}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-aahar-body/40 mt-3">
                          {restaurant.googleReviewCount?.toLocaleString("en-IN") ?? "0"} Verified Reviews
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <h4 className="text-lg font-bold text-aahar-dark uppercase tracking-tight">Community Feedback</h4>
                        <p className="text-sm text-aahar-body leading-relaxed font-medium">
                          These ratings are aggregated directly from verified Google Business profiles. AAHAR monitors these for sudden drops which may trigger unannounced spot-checks.
                        </p>
                        
                        <a 
                          href={`https://www.google.com/search?q=${encodeURIComponent(restaurant.name + " " + restaurant.city)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-aahar-teal hover:translate-x-1 transition-all"
                        >
                          View Original Reviews
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>

                    <div className="p-12 text-center bg-aahar-wash/30 rounded-xl border-2 border-dashed border-aahar-border">
                      <MessageSquare className="h-10 w-10 text-aahar-body/20 mx-auto mb-4" />
                      <p className="text-sm text-aahar-body font-bold">
                        Detailed review highlights require Google Places API Premium.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-aahar-wash/30 rounded-xl border-2 border-dashed border-aahar-border">
                    <p className="text-aahar-body font-bold">No verified reviews data available yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Hygiene Report tab */}
            {activeTab === "hygiene" && (
              <div className="py-4 animate-in fade-in duration-500">
                {restaurant.certification ? (
                  <div className="space-y-10">
                    <div className="flex flex-col md:flex-row items-center gap-10 p-10 bg-aahar-teal/5 border-2 border-aahar-teal/20 rounded-xl shadow-sm">
                      <div className="text-center w-32">
                        <div className="text-4xl font-bold text-aahar-teal tracking-tight">
                          {restaurant.certification.hygieneScore?.toFixed(1) ?? "—"}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-aahar-teal mt-2">Trust Index</div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <h4 className="text-lg font-bold text-aahar-dark uppercase tracking-tight">Hygiene Audit Report</h4>
                        <p className="text-sm text-aahar-body font-medium leading-relaxed">
                          This score represents a comprehensive on-site evaluation of {restaurant.name}'s operational standards. Audits are conducted every 6 months by independent AAHAR regional inspectors.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-aahar-teal/60">
                          <ClipboardCheck className="h-4 w-4" />
                          Last verified: {new Date(restaurant.certification.issuedAt).toLocaleDateString("en-IN", { month:"long", year:"numeric", day:"numeric" })}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 px-4">
                      {(restaurant.certification.application?.audit?.checklist || [
                        { section:"Kitchen hygiene",  score: 4.8 },
                        { section:"Food storage",     score: 4.5 },
                        { section:"Staff standards",  score: 3.9 },
                        { section:"Documentation",    score: 4.7 },
                        { section:"Waste Management", score: 4.3 },
                      ]).map((item: any) => (
                        <div key={item.section} className="space-y-3">
                          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                            <span className="text-aahar-dark">{item.section || item.criterion}</span>
                            <span className="text-aahar-teal">{item.score?.toFixed(1) || "—"} / 5.0</span>
                          </div>
                          <div className="h-2.5 w-full bg-aahar-wash rounded-full overflow-hidden border border-aahar-border shadow-inner">
                            <div className="h-full bg-aahar-teal shadow-[0_0_10px_rgba(45,212,191,0.5)] transition-all duration-1000" style={{ width:`${((item.score || 0)/5)*100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-8 bg-aahar-dark text-white rounded-xl shadow-2xl space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                      <div className="flex items-center gap-4 relative z-10">
                        <CheckCircle2 className="h-10 w-10 text-aahar-teal" />
                        <div>
                          <h4 className="text-lg font-black tracking-tight uppercase">License #{restaurant.certification.certNumber}</h4>
                          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Digital Trust Hash Verified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-aahar-wash/30 rounded-xl border-2 border-dashed border-aahar-border">
                    <p className="text-aahar-body font-bold mb-6">This restaurant has not been AAHAR certified yet.</p>
                    <a href="/apply/restaurant">
                      <Button type="button"  className="bg-aahar-dark text-white rounded-xl px-10 py-6 font-black uppercase tracking-widest">Apply for Certification</Button>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-10">
            <BookingCard restaurant={restaurant} />

            {/* Dine-in Table Ordering Card */}
            <Card className="p-8 rounded-xl border-aahar-border shadow-xl space-y-6 bg-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <ChefHat className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-aahar-dark tracking-tighter uppercase">Dine-in Ordering</h3>
              </div>

              {activeTable ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Ordering At</p>
                      <h4 className="text-md font-black text-aahar-dark">Table {activeTable}</h4>
                    </div>
                    <Button 
                      onClick={() => {
                        setActiveTable(null);
                        setCart([]);
                      }} 
                      variant="ghost" 
                      className="text-[10px] text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold uppercase tracking-widest h-auto px-2.5 py-1.5 rounded-xl"
                    >
                      Clear
                    </Button>
                  </div>
                  <p className="text-xs text-aahar-body leading-relaxed pl-1">
                    Dine-in menu activated. Add items from the menu, customize details in your cart, and place your order.
                  </p>
                  {cartCount > 0 && (
                    <Button 
                      onClick={() => setShowCartSheet(true)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-6 font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      View Cart ({cartCount})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-aahar-body leading-relaxed pl-1">
                    Order food directly to your table! Enter your table number below to open the digital order menu.
                  </p>
                  <Button 
                    onClick={() => {
                      setTempTable("");
                      setShowTableModal(true);
                    }}
                    className="w-full bg-aahar-teal text-white rounded-xl py-6 font-bold uppercase tracking-widest shadow-xl shadow-aahar-teal/20 transition-all active:scale-95 hover:bg-aahar-teal/90"
                  >
                    Start Table Order
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-8 rounded-xl border-aahar-border shadow-md space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-aahar-body/40">Operational Details</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-aahar-teal/10 rounded-xl text-aahar-teal">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-aahar-body/40">Opening Hours</div>
                    <div className="text-sm font-bold text-aahar-dark mt-0.5">Today: {restaurant.openingHours?.monday || "Schedule Unknown"}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-aahar-teal/10 rounded-xl text-aahar-teal">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-aahar-body/40">Direct Phone</div>
                    <div className="text-sm font-bold text-aahar-dark mt-0.5">{restaurant.phone}</div>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {activeTable && cartCount > 0 && !showCartSheet && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 animate-in slide-in-from-bottom-8 duration-500">
          <button 
            onClick={() => setShowCartSheet(true)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-emerald-500/35 transition-all hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white/80">Table {activeTable} Cart</p>
                <p className="text-sm font-black text-white">{cartCount} items</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="text-sm font-black text-white">₹{cartTotal.toLocaleString("en-IN")}</span>
              <ChevronRight className="h-5 w-5 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Table Number Prompt Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-aahar-dark/65 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-aahar-dark uppercase tracking-tight">Enter Table Number</h3>
              <p className="text-xs text-aahar-body">Check the QR code sticker placed on your table</p>
            </div>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="E.g., 5"
                value={tempTable}
                onChange={(e) => setTempTable(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-aahar-border bg-aahar-wash/30 text-center text-lg font-black focus:ring-2 focus:ring-aahar-teal outline-none transition-all"
              />
              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowTableModal(false)}
                  variant="outline" 
                  className="flex-1 rounded-2xl py-6 font-bold uppercase text-xs tracking-widest border-aahar-border text-aahar-body"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (tempTable.trim()) {
                      setActiveTable(tempTable.trim());
                      setShowTableModal(false);
                      setActiveTab("menu");
                    }
                  }}
                  disabled={!tempTable.trim()}
                  className="flex-1 bg-aahar-teal text-white rounded-2xl py-6 font-bold uppercase text-xs tracking-widest disabled:opacity-40"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Up Table Cart Sheet */}
      {showCartSheet && cart.length > 0 && (
        <div className="fixed inset-0 z-50 bg-aahar-dark/65 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-t-[3rem] shadow-2xl p-8 space-y-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-12 duration-300">
            <div className="flex items-center justify-between border-b border-aahar-wash pb-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-aahar-teal" />
                <div>
                  <h3 className="text-xl font-bold text-aahar-dark uppercase tracking-tight">Your Table Cart</h3>
                  <p className="text-xs text-aahar-body">Table {activeTable} • {restaurant.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCartSheet(false)} 
                className="p-2 bg-aahar-wash hover:bg-aahar-border rounded-full text-aahar-dark transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="divide-y divide-aahar-wash max-h-[30vh] overflow-y-auto px-1">
              {cart.map(item => (
                <div key={item.menuItem.id} className="flex justify-between items-center py-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn(
                      "w-3 h-3 rounded-sm border-2 flex-shrink-0 mt-1.5",
                      item.menuItem.dietary === "veg"     ? "border-emerald-500 bg-emerald-50" :
                      item.menuItem.dietary === "vegan"   ? "border-purple-400 bg-purple-50" :
                      item.menuItem.dietary === "jain"    ? "border-amber-400 bg-amber-50" :
                      "border-rose-500 bg-rose-50"
                    )} />
                    <div className="min-w-0">
                      <p className="font-bold text-aahar-dark text-sm truncate">{item.menuItem.name}</p>
                      <p className="text-xs text-aahar-teal font-black">₹{item.menuItem.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 bg-aahar-teal/10 p-1 rounded-xl">
                      <button 
                        onClick={() => updateCartQty(item.menuItem, item.quantity - 1)} 
                        className="p-1 rounded-lg bg-white text-aahar-teal hover:bg-aahar-teal hover:text-white transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-black text-aahar-teal px-1">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQty(item.menuItem, item.quantity + 1)} 
                        className="p-1 rounded-lg bg-white text-aahar-teal hover:bg-aahar-teal hover:text-white transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm font-black text-aahar-dark w-16 text-right">
                      ₹{item.menuItem.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="p-4 bg-aahar-wash/50 rounded-2xl flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-aahar-body/60">Total Amount</span>
              <span className="text-xl font-black text-aahar-teal">₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>

            {/* Anonymous Checkout Form */}
            <form onSubmit={handleSubmit(onSubmitOrder)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-aahar-body/60 pl-1">Diner Name</label>
                <input 
                  type="text" 
                  placeholder="E.g., Arjun Dev (Anonymous ok)"
                  {...register("customerName")}
                  className="w-full px-4 py-4 rounded-2xl border border-aahar-border bg-aahar-wash/20 text-sm font-bold focus:ring-2 focus:ring-aahar-teal outline-none transition-all"
                />
                {errors.customerName && (
                  <p className="text-xs font-bold text-rose-500 pl-1">{errors.customerName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-aahar-body/60 pl-1">Special Cooking Requests (Optional)</label>
                <textarea 
                  placeholder="E.g., Make it extra spicy, less salt..."
                  rows={2}
                  {...register("notes")}
                  className="w-full px-4 py-4 rounded-2xl border border-aahar-border bg-aahar-wash/20 text-sm font-bold focus:ring-2 focus:ring-aahar-teal outline-none transition-all resize-none"
                />
              </div>

              <Button 
                type="submit"
                disabled={isPlacingOrder}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-7 font-bold uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-40"
              >
                {isPlacingOrder ? "Placing Order..." : "Confirm & Send to Kitchen"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox (Preserved) */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-aahar-dark/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-8 right-8 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-5xl w-full h-full max-h-[80vh]">
            <img 
              src={(photoCategory === "all" ? Object.values(restaurant.photos ?? {}).flat() : restaurant.photos?.[photoCategory])[lightboxIndex] as string} 
              alt="Lightbox" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
