"use client";

import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { Calendar, User, BedDouble, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { enquiryApi } from "@/lib/api";
import type { Enquiry } from "@/types";

export function HotelLedger() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      // Fetch upcoming bookings (including ones that haven't checked out yet)
      const res = await enquiryApi.list({ status: "confirmed", upcoming: "true", limit: 100 });
      setEnquiries(res.data?.data?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Grouping
  const arrivingToday = enquiries.filter(e => isSameDay(new Date(e.checkIn), today));
  const departingToday = enquiries.filter(e => isSameDay(new Date(e.checkOut), today));
  const inHouse = enquiries.filter(e => {
    const checkIn = new Date(e.checkIn);
    const checkOut = new Date(e.checkOut);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    return checkIn < today && checkOut > today;
  });
  const upcoming = enquiries.filter(e => {
    const checkIn = new Date(e.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    return checkIn > today;
  });

  if (loading) {
    return <div className="p-8 flex justify-center text-slate-500">Loading ledger...</div>;
  }

  const renderList = (items: Enquiry[], type: "arrival" | "departure" | "inhouse" | "upcoming") => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-white rounded-lg border border-slate-200 border-dashed">
          <Calendar className="h-10 w-10 mb-3 opacity-20" />
          <p>No bookings in this category.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map(e => (
          <div key={e.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md transition-shadow gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-admin-primary/10 flex items-center justify-center text-admin-primary shrink-0">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{e.guest?.name || "Guest"}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-4 w-4" /> {e.roomType?.name || "Standard Room"}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>{format(new Date(e.checkIn), "MMM d")} - {format(new Date(e.checkOut), "MMM d")}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-left sm:text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Status</p>
                <Badge variant="outline" className={cn(
                  "px-3 py-1 bg-emerald-50 text-emerald-600 border-emerald-100 whitespace-nowrap",
                  type === "arrival" ? "bg-blue-50 text-blue-600 border-blue-100" : "",
                  type === "departure" ? "bg-amber-50 text-amber-600 border-amber-100" : ""
                )}>
                  {type === "arrival" ? "Arriving Today" : type === "departure" ? "Departing Today" : type === "inhouse" ? "In House" : "Upcoming"}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Room Ledger</h1>
          <p className="text-slate-500 text-sm mt-1">Manage check-ins, check-outs, and in-house guests.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-bold text-slate-700 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-admin-primary" />
          {format(today, "EEEE, MMMM d, yyyy")}
        </div>
      </div>

      <Tabs defaultValue="arrivals" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-4 bg-white border border-slate-200 shadow-sm p-1 rounded-xl h-auto">
          <TabsTrigger value="arrivals" className="py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-admin-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
            Arriving <span className="ml-1 hidden sm:inline">({arrivingToday.length})</span>
          </TabsTrigger>
          <TabsTrigger value="departures" className="py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-admin-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
            Departing <span className="ml-1 hidden sm:inline">({departingToday.length})</span>
          </TabsTrigger>
          <TabsTrigger value="inhouse" className="py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-admin-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
            In House <span className="ml-1 hidden sm:inline">({inHouse.length})</span>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-admin-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
            Upcoming <span className="ml-1 hidden sm:inline">({upcoming.length})</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="arrivals" className="m-0 focus-visible:outline-none">
            {renderList(arrivingToday, "arrival")}
          </TabsContent>
          <TabsContent value="departures" className="m-0 focus-visible:outline-none">
            {renderList(departingToday, "departure")}
          </TabsContent>
          <TabsContent value="inhouse" className="m-0 focus-visible:outline-none">
            {renderList(inHouse, "inhouse")}
          </TabsContent>
          <TabsContent value="upcoming" className="m-0 focus-visible:outline-none">
            {renderList(upcoming, "upcoming")}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
