"use client";

import { useEffect, useState, useRef } from "react";
import { restaurantApi, orderApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  Clock, 
  Play, 
  CheckCircle, 
  Trash2, 
  Loader2, 
  User, 
  Search,
  DollarSign,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Web Audio API Synthesizer for high-fidelity notification chimes
const playChime = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Tone 1 (High pitch)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.5);

    // Tone 2 (Delayed, slightly lower pitch)
    setTimeout(() => {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime); // A5
      gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.7);
    }, 120);
  } catch (err) {
    console.warn("Could not play native audio chime:", err);
  }
};

type TabValue = "all" | "pending" | "preparing" | "served" | "completed";

export default function OwnerOrdersPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Keep ref of order IDs to track when a new order arrives
  const knownOrderIds = useRef<Set<string>>(new Set());

  const fetchOrders = async (resId: string) => {
    try {
      const r = await orderApi.listRestaurantOrders(resId);
      if (r.data.success) {
        const fetchedOrders = r.data.data || [];
        
        // Check for new pending orders to ring chime
        let hasNewPending = false;
        fetchedOrders.forEach((o: any) => {
          if (o.status === "pending" && !knownOrderIds.current.has(o.id)) {
            hasNewPending = true;
          }
          knownOrderIds.current.add(o.id);
        });

        if (hasNewPending && knownOrderIds.current.size > 0) {
          playChime();
        }

        setOrders(fetchedOrders);
      }
    } catch (err) {
      console.error("Error loading restaurant orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load restaurant & seed polling
  useEffect(() => {
    restaurantApi.list({ limit: 1 })
      .then(res => {
        const restaurant = res.data.data.items[0];
        if (restaurant) {
          setRestaurantId(restaurant.id);
          fetchOrders(restaurant.id);
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to load restaurant profile:", err);
        setLoading(false);
      });
  }, []);

  // Set up 10-second polling for active order updates
  useEffect(() => {
    if (!restaurantId) return;
    const interval = setInterval(() => fetchOrders(restaurantId), 10000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await orderApi.updateStatus(orderId, newStatus);
      if (res.data.success && restaurantId) {
        await fetchOrders(restaurantId);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Compute analytics
  const activeOrdersCount = orders.filter(o => ["pending", "preparing", "served"].includes(o.status)).length;
  const todayRevenue = orders
    .filter(o => o.status === "completed")
    .reduce((acc, o) => acc + o.totalAmount, 0);

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (activeTab !== "all" && activeTab !== "completed") {
      if (o.status !== activeTab) return false;
    } else if (activeTab === "completed") {
      if (!["completed", "cancelled"].includes(o.status)) return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTable = o.tableNumber?.toString().includes(query);
      const matchCustomer = o.customerName?.toLowerCase().includes(query);
      return matchTable || matchCustomer;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-12 w-64 bg-slate-50 rounded-md animate-pulse mb-10" />
        <div className="h-[60vh] bg-slate-50 rounded-lg border border-slate-200 animate-pulse" />
      </div>
    );
  }

  const TABS: { label: string; value: TabValue; count: number }[] = [
    { label: "All Active", value: "all", count: activeOrdersCount },
    { label: "Pending", value: "pending", count: orders.filter(o => o.status === "pending").length },
    { label: "In Kitchen", value: "preparing", count: orders.filter(o => o.status === "preparing").length },
    { label: "Served", value: "served", count: orders.filter(o => o.status === "served").length },
    { label: "History", value: "completed", count: orders.filter(o => ["completed", "cancelled"].includes(o.status)).length },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-admin-primary/10 rounded-lg text-admin-primary">
            <ClipboardList className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dine-in Orders</h1>
            <p className="text-slate-500 font-medium mt-1 text-sm">Manage live customer orders and table service.</p>
          </div>
        </div>

        {/* Analytics Highlights */}
        <div className="flex gap-4">
          <Card className="px-5 py-3.5 bg-white border-slate-200 flex items-center gap-4 rounded-md shadow-sm shrink-0">
            <div className="p-2.5 rounded-md bg-amber-500/10 text-amber-500">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500/40">Active Tables</p>
              <h4 className="text-sm font-bold text-slate-800 mt-0.5">{activeOrdersCount} Tables</h4>
            </div>
          </Card>
          <Card className="px-5 py-3.5 bg-white border-slate-200 flex items-center gap-4 rounded-md shadow-sm shrink-0">
            <div className="p-2.5 rounded-md bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500/40">Settled Revenue</p>
              <h4 className="text-sm font-bold text-admin-primary mt-0.5">₹{todayRevenue}</h4>
            </div>
          </Card>
        </div>
      </div>

      <Card className="bg-white rounded-lg border-0 shadow-md overflow-hidden flex flex-col">
        {/* Table Header / Filters */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 border whitespace-nowrap",
                    activeTab === tab.value 
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {tab.label}
                  <Badge variant={activeTab === tab.value ? "secondary" : "outline"} className={cn("text-[10px] ml-1", activeTab === tab.value ? "bg-white/20 text-white border-none" : "")}>
                    {tab.count}
                  </Badge>
                </button>
              ))}
            </div>
            
            <div className="relative group shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search table or customer..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm rounded-md border-slate-300 bg-white w-full sm:w-64 focus:ring-2 focus:ring-admin-primary transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Table & Time</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 min-w-[200px]">Order Summary</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                const isUpdating = updatingOrderId === order.id;
                const minutesAgo = Math.max(0, Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000));
                
                return (
                  <tr key={order.id} className={cn(
                    "hover:bg-slate-50/50 transition-colors group",
                    order.status === "cancelled" && "bg-rose-50/30 hover:bg-rose-50/50"
                  )}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 rounded-md">
                          T-{order.tableNumber}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>{minutesAgo === 0 ? "Just now" : `${minutesAgo}m ago`}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-800">{order.customerName || "Anonymous Diner"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-700 font-medium">
                          {order.items?.length || 0} Items
                        </p>
                        {order.notes && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 border border-amber-200/60 mt-1">
                            <span className="text-[10px] font-semibold text-amber-800 truncate max-w-[200px]">Note: {order.notes}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-800">₹{order.totalAmount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={cn(
                        "text-xs font-semibold uppercase tracking-wider border-0 px-2.5 py-1",
                        order.status === "pending" ? "bg-amber-100 text-amber-600" :
                        order.status === "preparing" ? "bg-blue-100 text-blue-600" :
                        order.status === "served" ? "bg-emerald-100 text-emerald-600" :
                        order.status === "cancelled" ? "bg-rose-100 text-rose-500" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2">
                        {order.status === "pending" && (
                          <>
                            <Button 
                              onClick={() => updateStatus(order.id, "cancelled")}
                              disabled={!!updatingOrderId}
                              variant="ghost" size="sm"
                              className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => updateStatus(order.id, "preparing")}
                              disabled={!!updatingOrderId}
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm font-semibold h-8"
                            >
                              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Play className="h-3 w-3 mr-1" />} Cook
                            </Button>
                          </>
                        )}
                        
                        {order.status === "preparing" && (
                          <Button 
                            onClick={() => updateStatus(order.id, "served")}
                            disabled={!!updatingOrderId}
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm font-semibold h-8"
                          >
                            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />} Serve
                          </Button>
                        )}
                        
                        {order.status === "served" && (
                          <Button 
                            onClick={() => updateStatus(order.id, "completed")}
                            disabled={!!updatingOrderId}
                            size="sm"
                            className="bg-admin-primary hover:bg-admin-primary-hover text-white shadow-sm font-semibold h-8"
                          >
                            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />} Settle
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center bg-slate-50/50">
                    <ClipboardList className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600">No orders found</p>
                    <p className="text-xs text-slate-500 mt-1">There are no orders matching your current view.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
