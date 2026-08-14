"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Scale,
  FileText,
  Lock,
  Upload,
  MoreVertical,
  Pencil,
  Trash2,
  ListChecks,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MaterialInput } from "@/components/ui/material-input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Standard, StandardDivision, StandardCriterion } from "@/types";

// --- Schemas ---

const standardSchema = z.object({
  name: z.string().min(3, "Standard name must be at least 3 characters"),
  version: z.string().min(1, "Version is required"),
  division: z.enum(["fnb", "accommodation"], {
    required_error: "Please select a division",
  }),
});

const handbookUpdateSchema = z.object({
  version: z.string().min(1, "New version number is required"),
  releaseNotes: z.string().min(10, "Please provide brief release notes"),
});

const criterionSchema = z.object({
  section: z.string().min(1, "Section name is required"),
  criterion: z.string().min(5, "Criterion description is too short"),
  weight: z.number().min(1).max(5),
});

export default function StandardsPage() {
  const [fnbStandards, setFnbStandards] = useState<Standard[]>([]);
  const [accStandards, setAccStandards] = useState<Standard[]>([]);
  const [fnbHandbook, setFnbHandbook] = useState<any>(null);
  const [accHandbook, setAccHandbook] = useState<any>(null);

  // Load from API
  const loadStandards = async () => {
    try {
      const { adminApi } = await import("@/lib/api");
      const res = await adminApi.listStandards();
      const all = res.data.data || [];
      setFnbStandards(all.filter((s: any) => s.division === 'fnb'));
      setAccStandards(all.filter((s: any) => s.division === 'accommodation'));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load standards");
    }
  };

  const loadHandbooks = async () => {
    try {
      const { settingsApi } = await import("@/lib/api");
      const [fnbRes, accRes] = await Promise.all([
        settingsApi.get('fnb_handbook').catch(() => ({ data: { data: null } })),
        settingsApi.get('accommodation_handbook').catch(() => ({ data: { data: null } }))
      ]);
      if (fnbRes.data) setFnbHandbook(fnbRes.data);
      if (accRes.data) setAccHandbook(accRes.data);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => { 
    loadStandards(); 
    loadHandbooks();
  }, []);

  // Modals state
  const [isStandardModalOpen, setIsStandardModalOpen] = useState(false);
  const [isFnbHandbookModalOpen, setIsFnbHandbookModalOpen] = useState(false);
  const [isAccHandbookModalOpen, setIsAccHandbookModalOpen] = useState(false);
  const [fnbFile, setFnbFile] = useState<File | null>(null);
  const [accFile, setAccFile] = useState<File | null>(null);
  
  // CRUD states
  const [editingStandard, setEditingStandard] = useState<Standard | null>(null);
  const [standardToDelete, setStandardToDelete] = useState<Standard | null>(null);
  const [managingChecklistStandard, setManagingChecklistStandard] = useState<Standard | null>(null);

  // Forms
  const standardForm = useForm<z.infer<typeof standardSchema>>({
    resolver: zodResolver(standardSchema),
    defaultValues: { name: "", version: "", division: "fnb" },
  });

  const fnbHandbookForm = useForm<z.infer<typeof handbookUpdateSchema>>({
    resolver: zodResolver(handbookUpdateSchema),
    defaultValues: { version: "", releaseNotes: "" },
  });

  const accHandbookForm = useForm<z.infer<typeof handbookUpdateSchema>>({
    resolver: zodResolver(handbookUpdateSchema),
    defaultValues: { version: "", releaseNotes: "" },
  });

  const criterionForm = useForm<z.infer<typeof criterionSchema>>({
    resolver: zodResolver(criterionSchema),
    defaultValues: { section: "", criterion: "", weight: 1 },
  });

  // Handlers
  const openNewStandard = () => {
    setEditingStandard(null);
    standardForm.reset({ name: "", version: "", division: "fnb" });
    setIsStandardModalOpen(true);
  };

  const openEditStandard = (standard: Standard) => {
    setEditingStandard(standard);
    standardForm.reset({ name: standard.name, version: standard.version, division: standard.division });
    setIsStandardModalOpen(true);
  };

  const onStandardSubmit = async (data: z.infer<typeof standardSchema>) => {
    const formattedVersion = data.version.startsWith('v') ? data.version : `v${data.version}`;
    try {
      const { adminApi } = await import("@/lib/api");
      if (editingStandard) {
        await adminApi.updateStandard(editingStandard.id, { ...data, version: formattedVersion });
        toast.success("Standard updated successfully");
      } else {
        await adminApi.createStandard({ ...data, version: formattedVersion, criteria: [] });
        toast.success("Standard created successfully");
      }
      loadStandards();
      setIsStandardModalOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save standard");
    }
  };

  const handleDelete = async () => {
    if (!standardToDelete) return;
    try {
      const { adminApi } = await import("@/lib/api");
      await adminApi.deleteStandard(standardToDelete.id);
      toast.success("Standard deleted successfully");
      loadStandards();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete standard");
    } finally {
      setStandardToDelete(null);
    }
  };

  const onHandbookSubmit = async (data: z.infer<typeof handbookUpdateSchema>, division: StandardDivision) => {
    const file = division === 'fnb' ? fnbFile : accFile;
    if (!file) {
      toast.error("Please select a handbook file to upload.");
      return;
    }

    try {
      const { uploadApi, settingsApi } = await import("@/lib/api");
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadApi.handbook(formData);
      const url = res.data.data.url;

      await settingsApi.update(`${division}_handbook`, { version: data.version, releaseNotes: data.releaseNotes, url });

      toast.success(`${division === 'fnb' ? 'F&B' : 'Accommodation'} Handbook updated to ${data.version}`);
      
      if (division === "fnb") {
        setIsFnbHandbookModalOpen(false);
        fnbHandbookForm.reset();
        setFnbFile(null);
      } else {
        setIsAccHandbookModalOpen(false);
        accHandbookForm.reset();
        setAccFile(null);
      }
      loadHandbooks();
    } catch (e) {
      toast.error("Failed to update handbook");
      console.error(e);
    }
  };

  const onCriterionSubmit = async (data: z.infer<typeof criterionSchema>) => {
    if (!managingChecklistStandard) return;
    try {
      const { adminApi } = await import("@/lib/api");
      await adminApi.addCriterion(managingChecklistStandard.id, data);
      
      // Update currently managing standard to reflect changes instantly by refetching
      const res = await adminApi.listStandards();
      const all = res.data.data || [];
      const updated = all.find((s: any) => s.id === managingChecklistStandard.id);
      if (updated) setManagingChecklistStandard(updated);
      
      loadStandards();
      criterionForm.reset({ section: data.section, criterion: "", weight: 1 });
      toast.success("Checklist criterion added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add criterion");
    }
  };

  const deleteCriterion = async (criterionId: string) => {
    if (!managingChecklistStandard) return;
    try {
      const { adminApi } = await import("@/lib/api");
      await adminApi.deleteCriterion(criterionId);
      
      const res = await adminApi.listStandards();
      const all = res.data.data || [];
      const updated = all.find((s: any) => s.id === managingChecklistStandard.id);
      if (updated) setManagingChecklistStandard(updated);

      loadStandards();
      toast.success("Criterion removed");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove criterion");
    }
  };

  // Render Helpers
  const renderStandard = (p: Standard, Icon: any) => (
    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200 transition-colors hover:bg-slate-100 group">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-admin-text shrink-0" />
        <div>
          <span className="text-sm font-medium text-slate-700">{p.name} <span className="text-slate-400 font-normal ml-1">{p.version}</span></span>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{p.criteria?.length || 0} Criteria</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-white text-admin-text border border-slate-200 text-xs font-medium">Active</Badge>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors focus:outline-none">
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setManagingChecklistStandard(p)}>
              <ListChecks className="mr-2 h-4 w-4" /> Manage Checklist
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEditStandard(p)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => setStandardToDelete(p)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Standard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  // Group Criteria for the active builder
  const builderCriteriaGroups = managingChecklistStandard?.criteria?.reduce((groups, item) => {
    if (!groups[item.section]) groups[item.section] = [];
    groups[item.section].push(item);
    return groups;
  }, {} as Record<string, StandardCriterion[]>) || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Certification Standards</h1>
          <p className="text-slate-600 font-medium text-sm mt-1">Define and update the standards and checklists for AAHAR certification.</p>
        </div>

        <Button onClick={openNewStandard} className="bg-admin-primary text-white shadow-sm rounded-md px-6 hover:bg-admin-hover font-medium">
          <Plus className="h-4 w-4 mr-2" /> New Standard
        </Button>
      </div>

      {/* Checklist Builder Dialog */}
      <Dialog open={!!managingChecklistStandard} onOpenChange={(open) => !open && setManagingChecklistStandard(null)}>
        <DialogContent className="sm:max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden bg-white gap-0 border-slate-200">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2 text-slate-800">
                <ListChecks className="h-5 w-5 text-admin-primary" />
                Checklist Builder: {managingChecklistStandard?.name}
              </DialogTitle>
              <DialogDescription>
                Define the specific sections, criteria, and scoring weights that auditors will use when evaluating this standard.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
            {/* Left side: Form */}
            <div className="w-full md:w-[350px] border-r border-slate-200 p-6 bg-white overflow-y-auto flex-shrink-0">
              <h3 className="font-semibold text-slate-800 mb-6 uppercase tracking-wider text-[11px]">Add New Criterion</h3>
              <Form {...criterionForm}>
                <form onSubmit={criterionForm.handleSubmit(onCriterionSubmit)} className="space-y-6">
                  <FormField
                    control={criterionForm.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MaterialInput label="Section Name" placeholder="e.g. Food Storage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={criterionForm.control}
                    name="criterion"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <textarea
                              id="criterion"
                              className="block px-4 pb-2.5 pt-6 w-full text-sm text-aahar-dark bg-transparent rounded-xl border border-aahar-border appearance-none focus:outline-none focus:ring-0 focus:border-aahar-teal peer transition-colors resize-none min-h-[120px]"
                              placeholder=" "
                              {...field}
                            />
                            <label
                              htmlFor="criterion"
                              className="absolute text-sm text-aahar-body/70 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-aahar-teal peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-6 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2 font-medium cursor-text"
                            >
                              Criterion Description
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={criterionForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Scoring Weight (1-5)</label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map(w => (
                                <button
                                  key={w}
                                  type="button"
                                  onClick={() => field.onChange(w)}
                                  className={`flex-1 py-2 rounded-md text-sm font-semibold border transition-colors ${field.value === w ? 'bg-admin-primary text-white border-admin-primary shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                  {w}
                                </button>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-admin-primary hover:bg-admin-hover text-white font-medium">
                    Add Criterion
                  </Button>
                </form>
              </Form>
            </div>

            {/* Right side: List */}
            <div className="w-full flex-1 p-6 bg-slate-50 overflow-y-auto">
              <h3 className="font-semibold text-slate-800 mb-6 uppercase tracking-wider text-[11px]">Current Checklist Structure</h3>
              
              {Object.keys(builderCriteriaGroups).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <ListChecks className="h-8 w-8 mb-3 opacity-50" />
                  <p className="text-sm font-medium">No criteria defined yet.</p>
                  <p className="text-xs">Add criteria from the left panel to build the checklist.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(builderCriteriaGroups).map(([section, items]) => (
                    <div key={section} className="space-y-3">
                      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                        <div className="w-2 h-2 rounded-full bg-admin-primary" />
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{section}</h4>
                        <span className="text-[10px] font-semibold text-slate-400 ml-auto">{items.length} Items</span>
                      </div>
                      
                      <div className="grid gap-2 pl-5">
                        {items.map((item, idx) => (
                          <div key={item.id} className="group flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-colors">
                            <div className="mt-0.5 text-xs font-bold text-slate-400 w-5">{idx + 1}.</div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700 leading-snug">{item.criterion}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 font-semibold border-slate-200">
                                Wt: {item.weight}
                              </Badge>
                              <button 
                                onClick={() => deleteCriterion(item.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                                title="Remove Criterion"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Standard Dialog */}
      <Dialog open={isStandardModalOpen} onOpenChange={setIsStandardModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingStandard ? "Edit Standard Details" : "Create New Standard"}</DialogTitle>
            <DialogDescription>
              {editingStandard ? "Modify the identity of the standard below." : "Add a new standard for certification. This will be immediately active."}
            </DialogDescription>
          </DialogHeader>
          <Form {...standardForm}>
            <form onSubmit={standardForm.handleSubmit(onStandardSubmit)} className="space-y-5 pt-2">
              <FormField
                control={standardForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MaterialInput label="Standard Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={standardForm.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MaterialInput label="Version (e.g. v1.0)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={standardForm.control}
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="!h-[54px] rounded-xl border-aahar-border focus:ring-0 focus:border-aahar-teal px-4 pt-6 pb-2.5 text-base">
                            <SelectValue placeholder="Select Division" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fnb">F&B Division</SelectItem>
                            <SelectItem value="accommodation">Accommodation</SelectItem>
                          </SelectContent>
                        </Select>
                        <label className="absolute text-sm text-aahar-body/70 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 left-2 font-medium pointer-events-none">
                          Division
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="bg-transparent border-none p-0 -mx-0 -mb-0 pt-4 sm:justify-end mt-2">
                <Button type="button" variant="outline" onClick={() => setIsStandardModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-admin-primary hover:bg-admin-hover text-white">
                  {editingStandard ? "Save Changes" : "Create Standard"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!standardToDelete} onOpenChange={(open) => !open && setStandardToDelete(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Standard</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-semibold text-slate-900">{standardToDelete?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent border-none p-0 -mx-0 -mb-0 pt-4 sm:justify-end mt-2">
            <Button type="button" variant="outline" onClick={() => setStandardToDelete(null)}>Cancel</Button>
            <Button type="button" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* F&B Standards */}
        <Card className="p-6 rounded-lg border-0 shadow-md bg-white flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-admin-light rounded-lg text-admin-text shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">F&B Division</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Restaurants & Dining</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1 mb-6">
            {fnbStandards.map(s => renderStandard(s, FileText))}
          </div>

          {fnbHandbook && (
            <div className="mb-4 p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Handbook</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm font-bold text-slate-800">{fnbHandbook.version}</p>
                  {fnbHandbook.releaseNotes && (
                     <span className="text-xs text-slate-500 truncate max-w-[120px]" title={fnbHandbook.releaseNotes}>- {fnbHandbook.releaseNotes}</span>
                  )}
                </div>
              </div>
              <Button type="button" onClick={() => window.open(fnbHandbook.url, "_blank")} variant="outline" size="sm" className="h-8 text-xs font-semibold bg-white">
                View PDF
              </Button>
            </div>
          )}

          {/* Update F&B Handbook Dialog */}
          <Dialog open={isFnbHandbookModalOpen} onOpenChange={setIsFnbHandbookModalOpen}>
            <Button onClick={() => setIsFnbHandbookModalOpen(true)} type="button" variant="outline" className="w-full rounded-md font-medium text-sm border-slate-200 mt-auto">
              Update F&B Handbook
            </Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update F&B Handbook</DialogTitle>
                <DialogDescription>
                  Deploy a new version of the F&B Handbook to all active restaurants.
                </DialogDescription>
              </DialogHeader>
              <Form {...fnbHandbookForm}>
                <form onSubmit={fnbHandbookForm.handleSubmit((data) => onHandbookSubmit(data, "fnb"))} className="space-y-5 pt-2">
                  <FormField
                    control={fnbHandbookForm.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MaterialInput label="New Version (e.g. v2.5)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={fnbHandbookForm.control}
                    name="releaseNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <textarea
                              id="fnb-notes"
                              className="block px-4 pb-2.5 pt-6 w-full text-base text-aahar-dark bg-transparent rounded-xl border border-aahar-border appearance-none focus:outline-none focus:ring-0 focus:border-aahar-teal peer transition-colors resize-none min-h-[100px]"
                              placeholder=" "
                              {...field}
                            />
                            <label
                              htmlFor="fnb-notes"
                              className="absolute text-sm text-aahar-body/70 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-aahar-teal peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-6 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2 font-medium cursor-text"
                            >
                              Release Notes
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                    <div className="h-10 w-10 rounded-full bg-admin-primary/10 flex items-center justify-center shrink-0">
                      <Upload className="h-5 w-5 text-admin-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">Upload Handbook File</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{fnbFile ? fnbFile.name : "Select a PDF file (Max 20MB)"}</p>
                    </div>
                    <div className="relative shrink-0">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={(e) => setFnbFile(e.target.files?.[0] || null)} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      <Button type="button" variant="outline" className="border-slate-300 text-xs font-semibold rounded-md pointer-events-none">
                        {fnbFile ? "Change File" : "Browse"}
                      </Button>
                    </div>
                  </div>
                  <DialogFooter className="bg-transparent border-none p-0 -mx-0 -mb-0 pt-4 sm:justify-end mt-2">
                    <Button type="button" variant="outline" onClick={() => setIsFnbHandbookModalOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-admin-primary hover:bg-admin-hover text-white">Update</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </Card>

        {/* Accommodation Standards */}
        <Card className="p-6 rounded-lg border-0 shadow-md bg-white flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-admin-light rounded-lg text-admin-text shrink-0">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Hotels & Stays</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Accommodation Services</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1 mb-6">
            {accStandards.map(s => renderStandard(s, Lock))}
          </div>

          {accHandbook && (
            <div className="mb-4 p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Handbook</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm font-bold text-slate-800">{accHandbook.version}</p>
                  {accHandbook.releaseNotes && (
                     <span className="text-xs text-slate-500 truncate max-w-[120px]" title={accHandbook.releaseNotes}>- {accHandbook.releaseNotes}</span>
                  )}
                </div>
              </div>
              <Button type="button" onClick={() => window.open(accHandbook.url, "_blank")} variant="outline" size="sm" className="h-8 text-xs font-semibold bg-white">
                View PDF
              </Button>
            </div>
          )}

          {/* Update Stay Handbook Dialog */}
          <Dialog open={isAccHandbookModalOpen} onOpenChange={setIsAccHandbookModalOpen}>
            <Button onClick={() => setIsAccHandbookModalOpen(true)} type="button" variant="outline" className="w-full rounded-md font-medium text-sm border-slate-200 mt-auto">
              Update Stay Handbook
            </Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update Stay Handbook</DialogTitle>
                <DialogDescription>
                  Deploy a new version of the Accommodation Handbook to all active hotels.
                </DialogDescription>
              </DialogHeader>
              <Form {...accHandbookForm}>
                <form onSubmit={accHandbookForm.handleSubmit((data) => onHandbookSubmit(data, "accommodation"))} className="space-y-5 pt-2">
                  <FormField
                    control={accHandbookForm.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MaterialInput label="New Version (e.g. v3.2)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accHandbookForm.control}
                    name="releaseNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <textarea
                              id="acc-notes"
                              className="block px-4 pb-2.5 pt-6 w-full text-base text-aahar-dark bg-transparent rounded-xl border border-aahar-border appearance-none focus:outline-none focus:ring-0 focus:border-aahar-teal peer transition-colors resize-none min-h-[100px]"
                              placeholder=" "
                              {...field}
                            />
                            <label
                              htmlFor="acc-notes"
                              className="absolute text-sm text-aahar-body/70 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-aahar-teal peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-6 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2 font-medium cursor-text"
                            >
                              Release Notes
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                    <div className="h-10 w-10 rounded-full bg-admin-primary/10 flex items-center justify-center shrink-0">
                      <Upload className="h-5 w-5 text-admin-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">Upload Handbook File</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{accFile ? accFile.name : "Select a PDF file (Max 20MB)"}</p>
                    </div>
                    <div className="relative shrink-0">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={(e) => setAccFile(e.target.files?.[0] || null)} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      <Button type="button" variant="outline" className="border-slate-300 text-xs font-semibold rounded-md pointer-events-none">
                        {accFile ? "Change File" : "Browse"}
                      </Button>
                    </div>
                  </div>
                  <DialogFooter className="bg-transparent border-none p-0 -mx-0 -mb-0 pt-4 sm:justify-end mt-2">
                    <Button type="button" variant="outline" onClick={() => setIsAccHandbookModalOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-admin-primary hover:bg-admin-hover text-white">Update</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </Card>
      </div>


    </div>
  );
}
