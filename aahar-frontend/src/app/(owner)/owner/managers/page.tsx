"use client";

import { useState, useEffect } from "react";
import { ownerApi } from "@/lib/api";
import { Plus, Search, Trash2, Edit, AlertCircle, Building2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function OwnerManagersPage() {
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    establishmentId: "",
    type: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [establishments, setEstablishments] = useState<any[]>([]);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ownerApi.managers();
      setManagers(res.data.data || []);
      const estRes = await ownerApi.establishments();
      setEstablishments(estRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ownerApi.createManager(formData);
      toast.success("Manager created successfully");
      setOpen(false);
      setFormData({ name: "", email: "", phone: "", password: "", establishmentId: "", type: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create manager");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this manager?")) return;
    try {
      await ownerApi.deleteManager(id);
      toast.success("Manager removed");
      fetchData();
    } catch (err) {
      toast.error("Failed to remove manager");
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-aahar-teal" /></div>;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Establishment Managers</h1>
          <p className="text-slate-500 mt-1">Manage staff assigned to your restaurants and hotels</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="bg-aahar-teal hover:bg-aahar-teal/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-10 px-4 py-2">
            <Plus className="h-4 w-4 mr-2" /> Add Manager
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">Assign New Manager</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Manager Name</label>
                <Input required placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl bg-slate-50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                <Input type="email" required placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl bg-slate-50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                <Input required placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl bg-slate-50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Temporary Password</label>
                <Input type="password" required placeholder="********" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="rounded-xl bg-slate-50" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Select Establishment</label>
                <select 
                  required 
                  className="w-full flex h-10 w-full rounded-xl border border-input bg-slate-50 px-3 py-2 text-sm" 
                  value={formData.establishmentId} 
                  onChange={e => {
                    const selectedId = e.target.value;
                    const est = establishments.find(x => x.id === selectedId);
                    setFormData({...formData, establishmentId: selectedId, type: est?.type || ""});
                  }}
                >
                  <option value="">Choose a property...</option>
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} ({est.type === "hotel" ? "Hotel/Resort" : "Restaurant"})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">The manager will be assigned to this property.</p>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-aahar-teal hover:bg-aahar-teal/90 text-white rounded-xl mt-4">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create & Assign"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-700">No Managers Assigned</h3>
            <p className="text-slate-500 mt-1">You haven't assigned any managers to your establishments yet.</p>
          </div>
        ) : (
          managers.map((manager) => (
            <Card key={manager.id} className="p-6 rounded-2xl border-0 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-full bg-aahar-teal/10 flex items-center justify-center text-aahar-teal font-bold text-xl">
                  {manager.name.charAt(0)}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(manager.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800">{manager.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{manager.email} • {manager.phone}</p>
              
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Assigned Property</p>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  {manager.type === 'hotel' ? <Building2 className="h-4 w-4 text-aahar-teal" /> : <Store className="h-4 w-4 text-orange-500" />}
                  {manager.assignedTo}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
