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
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
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

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(user.id);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">User Registry</h1>
          <p className="text-slate-600 font-medium text-sm">{filtered.length} active platform stakeholders in this segment.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-admin-primary text-white hover:bg-admin-hover font-medium rounded-md flex items-center gap-2 px-6 py-2 shadow-sm">
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeSection === "system" ? "border-admin-primary text-admin-primary" : "border-transparent text-slate-500 hover:text-slate-700")}
          onClick={() => { setActiveSection("system"); setRole(""); }}
        >
          System Users
        </button>
        <button
          className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeSection === "establishment" ? "border-admin-primary text-admin-primary" : "border-transparent text-slate-500 hover:text-slate-700")}
          onClick={() => { setActiveSection("establishment"); setRole(""); }}
        >
          Establishment Users
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-md border border-slate-200 focus:ring-2 focus:ring-admin-primary transition-shadow outline-none" 
            placeholder="Search by name or email identity..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select 
            className="w-full pl-9 pr-8 py-2 appearance-none font-medium text-sm bg-white rounded-md border border-slate-200 outline-none focus:ring-2 focus:ring-admin-primary transition-shadow" 
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
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Identity</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Role & Access</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Platform Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Registry Date</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-10 bg-slate-100 rounded-md w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 italic text-slate-500 text-sm">No users found in this segment.</td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user.id} className={cn("group transition-colors hover:bg-slate-50", !user.isActive && "opacity-60")}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-admin-light flex items-center justify-center text-admin-text font-bold text-sm shrink-0">
                        {user.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider", ROLE_BADGE[user.role] ?? "bg-slate-100 text-slate-700")}>
                      {user.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", user.isActive ? "bg-emerald-500" : "bg-rose-500")} />
                      <span className={cn("text-xs font-medium", user.isActive ? "text-emerald-700" : "text-rose-700")}>
                        {user.isActive ? "Authorized" : "Revoked"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingUser(user)}
                        className="p-2 rounded-md text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {["owner", "hotel_manager"].includes(user.role) && (
                        <Link href={`/admin/users/${user.id}/establishments`}>
                          <button 
                            className="p-2 rounded-md text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-1"
                            title="View Establishments"
                          >
                            <Building2 className="h-4 w-4" />
                            <span className="text-[10px] font-bold">{(user.restaurants?.length || 0) + (user.hotels?.length || 0)}</span>
                          </button>
                        </Link>
                      )}
                      
                      <button 
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 rounded-md text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                        title="Edit User"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      
                      {!["super_admin", "admin"].includes(user.role) && (
                        <button 
                          onClick={() => handleDeactivate(user.id, user.isActive)}
                          className={cn(
                            "p-2 rounded-md transition-all active:scale-95 border",
                            user.isActive 
                              ? "text-rose-600 bg-white border-rose-200 hover:bg-rose-50" 
                              : "text-emerald-600 bg-white border-emerald-200 hover:bg-emerald-50"
                          )}
                          title={user.isActive ? "Revoke Access" : "Authorize Access"}
                        >
                          {user.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </button>
                      )}

                      {!["super_admin"].includes(user.role) && (
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 rounded-md text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-all active:scale-95"
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
          <div className="relative w-full max-w-md bg-white rounded-lg p-6 shadow-xl animate-in zoom-in-95">
            <button onClick={() => setShowUserModal(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="w-12 h-12 bg-admin-light rounded-lg flex items-center justify-center text-admin-text mb-4">
                  {editingUser ? <Pencil className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                </div>
                <h2 className="text-lg font-semibold text-slate-800">{editingUser ? "Edit User" : "Add New User"}</h2>
                <p className="text-sm text-slate-500">{editingUser ? "Update user details and permissions." : "Authorize a new platform stakeholder."}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input className="w-full px-3 py-2 text-sm bg-white rounded-md border border-slate-200 focus:ring-2 focus:ring-admin-primary outline-none" placeholder="Legal name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <input className="w-full px-3 py-2 text-sm bg-white rounded-md border border-slate-200 focus:ring-2 focus:ring-admin-primary outline-none" type="email" placeholder="email@example.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Phone</label>
                    <input className="w-full px-3 py-2 text-sm bg-white rounded-md border border-slate-200 focus:ring-2 focus:ring-admin-primary outline-none" placeholder="+91..." value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Role</label>
                    <select className="w-full px-3 py-2 text-sm bg-white rounded-md border border-slate-200 focus:ring-2 focus:ring-admin-primary outline-none" value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Platform Admin</option>
                      <option value="auditor">Regional Auditor</option>
                      <option value="owner">Business Owner</option>
                      <option value="hotel_manager">Hotel Manager</option>
                      <option value="consumer">End Consumer</option>
                    </select>
                  </div>
                </div>
                {!editingUser && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Initial Password</label>
                    <input className="w-full px-3 py-2 text-sm bg-white rounded-md border border-slate-200 focus:ring-2 focus:ring-admin-primary outline-none" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSaveUser} disabled={saving} className="bg-admin-primary text-white hover:bg-admin-hover font-medium rounded-md flex-1">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (editingUser ? "Save Changes" : "Create User")}
                </Button>
                <Button onClick={() => setShowUserModal(false)} variant="outline" className="flex-1 rounded-md border-slate-200 font-medium text-slate-700">
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
          <div className="relative w-full max-w-md bg-white rounded-lg p-6 shadow-xl animate-in zoom-in-95">
            <button onClick={() => setViewingUser(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="w-12 h-12 bg-admin-light rounded-lg flex items-center justify-center text-admin-text mb-4">
                  <User className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">User Details</h2>
                <p className="text-sm text-slate-500">Comprehensive profile information.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <p className="text-sm font-semibold text-slate-800">{viewingUser.name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                    <p className={cn("text-sm font-semibold mt-0.5", viewingUser.isActive ? "text-emerald-600" : "text-rose-600")}>
                      {viewingUser.isActive ? "Active / Authorized" : "Inactive / Revoked"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <p className="text-sm font-medium text-slate-700">{viewingUser.email}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                    <p className="text-sm font-medium text-slate-700">{viewingUser.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role & Permissions</label>
                    <p className="text-sm font-medium text-slate-700 mt-1">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", ROLE_BADGE[viewingUser.role] ?? "bg-slate-100 text-slate-700")}>
                        {viewingUser.role.replace(/_/g, " ")}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined Date</label>
                    <p className="text-sm font-medium text-slate-700">{new Date(viewingUser.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button onClick={() => setViewingUser(null)} variant="outline" className="w-full rounded-md border-slate-200 font-medium text-slate-700">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
