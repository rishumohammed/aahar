"use client";
import { useState, useEffect } from "react";
import { enquiryApi, hotelApi } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/lib/hooks/useAuth";
import { Input } from "@/components/ui/input";
import type { Enquiry } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, BedDouble, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ManagerEnquiriesPage() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (user?.id) {
      hotelApi.list({ managerId: user.id }).then(res => {
        const hotels = res.data.data?.items || [];
        const rooms = hotels.flatMap((h: any) => h.roomTypes || []);
        setRoomTypes(rooms);
      });
    }
  }, [user]);

  useEffect(() => {
    fetchEnquiries();
    
    const socket = getSocket();
    socket.on("new_enquiry", (newEnquiry: Enquiry) => {
      setEnquiries(prev => [newEnquiry, ...prev]);
    });

    socket.on("enquiry_updated", (updated: Enquiry) => {
      setEnquiries(prev => prev.map(e => e.id === updated.id ? updated : e));
    });

    return () => {
      socket.off("new_enquiry");
      socket.off("enquiry_updated");
    };
  }, [startDate, endDate, roomTypeId, page]);

  const fetchEnquiries = async () => {
    try {
      const res = await enquiryApi.list({ startDate, endDate, roomTypeId, page, limit: 10 });
      setEnquiries(res.data.data?.items || []);
      setTotalPages(res.data.data?.totalPages || 1);
      setTotalItems(res.data.data?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Enquiry["status"]) => {
    const styles = {
      sent: "bg-admin-primary/10 text-admin-primary border-admin-primary/20",
      viewed: "bg-blue-50 text-blue-600 border-blue-100",
      quoted: "bg-amber-50 text-amber-600 border-amber-100",
      confirmed: "bg-emerald-50 text-emerald-600 border-emerald-100",
      checked_in: "bg-teal-50 text-teal-600 border-teal-100",
      checked_out: "bg-slate-50 text-slate-400 border-slate-100",
      declined: "bg-slate-50 text-slate-400 border-slate-100",
      expired: "bg-slate-100 text-slate-400 border-slate-200"
    };
    return (
      <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border", styles[status] || styles.confirmed)}>
        {status === "checked_in" ? "checked in" : status === "checked_out" ? "checked out" : status}
      </Badge>
    );
  };

  if (loading) return <div className="p-8">Loading bookings...</div>;

  return (
    <div className="flex flex-col h-full bg-[#F8FBFB] p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tighter">Bookings</h2>
        <Badge className="bg-admin-primary text-white rounded-full px-3 py-1 text-sm">{totalItems} Total</Badge>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex items-center gap-4 shadow-sm">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Start Date</label>
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="h-9"
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">End Date</label>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="h-9"
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Room Type</label>
          <select 
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950"
          >
            <option value="">All Rooms</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>{rt.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 self-end">
          <Button 
            variant="ghost" 
            onClick={() => { setStartDate(""); setEndDate(""); setRoomTypeId(""); setPage(1); }}
            className="h-9 text-slate-500 hover:text-slate-800"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Room Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{enquiry.guest?.name}</span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                          Requested {format(new Date(enquiry.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <CalendarIcon className="h-4 w-4 text-admin-primary" />
                        {format(new Date(enquiry.checkIn), "MMM d")} - {format(new Date(enquiry.checkOut), "MMM d")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-semibold text-admin-primary">
                        <BedDouble className="h-4 w-4" />
                        {enquiry.roomType?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(enquiry.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link href={`/manager/enquiries/${enquiry.id}`}>
                        <Button variant="outline" size="sm" className="relative h-8 gap-2 border-slate-200 text-slate-700 hover:bg-admin-primary hover:text-white hover:border-admin-primary transition-colors">
                          <MessageCircle className="h-3.5 w-3.5" />
                          Chat
                          {(enquiry as any).unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                              {(enquiry as any).unreadCount}
                            </span>
                          )}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-semibold text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
