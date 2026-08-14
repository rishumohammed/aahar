"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { restaurantApi, hotelApi, adminApi } from "@/lib/api";
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
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EstablishmentPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string; // 'restaurant' | 'hotel'
  const id = params.id as string;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  // Helper to parse images if they are strings or JSON
  const parseImages = (imgs: any) => {
    if (!imgs) return [];
    if (Array.isArray(imgs)) return imgs;
    try {
      return JSON.parse(imgs);
    } catch {
      return [];
    }
  };

  const images = parseImages(item.images);
  const coverImage = images[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop"; // Placeholder

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
        <div className="h-64 md:h-80 w-full relative bg-slate-100">
          <img src={coverImage} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          
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
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
                {type === "restaurant" ? <Utensils className="h-4 w-4 text-admin-primary" /> : <Hotel className="h-4 w-4 text-admin-primary" />}
                {type === "restaurant" ? "Dining Details" : "Property Details"}
              </h3>
              
              {type === "restaurant" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cuisine</p>
                    <p className="text-sm font-medium text-slate-800">{item.cuisineType ? parseImages(item.cuisineType).join(", ") : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dietary</p>
                    <p className="text-sm font-medium text-slate-800 capitalize">{item.dietary?.replace(/_/g, ' ') || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Price Range</p>
                    <p className="text-sm font-medium text-slate-800">{item.priceRange || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                    <p className="text-sm font-medium text-slate-800 capitalize">{item.category?.replace(/_/g, ' ') || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">FSSAI Number</p>
                    <p className="text-sm font-medium text-slate-800">{item.fssaiNo || "N/A"}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Star Rating</p>
                    <p className="text-sm font-medium text-slate-800">{item.starRating ? `${item.starRating} Star` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Property Type</p>
                    <p className="text-sm font-medium text-slate-800 capitalize">{item.propertyType?.replace(/_/g, ' ') || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Rooms</p>
                    <p className="text-sm font-medium text-slate-800">{item.rooms || "N/A"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery */}
            {images.length > 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-admin-primary" /> Gallery
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.slice(1).map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
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
