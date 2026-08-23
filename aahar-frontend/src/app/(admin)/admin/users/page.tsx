"use client";

import { useEffect, useState } from "react";
import { adminApi, authApi } from "@/lib/api";
import { 
  User, 
  Search, 
  Filter, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  MoreVertical, 
  Loader2, 
  X, 
  Power, 
  PowerOff, 
  Pencil, 
  Trash2, 
  Building2, 
  Eye, 
  Key,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ROLE_BADGE: Record<string, string> = {
  super_admin: "bg-teal-50 text-teal-700 border border-teal-200",
  admin: "bg-admin-light text-admin-text border border-admin-border",
  auditor: "bg-amber-50 text-amber-700 border border-amber-200",
  owner: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  hotel_manager: "bg-teal-50 text-teal-700 border border-teal-200",
  consumer: "bg-slate-100 text-slate-700 border border-slate-200",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [activeSection, setActiveSection] = useState<"system" | "establishment">("system");
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // Reset Password State
  const [showResetModal, setShowResetModal] = useState(false);
  const [userToReset, setUserToReset] = useState<any>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("Admin@123");
  const [copied, setCopied] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", role: "consumer"
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.users({ role: role || undefined, limit: 100 });
      setUsers(res.data.data.items ?? res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [role]);

  const handleDeactivate = async (userId: string, isActive: boolean) => {
    if (!confirm(`${isActive ? "Deactivate" : "Reactivate"} this user?`)) return;
    await adminApi.updateUser(userId, { isActive: !isActive });
    load();
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", phone: "", password: "", role: activeSection === "system" ? "auditor" : "consumer" });
    setShowUserModal(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "", // Leave blank on edit
      role: user.role || "consumer",
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email || !formData.role) return;
    if (!editingUser && !formData.password) {
      alert("Password is required for new users");
      return;
    }
    
    setSaving(true);
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        });
      } else {
        await authApi.register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role
        });
      }
      setShowUserModal(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (user: any) => {
    setUserToDelete(user);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (deleteConfirmText !== "DELETE") return;
    if (!userToDelete) return;
    
    setSaving(true);
    try {
      await adminApi.deleteUser(userToDelete.id);
      setShowDeleteModal(false);
      load();
      alert("User deleted successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenResetModal = (user: any) => {
    setUserToReset(user);
    setNewPasswordInput("Admin@123");
    setCopied(false);
    setResetSuccess(false);
    setShowResetModal(true);
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(pass);
  };

  const confirmResetPassword = async () => {
    if (!userToReset) return;
    if (!newPasswordInput || newPasswordInput.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setSaving(true);
    try {
      await adminApi.resetPassword(userToReset.id, newPasswordInput);
      setResetSuccess(true);
      toast.success(`Password for ${userToReset.name} has been reset successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setSaving(false);
    }
  };

  const copyCredentials = () => {
    if (!userToReset) return;
    const originUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const text = `AAHAR Platform Credentials:\nEmail: ${userToReset.email}\nPassword: ${newPasswordInput}\nLogin URL: ${originUrl}/auth/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const filtered = users.filter(u => {
    // Search match
    if (search) {
      const match = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
      if (!match) return false;
    }
    
    // Section match
    const systemRoles = ["super_admin", "admin", "auditor"];
    const isSystemRole = systemRoles.includes(u.role);
    
    if (activeSection === "system" && !isSystemRole) return false;
    if (activeSection === "establishment" && isSystemRole) return false;

    return true;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Registry</h1>
          <p className="text-slate-600 font-medium text-sm">{filtered.length} active platform stakeholders in this segment.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-admin-primary text-white hover:bg-admin-hover font-semibold rounded-xl flex items-center gap-2 px-6 py-2.5 shadow-sm transition-all">
          <UserPlus className="h-5 w-5" /> Add User
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          className={cn("px-6 py-4 text-sm font-bold border-b-2 transition-colors tracking-wide", activeSection === "system" ? "border-admin-primary text-admin-primary" : "border-transparent text-slate-500 hover:text-slate-700")}
          onClick={() => { setActiveSection("system"); setRole(""); }}
        >
          System Users
        </button>
        <button
          className={cn("px-6 py-4 text-sm font-bold border-b-2 transition-colors tracking-wide", activeSection === "establishment" ? "border-admin-primary text-admin-primary" : "border-transparent text-slate-500 hover:text-slate-700")}
          onClick={() => { setActiveSection("establishment"); setRole(""); }}
        >
          Establishment Users
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            className="w-full pl-12 pr-4 h-11 text-sm bg-slate-50 rounded-xl border-slate-200 focus:ring-2 focus:ring-admin-primary transition-all outline-none" 
            placeholder="Search by name or email identity..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select 
            className="w-full pl-10 pr-8 h-11 appearance-none font-semibold text-slate-700 text-sm bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-admin-primary transition-all shadow-sm cursor-pointer" 
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="">{activeSection === "system" ? "All System Roles" : "All Establishment Roles"}</option>
            {activeSection === "system" ? (
              <>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Platform Admin</option>
                <option value="auditor">Regional Auditor</option>
              </>
            ) : (
              <>
                <option value="owner">Business Owner</option>
                <option value="hotel_manager">Hotel Manager</option>
                <option value="consumer">End Consumer</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Registry Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-8 py-4">Identity</th>
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-8 py-4">Role & Access</th>
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-8 py-4">Platform Status</th>
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-8 py-4">Registry Date</th>
                <th className="text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6">
                      <div className="h-12 bg-slate-100 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-24 text-slate-500">
                    <User className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="font-medium text-lg">No users found in this segment.</p>
                  </td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user.id} className={cn("group transition-all duration-200 hover:bg-slate-50/80", !user.isActive && "opacity-60")}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-admin-light flex items-center justify-center text-admin-primary font-bold text-sm shrink-0 border border-admin-border shadow-sm">
                        {user.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={cn("px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border-0", ROLE_BADGE[user.role] ?? "bg-slate-100 text-slate-700")}>
                      {user.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", user.isActive ? "bg-emerald-500" : "bg-rose-500")} />
                      <span className={cn("text-xs font-bold uppercase tracking-wide", user.isActive ? "text-emerald-700" : "text-rose-700")}>
                        {user.isActive ? "Authorized" : "Revoked"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-800">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingUser(user)}
                        className="p-2 rounded-xl text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 transition-all shadow-sm active:scale-95"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {["owner", "hotel_manager"].includes(user.role) && (
                        <Link href={`/admin/users/${user.id}/establishments`}>
                          <button 
                            className="p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all shadow-sm active:scale-95 flex items-center gap-1"
                            title="View Establishments"
                          >
                            <Building2 className="h-4 w-4" />
                            <span className="text-[10px] font-bold">{(user.restaurants?.length || 0) + (user.hotels?.length || 0)}</span>
                          </button>
                        </Link>
                      )}
                      
                      <button 
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 rounded-xl text-admin-text bg-slate-100 hover:bg-admin-primary hover:text-white transition-all shadow-sm active:scale-95"
                        title="Edit User"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button 
                        onClick={() => handleOpenResetModal(user)}
                        className="p-2 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Reset Password"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      
                      {!["super_admin", "admin"].includes(user.role) && (
                        <button 
                          onClick={() => handleDeactivate(user.id, user.isActive)}
                          className={cn(
                            "p-2 rounded-xl transition-all shadow-sm active:scale-95",
                            user.isActive 
                              ? "text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white" 
                              : "text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white"
                          )}
                          title={user.isActive ? "Revoke Access" : "Authorize Access"}
                        >
                          {user.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </button>
                      )}

                        {!["super_admin"].includes(user.role) && (
                          <button 
                            onClick={() => openDeleteModal(user)}
                            className="p-2 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-sm active:scale-95"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowUserModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setShowUserModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="w-12 h-12 bg-admin-light border border-admin-border rounded-2xl flex items-center justify-center text-admin-primary mb-4 shadow-sm">
                  {editingUser ? <Pencil className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{editingUser ? "Edit User" : "Add New User"}</h2>
                <p className="text-sm font-medium text-slate-500">{editingUser ? "Update user details and permissions." : "Authorize a new platform stakeholder."}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
                  <input className="w-full px-4 h-11 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-admin-primary outline-none transition-all" placeholder="Legal name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                  <input className="w-full px-4 h-11 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-admin-primary outline-none transition-all" type="email" placeholder="email@example.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Phone</label>
                    <input className="w-full px-4 h-11 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-admin-primary outline-none transition-all" placeholder="+91..." value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Role</label>
                    <select className="w-full px-4 h-11 text-sm font-semibold bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-admin-primary outline-none transition-all cursor-pointer" value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Platform Admin</option>
                      <option value="auditor">Regional Auditor</option>
                      <option value="owner">Business Owner</option>
                      <option value="manager">Hotel Manager</option>
                      <option value="consumer">End Consumer</option>
                    </select>
                  </div>
                </div>
                {!editingUser && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Initial Password</label>
                    <input className="w-full px-4 h-11 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-admin-primary outline-none transition-all" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveUser} disabled={saving} className="bg-admin-primary text-white hover:bg-admin-hover font-semibold rounded-xl h-11 flex-1 shadow-sm">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (editingUser ? "Save Changes" : "Create User")}
                </Button>
                <Button onClick={() => setShowUserModal(false)} variant="outline" className="flex-1 rounded-xl h-11 border-slate-200 font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingUser(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setViewingUser(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="w-12 h-12 bg-admin-light border border-admin-border rounded-2xl flex items-center justify-center text-admin-primary mb-4 shadow-sm">
                  <User className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">User Details</h2>
                <p className="text-sm font-medium text-slate-500">Comprehensive profile information.</p>
              </div>

              <div className="space-y-6 bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <p className="text-sm font-bold text-slate-800">{viewingUser.name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                    <p className={cn("text-[11px] font-bold uppercase tracking-widest mt-1 inline-block px-2 py-0.5 rounded-full", viewingUser.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800")}>
                      {viewingUser.isActive ? "Authorized" : "Revoked"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <p className="text-sm font-semibold text-slate-700">{viewingUser.email}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                    <p className="text-sm font-semibold text-slate-700">{viewingUser.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role & Permissions</label>
                    <p className="text-sm font-medium text-slate-700 mt-1">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", ROLE_BADGE[viewingUser.role] ?? "bg-slate-200 text-slate-800")}>
                        {viewingUser.role.replace(/_/g, " ")}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined Date</label>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{new Date(viewingUser.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={() => setViewingUser(null)} variant="outline" className="w-full rounded-xl h-11 border-slate-200 font-semibold text-slate-700 hover:bg-slate-50">
                  Close Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 border border-rose-100">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-4 shadow-sm">
                  <Trash2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Delete User</h2>
                <p className="text-sm font-medium text-slate-500">
                  You are about to permanently delete <strong className="text-rose-600">{userToDelete.name}</strong> and ALL associated records. This action CANNOT be undone.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Type DELETE to confirm</label>
                <input 
                  className="w-full px-4 h-11 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all" 
                  placeholder="DELETE" 
                  value={deleteConfirmText} 
                  onChange={e => setDeleteConfirmText(e.target.value)} 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={confirmDeleteUser} 
                  disabled={deleteConfirmText !== "DELETE" || saving} 
                  className="bg-rose-600 text-white hover:bg-rose-700 font-semibold rounded-xl h-11 flex-1 shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Confirm Deletion"}
                </Button>
                <Button onClick={() => setShowDeleteModal(false)} variant="outline" className="flex-1 rounded-xl h-11 border-slate-200 font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && userToReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowResetModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 border border-amber-100">
            <button onClick={() => setShowResetModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-3 shadow-sm">
                  <Key className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reset User Password</h2>
                <p className="text-sm font-medium text-slate-500">
                  Assign a new password or generate a secure key for this account.
                </p>
              </div>

              {/* User Identity Preview */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{userToReset.name}</p>
                  <p className="text-xs font-medium text-slate-500">{userToReset.email}</p>
                </div>
                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", ROLE_BADGE[userToReset.role] ?? "bg-slate-200 text-slate-800")}>
                  {userToReset.role.replace(/_/g, " ")}
                </span>
              </div>

              {!resetSuccess ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">New Password</label>
                      <button 
                        type="button" 
                        onClick={handleGeneratePassword} 
                        className="text-xs font-bold text-admin-primary hover:underline flex items-center gap-1"
                      >
                        ⚡ Generate Secure
                      </button>
                    </div>
                    <input 
                      className="w-full px-4 h-11 text-sm font-mono font-medium bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
                      placeholder="Enter new password" 
                      value={newPasswordInput} 
                      onChange={e => setNewPasswordInput(e.target.value)} 
                    />
                    <p className="text-[11px] text-slate-500">Default is <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 font-bold">Admin@123</code></p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      onClick={confirmResetPassword} 
                      disabled={saving || !newPasswordInput} 
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl h-11 flex-1 shadow-sm"
                    >
                      {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Confirm Reset"}
                    </Button>
                    <Button onClick={() => setShowResetModal(false)} variant="outline" className="flex-1 rounded-xl h-11 border-slate-200 font-semibold text-slate-700 hover:bg-slate-50">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                      <Check className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-emerald-900">Password Updated Successfully!</p>
                    <p className="text-xs text-emerald-700">The new login password is ready to share.</p>
                    <div className="bg-white border border-emerald-200 rounded-lg p-2.5 font-mono text-sm font-bold text-slate-800 tracking-wide mt-2 select-all">
                      {newPasswordInput}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={copyCredentials} 
                      className="bg-admin-primary hover:bg-admin-hover text-white font-semibold rounded-xl h-11 flex-1 shadow-sm flex items-center justify-center gap-2"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy Details"}
                    </Button>
                    <Button 
                      onClick={() => setShowResetModal(false)} 
                      variant="outline" 
                      className="flex-1 rounded-xl h-11 border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
