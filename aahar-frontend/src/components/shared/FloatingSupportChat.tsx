"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Loader2, AlertCircle, Paperclip, X, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";
import { applicationApi, ownerApi, uploadApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function FloatingSupportChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unread badge logic
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Only owner and hotel-manager use this currently, but we don't strict check role here
    // since we check applicationId via ownerApi.stats() which they both have access to.
    const fetchAppId = async () => {
      try {
        const statsRes = await ownerApi.stats();
        setApplicationId(statsRes.data?.data?.applicationId || null);
      } catch (e) {
        console.error("Failed to load application data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAppId();
  }, []);

  useEffect(() => {
    if (applicationId) {
      fetchMessages();
      setupSocket();
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [applicationId]);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const fetchMessages = async () => {
    if (!applicationId) return;
    setChatLoading(true);
    try {
      const res = await applicationApi.getMessages(applicationId);
      setMessages(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  const setupSocket = () => {
    if (!user) return;
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
    const socket = io(socketUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join", `user_${user.id}`);

    socket.on("new_application_message", (data: any) => {
      if (data.applicationId === applicationId) {
        setMessages(prev => {
          if (prev.find(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        
        // Increase unread count if not open
        setIsOpen((open) => {
          if (!open) {
            setUnreadCount(prev => prev + 1);
          }
          return open;
        });
      }
    });
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !applicationId || uploadingAttachment) return;

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
      const res = await applicationApi.sendMessage(applicationId, newMessage.trim(), uploadedUrl || undefined);
      setMessages(prev => [...prev, res.data?.data]);
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "Failed to send message");
    }
  };

  // Only render if we have an applicationId or we are loading it
  if (!applicationId && !loading) return null;
  if (loading) return null;

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
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
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
        <Card className="w-full h-full flex flex-col overflow-hidden border-slate-200/60 rounded-2xl">
          {/* Header */}
          <div 
            className="p-3 bg-admin-primary text-white shrink-0 flex items-center justify-between cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Support Chat</h2>
                <p className="text-[11px] font-medium text-white/80">Auditor communication</p>
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

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2] relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {chatLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm z-10">
                <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <MessageSquare className="h-10 w-10 opacity-20" />
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-[11px] text-center max-w-[200px]">Send a message to start communicating with your auditor.</p>
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
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
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
        </Card>
      </div>
    </>
  );
}
