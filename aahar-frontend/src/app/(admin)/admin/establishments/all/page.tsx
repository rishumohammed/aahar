"use client";

import { useEffect, useState } from "react";
import { restaurantApi, hotelApi } from "@/lib/api";
import { 
  Search, 
  Edit3, 
  Trash2, 
  Utensils,
  Hotel as HotelIcon,
  Loader2,
  Building2,
  Filter,
  Eye,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AllEstablishmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchData = async () => {
    try {
      // Fetch both restaurants and hotels concurrently
      const [restRes, hotelRes] = await Promise.all([
        restaurantApi.list({ all: true }),
        hotelApi.list({ all: true })
      ]);

      const restaurants = (restRes.data.data.items || restRes.data.data || []).map((r: any) => ({ ...r, type: "restaurant" }));
      const hotels = (hotelRes.data.data.items || hotelRes.data.data || []).map((h: any) => ({ ...h, type: "hotel" }));

      // Merge and sort by creation date descending
      const merged = [...restaurants, ...hotels].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setItems(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, type: "restaurant" | "hotel") => {
    if (!confirm("Are you sure? This will permanently delete this establishment.")) return;
    try {
      if (type === "restaurant") {
        await restaurantApi.delete(id);
      } else {
        await hotelApi.delete(id);
      }
      fetchData();
    } catch (err) {
      alert("Failed to delete establishment");
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.city.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? item.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-admin-primary mb-1">
            <Building2 className="h-5 w-5" />
            <span className="text-sm font-bold tracking-wide uppercase">Global Properties</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Establishments</h1>
          <p className="text-slate-600 font-medium text-sm mt-1">A unified view of all registered restaurants, cafes, hotels, and resorts.</p>
        </div>
      </div>

      {/* Filter Section - Full Width Row */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search by name, city or area..." 
            className="pl-12 w-full h-11 bg-slate-50 border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-admin-primary transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select 
            className="w-full pl-10 pr-8 h-11 appearance-none font-semibold text-sm text-slate-700 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-admin-primary transition-all shadow-sm cursor-pointer" 
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="restaurant">Restaurants & Dining</option>
            <option value="hotel">Hotels & Resorts</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-admin-primary animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Combined Registry...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Establishment</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Type</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Location</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Status</th>
                <th className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-24 text-slate-500">
                    <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="font-medium text-lg">No establishments found matching your criteria.</p>
                  </td>
                </tr>
              ) : filteredItems.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="group transition-all duration-200 hover:bg-slate-50/80">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-admin-light border border-admin-border flex items-center justify-center text-admin-primary shrink-0 shadow-sm">
                        {item.type === "restaurant" ? <Utensils className="h-5 w-5" /> : <HotelIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{item.email || item.owner?.email || "No Email"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border-0", 
                      item.type === "restaurant" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    )}>
                      {item.type === "restaurant" ? "Restaurant" : "Hotel"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">{item.city}</p>
                      <p className="text-xs font-medium text-slate-500">{item.area || "Area not specified"}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {item.isVerified ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Verified
                      </span>
                    ) : item.applications?.[0]?.status && item.applications[0].status !== "draft" ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        Submitted for Verification
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-700">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/establishments/preview/${item.type}/${item.id}`}>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="rounded-xl h-10 w-10 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all shadow-sm"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/establishments/${item.type}s/${item.id}`}>
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 bg-slate-100 text-admin-text hover:bg-admin-primary hover:text-white transition-all shadow-sm" title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(item.id, item.type)}
                        className="rounded-xl h-10 w-10 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
