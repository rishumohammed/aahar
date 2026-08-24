"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  CreditCard,
  Building2,
  Utensils,
  Search
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"restaurants" | "hotels">("restaurants");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await adminApi.systemOrders();
      setData(res.data.data);
    } catch (e) {
      console.error("Error fetching system orders", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-primary border-t-transparent" />
      </div>
    );
  }

  const KPIS = [
    { label: "Total Restaurant Orders", value: data?.kpis?.totalOrders || "0", sub: "All time orders", icon: Utensils, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Order Revenue", value: `₹${(data?.kpis?.orderRevenue || 0).toLocaleString()}`, sub: "Completed orders", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Hotel Bookings", value: data?.kpis?.totalBookings || "0", sub: "Confirmed bookings", icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Booking Revenue", value: `₹${(data?.kpis?.bookingRevenue || 0).toLocaleString()}`, sub: "Confirmed volume", icon: ShoppingCart, color: "text-admin-text", bg: "bg-admin-light" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Orders & Bookings</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">System-wide overview of transactions across the network.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPIS.map((kpi, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={kpi.label}
          >
            <Card className="p-6 rounded-lg border-0 shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-full", kpi.bg)}>
                  <kpi.icon className={cn("h-6 w-6", kpi.color)} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{kpi.label}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{kpi.value}</h3>
                <p className="text-sm text-slate-500 mt-1">{kpi.sub}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("restaurants")}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors", 
            activeTab === "restaurants" ? "border-admin-primary text-admin-text" : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Restaurant Orders
        </button>
        <button 
          onClick={() => setActiveTab("hotels")}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors", 
            activeTab === "hotels" ? "border-admin-primary text-admin-text" : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Hotel Bookings
        </button>
      </div>

      <Card className="bg-white rounded-lg border-0 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
            {activeTab === "restaurants" ? "Recent Restaurant Orders" : "Recent Hotel Bookings"}
          </h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 rounded-md border-slate-300 bg-white w-64 focus:ring-2 focus:ring-admin-primary transition-shadow"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === "restaurants" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Order ID</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Restaurant</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Customer</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.restaurantOrders?.length > 0 ? data.restaurantOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{order.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-slate-800">{order.restaurant?.name || "Unknown"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.customerName || order.customer?.name || "Guest"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                        order.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                        order.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">₹{order.totalAmount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">No restaurant orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Booking ID</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Hotel</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Guest</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Quote</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.hotelBookings?.length > 0 ? data.hotelBookings.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{booking.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-slate-800">{booking.hotel?.name || "Unknown"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{booking.guest?.name || "Guest"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                        ["confirmed", "checked_in", "checked_out"].includes(booking.status) ? "bg-emerald-50 text-emerald-700" :
                        ["declined", "expired"].includes(booking.status) ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                      )}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {booking.quoteAmount != null 
                        ? `₹${booking.quoteAmount}` 
                        : (booking.status === "sent" || booking.status === "viewed") 
                          ? "Pending Quote" 
                          : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(booking.checkIn).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">No hotel bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
