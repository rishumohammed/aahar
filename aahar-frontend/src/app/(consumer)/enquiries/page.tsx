"use client";
import { useState, useEffect } from "react";
import { enquiryApi } from "@/lib/api";
import type { Enquiry } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Hotel, 
  Calendar, 
  Users, 
  ChevronRight, 
  Clock,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function ConsumerEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    enquiryApi.list()
      .then(res => setEnquiries(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":      return "bg-blue-50 text-blue-600 border-blue-200";
      case "quoted":    return "bg-teal-50 text-teal-600 border-teal-200";
      case "confirmed": return "bg-green-50 text-green-600 border-green-200";
      case "declined":  return "bg-red-50 text-red-600 border-red-200";
      case "expired":   return "bg-gray-50 text-gray-600 border-gray-200";
      default:          return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-aahar-dark">My Enquiries</h1>
          <p className="text-aahar-body">Track your hotel booking requests</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-aahar-wash animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-aahar-border">
          <div className="w-16 h-16 bg-aahar-wash rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-aahar-body/40" />
          </div>
          <h3 className="text-lg font-bold text-aahar-dark">No enquiries yet</h3>
          <p className="text-sm text-aahar-body mb-6">Explore hotels and send a request to get started.</p>
          <Button asChild className="bg-aahar-teal">
            <Link href="/">Browse Hotels</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {enquiries.map((e) => (
            <Link key={e.id} href={`/enquiries/${e.id}`}>
              <Card className="p-6 hover:shadow-lg transition-all border-aahar-border group overflow-hidden relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-aahar-teal/10 flex items-center justify-center shrink-0">
                      <Hotel className="h-6 w-6 text-aahar-teal" />
                    </div>
                    <div>
                      <h3 className="font-bold text-aahar-dark group-hover:text-aahar-teal transition-colors">
                        {e.hotel?.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-aahar-body">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(e.checkIn), "dd MMM")} - {format(new Date(e.checkOut), "dd MMM yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {e.guests.adults} Guests
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-0 pt-4 md:pt-0">
                    <div className="text-right hidden md:block">
                      <div className="text-[10px] uppercase font-bold text-aahar-body tracking-widest mb-1">Status</div>
                      <Badge variant="outline" className={getStatusColor(e.status)}>
                        {e.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="md:hidden">
                      <Badge variant="outline" className={getStatusColor(e.status)}>
                        {e.status.toUpperCase()}
                      </Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 text-aahar-body/30 group-hover:text-aahar-teal group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
                
                {e.status === "quoted" && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-aahar-teal text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-tighter animate-pulse">
                      Action Required
                    </div>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
