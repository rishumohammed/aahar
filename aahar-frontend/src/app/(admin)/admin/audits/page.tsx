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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Audit Registry</h1>
          <p className="text-slate-600 font-medium text-sm mt-1">Track site inspections and technical evaluations across the network.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            className="w-full pl-12 pr-4 py-2 text-sm bg-white rounded-md border border-slate-200 focus:ring-2 focus:ring-admin-primary transition-shadow outline-none" 
            placeholder="Search by business name or auditor..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
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
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                filter === btn.value ? "bg-admin-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-600 hover:bg-slate-100"
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Target Entity</th>
              <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Assigned Auditor</th>
              <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Status</th>
              <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Inspection Time</th>
              <th className="text-right text-xs font-semibold text-slate-600 px-8 py-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-6">
                    <div className="h-10 bg-slate-100 rounded-xl w-full" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 italic text-slate-500">No audits found matching criteria.</td>
              </tr>
            ) : filtered.map((audit) => {
              const bizName = audit.application?.restaurant?.name || audit.application?.hotel?.name || audit.application?.businessName || "Unknown Entity";
              const city = audit.application?.restaurant?.city || audit.application?.hotel?.city || "Regional";
              
              return (
                <tr key={audit.id} className="group transition-colors hover:bg-slate-50">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-admin-light border border-admin-border flex items-center justify-center text-admin-text font-bold text-sm shrink-0">
                        {bizName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{bizName}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{city} · {audit.application?.businessType === 'fnb' ? 'F&B' : 'Accommodation'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-semibold text-xs shrink-0">
                        {audit.auditor?.name?.charAt(0) || <User className="h-4 w-4" />}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{audit.auditor?.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "badge py-1 px-3",
                      audit.status === "completed" ? "badge-success" :
                      audit.status === "scheduled" ? "badge bg-admin-light text-admin-text border-admin-border" : "badge-pending"
                    )}>
                      {audit.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(audit.scheduledAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs text-slate-600">
                        {new Date(audit.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {audit.status !== "completed" && (
                        <Link href={`/admin/audits/execute/${audit.id}`}>
                          <Button size="sm" className="bg-admin-primary text-white rounded-lg font-medium text-xs px-4 hover:bg-admin-hover">
                            Execute
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/applications/${audit.applicationId}`}>
                        <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 bg-slate-100 text-admin-text hover:bg-admin-primary hover:text-white transition-all shadow-sm" title="View Application">
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
