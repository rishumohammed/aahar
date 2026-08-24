"use client";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { enquiryApi } from "@/lib/api";
import { getSocket }    from "@/lib/socket";
import type { Enquiry, EnquiryMessage } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Hotel, 
  Calendar, 
  Users, 
  ArrowLeft, 
  Send,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";
import { paymentApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function EnquiryDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [messages, setMessages] = useState<EnquiryMessage[]>([]);
  const [newMsg, setNewMsg]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [paying, setPaying]     = useState(false);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEnquiry();
    
    // Socket join
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
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      const res = await paymentApi.initiate(params.id);
      const { checkoutUrl, paymentId } = res.data.data;
      if (confirm(`Redirecting to payment gateway... (Amount: ₹${enquiry?.quoteAmount?.toLocaleString()})\n\nSimulate successful payment?`)) {
        await paymentApi.verify(paymentId, true);
        toast.success("Payment successful! Your booking is confirmed.");
        fetchEnquiry();
      }
    } catch (e) {
      console.error(e);
      toast.error("Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    try {
      const res = await enquiryApi.sendMessage(params.id, newMsg);
      setMessages(prev => [...prev, res.data.data]);
      setNewMsg("");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to send message");
    }
  };

  if (loading) return <div className="container py-20 text-center">Loading...</div>;
  if (!enquiry) return <div className="container py-20 text-center">Enquiry not found</div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 flex flex-col h-[calc(100-80px)]">
      <div className="mb-6">
        <Link href="/account" className="text-sm font-bold text-aahar-teal flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Account
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Left: Chat */}
        <div className="lg:col-span-2 flex flex-col h-[600px] max-h-[80vh]">
          <Card className="flex-1 flex flex-col border-aahar-border overflow-hidden rounded-2xl">
            <div className="p-4 border-b border-aahar-border bg-aahar-wash/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-aahar-teal flex items-center justify-center text-white font-bold">
                  {enquiry.hotel?.name?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-aahar-dark">{enquiry.hotel?.name}</h3>
                  <p className="text-[10px] uppercase font-bold text-aahar-teal tracking-widest">Hotel Manager</p>
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    m.senderId === user?.id 
                      ? "bg-aahar-teal text-white rounded-tr-none" 
                      : "bg-aahar-wash text-aahar-dark rounded-tl-none border border-aahar-border"
                  }`}>
                    <p>{m.content}</p>
                    <p className={`text-[9px] mt-1 opacity-60 ${m.senderId === user?.id ? "text-right" : "text-left"}`}>
                      {format(new Date(m.sentAt), "HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-aahar-border flex gap-2">
              <Input 
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Type a message..."
                className="rounded-xl border-aahar-border focus-visible:ring-aahar-teal"
              />
              <Button type="submit" size="icon" className="bg-aahar-teal shrink-0 rounded-xl">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <Card className="p-6 border-aahar-border rounded-2xl">
            <h4 className="font-bold text-aahar-dark mb-4">Booking Details</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-aahar-teal shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-aahar-body tracking-widest">Dates</p>
                  <p className="text-sm font-bold text-aahar-dark">
                    {format(new Date(enquiry.checkIn), "dd MMM")} - {format(new Date(enquiry.checkOut), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-aahar-teal shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-aahar-body tracking-widest">Guests</p>
                  <p className="text-sm font-bold text-aahar-dark">{enquiry.adults} Adults, {enquiry.children} Children</p>
                </div>
              </div>
              <div className="pt-4 border-t border-aahar-border">
                <p className="text-[10px] uppercase font-bold text-aahar-body tracking-widest mb-1">Current Status</p>
                <Badge className="bg-teal-50 text-teal-600 border-teal-200 uppercase text-[10px]">
                  {enquiry.status}
                </Badge>
              </div>
            </div>
          </Card>

          {enquiry.status === "quoted" && (
            <Card className="p-6 bg-teal-50 border-teal-100 rounded-2xl border-2">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
                <h4 className="font-bold text-teal-900">Quotation Received</h4>
              </div>
              <p className="text-sm text-teal-800 mb-6">The hotel has provided a quote. You can now proceed to payment to confirm your stay.</p>
              <Button 
                onClick={handlePayment}
                disabled={paying}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-teal-600/20"
              >
                {paying ? "Processing..." : `Confirm & Pay ₹${enquiry.quoteAmount?.toLocaleString()}`}
              </Button>
            </Card>
          )}

          {enquiry.status === "confirmed" && (
            <Card className="p-6 bg-green-50 border-green-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h4 className="font-bold text-green-900">Booking Confirmed</h4>
              </div>
              <p className="text-xs text-green-800">Your stay at {enquiry.hotel?.name} is secured. Check your email for the confirmation voucher.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
