"use client";

import { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare, Paperclip, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";
import { applicationApi, uploadApi } from "@/lib/api";
import { MAX_PHOTO_SIZE_MB, validateFileSize } from "@/lib/upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatDialogProps {
  applicationId: string | null;
  trigger?: React.ReactNode;
}

export function ComplianceChatDialog({ applicationId, trigger }: ChatDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && applicationId) {
      fetchMessages();
      setupSocket();
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [open, applicationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!applicationId) return;
    setLoading(true);
    try {
      const res = await applicationApi.getMessages(applicationId);
      setMessages(res.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
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

  if (!applicationId) {
    return (
      <Button 
        type="button" 
        onClick={() => toast.error("No active application found to message about.")}
        className="w-full bg-slate-200 text-slate-500 rounded-xl py-6 font-bold shadow-sm"
      >
        Message Auditor (Unavailable)
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger || (
          <Button type="button" className="w-full bg-admin-primary text-white rounded-xl py-6 font-bold shadow-lg shadow-admin-primary/20 hover:bg-admin-primary/90 transition-all">
            Message Auditor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl flex flex-col h-[600px] max-h-[85vh]">
        <DialogHeader className="p-3 bg-admin-primary text-white sticky top-0 z-10 shadow-sm shrink-0 flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div className="text-left mt-0">
            <DialogTitle className="text-base font-bold text-white tracking-tight leading-none mb-1">Auditor Chat</DialogTitle>
            <p className="text-[11px] font-medium text-white/80 leading-none">Application Support</p>
          </div>
        </DialogHeader>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2] relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm z-10">
              <div className="w-8 h-8 rounded-full border-4 border-admin-primary/30 border-t-admin-primary animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
              <MessageSquare className="h-12 w-12 text-slate-400" />
              <p className="text-sm font-semibold text-slate-500">Send a message to the auditor.</p>
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
                <div key={msg.id} className={cn("flex w-full my-0.5", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[75%] rounded-2xl shadow-sm relative group flex flex-col",
                    isMe 
                      ? "bg-admin-primary text-white rounded-tr-none" 
                      : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                  )}>
                    {msg.attachmentUrl && (
                      <div className="p-1">
                        <img src={msg.attachmentUrl} alt="Attachment" className="rounded-xl max-h-[250px] object-cover bg-white/10 w-full" />
                      </div>
                    )}
                    {msg.content && (
                      <div className="px-3 py-2 pb-1.5 min-w-[120px]">
                        {!isMe && (
                          <div className="text-[11px] font-bold text-admin-primary mb-0.5">
                            {msg.sender?.name}
                          </div>
                        )}
                        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                          <p className="text-[14.5px] leading-snug whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className={cn(
                            "text-[10px] font-medium ml-auto mt-auto leading-none",
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

        <div className="p-3 bg-[#f0f2f5] shrink-0 border-t border-slate-200/60">
          {attachment && (
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="px-3 py-1 bg-white text-xs font-semibold text-slate-600 rounded-md flex items-center gap-2 shadow-sm">
                <Paperclip className="h-3 w-3" />
                <span className="max-w-[150px] truncate">{attachment.name}</span>
                <button type="button" onClick={() => setAttachment(null)} className="hover:text-red-500">
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
                const sizeErr = validateFileSize(file, MAX_PHOTO_SIZE_MB);
                if (sizeErr) {
                  toast.error(sizeErr);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  return;
                }
                setAttachment(file);
              }}
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 flex items-center justify-center shrink-0 text-slate-500 hover:text-admin-primary transition-colors"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <div className="flex-1 bg-white rounded-full flex items-center px-4 min-h-[44px] shadow-sm">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none px-0 text-[15px]"
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
      </DialogContent>
    </Dialog>
  );
}
