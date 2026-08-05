"use client";
import { useEffect, useState } from "react";
import { restaurantApi } from "@/lib/api";
import RestaurantForm from "@/components/forms/RestaurantForm";
import { 
  Loader2, 
  MapPin, 
  Phone, 
  Clock, 
  UtensilsCrossed, 
  Edit2, 
  Power, 
  CheckCircle, 
  AlertTriangle 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function OwnerProfilePage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchRestaurant = () => {
    restaurantApi.list({ limit: 1 })
      .then(res => {
        setRestaurant(res.data.data.items[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const toggleStatus = async () => {
    if (!restaurant) return;
    setUpdatingStatus(true);
    try {
      const newStatus = !restaurant.isActive;
      await restaurantApi.update(restaurant.id, { isActive: newStatus });
      setRestaurant({ ...restaurant, isActive: newStatus });
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

  if (!restaurant) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20">
        <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">No Restaurant Found</h2>
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
        <RestaurantForm initialData={restaurant} isEditing={true} />
      </div>
    );
  }

  // VIEW MODE
  const coverImage = restaurant.image || restaurant.photos?.cover || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80";
  const amenitiesList = Array.isArray(restaurant.amenities)
    ? restaurant.amenities
    : (typeof restaurant.amenities === "object" && restaurant.amenities !== null)
      ? Object.keys(restaurant.amenities).filter(k => (restaurant.amenities as any)[k])
      : [];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Restaurant Profile</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your public storefront identity and operating status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={toggleStatus} 
            disabled={updatingStatus}
            variant={restaurant.isActive ? "outline" : "default"}
            className={cn(
              "rounded-md px-6 shadow-sm transition-all font-semibold",
              !restaurant.isActive 
                ? "bg-amber-500 hover:bg-amber-600 text-white border-0" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
            )}
          >
            {updatingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Power className="h-4 w-4 mr-2" />
            )}
            {restaurant.isActive ? "Mark as Temporarily Closed" : "Re-open Restaurant"}
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
              restaurant.isActive ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
            )}>
              {restaurant.isActive ? "Open & Accepting Orders" : "Temporarily Closed"}
            </Badge>
          </div>

          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-bold text-white tracking-tight mb-2 drop-shadow-md">{restaurant.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
                <span className="flex items-center gap-1.5"><UtensilsCrossed className="h-4 w-4" /> {restaurant.cuisineType?.join(", ") || "Various Cuisines"}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {restaurant.area || "Area"}, {restaurant.city || "City"}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-xs font-bold bg-white/20 px-2 py-0.5 rounded">{restaurant.dietary}</span>
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
                {restaurant.description || "No description provided. Click Edit Profile to add a compelling description for your customers."}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Operating Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.length > 0 ? amenitiesList.map((am: any) => (
                  <Badge key={typeof am === "string" ? am : am.key || JSON.stringify(am)} variant="outline" className="px-3 py-1.5 border-slate-200 text-slate-600 font-medium bg-slate-50 capitalize">
                    {typeof am === "string" ? am.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim() : am.label || am.key}
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
                  <span className="text-sm font-semibold text-slate-700">{restaurant.phone || "Not provided"}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-slate-600 leading-snug">{restaurant.address || "Address not provided"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today's Hours</h4>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-admin-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="text-sm font-bold text-slate-800 block">
                    {restaurant.openingHours?.[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()] || "11:00 - 23:00"}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm uppercase tracking-wider">Open Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
