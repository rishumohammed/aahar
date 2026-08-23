"use client";

import { useEffect, useState } from"react";
import { useForm } from"react-hook-form";
import { zodResolver } from"@hookform/resolvers/zod";
import * as z from"zod";
import { restaurantApi, orderApi } from"@/lib/api";
import { Card } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import { Badge } from"@/components/ui/badge";
import { QrCode, Plus, Users, Printer, Loader2, RotateCcw } from"lucide-react";

const tableSchema = z.object({
 tableNumber: z.string().min(1,"Table number is required"),
 seatingCapacity: z.coerce.number().min(1,"Capacity must be at least 1").default(4)
});

type TableFormValues = z.infer<typeof tableSchema>;

export default function OwnerTablesPage() {
 const [restaurantId, setRestaurantId] = useState<string | null>(null);
 const [restaurantName, setRestaurantName] = useState("");
 const [restaurantSlug, setRestaurantSlug] = useState("");
 const [tables, setTables] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [creating, setCreating] = useState(false);
 const [showAddForm, setShowAddForm] = useState(false);
 const [printingTable, setPrintingTable] = useState<any | null>(null);

 const { register, handleSubmit, formState: { errors }, reset } = useForm<TableFormValues>({
 resolver: zodResolver(tableSchema),
 defaultValues: {
 tableNumber:"",
 seatingCapacity: 4
 }
 });

 const fetchTables = async (resId: string) => {
 try {
 const res = await orderApi.listTables(resId);
 if (res.data.success) {
 setTables(res.data.data || []);
 }
 } catch (err) {
 console.error("Error fetching tables:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 restaurantApi.list({ limit: 1 })
 .then(res => {
 const restaurant = res.data.data.items[0];
 if (restaurant) {
 setRestaurantId(restaurant.id);
 setRestaurantName(restaurant.name);
 setRestaurantSlug(restaurant.slug || "");
 fetchTables(restaurant.id);
 } else {
 setLoading(false);
 }
 })
 .catch(err => {
 console.error("Failed to load restaurant profile:", err);
 setLoading(false);
 });
 }, []);

 const onSubmitTable = async (values: TableFormValues) => {
 if (!restaurantId) return;
 setCreating(true);
 try {
 const res = await orderApi.createTable(restaurantId, values);
 if (res.data.success) {
 reset();
 setShowAddForm(false);
 await fetchTables(restaurantId);
 }
 } catch (err) {
 console.error("Error creating table:", err);
 } finally {
 setCreating(false);
 }
 };

 const handlePrint = (table: any) => {
 setPrintingTable(table);
 setTimeout(() => {
 window.print();
 }, 150);
 };

 if (loading) {
 return (
 <div className="p-8 max-w-5xl mx-auto space-y-6">
 <div className="h-12 w-64 bg-slate-50 rounded-md animate-pulse mb-10"/>
 <div className="grid grid-cols-3 gap-6">
 {[1,2,3].map(i => (
 <div key={i} className="h-72 bg-slate-50 rounded-lg border border-slate-200 animate-pulse"/>
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-10 pb-24 relative print:p-0 print:bg-white print:max-w-none">
 
 {/* Printable Area Wrapper */}
 <div className="print:hidden flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="p-4 bg-admin-primary/10 rounded-lg text-admin-primary">
 <QrCode className="h-8 w-8"/>
 </div>
 <div>
 <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Tables & QR Codes</h1>
 <p className="text-slate-500 font-medium mt-1">Configure physical dining tables and download scan-to-order QR codes.</p>
 </div>
 </div>
 <Button 
 onClick={() => setShowAddForm(!showAddForm)} 
 className="bg-admin-primary text-white rounded-md px-6 py-7 font-bold uppercase tracking-wider shadow-xl shadow-admin-primary/10 hover:bg-admin-primary/90"
 >
 <Plus className="h-5 w-5 mr-2"/> Register Table
 </Button>
 </div>

 <style>{`
 @media print {
 @page { size: A6 portrait; margin: 0; }
 body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
 }
 `}</style>

 {/* Print Frame (Only visible when printing) */}
 {printingTable && (
 <div className="hidden print:flex flex-col items-center justify-center text-center bg-white p-6 space-y-5 border-4 border-aahar-dark rounded-2xl w-[105mm] h-[148mm] mx-auto my-auto overflow-hidden shadow-none box-border">
 <div>
 <h1 className="text-3xl font-bold tracking-tighter text-admin-primary">AAHAR</h1>
 <p className="text-[10px] uppercase font-bold text-slate-800 tracking-wider mt-0.5">{restaurantName}</p>
 </div>
 
 <div className="p-3 bg-white border-2 border-aahar-dark/10 rounded-xl">
 <img 
  src={printingTable.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent((typeof window !== "undefined" ? window.location.origin : "http://localhost:3000") + `/restaurant/${restaurantSlug || "menu"}?table=${printingTable.tableNumber}`)}`} 
  alt={`Table ${printingTable.tableNumber} QR`} 
  className="w-40 h-40 object-contain"
 />
 </div>

 <div className="space-y-1.5 px-4">
 <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">TABLE {printingTable.tableNumber}</h2>
 <p className="text-[10px] font-bold text-slate-500 leading-snug">
 Scan to view our digital menu and order from your phone!
 </p>
 </div>

 <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-auto pt-2">
 No Apps Required • Pay at Counter
 </div>
 </div>
 )}

 {/* Add Table form (React Hook Form + Zod) */}
 {showAddForm && (
 <Card className="print:hidden p-8 border-2 border-admin-primary/20 bg-white rounded-lg shadow-xl animate-in zoom-in-95">
 <form onSubmit={handleSubmit(onSubmitTable)} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500/60 pl-1">Table Identifier / Number</Label>
 <Input 
 type="text"
 placeholder="E.g., 5 or A1"
 {...register("tableNumber")}
 className="rounded-md py-7 border-slate-200 focus:ring-aahar-teal text-md font-bold"
 />
 {errors.tableNumber && (
 <p className="text-xs font-bold text-rose-500 pl-1">{errors.tableNumber.message}</p>
 )}
 </div>
 <div className="space-y-2">
 <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500/60 pl-1">Seating Capacity</Label>
 <Input 
 type="number"
 placeholder="E.g., 4"
 {...register("seatingCapacity")}
 className="rounded-md py-7 border-slate-200 focus:ring-aahar-teal text-md font-bold"
 />
 {errors.seatingCapacity && (
 <p className="text-xs font-bold text-rose-500 pl-1">{errors.seatingCapacity.message}</p>
 )}
 </div>
 </div>
 <div className="flex gap-3 justify-end pt-2">
 <Button 
 type="submit"
 disabled={creating}
 className="bg-admin-primary text-white rounded-md px-8 py-6 h-auto font-bold uppercase tracking-wider shadow-xl shadow-admin-primary/15 disabled:opacity-50"
 >
 {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
 Generate Sticker
 </Button>
 <Button 
 type="button"
 onClick={() => setShowAddForm(false)} 
 variant="ghost"
 className="rounded-md h-14 px-6 border border-slate-200"
 >
 Cancel
 </Button>
 </div>
 </form>
 </Card>
 )}

 {/* Grid of Tables */}
 <div className="print:hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {tables.map((table) => (
 <Card key={table.id} className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between space-y-6">
 
 {/* Table Identification Card */}
 <div className="flex items-center justify-between border-b border-aahar-wash pb-4">
 <div>
 <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Table {table.tableNumber}</h3>
 <p className="text-[10px] font-bold text-admin-primary uppercase tracking-wider mt-1 flex items-center gap-1.5">
 <Users className="h-3 w-3"/>
 {table.seatingCapacity} Seats
 </p>
 </div>
 <Badge className="bg-emerald-100 text-emerald-600 border-0 font-bold uppercase text-[9px] tracking-wider px-2.5 py-1">
 Active
 </Badge>
 </div>

 {/* QR Card Preview */}
 <div className="p-4 bg-slate-50 rounded-lg flex justify-center border border-slate-200/30">
 {table.qrCodeUrl ? (
 <img 
 src={table.qrCodeUrl} 
 alt={`Table ${table.tableNumber} QR Code`} 
 className="w-40 h-40 object-contain rounded-md"
 />
 ) : (
 <div className="w-40 h-40 flex flex-col items-center justify-center text-slate-500/25 text-center">
 <QrCode className="h-10 w-10 mb-2 animate-pulse"/>
 <span className="text-xs font-semibold uppercase tracking-wider leading-none">Generating QR...</span>
 </div>
 )}
 </div>

 {/* Footer options */}
 <Button 
 onClick={() => handlePrint(table)}
 disabled={!table.qrCodeUrl}
 className="w-full bg-slate-900 hover:bg-slate-900/95 text-white rounded-md py-5 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
 >
 <Printer className="h-4 w-4"/>
 Print QR Card
 </Button>
 </Card>
 ))}

 {tables.length === 0 && (
 <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-lg bg-white space-y-4">
 <QrCode className="h-12 w-12 text-slate-500/15 mx-auto animate-pulse"/>
 <div className="space-y-2">
 <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">No Dining Tables Added</h3>
 <p className="text-sm text-slate-500 max-w-xs mx-auto">
 Start by registering your tables to auto-generate scan-to-order dine-in stickers!
 </p>
 </div>
 <Button 
 onClick={() => setShowAddForm(true)} 
 className="bg-admin-primary text-white rounded-md px-6 py-4 font-bold uppercase tracking-wider text-xs h-auto shadow-md"
 >
 Register First Table
 </Button>
 </div>
 )}
 </div>
 </div>
 );
}
