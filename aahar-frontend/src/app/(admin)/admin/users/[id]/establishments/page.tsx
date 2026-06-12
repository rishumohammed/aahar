"use client";

import { useEffect, useState } from "react";
import { adminApi, restaurantApi, hotelApi } from "@/lib/api";
import { 
  Search, 
  Edit3, 
  Trash2, 
  Utensils,
  Hotel as HotelIcon,
  Loader2,
  Building2,
  Filter,
  ArrowLeft,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";

export default function UserEstablishmentsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchData = async () => {
    try {
      const res = await adminApi.getUser(userId);
      const userData = res.data.data;
      setUser(userData);

      const restaurants = (userData.restaurants || []).map((r: any) => ({ ...r, type: "restaurant" }));
      const hotels = (userData.hotels || []).map((h: any) => ({ ...h, type: "hotel" }));

      // Merge and sort
      const merged = [...restaurants, ...hotels].sort((a, b) => {
        return (a.name || "").localeCompare(b.name || "");
      });

      setItems(merged);
    } catch (err) {
      console.error(err);
      alert("Failed to load user establishments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

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
    <div className="max-w-[1400px] mx-auto space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => router.push("/admin/users")} 
        className="text-slate-500 hover:text-admin-primary flex items-center gap-2 px-0 hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4" /> Back to User Registry
      </Button>

      {/* Header Section */}
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-admin-text">
            <Building2 className="h-5 w-5" />
            <span className="text-sm font-semibold text-admin-text">User Portfolio</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Establishments for {user?.name || "User"}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Manage all restaurants and hotels associated with this stakeholder.
          </p>
        </div>
        
        {/* Filter Section */}
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
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select 
              className="w-full pl-9 pr-8 h-12 appearance-none font-medium text-sm bg-white rounded-md border border-slate-200 outline-none focus:ring-2 focus:ring-admin-primary transition-shadow" 
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="restaurant">Restaurants & Dining</option>
              <option value="hotel">Hotels & Resorts</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-admin-primary animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Portfolio...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Establishment</th>
                <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Type</th>
                <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Location</th>
                <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Status</th>
                <th className="text-right text-xs font-semibold text-slate-600 px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 italic text-slate-500">No establishments found matching your criteria.</td>
                </tr>
              ) : filteredItems.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="group transition-colors hover:bg-slate-50">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-admin-light border border-admin-border flex items-center justify-center text-admin-text shrink-0">
                        {item.type === "restaurant" ? <Utensils className="h-4 w-4" /> : <HotelIcon className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{item.email || "No Email"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider", 
                      item.type === "restaurant" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                    )}>
                      {item.type === "restaurant" ? "Restaurant" : "Hotel"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">{item.city}</p>
                      <p className="text-xs text-slate-600">{item.area || "Area not specified"}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`badge py-1 px-3 ${item.isVerified ? "badge-cert" : "badge-pending"}`}>
                      {item.isVerified ? "Certified" : "Unverified"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/establishments/preview/${item.type}/${item.id}`}>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="rounded-lg h-9 w-9 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all shadow-sm"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/establishments/${item.type}s/${item.id}`}>
                        <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 bg-slate-100 text-admin-text hover:bg-admin-primary hover:text-white transition-all shadow-sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(item.id, item.type)}
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
