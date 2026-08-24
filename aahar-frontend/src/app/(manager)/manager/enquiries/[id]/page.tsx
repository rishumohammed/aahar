"use client";
import { useState, useEffect, useRef } from "react";
import { enquiryApi } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Enquiry, EnquiryMessage } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, CalendarIcon, BedDouble } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ManagerEnquiryDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [messages, setMessages] = useState<EnquiryMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEnquiry();
    
    const socket = getSocket();
    socket.emit("join_enquiry", params.id);
    
    socket.on("new_message", (data: any) => {
      setMessages(prev => [...prev, data.message || data]);
    });

    socket.on("enquiry_updated", (updated: Enquiry) => {
      setEnquiry(updated);
    });

    return () => {
      socket.off("new_message");
      socket.off("enquiry_updated");
    };
  }, [params.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchEnquiry = async () => {
    try {
      const res = await enquiryApi.get(params.id);
      setEnquiry(res.data.data);
      setMessages(res.data.data.messages || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!replyText.trim() || !enquiry?.id) return;
    try {
      const res = await enquiryApi.sendMessage(enquiry.id, replyText);
      setMessages(prev => [...prev, res.data.data]);
      setReplyText("");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to send message");
    }
  };

  const handleUpdateStatus = async (status: string, extra = {}) => {
    if (!enquiry?.id) return;
    let finalExtra = { ...extra };
    
    if (status === "quoted") {
      const amount = prompt("Enter the quote amount (INR):");
      if (!amount || isNaN(Number(amount))) {
        toast.error("Please enter a valid amount");
        return;
      }
      finalExtra = { ...finalExtra, quoteAmount: Number(amount) };
    }

    try {
      await enquiryApi.updateStatus(enquiry.id, status, finalExtra);
      toast.success(`Booking status updated to ${status}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <div className="p-8">Loading booking details...</div>;
  if (!enquiry) return <div className="p-8">Booking not found.</div>;

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="flex-1 flex flex-col bg-white overflow-hidden min-h-0">
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-200 shrink-0 flex flex-col md:flex-row md:items-center justify-between bg-white z-20 shadow-sm gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/manager/enquiries">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-aahar-rose to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-admin-primary/20">
              {enquiry.guest?.name?.charAt(0)}
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none">{enquiry.guest?.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-[11px] font-bold text-slate-500/80 uppercase tracking-wider leading-none">Requesting {enquiry.roomType?.name}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                  <CalendarIcon className="h-3 w-3"/>
                  {format(new Date(enquiry.checkIn), "MMM d")} - {format(new Date(enquiry.checkOut), "MMM d")}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-300 text-slate-600">
              {enquiry.status}
            </Badge>

            {/* Action Buttons Moved to Header */}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              {enquiry.status === "confirmed" && (
                <Button 
                  onClick={() => handleUpdateStatus("checked_in")}
                  className="h-9 bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                >
                  Check In
                </Button>
              )}
              {enquiry.status === "checked_in" && (
                <Button 
                  onClick={() => handleUpdateStatus("checked_out")}
                  className="h-9 bg-amber-500 text-white hover:bg-amber-600 rounded-full px-5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                >
                  Check Out
                </Button>
              )}
              {(enquiry.hotel as any)?.approvalPreference !== "instant" && !["checked_in", "checked_out"].includes(enquiry.status) && (
                <>
                  <Button 
                    onClick={() => handleUpdateStatus("confirmed")}
                    disabled={enquiry.status === "confirmed"}
                    className="h-9 bg-admin-primary text-white hover:bg-admin-primary/90 rounded-full px-5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                  >
                    Confirm
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleUpdateStatus("quoted")}
                    disabled={enquiry.status === "quoted" || enquiry.status === "confirmed"}
                    className="h-9 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Quote
                  </Button>
                </>
              )}
              {!["checked_in", "checked_out"].includes(enquiry.status) && (
                <Button 
                  variant="ghost"
                  onClick={() => handleUpdateStatus("declined")}
                  className="h-9 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-full px-4 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Decline
                </Button>
              )}
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-[#F8FAFA] min-h-0">
          {messages?.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%] md:max-w-[75%]",
                msg.senderId === user?.id ? "ml-auto items-end" : "items-start"
              )}
            >
              <div className={cn(
                "px-6 py-4 text-[14px] font-medium leading-relaxed shadow-sm",
                msg.senderId === user?.id 
                  ? "bg-gradient-to-tr from-slate-800 to-slate-900 text-white rounded-2xl rounded-tr-sm shadow-md shadow-slate-900/10"
                  : "bg-white border border-slate-100 rounded-2xl rounded-tl-sm text-slate-800 shadow-sm"
              )}>
                {msg.content}
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest px-2">
                {format(new Date(msg.sentAt), "h:mm aa")}
              </span>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 md:px-6 md:py-4 bg-white border-t border-slate-100 shrink-0">
          <div className="max-w-5xl mx-auto">
            <div className="relative group">
              <Input 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="w-full h-12 pl-6 pr-14 rounded-full border-slate-200 bg-slate-50/50 font-medium text-slate-700 focus:bg-white focus:ring-aahar-rose focus:border-admin-primary shadow-sm transition-all text-sm"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
                <Button 
                  onClick={handleSendMessage}
                  className="h-9 w-9 bg-admin-primary text-white rounded-full shadow-md shadow-admin-primary/20 active:scale-95 p-0 hover:bg-admin-primary/90 transition-all"
                >
                  <Send className="h-4 w-4 ml-0.5"/>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
