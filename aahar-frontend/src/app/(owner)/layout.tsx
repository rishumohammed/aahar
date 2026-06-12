"use client";

import { toast } from"sonner";
import { useEffect, useState } from"react";
import { useRouter, usePathname } from"next/navigation";
import Link from"next/link";
import { 
 LayoutDashboard, 
 FileText, 
 User, 
 UtensilsCrossed, 
 Image as ImageIcon, 
 ShieldCheck, 
 LogOut,
 Bell,
 Search,
 ClipboardList,
 QrCode,
 Globe,
 ChevronDown
} from"lucide-react";
import { cn } from"@/lib/utils";
import { Button } from"@/components/ui/button";
import { useAuthStore } from"@/store/authStore";

const NAV_ITEMS = [
 { label:"Overview", href:"/owner/dashboard", icon: LayoutDashboard },
 { label:"Application", href:"/owner/application", icon: FileText },
 { label:"Profile", href:"/owner/profile", icon: User },
 { label:"Orders", href:"/owner/orders", icon: ClipboardList },
 { label:"Tables & QR", href:"/owner/tables", icon: QrCode },
 { label:"Menu", href:"/owner/menu", icon: UtensilsCrossed },
 { label:"Photos", href:"/owner/photos", icon: ImageIcon },
 { label:"Compliance", href:"/owner/compliance", icon: ShieldCheck },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
 const router = useRouter();
 const pathname = usePathname();
 const { user, isAuthenticated } = useAuthStore();
 const [mounted, setMounted] = useState(false);
 const [isAuthorized, setIsAuthorized] = useState(false);
 const [showProfileMenu, setShowProfileMenu] = useState(false);

 useEffect(() => {
 setMounted(true);
 }, []);

 useEffect(() => {
 if (mounted) {
 if (!isAuthenticated || !user || (user.role !=="owner"&& user.role !=="super_admin"&& user.role !=="admin")) {
 router.push("/auth/login");
 return;
 }
 setIsAuthorized(true);

 // Set CSS custom variables for Teal theme (Owner)
 const primaryColor ="#0A7B7B"; 
 const primaryHover ="#086363"; 
 const primaryLight ="#f0fbfb"; 
 const primaryLightHover ="#ccf2f2"; 
 const primaryText ="#086363"; 
 const primaryBorder ="#99e6e6"; 

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
 <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-transparent"style={{ borderTopColor:"var(--admin-primary, #0A7B7B)"}} />
 </div>
 );
 }

 const activeItem = NAV_ITEMS.find(
 (item) => pathname === item.href || (item.href !=="/owner/dashboard"&& pathname.startsWith(item.href))
 );
 const pageTitle = activeItem ? activeItem.label :"Owner Portal";

 return (
 <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
 {/* Material Drawer (Sidebar) */}
 <aside className="w-64 bg-white flex flex-col shrink-0 border-r border-slate-200 z-10 shadow-sm">
 <div className="p-6 border-b border-slate-100 flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-admin-primary flex items-center justify-center shadow-md transition-colors duration-300">
 <UtensilsCrossed className="h-5 w-5 text-white"/>
 </div>
 <div>
 <span className="text-xl font-bold text-slate-800 tracking-tight">AAHAR</span>
 <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
 Owner Portal
 </p>
 </div>
 </div>

 <nav className="flex-1 overflow-y-auto no-scrollbar py-4">
 <ul className="space-y-1">
 {NAV_ITEMS.map((item) => {
 const isActive = pathname === item.href || (item.href !=="/owner/dashboard"&& pathname.startsWith(item.href));
 return (
 <li key={item.label} className="pr-4">
 <Link 
 href={item.href}
 className={cn(
"flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors rounded-r-full",
 isActive 
 ?"bg-admin-light text-admin-text"
 :"text-slate-600 hover:bg-slate-50 hover:text-slate-900"
 )}
 >
 <item.icon className={cn("h-5 w-5", isActive ?"text-admin-primary":"text-slate-400")} />
 {item.label}
 </Link>
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
 <Search className="h-4 w-4 text-white/70"/>
 <input 
 type="text"
 placeholder="Search orders, menu..."
 className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/60"
 />
 </div>
 </div>

 <div className="flex items-center gap-5">
 <button type="button" className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
 <Bell className="h-5 w-5 text-white"/>
 <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border border-white"/>
 </button>

 {/* Profile Dropdown */}
 <div className="relative">
 <button 
 onClick={() => setShowProfileMenu(!showProfileMenu)}
 className="flex items-center gap-3 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors"
 >
 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
 {user?.name ? user.name.charAt(0).toUpperCase() :"OW"}
 </div>
 <div className="hidden sm:block text-left text-sm max-w-[120px]">
 <p className="font-semibold truncate leading-tight">{user?.name ||"Business Owner"}</p>
 <p className="text-[10px] text-white/80 uppercase tracking-wider truncate leading-tight">
 {user?.role ==="super_admin"?"Super Admin":"Restaurant"}
 </p>
 </div>
 <ChevronDown className={cn("h-4 w-4 transition-transform", showProfileMenu ?"rotate-180":"")} />
 </button>

 {showProfileMenu && (
 <>
 <div className="fixed inset-0 z-40"onClick={() => setShowProfileMenu(false)} />
 <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-2">
 <div className="p-4 border-b border-slate-100 bg-slate-50">
 <p className="font-semibold">{user?.name ||"Business Owner"}</p>
 <p className="text-sm text-slate-500">{user?.email ||"owner@example.com"}</p>
 </div>
 <div className="p-2">
 <button 
 onClick={() => {
 localStorage.removeItem("aahar-auth");
 window.location.href ="/auth/login";
 }}
 className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
 >
 <LogOut className="h-4 w-4"/>
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

