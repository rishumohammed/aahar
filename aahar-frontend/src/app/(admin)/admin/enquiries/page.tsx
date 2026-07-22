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
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Enquiries</h1>
          <p className="text-slate-600 font-medium text-sm mt-1">Monitor and mediate customer interactions across the trust network.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            className="pl-12 h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-admin-primary transition-shadow" 
            placeholder="Search by subject, user or business..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button type="button" variant="outline" className="h-11 px-6 rounded-xl border border-slate-200 bg-white flex items-center gap-2 hover:bg-slate-50 hover:border-admin-primary hover:text-admin-primary transition-all shadow-sm">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-semibold">Filter Status</span>
        </Button>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Subject & Target</th>
              <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Customer</th>
              <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Status</th>
              <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-8 py-4">Last Activity</th>
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
                  <MessageSquare className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="font-medium text-lg">No enquiries found.</p>
                </td>
              </tr>
            ) : filtered.map((enquiry) => {
              const targetName = enquiry.entityName || "Unknown Business";
              const subject = enquiry.enquiryType === "get_certified" ? "Apply for Certification" : "List Business";
              
              return (
                <tr key={enquiry.id} className="group transition-all duration-200 hover:bg-slate-50/80">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-admin-light border border-admin-border flex items-center justify-center text-admin-primary shrink-0 shadow-sm">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="mb-1.5">
                          <Badge className={cn(
                            "text-[10px] uppercase font-bold tracking-widest border-0 px-2.5 py-0.5 rounded-full shadow-sm",
                            enquiry.enquiryType === "get_certified" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          )}>
                            {subject}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-slate-400" /> {targetName}
                          <span className="text-xs font-medium text-slate-500 capitalize">({enquiry.entityType})</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0 border border-slate-200 shadow-sm">
                        {enquiry.applicantName?.charAt(0) || <User className="h-4 w-4" />}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{enquiry.applicantName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <Badge className={cn(
                      "text-[10px] uppercase font-bold tracking-widest border-0 px-3 py-1 rounded-full shadow-sm",
                      enquiry.status === "converted" || enquiry.status === "resolved" ? "bg-emerald-100 text-emerald-800" :
                      enquiry.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"
                    )}>
                      {enquiry.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {new Date(enquiry.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {new Date(enquiry.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Link href={`/admin/enquiries/${enquiry.id}`}>
                      <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 bg-slate-100 text-slate-600 hover:bg-admin-primary hover:text-white transition-all shadow-sm">
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
