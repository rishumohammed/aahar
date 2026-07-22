"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Shield, LayoutTemplate, Palette, Mail, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  {
    title: "General",
    href: "/admin/settings/general",
    icon: Settings,
  },
  {
    title: "Security",
    href: "/admin/settings/security",
    icon: Shield,
  },
  {
    title: "Footer Content",
    href: "/admin/settings/footer",
    icon: LayoutTemplate,
  },
  {
    title: "Branding",
    href: "/admin/settings/branding",
    icon: Palette,
  },
  {
    title: "Communications",
    href: "/admin/settings/communications",
    icon: Mail,
  },
  {
    title: "Marketing & SEO",
    href: "/admin/settings/marketing",
    icon: Megaphone,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-600 font-medium text-sm mt-1">Manage your platform configuration and appearance.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {sidebarNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-admin-primary/10 text-admin-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-admin-primary" : "text-slate-400")} />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>
        
        <div className="flex-1 w-full min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
