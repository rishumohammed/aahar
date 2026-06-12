"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { applicationApi } from "@/lib/api";
import { Search, Loader2, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under review" },
  { key: "audit_scheduled", label: "Audit scheduled" },
  { key: "audit_complete", label: "Audit complete" },
  { key: "certified", label: "Certified" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_BADGE: Record<string, string> = {
  submitted: "badge-pending",
  under_review: "badge bg-admin-light text-admin-text border border-admin-border",
  gap_analysis: "badge-pending",
  audit_scheduled: "badge bg-teal-50 text-teal-700 border border-teal-200",
  audit_complete: "badge bg-orange-50 text-orange-700 border border-orange-200",
  approved: "badge-success",
  certified: "badge-cert",
  rejected: "badge-expired",
};

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [tab, setTab] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await applicationApi.list({
        status: tab || undefined,
        page,
        limit: 20,
      });
      setApps(res.data.data.items);
      setTotal(res.data.data.total);
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = apps.filter((a) => {
    if (!search) return true;
    const name = a.restaurant?.name ?? a.hotel?.name ?? a.businessName ?? "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Application Pipeline</h1>
          <p className="text-slate-600 font-medium text-sm mt-1">{total} total applications in the system.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                tab === t.key
                  ? "bg-admin-primary text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-md border border-slate-200 focus:ring-2 focus:ring-admin-primary transition-shadow outline-none"
            placeholder="Search by business name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Registry Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Applicant</th>
              <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Type & Location</th>
              <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Pipeline Status</th>
              <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Date</th>
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
                <td colSpan={5} className="text-center py-20 italic text-slate-500">No applications found in this segment.</td>
              </tr>
            ) : filtered.map(app => {
              const name = app.restaurant?.name ?? app.hotel?.name ?? app.businessName ?? "—";
              const city = app.restaurant?.city ?? app.hotel?.city ?? app.city ?? "—";
              return (
                <tr key={app.id} className="group transition-colors hover:bg-slate-50">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm bg-admin-light text-admin-text border border-admin-border">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{name}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{app.applicant?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-admin-text">
                        {app.businessType === 'fnb' ? "F&B Division" : "Accommodation"}
                      </p>
                      <p className="text-xs text-slate-600">{city}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn("badge py-1 px-3", STATUS_BADGE[app.status] ?? "badge-cat")}>
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-slate-900">
                      {(app.submittedAt || app.createdAt)
                        ? new Date(app.submittedAt || app.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </div>
                    {!app.submittedAt && <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Created</div>}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link href={`/admin/applications/${app.id}`}>
                      <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 bg-slate-100 text-admin-text hover:bg-admin-primary hover:text-white transition-all shadow-sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Showing {((page - 1) * 20) + 1} – {Math.min(page * 20, total)} of {total} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= total}
              className="bg-admin-primary text-white hover:bg-admin-hover px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
