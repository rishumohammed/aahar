"use client";

import { 
  Database,
  UtensilsCrossed,
  Building2,
  Leaf,
  Coffee,
  Waves,
  ChevronRight,
  FileText,
  Bed,
  DoorOpen,
  Sparkles
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
  { 
    id: "DOCUMENT_RESTAURANT", 
    label: "Restaurant Documents", 
    desc: "Manage required legal and operational verification documents.",
    icon: FileText,
    color: "bg-purple-100 text-purple-600"
  },
  { 
    id: "DOCUMENT_HOTEL", 
    label: "Hotel Documents", 
    desc: "Manage required legal and operational verification documents.",
    icon: FileText,
    color: "bg-indigo-100 text-indigo-600"
  },
  { 
    id: "ROOM_TYPE", 
    label: "Room Categories", 
    desc: "Manage room categories like Deluxe, Suite, Standard, etc.",
    icon: DoorOpen,
    color: "bg-pink-100 text-pink-600"
  },
  { 
    id: "BED_TYPE", 
    label: "Bed Configurations", 
    desc: "Manage bed types like King, Queen, Twin, Single.",
    icon: Bed,
    color: "bg-rose-100 text-rose-600"
  },
  { 
    id: "AMENITY_ROOM", 
    label: "Room Amenities", 
    desc: "Manage room-specific facilities like Mini Bar, Balcony, Safe.",
    icon: Sparkles,
    color: "bg-sky-100 text-sky-600"
  },
];

export default function MasterDataIndexPage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      
      {/* Premium Header */}
      <div className="flex flex-col space-y-2 mb-8">
        <div className="flex items-center gap-2 text-admin-text">
          <Database className="h-5 w-5" />
          <span className="text-sm font-semibold text-admin-text uppercase tracking-wider">System Settings</span>
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Master Data Configuration</h1>
        <p className="text-slate-500 font-medium text-sm">Manage dynamic drop-downs, categories, amenities, and system-wide enumerations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MASTER_CATEGORIES.map(category => {
          const Icon = category.icon;
          return (
            <Link key={category.id} href={`/admin/master/${category.id}`} className="group block h-full">
              <Card className="relative h-full p-8 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-admin-primary/30 transition-all duration-300 flex flex-col overflow-hidden">
                
                {/* Decorative background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex justify-between items-start mb-8">
                  <div className={cn("p-4 rounded-xl transition-transform duration-300 group-hover:scale-110", category.color)}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-admin-primary group-hover:text-white group-hover:border-admin-primary transition-all duration-300 text-slate-400">
                    <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>
                
                <div className="relative mt-auto">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-admin-primary transition-colors">{category.label}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    {category.desc}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
