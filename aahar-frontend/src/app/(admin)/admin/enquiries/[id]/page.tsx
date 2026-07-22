"use client";

import { useState, useEffect } from "react";
import { leadApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, CheckCircle2 } from "lucide-react";
import { 
  Building, 
  User, 
  ArrowLeft, 
  MapPin,
  Phone,
  Mail,
  Clock,
  Trash2,
  Pencil,
  Building2,
  UserCircle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminEnquiryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [lead, setLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  const fetchLead = async () => {
    try {
      const res = await leadApi.get(params.id);
      setLead(res.data.data);
      setEditForm(res.data.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load lead details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await leadApi.updateStatus(params.id, newStatus);
      setLead({ ...lead, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleEditSubmit = async () => {
    setUpdating(true);
    try {
      const res = await leadApi.update(params.id, editForm);
      setLead(res.data.data);
      setEditOpen(false);
      toast.success("Lead details updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update lead");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setUpdating(true);
    try {
      await leadApi.delete(params.id);
      toast.success("Lead deleted successfully");
      router.push("/admin/enquiries");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete lead");
      setUpdating(false);
    }
  };

  const handleConvert = async () => {
    setUpdating(true);
    try {
      const res = await leadApi.convert(params.id);
      setCredentials(res.data.data.credentials);
      setCredentialsOpen(true);
      toast.success(res.data.message || "Lead converted successfully");
      fetchLead();
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "Failed to convert lead");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-500 font-medium">Loading lead details...</div>;
  if (!lead) return <div className="p-20 text-center text-slate-500 font-medium">Lead not found</div>;

  const isCertification = lead.enquiryType === "get_certified";

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/admin/enquiries" className="text-sm font-semibold text-admin-primary flex items-center gap-2 hover:text-admin-hover transition-colors">
          <ArrowLeft className="h-4 w-4" /> BACK TO ENQUIRIES
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 bg-white shadow-sm border-slate-200 text-slate-500 rounded-lg text-xs font-medium">
            <Clock className="w-3.5 h-3.5 mr-1.5 inline" />
            Received {format(new Date(lead.createdAt), "dd MMM yyyy, HH:mm")}
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)} className="h-8 w-8 rounded-md text-slate-500 hover:text-admin-primary hover:bg-admin-light transition-colors">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)} className="h-8 w-8 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <Card className="flex flex-col md:flex-row gap-8 items-start justify-between bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-admin-light/40 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Badge className={cn(
              "border-0 px-3 py-1 shadow-sm font-semibold tracking-wide text-xs",
              isCertification ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
            )}>
              {isCertification ? "Certification Request" : "Business Listing"}
            </Badge>
            <Badge variant="outline" className="uppercase text-[10px] tracking-widest bg-white border-slate-200 text-slate-500 font-bold px-2 py-1">
              {lead.entityType}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">{lead.entityName}</h1>
          <p className="text-slate-500 flex items-center gap-2 font-medium">
            <MapPin className="w-4 h-4 text-slate-400" />
            {lead.location}, {lead.city}, {lead.state}
          </p>
        </div>
        
        <div className="relative z-10 bg-slate-50 p-6 rounded-xl border border-slate-200 min-w-[280px] w-full md:w-auto flex flex-col gap-4 shadow-sm">
          <div>
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Lead Status</Label>
            <Select value={lead.status} onValueChange={handleStatusChange} disabled={updating || lead.status === "converted"}>
              <SelectTrigger className="w-full bg-white font-semibold text-slate-800 shadow-sm border-slate-200 h-11 rounded-lg focus:ring-admin-primary">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending" className="font-semibold text-amber-600">Pending</SelectItem>
                <SelectItem value="contacted" className="font-semibold text-blue-600">Contacted</SelectItem>
                <SelectItem value="converted" className="font-semibold text-emerald-600" disabled>Converted</SelectItem>
                <SelectItem value="rejected" className="font-semibold text-rose-600">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {lead.status !== "converted" && lead.status !== "rejected" && (
            <Button 
              onClick={handleConvert}
              disabled={updating}
              className="w-full h-11 bg-admin-primary hover:bg-admin-hover text-white shadow-md font-semibold tracking-wide"
            >
              {updating ? "Processing..." : isCertification ? "Approve & Provision App" : "Approve & Provision Listing"}
            </Button>
          )}
          {lead.status === "converted" && (
            <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-xs font-bold uppercase tracking-widest">
              <CheckCircle2 className="h-4 w-4" />
              Business Provisioned
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Business Details Card */}
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <CardTitle className="text-lg font-semibold flex items-center gap-3 text-slate-800">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-admin-primary">
                <Building className="w-5 h-5" />
              </div>
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Business Name</p>
                <p className="text-sm font-semibold text-slate-800">{lead.entityName}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Type</p>
                <p className="text-sm font-semibold text-slate-800 capitalize">{lead.entityType}</p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 space-y-1.5">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Full Address</p>
              <p className="text-sm font-medium text-slate-700 leading-relaxed max-w-sm">{lead.address}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-y-8 gap-x-6 pt-6 border-t border-slate-100">
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Location / Area</p>
                <p className="text-sm font-semibold text-slate-800">{lead.location}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">City</p>
                <p className="text-sm font-semibold text-slate-800">{lead.city}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">District</p>
                <p className="text-sm font-semibold text-slate-800">{lead.district}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">State</p>
                <p className="text-sm font-semibold text-slate-800">{lead.state}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applicant Details Card */}
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-300 h-fit">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <CardTitle className="text-lg font-semibold flex items-center gap-3 text-slate-800">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-admin-primary">
                <User className="w-5 h-5" />
              </div>
              Applicant Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-admin-primary text-white flex items-center justify-center font-bold text-2xl shadow-inner">
                {lead.applicantName.charAt(0)}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Primary Contact</p>
                <p className="text-lg font-bold text-slate-800">{lead.applicantName}</p>
              </div>
            </div>
            
            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-admin-light group-hover:text-admin-primary group-hover:border-admin-primary/20 transition-all shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Email Address</p>
                  <a href={`mailto:${lead.email}`} className="text-sm font-semibold text-admin-primary hover:underline">{lead.email}</a>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-admin-light group-hover:text-admin-primary group-hover:border-admin-primary/20 transition-all shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Primary Phone</p>
                  <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-slate-800 hover:text-admin-primary">{lead.phone}</a>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-admin-light group-hover:text-admin-primary group-hover:border-admin-primary/20 transition-all shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Secondary Phone</p>
                  {lead.secondaryPhone ? (
                    <a href={`tel:${lead.secondaryPhone}`} className="text-sm font-semibold text-slate-800 hover:text-admin-primary">{lead.secondaryPhone}</a>
                  ) : (
                    <p className="text-sm font-medium text-slate-400 italic">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl bg-white rounded-2xl p-0 overflow-hidden border-slate-200 shadow-xl">
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">Edit Lead Information</DialogTitle>
            <p className="text-sm font-medium text-slate-500 mt-1">Update the official details for this business enquiry.</p>
          </div>
          
          <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar space-y-8">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-admin-primary mb-4">
                <Building2 className="w-4 h-4" /> Business Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Enquiry Type</Label>
                  <Select value={editForm.enquiryType} onValueChange={v => setEditForm({...editForm, enquiryType: v})}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list_business">Business Listing</SelectItem>
                      <SelectItem value="get_certified">Certification Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Entity Type</Label>
                  <Select value={editForm.entityType} onValueChange={v => setEditForm({...editForm, entityType: v})}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm capitalize">
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Business Name</Label>
                  <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={editForm.entityName} onChange={e => setEditForm({...editForm, entityName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Location / Area</Label>
                  <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Address</Label>
                  <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">City</Label>
                  <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">District</Label>
                  <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={editForm.district} onChange={e => setEditForm({...editForm, district: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">State</Label>
                  <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-admin-primary mb-4">
                <UserCircle className="w-4 h-4" /> Applicant Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Primary Contact Name</Label>
                  <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={editForm.applicantName} onChange={e => setEditForm({...editForm, applicantName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</Label>
                  <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Primary Phone</Label>
                  <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Secondary Phone</Label>
                  <Input className="h-11 bg-white border-slate-200 rounded-lg font-medium shadow-sm" value={editForm.secondaryPhone || ""} onChange={e => setEditForm({...editForm, secondaryPhone: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-8 py-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <Button variant="outline" className="h-10 px-6 rounded-lg font-semibold text-slate-600 border-slate-300" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="h-10 px-8 rounded-lg font-semibold bg-admin-primary hover:bg-admin-hover text-white shadow-sm" onClick={handleEditSubmit} disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-rose-600">Delete Lead</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600 font-medium">
            Are you sure you want to permanently delete this lead? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleDelete} disabled={updating}>
              {updating ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" /> Provisioning Complete
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm font-medium text-slate-600">
              The business and user account have been successfully generated. Please relay these temporary credentials to the applicant securely.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1.5">Owner Email</p>
                <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-md">
                  <span className="text-sm font-semibold text-slate-900">{credentials?.email}</span>
                  <button onClick={() => { navigator.clipboard.writeText(credentials?.email); toast.success("Copied email"); }} className="text-slate-400 hover:text-admin-primary transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1.5">Temporary Password</p>
                <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-md">
                  <span className="text-sm font-semibold text-slate-900">{credentials?.password}</span>
                  <button onClick={() => { navigator.clipboard.writeText(credentials?.password); toast.success("Copied password"); }} className="text-slate-400 hover:text-admin-primary transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-amber-600 font-medium italic mt-2">
              * The owner will be prompted to change this password on their first login.
            </p>
          </div>
          <DialogFooter>
            <Button className="bg-admin-primary hover:bg-admin-hover text-white w-full h-10 rounded-lg font-semibold" onClick={() => setCredentialsOpen(false)}>
              Acknowledge & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
