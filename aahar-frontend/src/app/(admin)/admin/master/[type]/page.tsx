"use client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { masterApi } from "@/lib/api";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Database,
  Edit2,
  ArrowLeft
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

const CATEGORY_LABELS: Record<string, string> = {
  "CATEGORY_RESTAURANT": "Restaurant Categories",
  "CATEGORY_HOTEL": "Hotel Properties",
  "DIETARY": "Dietary Types",
  "AMENITY_RESTAURANT": "Restaurant Amenities",
  "AMENITY_HOTEL": "Hotel Amenities",
  "MEAL_PLAN": "Meal Plans",
  "DOCUMENT_RESTAURANT": "Restaurant Documents",
  "DOCUMENT_HOTEL": "Hotel Documents",
  "PHOTO_CATEGORY_HOTEL": "Hotel Photo Gallery Categories",
  "PHOTO_CATEGORY_RESTAURANT": "Restaurant Photo Gallery Categories",
};

export default function MasterDataInnerPage({ params }: { params: { type: string } }) {
  const { type } = params;
  const decodedType = decodeURIComponent(type);
  const pageLabel = CATEGORY_LABELS[decodedType] || decodedType;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ id: "", key: "", label: "", icon: "" });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await masterApi.list(decodedType);
      setItems(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [decodedType]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing && formData.id) {
        await masterApi.update(formData.id, { label: formData.label, icon: formData.icon });
      } else {
        await masterApi.create({ type: decodedType, key: formData.key, label: formData.label, icon: formData.icon });
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this master data item? This may break existing records that rely on it.")) return;
    try {
      await masterApi.delete(id);
      fetchData();
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const handleLabelChange = (newLabel: string) => {
    const autoSlug = newLabel.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    setFormData(prev => ({
      ...prev,
      label: newLabel,
      key: (!isEditing && !isSlugManuallyEdited) ? autoSlug : prev.key
    }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setIsSlugManuallyEdited(false);
    setFormData({ id: "", key: "", label: "", icon: "" });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setIsEditing(true);
    setFormData({ id: item.id, key: item.key, label: item.label, icon: item.icon || "" });
    setShowModal(true);
  };

  const getSectionPath = (t: string) => {
    if (t.includes("RESTAURANT")) return "/admin/master/section/restaurant";
    if (t.includes("HOTEL") || t.includes("ROOM") || t.includes("BED") || t.includes("MEAL")) return "/admin/master/section/hotel";
    return "/admin/master/section/general";
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Top Navigation & Banner */}
      <div className="space-y-6">
        <Link href={getSectionPath(decodedType)} className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-admin-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Section Overview
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{pageLabel}</h1>
            <p className="text-slate-500 font-medium mt-1 text-sm">Managing {items.length} records in this category.</p>
          </div>
          <Button onClick={openAddModal} className="bg-admin-primary hover:bg-admin-primary-hover text-white shadow-md font-semibold h-12 px-6 rounded-lg text-base">
            <Plus className="h-5 w-5 mr-2" /> Add New Item
          </Button>
        </div>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {/* Data Table */}
        <div className="overflow-x-auto min-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-1/3">Display Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-1/3">Slug</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length > 0 ? items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        {decodedType.startsWith("DOCUMENT") ? (
                          item.icon === "true" && (
                            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200">
                              Requires Expiry
                            </Badge>
                          )
                        ) : (
                          item.icon && <span className="text-xl">{item.icon}</span>
                        )}
                        {item.label}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <code className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md border border-slate-200">
                        {item.key}
                      </code>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-bold uppercase tracking-wider border-0 px-2.5 py-1",
                        item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          onClick={() => openEditModal(item)}
                          variant="ghost" size="sm"
                          className="text-slate-400 hover:text-admin-primary hover:bg-admin-primary/10 h-9 w-9 p-0 rounded-md"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(item.id)}
                          variant="ghost" size="sm"
                          className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 h-9 w-9 p-0 rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-24 text-center bg-slate-50/30">
                      <Database className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-slate-700">No data found</h4>
                      <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">There are no records in this master category. Click the "Add New Item" button above to create one.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                {isEditing ? "Edit Master Data" : "Add Master Data"}
              </h3>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Display Name</label>
                <Input 
                  required 
                  value={formData.label} 
                  onChange={e => handleLabelChange(e.target.value)}
                  placeholder="e.g. Fine Dining"
                  className="h-12 border-slate-200 focus-visible:ring-admin-primary"
                  autoFocus
                />
                <p className="text-[10px] font-medium text-slate-400 leading-tight">This is the readable name that will appear in dropdowns across the Aahar portals.</p>
              </div>

              {!isEditing && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Slug</label>
                  <Input 
                    required 
                    value={formData.key} 
                    onChange={e => {
                      setIsSlugManuallyEdited(true);
                      if (decodedType === "PRICE_RANGE_RESTAURANT") {
                        setFormData({ ...formData, key: e.target.value });
                      } else {
                        setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') });
                      }
                    }}
                    placeholder={decodedType === "PRICE_RANGE_RESTAURANT" ? "e.g. ₹" : "e.g. fine_dining"}
                    className={cn("h-12 bg-slate-50 border-slate-200 focus-visible:ring-admin-primary font-mono text-xs", decodedType === "PRICE_RANGE_RESTAURANT" ? "text-lg" : "")}
                  />
                  <p className="text-[10px] font-medium text-slate-400 leading-tight">
                    {decodedType === "PRICE_RANGE_RESTAURANT" ? "The price symbol identifier (e.g. ₹, ₹₹). Must be unique." : "Unique database slug. Automatically generated from Display Name (uses lowercase & underscores)."}
                  </p>
                </div>
              )}

              {decodedType.startsWith("DOCUMENT") ? (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <label className="text-sm font-semibold text-slate-800">Requires Expiry Date</label>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">Prompt the owner to enter an expiration date for this document.</p>
                  </div>
                  <Switch 
                    checked={formData.icon === "true"}
                    onCheckedChange={(c) => setFormData({ ...formData, icon: c ? "true" : "false" })}
                  />
                </div>
              ) : decodedType === "PRICE_RANGE_RESTAURANT" ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
                  <Input 
                    value={formData.icon || ""} 
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g. Under ₹300 for two"
                    className="h-12 border-slate-200 focus-visible:ring-admin-primary"
                  />
                  <p className="text-[10px] font-medium text-slate-400 leading-tight">Displayed underneath the price range name.</p>
                </div>
              ) : null}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="mt-4 font-semibold text-slate-600">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="mt-4 bg-admin-primary hover:bg-admin-primary-hover text-white font-semibold">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isEditing ? "Save Changes" : "Create Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
