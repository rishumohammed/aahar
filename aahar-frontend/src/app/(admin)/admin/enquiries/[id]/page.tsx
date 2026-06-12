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

  if (loading) return <div className="p-20 text-center text-slate-500">Loading lead details...</div>;
  if (!lead) return <div className="p-20 text-center text-slate-500">Lead not found</div>;

  const isCertification = lead.enquiryType === "get_certified";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="mb-2 flex items-center justify-between">
        <Link href="/admin/enquiries" className="text-sm font-bold text-admin-primary flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Enquiries
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white shadow-sm border-slate-200 text-slate-600 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            Received {format(new Date(lead.createdAt), "dd MMM yyyy, HH:mm")}
          </Badge>
          <Button variant="outline" size="icon" onClick={() => setEditOpen(true)} className="h-7 w-7 rounded-full bg-white text-slate-600 border-slate-200 hover:text-admin-primary">
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setDeleteOpen(true)} className="h-7 w-7 rounded-full bg-white text-slate-600 border-slate-200 hover:text-red-600">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge className={isCertification ? "bg-purple-50 text-purple-700 hover:bg-purple-100 border-0" : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-0"}>
              {isCertification ? "Certification Request" : "Business Listing"}
            </Badge>
            <Badge variant="outline" className="uppercase text-[10px] tracking-widest bg-slate-50 border-slate-200 text-slate-600 font-bold">
              {lead.entityType}
            </Badge>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{lead.entityName}</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2 font-medium">
            <MapPin className="w-4 h-4" />
            {lead.location}, {lead.city}, {lead.state}
          </p>
        </div>
        
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-w-[250px] w-full md:w-auto flex flex-col gap-3">
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Lead Status</p>
            <Select value={lead.status} onValueChange={handleStatusChange} disabled={updating || lead.status === "converted"}>
              <SelectTrigger className="w-full bg-white font-bold text-slate-900 shadow-sm border-slate-200 h-10 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending" className="font-semibold text-amber-600">Pending</SelectItem>
                <SelectItem value="contacted" className="font-semibold text-blue-600">Contacted</SelectItem>
                <SelectItem value="converted" className="font-semibold text-emerald-600" disabled>Converted</SelectItem>
                <SelectItem value="rejected" className="font-semibold text-red-600">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {lead.status !== "converted" && lead.status !== "rejected" && (
            <Button 
              onClick={handleConvert}
              disabled={updating}
              className="w-full mt-2 bg-admin-primary hover:bg-admin-hover text-white shadow-md font-bold uppercase tracking-widest text-[10px]"
            >
              {updating ? "Processing..." : isCertification ? "Approve & Provision App" : "Approve & Provision Listing"}
            </Button>
          )}
          {lead.status === "converted" && (
            <div className="text-center p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
              Business Provisioned
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Details Card */}
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 px-6 pt-6">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-admin-light flex items-center justify-center text-admin-primary">
                <Building className="w-4 h-4" />
              </div>
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Business Name</p>
                <p className="text-sm font-semibold text-slate-900">{lead.entityName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Type</p>
                <p className="text-sm font-semibold text-slate-900 capitalize">{lead.entityType}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Full Address</p>
              <p className="text-sm font-medium text-slate-900 leading-relaxed max-w-sm">{lead.address}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Location / Area</p>
                <p className="text-sm font-semibold text-slate-900">{lead.location}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">City</p>
                <p className="text-sm font-semibold text-slate-900">{lead.city}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">District</p>
                <p className="text-sm font-semibold text-slate-900">{lead.district}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">State</p>
                <p className="text-sm font-semibold text-slate-900">{lead.state}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applicant Details Card */}
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white h-fit">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 px-6 pt-6">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-admin-light flex items-center justify-center text-admin-primary">
                <User className="w-4 h-4" />
              </div>
              Applicant Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-admin-primary text-white flex items-center justify-center font-black text-xl shadow-inner">
                {lead.applicantName.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Primary Contact</p>
                <p className="text-lg font-black text-slate-900">{lead.applicantName}</p>
              </div>
            </div>
            
            <div className="space-y-5 pt-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Email Address</p>
                  <a href={`mailto:${lead.email}`} className="text-sm font-semibold text-admin-primary hover:underline">{lead.email}</a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Primary Phone</p>
                  <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-slate-900 hover:text-admin-primary">{lead.phone}</a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Secondary Phone</p>
                  {lead.secondaryPhone ? (
                    <a href={`tel:${lead.secondaryPhone}`} className="text-sm font-semibold text-slate-900 hover:text-admin-primary">{lead.secondaryPhone}</a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-400 italic">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl bg-white rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-slate-50/80 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Edit Lead Information</DialogTitle>
              <p className="text-sm font-medium text-slate-500 mt-1">Update the official details for this business enquiry.</p>
            </div>
          </div>
          
          <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar space-y-8">
            {/* Business Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-admin-primary mb-4">
                <Building2 className="w-4 h-4" /> Business Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Enquiry Type</Label>
                  <Select value={editForm.enquiryType} onValueChange={v => setEditForm({...editForm, enquiryType: v})}>
                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-semibold">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list_business">Business Listing</SelectItem>
                      <SelectItem value="get_certified">Certification Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Entity Type</Label>
                  <Select value={editForm.entityType} onValueChange={v => setEditForm({...editForm, entityType: v})}>
                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-semibold capitalize">
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Business Name</Label>
                  <Input className="h-12 bg-slate-50 border-slate-200 rounded-xl font-semibold" value={editForm.entityName} onChange={e => setEditForm({...editForm, entityName: e.target.value})} />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Location / Area</Label>
                  <Input className="h-12 bg-slate-50 border-slate-200 rounded-xl font-semibold" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} />
                </div>
                <div className="space-y-2.5 md:col-span-2">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Full Address</Label>
                  <Input className="h-12 bg-slate-50 border-slate-200 rounded-xl font-semibold" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase">City</Label>
                  <Input className="h-12 bg-slate-50 border-slate-200 rounded-xl font-semibold" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase">District</Label>
                  <Input className="h-12 bg-slate-50 border-slate-200 rounded-xl font-semibold" value={editForm.district} onChange={e => setEditForm({...editForm, district: e.target.value})} />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase">State</Label>
                  <Input className="h-12 bg-slate-50 border-slate-200 rounded-xl font-semibold" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Applicant Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-admin-primary mb-4">
                <UserCircle className="w-4 h-4" /> Applicant Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Primary Contact Name</Label>
                  <Input className="h-12 bg-slate-50 border-slate-200 rounded-xl font-semibold" value={editForm.applicantName} onChange={e => setEditForm({...editForm, applicantName: e.target.value})} />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Email Address</Label>
                  <Input className="h-12 bg-slate-50 border-slate-200 rounded-xl font-semibold" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Primary Phone</Label>
                  <Input className="h-12 bg-slate-50 border-slate-200 rounded-xl font-semibold" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Secondary Phone</Label>
                  <Input className="h-12 bg-slate-50 border-slate-200 rounded-xl font-semibold" value={editForm.secondaryPhone || ""} onChange={e => setEditForm({...editForm, secondaryPhone: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
            <Button variant="outline" className="h-12 px-6 rounded-xl font-bold text-slate-600 border-slate-200" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="h-12 px-8 rounded-xl font-bold bg-admin-primary hover:bg-admin-hover text-white shadow-md shadow-admin-primary/20" onClick={handleEditSubmit} disabled={updating}>
              {updating ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-red-600">Delete Lead</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600 font-medium">
            Are you sure you want to permanently delete this lead? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={updating}>
              {updating ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" /> Provisioning Complete
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm font-medium text-slate-600">
              The business and user account have been successfully generated. Please relay these temporary credentials to the applicant securely.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Owner Email</p>
                <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                  <span className="text-sm font-bold text-slate-900">{credentials?.email}</span>
                  <button onClick={() => { navigator.clipboard.writeText(credentials?.email); toast.success("Copied email"); }} className="text-slate-400 hover:text-admin-primary">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Temporary Password</p>
                <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                  <span className="text-sm font-bold text-slate-900">{credentials?.password}</span>
                  <button onClick={() => { navigator.clipboard.writeText(credentials?.password); toast.success("Copied password"); }} className="text-slate-400 hover:text-admin-primary">
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
            <Button className="bg-admin-primary hover:bg-admin-hover text-white w-full" onClick={() => setCredentialsOpen(false)}>
              Acknowledge & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
