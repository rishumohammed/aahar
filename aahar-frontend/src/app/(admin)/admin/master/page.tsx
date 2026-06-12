"use client";

import { 
  Database,
  UtensilsCrossed,
  Building2,
  Leaf,
  Coffee,
  Waves,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MASTER_CATEGORIES = [
  { 
    id: "CATEGORY_RESTAURANT", 
    label: "Restaurant Categories", 
    desc: "Manage establishment types like Fine Dining, QSR, Cafe, etc.",
    icon: UtensilsCrossed,
    color: "bg-orange-100 text-orange-600"
  },
  { 
    id: "CATEGORY_HOTEL", 
    label: "Hotel Properties", 
    desc: "Manage property types like Resort, Homestay, Boutique, etc.",
    icon: Building2,
    color: "bg-blue-100 text-blue-600"
  },
  { 
    id: "DIETARY", 
    label: "Dietary Types", 
    desc: "Manage dietary tags like Vegetarian, Vegan, Jain, etc.",
    icon: Leaf,
    color: "bg-emerald-100 text-emerald-600"
  },
  { 
    id: "AMENITY_RESTAURANT", 
    label: "Restaurant Amenities", 
    desc: "Manage available facilities like WiFi, AC, Valet Parking.",
    icon: Coffee,
    color: "bg-amber-100 text-amber-600"
  },
  { 
    id: "AMENITY_HOTEL", 
    label: "Hotel Amenities", 
    desc: "Manage hotel facilities like Pool, Spa, Gym, Kids Club.",
    icon: Waves,
    color: "bg-cyan-100 text-cyan-600"
  },
];

export default function MasterDataIndexPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-admin-primary/10 rounded-lg text-admin-primary">
            <Database className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Master Data</h1>
            <p className="text-slate-500 font-medium mt-1 text-sm">Configure system-wide drop-downs, categories, and enumerations.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MASTER_CATEGORIES.map(category => {
          const Icon = category.icon;
          return (
            <Link key={category.id} href={`/admin/master/${category.id}`}>
              <Card className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-4 rounded-xl", category.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-admin-primary group-hover:text-white transition-colors text-slate-400">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-admin-primary transition-colors">{category.label}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed flex-1">
                  {category.desc}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
