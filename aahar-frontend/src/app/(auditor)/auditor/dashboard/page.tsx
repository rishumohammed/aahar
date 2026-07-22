"use client";

import { useEffect, useState } from "react";
import { Loader2, ClipboardCheck, Clock, CheckCircle2 } from "lucide-react";
import { auditorApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";

export default function AuditorDashboard() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });

  useEffect(() => {
    auditorApi.list()
      .then(res => {
        const audits = res.data?.data || [];
        setStats({
          total: audits.length,
          pending: audits.filter((a: any) => a.status === 'scheduled' || a.status === 'in_progress').length,
          completed: audits.filter((a: any) => a.status === 'completed' || a.status === 'reviewed').length
        });
      })
      .catch(err => console.error("Failed to load auditor stats", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
          <p className="text-sm font-bold text-slate-600">Loading Auditor Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.name || 'Auditor'}!</h1>
        <p className="text-slate-600 font-medium text-sm mt-1">Here is the overview of your assigned audits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-admin-light flex items-center justify-center shrink-0">
            <ClipboardCheck className="h-6 w-6 text-admin-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Audits</p>
            <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-3xl font-black text-slate-900">{stats.pending}</p>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
            <p className="text-3xl font-black text-slate-900">{stats.completed}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
