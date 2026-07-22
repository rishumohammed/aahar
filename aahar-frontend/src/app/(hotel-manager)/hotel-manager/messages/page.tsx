"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Loader2, AlertCircle, Paperclip, X } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";
import { applicationApi, ownerApi, uploadApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default function HotelManagerMessagesPage() {
  const { user } = useAuth();
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

  useEffect(() => {
    const fetchAppId = async () => {
      try {
        const statsRes = await ownerApi.stats();
        setApplicationId(statsRes.data?.data?.applicationId || null);
      } catch (e) {
        console.error("Failed to load application data", e);
        toast.error("Failed to initialize chat");
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!applicationId) return;
    setChatLoading(true);
    try {
      const res = await applicationApi.getMessages(applicationId);
      setMessages(res.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load messages");
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
      }
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !applicationId || uploadingAttachment) return;

    let uploadedUrl = null;
    if (attachment) {
      setUploadingAttachment(true);
      try {
        const res = await uploadApi.singlePhoto(attachment);
        uploadedUrl = res.data.data?.url || res.data.url;
      } catch (e) {
        toast.error("Failed to upload attachment");
        setUploadingAttachment(false);
        return;
      }
      setUploadingAttachment(false);
    }

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      content: newMessage,
      attachmentUrl: uploadedUrl,
      senderId: user?.id,
      sender: { id: user?.id, name: user?.name, role: user?.role },
      sentAt: new Date().toISOString(),
      isSystem: false
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");
    setAttachment(null);

    try {
      const res = await applicationApi.sendMessage(applicationId, optimisticMessage.content, uploadedUrl);
      setMessages(prev => prev.map(m => m.id === tempId ? res.data.data : m));
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
      </div>
    );
  }

  if (!applicationId) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Messages</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Communicate with your assigned auditor</p>
        </div>
        <Card className="p-8 flex flex-col items-center gap-4 text-center border-dashed border border-slate-300 bg-white/50 rounded-lg shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">No Active Application</h3>
            <p className="text-sm text-slate-500 max-w-xs">You don't have an active application to message an auditor about.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-150px)]">
      <Card className="flex-1 flex flex-col overflow-hidden shadow-xl border-slate-200">
        <div className="p-3 bg-admin-primary text-white shadow-sm shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Application Support</h2>
            <p className="text-[11px] font-medium text-white/80">Real-time chat</p>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {chatLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm z-10">
              <div className="w-8 h-8 rounded-full border-4 border-admin-primary/30 border-t-admin-primary animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
              <MessageSquare className="h-16 w-16 text-slate-400" />
              <p className="text-sm font-semibold text-slate-500">No messages yet. Send a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-200/50 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[70%] rounded-2xl shadow-sm relative group overflow-hidden",
                    isMe 
                      ? "bg-admin-primary text-white rounded-br-none" 
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                  )}>
                    {msg.attachmentUrl && (
                      <div className="p-1">
                        <img src={msg.attachmentUrl} alt="Attachment" className="rounded-xl max-h-[300px] object-contain bg-white/10" />
                      </div>
                    )}
                    {msg.content && (
                      <div className="px-4 py-3">
                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className={cn(
                          "text-[9px] font-bold mt-1 uppercase tracking-wider opacity-70",
                          isMe ? "text-admin-light/80 text-right" : "text-slate-400 text-left"
                        )}>
                          {!isMe && <span className="mr-2">{msg.sender?.name}</span>}
                          {format(new Date(msg.sentAt), "h:mm a")}
                        </div>
                      </div>
                    )}
                    {!msg.content && msg.attachmentUrl && (
                       <div className={cn(
                          "text-[9px] font-bold pb-2 px-3 uppercase tracking-wider opacity-70",
                          isMe ? "text-admin-light/80 text-right" : "text-slate-400 text-left"
                        )}>
                          {!isMe && <span className="mr-2">{msg.sender?.name}</span>}
                          {format(new Date(msg.sentAt), "h:mm a")}
                        </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          {attachment && (
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="px-3 py-1 bg-slate-100 text-xs font-semibold text-slate-600 rounded-md flex items-center gap-2 border border-slate-200">
                <Paperclip className="h-3 w-3" />
                <span className="max-w-[150px] truncate">{attachment.name}</span>
                <button type="button" onClick={() => setAttachment(null)} className="hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
          <form onSubmit={handleSend} className="flex items-end gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:border-admin-primary/50 focus-within:ring-4 focus-within:ring-admin-primary/10 transition-all">
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
              className="w-10 h-10 flex items-center justify-center shrink-0 text-slate-400 hover:text-admin-primary transition-colors"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none px-2 min-h-[40px] text-[14px]"
              autoComplete="off"
            />
            <Button 
              type="submit" 
              disabled={(!newMessage.trim() && !attachment) || uploadingAttachment}
              className="rounded-xl w-10 h-10 p-0 shrink-0 bg-admin-primary hover:bg-admin-primary/90 text-white shadow-md disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {uploadingAttachment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
