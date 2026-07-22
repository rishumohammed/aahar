"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { 
  CheckSquare, 
  Clock, 
  Calendar, 
  User, 
  Building2, 
  ArrowUpRight,
  Filter,
  Search,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AuditsManagementPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  const loadAudits = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listAudits({ status: filter || undefined });
      setAudits(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.items || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, [filter]);

  const filtered = audits.filter(a => {
    const bizName = a.application?.restaurant?.name || a.application?.hotel?.name || a.application?.businessName || "";
    return bizName.toLowerCase().includes(search.toLowerCase()) ||
           a.auditor?.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Registry</h1>
          <p className="text-slate-600 font-medium text-sm mt-1">Track site inspections and technical evaluations across the network.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            className="w-full pl-12 pr-4 h-11 bg-slate-50 border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-admin-primary transition-all outline-none" 
            placeholder="Search by business name or auditor..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex bg-slate-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto shadow-inner border border-slate-100 no-scrollbar shrink-0">
          {[
            { label: "All", value: "" },
            { label: "Scheduled", value: "scheduled" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" }
          ].map((btn) => (
            <button 
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                filter === btn.value ? "bg-white text-admin-primary shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Target Entity</th>
              <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Assigned Auditor</th>
              <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Status</th>
              <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Inspection Time</th>
              <th className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-6">
                    <div className="h-12 bg-slate-100 rounded-xl w-full" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-24 text-slate-500">
                  <CheckSquare className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="font-medium text-lg">No audits found matching criteria.</p>
                </td>
              </tr>
            ) : filtered.map((audit) => {
              const bizName = audit.application?.restaurant?.name || audit.application?.hotel?.name || audit.application?.businessName || "Unknown Entity";
              const city = audit.application?.restaurant?.city || audit.application?.hotel?.city || "Regional";
              
              return (
                <tr key={audit.id} className="group transition-all duration-200 hover:bg-slate-50/80">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-admin-light border border-admin-border flex items-center justify-center text-admin-primary font-bold text-sm shrink-0 shadow-sm">
                        {bizName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{bizName}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{city} · {audit.application?.businessType === 'fnb' ? 'F&B' : 'Accommodation'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0 border border-slate-200 shadow-sm">
                        {audit.auditor?.name?.charAt(0) || <User className="h-4 w-4" />}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{audit.auditor?.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border-0",
                      audit.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                      audit.status === "scheduled" ? "bg-slate-100 text-slate-800" : "bg-amber-100 text-amber-800"
                    )}>
                      {audit.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {new Date(audit.scheduledAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {new Date(audit.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {audit.status !== "completed" && (
                        <Link href={`/admin/audits/execute/${audit.id}`}>
                          <Button size="sm" className="bg-admin-primary text-white rounded-lg font-semibold text-[11px] px-5 hover:bg-admin-hover shadow-sm">
                            Execute
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/applications/${audit.applicationId}`}>
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 bg-slate-100 text-slate-600 hover:bg-admin-primary hover:text-white transition-all shadow-sm" title="View Application">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
