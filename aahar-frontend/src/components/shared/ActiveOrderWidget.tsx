"use client";

import { useEffect, useState } from "react";
import { orderApi } from "@/lib/api";
import { X, ChevronRight, Clock, ChefHat, Utensils, CheckCircle2, AlertCircle, Minimize2, Maximize2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ActiveOrder {
  id: string;
  restaurantSlug: string;
  restaurantName: string;
  tableNumber: string;
  totalAmount?: number;
  createdAt: string;
  status: string;
}

const STATUS_CONFIGS: Record<string, { label: string; bg: string; text: string; icon: any; pulse: string }> = {
  pending: { label: "Received", bg: "bg-amber-500/10", text: "text-amber-600", icon: Clock, pulse: "bg-amber-500" },
  preparing: { label: "Cooking", bg: "bg-blue-500/10", text: "text-blue-600", icon: ChefHat, pulse: "bg-blue-500" },
  served: { label: "Served", bg: "bg-emerald-500/10", text: "text-emerald-600", icon: Utensils, pulse: "bg-emerald-500" },
  completed: { label: "Completed", bg: "bg-aahar-teal/10", text: "text-aahar-teal", icon: CheckCircle2, pulse: "bg-aahar-teal" },
  cancelled: { label: "Cancelled", bg: "bg-rose-500/10", text: "text-rose-600", icon: AlertCircle, pulse: "bg-rose-500" },
};

export default function ActiveOrderWidget() {
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const loadAndPollOrders = async () => {
    try {
      const stored = localStorage.getItem("aahar_active_orders");
      if (!stored) return;

      const parsed: ActiveOrder[] = JSON.parse(stored);
      if (!parsed.length) return;

      // Filter to only potentially active ones for real-time polling
      const activeCandidates = parsed.filter(o => o.status !== "completed" && o.status !== "cancelled");
      if (!activeCandidates.length) {
        setActiveOrders([]);
        return;
      }

      // Fetch statuses in parallel
      const updatedOrders = await Promise.all(
        parsed.map(async (order) => {
          if (order.status === "completed" || order.status === "cancelled") {
            return order;
          }
          try {
            const res = await orderApi.get(order.id);
            if (res.data.success) {
              const fresh = res.data.data;
              return {
                ...order,
                status: fresh.status,
                totalAmount: fresh.totalAmount || order.totalAmount,
              };
            }
          } catch (e) {
            console.error("Error polling order:", order.id, e);
          }
          return order;
        })
      );

      // Save back to localStorage if changed
      const hasChanges = JSON.stringify(parsed) !== JSON.stringify(updatedOrders);
      if (hasChanges) {
        localStorage.setItem("aahar_active_orders", JSON.stringify(updatedOrders));
      }

      // Update state with only currently active ones (pending, preparing, served)
      const currentActive = updatedOrders.filter(o => o.status !== "completed" && o.status !== "cancelled");
      setActiveOrders(currentActive);
    } catch (e) {
      console.error("ActiveOrderWidget polling failed:", e);
    }
  };

  useEffect(() => {
    // Initial load
    loadAndPollOrders();

    // Poll every 10 seconds
    const interval = setInterval(loadAndPollOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Listen to custom event or standard storage events to update immediately if placed in same tab
  useEffect(() => {
    const handleStorageChange = () => {
      loadAndPollOrders();
    };
    window.addEventListener("storage", handleStorageChange);
    // Also poll when window gets focus
    window.addEventListener("focus", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  if (isDismissed || activeOrders.length === 0) return null;

  // Track the most recent active order
  const order = activeOrders[0];
  const config = STATUS_CONFIGS[order.status] || STATUS_CONFIGS.pending;
  const StatusIcon = config.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm px-4 md:px-0 animate-in slide-in-from-bottom-8 duration-500">
      <div className={cn(
        "relative rounded-[2rem] border border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl p-5 transition-all duration-300",
        isMinimized ? "max-h-16 py-3" : "max-h-[300px]"
      )}>
        {/* Glowing Ambient Aura */}
        <div className={cn(
          "absolute -inset-px rounded-[2rem] opacity-30 blur-md transition-all duration-1000 -z-10",
          order.status === "served" ? "bg-emerald-500" :
          order.status === "preparing" ? "bg-blue-500" : "bg-amber-500"
        )} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status Pulse Circle */}
            <div className={cn("relative flex h-3 w-3")}>
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", config.pulse)} />
              <span className={cn("relative inline-flex rounded-full h-3 w-3", config.pulse)} />
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-aahar-dark">
              Active Table Order
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-full bg-aahar-wash hover:bg-aahar-border/30 text-aahar-body/60 hover:text-aahar-dark transition-all"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            </button>
            <button 
              onClick={() => setIsDismissed(true)} 
              className="p-1 rounded-full bg-aahar-wash hover:bg-rose-50 text-aahar-body/60 hover:text-rose-500 transition-all"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="mt-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="border-t border-aahar-border/40 pt-3">
              <h4 className="text-sm font-black text-aahar-dark leading-tight">
                {order.restaurantName}
              </h4>
              <p className="text-[10px] font-bold text-aahar-body/60 mt-1 uppercase tracking-wider">
                Table {order.tableNumber} • Bill: ₹{order.totalAmount}
              </p>
            </div>

            {/* Stage/Status Badge */}
            <div className={cn("flex items-center gap-3 p-3 rounded-2xl border border-aahar-border/20", config.bg)}>
              <div className={cn("p-2 rounded-xl bg-white text-md shadow-sm", config.text)}>
                <StatusIcon className="h-4 w-4" />
              </div>
              <div>
                <p className={cn("text-xs font-black uppercase tracking-wider", config.text)}>
                  {config.label}
                </p>
                <p className="text-[9px] text-aahar-body/70 mt-0.5 leading-none">
                  {order.status === "pending" ? "Waiting for kitchen acceptance" :
                   order.status === "preparing" ? "Chef is cooking your order" :
                   order.status === "served" ? "Delivered to your table" : "Update pending"}
                </p>
              </div>
            </div>

            <Link href={`/restaurant/${order.restaurantSlug}/order/${order.id}`}>
              <button className="w-full mt-1 bg-aahar-dark hover:bg-aahar-dark/90 text-white rounded-2xl py-3.5 px-4 font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5">
                <span>View Full Tracker</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
