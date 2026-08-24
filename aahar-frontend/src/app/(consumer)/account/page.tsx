"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Utensils, 
  Hotel,
  ChevronRight, 
  Lock, 
  Loader2, 
  UserCheck,
  Pencil,
  X,
  BedDouble,
  Users,
  ShieldCheck,
  Ban,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { orderApi, enquiryApi, authApi } from "@/lib/api";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, "Invalid phone number").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal(""))
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountPage() {
  const { user, updateUser } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [stays, setStays] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingStays, setLoadingStays] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "restaurant-orders" | "hotel-bookings">("profile");

  // Stay cancellation state
  const [stayToCancel, setStayToCancel] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingStay, setCancellingStay] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      password: ""
    }
  });

  // Sync fresh profile data on load
  useEffect(() => {
    authApi.me()
      .then(res => {
        if (res.data?.data) {
          updateUser(res.data.data);
          reset({
            name: res.data.data.name || "",
            email: res.data.data.email || "",
            phone: res.data.data.phone || "",
            password: ""
          });
        }
      })
      .catch(err => {
        console.error("Failed to sync profile:", err);
      });
  }, [updateUser, reset]);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: ""
      });
    }
  }, [user, reset]);

  // Load restaurant dining orders
  useEffect(() => {
    orderApi.getCustomerOrders()
      .then(res => {
        setOrders(res.data.data || []);
      })
      .catch(err => {
        console.error("Failed to load customer orders:", err);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, []);

  // Load hotel stay bookings / enquiries
  useEffect(() => {
    enquiryApi.list()
      .then(res => {
        const items = res.data?.data?.items || res.data?.data || [];
        setStays(Array.isArray(items) ? items : []);
      })
      .catch(err => {
        console.error("Failed to load customer stays:", err);
      })
      .finally(() => {
        setLoadingStays(false);
      });
  }, []);

  const onUpdateProfile = async (values: ProfileFormValues) => {
    setUpdatingProfile(true);
    try {
      const payload: any = {
        name: values.name,
        email: values.email,
        phone: values.phone || ""
      };
      if (values.password) {
        payload.password = values.password;
      }
      const response = await authApi.updateProfile(payload);
      if (response.data?.data) {
        updateUser(response.data.data);
        reset({
          name: response.data.data.name || values.name,
          email: response.data.data.email || values.email,
          phone: response.data.data.phone || values.phone || "",
          password: ""
        });
      }
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleCancelStay = async () => {
    if (!stayToCancel) return;
    setCancellingStay(true);
    try {
      await enquiryApi.updateStatus(stayToCancel.id, "declined", {
        reason: cancelReason.trim() || "Cancelled by guest"
      });
      setStays(prev => prev.map(s => s.id === stayToCancel.id ? { ...s, status: "declined" } : s));
      toast.success("Stay booking cancelled successfully");
      setStayToCancel(null);
      setCancelReason("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel stay booking.");
    } finally {
      setCancellingStay(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "preparing": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "served": return "bg-purple-50 text-purple-700 border border-purple-200";
      case "completed": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "cancelled": return "bg-rose-50 text-rose-700 border border-rose-200";
      default: return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getStayStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "viewed": return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      case "quoted": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "confirmed": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "declined": return "bg-rose-50 text-rose-700 border border-rose-200";
      case "expired": return "bg-gray-50 text-gray-600 border border-gray-200";
      default: return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-aahar-wash py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-aahar-border/60 rounded-xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-aahar-teal/10 flex items-center justify-center text-aahar-teal shadow-inner">
              <UserIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-aahar-dark tracking-tight">{user?.name || "My Account"}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-aahar-body font-bold uppercase tracking-widest bg-aahar-wash px-2.5 py-0.5 rounded-lg border border-aahar-border/40">
                  Consumer Account
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-aahar-wash">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                activeTab === "profile" 
                  ? "bg-aahar-teal text-white shadow-md shadow-aahar-teal/20" 
                  : "bg-white text-aahar-body border border-aahar-border/50 hover:bg-aahar-wash"
              }`}
            >
              <UserIcon className="h-3.5 w-3.5" />
              My Profile
            </button>

            <button
              onClick={() => setActiveTab("restaurant-orders")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                activeTab === "restaurant-orders" 
                  ? "bg-aahar-teal text-white shadow-md shadow-aahar-teal/20" 
                  : "bg-white text-aahar-body border border-aahar-border/50 hover:bg-aahar-wash"
              }`}
            >
              <Utensils className="h-3.5 w-3.5" />
              Restaurant Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab("hotel-bookings")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                activeTab === "hotel-bookings" 
                  ? "bg-aahar-teal text-white shadow-md shadow-aahar-teal/20" 
                  : "bg-white text-aahar-body border border-aahar-border/50 hover:bg-aahar-wash"
              }`}
            >
              <Hotel className="h-3.5 w-3.5" />
              Hotel Bookings ({stays.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Profile View */}
        {activeTab === "profile" && (
          <Card className="bg-white border-aahar-border/60 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-aahar-wash pb-4 mb-6">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider text-aahar-dark">
                  {isEditingProfile ? "Edit Profile Information" : "Personal Information"}
                </h2>
                <p className="text-xs text-aahar-body font-medium mt-0.5">
                  {isEditingProfile ? "Update your personal credentials and account details" : "Your registered account details and contact information"}
                </p>
              </div>

              {!isEditingProfile ? (
                <Button 
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-aahar-teal hover:bg-aahar-teal/90 text-white rounded-xl py-2 px-4 font-black uppercase tracking-wider text-[11px] flex items-center gap-2 shadow-sm transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsEditingProfile(false);
                    if (user) {
                      reset({
                        name: user.name || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        password: ""
                      });
                    }
                  }}
                  className="rounded-xl border-aahar-border text-aahar-body hover:bg-aahar-wash text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              )}
            </div>

            {!isEditingProfile ? (
              /* Normal View */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-aahar-wash/40 p-4 rounded-xl border border-aahar-border/50 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-aahar-teal shrink-0 shadow-sm border border-aahar-border/30">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-aahar-body/60">Full Name</p>
                      <p className="text-sm font-bold text-aahar-dark mt-0.5 truncate">{user?.name || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="bg-aahar-wash/40 p-4 rounded-xl border border-aahar-border/50 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-aahar-teal shrink-0 shadow-sm border border-aahar-border/30">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-aahar-body/60">Email Address</p>
                      <p className="text-sm font-bold text-aahar-dark mt-0.5 truncate">{user?.email || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="bg-aahar-wash/40 p-4 rounded-xl border border-aahar-border/50 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-aahar-teal shrink-0 shadow-sm border border-aahar-border/30">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-aahar-body/60">Phone Number</p>
                      <p className="text-sm font-bold text-aahar-dark mt-0.5 truncate">{user?.phone || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="bg-aahar-wash/40 p-4 rounded-xl border border-aahar-border/50 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-aahar-teal shrink-0 shadow-sm border border-aahar-border/30">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-aahar-body/60">Member Since</p>
                      <p className="text-sm font-bold text-aahar-dark mt-0.5">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Active Member"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-aahar-wash/40 p-4 rounded-xl border border-aahar-border/50 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-aahar-teal shrink-0 shadow-sm border border-aahar-border/30">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-aahar-body/60">Account Status</p>
                      <p className="text-sm font-bold text-emerald-600 mt-0.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        Verified Active
                      </p>
                    </div>
                  </div>

                  <div className="bg-aahar-wash/40 p-4 rounded-xl border border-aahar-border/50 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-aahar-teal shrink-0 shadow-sm border border-aahar-border/30">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-aahar-body/60">Activity Summary</p>
                      <p className="text-sm font-bold text-aahar-dark mt-0.5">
                        {orders.length} Orders · {stays.length} Stays
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-aahar-body/30" />
                      <Input 
                        type="text"
                        placeholder="Full Name"
                        className="pl-11 py-5 rounded-xl border-aahar-border focus:ring-aahar-teal bg-white text-xs font-semibold"
                        {...register("name")}
                      />
                    </div>
                    {errors.name && <p className="text-[11px] text-rose-500 font-bold pl-1">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-aahar-body/30" />
                      <Input 
                        type="email"
                        placeholder="Email Address"
                        className="pl-11 py-5 rounded-xl border-aahar-border focus:ring-aahar-teal bg-white text-xs font-semibold"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && <p className="text-[11px] text-rose-500 font-bold pl-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-aahar-body/30" />
                      <Input 
                        type="text"
                        placeholder="+919876543210"
                        className="pl-11 py-5 rounded-xl border-aahar-border focus:ring-aahar-teal bg-white text-xs font-semibold"
                        {...register("phone")}
                      />
                    </div>
                    {errors.phone && <p className="text-[11px] text-rose-500 font-bold pl-1">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Change Password (Optional)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-aahar-body/30" />
                      <Input 
                        type="password"
                        placeholder="Leave blank to keep existing"
                        className="pl-11 py-5 rounded-xl border-aahar-border focus:ring-aahar-teal bg-white text-xs font-semibold"
                        {...register("password")}
                      />
                    </div>
                    {errors.password && <p className="text-[11px] text-rose-500 font-bold pl-1">{errors.password.message}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={updatingProfile}
                    className="bg-aahar-teal hover:bg-aahar-teal/90 text-white rounded-xl py-5 px-8 font-black uppercase tracking-widest text-[11px] shadow-md transition-all"
                  >
                    {updatingProfile ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving Changes...</span>
                    ) : (
                      <span className="flex items-center gap-2"><UserCheck className="h-4 w-4" /> Save Profile Changes</span>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false);
                      if (user) {
                        reset({
                          name: user.name || "",
                          email: user.email || "",
                          phone: user.phone || "",
                          password: ""
                        });
                      }
                    }}
                    className="rounded-xl border-aahar-border text-aahar-body hover:bg-aahar-wash text-[11px] font-bold uppercase tracking-wider py-5 px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        )}

        {/* Tab 2: Restaurant Orders */}
        {activeTab === "restaurant-orders" && (
          <Card className="bg-white border-aahar-border/60 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-aahar-wash pb-4 mb-6">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider text-aahar-dark flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-aahar-teal" />
                  Restaurant Dining Orders
                </h2>
                <p className="text-xs text-aahar-body font-medium mt-0.5">
                  Real-time history of table orders placed at certified restaurants
                </p>
              </div>
              <span className="text-xs font-bold text-aahar-body/60 bg-aahar-wash px-3 py-1 rounded-xl border border-aahar-border/40 w-fit">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"} Placed
              </span>
            </div>

            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-8 w-8 text-aahar-teal animate-spin" />
                <p className="text-xs text-aahar-body font-bold uppercase tracking-widest animate-pulse">Loading dining orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-aahar-wash flex items-center justify-center text-aahar-body/40 mx-auto border border-aahar-border/40">
                  <Utensils className="h-8 w-8 text-aahar-teal/60" />
                </div>
                <h3 className="text-base font-bold text-aahar-dark">No dining orders yet</h3>
                <p className="text-xs text-aahar-body leading-relaxed">
                  When you scan a QR code at any AAHAR-certified restaurant and place a table order, it will appear here in real-time.
                </p>
                <div className="pt-2">
                  <Button asChild className="bg-aahar-teal hover:bg-aahar-teal/90 text-white rounded-xl text-xs font-bold px-6">
                    <Link href="/search?mode=eat">Explore Restaurants</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div 
                    key={order.id}
                    className="border border-aahar-border/60 rounded-xl p-5 hover:shadow-md transition-all space-y-4 bg-white relative"
                  >
                    {/* Top Row: Restaurant & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-aahar-wash pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-aahar-teal/10 flex items-center justify-center text-aahar-teal shrink-0">
                          <Utensils className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black tracking-tight text-aahar-dark">
                            {order.restaurant?.name || "Restaurant"}
                          </h4>
                          <div className="flex items-center gap-3 text-[11px] text-aahar-body font-medium">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-aahar-body/40" /> Table {order.tableNumber}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-aahar-body/40" /> {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl ${getOrderStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        {order.restaurant?.slug && (
                          <Link 
                            href={`/restaurant/${order.restaurant.slug}/order/${order.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-aahar-teal hover:underline bg-aahar-wash/60 px-3 py-1 rounded-xl border border-aahar-border/40 transition-all hover:bg-aahar-teal hover:text-white"
                          >
                            Track <ChevronRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Items Ordered */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-aahar-body/50">Items Ordered</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between bg-aahar-wash/40 px-3.5 py-2 rounded-xl text-xs border border-aahar-border/30">
                            <span className="font-semibold text-aahar-dark truncate max-w-[220px]">
                              {item.menuItem?.name || "Item"} <span className="text-aahar-body/60 font-medium">x {item.quantity}</span>
                            </span>
                            <span className="font-black text-aahar-teal">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Row: Notes & Total */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-aahar-wash">
                      <div>
                        {order.notes && (
                          <p className="text-[11px] italic text-aahar-body/70">
                            <span className="font-bold">Note:</span> {order.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right sm:text-right">
                        <span className="text-[9px] font-black uppercase tracking-widest text-aahar-body/50 block">Total Amount</span>
                        <span className="text-base font-black text-[#116d62]">₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Tab 3: Hotel Bookings */}
        {activeTab === "hotel-bookings" && (
          <Card className="bg-white border-aahar-border/60 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-aahar-wash pb-4 mb-6">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider text-aahar-dark flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-aahar-teal" />
                  Hotel Bookings
                </h2>
                <p className="text-xs text-aahar-body font-medium mt-0.5">
                  Track your hotel room bookings and verified stays
                </p>
              </div>
              <span className="text-xs font-bold text-aahar-body/60 bg-aahar-wash px-3 py-1 rounded-xl border border-aahar-border/40 w-fit">
                {stays.length} {stays.length === 1 ? "Stay" : "Stays"}
              </span>
            </div>

            {loadingStays ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-8 w-8 text-aahar-teal animate-spin" />
                <p className="text-xs text-aahar-body font-bold uppercase tracking-widest animate-pulse">Loading bookings...</p>
              </div>
            ) : stays.length === 0 ? (
              <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-aahar-wash flex items-center justify-center text-aahar-body/40 mx-auto border border-aahar-border/40">
                  <Hotel className="h-8 w-8 text-aahar-teal/60" />
                </div>
                <h3 className="text-base font-bold text-aahar-dark">No stay history yet</h3>
                <p className="text-xs text-aahar-body leading-relaxed">
                  When you request room booking or verify stays at certified hotels, your requests and booking status will appear here.
                </p>
                <div className="pt-2">
                  <Button asChild className="bg-aahar-teal hover:bg-aahar-teal/90 text-white rounded-xl text-xs font-bold px-6">
                    <Link href="/search?mode=stay">Explore Certified Hotels</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {stays.map((stay: any) => (
                  <div 
                    key={stay.id}
                    className="border border-aahar-border/60 rounded-xl p-5 hover:shadow-md transition-all space-y-4 bg-white relative"
                  >
                    {/* Top Row: Hotel Name & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-aahar-wash pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-aahar-teal/10 flex items-center justify-center text-aahar-teal shrink-0">
                          <Hotel className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black tracking-tight text-aahar-dark">
                            {stay.hotel?.name || "Hotel"}
                          </h4>
                          {stay.hotel?.city && (
                            <p className="text-[11px] text-aahar-body/60 font-semibold flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {stay.hotel.city}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl ${getStayStatusColor(stay.status)}`}>
                          {stay.status === "declined" ? "Cancelled" : stay.status}
                        </span>

                        {stay.status !== "declined" && stay.status !== "expired" && (
                          <button 
                            type="button"
                            onClick={() => setStayToCancel(stay)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-xl border border-rose-200/70 transition-all cursor-pointer"
                          >
                            <Ban className="h-3 w-3" /> Cancel Stay
                          </button>
                        )}

                        <Link 
                          href={`/enquiries/${stay.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-aahar-teal hover:underline bg-aahar-wash/60 px-3 py-1 rounded-xl border border-aahar-border/40 transition-all hover:bg-aahar-teal hover:text-white"
                        >
                          View Details <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Middle Row: Stay Dates, Room Type, Guests */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-aahar-wash/30 p-3.5 rounded-xl border border-aahar-border/30 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-aahar-body/50 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Stay Dates
                        </span>
                        <p className="font-bold text-aahar-dark">
                          {new Date(stay.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {new Date(stay.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-aahar-body/50 flex items-center gap-1">
                          <BedDouble className="h-3 w-3" /> Room Type
                        </span>
                        <p className="font-bold text-aahar-dark truncate">
                          {stay.roomType?.name || "Standard Room"}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-aahar-body/50 flex items-center gap-1">
                          <Users className="h-3 w-3" /> Guests & Plan
                        </span>
                        <p className="font-bold text-aahar-dark">
                          {stay.adults || stay.guests?.adults || 1} Adults{stay.children || stay.guests?.children ? `, ${stay.children || stay.guests?.children} Children` : ""} {stay.mealPlan ? `· ${stay.mealPlan.toUpperCase()}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Quote amount and timestamp */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                      <span className="text-[11px] text-aahar-body/50 font-medium">
                        Requested on {new Date(stay.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </span>
                      
                      {stay.quoteAmount ? (
                        <div className="text-right">
                          <span className="text-[9px] font-black uppercase tracking-widest text-aahar-body/50 block">Quote / Total</span>
                          <span className="text-base font-black text-[#116d62]">₹{stay.quoteAmount.toLocaleString("en-IN")}</span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-aahar-body/60 italic">Pricing upon confirmation</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

      </div>

      {/* Cancel Stay Confirmation Modal */}
      {stayToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-aahar-border/60 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-aahar-dark">Cancel Stay Booking</h3>
                  <p className="text-xs text-aahar-body font-medium mt-0.5">
                    {stayToCancel.hotel?.name || "Hotel Stay"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setStayToCancel(null); setCancelReason(""); }}
                className="text-aahar-body/50 hover:text-aahar-dark p-1 rounded-lg hover:bg-aahar-wash transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-aahar-wash/40 rounded-xl p-3.5 border border-aahar-border/40 text-xs space-y-1.5">
              <div className="flex justify-between text-aahar-body/70">
                <span>Stay Dates:</span>
                <span className="font-bold text-aahar-dark">
                  {new Date(stayToCancel.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {new Date(stayToCancel.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between text-aahar-body/70">
                <span>Room:</span>
                <span className="font-bold text-aahar-dark">{stayToCancel.roomType?.name || "Standard Room"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">
                Reason for Cancellation (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g., Change of travel plans, dates rescheduled..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="py-2.5 rounded-xl border-aahar-border focus:ring-rose-500 text-xs"
              />
            </div>

            <p className="text-[11px] text-aahar-body/70 leading-relaxed">
              Are you sure you want to cancel this booking request? The hotel manager will be notified immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={cancellingStay}
                onClick={() => { setStayToCancel(null); setCancelReason(""); }}
                className="rounded-xl text-xs font-bold px-4 py-2 border-aahar-border"
              >
                Keep Booking
              </Button>
              <Button
                type="button"
                disabled={cancellingStay}
                onClick={handleCancelStay}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold px-5 py-2 inline-flex items-center gap-1.5 shadow-sm"
              >
                {cancellingStay ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Ban className="h-3.5 w-3.5" />
                    Confirm Cancellation
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
