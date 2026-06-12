"use client";
import { Building2, Utensils, Hotel, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function EstablishmentsPortalPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats()
      .then(res => setStats(res.data.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    {
      title: "Dining Entities",
      desc: "Manage restaurants, cafes, and cloud kitchens.",
      icon: Utensils,
      href: "/admin/establishments/restaurants",
      color: "text-admin-text",
      bg: "bg-admin-light",
      stats: loading ? "..." : `${stats?.totalRestaurants ?? 0} Active Units`
    },
    {
      title: "Lodging & Resorts",
      desc: "Manage hotels, boutique stays, and resort properties.",
      icon: Hotel,
      href: "/admin/establishments/hotels",
      color: "text-admin-text",
      bg: "bg-admin-light",
      stats: loading ? "..." : `${stats?.totalHotels ?? 0} Global Partners`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Establishments</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Centralized management of all registered hospitality partners.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <Link key={category.title} href={category.href} className="group">
            <Card className="relative h-full overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300 hover:border-admin-primary hover:shadow-lg p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-lg", category.bg)}>
                  <category.icon className={cn("h-6 w-6", category.color)} />
                </div>
                <span className="bg-slate-100 group-hover:bg-admin-primary group-hover:text-white transition-colors px-3 py-1 rounded-full text-xs font-semibold text-slate-600">
                  {category.stats}
                </span>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-800 group-hover:text-admin-primary transition-colors">
                  {category.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {category.desc}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-2 text-sm font-medium text-slate-500 group-hover:text-admin-primary transition-colors">
                Enter Portal <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
