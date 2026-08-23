"use client";

import { 
  Database,
  UtensilsCrossed,
  Building2,
  Globe,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MASTER_CATEGORIES = [
  {
    key: "restaurant",
    title: "Restaurant Master Data",
    desc: "Configure establishment categories, dining amenities, and required legal documents for restaurants.",
    icon: UtensilsCrossed,
    count: 3,
    color: "from-orange-500/10 via-amber-500/5 to-transparent border-orange-200/80",
    iconBg: "bg-orange-500 text-white shadow-lg shadow-orange-500/20",
    hoverBorder: "hover:border-orange-400/60",
    badgeColor: "bg-orange-100 text-orange-700 border-orange-200"
  },
  {
    key: "hotel",
    title: "Hotel Master Data",
    desc: "Configure property types, hotel amenities, room categories, bed types, and hotel documentation.",
    icon: Building2,
    count: 6,
    color: "from-blue-500/10 via-cyan-500/5 to-transparent border-blue-200/80",
    iconBg: "bg-blue-600 text-white shadow-lg shadow-blue-500/20",
    hoverBorder: "hover:border-blue-400/60",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200"
  },
  {
    key: "general",
    title: "General Master Data",
    desc: "Manage platform-wide shared metadata, dietary tags, and global enumerations.",
    icon: Globe,
    count: 1,
    color: "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-200/80",
    iconBg: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20",
    hoverBorder: "hover:border-emerald-400/60",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200"
  }
];

export default function MasterDataIndexPage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col space-y-2 mb-8">
        <div className="flex items-center gap-2 text-admin-text">
          <Database className="h-5 w-5" />
          <span className="text-sm font-semibold text-admin-text uppercase tracking-wider">System Settings</span>
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Master Data Configuration</h1>
        <p className="text-slate-500 font-medium text-sm">Select a master data category to manage its underlying configurations and drop-down options.</p>
      </div>

      {/* 3 Top-Level Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {MASTER_CATEGORIES.map(category => {
          const Icon = category.icon;
          return (
            <Link key={category.key} href={`/admin/master/section/${category.key}`} className="group block h-full">
              <Card className={cn(
                "relative h-full p-8 rounded-2xl border bg-white shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden",
                category.hoverBorder
              )}>
                {/* Background Gradient */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 group-hover:opacity-100 transition-opacity duration-300", category.color)} />

                <div className="relative space-y-6">
                  {/* Top Bar */}
                  <div className="flex justify-between items-start">
                    <div className={cn("p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110", category.iconBg)}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className={cn("text-xs font-bold px-3 py-1 rounded-full border shadow-sm", category.badgeColor)}>
                      {category.count} Modules
                    </span>
                  </div>

                  {/* Content */}
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-admin-primary transition-colors">
                      {category.title}
                    </h2>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      {category.desc}
                    </p>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="relative mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-between text-sm font-bold text-admin-primary group-hover:text-admin-primary-hover">
                  <span>Manage {category.title.split(' ')[0]} Modules</span>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-admin-primary group-hover:text-white transition-all shadow-sm">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

              </Card>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
