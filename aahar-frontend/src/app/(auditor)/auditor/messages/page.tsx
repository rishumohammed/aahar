"use client";

import { useEffect, useState } from "react";
import { auditorApi } from "@/lib/api";
import { 
  MessageSquare, 
  MapPin, 
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ComplianceChatDialog } from "@/components/shared/ComplianceChatDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export default function AuditorMessagesPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    auditorApi.list()
      .then(res => {
        setAudits(res.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Messages</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Communicate with properties assigned to you</p>
      </div>

      {audits.length === 0 ? (
        <Card className="p-16 flex flex-col items-center gap-4 text-center border-dashed border border-slate-300 bg-white/50 rounded-lg shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">No Messages Available</h3>
            <p className="text-sm text-slate-500 max-w-xs">You don't have any active audit assignments to message.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {["all", ...Array.from(new Set(audits.map(a => a.status)))].map(status => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === status 
                    ? "bg-admin-primary text-white" 
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                )}
              >
                {status === "all" ? "All Messages" : status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {audits.filter(a => activeTab === "all" || a.status === activeTab).map((audit) => {
              const entity = audit.application?.restaurant || audit.application?.hotel;

            return (
              <Card 
                key={audit.id}
                className="group p-4 rounded-lg border border-slate-100 shadow-sm bg-white hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-admin-light flex items-center justify-center shrink-0 shadow-inner text-admin-primary">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight leading-tight flex items-center gap-2">
                      {entity?.name || "Unknown Property"}
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider text-slate-400 border-slate-200">
                        {audit.status.replace('_', ' ')}
                      </Badge>
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-[10px] font-medium text-slate-600 bg-slate-100">
                        {audit.track === "fnb" ? "F&B Sector" : "Accommodation"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {entity?.city || "Location Pending"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                  <ComplianceChatDialog 
                    applicationId={audit.applicationId}
                    trigger={
                      <Button variant="outline" className="w-full sm:w-auto bg-white text-admin-text border-slate-200 shadow-sm hover:bg-slate-50 gap-2">
                        Open Chat
                      </Button>
                    }
                  />
                </div>
              </Card>
            );
          })}
          
          {audits.filter(a => activeTab === "all" || a.status === activeTab).length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No messages found for this status.
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
