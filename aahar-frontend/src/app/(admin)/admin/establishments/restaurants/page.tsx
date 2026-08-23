"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { restaurantApi } from "@/lib/api";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Utensils,
  Loader2,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { RestaurantCard } from "@/components/shared/RestaurantCard";

export default function RestaurantsManagementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const res = await restaurantApi.list({ all: true });
      setItems(res.data.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will permanently delete this establishment.")) return;
    try {
      await restaurantApi.delete(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-admin-text">
            <Utensils className="h-5 w-5" />
            <span className="text-sm font-semibold text-admin-text">Dining Division</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Restaurants</h1>
          <p className="text-slate-500 font-medium text-sm">Oversee all dining establishments and menu inventories.</p>
        </div>
        
        {/* Filter Section - Full Width Row */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search by name, city or area..." 
              className="pl-12 w-full h-12 bg-slate-50 border-none rounded-lg text-sm font-medium placeholder:text-slate-400 focus-visible:ring-admin-primary transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button type="button"  variant="outline" className="h-12 px-6 rounded-lg border border-slate-200 bg-white group hover:border-admin-primary transition-all flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500 group-hover:text-admin-primary" />
              <span className="text-sm font-medium text-slate-500 group-hover:text-admin-primary">Filters</span>
            </Button>
            <Link href="/admin/establishments/restaurants/new" className="flex-1 md:flex-none">
              <Button className="w-full h-12 px-6 bg-admin-primary hover:bg-admin-hover text-white rounded-lg font-medium text-sm shadow-sm transition-all">
                <Plus className="h-4 w-4 mr-2" /> Register New
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-admin-primary animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Registry...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Establishment</th>
                <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Location</th>
                <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Cuisine Type</th>
                <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Status</th>
                <th className="text-right text-xs font-semibold text-slate-600 px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 italic text-slate-500">No restaurants found in this segment.</td>
                </tr>
              ) : filteredItems.map((item) => (
                <tr key={item.id} className="group transition-colors hover:bg-slate-50">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-admin-light border border-admin-border flex items-center justify-center text-admin-text shrink-0">
                        <Utensils className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{item.email || item.owner?.email || "No Email"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">{item.city}</p>
                      <p className="text-xs text-slate-600">{item.area}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1">
                      {(item.cuisineType || []).slice(0, 2).map((c: string, i: number) => (
                        <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                          {c}
                        </span>
                      ))}
                      {(item.cuisineType?.length > 2) && (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                          +{item.cuisineType.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {item.isVerified ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Verified
                      </span>
                    ) : item.applications?.[0]?.status && item.applications[0].status !== "draft" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-sm animate-pulse">
                        Submitted for Verification
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/establishments/preview/restaurant/${item.id}`}>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="rounded-lg h-9 w-9 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all shadow-sm"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/establishments/restaurants/${item.id}`}>
                        <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 bg-slate-100 text-admin-text hover:bg-admin-primary hover:text-white transition-all shadow-sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg h-9 w-9 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
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
