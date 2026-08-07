"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Loader2, Paperclip, X, ChevronDown, ChevronLeft, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";
import { applicationApi, auditorApi, uploadApi } from "@/lib/api";
import { MAX_PHOTO_SIZE_MB, validateFileSize } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function FloatingAuditorChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  // Audits (properties)
  const [audits, setAudits] = useState<any[]>([]);
  const [auditsLoading, setAuditsLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unread logic
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const res = await auditorApi.list();
      setAudits(res.data?.data || []);
    } catch (e) {
      console.error("Failed to load audits", e);
    } finally {
      setAuditsLoading(false);
    }
  };

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
      // Mark as read locally
      setUnreadCounts(prev => ({ ...prev, [activeChatId]: 0 }));
    }
  }, [activeChatId]);

  useEffect(() => {
    if (scrollRef.current && isOpen && activeChatId) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, activeChatId]);

  // Setup global socket for auditor to receive messages from ANY of their assigned applications
  useEffect(() => {
    if (!user) return;
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
    const socket = io(socketUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join", `user_${user.id}`);

    socket.on("new_application_message", (data: any) => {
      const appId = data.applicationId;
      
      // If it's the active chat, append it
      if (activeChatId === appId) {
        setMessages(prev => {
          if (prev.find(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      } else {
        // Otherwise, increment unread for that application
        setUnreadCounts(prev => ({
          ...prev,
          [appId]: (prev[appId] || 0) + 1
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, activeChatId]);

  const fetchMessages = async (appId: string) => {
    setChatLoading(true);
    try {
      const res = await applicationApi.getMessages(appId);
      setMessages(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !activeChatId || uploadingAttachment) return;

    let uploadedUrl = null;
    if (attachment) {
      setUploadingAttachment(true);
      try {
        const res = await uploadApi.singlePhoto(attachment);
        uploadedUrl = res.data?.data?.url;
      } catch (e) {
        console.error("Upload failed", e);
        toast.error("Failed to upload attachment");
        setUploadingAttachment(false);
        return;
      }
      setUploadingAttachment(false);
    }

    setNewMessage("");
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const res = await applicationApi.sendMessage(activeChatId, newMessage.trim(), uploadedUrl || undefined);
      setMessages(prev => [...prev, res.data?.data]);
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "Failed to send message");
    }
  };

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const activeAudit = audits.find(a => a.applicationId === activeChatId);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleOpen}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-admin-primary text-white shadow-xl flex items-center justify-center hover:bg-admin-primary/90 transition-all hover:scale-105 active:scale-95",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <MessageSquare className="h-6 w-6" />
        {totalUnread > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm animate-in zoom-in">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {/* Floating Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-full sm:w-[380px] h-[550px] max-h-[calc(100vh-48px)] max-w-[calc(100vw-48px)] transition-all duration-300 transform origin-bottom-right shadow-2xl",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-8 pointer-events-none"
        )}
      >
        <Card className="w-full h-full flex flex-col overflow-hidden border-slate-200/60 rounded-2xl relative">
          
          {/* Header */}
          <div 
            className="p-3 bg-admin-primary text-white shrink-0 flex items-center justify-between cursor-pointer"
            onClick={() => {
              if (activeChatId) {
                setActiveChatId(null); // Go back to list
              } else {
                setIsOpen(false); // Close completely
              }
            }}
          >
            <div className="flex items-center gap-2">
              {activeChatId ? (
                <button 
                  type="button"
                  className="p-1 hover:bg-white/20 rounded-full transition-colors mr-1"
                  onClick={(e) => { e.stopPropagation(); setActiveChatId(null); }}
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner mr-1">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              )}
              
              <div className="overflow-hidden">
                <h2 className="text-base font-bold text-white tracking-tight truncate max-w-[200px]">
                  {activeChatId ? (activeAudit?.application?.restaurant?.name || activeAudit?.application?.hotel?.name || "Chat") : "Messages"}
                </h2>
                <p className="text-[11px] font-medium text-white/80 truncate">
                  {activeChatId ? "Application Support" : "Select an establishment to message"}
                </p>
              </div>
            </div>
            <button 
              type="button" 
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Body: List or Chat */}
          {!activeChatId ? (
            <div className="flex-1 overflow-y-auto bg-slate-50 p-2 space-y-2 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {auditsLoading ? (
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
                 </div>
              ) : audits.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 p-6 text-center">
                   <MessageSquare className="h-10 w-10 opacity-20" />
                   <p className="text-sm font-medium">No active audits</p>
                   <p className="text-[11px]">You have no assigned applications to message.</p>
                 </div>
              ) : (
                audits.map(audit => {
                  const entity = audit.application?.restaurant || audit.application?.hotel;
                  const unread = unreadCounts[audit.applicationId] || 0;
                  
                  return (
                    <div 
                      key={audit.id}
                      onClick={() => setActiveChatId(audit.applicationId)}
                      className="p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden group"
                    >
                      <div className="w-10 h-10 rounded-full bg-admin-light flex items-center justify-center shrink-0 text-admin-primary">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{entity?.name || "Unknown Property"}</h4>
                          {unread > 0 && (
                            <span className="bg-admin-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-sm">
                              {unread}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[9px] font-medium bg-slate-100 text-slate-500 hover:bg-slate-100">
                            {audit.track === "fnb" ? "F&B" : "Accommodation"}
                          </Badge>
                          <span className="text-[10px] text-slate-400 truncate flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {entity?.city || "Location"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2] relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {chatLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#efeae2]/50 backdrop-blur-sm z-10">
                    <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <MessageSquare className="h-10 w-10 opacity-20" />
                    <p className="text-[12px] text-center max-w-[200px] font-medium">Send a message to this establishment to begin.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={cn("flex w-full my-0.5", isMe ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[85%] rounded-2xl shadow-sm relative group flex flex-col",
                          isMe 
                            ? "bg-admin-primary text-white rounded-tr-none" 
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                        )}>
                          {msg.attachmentUrl && (
                            <div className="p-1">
                              <img src={msg.attachmentUrl} alt="Attachment" className="rounded-xl max-h-[200px] object-cover bg-black/5 w-full" />
                            </div>
                          )}
                          {msg.content && (
                            <div className="px-3 py-2 pb-1.5 min-w-[100px]">
                              {!isMe && (
                                <div className="text-[11px] font-bold text-admin-primary mb-0.5">
                                  {msg.sender?.name}
                                </div>
                              )}
                              <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
                                <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">{msg.content}</p>
                                <div className={cn(
                                  "text-[9px] font-medium ml-auto mt-auto leading-none pt-1",
                                  isMe ? "text-white/80" : "text-slate-400"
                                )}>
                                  {format(new Date(msg.sentAt), "h:mm a")}
                                </div>
                              </div>
                            </div>
                          )}
                          {!msg.content && msg.attachmentUrl && (
                             <div className={cn(
                                "text-[10px] font-medium pb-1.5 px-3 flex justify-end gap-2",
                                isMe ? "text-white/80" : "text-slate-400"
                              )}>
                                {!isMe && <span className="font-bold mr-auto text-admin-primary">{msg.sender?.name}</span>}
                                <span>{format(new Date(msg.sentAt), "h:mm a")}</span>
                              </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-[#f0f2f5] shrink-0 border-t border-slate-200/60">
                {attachment && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="px-3 py-1 bg-white text-xs font-semibold text-slate-600 rounded-md flex items-center gap-2 shadow-sm border border-slate-200/50">
                      <Paperclip className="h-3 w-3 shrink-0" />
                      <span className="max-w-[120px] truncate">{attachment.name}</span>
                      <button type="button" onClick={() => setAttachment(null)} className="hover:text-red-500 shrink-0">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const err = validateFileSize(file, MAX_PHOTO_SIZE_MB);
                      if (err) {
                        toast.error(err);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        return;
                      }
                      setAttachment(file);
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 flex items-center justify-center shrink-0 text-slate-500 hover:text-admin-primary hover:bg-slate-200/50 rounded-full transition-colors"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <div className="flex-1 bg-white rounded-full flex items-center px-4 min-h-[44px] shadow-sm border border-slate-200/50 focus-within:border-admin-primary/30 transition-colors">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none px-0 text-[14.5px] min-w-0"
                      autoComplete="off"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={(!newMessage.trim() && !attachment) || uploadingAttachment}
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-admin-primary hover:bg-admin-primary/90 text-white shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    {uploadingAttachment ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-1" />}
                  </button>
                </form>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
