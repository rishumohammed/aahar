"use client";

import { useEffect, useState } from "react";
import { orderApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock, Utensils, ChefHat, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function OrderTrackerPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await orderApi.get(params.id);
      if (res.data.success) {
        const orderData = res.data.data;
        setOrder(orderData);
        setError(false);

        // Save order details to local storage so user doesn't lose track of it
        try {
          const activeOrderInfo = {
            id: orderData.id,
            restaurantSlug: params.slug,
            restaurantName: orderData.restaurant?.name || "Malabar Heritage",
            tableNumber: orderData.tableNumber,
            totalAmount: orderData.totalAmount,
            createdAt: orderData.createdAt || new Date().toISOString(),
            status: orderData.status || "pending",
          };
          const existing = JSON.parse(localStorage.getItem("aahar_active_orders") || "[]");
          const filtered = existing.filter((o: any) => o.id !== orderData.id);
          localStorage.setItem("aahar_active_orders", JSON.stringify([activeOrderInfo, ...filtered].slice(0, 10)));
        } catch (e) {
          console.error("Failed to save active order to local storage in tracking page:", e);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Poll for order changes every 8 seconds
  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 8000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-aahar-wash p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-aahar-teal border-t-transparent mb-4" />
        <p className="text-sm font-bold text-aahar-body/60 animate-pulse">Establishing secure connection to the kitchen...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-aahar-wash p-6 text-center">
        <AlertCircle className="h-16 w-16 text-rose-500 mb-4" />
        <h3 className="text-xl font-bold text-aahar-dark uppercase tracking-tight">Order Not Found</h3>
        <p className="text-sm text-aahar-body max-w-sm mt-2 mb-6">
          We couldn't retrieve the details for this order. It might have expired or been removed.
        </p>
        <Link href={`/restaurant/${params.slug}`}>
          <Button className="bg-aahar-teal text-white rounded-2xl py-6 px-8 font-bold uppercase tracking-widest text-xs">
            Return to Menu
          </Button>
        </Link>
      </div>
    );
  }

  // Define visual progress mapping
  const STATUS_STAGES = [
    { key: "pending", label: "Received", desc: "Sent to kitchen", color: "text-amber-500", bg: "bg-amber-500", icon: Clock },
    { key: "preparing", label: "In Kitchen", desc: "Chef is cooking", color: "text-blue-500", bg: "bg-blue-500", icon: ChefHat },
    { key: "served", label: "Served", desc: "Brought to your table", color: "text-emerald-500", bg: "bg-emerald-500", icon: Utensils },
    { key: "completed", label: "Completed", desc: "Finished dining", color: "text-aahar-teal", bg: "bg-aahar-teal", icon: CheckCircle2 }
  ];

  const getStageIndex = (status: string) => {
    if (status === "cancelled") return -1;
    return STATUS_STAGES.findIndex(s => s.key === status);
  };

  const currentStageIndex = getStageIndex(order.status);

  return (
    <div className="min-h-screen bg-aahar-wash pb-24">
      {/* Top Header */}
      <header className="bg-white border-b border-aahar-border py-6 px-4 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-2xl flex items-center justify-between">
          <Link href={`/restaurant/${params.slug}`}>
            <Button variant="ghost" className="flex items-center gap-1 text-aahar-body font-bold hover:text-aahar-teal">
              <ChevronLeft className="h-4 w-4" />
              Menu
            </Button>
          </Link>
          <div className="text-right">
            <h2 className="text-sm font-black text-aahar-dark uppercase tracking-tight">{order.restaurant?.name || "Malabar Heritage"}</h2>
            <p className="text-[10px] font-black text-aahar-teal uppercase tracking-widest">Table {order.tableNumber}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 mt-10 space-y-8 animate-in fade-in duration-500">
        
        {/* Status Spotlight */}
        <Card className="p-8 rounded-[2.5rem] border-aahar-border shadow-xl bg-white space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-aahar-teal/5 rounded-full blur-3xl -mr-12 -mt-12" />
          
          <div className="text-center space-y-2 relative z-10">
            <Badge className={cn(
              "px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white border-0",
              order.status === "cancelled" ? "bg-rose-500" :
              order.status === "completed" ? "bg-aahar-teal" :
              order.status === "served" ? "bg-emerald-500" :
              order.status === "preparing" ? "bg-blue-500" : "bg-amber-500"
            )}>
              {order.status.replace("_", " ")}
            </Badge>
            <h1 className="text-2xl font-black text-aahar-dark tracking-tight leading-tight mt-3">
              {order.status === "cancelled" ? "ORDER CANCELLED" :
               order.status === "completed" ? "THANK YOU FOR DINING!" :
               order.status === "served" ? "BON APPÉTIT!" :
               order.status === "preparing" ? "YOUR FOOD IS COOKING!" : "WAITING ON KITCHEN"}
            </h1>
            <p className="text-xs text-aahar-body leading-relaxed max-w-xs mx-auto">
              {order.status === "cancelled" ? "Your order was cancelled by the kitchen staff. Please ask table service for details." :
               order.status === "completed" ? "Your dining session has concluded. We hope you enjoyed your meal!" :
               order.status === "served" ? "All items have been served to Table " + order.tableNumber + ". Enjoy your fresh meal!" :
               order.status === "preparing" ? "Our kitchen staff is preparing your dishes using hygienic standards." :
               "We've safely sent your order to the kitchen. Cooking starts in a few seconds."}
            </p>
          </div>

          {order.status !== "cancelled" && (
            <div className="space-y-6 pt-4 border-t border-aahar-wash relative z-10">
              {/* Tracker Timeline */}
              <div className="grid grid-cols-4 gap-2 relative">
                {/* Horizontal Progress Bar Background */}
                <div className="absolute left-[12.5%] right-[12.5%] top-4 h-1 bg-aahar-wash -translate-y-1/2 z-0 rounded-full" />
                {/* Active progress */}
                {currentStageIndex > 0 && (
                  <div 
                    className="absolute left-[12.5%] top-4 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-1000" 
                    style={{ width: `${(currentStageIndex / 3) * 75}%` }}
                  />
                )}

                {STATUS_STAGES.map((stage, idx) => {
                  const StageIcon = stage.icon;
                  const isCompleted = idx < currentStageIndex;
                  const isActive = idx === currentStageIndex;
                  return (
                    <div key={stage.key} className="flex flex-col items-center text-center space-y-2 relative z-10">
                      <div className={cn(
                        "w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md transition-all duration-500",
                        isCompleted ? "bg-emerald-500 text-white" :
                        isActive ? `${stage.bg} text-white scale-110 shadow-lg shadow-emerald-500/20` :
                        "bg-white text-aahar-body/40"
                      )}>
                        <StageIcon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-tight",
                          isActive ? stage.color : isCompleted ? "text-emerald-500" : "text-aahar-body/40"
                        )}>
                          {stage.label}
                        </p>
                        <p className="text-[8px] text-aahar-body/40 hidden md:block mt-0.5 leading-none">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* receipt Summary Card */}
        <Card className="p-8 rounded-[2.5rem] border-aahar-border shadow-md bg-white space-y-6">
          <div className="border-b border-aahar-wash pb-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-aahar-body/40">Dine-in Receipt</h3>
            <p className="text-xs font-bold text-aahar-dark mt-1">Order Ref: #{order.id.substring(order.id.length - 7).toUpperCase()}</p>
          </div>

          <div className="divide-y divide-aahar-wash">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center py-4 text-sm font-bold">
                <div className="space-y-1">
                  <p className="text-aahar-dark">{item.menuItem?.name || "Menu Item"}</p>
                  {item.notes && <p className="text-xs text-rose-500 font-medium italic">"{item.notes}"</p>}
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-aahar-body/60 text-xs mr-3">{item.quantity} x ₹{item.price}</span>
                  <span className="text-aahar-dark">₹{item.quantity * item.price}</span>
                </div>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="p-4 bg-aahar-wash/50 rounded-2xl border border-aahar-border/30 text-xs leading-relaxed text-aahar-body">
              <span className="font-bold text-aahar-dark uppercase tracking-widest text-[9px] block mb-1">Diner Notes</span>
              "{order.notes}"
            </div>
          )}

          <div className="pt-4 border-t border-aahar-wash flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-aahar-body/60">Total Bill (Dine-in)</span>
            <span className="text-xl font-black text-aahar-teal">₹{order.totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </Card>

        {/* Live Support / Counter Card */}
        <Card className="p-6 rounded-[2rem] border-aahar-border shadow-sm bg-white/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-aahar-dark">Need anything else?</h4>
            <p className="text-xs text-aahar-body leading-relaxed">
              Order extra items by returning to the menu. The kitchen will automatically merge them into your table bill.
            </p>
          </div>
          <Link href={`/restaurant/${params.slug}`}>
            <Button className="bg-aahar-dark text-white rounded-xl font-bold text-xs uppercase tracking-widest px-6 py-4 hover:bg-aahar-dark/95 shrink-0">
              Add More Items
            </Button>
          </Link>
        </Card>

      </main>
    </div>
  );
}
