"use client";
import { useState, useEffect, useRef } from"react";
import { 
 Send, 
 Clock, 
 BedDouble, 
 ChevronRight, 
 MoreVertical, 
 Paperclip, 
 Share2,
 Calendar as CalendarIcon
} from"lucide-react";
import { format } from"date-fns";
import { cn } from"@/lib/utils";
import { Button } from"@/components/ui/button";
import { Badge } from"@/components/ui/badge";
import { Input } from"@/components/ui/input";
import { enquiryApi } from"@/lib/api";
import { getSocket } from"@/lib/socket";
import { useAuth } from"@/lib/hooks/useAuth";
import type { Enquiry, EnquiryMessage } from"@/types";

export default function EnquiryInboxPage() {
 const { user } = useAuth();
 const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
 const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
 const [replyText, setReplyText] = useState("");
 const [loading, setLoading] = useState(true);

 const selectedEnquiry = enquiries.find(e => e.id === selectedEnquiryId);

 useEffect(() => {
 fetchEnquiries();

 const socket = getSocket();
 socket.on("new_enquiry", (newEnquiry: Enquiry) => {
 setEnquiries(prev => [newEnquiry, ...prev]);
 });

 socket.on("new_message", (msg: EnquiryMessage) => {
 setEnquiries(prev => prev.map(e => 
 e.id === msg.enquiryId 
 ? { ...e, messages: [...(e.messages || []), msg] } 
 : e
 ));
 });

 socket.on("enquiry_updated", (updated: Enquiry) => {
 setEnquiries(prev => prev.map(e => e.id === updated.id ? updated : e));
 });

 return () => {
 socket.off("new_enquiry");
 socket.off("new_message");
 socket.off("enquiry_updated");
 };
 }, []);

 useEffect(() => {
 if (selectedEnquiryId) {
 const socket = getSocket();
 socket.emit("join_enquiry", selectedEnquiryId);
 }
 }, [selectedEnquiryId]);

 const fetchEnquiries = async () => {
 try {
 const res = await enquiryApi.list();
 setEnquiries(res.data.data);
 if (res.data.data.length > 0) setSelectedEnquiryId(res.data.data[0].id);
 } catch (e) {
 console.error(e);
 } finally {
 setLoading(false);
 }
 };

 const handleSendMessage = async () => {
 if (!replyText.trim() || !selectedEnquiryId) return;
 try {
 await enquiryApi.sendMessage(selectedEnquiryId, replyText);
 setReplyText("");
 } catch (e) {
 console.error(e);
 }
 };

 const handleUpdateStatus = async (status: string, extra = {}) => {
 if (!selectedEnquiryId) return;
 let finalExtra = { ...extra };
 
 if (status ==="quoted") {
 const amount = prompt("Enter the quote amount (INR):");
 if (!amount || isNaN(Number(amount))) {
 alert("Please enter a valid amount");
 return;
 }
 finalExtra = { ...finalExtra, quoteAmount: Number(amount) };
 }

 try {
 await enquiryApi.updateStatus(selectedEnquiryId, status, finalExtra);
 } catch (e) {
 console.error(e);
 }
 };

 const getStatusBadge = (status: Enquiry["status"]) => {
 const styles = {
 sent:"bg-admin-primary/10 text-admin-primary border-admin-primary/20",
 viewed:"bg-blue-50 text-blue-600 border-blue-100",
 quoted:"bg-amber-50 text-amber-600 border-amber-100",
 confirmed:"bg-emerald-50 text-emerald-600 border-emerald-100",
 declined:"bg-slate-50 text-slate-400 border-slate-100",
 expired:"bg-slate-100 text-slate-400 border-slate-200"
 };
 return (
 <Badge variant="outline"className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border", styles[status])}>
 {status}
 </Badge>
 );
 };

 if (loading) return <div className="p-8">Loading inbox...</div>;

 return (
 <div className="flex flex-col h-full bg-[#F8FBFB]">
 <div className="flex flex-1 overflow-hidden">
 {/* Left Pane: Enquiry List */}
 <div className="w-[340px] border-r border-slate-200 bg-white flex flex-col shrink-0">
 <div className="p-5 border-b border-slate-200 flex items-center justify-between">
 <h2 className="text-xl font-bold text-slate-800 tracking-tighter">Inbox</h2>
 <Badge className="bg-admin-primary text-white rounded-full px-2">{enquiries.length}</Badge>
 </div>
 <div className="flex-1 overflow-y-auto">
 {enquiries.map((enquiry) => (
 <div 
 key={enquiry.id}
 onClick={() => setSelectedEnquiryId(enquiry.id)}
 className={cn(
"p-5 border-b border-aahar-wash cursor-pointer transition-all hover:bg-slate-50/30 relative",
 selectedEnquiryId === enquiry.id ?"bg-slate-50/50 border-r-4 border-r-aahar-rose":""
 )}
 >
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-bold text-slate-800 truncate w-2/3">{enquiry.guest?.name}</h3>
 <span className="text-[10px] font-bold text-slate-500/40">
 {format(new Date(enquiry.createdAt),"MMM d")}
 </span>
 </div>
 <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
 <CalendarIcon className="h-3 w-3"/>
 {format(new Date(enquiry.checkIn),"MMM d")} - {format(new Date(enquiry.checkOut),"MMM d")}
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 text-xs font-semibold text-admin-primary">
 <BedDouble className="h-3.5 w-3.5"/>
 {enquiry.roomType?.name}
 </div>
 {getStatusBadge(enquiry.status)}
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Right Pane: Enquiry Thread */}
 <div className="flex-1 flex flex-col bg-white min-w-0">
 {selectedEnquiry ? (
 <>
 <div className="p-5 border-b border-slate-200 shrink-0 flex items-center justify-between bg-white z-20 shadow-sm">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-md bg-gradient-to-br from-aahar-rose to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-admin-primary/10">
 {selectedEnquiry.guest?.name?.charAt(0)}
 </div>
 <div className="flex flex-col">
 <h2 className="text-base font-bold text-slate-800 tracking-tight leading-none">{selectedEnquiry.guest?.name}</h2>
 <div className="flex items-center gap-3 mt-1.5">
 <p className="text-[10px] font-bold text-slate-500/60 uppercase tracking-wider leading-none">Requesting {selectedEnquiry.roomType?.name}</p>
 </div>
 </div>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#F8FAFA] min-h-0">
 {selectedEnquiry.messages?.map((msg) => (
 <div 
 key={msg.id}
 className={cn(
"flex flex-col max-w-[70%]",
 msg.senderId === user?.id ?"ml-auto items-end":"items-start"
 )}
 >
 <div className={cn(
"px-6 py-4 rounded-lg text-[14px] font-medium leading-relaxed shadow-sm",
 msg.senderId === user?.id 
 ?"bg-slate-900 text-white rounded-tr-none shadow-lg shadow-black/5"
 :"bg-white border border-slate-200/60 rounded-tl-none"
 )}>
 {msg.content}
 </div>
 <span className="text-[9px] font-bold text-slate-500/30 mt-2 uppercase tracking-wider px-2">
 {format(new Date(msg.sentAt),"h:mm aa")}
 </span>
 </div>
 ))}
 </div>

 <div className="p-6 bg-white border-t border-slate-200 shrink-0">
 <div className="max-w-4xl mx-auto space-y-4">
 <div className="flex items-center justify-between gap-3 p-2 bg-slate-50/50 rounded-md border border-slate-200/30">
 <div className="flex items-center gap-2">
 <Button 
 onClick={() => handleUpdateStatus("confirmed")}
 disabled={selectedEnquiry.status ==="confirmed"}
 className="h-10 bg-admin-primary text-white hover:bg-admin-primary/90 rounded-md px-4 text-xs font-semibold uppercase tracking-wider shadow-md shadow-admin-primary/10"
 >
 Confirm Booking
 </Button>
 <Button 
 variant="outline"
 onClick={() => handleUpdateStatus("quoted")}
 disabled={selectedEnquiry.status ==="quoted"}
 className="h-10 border-slate-200 bg-white text-slate-800 hover:bg-slate-50 rounded-md px-4 text-xs font-semibold uppercase tracking-wider"
 >
 Send Quote
 </Button>
 </div>
 <div className="flex items-center gap-2">
 <Button 
 variant="ghost"
 onClick={() => handleUpdateStatus("declined")}
 className="h-10 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-md px-4 text-xs font-semibold uppercase tracking-wider"
 >
 Decline Request
 </Button>
 </div>
 </div>

 <div className="relative group">
 <Input 
 value={replyText}
 onChange={(e) => setReplyText(e.target.value)}
 onKeyDown={(e) => e.key ==="Enter"&& handleSendMessage()}
 placeholder="Draft your response..."
 className="w-full h-16 pl-6 pr-16 rounded-md border-slate-200 bg-white font-medium focus:ring-aahar-rose focus:border-admin-primary shadow-sm transition-all"
 />
 <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
 <Button 
 onClick={handleSendMessage}
 className="h-10 w-10 bg-admin-primary text-white rounded-md shadow-lg shadow-admin-primary/20 active:scale-90 p-0"
 >
 <Send className="h-4 w-4"/>
 </Button>
 </div>
 </div>
 </div>
 </div>
 </>
 ) : (
 <div className="flex-1 flex items-center justify-center text-slate-500">
 Select an enquiry to view details
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
