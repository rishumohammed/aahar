"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Image as ImageIcon, 
  Plus, 
  Pencil,
  Trash2,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { promotionApi, uploadApi } from "@/lib/api";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "", imageUrl: "", linkUrl: "", position: "fluid", isActive: true
  });
  const [saving, setSaving] = useState(false);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await promotionApi.list();
      setPromotions(res.data.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); }, []);

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormData({ title: "", imageUrl: "", linkUrl: "", position: "fluid", isActive: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (promo: any) => {
    setEditingPromo(promo);
    setFormData({
      title: promo.title, 
      imageUrl: promo.imageUrl, 
      linkUrl: promo.linkUrl || "", 
      position: promo.position, 
      isActive: promo.isActive
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl || !formData.position) {
      return toast.error("Please fill in required fields (Title, Image, Position)");
    }
    setSaving(true);
    try {
      if (editingPromo) {
        await promotionApi.update(editingPromo.id, formData);
        toast.success("Promotion updated successfully");
      } else {
        await promotionApi.create(formData);
        toast.success("Promotion created successfully");
      }
      setModalOpen(false);
      fetchPromotions();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save promotion");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promotion permanently?")) return;
    try {
      await promotionApi.delete(id);
      toast.success("Promotion deleted");
      fetchPromotions();
    } catch (e) {
      toast.error("Failed to delete promotion");
    }
  };

  const handleToggleActive = async (promo: any, isActive: boolean) => {
    try {
      await promotionApi.update(promo.id, { isActive });
      fetchPromotions();
      toast.success(`Promotion ${isActive ? 'activated' : 'paused'}`);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ad Zones & Promotions</h1>
          <p className="text-slate-600 font-medium text-sm mt-1">Manage sponsored banners and homepage promotions.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-admin-primary text-white shadow-sm rounded-lg h-11 px-6 hover:bg-admin-hover font-semibold tracking-wide">
          <Plus className="h-4 w-4 mr-2" /> New Promotion
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 text-admin-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {promotions.map((promo) => (
            <Card key={promo.id} className={cn("overflow-hidden rounded-2xl border shadow-sm transition-all flex flex-col", promo.isActive ? "border-slate-200 bg-white" : "border-slate-200/50 bg-slate-50/50 opacity-80")}>
              <div className="w-full h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
                {promo.imageUrl ? (
                  <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-slate-300" />
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-admin-text border-0 text-[10px] font-bold uppercase tracking-wider shadow-sm px-3 py-1 rounded-full">
                    {promo.position}
                  </Badge>
                  {promo.isActive ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-0 text-[10px] font-bold uppercase tracking-wider shadow-sm px-3 py-1 rounded-full">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-200 text-slate-600 border-0 text-[10px] font-bold uppercase tracking-wider shadow-sm px-3 py-1 rounded-full">Paused</Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm text-slate-700 hover:text-admin-primary shadow-sm" onClick={() => handleOpenEdit(promo)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm text-slate-700 hover:text-rose-600 shadow-sm" onClick={() => handleDelete(promo.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight line-clamp-1">{promo.title}</h3>
                {promo.linkUrl && (
                  <a href={promo.linkUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-admin-primary mt-2 hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> {promo.linkUrl}
                  </a>
                )}
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">Toggle Status</span>
                  <Switch checked={promo.isActive} onCheckedChange={(v: boolean) => handleToggleActive(promo, v)} />
                </div>
              </div>
            </Card>
          ))}
          {promotions.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
              <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium text-lg">No promotions found.</p>
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-slate-200 shadow-2xl">
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
              {editingPromo ? "Edit Promotion" : "Create New Promotion"}
            </DialogTitle>
            <p className="text-sm font-medium text-slate-500 mt-1">Configure banner details and placement.</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Internal Title</Label>
              <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Summer Campaign 2026" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Position</Label>
                <Select value={formData.position} onValueChange={v => setFormData({...formData, position: v})}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm">
                    <SelectValue placeholder="Select Position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fluid">Fluid (Top Banner)</SelectItem>
                    <SelectItem value="300x250">300x250 (Side Banner)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Target Link (Optional)</Label>
                <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Ad Image</Label>
              <div className="flex gap-4 items-center">
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="Preview" className="h-14 w-24 object-cover rounded-lg border border-slate-200 shadow-sm bg-slate-50" />
                )}
                <Input 
                  type="file" 
                  accept="image/*"
                  className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm flex-1 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-admin-primary hover:file:bg-slate-100" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const toastId = toast.loading("Uploading image...");
                      const res = await uploadApi.singlePhoto(file);
                      const url = res.data?.data?.url || res.data?.url;
                      setFormData({...formData, imageUrl: url});
                      toast.success("Image uploaded", { id: toastId });
                    } catch (err) {
                      toast.error("Failed to upload image");
                    }
                  }} 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold text-slate-800">Status</Label>
                <p className="text-xs font-medium text-slate-500">Enable or disable this promotion across the site.</p>
              </div>
              <Switch checked={formData.isActive} onCheckedChange={(v: boolean) => setFormData({...formData, isActive: v})} />
            </div>
          </div>
          
          <div className="px-8 py-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <Button variant="outline" className="h-10 px-6 rounded-lg font-semibold text-slate-600 border-slate-300" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="h-10 px-8 rounded-lg font-semibold bg-admin-primary hover:bg-admin-hover text-white shadow-sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Promotion"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
