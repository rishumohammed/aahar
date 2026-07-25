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
      phone: user?.phone || "",
      password: ""
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        phone: user.phone || "",
        password: ""
      });
    }
  }, [user, reset]);

  useEffect(() => {
    orderApi.getCustomerOrders()
      .then(res => {
        setOrders(res.data.data);
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
        phone: values.phone || ""
      };
      if (values.password) {
        payload.password = values.password;
      }
      const response = await authApi.updateProfile(payload);
      updateUser(response.data.data);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-aahar-border/60 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-aahar-teal/10 flex items-center justify-center text-aahar-teal">
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-aahar-dark tracking-tight">{user?.name}</h1>
              <p className="text-xs text-aahar-body font-bold uppercase tracking-widest bg-aahar-wash px-2.5 py-1 rounded-lg inline-block mt-1 border border-aahar-border/40">
                Consumer Account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-aahar-wash">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "profile" 
                  ? "bg-aahar-teal text-white shadow-lg shadow-aahar-teal/20" 
                  : "bg-white text-aahar-body border border-aahar-border/50 hover:bg-aahar-wash"
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
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
            <Card className="lg:col-span-1 bg-white border-aahar-border/60 rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black uppercase tracking-wider text-aahar-dark border-b border-aahar-wash pb-3">
                Account Details
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-aahar-teal" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-aahar-body/50">Email Address</p>
                    <p className="text-sm font-medium text-aahar-dark truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-aahar-teal" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-aahar-body/50">Phone Number</p>
                    <p className="text-sm font-medium text-aahar-dark">{user?.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-aahar-teal" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-aahar-body/50">Joined Network</p>
                    <p className="text-sm font-medium text-aahar-dark">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Profile editor form */}
            <Card className="lg:col-span-2 bg-white border-aahar-border/60 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-black uppercase tracking-wider text-aahar-dark border-b border-aahar-wash pb-3 mb-6">
                Update Profile Info
              </h2>

              <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-aahar-body/30" />
                      <Input 
                        type="text"
                        className="pl-11 py-5 rounded-xl border-aahar-border focus:ring-aahar-teal bg-white text-xs"
                        {...register("name")}
                      />
                    </div>
                    {errors.name && <p className="text-[11px] text-rose-500 font-bold pl-1">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-aahar-body/30" />
                      <Input 
                        type="text"
                        className="pl-11 py-5 rounded-xl border-aahar-border focus:ring-aahar-teal bg-white text-xs"
                        {...register("phone")}
                      />
                    </div>
                    {errors.phone && <p className="text-[11px] text-rose-500 font-bold pl-1">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-aahar-body/60 pl-1">Change Password (Optional)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-aahar-body/30" />
                    <Input 
                      type="password"
                      placeholder="Enter new password (min 6 chars)"
                      className="pl-11 py-5 rounded-xl border-aahar-border focus:ring-aahar-teal bg-white text-xs"
                      {...register("password")}
                    />
                  </div>
                  {errors.password && <p className="text-[11px] text-rose-500 font-bold pl-1">{errors.password.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  disabled={updatingProfile}
                  className="bg-aahar-dark text-white rounded-xl py-5 px-6 font-black uppercase tracking-widest text-[10px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {updatingProfile ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>
                  ) : (
                    <span className="flex items-center gap-2"><UserCheck className="h-4 w-4" /> Save Profile Changes</span>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* Tab 2: Orders View */}
        {activeTab === "orders" && (
          <Card className="bg-white border-aahar-border/60 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
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
