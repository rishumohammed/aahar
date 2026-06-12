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
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { label: "Overview", href: "/auditor/dashboard", icon: LayoutDashboard },
  { label: "My Audits", href: "/auditor/audits", icon: ClipboardCheck },
];

export default function AuditorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
          <div className="w-10 h-10 rounded-full bg-admin-primary flex items-center justify-center shadow-md transition-colors duration-300">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">AAHAR</span>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Admin Panel" : "Auditor Portal"}
            </p>
          </div>
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
            <button type="button" className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
              <Bell className="h-5 w-5 text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border border-admin-primary" />
            </button>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Active Session</span>
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
