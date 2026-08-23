"use client";
import { useEffect, useState } from "react";
import { hotelApi } from "@/lib/api";
import HotelForm from "@/components/forms/HotelForm";
import { 
  Loader2, 
  MapPin, 
  Phone, 
  Building2, 
  Edit2, 
  Power, 
  Star,
  AlertTriangle 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function ManagerProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchHotel = () => {
    if (!user?.id) return;
    hotelApi.list({ limit: 1, managerId: user.id })
      .then(res => {
        setHotel(res.data.data.items[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.id) {
      fetchHotel();
    }
  }, [user?.id]);

  const toggleStatus = async () => {
    if (!hotel) return;
    setUpdatingStatus(true);
    try {
      const newStatus = !hotel.isActive;
      await hotelApi.update(hotel.id, { isActive: newStatus });
      setHotel({ ...hotel, isActive: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update operating status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-admin-primary" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20">
        <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">No Property Found</h2>
        <p className="text-slate-500 mt-2 font-medium">Your profile has not been assigned yet. Please contact support.</p>
      </div>
    );
  }

  // If in Edit Mode, render the form directly
  if (isEditing) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-slate-500">
            Cancel Editing
          </Button>
        </div>
        <HotelForm initialData={hotel} isEditing={true} />
      </div>
    );
  }

  // VIEW MODE
  const coverImage = hotel.image || hotel.photos?.cover || "";
  const amenitiesList = Object.keys(hotel.amenities || {}).filter(k => hotel.amenities[k]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Property Profile</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your public property listing and operating status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={toggleStatus} 
            disabled={updatingStatus}
            variant={hotel.isActive ? "outline" : "default"}
            className={cn(
              "rounded-md px-6 shadow-sm transition-all font-semibold",
              !hotel.isActive 
                ? "bg-amber-500 hover:bg-amber-600 text-white border-0" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
            )}
          >
            {updatingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Power className="h-4 w-4 mr-2" />
            )}
            {hotel.isActive ? "Mark as Temporarily Closed" : "Re-open Property"}
          </Button>
          <Button 
            onClick={() => setIsEditing(true)} 
            className="bg-admin-primary hover:bg-admin-primary-hover text-white rounded-md px-6 shadow-md transition-all font-semibold"
          >
            <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        </div>
      </div>

      <Card className="rounded-xl border-0 bg-white shadow-xl overflow-hidden relative">
        {/* Banner Image */}
        <div className="h-72 w-full relative group">
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
          
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <Badge className={cn(
              "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-0 shadow-lg",
              hotel.isActive ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
            )}>
              {hotel.isActive ? "Open & Accepting Bookings" : "Temporarily Closed"}
            </Badge>
          </div>

          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-bold text-white tracking-tight mb-2 drop-shadow-md">{hotel.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
                <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {hotel.propertyType?.replace('_', ' ') || "Hotel"}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {hotel.area || "Area"}, {hotel.city || "City"}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-yellow-400">
                  {Array.from({ length: hotel.starRating || 3 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">About the Property</h4>
              <p className="text-slate-600 leading-relaxed font-medium">
                {hotel.description || "No description provided. Click Edit Profile to add a compelling description for your guests."}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Operating Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.length > 0 ? amenitiesList.map(am => (
                  <Badge key={am} variant="outline" className="px-3 py-1.5 border-slate-200 text-slate-600 font-medium bg-slate-50 capitalize">
                    {am.replace(/([A-Z])/g, ' $1').trim()}
                  </Badge>
                )) : (
                  <span className="text-sm text-slate-400 font-medium italic">No amenities specified.</span>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8 border-l border-slate-100 pl-0 md:pl-8">
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact Details</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                  <span className="text-sm font-semibold text-slate-700">{hotel.phone || "Not provided"}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-slate-600 leading-snug">{hotel.address || "Address not provided"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Timings</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-md">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Check-In</span>
                  <span className="text-sm font-bold text-slate-800">{hotel.checkInTime || "14:00"}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-md">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Check-Out</span>
                  <span className="text-sm font-bold text-slate-800">{hotel.checkOutTime || "11:00"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
