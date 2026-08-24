"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, User, BedDouble, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { enquiryApi } from "@/lib/api";
import type { Enquiry } from "@/types";

export function HotelLedger() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRoomType, setFilterRoomType] = useState("all");
  const [filterCategory, setFilterCategory] = useState<"arrival" | "departure" | "inhouse" | "upcoming">("arrival");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      // Fetch upcoming bookings (including ones that haven't checked out yet)
      const res = await enquiryApi.list({ status: "confirmed,checked_in", limit: 100 });
      setEnquiries(res.data?.data?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueRoomTypes = Array.from(
    new Set(enquiries.map((e) => e.roomType?.name).filter(Boolean))
  ) as string[];

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch = e.guest?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoom = filterRoomType === "all" || e.roomType?.name === filterRoomType;

    const checkInDate = new Date(e.checkIn);
    checkInDate.setHours(0, 0, 0, 0);
    const checkOutDate = new Date(e.checkOut);
    checkOutDate.setHours(0, 0, 0, 0);

    let matchesFromDate = true;
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      matchesFromDate = checkOutDate >= from;
    }

    let matchesToDate = true;
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(0, 0, 0, 0);
      matchesToDate = checkInDate <= to;
    }

    return matchesSearch && matchesRoom && matchesFromDate && matchesToDate;
  });

  // Grouping
  const arrivingToday = filteredEnquiries.filter((e) => {
    const checkIn = new Date(e.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    return checkIn <= today && e.status === "confirmed";
  });

  const departingToday = filteredEnquiries.filter((e) => {
    const checkOut = new Date(e.checkOut);
    checkOut.setHours(0, 0, 0, 0);
    return checkOut <= today && e.status === "checked_in";
  });

  const inHouse = filteredEnquiries.filter((e) => {
    const checkOut = new Date(e.checkOut);
    checkOut.setHours(0, 0, 0, 0);
    return checkOut > today && e.status === "checked_in";
  });

  const upcoming = filteredEnquiries.filter((e) => {
    const checkIn = new Date(e.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    return checkIn > today && e.status === "confirmed";
  });

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await enquiryApi.updateStatus(id, status);
      fetchLedger(); // Refresh
    } catch (e) {
      console.error(e);
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
      expired: "bg-slate-100 text-slate-400 border-slate-200",
    };
    return (
      <Badge
        variant="outline"
        className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border",
          styles[status] || styles.confirmed
        )}
      >
        {status === "checked_in" ? "checked in" : status === "checked_out" ? "checked out" : status}
      </Badge>
    );
  };

  if (loading) return <div className="p-8">Loading ledger...</div>;

  const renderTable = (items: Enquiry[], type: "arrival" | "departure" | "inhouse" | "upcoming") => {
    if (items.length === 0) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          No bookings found in this category.
        </div>
      );
    }

    return (
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
              {items.map((enquiry) => (
                <tr key={enquiry.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{enquiry.guest?.name}</span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">
                        Booked {format(new Date(enquiry.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <Calendar className="h-4 w-4 text-admin-primary" />
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
                    {type === "arrival" && (
                      <Button
                        size="sm"
                        className="h-8 bg-admin-primary hover:bg-admin-primary/90 text-white px-4 text-xs font-semibold transition-colors"
                        onClick={() => handleStatusChange(enquiry.id, "checked_in")}
                      >
                        Check In
                      </Button>
                    )}
                    {type === "departure" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors px-4 text-xs font-semibold"
                        onClick={() => handleStatusChange(enquiry.id, "checked_out")}
                      >
                        Check Out
                      </Button>
                    )}
                    {type === "inhouse" && (
                      <span className="text-xs text-slate-400 font-medium px-2">In House</span>
                    )}
                    {type === "upcoming" && (
                      <span className="text-xs text-slate-400 font-medium px-2">Awaiting Arrival</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FBFB] p-8 overflow-y-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tighter">Room Ledger</h2>
        <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 font-semibold px-3 py-1 text-sm shadow-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-admin-primary" />
          {format(today, "EEEE, MMMM d")}
        </Badge>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end shadow-sm">
        <div className="flex flex-col gap-1.5 w-full col-span-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Search Guest</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full col-span-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Room Type</label>
          <select
            value={filterRoomType}
            onChange={(e) => setFilterRoomType(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950"
          >
            <option value="all">All Rooms</option>
            {uniqueRoomTypes.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 w-full col-span-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950"
          >
            <option value="arrival">Arriving ({arrivingToday.length})</option>
            <option value="departure">Departing ({departingToday.length})</option>
            <option value="inhouse">In House ({inHouse.length})</option>
            <option value="upcoming">Upcoming ({upcoming.length})</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 w-full col-span-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">From Date</label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full col-span-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">To Date</label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full col-span-1">
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery("");
              setFilterRoomType("all");
              setFilterCategory("arrival");
              setFromDate("");
              setToDate("");
            }}
            className="h-9 text-slate-500 hover:text-slate-800 w-full"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Table Content */}
      <div className="mt-2">
        {renderTable(
          filterCategory === "arrival" ? arrivingToday :
          filterCategory === "departure" ? departingToday :
          filterCategory === "inhouse" ? inHouse : upcoming,
          filterCategory
        )}
      </div>
    </div>
  );
}
