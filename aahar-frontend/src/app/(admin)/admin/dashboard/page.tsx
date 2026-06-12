"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Search, 
  ArrowUpRight,
  Building
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { adminApi, applicationApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, appsRes] = await Promise.all([
        adminApi.stats(),
        applicationApi.list({ limit: 10 })
      ]);
      setDashboardData(dashRes.data?.data?.stats);
      setApplications(appsRes.data?.data?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const KPIS = [
    { label: "Applications Pending", value: dashboardData?.pendingApps || "0", sub: "Awaiting review", icon: FileText, color: "text-admin-text", bg: "bg-admin-light" },
    { label: "Total Enquiries", value: dashboardData?.totalEnquiries || "0", sub: "System volume", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Certified Members", value: dashboardData?.totalCertified || "0", sub: "Verified entities", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Revenue", value: `₹${(dashboardData?.totalRevenue || 0).toLocaleString()}`, sub: "Payment volume", icon: TrendingUp, color: "text-admin-text", bg: "bg-admin-light" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Real-time status of the AAHAR network.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPIS.map((kpi, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={kpi.label}
          >
            <Card className="p-6 rounded-lg border-0 shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-full", kpi.bg)}>
                  <kpi.icon className={cn("h-6 w-6", kpi.color)} />
                </div>
                <Badge variant="secondary" className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 uppercase tracking-wider">Live</Badge>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{kpi.label}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{kpi.value}</h3>
                <p className="text-sm text-slate-500 mt-1">{kpi.sub}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Material Data Table Card */}
      <Card className="bg-white rounded-lg border-0 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Recent Applications</h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 rounded-md border-slate-300 bg-white w-64 focus:ring-2 focus:ring-admin-primary transition-shadow"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">App ID</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Business Name</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Submitted</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length > 0 ? applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{app.id.substring(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0">
                        <Building className="h-4 w-4 text-slate-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">
                        {app.restaurant?.name || app.hotel?.name || "Business Entity"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600 capitalize">{app.businessType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{new Date(app.submittedAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link href={`/admin/applications/${app.id}`}>
                      <Button variant="ghost" size="sm" className="text-admin-text hover:text-admin-hover hover:bg-admin-light">
                        View
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    submitted: "bg-admin-light text-admin-text",
    under_review: "bg-amber-50 text-amber-700",
    certified: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium capitalize", styles[status] || "bg-gray-100 text-gray-700")}>
      {status.replace('_', ' ')}
    </span>
  );
}
