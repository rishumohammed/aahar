"use client";
import Link from"next/link";
import { toast } from"sonner";
import { useEffect, useState } from"react";
import { motion } from"framer-motion";
import { 
 TrendingUp, 
 Calendar, 
 Upload, 
 ArrowUpRight,
 CheckCircle2,
 Bell,
 MessageSquare
} from"lucide-react";
import { format } from"date-fns";

import { Button } from"@/components/ui/button";
import { Card } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { cn } from"@/lib/utils";
import { applicationApi, notificationApi, ownerApi } from"@/lib/api";
import { useAuth } from"@/lib/hooks/useAuth";
import { HotelCard } from"@/components/shared/HotelCard";
import { RestaurantCard } from"@/components/shared/RestaurantCard";

export default function OwnerDashboardPage() {
 const { user } = useAuth();
 const [stats, setStats] = useState<any[]>([]);
 const [notifications, setNotifications] = useState<any[]>([]);
 const [application, setApplication] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchDashboardData();
 }, []);

 const fetchDashboardData = async () => {
 try {
 const [appsRes, notifsRes, statsRes] = await Promise.all([
 applicationApi.list(),
 notificationApi.list({ limit: 5 }),
 ownerApi.stats()
 ]);
 
 const app = appsRes.data.data.items?.[0]; 
 const realStats = statsRes.data.data;
 setApplication(app);
 setNotifications(notifsRes.data.data.notifications);

 setStats([
 { 
 label:"Status", 
 value: app?.status?.replace('_', ' ').toUpperCase() ||"NO APPLICATION", 
 sub: app ?"Current Stage":"Start certification now", 
 icon: TrendingUp, color:"text-admin-text", bg:"bg-admin-light"
 },
 { 
 label:"Application ID", 
 value: app?.id?.substring(0, 8) ||"N/A", 
 sub:"Reference Code", 
 icon: Calendar, color:"text-amber-600", bg:"bg-amber-50"
 },
 { 
 label:"Enquiries", 
 value: realStats.enquiries ||"0", 
 sub:"Customer requests", 
 icon: MessageSquare, color:"text-blue-500", bg:"bg-blue-50"
 },
 { 
 label:"Certification", 
 value: realStats.isCertified ?"ACTIVE":"PENDING", 
 sub: realStats.certNumber ||"Not issued", 
 icon: CheckCircle2, color:"text-emerald-500", bg:"bg-emerald-50"
 },
 ]);
 } catch (e) {
 console.error(e);
 } finally {
 setLoading(false);
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-primary border-t-transparent"/>
 </div>
 );
 }

 return (
 <div className="space-y-8">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div>
 <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
 <p className="text-slate-500 font-medium text-sm mt-1">Manage your certification and business profile.</p>
 </div>
 {!application && (
 <Button type="button" className="bg-admin-primary hover:bg-admin-primary-hover text-white rounded-md px-6 shadow-md transition-all">
 Apply for Certification
 </Button>
 )}
 </div>


 {/* Stats Row */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {stats.map((stat, i) => (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1 }}
 key={stat.label}
 >
 <Card className="p-6 rounded-lg border-0 shadow-md bg-white hover:shadow-lg transition-shadow duration-200 cursor-pointer">
 <div className="flex items-center justify-between mb-4">
 <div className={cn("p-3 rounded-full", stat.bg)}>
 <stat.icon className={cn("h-6 w-6", stat.color)} />
 </div>
 </div>
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
 <h3 className={cn("text-2xl font-bold text-slate-800 mt-1 truncate", stat.label ==="Status"&&"text-xl")}>{stat.value}</h3>
 <p className="text-sm text-slate-500 mt-1">{stat.sub}</p>
 </div>
 </Card>
 </motion.div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 <div className="lg:col-span-8 space-y-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {/* Corrective Actions */}
 <Card className="bg-white rounded-lg border-0 shadow-md p-6 flex flex-col">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Corrective Actions</h2>
 {application?.correctiveActions?.length > 0 && (
 <Badge className="bg-amber-100 text-amber-700 border-0">Required</Badge>
 )}
 </div>
 <div className="flex-1 space-y-4">
 {application?.correctiveActions?.length > 0 ? (
 application.correctiveActions.map((action: any) => (
 <div key={action.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
 <div className={cn(
"w-2 h-2 rounded-full mt-1.5 shrink-0",
 action.priority === 'high' ?"bg-rose-500":"bg-amber-500"
 )} />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-slate-800 leading-tight">{action.text}</p>
 <button type="button" className="mt-2 text-xs font-semibold text-admin-text flex items-center gap-1 hover:text-admin-hover transition-colors">
 <Upload className="h-3 w-3"/>
 Upload Evidence
 </button>
 </div>
 </div>
 ))
 ) : (
 <div className="text-center py-8">
 <CheckCircle2 className="h-10 w-10 text-slate-200 mx-auto mb-2"/>
 <p className="text-sm text-slate-500">No pending actions</p>
 </div>
 )}
 </div>
 </Card>

 {/* Compliance Timeline */}
 <Card className="bg-white rounded-lg border-0 shadow-md p-6">
 <h2 className="text-lg font-semibold text-slate-800 tracking-tight mb-6">Process Timeline</h2>
 <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
 {application?.timeline?.map((item: any, i: number) => (
 <div key={i} className="flex gap-4 relative">
 <div className={cn(
"w-6 h-6 rounded-full border-2 border-white flex items-center justify-center relative z-10",
 item.done ?"bg-admin-primary":"bg-slate-200"
 )}>
 {item.done && <CheckCircle2 className="h-3 w-3 text-white"/>}
 </div>
 <div className="flex-1">
 <p className="text-xs font-semibold text-slate-400">{item.date}</p>
 <p className="text-sm font-medium text-slate-800">{item.event}</p>
 </div>
 </div>
 )) || (
 <p className="text-sm text-slate-500">Timeline will appear once you submit an application.</p>
 )}
 </div>
 </Card>
 </div>
 </div>

 <aside className="lg:col-span-4">
 <Card className="bg-white rounded-lg border-0 shadow-md p-6 h-full">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Notifications</h2>
 <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
 <Bell className="h-4 w-4"/>
 </div>
 </div>
 <div className="space-y-6">
 {notifications.map((notif) => (
 <div key={notif.id} className="space-y-2 relative pb-6 border-b border-slate-100 last:border-0 last:pb-0">
 <div className="flex items-center justify-between mb-2">
 <span className={cn(
"text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
 notif.type.includes('urgent') ?"text-rose-700 bg-rose-50": 
 notif.type.includes('cert') ?"text-admin-text bg-admin-light":
"text-blue-700 bg-blue-50"
 )}>
 {notif.type.replace('_', ' ')}
 </span>
 <span className="text-[10px] text-slate-400 font-medium">{format(new Date(notif.createdAt),"dd MMM")}</span>
 </div>
 <div className="space-y-1">
 <h4 className="text-sm font-semibold text-slate-800 leading-tight">{notif.title}</h4>
 <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
 </div>
 </div>
 ))}
 {notifications.length === 0 && (
 <div className="text-center py-8">
 <p className="text-sm text-slate-500">No new notifications</p>
 </div>
 )}
 </div>
 </Card>
 </aside>
 </div>
 </div>
 );
}
