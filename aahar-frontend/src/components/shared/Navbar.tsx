"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Bell, User, LogOut, LayoutDashboard, Search, Utensils, ChefHat, Clock, CheckCircle2, AlertCircle, Trash2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { orderApi } from "@/lib/api";
import ActiveOrderWidget from "./ActiveOrderWidget";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Restaurants", href: "/search?mode=eat" },
  { label: "Stay", href: "/search?mode=stay" },
  { label: "Certify", href: "/certify" },
  { label: "Verify", href: "/verify" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const { user, isAuthenticated, token, clearAuth } = useAuthStore();
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active orders states
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const fetchNavbarOrders = async () => {
    try {
      const stored = localStorage.getItem("aahar_active_orders");
      if (!stored) {
        setOrders([]);
        setActiveOrdersCount(0);
        return;
      }
      const parsed = JSON.parse(stored);
      setOrders(parsed);
      setActiveOrdersCount(parsed.filter((o: any) => o.status !== "completed" && o.status !== "cancelled").length);

      // If the dropdown is open, poll/fetch fresh statuses in parallel
      if (ordersOpen && parsed.length > 0) {
        const freshOrders = await Promise.all(parsed.map(async (order: any) => {
          if (order.status === "completed" || order.status === "cancelled") return order;
          try {
            const res = await orderApi.get(order.id);
            if (res.data.success) {
              return {
                ...order,
                status: res.data.data.status,
                totalAmount: res.data.data.totalAmount || order.totalAmount
              };
            }
          } catch (e) {
            console.error("Fresh Navbar order load fail:", e);
          }
          return order;
        }));
        
        // Save back if there are changes
        if (JSON.stringify(parsed) !== JSON.stringify(freshOrders)) {
          localStorage.setItem("aahar_active_orders", JSON.stringify(freshOrders));
          setOrders(freshOrders);
          setActiveOrdersCount(freshOrders.filter((o: any) => o.status !== "completed" && o.status !== "cancelled").length);
        }
      }
    } catch (e) {
      console.error("fetchNavbarOrders failed:", e);
    }
  };

  const clearOrderHistory = () => {
    localStorage.removeItem("aahar_active_orders");
    setOrders([]);
    setActiveOrdersCount(0);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Poll for navbar orders
  useEffect(() => {
    fetchNavbarOrders();
    const interval = setInterval(fetchNavbarOrders, 8000);
    return () => clearInterval(interval);
  }, [ordersOpen]);

  const fetchNotifications = () => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(d => {
      setNotifs(d.data?.notifications ?? []);
      setUnread(d.data?.unreadCount ?? 0);
    })
    .catch(console.error);
  };

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Load initial notifications
    fetchNotifications();

    // Real-time updates via Socket.io
    const socket = getSocket();
    
    // When a relevant event occurs, refetch notifications so the dropdown has the latest items
    socket.on("new_enquiry", fetchNotifications);
    socket.on("enquiry_status_changed", fetchNotifications);
    socket.on("new_message", fetchNotifications);
    socket.on("new_application", fetchNotifications);
    socket.on("application_status_changed", fetchNotifications);
    socket.on("new_application_message", fetchNotifications);
    socket.on("cert_issued", fetchNotifications);
    socket.on("new_order", fetchNotifications);

    return () => {
      socket.off("new_enquiry", fetchNotifications);
      socket.off("enquiry_status_changed", fetchNotifications);
      socket.off("new_message", fetchNotifications);
      socket.off("new_application", fetchNotifications);
      socket.off("application_status_changed", fetchNotifications);
      socket.off("new_application_message", fetchNotifications);
      socket.off("cert_issued", fetchNotifications);
      socket.off("new_order", fetchNotifications);
    };
  }, [isAuthenticated, token]);

  const markAllRead = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });
    setUnread(0);
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getDashboardUrl = () => {
    if (!user) return "/auth/login";
    switch (user.role) {
      case "super_admin":
      case "admin":         return "/admin/dashboard";
      case "auditor":       return "/auditor/dashboard";
      case "owner":         return "/owner/dashboard";
      case "hotel_manager": return "/manager/dashboard";
      default:              return "/profile";
    }
  };

  return (
    <>
      <header className={cn(
        "sticky top-0 z-[60] w-full transition-all duration-300",
        scrolled ? "bg-aahar-dark/95 backdrop-blur-md py-3 shadow-2xl" : "bg-aahar-teal py-5"
      )}>
      <nav className="container mx-auto px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-black/20">
              <span className="text-aahar-teal font-bold text-xl">A</span>
            </div>
              <span className="text-2xl font-bold tracking-tight text-white">AAHAR</span>
          </Link>
        </div>

        {/* Center: Menu Items */}
        <div className="hidden lg:flex items-center justify-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Auth/Notifications */}
        <div className="flex items-center justify-end gap-6">
          {/* Active Table Orders Dropdown (Accessible to Guests & Authenticated Users) */}
          <div className="relative">
            <button
              onClick={() => {
                setOrdersOpen(!ordersOpen);
                setBellOpen(false); // Close notifications bell if open
              }}
              className="relative w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all group"
            >
              <Utensils className="h-5 w-5 text-white transition-transform group-hover:scale-110" />
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-lg animate-pulse">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            {ordersOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOrdersOpen(false)} />
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] border border-aahar-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-aahar-wash">
                    <span className="text-xs font-black uppercase tracking-widest text-aahar-dark">Active Orders</span>
                    {orders.length > 0 && (
                      <button onClick={clearOrderHistory} className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1">
                        <Trash2 className="h-3 w-3" />
                        Clear History
                      </button>
                    )}
                  </div>
                  <div className="max-h-[350px] overflow-y-auto no-scrollbar divide-y divide-aahar-wash">
                    {orders.length === 0 ? (
                      <div className="text-center py-12 px-6 space-y-2">
                        <Utensils className="h-8 w-8 text-aahar-wash mx-auto mb-1" />
                        <p className="text-xs font-bold text-aahar-dark uppercase tracking-tight">No Active Orders</p>
                        <p className="text-[10px] font-medium text-aahar-body/60 leading-normal max-w-[200px] mx-auto">
                          Scan a restaurant QR code to place a table order and track its status live.
                        </p>
                      </div>
                    ) : (
                      orders.map(o => {
                        const isCompletedOrCancelled = o.status === "completed" || o.status === "cancelled";
                        return (
                          <div key={o.id} className="p-5 hover:bg-aahar-wash/50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="space-y-0.5">
                                <h5 className="text-xs font-black text-aahar-dark line-clamp-1 leading-snug">
                                  {o.restaurantName}
                                </h5>
                                <p className="text-[9px] font-bold text-aahar-body/60 mt-1 uppercase tracking-wider">
                                  Table {o.tableNumber} • Bill: ₹{o.totalAmount}
                                </p>
                              </div>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white shrink-0",
                                o.status === "completed" ? "bg-aahar-teal" :
                                o.status === "cancelled" ? "bg-rose-500" :
                                o.status === "served" ? "bg-emerald-500 animate-pulse" :
                                o.status === "preparing" ? "bg-blue-500 animate-pulse" : "bg-amber-500 animate-pulse"
                              )}>
                                {o.status}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-3.5">
                              <Link href={`/restaurant/${o.restaurantSlug}/order/${o.id}`} className="flex-1" onClick={() => setOrdersOpen(false)}>
                                <Button type="button"  className="w-full bg-aahar-dark hover:bg-aahar-dark/95 text-white text-[9px] py-1.5 h-auto rounded-xl font-bold uppercase tracking-wider">
                                  Track Details
                                </Button>
                              </Link>
                              {!isCompletedOrCancelled && (
                                <Link href={`/restaurant/${o.restaurantSlug}?table=${o.tableNumber}`} className="flex-1" onClick={() => setOrdersOpen(false)}>
                                  <Button type="button"  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] py-1.5 h-auto rounded-xl font-bold uppercase tracking-wider">
                                    Add Items
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setBellOpen(v => !v);
                    setOrdersOpen(false); // Close orders if open
                  }}
                  className="relative w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all group"
                >
                  <Bell className="h-5 w-5 text-white transition-transform group-hover:scale-110" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-aahar-rose rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-lg animate-bounce">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>

                {bellOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                    <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] border border-aahar-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                      <div className="flex items-center justify-between px-6 py-5 border-b border-aahar-wash">
                        <span className="text-xs font-black uppercase tracking-widest text-aahar-dark">Notifications</span>
                        {unread > 0 && (
                          <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest text-aahar-teal hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {notifs.length === 0 ? (
                          <div className="text-center py-12 px-6">
                            <Bell className="h-8 w-8 text-aahar-wash mx-auto mb-3" />
                            <p className="text-xs font-medium text-aahar-body/40">Your trust stream is quiet.</p>
                          </div>
                        ) : (
                          notifs.map(n => (
                            <Link key={n.id} href={n.actionUrl || "#"} className={cn(
                              "block px-6 py-4 border-b border-aahar-wash last:border-none transition-colors",
                              !n.isRead ? "bg-aahar-teal/5" : "hover:bg-aahar-wash/50"
                            )} onClick={() => setBellOpen(false)}>
                              <p className={cn("text-xs leading-snug", !n.isRead ? "font-black text-aahar-dark" : "font-medium text-aahar-body")}>
                                {n.title}
                              </p>
                              <p className="text-[11px] text-aahar-body/60 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-aahar-body/30 mt-2">
                                {new Date(n.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="hidden lg:flex items-center gap-3">
                <Link href={getDashboardUrl()} className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={() => clearAuth()} className="p-3 bg-white/10 rounded-2xl hover:bg-aahar-rose hover:text-white transition-all group text-white">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="hidden lg:flex items-center justify-end">
              <Button asChild className="bg-aahar-rose text-white hover:bg-aahar-rose/90 rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-[10px] border-0 shadow-lg shadow-aahar-rose/20 transition-all active:scale-95">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setBellOpen(false);
              setOrdersOpen(false);
            }}
            className="lg:hidden w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white shrink-0 ml-2"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="lg:hidden bg-aahar-dark/95 backdrop-blur-md border-t border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-black uppercase tracking-widest text-white/80 hover:text-white transition-all py-3 border-b border-white/5 last:border-0"
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Actions */}
              {isAuthenticated ? (
                <div className="flex flex-col gap-3 pt-2">
                  <Link
                    href={getDashboardUrl()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{user?.name || "Dashboard"}</span>
                  </Link>
                  <button
                    onClick={() => {
                      clearAuth();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl hover:bg-rose-500/20 hover:text-white text-rose-300 transition-all text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <Button asChild className="bg-aahar-rose text-white hover:bg-aahar-rose/90 rounded-2xl py-6 font-black uppercase tracking-widest text-[10px] border-0 shadow-lg shadow-aahar-rose/20 w-full transition-all active:scale-95">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </header>
      {/* Global client-side floating active order tracker widget */}
      <ActiveOrderWidget />
    </>
  );
}

