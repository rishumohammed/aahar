"use client";
import { useEffect, useState } from"react";
import { motion } from"framer-motion";
import { 
 TrendingUp, 
 Calendar, 
 MessageSquare,
 CheckCircle2,
 Bell,
 Hotel,
 ArrowRight
} from"lucide-react";
import { format } from"date-fns";
import Link from"next/link";

import { Card } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { Button } from"@/components/ui/button";
import { cn } from"@/lib/utils";
import { enquiryApi, notificationApi, ownerApi } from"@/lib/api";
import { useAuth } from"@/lib/hooks/useAuth";

export default function HotelManagerDashboardPage() {
 const { user } = useAuth();
 const [stats, setStats] = useState<any[]>([]);
 const [notifications, setNotifications] = useState<any[]>([]);
 const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
 const [hasApplication, setHasApplication] = useState(false);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchDashboardData();
 }, []);

 const fetchDashboardData = async () => {
 try {
 const [notifsRes, statsRes, enquiriesRes] = await Promise.all([
 notificationApi.list({ limit: 5 }),
 ownerApi.stats(),
 enquiryApi.list({ limit: 5 })
 ]);
 
 const realStats = statsRes.data?.data || {};
 setNotifications(notifsRes.data?.data?.notifications || []);
 setRecentEnquiries(enquiriesRes.data?.data?.items || []);
 setHasApplication(realStats.timeline && realStats.timeline.length > 0);

 setStats([
 { 
 label:"Enquiries", 
 value: realStats.enquiries ||"0", 
 sub:"Total received", 
 icon: MessageSquare, color:"text-admin-text", bg:"bg-admin-light"
 },
 { 
 label:"Certification", 
 value: realStats.isCertified ?"ACTIVE":"PENDING", 
 sub: realStats.certNumber ||"Not issued", 
 icon: CheckCircle2, color:"text-emerald-500", bg:"bg-emerald-50"
 },
 { 
 label:"Avg Response", 
 value:"2.4h", 
 sub:"Last 7 days", 
 icon: TrendingUp, color:"text-amber-500", bg:"bg-amber-50"
 },
 { 
 label:"Property", 
 value:"LISTED", 
 sub:"Visible on search", 
 icon: Hotel, color:"text-blue-500", bg:"bg-blue-50"
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
 <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manager Dashboard, {user?.name?.split(' ')[0]}</h1>
 <p className="text-slate-500 font-medium text-sm mt-1">Monitor your property performance and guest enquiries.</p>
 </div>
 <Button asChild className="bg-admin-primary hover:bg-admin-primary-hover text-white rounded-md px-6 shadow-md transition-all">
 <Link href="/manager/enquiries">View All Enquiries</Link>
 </Button>
 </div>

 {/* Conditional CTA Card */}
 {!hasApplication ? (
 <Card className="p-8 rounded-lg border-2 border-dashed border-admin-primary/30 bg-admin-light flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
 <div className="space-y-2">
 <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Get Certified with AAHAR Trust Seal</h2>
 <p className="text-sm font-medium text-slate-500">
 Your property has not applied for an AAHAR hygiene and safety certification yet. Begin your application now.
 </p>
 </div>
 <Button asChild className="bg-admin-primary hover:bg-admin-primary-hover text-white rounded-md px-8 py-2 font-semibold shadow-md shrink-0">
 <Link href="/manager/application">Apply for Certification</Link>
 </Button>
 </Card>
 ) : (
 <Card className="p-8 rounded-lg border border-slate-200 bg-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full bg-admin-light flex items-center justify-center text-admin-text">
 <CheckCircle2 className="h-6 w-6"/>
 </div>
 <div className="space-y-1">
 <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Certification Application in Progress</h2>
 <p className="text-sm font-medium text-slate-500">
 Track your verification progress, upload documents, and view checklist compliance.
 </p>
 </div>
 </div>
 <Button asChild variant="outline"className="border-admin-primary text-admin-text rounded-md px-8 py-2 font-semibold shrink-0 hover:bg-admin-primary hover:text-white transition-colors shadow-sm">
 <Link href="/manager/compliance">View Compliance & Progress</Link>
 </Button>
 </Card>
 )}

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
 <h3 className={cn("text-2xl font-bold text-slate-800 mt-1 truncate")}>{stat.value}</h3>
 <p className="text-sm text-slate-500 mt-1">{stat.sub}</p>
 </div>
 </Card>
 </motion.div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 <div className="lg:col-span-8 space-y-8">
 <Card className="bg-white rounded-lg border-0 shadow-md p-6">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Recent Enquiries</h2>
 <Link href="/manager/enquiries"className="text-xs font-semibold text-admin-text flex items-center gap-1 hover:text-admin-hover transition-colors">
 View all <ArrowRight className="h-3 w-3"/>
 </Link>
 </div>
 <div className="space-y-4">
 {recentEnquiries.length > 0 ? (
 recentEnquiries.map((enq) => (
 <div key={enq.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-admin-text font-semibold shadow-sm border border-slate-200">
 {enq.guest?.name?.charAt(0) ||"G"}
 </div>
 <div>
 <p className="text-sm font-semibold text-slate-800">{enq.guest?.name ||"Guest"}</p>
 <p className="text-xs text-slate-500 font-medium">{format(new Date(enq.checkIn),"dd MMM")} - {format(new Date(enq.checkOut),"dd MMM")}</p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <Badge className={cn(
"text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border-0",
 enq.status === 'sent' ?"text-blue-700 bg-blue-50": 
 enq.status === 'quoted' ?"text-admin-text bg-admin-light":
"text-slate-500 bg-slate-100"
 )}>
 {enq.status}
 </Badge>
 <ArrowRight className="h-4 w-4 text-slate-400"/>
 </div>
 </div>
 ))
 ) : (
 <div className="text-center py-12">
 <MessageSquare className="h-10 w-10 text-slate-200 mx-auto mb-3"/>
 <p className="text-sm text-slate-500">No enquiries received yet.</p>
 </div>
 )}
 </div>
 </Card>
 </div>

 <aside className="lg:col-span-4">
 <Card className="bg-white rounded-lg border-0 shadow-md p-6 h-full">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Recent Feed</h2>
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
 notif.type.includes('enquiry') ?"text-blue-700 bg-blue-50": 
 notif.type.includes('cert') ?"text-admin-text bg-admin-light":
"text-slate-500 bg-slate-100"
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

