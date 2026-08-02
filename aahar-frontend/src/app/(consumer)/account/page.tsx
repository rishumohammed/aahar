"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Utensils, 
  ChevronRight, 
  Lock, 
  Loader2, 
  UserCheck 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { orderApi, authApi } from "@/lib/api";

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
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

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

  useEffect(() => {
    orderApi.getCustomerOrders()
      .then(res => {
        setOrders(res.data.data || []);
      })
      .catch(err => {
        console.error("Failed to load customer orders:", err);
        toast.error("Could not retrieve order history.");
      })
      .finally(() => {
        setLoadingOrders(false);
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
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-600 border border-amber-100";
      case "preparing": return "bg-blue-50 text-blue-600 border border-blue-100";
      case "served": return "bg-purple-50 text-purple-600 border border-purple-100";
      case "completed": return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "cancelled": return "bg-rose-50 text-rose-600 border border-rose-100";
      default: return "bg-gray-50 text-gray-600 border border-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-aahar-wash py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-aahar-border/60 rounded-xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-aahar-teal/10 flex items-center justify-center text-aahar-teal shadow-inner">
              <UserIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-aahar-dark tracking-tight">{user?.name || "My Account"}</h1>
              <p className="text-xs text-aahar-body font-bold uppercase tracking-widest bg-aahar-wash px-2.5 py-1 rounded-lg inline-block mt-1 border border-aahar-border/40">
                Consumer Account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-aahar-wash">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "profile" 
                  ? "bg-aahar-teal text-white shadow-lg shadow-aahar-teal/20" 
                  : "bg-white text-aahar-body border border-aahar-border/50 hover:bg-aahar-wash"
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "orders" 
                  ? "bg-aahar-teal text-white shadow-lg shadow-aahar-teal/20" 
                  : "bg-white text-aahar-body border border-aahar-border/50 hover:bg-aahar-wash"
              }`}
            >
              Order History ({orders.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Profile View */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Profile details card */}
            <Card className="lg:col-span-1 bg-white border-aahar-border/60 rounded-xl p-6 md:p-8 shadow-sm space-y-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider text-aahar-dark border-b border-aahar-wash pb-3 mb-6">
                  Account Details
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-aahar-wash/30 p-3.5 rounded-xl border border-aahar-border/40">
                    <div className="w-10 h-10 rounded-lg bg-aahar-teal/10 flex items-center justify-center text-aahar-teal shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-wider text-aahar-body/50">Email Address</p>
                      <p className="text-xs font-bold text-aahar-dark truncate">{user?.email || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-aahar-wash/30 p-3.5 rounded-xl border border-aahar-border/40">
                    <div className="w-10 h-10 rounded-lg bg-aahar-teal/10 flex items-center justify-center text-aahar-teal shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-wider text-aahar-body/50">Phone Number</p>
                      <p className="text-xs font-bold text-aahar-dark truncate">{user?.phone || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-aahar-wash/30 p-3.5 rounded-xl border border-aahar-border/40">
                    <div className="w-10 h-10 rounded-lg bg-aahar-teal/10 flex items-center justify-center text-aahar-teal shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-wider text-aahar-body/50">Joined Network</p>
                      <p className="text-xs font-bold text-aahar-dark">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Active Member"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-aahar-wash text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-lg border border-emerald-100 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Verified Consumer Account
                </span>
              </div>
            </Card>

            {/* Profile editor form */}
            <Card className="lg:col-span-2 bg-white border-aahar-border/60 rounded-xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-aahar-wash pb-3 mb-6">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wider text-aahar-dark">
                    Edit Profile Information
                  </h2>
                  <p className="text-xs text-aahar-body font-medium mt-0.5">
                    Update your account credentials and personal information
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-5">
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
                        placeholder="Enter new password (min 6 chars)"
                        className="pl-11 py-5 rounded-xl border-aahar-border focus:ring-aahar-teal bg-white text-xs font-semibold"
                        {...register("password")}
                      />
                    </div>
                    {errors.password && <p className="text-[11px] text-rose-500 font-bold pl-1">{errors.password.message}</p>}
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={updatingProfile}
                    className="bg-aahar-dark hover:bg-aahar-dark/90 text-white rounded-xl py-5 px-8 font-black uppercase tracking-widest text-[10px] shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    {updatingProfile ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving Changes...</span>
                    ) : (
                      <span className="flex items-center gap-2"><UserCheck className="h-4 w-4" /> Save Profile Changes</span>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Tab 2: Orders View */}
        {activeTab === "orders" && (
          <Card className="bg-white border-aahar-border/60 rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-black uppercase tracking-wider text-aahar-dark border-b border-aahar-wash pb-3 mb-6">
              Dining Table Orders
            </h2>

            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-8 w-8 text-aahar-teal animate-spin" />
                <p className="text-xs text-aahar-body font-bold uppercase tracking-widest animate-pulse">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-aahar-wash flex items-center justify-center text-aahar-body/40 mx-auto">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-aahar-dark">No orders placed yet</h3>
                <p className="text-xs text-aahar-body">
                  When you scan a QR code at any AAHAR-certified restaurant and place a table order, it will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div 
                    key={order.id}
                    className="border border-aahar-border/50 rounded-2xl p-5 hover:shadow-md transition-all space-y-4 bg-white relative"
                  >
                    {/* Top Row: Restaurant & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-aahar-wash/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-aahar-teal" />
                        <h4 className="text-sm font-black tracking-tight text-aahar-dark">
                          {order.restaurant?.name || "Restaurant"}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Items & Quantities */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-aahar-body/50">Items Ordered</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between bg-aahar-wash/40 px-3 py-2 rounded-xl text-xs">
                            <span className="font-semibold text-aahar-dark truncate max-w-[200px]">
                              {item.menuItem?.name || "Menu Item"} <span className="text-aahar-body/60 font-medium">x {item.quantity}</span>
                            </span>
                            <span className="font-black text-aahar-teal">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Row: Metadata & Total */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-aahar-body font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> Table {order.tableNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                      
                      <div className="text-right sm:text-left">
                        <span className="text-[9px] font-black uppercase tracking-widest text-aahar-body/50 block">Total Amount</span>
                        <span className="text-base font-black text-[#116d62]">₹{order.totalAmount}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="text-[11px] italic bg-amber-50/40 text-aahar-body border border-amber-100/30 p-2 rounded-xl">
                        Note: {order.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

      </div>
    </div>
  );
}
