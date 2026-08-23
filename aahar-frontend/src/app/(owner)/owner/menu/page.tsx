"use client";

import { toast } from "sonner";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  RotateCcw,
  Loader2,
  UtensilsCrossed,
  Search,
  Filter,
  Building2
} from "lucide-react";
import { restaurantApi, ownerApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { MenuSection, MenuItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Validation Schema ───────────────────────────────────────
const itemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().max(200, "Description must be less than 200 characters").optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  dietary: z.enum(["veg", "non_veg", "vegan", "jain"]),
  isAvailable: z.boolean().default(true),
  categoryId: z.string().min(1, "Please select or create a category"),
  newCategoryName: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "undo" | "error";
  onUndo?: () => void;
}

export default function MenuManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isHotelOnly, setIsHotelOnly] = useState(false);
  const [hotelName, setHotelName] = useState<string | null>(null);
  
  // Item Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItemData, setEditingItemData] = useState<{ sectionId: string, item: MenuItem } | null>(null);

  // Load real menu into state
  useEffect(() => {
    const fetchMenu = async () => {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const restRes = await restaurantApi.list({ limit: 1, ownerId: currentUser.id, all: "true" });
        const restaurant = restRes.data?.data?.items?.[0];
        
        if (restaurant) {
          setRestaurantId(restaurant.id);
          setMenuSections(restaurant.menu ?? []);
        } else {
          // Check if user is a Hotel Owner
          const statsRes = await ownerApi.stats();
          if (statsRes.data?.data?.hotelId) {
            setIsHotelOnly(true);
            setHotelName(statsRes.data?.data?.hotelName || "Hotel");
          }
        }
      } catch (e) {
        console.error("Error loading menu:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"] = "info", onUndo?: () => void) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type, onUndo }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const openItemModal = (sectionId?: string, item?: MenuItem) => {
    if (sectionId && item) {
      setEditingItemData({ sectionId, item });
    } else {
      setEditingItemData(null);
    }
    setShowItemModal(true);
  };

  const handleDeleteItem = (sectionId: string, item: MenuItem) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    const originalMenu = [...menuSections];
    setMenuSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== item.id) } : s
    ));
    addToast(`Deleted ${item.name}`, "undo", () => setMenuSections(originalMenu));
  };

  const toggleAvailability = (sectionId: string, itemId: string) => {
    setMenuSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          items: s.items.map(i => i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i)
        };
      }
      return s;
    }));
  };

  const handleSaveMenu = async () => {
    let currentRestaurantId = restaurantId;
    if (!currentRestaurantId) {
      try {
        const statsRes = await ownerApi.stats();
        currentRestaurantId = statsRes.data?.data?.restaurantId;
        if (currentRestaurantId) setRestaurantId(currentRestaurantId);
      } catch (e) {
        console.error(e);
      }
    }

    if (!currentRestaurantId) {
      toast.error("No associated restaurant establishment found for this account.");
      return;
    }

    setSaving(true);
    try {
      const res = await restaurantApi.updateMenu(currentRestaurantId, menuSections);
      if (res.data?.data) {
        setMenuSections(res.data.data);
      }
      toast.success("Digital menu published successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to publish digital menu.");
    } finally {
      setSaving(false);
    }
  };

  // Flatten items for Data Table
  const flattenedItems = useMemo(() => {
    return menuSections.flatMap(section => 
      section.items.map(item => ({ ...item, sectionId: section.id, sectionName: section.name }))
    ).filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.sectionName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.sectionId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuSections, searchQuery, selectedCategory]);

  if (loading) return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="h-12 w-64 bg-slate-50 rounded-md animate-pulse mb-10" />
      <div className="flex flex-col gap-4 animate-pulse">
        {[1,2,3].map(i => (
          <div key={i} className="h-16 bg-slate-50 rounded-md border border-slate-200" />
        ))}
      </div>
    </div>
  );

  if (isHotelOnly) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-6 my-12">
        <Card className="bg-white rounded-xl p-12 shadow-lg border border-slate-200 space-y-6">
          <div className="w-16 h-16 bg-teal-50 text-admin-primary rounded-full flex items-center justify-center mx-auto">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{hotelName} — Hotel Establishment</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mt-2 leading-relaxed">
              Digital Menu Management is designed for <strong>Restaurant</strong> establishments (food ordering & table bookings). 
              For your Hotel, you manage <strong>Room Types, Amenities, and Guest Enquiries</strong>.
            </p>
          </div>
          <div className="pt-4 flex justify-center gap-4">
            <Button onClick={() => router.push("/owner/profile")} className="bg-admin-primary text-white font-semibold rounded-md px-6 py-3">
              Go to Hotel Profile
            </Button>
            <Button onClick={() => router.push("/owner/dashboard")} variant="outline" className="border-slate-200 text-slate-700 font-semibold rounded-md px-6 py-3">
              Return to Overview
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Menu Management</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Configure your digital menu, pricing, and availability.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCategoryModal(true)} variant="outline" className="rounded-md px-6 py-5 font-semibold shadow-sm transition-all flex items-center gap-2 border border-slate-200 bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900">
            <Filter className="h-4 w-4 text-slate-600" /> Manage Categories
          </Button>
          <Button onClick={() => openItemModal()} className="bg-admin-primary text-white rounded-md px-6 py-5 font-semibold shadow-md hover:bg-admin-primary-hover transition-all flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Menu Item
          </Button>
        </div>
      </div>

      <Card className="bg-white rounded-lg border-0 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Menu Inventory</h2>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Category Filter Dropdown */}
            <select 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary transition-all cursor-pointer shadow-sm w-full sm:w-auto"
            >
              <option value="all">All Categories ({menuSections.flatMap(s => s.items).length})</option>
              {menuSections.map(sec => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({sec.items.length})
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative group w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search items or categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm rounded-md border-slate-300 bg-white w-full sm:w-64 focus:ring-2 focus:ring-admin-primary transition-shadow"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Item Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flattenedItems.length > 0 ? flattenedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-sm flex-shrink-0", 
                        item.dietary === "veg" ? "bg-emerald-500" : 
                        item.dietary === "vegan" ? "bg-purple-500" :
                        item.dietary === "jain" ? "bg-amber-500" :
                        "bg-rose-500"
                      )} />
                      <div>
                        <p className={cn("text-sm font-semibold text-slate-800", !item.isAvailable && "text-slate-400 line-through")}>
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className="text-[11px] font-medium text-slate-600 bg-white">
                      {item.sectionName}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-800">₹{item.price}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => toggleAvailability(item.sectionId, item.id)} 
                      className={cn(
                        "w-10 h-6 rounded-full flex items-center px-1 transition-colors", 
                        item.isAvailable ? "bg-admin-primary" : "bg-slate-200"
                      )}
                    >
                      <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transition-transform", item.isAvailable ? "translate-x-4" : "translate-x-0")} />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <Button onClick={() => openItemModal(item.sectionId, item)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-admin-primary hover:bg-admin-primary/10">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDeleteItem(item.sectionId, item)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-rose-500 hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">
                    No menu items found. Click "Add Menu Item" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Form Action Footer */}
      <div className="mt-8 pt-6 flex items-center justify-end border-t border-slate-200">
        <Button 
          onClick={handleSaveMenu} 
          disabled={saving} 
          className="bg-admin-primary text-white rounded-md px-8 h-12 font-semibold shadow-md hover:bg-admin-primary-hover transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Publish Digital Menu
        </Button>
      </div>

      {showItemModal && (
        <ItemModal 
          isOpen={showItemModal} 
          onClose={() => setShowItemModal(false)} 
          editingData={editingItemData} 
          sections={menuSections}
          onSave={(values) => {
            let activeSections = [...menuSections];
            let targetSectionId = values.categoryId;
            
            // Create new category if needed
            if (values.categoryId === "new" && values.newCategoryName) {
              const newSection: MenuSection = {
                id: `sec_${Date.now()}`,
                name: values.newCategoryName,
                items: []
              };
              activeSections.push(newSection);
              targetSectionId = newSection.id;
            }

            if (editingItemData) {
              // Remove from old section if changed
              if (editingItemData.sectionId !== targetSectionId) {
                activeSections = activeSections.map(s => s.id === editingItemData.sectionId ? { ...s, items: s.items.filter(i => i.id !== editingItemData.item.id) } : s);
                activeSections = activeSections.map(s => s.id === targetSectionId ? { ...s, items: [...s.items, { ...editingItemData.item, ...values }] } : s);
              } else {
                activeSections = activeSections.map(s => s.id === targetSectionId ? { ...s, items: s.items.map(i => i.id === editingItemData.item.id ? { ...i, ...values } : i) } : s);
              }
            } else {
              activeSections = activeSections.map(s => s.id === targetSectionId ? { ...s, items: [...s.items, { id: `item_${Date.now()}`, ...values }] } : s);
            }
            
            // Cleanup logic removed to allow empty categories
            // activeSections = activeSections.filter(s => s.items.length > 0 || s.id === targetSectionId);
            
            setMenuSections(activeSections);
            setShowItemModal(false);
          }}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          sections={menuSections}
          onSave={(updatedSections) => {
            setMenuSections(updatedSections);
            setShowCategoryModal(false);
            addToast("Categories updated (Unsaved). Click Publish to save.", "success");
          }}
        />
      )}

      {/* Floating Toasts */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 items-end">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            "px-6 py-4 rounded-md text-white font-semibold text-sm shadow-xl flex items-center gap-4 animate-in slide-in-from-right-8", 
            t.type === 'error' ? "bg-rose-500" : "bg-admin-primary"
          )}>
            <span>{t.message}</span>
            {t.onUndo && (
              <button 
                onClick={() => { t.onUndo?.(); setToasts(prev => prev.filter(x => x.id !== t.id)) }} 
                className="bg-white/20 px-3 py-1.5 rounded-sm text-xs hover:bg-white/30 transition-colors"
              >
                UNDO
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemModal({ isOpen, onClose, editingData, sections, onSave }: { 
  isOpen: boolean, 
  onClose: () => void, 
  editingData: { sectionId: string, item: MenuItem } | null, 
  sections: MenuSection[],
  onSave: (values: ItemFormValues) => void 
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: editingData 
      ? {
          name: editingData.item.name,
          description: editingData.item.description || "",
          price: editingData.item.price,
          dietary: editingData.item.dietary === "mixed" ? "veg" : (editingData.item.dietary as "veg" | "non_veg" | "vegan" | "jain"),
          isAvailable: editingData.item.isAvailable,
          categoryId: editingData.sectionId
        }
      : { name: "", description: "", price: 0, dietary: "veg", isAvailable: true, categoryId: sections.length > 0 ? sections[0].id : "new" }
  });

  const watchCategoryId = watch("categoryId");

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-lg bg-white rounded-lg p-8 animate-in zoom-in-95 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button type="button" onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">{editingData ? "Edit Menu Item" : "Add New Item"}</h3>
            <p className="text-sm text-slate-500 mt-1">Fill in the details below to update your digital menu.</p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-semibold text-slate-600">Item Name</Label>
                <Input {...register("name")} className="text-sm" placeholder="e.g. Garlic Naan" />
                {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-semibold text-slate-600">Category</Label>
                <select {...register("categoryId")} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-admin-primary outline-none">
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  <option value="new">+ Create New Category</option>
                </select>
                {errors.categoryId && <p className="text-xs text-rose-500">{errors.categoryId.message}</p>}
              </div>

              {watchCategoryId === "new" && (
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs font-semibold text-slate-600">New Category Name</Label>
                  <Input {...register("newCategoryName")} className="text-sm" placeholder="e.g. Desserts" autoFocus />
                  {errors.newCategoryName && <p className="text-xs text-rose-500">{errors.newCategoryName.message}</p>}
                </div>
              )}
              
              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-semibold text-slate-600">Description (Optional)</Label>
                <textarea 
                  {...register("description")} 
                  rows={2} 
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-admin-primary outline-none resize-none" 
                  placeholder="Briefly describe the ingredients..."
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">Price (₹)</Label>
                <Input type="number" {...register("price")} className="text-sm" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">Dietary Type</Label>
                <select {...register("dietary")} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-admin-primary outline-none">
                  <option value="veg">Vegetarian</option>
                  <option value="non_veg">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="jain">Jain Friendly</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1 bg-admin-primary text-white hover:bg-admin-primary-hover shadow-sm">Save Item</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function CategoryModal({ isOpen, onClose, sections, onSave }: { 
  isOpen: boolean, 
  onClose: () => void, 
  sections: MenuSection[],
  onSave: (sections: MenuSection[]) => void 
}) {
  const [localSections, setLocalSections] = useState<MenuSection[]>(sections);

  const addCategory = () => {
    setLocalSections([...localSections, { id: `sec_${Date.now()}`, name: "", items: [] }]);
  };

  const updateName = (id: string, name: string) => {
    setLocalSections(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  };

  const deleteCategory = (id: string) => {
    const section = localSections.find(s => s.id === id);
    if (section && section.items.length > 0) {
      if (!confirm(`Warning: This category contains ${section.items.length} items. Deleting it will delete all its items too! Proceed?`)) return;
    }
    setLocalSections(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = () => {
    const hasEmpty = localSections.some(s => !s.name || s.name.trim() === "");
    if (hasEmpty) {
      toast.error("Category names cannot be empty. Please fill in all category names or remove blank rows.");
      return;
    }
    onSave(localSections);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-lg bg-white rounded-lg p-8 animate-in zoom-in-95 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button type="button" onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Manage Categories</h3>
            <p className="text-sm text-slate-500 mt-1">Rename, delete, or add empty categories.</p>
          </div>
          
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {localSections.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-md">No categories yet.</div>
            ) : (
              localSections.map(s => (
                <div key={s.id} className="flex items-center gap-3 group">
                  <Input 
                    value={s.name} 
                    onChange={e => updateName(s.id, e.target.value)} 
                    placeholder="Enter Category Name..."
                    className="flex-1 text-sm font-medium border-slate-200 focus:ring-admin-primary"
                  />
                  <Badge variant="outline" className="text-slate-500 bg-slate-50 border-slate-200">{s.items.length} items</Badge>
                  <Button onClick={() => deleteCategory(s.id)} variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
          
          <Button onClick={addCategory} variant="outline" className="w-full border-dashed border-2 border-slate-200 py-6 text-slate-600 hover:border-slate-300 hover:bg-admin-primary hover:text-white transition-colors shadow-sm">
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button type="button" onClick={onClose} variant="ghost" className="flex-1 text-slate-600">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 bg-admin-primary text-white hover:bg-admin-primary-hover shadow-sm">Save Changes</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
