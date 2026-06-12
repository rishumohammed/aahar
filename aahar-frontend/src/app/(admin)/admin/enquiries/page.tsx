"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { leadApi } from "@/lib/api";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  ArrowUpRight,
  Clock,
  User,
  Building
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const res = await leadApi.list();
      setEnquiries(res.data.data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = enquiries.filter(e => 
    e.entityName?.toLowerCase().includes(search.toLowerCase()) ||
    e.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Global Enquiries</h1>
        <p className="text-slate-600 font-medium text-sm mt-1">Monitor and mediate customer interactions across the trust network.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            className="pl-12 h-12 rounded-lg bg-white border-slate-200" 
            placeholder="Search by subject, user or business..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button type="button"  variant="outline" className="h-12 px-6 rounded-lg border border-slate-200 bg-white flex items-center gap-2 hover:border-admin-primary transition-all group">
          <Filter className="h-4 w-4 text-slate-500 group-hover:text-admin-primary" />
          <span className="text-sm font-medium text-slate-500 group-hover:text-admin-primary">Filter Status</span>
        </Button>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Subject & Target</th>
              <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Customer</th>
              <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Status</th>
              <th className="text-left text-xs font-semibold text-slate-600 px-8 py-5">Last Activity</th>
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
                <td colSpan={5} className="text-center py-20 italic text-slate-500">No enquiries found.</td>
              </tr>
            ) : filtered.map((enquiry) => {
              const targetName = enquiry.entityName || "Unknown Business";
              const subject = enquiry.enquiryType === "get_certified" ? "Apply for Certification" : "List Business";
              
              return (
                <tr key={enquiry.id} className="group transition-colors hover:bg-slate-50">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-admin-light border border-admin-border flex items-center justify-center text-admin-text shrink-0">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="mb-1.5">
                          <Badge className={cn(
                            "text-[9px] uppercase font-black tracking-widest border-0 px-2 py-0.5 shadow-sm",
                            enquiry.enquiryType === "get_certified" ? "bg-purple-50 text-purple-700 hover:bg-purple-100" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          )}>
                            {subject}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-slate-400" /> {targetName}
                          <span className="text-xs font-medium text-slate-500 capitalize">({enquiry.entityType})</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-semibold text-xs shrink-0">
                        {enquiry.applicantName?.charAt(0) || <User className="h-4 w-4" />}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{enquiry.applicantName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge className={cn(
                      "text-[9px] uppercase font-black tracking-widest border-0 px-2.5 py-1",
                      enquiry.status === "resolved" ? "bg-emerald-50 text-emerald-600" :
                      enquiry.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-admin-light text-admin-text"
                    )}>
                      {enquiry.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(enquiry.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs text-slate-600">
                        {new Date(enquiry.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link href={`/admin/enquiries/${enquiry.id}`}>
                      <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 bg-slate-100 text-admin-text hover:bg-admin-primary hover:text-white transition-all shadow-sm">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
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
