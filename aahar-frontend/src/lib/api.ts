import axios, { type AxiosError } from "axios";
import type { ApiResponse, Restaurant, Hotel, BlogPost } from "@/types";

const BASE_URL = typeof window !== "undefined" 
  ? "/api" 
  : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api");

// ── Axios instance ───────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Restored normal timeout
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach JWT ─────────────────────
api.interceptors.request.use((config) => {
  // Pull token from localStorage (set by Zustand persist)
  try {
    const raw = localStorage.getItem("aahar-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      const token: string | null = parsed?.state?.token ?? null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // silent — no auth header
  }
  return config;
});

// ── Response interceptor — normalise errors ──────────────
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiResponse<null>>) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem("aahar-auth");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) =>
    api.post<ApiResponse<{ user: any; token: string }>>("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; phone?: string; role: string }) =>
    api.post<ApiResponse<{ user: any; token: string }>>("/auth/register", data),
  me:       () =>
    api.get<ApiResponse<any>>("/auth/me"),
  updateProfile: (data: { name?: string; email?: string; phone?: string; password?: string }) =>
    api.patch<ApiResponse<any>>("/auth/profile", data),
};

// ── Restaurants ───────────────────────────────────────────
export const restaurantApi = {
  list:   (params?: Record<string, any>) =>
    api.get("/restaurants", { params }),
  get:    (slugOrId: string) =>
    api.get(`/restaurants/${slugOrId}`),
  create: (data: any) =>
    api.post("/restaurants", data),
  update: (id: string, data: any) =>
    api.patch(`/restaurants/${id}`, data),
  updateMenu: (id: string, sections: any[]) =>
    api.post(`/restaurants/${id}/menu`, { sections }),
  delete: (id: string) =>
    api.delete(`/restaurants/${id}`),
};

// ── Master Data ──────────────────────────────────────────
export const masterApi = {
  list:   (type?: string) =>
    api.get("/master", { params: { type } }),
  create: (data: any) =>
    api.post("/master", data),
  update: (id: string, data: any) =>
    api.put(`/master/${id}`, data),
  delete: (id: string) =>
    api.delete(`/master/${id}`),
};

// ── Hotels ────────────────────────────────────────────────
export const hotelApi = {
  list:   (params?: Record<string, any>) =>
    api.get("/hotels", { params }),
  get:    (slugOrId: string) =>
    api.get(`/hotels/${slugOrId}`),
  create: (data: any) =>
    api.post("/hotels", data),
  update: (id: string, data: any) =>
    api.patch(`/hotels/${id}`, data),
  delete: (id: string) =>
    api.delete(`/hotels/${id}`),
  getRooms: (id: string) =>
    api.get(`/hotels/${id}/rooms`),
  upsertRoom: (hotelId: string, data: any) =>
    api.post(`/hotels/${hotelId}/rooms`, data),
  deleteRoom: (hotelId: string, roomId: string) =>
    api.delete(`/hotels/${hotelId}/rooms/${roomId}`),
};

// ── Search ────────────────────────────────────────────────
export const searchApi = {
  search: (params: Record<string, any>) =>
    api.get("/search", { params }),
};

// ── Business Leads (Registration) ─────────────────────────
export const leadApi = {
  create:     (data: any) => api.post("/leads", data),
  list:       (params?: Record<string, any>) => api.get("/leads", { params }),
  get:        (id: string) => api.get(`/leads/${id}`),
  update:     (id: string, data: any) => api.patch(`/leads/${id}`, data),
  delete:     (id: string) => api.delete(`/leads/${id}`),
  updateStatus:(id: string, status: string) => api.patch(`/leads/${id}/status`, { status }),
  convert:    (id: string) => api.post(`/leads/${id}/convert`),
};

// ── Guest Enquiries (Hotels) ────────────────────────────────
export const enquiryApi = {
  create:       (data: any) => api.post("/enquiries", data),
  list:         (params?: Record<string, any>) => api.get("/enquiries", { params }),
  get:          (id: string) => api.get(`/enquiries/${id}`),
  sendMessage:  (id: string, content: string) => api.post(`/enquiries/${id}/messages`, { content }),
  updateStatus: (id: string, status: string, extra?: any) => api.patch(`/enquiries/${id}/status`, { status, ...extra }),
};
// ── Applications ──────────────────────────────────────────
export const applicationApi = {
  submit:       (data: any) =>
    api.post("/applications", data),
  get:          (id: string) =>
    api.get(`/applications/${id}`),
  list:         (params?: Record<string, any>) =>
    api.get("/applications", { params }),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/applications/${id}/status`, { status, notes }),
  uploadDoc:    (id: string, formData: FormData) =>
    api.post(`/applications/${id}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMessages:  (id: string) =>
    api.get(`/applications/${id}/messages`),
  sendMessage:  (id: string, content: string, attachmentUrl?: string) =>
    api.post(`/applications/${id}/messages`, { content, attachmentUrl }),
  submitCorrections: (id: string, note?: string) => 
    api.post(`/applications/${id}/submit-corrections`, { note }),
};

// ── Uploads ───────────────────────────────────────────────
export const uploadApi = {
  photos:   (entityType: string, entityId: string, formData: FormData) =>
    api.post(`/upload/${entityType}/${entityId}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  document: (formData: FormData) =>
    api.post("/upload/document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  singlePhoto: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/upload/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  handbook: (formData: FormData) =>
    api.post("/upload/handbook", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ── Verification ──────────────────────────────────────────
export const verifyApi = {
  lookup: (certNumber: string) =>
    api.get(`/verify/${certNumber}`),
  search: (query: string) =>
    api.get("/verify", { params: { q: query } }),
};

// ── Admin ─────────────────────────────────────────────────
export const adminApi = {
  dashboard:    () => api.get("/admin/dashboard"),
  users:        (params?: any) => api.get("/admin/users", { params }),
  getUser:      (id: string) => api.get(`/admin/users/${id}`),
  updateUser:   (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
  deleteUser:   (id: string) => api.delete(`/admin/users/${id}`),
  resetPassword:(id: string, newPassword?: string) => api.post(`/admin/users/${id}/reset-password`, { newPassword }),
  auditors:     () => api.get("/admin/auditors"),
  listAudits:   (params?: any) => api.get("/admin/audits", { params }),
  assignAudit:  (applicationId: string, auditorId: string, scheduledAt: string) =>
    api.post("/admin/audits", { applicationId, auditorId, scheduledAt }),
  reports:      (params?: any) => api.get("/admin/reports", { params }),
  certify:      (applicationId: string) => api.post("/admin/certify", { applicationId }),
  revokeCert:   (certId: string, reason: string) =>
    api.patch(`/certifications/${certId}/status`, { status: "revoked", reason }),
  reinstateCert: (certId: string) =>
    api.patch(`/certifications/${certId}/status`, { status: "active" }),
  verifyEstablishment: (type: "restaurant" | "hotel", id: string) =>
    api.patch(`/admin/establishments/${type}/${id}/verify`),
  stats:        () => api.get("/admin/dashboard"),
  listStandards:() => api.get("/admin/standards"),
  createStandard: (data: any) => api.post("/admin/standards", data),
  updateStandard: (id: string, data: any) => api.patch(`/admin/standards/${id}`, data),
  deleteStandard: (id: string) => api.delete(`/admin/standards/${id}`),
  addCriterion: (id: string, data: any) => api.post(`/admin/standards/${id}/criteria`, data),
  deleteCriterion: (criterionId: string) => api.delete(`/admin/standards/criteria/${criterionId}`),
  reopenAudit:  (id: string) => api.patch(`/admin/audits/${id}/reopen`),
};

export const auditorApi = {
  list:   () => api.get("/audits"),
  get:    (id: string) => api.get(`/audits/${id}`),
  submit: (id: string, data: any) => api.patch(`/audits/${id}/submit`, data),
  downloadReport: (id: string) => api.get(`/audits/${id}/report`, { responseType: 'blob', timeout: 30000 }),
};

// ── Owner ─────────────────────────────────────────────────
export const ownerApi = {
  stats: () => api.get("/owner/stats"),
  managers: () => api.get(`/owner/managers`),
  createManager: (data: any) => api.post(`/owner/managers`, data),
  deleteManager: (id: string) => api.delete(`/owner/managers/${id}`),
  establishments: () => api.get(`/owner/establishments`),
  downloadAuditReport: (id: string) => api.get(`/audits/${id}/report`, { responseType: 'blob', timeout: 30000 })
};

// ── Payments ──────────────────────────────────────────────
export const paymentApi = {
  initiate: (enquiryId: string) => api.post("/payments/initiate", { enquiryId }),
  verify:   (id: string, success: boolean) => api.patch(`/payments/${id}/verify`, { success }),
};

// ── Notifications ─────────────────────────────────────────
export const notificationApi = {
  list:   (params?: any) => api.get("/notifications", { params }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
};

// ── Partners ──────────────────────────────────────────────
export const partnerApi = {
  list:   (params?: any) => api.get("/partners", { params }),
  create: (data: any) => api.post("/partners", data),
  update: (id: string, data: any) => api.patch(`/partners/${id}`, data),
  delete: (id: string) => api.delete(`/partners/${id}`),
};

// ── Blogs ─────────────────────────────────────────────────
export const blogApi = {
  list:   (params?: Record<string, any>) =>
    api.get("/blogs", { params }),
  get:    (slug: string) =>
    api.get(`/blogs/${slug}`),
  create: (data: any) =>
    api.post("/blogs", data),
  update: (id: string, data: any) =>
    api.patch(`/blogs/${id}`, data),
  delete: (id: string) =>
    api.delete(`/blogs/${id}`),
};

// ── Promotions / Ads ──────────────────────────────────────
export const promotionApi = {
  list:   (params?: Record<string, any>) =>
    api.get("/promotions", { params }),
  create: (data: any) =>
    api.post("/promotions", data),
  update: (id: string, data: any) =>
    api.patch(`/promotions/${id}`, data),
  delete: (id: string) =>
    api.delete(`/promotions/${id}`),
};

// ── Table Orders & QR Codes ───────────────────────────────
export const orderApi = {
  create:               (data: any) => api.post("/orders", data),
  get:                  (id: string) => api.get(`/orders/${id}`),
  listRestaurantOrders: (restaurantId: string, params?: any) => api.get(`/orders/restaurant/${restaurantId}`, { params }),
  updateStatus:         (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  listTables:           (restaurantId: string) => api.get(`/orders/restaurant/${restaurantId}/tables`),
  createTable:          (restaurantId: string, data: any) => api.post(`/orders/restaurant/${restaurantId}/tables`, data),
  getCustomerOrders:    () => api.get("/orders/customer/my")
};

// ── Settings ──────────────────────────────────────────────
export const settingsApi = {
  get:    (key: string) => api.get(`/settings/${key}`),
  update: (key: string, value: any) => api.put(`/settings/${key}`, { value }),
};

export default api;
