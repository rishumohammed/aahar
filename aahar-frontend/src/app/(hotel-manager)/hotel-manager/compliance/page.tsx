"use client";

import { toast } from"sonner";
import { useState, useEffect, useMemo } from"react";
import { 
 CheckCircle2, 
 AlertCircle, 
 Clock, 
 ArrowUpRight, 
 Calendar,
 AlertTriangle,
 ChevronRight,
 RefreshCcw,
 Info
} from"lucide-react";
import { format, differenceInDays, parseISO, addDays, isPast } from"date-fns";
import { ownerApi } from"@/lib/api";
import { Button } from"@/components/ui/button";
import { Card } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { cn } from"@/lib/utils";

// ── Constants ───────────────────────────────────────────────
const RING_RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function HotelComplianceDashboard() {
 const [correctiveActions, setCorrectiveActions] = useState<any[]>([]);
 const [timeline, setTimeline] = useState<any[]>([]);
 const [ringOffset, setRingOffset] = useState(CIRCUMFERENCE);
 const [barVisible, setBarVisible] = useState(false);
 const [scores, setScores] = useState({
 overall: 0,
 housekeeping: 0,
 roomSafety: 0,
 guestFacilities: 0,
 staffStandards: 0,
 accessibility: 0,
 guestExperience: 0
 });
 const [certification, setCertification] = useState({
 expiresAt: addDays(new Date(), 45).toISOString(),
 status:"active"
 });
 const [hotelName, setHotelName] = useState("Your Hotel");
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchData = async () => {
 try {
 const statsRes = await ownerApi.stats();
 setCorrectiveActions(statsRes.data?.data?.correctiveActions || []);
 setTimeline(statsRes.data?.data?.timeline || []);
 if (statsRes.data?.data?.hygieneScore) {
 setScores(statsRes.data.data.hygieneScore);
 }
 if (statsRes.data?.data?.certification) {
 setCertification(statsRes.data.data.certification);
 }
 setHotelName(statsRes.data?.data?.hotelName ||"Your Hotel");
 } catch (e) {
 console.error("Failed to load compliance data", e);
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, []);

 // ── Animations ────────────────────────────────────────────
 useEffect(() => {
 const timer = setTimeout(() => {
 const offset = CIRCUMFERENCE - (scores.overall / 5) * CIRCUMFERENCE;
 setRingOffset(offset);
 setBarVisible(true);
 }, 100);
 return () => clearTimeout(timer);
 }, [scores.overall]);

 // ── Computations ──────────────────────────────────────────
 const daysRemaining = Math.ceil((new Date(certification.expiresAt).getTime() - new Date().getTime()) / 86400000);
 
 const countdownColor = daysRemaining > 60 ?"text-emerald-500": daysRemaining > 30 ?"text-amber-500":"text-rose-500";
 const countdownBg = daysRemaining > 60 ?"bg-emerald-50": daysRemaining > 30 ?"bg-amber-50":"bg-rose-50";

 const sortedActions = useMemo(() => {
 return [...correctiveActions].sort((a, b) => Number(a.resolved) - Number(b.resolved));
 }, [correctiveActions]);

 const resolvedCount = correctiveActions.filter(a => a.resolved).length;

 const toggleResolved = (id: number) => {
 setCorrectiveActions(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
 toast.success("Corrective action marked resolved");
 };

 const getDueDateStatus = (date: string) => {
 const d = parseISO(date);
 if (isPast(d)) return"expired";
 if (differenceInDays(d, new Date()) <= 7) return"urgent";
 return"normal";
 };

 if (loading) {
 return (
 <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
 <div className="h-10 w-80 bg-slate-50 rounded-md"/>
 <div className="h-48 bg-slate-50 rounded-lg border border-slate-200"/>
 </div>
 );
 }

 return (
 <div className="p-8 max-w-7xl mx-auto pb-20">
 {/* Header */}
 <div className="mb-10">
 <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Hotel Compliance Dashboard</h1>
 <p className="text-slate-500 font-medium mt-1">Real-time trust metrics and audit readiness for {hotelName}.</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">
 {/* Left Column: Metrics & Timeline */}
 <div className="space-y-10">
 
 {/* Top Score Section */}
 <Card className="p-10 rounded-lg border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-12">
 
 {/* Score Ring */}
 <div className="relative flex flex-col items-center">
 <svg width="140"height="140"className="transform -rotate-90">
 <circle
 cx="70"cy="70"r={RING_RADIUS}
 stroke="#DDE8E8"strokeWidth="8"fill="transparent"
 />
 <circle
 cx="70"cy="70"r={RING_RADIUS}
 stroke="#B5766A"strokeWidth="8"fill="transparent"
 strokeDasharray={CIRCUMFERENCE}
 style={{ 
 strokeDashoffset: ringOffset,
 transition:"stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)"
 }}
 strokeLinecap="round"
 />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
 <span className="text-3xl font-bold text-slate-800 leading-none">{scores.overall.toFixed(1)}</span>
 <span className="text-xs font-semibold uppercase text-slate-500/40 tracking-wider mt-1">Out of 5.0</span>
 </div>
 <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500/60 text-center">Overall hygiene score</p>
 </div>

 {/* Breakdown Bars */}
 <div className="flex-1 w-full space-y-4">
 {[
 { label:"Housekeeping", score: scores.housekeeping },
 { label:"Room Safety", score: scores.roomSafety },
 { label:"Guest Facilities", score: scores.guestFacilities },
 { label:"Staff Standards", score: scores.staffStandards },
 { label:"Accessibility", score: scores.accessibility },
 { label:"Guest Experience", score: scores.guestExperience },
 ].map((item, i) => (
 <div key={item.label} className="flex items-center gap-4">
 <span className="text-xs font-semibold uppercase tracking-wider text-slate-500/60 w-36">{item.label}</span>
 <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-200/50">
 <div 
 className="h-full bg-admin-primary transition-all duration-600 ease-out"
 style={{ 
 width: barVisible ? `${(item.score / 5) * 100}%` :"0%",
 transitionDelay: `${i * 100}ms`
 }}
 />
 </div>
 <span className="text-xs font-bold text-slate-800 w-6">{item.score.toFixed(1)}</span>
 </div>
 ))}
 </div>
 </Card>

 {/* Corrective Actions */}
 <section className="space-y-6">
 <div className="flex items-center justify-between">
 <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Corrective Actions</h2>
 <Badge variant="outline"className="rounded-lg text-[10px] font-bold border-slate-200 text-slate-500/40">
 {correctiveActions.length - resolvedCount} PENDING
 </Badge>
 </div>
 
 <Card className="rounded-lg border-slate-200 overflow-hidden shadow-sm">
 {sortedActions.length === 0 ? (
 <div className="p-8 text-center text-slate-500/60 font-medium">
 No pending corrective actions. Everything is in order!
 </div>
 ) : (
 <div className="divide-y divide-aahar-wash">
 {sortedActions.map((action) => {
 const isExpired = getDueDateStatus(action.dueDate) ==="expired";
 const isUrgent = getDueDateStatus(action.dueDate) ==="urgent";
 
 return (
 <div key={action.id} className={cn(
"p-6 flex items-center justify-between gap-6 transition-colors",
 action.resolved ?"bg-slate-50/20":"bg-white"
 )}>
 <div className="flex items-center gap-4 flex-1 min-w-0">
 <div className={cn(
"w-2.5 h-2.5 rounded-full shrink-0",
 action.priority ==="high"?"bg-rose-500": action.priority ==="medium"?"bg-amber-500":"bg-emerald-500"
 )} />
 <div className="flex-1 min-w-0">
 <p className={cn(
"text-sm font-bold text-slate-800 truncate",
 action.resolved &&"line-through text-slate-500/40"
 )}>
 {action.text}
 </p>
 <div className="flex items-center gap-2 mt-1">
 <span className={cn(
"text-xs font-semibold uppercase tracking-wider flex items-center gap-1",
 isExpired ?"text-rose-500": isUrgent ?"text-amber-500":"text-slate-500/40"
 )}>
 <Clock className="h-3 w-3"/>
 Due {format(parseISO(action.dueDate),"MMM dd, yyyy")}
 </span>
 </div>
 </div>
 </div>

 {action.resolved ? (
 <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100">
 <CheckCircle2 className="h-3.5 w-3.5"/>
 Resolved
 </div>
 ) : (
 <Button 
 onClick={() => toggleResolved(action.id)}
 variant="ghost"
 size="sm"
 className="rounded-md text-xs font-semibold uppercase tracking-wider text-admin-primary hover:bg-admin-primary/10"
 >
 Mark Resolved
 </Button>
 )}
 </div>
 );
 })}
 </div>
 )}
 {resolvedCount > 0 && (
 <div className="p-4 bg-slate-50/30 text-center">
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-500/30">
 Showing {resolvedCount} resolved items
 </p>
 </div>
 )}
 </Card>
 </section>

 {/* Audit Timeline */}
 <section className="space-y-6">
 <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Audit Timeline</h2>
 <Card className="p-8 rounded-lg border-slate-200 shadow-sm">
 {timeline.length === 0 ? (
 <div className="p-8 text-center text-slate-500/60 font-medium">
 No timeline history available yet.
 </div>
 ) : (
 <div className="space-y-0 relative">
 <div className="absolute left-[85px] top-4 bottom-4 w-0.5 bg-slate-50"/>
 
 {timeline.map((step, i) => (
 <div key={i} className="flex items-start gap-10 pb-10 last:pb-0 relative">
 <div className="w-16 text-right pt-1">
 <p className="text-[10px] font-bold text-slate-500/40 uppercase tracking-tighter leading-none">
 {format(parseISO(step.date),"MMM dd")}
 </p>
 <p className="text-[10px] font-bold text-slate-500/20 uppercase tracking-tighter mt-1">
 {format(parseISO(step.date),"yyyy")}
 </p>
 </div>
 
 <div className="relative z-10 pt-1">
 {step.done ? (
 <div className="w-4 h-4 rounded-full bg-admin-primary flex items-center justify-center border-4 border-white shadow-sm"/>
 ) : (
 <div className="w-4 h-4 rounded-full bg-white border-2 border-admin-primary flex items-center justify-center shadow-sm"/>
 )}
 </div>

 <div className="flex-1 pt-0.5">
 <div className="flex items-center gap-3">
 <span className="text-lg">{step.icon}</span>
 <h4 className={cn(
"text-sm font-bold tracking-tight",
 step.done ?"text-admin-primary":"text-slate-500 italic"
 )}>
 {step.event}
 </h4>
 {step.done && <CheckCircle2 className="h-3.5 w-3.5 text-admin-primary/40"/>}
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </Card>
 </section>
 </div>

 {/* Right Column: Widgets */}
 <aside className="space-y-8">
 {/* Renewal Countdown */}
 <Card className={cn("p-8 rounded-lg border-slate-200 shadow-xl text-center space-y-6", countdownBg)}>
 <div className="space-y-2">
 <h3 className={cn("text-6xl font-bold tracking-tighter", countdownColor)}>
 {daysRemaining}
 </h3>
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-500/60">Days until renewal</p>
 </div>
 
 <div className="p-4 bg-white/60 rounded-md border border-white space-y-1">
 <p className="text-[10px] font-bold text-slate-500/40 uppercase tracking-wider">Certificate Expiry</p>
 <p className="text-sm font-bold text-slate-800">{format(parseISO(certification.expiresAt),"dd MMM yyyy")}</p>
 </div>

 {daysRemaining < 30 ? (
 <Button type="button" className="w-full bg-rose-500 text-white rounded-md py-7 font-bold uppercase tracking-wider shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all">
 Start Renewal Now
 </Button>
 ) : (
 <div className="p-4 flex items-center gap-3 text-left">
 <div className="p-2 bg-emerald-500/10 rounded-md">
 <CheckCircle2 className="h-5 w-5 text-emerald-500"/>
 </div>
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Status Safe</p>
 <p className="text-xs font-semibold text-slate-500/60 mt-0.5">Maintain standards for next audit.</p>
 </div>
 </div>
 )}
 </Card>

 {/* Compliance Tips */}
 <Card className="p-8 rounded-lg border-slate-200 shadow-sm space-y-6 bg-slate-50/10">
 <div className="flex items-center gap-3">
 <div className="p-2.5 rounded-md bg-white shadow-sm">
 <Info className="h-5 w-5 text-admin-primary"/>
 </div>
 <h3 className="text-lg font-bold text-slate-800 tracking-tighter uppercase">Score Tips</h3>
 </div>
 
 <div className="space-y-5">
 {[
"Conduct daily housekeeping checklist checks",
"Ensure emergency fire exits are unblocked",
"Display local guest assistance contact numbers clearly"
 ].map((tip, i) => (
 <div key={i} className="flex items-start gap-3 group">
 <div className="w-1.5 h-1.5 rounded-full bg-admin-primary mt-2 shrink-0 group-hover:scale-150 transition-transform"/>
 <p className="text-sm font-bold text-slate-500 leading-tight">{tip}</p>
 </div>
 ))}
 </div>

 <Button type="button" variant="outline"className="w-full rounded-md border-slate-200 font-bold text-xs gap-2 py-6 hover:text-admin-primary hover:border-admin-primary">
 View Guidebook
 <ArrowUpRight className="h-4 w-4"/>
 </Button>
 </Card>

 {/* Contact Auditor */}
 <div className="p-6 bg-slate-900 rounded-lg text-center space-y-4">
 <p className="text-white font-bold text-sm">Need help with compliance?</p>
 <Button type="button" className="w-full bg-admin-primary text-white rounded-md py-6 font-bold shadow-lg shadow-admin-primary/20 hover:bg-admin-primary/90 transition-all">
 Message Auditor
 </Button>
 </div>
 </aside>
 </div>
 </div>
 );
}
