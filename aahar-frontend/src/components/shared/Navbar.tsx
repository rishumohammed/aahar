"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import {
  Bell, User, LogOut, Search, Utensils, Trash2, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { orderApi } from "@/lib/api";
import ActiveOrderWidget from "./ActiveOrderWidget";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Restaurants", href: "/search?mode=eat" },
  { label: "Stay", href: "/search?mode=stay" },
  { label: "Certify", href: "/certify" },
  { label: "Verify", href: "/verify" },
];

export default function Navbar() {
  const { user, isAuthenticated, token, clearAuth } = useAuthStore();
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const fetchNavbarOrders = async () => {
    try {
      const stored = localStorage.getItem("aahar_active_orders");
      if (!stored) { setOrders([]); setActiveOrdersCount(0); return; }
      const parsed = JSON.parse(stored);
      setOrders(parsed);
      setActiveOrdersCount(parsed.filter((o: any) => o.status !== "completed" && o.status !== "cancelled").length);
      if (ordersOpen && parsed.length > 0) {
        const freshOrders = await Promise.all(parsed.map(async (order: any) => {
          if (order.status === "completed" || order.status === "cancelled") return order;
          try {
            const res = await orderApi.get(order.id);
            if (res.data.success) return { ...order, status: res.data.data.status, totalAmount: res.data.data.totalAmount || order.totalAmount };
          } catch (e) { console.error("Fresh Navbar order load fail:", e); }
          return order;
        }));
        if (JSON.stringify(parsed) !== JSON.stringify(freshOrders)) {
          localStorage.setItem("aahar_active_orders", JSON.stringify(freshOrders));
          setOrders(freshOrders);
          setActiveOrdersCount(freshOrders.filter((o: any) => o.status !== "completed" && o.status !== "cancelled").length);
        }
      }
    } catch (e) { console.error("fetchNavbarOrders failed:", e); }
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
    fetchNotifications();
    const socket = getSocket();
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
      case "consumer":
      default:              return "/account";
    }
  };

  return (
    <>
      <header className={cn(
        "sticky top-0 z-[60] w-full transition-all duration-300 border-b",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-aahar-border"
          : "bg-white border-aahar-border/60"
      )}>
        <nav className="container mx-auto max-w-7xl px-6 h-[68px] flex items-center justify-between gap-6">

          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 bg-aahar-dark rounded-xl flex items-center justify-center shadow-sm group-hover:bg-aahar-teal transition-colors duration-300">
              <span className="text-white font-bold text-base leading-none">A</span>
            </div>
            <span className="text-[15px] font-bold tracking-widest text-aahar-dark uppercase">AAHAR</span>
          </Link>

          {/* Center: Nav Links */}
          <div className="hidden lg:flex items-center justify-center gap-8 flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-aahar-body hover:text-aahar-dark transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Icons + Auth Buttons */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Active Orders icon */}
            <div className="relative">
              <button
                onClick={() => { setOrdersOpen(!ordersOpen); setBellOpen(false); }}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-aahar-body hover:text-aahar-dark hover:bg-aahar-wash transition-all"
                aria-label="Orders"
              >
                <Utensils className="h-[18px] w-[18px]" />
                {activeOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-white text-[9px] font-black flex items-center justify-center shadow animate-pulse">
                    {activeOrdersCount}
                  </span>
                )}
              </button>

              {ordersOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOrdersOpen(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-aahar-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-aahar-border/60">
                      <span className="text-xs font-black uppercase tracking-widest text-aahar-dark">Active Orders</span>
                      {orders.length > 0 && (
                        <button onClick={clearOrderHistory} className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 flex items-center gap-1">
                          <Trash2 className="h-3 w-3" />Clear
                        </button>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar divide-y divide-aahar-wash">
                      {orders.length === 0 ? (
                        <div className="text-center py-10 px-6 space-y-2">
                          <Utensils className="h-7 w-7 text-aahar-border mx-auto" />
                          <p className="text-xs font-bold text-aahar-dark">No Active Orders</p>
                          <p className="text-[10px] text-aahar-body/60 leading-normal max-w-[180px] mx-auto">Scan a restaurant QR to place a table order.</p>
                        </div>
                      ) : (
                        orders.map(o => {
                          const isDone = o.status === "completed" || o.status === "cancelled";
                          return (
                            <div key={o.id} className="p-4 hover:bg-aahar-wash/50 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="text-xs font-black text-aahar-dark line-clamp-1">{o.restaurantName}</h5>
                                  <p className="text-[9px] font-bold text-aahar-body/60 mt-0.5 uppercase tracking-wide">Table {o.tableNumber} · ₹{o.totalAmount}</p>
                                </div>
                                <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white shrink-0", o.status === "completed" ? "bg-aahar-teal" : o.status === "cancelled" ? "bg-rose-500" : o.status === "served" ? "bg-emerald-500 animate-pulse" : o.status === "preparing" ? "bg-blue-500 animate-pulse" : "bg-amber-500 animate-pulse")}>
                                  {o.status}
                                </span>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Link href={`/restaurant/${o.restaurantSlug}/order/${o.id}`} className="flex-1" onClick={() => setOrdersOpen(false)}>
                                  <Button type="button" className="w-full bg-aahar-dark text-white text-[9px] py-1.5 h-auto rounded-xl font-bold uppercase tracking-wider">Track</Button>
                                </Link>
                                {!isDone && (
                                  <Link href={`/restaurant/${o.restaurantSlug}?table=${o.tableNumber}`} className="flex-1" onClick={() => setOrdersOpen(false)}>
                                    <Button type="button" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] py-1.5 h-auto rounded-xl font-bold uppercase tracking-wider">Add Items</Button>
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
                    onClick={() => { setBellOpen(v => !v); setOrdersOpen(false); }}
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center text-aahar-body hover:text-aahar-dark hover:bg-aahar-wash transition-all"
                    aria-label="Notifications"
                  >
                    <Bell className="h-[18px] w-[18px]" />
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-aahar-rose rounded-full text-white text-[9px] font-black flex items-center justify-center shadow animate-bounce">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </button>
                  {bellOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                      <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-aahar-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-aahar-border/60">
                          <span className="text-xs font-black uppercase tracking-widest text-aahar-dark">Notifications</span>
                          {unread > 0 && (
                            <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest text-aahar-teal hover:underline">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                          {notifs.length === 0 ? (
                            <div className="text-center py-10 px-6">
                              <Bell className="h-7 w-7 text-aahar-border mx-auto mb-3" />
                              <p className="text-xs font-medium text-aahar-body/40">Your trust stream is quiet.</p>
                            </div>
                          ) : (
                            notifs.map(n => (
                              <Link key={n.id} href={n.actionUrl || "#"} className={cn("block px-5 py-4 border-b border-aahar-wash last:border-none transition-colors", !n.isRead ? "bg-aahar-teal/5" : "hover:bg-aahar-wash/50")} onClick={() => setBellOpen(false)}>
                                <p className={cn("text-xs leading-snug", !n.isRead ? "font-black text-aahar-dark" : "font-medium text-aahar-body")}>{n.title}</p>
                                <p className="text-[11px] text-aahar-body/60 mt-1 line-clamp-2">{n.message}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-aahar-body/30 mt-1.5">{new Date(n.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* User Dashboard Link */}
                <div className="hidden lg:flex items-center gap-2">
                  <Link href={getDashboardUrl()} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-aahar-wash hover:bg-aahar-border/60 transition-all text-aahar-dark text-xs font-bold">
                    <User className="h-3.5 w-3.5" />
                    {user?.name?.split(" ")[0]}
                  </Link>
                  <button onClick={() => clearAuth()} className="w-9 h-9 rounded-xl flex items-center justify-center text-aahar-body hover:bg-rose-50 hover:text-rose-500 transition-all" aria-label="Sign out">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden lg:flex items-center gap-2.5">
                <Button asChild variant="outline" className="h-9 px-5 rounded-xl border-aahar-border text-aahar-dark bg-white hover:bg-aahar-wash text-[13px] font-semibold shadow-none transition-all">
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
                <Button asChild className="h-9 px-5 rounded-xl bg-aahar-dark text-white hover:bg-aahar-dark/90 text-[13px] font-semibold shadow-none border-0 transition-all">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setBellOpen(false); setOrdersOpen(false); }}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-aahar-body hover:bg-aahar-wash transition-all ml-1"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="lg:hidden bg-white border-t border-aahar-border overflow-hidden"
            >
              <div className="container mx-auto max-w-7xl px-6 py-5 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-aahar-body hover:text-aahar-dark py-3 border-b border-aahar-border/40 last:border-0 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 flex flex-col gap-2.5">
                  {isAuthenticated ? (
                    <>
                      <Link href={getDashboardUrl()} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-aahar-wash rounded-xl text-aahar-dark text-sm font-semibold hover:bg-aahar-border/40 transition-all">
                        <User className="h-4 w-4" />{user?.name || "Dashboard"}
                      </Link>
                      <button onClick={() => { clearAuth(); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 text-sm font-semibold hover:bg-rose-50 transition-all text-left">
                        <LogOut className="h-4 w-4" />Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Button asChild className="w-full h-11 rounded-xl bg-aahar-dark text-white text-sm font-semibold border-0">
                        <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full h-11 rounded-xl border-aahar-border text-aahar-dark bg-white text-sm font-semibold">
                        <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <ActiveOrderWidget />
    </>
  );
}
