"use client";

import { 
  UtensilsCrossed,
  Building2,
  Leaf,
  Coffee,
  Waves,
  ChevronRight,
  FileText,
  Bed,
  DoorOpen,
  Sparkles,
  Globe,
  ArrowLeft,
  Image as ImageIcon,
  Coins
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

const SECTION_DATA: Record<string, {
  title: string;
  subtitle: string;
  icon: any;
  items: {
    id: string;
    label: string;
    desc: string;
    icon: any;
    color: string;
  }[];
}> = {
  restaurant: {
    title: "Restaurant Master Data",
    subtitle: "Manage establishment categories, dining amenities, and required legal documents for restaurants.",
    icon: UtensilsCrossed,
    items: [
      { 
        id: "CATEGORY_RESTAURANT", 
        label: "Restaurant Categories", 
        desc: "Establishment types like Fine Dining, QSR, Cafe, Bakery, etc.",
        icon: UtensilsCrossed,
        color: "bg-orange-100 text-orange-600"
      },
      { 
        id: "AMENITY_RESTAURANT", 
        label: "Restaurant Amenities", 
        desc: "Facilities like AC, WiFi, Valet Parking, Outdoor Seating.",
        icon: Coffee,
        color: "bg-amber-100 text-amber-600"
      },
      { 
        id: "DOCUMENT_RESTAURANT", 
        label: "Restaurant Documents", 
        desc: "Legal and operational verification documents (FSSAI, GST, etc.).",
        icon: FileText,
        color: "bg-purple-100 text-purple-600"
      },
      { 
        id: "PHOTO_CATEGORY_RESTAURANT", 
        label: "Restaurant Photo Gallery Categories", 
        desc: "Photo categories like Kitchen, Interior, Exterior, Dining Area, Counter, Restroom, Food.",
        icon: ImageIcon,
        color: "bg-emerald-100 text-emerald-600"
      },
      { 
        id: "DIETARY", 
        label: "Dietary Types", 
        desc: "Dietary tags like Pure Veg, Non-Veg, Vegan, Jain, Halal, Organic.",
        icon: Leaf,
        color: "bg-green-100 text-green-600"
      },
      { 
        id: "CUISINE", 
        label: "Cuisines", 
        desc: "Cuisine tags like North Indian, Chinese, Italian, Continental.",
        icon: UtensilsCrossed,
        color: "bg-orange-100 text-orange-600"
      },
      { 
        id: "PRICE_RANGE_RESTAURANT", 
        label: "Price Ranges", 
        desc: "Expense tiers like Budget, Moderate, Premium (e.g. ₹, ₹₹).",
        icon: Coins,
        color: "bg-yellow-100 text-yellow-600"
      },
    ]
  },
  hotel: {
    title: "Hotel Master Data",
    subtitle: "Manage property types, hotel amenities, room categories, bed types, and hotel documents.",
    icon: Building2,
    items: [
      { 
        id: "CATEGORY_HOTEL", 
        label: "Hotel Properties", 
        desc: "Property types like Resort, Homestay, Boutique, Villa, etc.",
        icon: Building2,
        color: "bg-blue-100 text-blue-600"
      },
      { 
        id: "AMENITY_HOTEL", 
        label: "Hotel Amenities", 
        desc: "Facilities like Pool, Spa, Gym, Kids Club, Conference Hall.",
        icon: Waves,
        color: "bg-cyan-100 text-cyan-600"
      },
      { 
        id: "DOCUMENT_HOTEL", 
        label: "Hotel Documents", 
        desc: "Required legal and operational compliance documents.",
        icon: FileText,
        color: "bg-indigo-100 text-indigo-600"
      },
      { 
        id: "ROOM_TYPE", 
        label: "Room Categories", 
        desc: "Room types like Deluxe, Executive Suite, Standard, Family Room.",
        icon: DoorOpen,
        color: "bg-pink-100 text-pink-600"
      },
      { 
        id: "BED_TYPE", 
        label: "Bed Configurations", 
        desc: "Bed types like King, Queen, Twin, Single, Sofa Bed.",
        icon: Bed,
        color: "bg-rose-100 text-rose-600"
      },
      { 
        id: "AMENITY_ROOM", 
        label: "Room Amenities", 
        desc: "Room facilities like Mini Bar, Balcony, Safe, Tea Maker.",
        icon: Sparkles,
        color: "bg-sky-100 text-sky-600"
      },
      { 
        id: "MEAL_PLAN", 
        label: "Meal Plans", 
        desc: "Hotel meal plan packages like EP (Room only), CP (Breakfast), MAP, AP.",
        icon: UtensilsCrossed,
        color: "bg-amber-100 text-amber-600"
      },
      { 
        id: "PHOTO_CATEGORY_HOTEL", 
        label: "Hotel Photo Gallery Categories", 
        desc: "Photo categories like Rooms, Exterior, Lobby, Amenities, Pool & Spa, Dining.",
        icon: ImageIcon,
        color: "bg-teal-100 text-teal-600"
      },
    ]
  }
};

export default function MasterDataSectionPage({ params }: { params: { section: string } }) {
  const sectionKey = params.section?.toLowerCase();
  const section = SECTION_DATA[sectionKey];

  if (!section) {
    return (
      <div className="max-w-[1200px] mx-auto p-12 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Section Not Found</h2>
        <Link href="/admin/master" className="text-admin-primary mt-4 inline-block font-semibold">
          ← Return to Master Data
        </Link>
      </div>
    );
  }

  const SectionIcon = section.icon;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      
      {/* Top Back Link & Header */}
      <div className="space-y-4">
        <Link 
          href="/admin/master" 
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-admin-primary transition-colors tracking-wider uppercase"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Master Data Overview
        </Link>

        <div className="flex items-center gap-4 pt-2">
          <div className="p-3.5 bg-admin-primary text-white rounded-2xl shadow-md">
            <SectionIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">{section.title}</h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">{section.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Grid of Sub-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {section.items.map(category => {
          const Icon = category.icon;
          return (
            <Link key={category.id} href={`/admin/master/${category.id}`} className="group block h-full">
              <Card className="relative h-full p-7 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-admin-primary/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                
                {/* Decorative background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex justify-between items-start mb-6">
                  <div className={cn("p-3.5 rounded-xl transition-transform duration-300 group-hover:scale-110", category.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-admin-primary group-hover:text-white group-hover:border-admin-primary transition-all duration-300 text-slate-400">
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>
                
                <div className="relative mt-auto">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1.5 group-hover:text-admin-primary transition-colors">{category.label}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
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
