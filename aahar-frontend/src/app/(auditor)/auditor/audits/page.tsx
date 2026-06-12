"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auditorApi } from "@/lib/api";
import { 
  ClipboardCheck, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function AuditorAuditsPage() {
  const router = useRouter();
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Assigned Audits</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Manage and complete your scheduled trust inspections</p>
      </div>

      {audits.length === 0 ? (
        <Card className="p-16 flex flex-col items-center gap-4 text-center border-dashed border border-slate-300 bg-white/50 rounded-lg shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <ClipboardCheck className="h-8 w-8 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">No Audits Assigned</h3>
            <p className="text-sm text-slate-500 max-w-xs">You don't have any active audit assignments at the moment. Check back later.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {audits.map((audit) => {
            const entity = audit.application?.restaurant || audit.application?.hotel;
            const isCompleted = audit.status === "submitted";

            return (
              <Card 
                key={audit.id}
                onClick={() => router.push(`/auditor/audits/${audit.id}`)}
                className="group p-6 rounded-lg border-0 shadow-md bg-white hover:shadow-lg transition-shadow duration-200 cursor-pointer relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Status Indicator */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner",
                    isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-admin-primary transition-colors">
                        {entity?.name || "Unknown Property"}
                      </h2>
                      <Badge variant="secondary" className="text-[11px] font-medium text-slate-600 bg-slate-100">
                        {audit.track === "fnb" ? "F&B Sector" : "Accommodation"}
                      </Badge>
                      {isCompleted && (
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100 text-[11px] font-semibold">
                          Score: {audit.totalScore}/5
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {entity?.city || "Location Pending"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        Scheduled: {new Date(audit.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Current Status</p>
                      <p className={cn(
                        "text-sm font-semibold capitalize",
                        isCompleted ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {audit.status.replace("_", " ")}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-admin-light group-hover:text-admin-text transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Decorative Progress Line */}
                <div className={cn(
                  "absolute bottom-0 left-0 h-1 bg-admin-primary transition-all duration-500",
                  isCompleted ? "w-full" : "w-0 group-hover:w-full opacity-30"
                )} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
