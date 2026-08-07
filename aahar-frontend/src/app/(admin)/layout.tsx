"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Users, 
  BarChart3, 
  ShieldAlert,
  Settings,
  LogOut,
  Bell,
  Search,
  Globe,
  Building2,
  Database,
  Star
} from "lucide-react";
import { ChevronDown, UserCircle } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useBrandingStore } from "@/store/brandingStore";

import { notificationApi, adminApi } from "@/lib/api";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Enquiries", href: "/admin/enquiries", icon: Bell },
  { label: "Applications", href: "/admin/applications", icon: FileText },
  { label: "Audits", href: "/admin/audits", icon: CheckSquare },
  { 
    label: "Establishments", 
    href: "/admin/establishments", 
    icon: Building2,
    children: [
      { label: "All Establishments", href: "/admin/establishments/all" },
      { label: "Restaurants", href: "/admin/establishments/restaurants" },
      { label: "Hotels & Resorts", href: "/admin/establishments/hotels" },
    ]
  },

  { label: "Content", href: "/admin/content", icon: Globe },
  { label: "Promotions", href: "/admin/promotions", icon: Star },
  { label: "Standards", href: "/admin/standards", icon: ShieldAlert },
  { label: "Master Data", href: "/admin/master", icon: Database },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { branding } = useBrandingStore();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      // Fetch Notifications
      notificationApi.list()
        .then(res => {
          setNotifications(res.data?.data?.notifications || []);
          setUnreadCount(res.data?.data?.unreadCount || 0);
        })
        .catch(err => console.error("Failed to load notifications", err));
        
      adminApi.dashboard()
        .then(res => {
          setStats(res.data?.data?.stats || null);
        })
        .catch(err => console.error("Failed to load admin stats", err));
    }
  }, [mounted, isAuthenticated]);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || !user || (user.role !== "admin" && user.role !== "super_admin")) {
        router.push("/auth/login");
        return;
      }
      setIsAuthorized(true);

      // Set CSS custom variables depending on role
      const isSuper = user.role === "super_admin";
      // Teal for Super Admin, Rose for Admin
      const primaryColor = isSuper ? "#0A7B7B" : "#B5766A"; 
      const primaryHover = isSuper ? "#086363" : "#915e55"; 
      const primaryLight = isSuper ? "#f0fbfb" : "#fbf5f4"; 
      const primaryLightHover = isSuper ? "#ccf2f2" : "#f3e4e1"; 
      const primaryText = isSuper ? "#086363" : "#915e55"; 
      const primaryBorder = isSuper ? "#99e6e6" : "#e0beba"; 

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-transparent" style={{ borderTopColor: "var(--admin-primary, #2563eb)" }} />
      </div>
    );
  }

  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.href || item.children?.some((child) => pathname.startsWith(child.href))
  );
  const pageTitle = activeItem ? activeItem.label : "Dashboard";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Material Drawer (Sidebar) */}
      <aside className="w-64 bg-white flex flex-col shrink-0 border-r border-slate-200 z-10 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          {branding?.logoLight ? (
            <div className="flex flex-col gap-0.5">
              <img src={getImageUrl(branding.logoLight)} alt="AAHAR" className="h-8 max-w-[150px] object-contain object-left" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5 mt-1">
                {user?.role === "super_admin" ? "Super Admin" : "Admin Panel"}
              </p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-admin-primary flex items-center justify-center shadow-md transition-colors duration-300">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-800 tracking-tight">AAHAR</span>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  {user?.role === "super_admin" ? "Super Admin" : "Admin Panel"}
                </p>
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.children?.some(child => pathname.startsWith(child.href)));
              let dynamicBadge = undefined;
              if (stats) {
                if (item.label === "Enquiries" && stats.totalEnquiries > 0) dynamicBadge = stats.totalEnquiries.toString();
                if (item.label === "Applications" && stats.pendingApps > 0) dynamicBadge = stats.pendingApps.toString();
              }
              return (
                <li key={item.label} className="pr-4">
                  <Link 
                    href={item.children ? item.children[0].href : item.href}
                    className={cn(
                      "flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors rounded-r-full",
                      isActive 
                        ? "bg-admin-light text-admin-text" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className={cn("h-5 w-5", isActive ? "text-admin-primary" : "text-slate-400")} />
                      {item.label}
                    </div>
                    {dynamicBadge && (
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        isActive 
                          ? "bg-admin-primary text-white" 
                          : "bg-slate-200 text-slate-600"
                      )}>
                        {dynamicBadge}
                      </span>
                    )}
                  </Link>
                  
                  {item.children && isActive && (
                    <ul className="mt-1 mb-2">
                      {item.children.map(child => {
                        const isChildActive = pathname === child.href;
                        return (
                          <li key={child.href} className="pr-4">
                            <Link 
                              href={child.href}
                              className={cn(
                                "block pl-14 pr-6 py-2 text-[13px] transition-colors rounded-r-full font-medium",
                                isChildActive 
                                  ? "text-admin-text bg-admin-light/50" 
                                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

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
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/60"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative">
              <button 
                type="button" 
                onClick={() => {
                  setShowProfileMenu(false);
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
                            <div key={n.id} className={cn("p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors", !n.isRead && "bg-slate-50/50")}>
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
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  {user?.role === "super_admin" ? "SA" : "AD"}
                </div>
                <div className="hidden sm:block text-left text-sm max-w-[120px]">
                  <p className="font-semibold truncate leading-tight">{user?.name || "Admin"}</p>
                  <p className="text-[10px] text-white/80 uppercase tracking-wider truncate leading-tight">
                    {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                  </p>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", showProfileMenu ? "rotate-180" : "")} />
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <p className="font-semibold">{user?.name || "System Admin"}</p>
                      <p className="text-sm text-slate-500">{user?.email || "admin@aahar.in"}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => {
                          localStorage.removeItem("aahar-auth");
                          window.location.href = "/auth/login";
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
