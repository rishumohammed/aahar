"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ClipboardCheck,
  LogOut,
  Bell,
  Search,
  ShieldCheck,
  MessageSquare
} from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useBrandingStore } from "@/store/brandingStore";
import { notificationApi } from "@/lib/api";
import { FloatingAuditorChat } from "@/components/shared/FloatingAuditorChat";

const NAV_ITEMS = [
  { label: "Overview", href: "/auditor/dashboard", icon: LayoutDashboard },
  { label: "My Audits", href: "/auditor/audits", icon: ClipboardCheck },
];

export default function AuditorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { branding } = useBrandingStore();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || !user || (user.role !== "auditor" && user.role !== "super_admin" && user.role !== "admin")) {
        router.push("/auth/login");
        return;
      }
      setIsAuthorized(true);

      // Fetch Notifications
      notificationApi.list()
        .then(res => {
          setNotifications(res.data?.data?.notifications || []);
          setUnreadCount(res.data?.data?.unreadCount || 0);
        })
        .catch(err => console.error("Failed to load notifications", err));

      // Set CSS custom variables depending on role
      const isSuper = user.role === "super_admin";
      const isAdmin = user.role === "admin";
      
      const primaryColor = isSuper ? "#7c3aed" : isAdmin ? "#2563eb" : "#0d9488"; // purple-600 vs blue-600 vs teal-600
      const primaryHover = isSuper ? "#6d28d9" : isAdmin ? "#1d4ed8" : "#0f766e"; // purple-700 vs blue-700 vs teal-700
      const primaryLight = isSuper ? "#f5f3ff" : isAdmin ? "#eff6ff" : "#f0fdfa"; // purple-50 vs blue-50 vs teal-50
      const primaryLightHover = isSuper ? "#ede9fe" : isAdmin ? "#dbeafe" : "#ccfbf1"; // purple-100 vs blue-100 vs teal-100
      const primaryText = isSuper ? "#6d28d9" : isAdmin ? "#1d4ed8" : "#0f766e"; // purple-700 vs blue-700 vs teal-700
      const primaryBorder = isSuper ? "#ddd6fe" : isAdmin ? "#bfdbfe" : "#99f6e4"; // purple-200 vs blue-200 vs teal-200

      document.documentElement.style.setProperty("--admin-primary", primaryColor);
      document.documentElement.style.setProperty("--admin-primary-hover", primaryHover);
      document.documentElement.style.setProperty("--admin-primary-light", primaryLight);
      document.documentElement.style.setProperty("--admin-primary-light-hover", primaryLightHover);
      document.documentElement.style.setProperty("--admin-primary-text", primaryText);
      document.documentElement.style.setProperty("--admin-primary-border", primaryBorder);
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-transparent" style={{ borderTopColor: "var(--admin-primary, #0d9488)" }} />
      </div>
    );
  }

  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.href || (item.href !== "/auditor/dashboard" && pathname.startsWith(item.href))
  );
  const pageTitle = activeItem ? activeItem.label : "Auditor Hub";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Material Drawer (Sidebar) */}
      <aside className="w-64 bg-white flex flex-col shrink-0 border-r border-slate-200 z-10 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          {branding?.logoLight && (
            <div className="flex flex-col gap-0.5">
              <img src={getImageUrl(branding.logoLight)} alt="AAHAR" className="h-8 max-w-[150px] object-contain object-left" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5 mt-1">
                {user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Admin Panel" : "Auditor Portal"}
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/auditor/dashboard" && pathname.startsWith(item.href));
              return (
                <li key={item.label} className="pr-4">
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors rounded-r-full",
                      isActive 
                        ? "bg-admin-light text-admin-text" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-admin-primary" : "text-slate-400")} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-admin-lightHover flex items-center justify-center text-admin-text font-bold text-xs shrink-0">
              {user?.role === "super_admin" ? "SA" : user?.role === "admin" ? "AD" : "AU"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || "Auditor"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || "auditor@aahar.in"}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-600 hover:bg-red-50 hover:text-red-600 mt-2 rounded-md font-medium"
            onClick={() => {
              localStorage.removeItem("aahar-auth");
              window.location.href = "/auth/login";
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative z-0">
        {/* Material Top App Bar */}
        <header className="h-16 bg-admin-primary shadow-md flex items-center justify-between px-6 shrink-0 z-20 text-white transition-colors duration-300">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-medium">{pageTitle}</h1>
            <div className="hidden md:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-md w-72 focus-within:bg-white/20 transition-colors">
              <Search className="h-4 w-4 text-white/70" />
              <input 
                type="text" 
                placeholder="Search audits, businesses..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/60"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                type="button" 
                onClick={() => {
                  setShowNotifications(v => !v);
                }}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Bell className="h-5 w-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-400 rounded-full border-2 border-admin-primary flex items-center justify-center text-[8px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-4">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs font-medium text-admin-primary bg-admin-light px-2 py-1 rounded-full">{unreadCount} New</span>
                      )}
                    </div>
                    
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <Bell className="h-8 w-8 text-slate-300 mx-auto" />
                          </div>
                          <p className="text-sm font-medium text-slate-600">All caught up!</p>
                          <p className="text-xs text-slate-400 mt-1">No new notifications right now</p>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {notifications.map((n) => (
                            <Link 
                              href={n.actionUrl || "#"} 
                              key={n.id} 
                              onClick={() => setShowNotifications(false)}
                              className={cn("p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors block", !n.isRead && "bg-slate-50/50")}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn("w-2 h-2 mt-1.5 rounded-full shrink-0", !n.isRead ? "bg-admin-primary" : "bg-transparent")} />
                                <div>
                                  <p className="text-sm font-medium text-slate-800">{n.title || "Notification"}</p>
                                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                  <span className="text-[10px] text-slate-400 mt-1 block">
                                    {new Date(n.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Active Session</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 relative">
          {children}
        </main>
      </div>
      <FloatingAuditorChat />
    </div>
  );
}
