# 📝 AAHAR Comprehensive End-to-End Testing Checklist

Use this interactive checklist to manually verify every module and workflow across the AAHAR platform.

---

## 🔑 Test Credentials Quick Reference

| Role | Email | Password | Primary Portal URL |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@aahar.in` | `SuperAdmin@123` | [`http://localhost:3000/admin/dashboard`](http://localhost:3000/admin/dashboard) |
| **Admin** | `admin@aahar.in` | `Admin@123` | [`http://localhost:3000/admin/dashboard`](http://localhost:3000/admin/dashboard) |
| **Auditor** | `auditor@aahar.in` | `Auditor@123` | [`http://localhost:3000/auditor/audits`](http://localhost:3000/auditor/audits) |
| **Business Owner** | `owner@aahar.in` | `Owner@123` | [`http://localhost:3000/owner/dashboard`](http://localhost:3000/owner/dashboard) |
| **Hotel Manager** | `manager@aahar.in` | `Manager@123` | [`http://localhost:3000/manager/dashboard`](http://localhost:3000/manager/dashboard) |
| **Consumer Guest** | `consumer@aahar.in` | `Consumer@123` | [`http://localhost:3000/search`](http://localhost:3000/search) |

---

## ✅ Module 1: Authentication & Access Control

- [ ] **1.1 Consumer Registration & Login**
  - **URL**: [`http://localhost:3000/auth/login`](http://localhost:3000/auth/login)
  - **Action**: Log in with `consumer@aahar.in` / `Consumer@123`.
  - **Expected**: Redirected to consumer portal with account details in header.
- [ ] **1.2 Multi-Role Redirection**
  - **Action**: Log in as `admin@aahar.in` $\rightarrow$ redirected to `/admin/dashboard`.
  - **Action**: Log in as `auditor@aahar.in` $\rightarrow$ redirected to `/auditor/audits`.
  - **Action**: Log in as `owner@aahar.in` $\rightarrow$ redirected to `/owner/dashboard`.
  - **Action**: Log in as `manager@aahar.in` $\rightarrow$ redirected to `/manager/dashboard`.
- [ ] **1.3 Protected Route Authorization**
  - **Action**: While logged in as `consumer@aahar.in`, attempt to open [`/admin/dashboard`](http://localhost:3000/admin/dashboard).
  - **Expected**: Blocked or redirected to unauthorized/login page.
- [ ] **1.4 Logout & Session Teardown**
  - **Action**: Click user profile menu $\rightarrow$ **Logout**.
  - **Expected**: Tokens cleared from storage and redirected to login page.

---

## ✅ Module 2: Lead Generation & Business Onboarding

- [ ] **2.1 Public Partnership / Certification Lead Submission**
  - **URL**: [`http://localhost:3000/certify`](http://localhost:3000/certify)
  - **Action**: Fill in business name, city, contact person, phone number, and division (`F&B Restaurant` or `Hotel Stay`). Click **Submit Lead**.
  - **Expected**: Success confirmation banner with reference tracking.
- [ ] **2.2 Admin Leads Pipeline Review**
  - **URL**: [`http://localhost:3000/admin/dashboard`](http://localhost:3000/admin/dashboard) (Log in as `admin@aahar.in`)
  - **Action**: View newly submitted lead in the **Leads Intake** list.
  - **Action**: Transition status from `Pending` $\rightarrow$ `Contacted` $\rightarrow$ `Converted`.
  - **Expected**: Status badge updates seamlessly.

---

## ✅ Module 3: Establishment Profiles & Application Lifecycle

- [ ] **3.1 Business Certification Application Submission**
  - **URL**: [`http://localhost:3000/owner/application`](http://localhost:3000/owner/application) (Log in as `owner@aahar.in`)
  - **Action**: Fill out 4-step establishment application (Business Info, Documents, Facilities, Self-Assessment).
  - **Action**: Upload test files for `FSSAI_LICENSE` and `FIRE_NOC` with validity dates.
  - **Expected**: Application moves to `submitted` / `under_review` stage.
- [ ] **3.2 Admin Application Triage & Auditor Scheduling**
  - **URL**: [`http://localhost:3000/admin/applications`](http://localhost:3000/admin/applications) (Log in as `admin@aahar.in`)
  - **Action**: Click on the submitted application.
  - **Action**: Review uploaded documents and click **"Schedule Audit"**.
  - **Action**: Assign auditor `Auditor User` (`auditor@aahar.in`) and select audit date.
  - **Expected**: Application status transitions to `audit_scheduled`.

---

## ✅ Module 4: Dynamic Auditing Engine & Inspection

- [ ] **4.1 Auditor Scheduled Audits Inbox**
  - **URL**: [`http://localhost:3000/auditor/audits`](http://localhost:3000/auditor/audits) (Log in as `auditor@aahar.in`)
  - **Action**: Verify the scheduled audit is present under **Upcoming Inspections**.
- [ ] **4.2 Complete Interactive Audit Inspection Checklist**
  - **Action**: Click **"Start Audit"** to open the inspection workspace.
  - **Action**: Score criteria from 0 to 5 across sections (*Kitchen Hygiene*, *Storage*, *Staff Standards*).
  - **Action**: Add field notes and attach evidence photos.
  - **Action**: Verify real-time weighted percentage and score calculation.
- [ ] **4.3 Audit Submission & Recommendation**
  - **Action**: Select Recommendation: **"Approve for Certification"** and click **Submit Audit Report**.
  - **Expected**: Report marked completed and forwarded for admin certification sign-off.

---

## ✅ Module 5: Certification Engine & Public Trust Badges

- [ ] **5.1 Issue Official Cryptographic Certificate**
  - **URL**: [`http://localhost:3000/admin/audits`](http://localhost:3000/admin/audits) (Log in as `admin@aahar.in`)
  - **Action**: Open completed audit and click **"Issue Certificate"**.
  - **Expected**: Certificate code generated (e.g. `AHR-FNB-2026-0042`) with 1-year validity timestamp and dynamic QR code.
- [ ] **5.2 Public Verification Portal**
  - **URL**: [`http://localhost:3000/verify/AHR-FNB-2026-0042`](http://localhost:3000/verify/AHR-FNB-2026-0042)
  - **Action**: Verify green **"Certified & Verified"** badge, issue date, expiration date, and hygiene rating ($4.8 / 5.0$).
- [ ] **5.3 Certificate Revocation & Suspension Control**
  - **Action**: From Admin panel, toggle certificate to **"Suspended"** or **"Revoked"**.
  - **Action**: Refresh `/verify` page $\rightarrow$ Observe immediate red warning banner.

---

## ✅ Module 6: QR Table Ordering & Live Kitchen Display (KDS)

- [ ] **6.1 Table QR Management**
  - **URL**: [`http://localhost:3000/owner/tables`](http://localhost:3000/owner/tables) (Log in as `owner@aahar.in`)
  - **Action**: View generated tables (`T-01`, `T-02`). Click **"Print QR Stand"** to view printable standee.
- [ ] **6.2 Consumer Table Ordering**
  - **URL**: [`http://localhost:3000/restaurant/malabar-grand-spice?table=T-01`](http://localhost:3000/restaurant/malabar-grand-spice?table=T-01)
  - **Action**: Add *Malabar Chicken Biryani* (x2) and *Fresh Lime Mint Cooler* (x2) to cart.
  - **Action**: Add kitchen note: *"Less spicy for biryani"*.
  - **Action**: Click **"Place Table Order"**.
  - **Expected**: Order submitted with live status tracker.
- [ ] **6.3 Kitchen Display System (KDS) Live Order Flow**
  - **URL**: [`http://localhost:3000/owner/orders`](http://localhost:3000/owner/orders)
  - **Action**: Notice the real-time order arrival chime sound.
  - **Action**: Move ticket status: `Pending` $\rightarrow$ `Preparing` $\rightarrow$ `Served` $\rightarrow$ `Completed`.
  - **Expected**: Consumer tracking page updates in real-time via WebSockets.

---

## ✅ Module 7: Hotel Guest Enquiries & Direct Booking

- [ ] **7.1 Guest Stay Enquiry Submission**
  - **URL**: [`http://localhost:3000/hotel/kochi-heritage-grand-hotel`](http://localhost:3000/hotel/kochi-heritage-grand-hotel) (Log in as `consumer@aahar.in`)
  - **Action**: Select dates, Room Type (*Deluxe Heritage Suite*), 2 Adults, Meal Plan (*MAP*), and click **"Send Enquiry"**.
  - **Expected**: Enquiry created and redirected to [`/enquiries`](http://localhost:3000/enquiries).
- [ ] **7.2 Manager Review & Two-Way Chat**
  - **URL**: [`http://localhost:3000/manager/enquiries`](http://localhost:3000/manager/enquiries) (Log in as `manager@aahar.in`)
  - **Action**: Open the enquiry and reply in the chat: *"Late checkout confirmed"*.
  - **Action**: Submit Official Rate Quote: `₹13,500`.
- [ ] **7.3 Guest Acceptance & Confirmation**
  - **URL**: [`http://localhost:3000/enquiries`](http://localhost:3000/enquiries)
  - **Action**: Verify quote appears in real time and status transitions to `Confirmed`.

---

## ✅ Module 8: Business Owner & Property Manager Portals

- [ ] **8.1 Digital Menu Catalog Management**
  - **URL**: [`http://localhost:3000/owner/menu`](http://localhost:3000/owner/menu) (Log in as `owner@aahar.in`)
  - **Action**: Add a new dish with price and dietary tag (`Veg` / `Non-Veg` / `Vegan`).
  - **Action**: Toggle item availability on/off.
- [ ] **8.2 Storefront Profile & Operating Switch**
  - **URL**: [`http://localhost:3000/owner/profile`](http://localhost:3000/owner/profile)
  - **Action**: Click the **Operating Status** toggle (Open / Closed) and update contact info.
- [ ] **8.3 Compliance Hub & Audit Report Download**
  - **URL**: [`http://localhost:3000/owner/compliance`](http://localhost:3000/owner/compliance)
  - **Action**: View animated hygiene score gauge ($4.8/5.0$) and click **"Download Audit Report"** PDF.
- [ ] **8.4 Photo Gallery & Staff Delegation**
  - **URL**: [`http://localhost:3000/owner/photos`](http://localhost:3000/owner/photos) $\rightarrow$ Upload categorized photos.
  - **URL**: [`http://localhost:3000/owner/managers`](http://localhost:3000/owner/managers) $\rightarrow$ Assign manager credentials.

---

## ✅ Module 9: Admin CMS, Standards Builder & Settings

- [ ] **9.1 Standards & Criteria Builder**
  - **URL**: [`http://localhost:3000/admin/standards`](http://localhost:3000/admin/standards) (Log in as `admin@aahar.in`)
  - **Action**: View active F&B and Accommodation standards. Add a new criterion with custom weight.
- [ ] **9.2 Master Data Management**
  - **URL**: [`http://localhost:3000/admin/master/DOCUMENT_RESTAURANT`](http://localhost:3000/admin/master/DOCUMENT_RESTAURANT)
  - **Action**: Add/edit taxonomy items (Amenities, Categories, Document types).
- [ ] **9.3 User Role Management**
  - **URL**: [`http://localhost:3000/admin/users`](http://localhost:3000/admin/users)
  - **Action**: Search and filter users by role. Deactivate/reactivate test accounts.
- [ ] **9.4 Content CMS & System Settings**
  - **URL**: [`http://localhost:3000/admin/content`](http://localhost:3000/admin/content) $\rightarrow$ Publish/edit blog articles.
  - **URL**: [`http://localhost:3000/admin/settings/general`](http://localhost:3000/admin/settings/general) $\rightarrow$ Configure platform branding and policies.

---

## ✅ Module 10: Public Portal, Search Discovery & Guest Experience

- [ ] **10.1 Public Homepage Discovery**
  - **URL**: [`http://localhost:3000/`](http://localhost:3000/)
  - **Action**: Test quick-search bar, view trust statistics, and explore featured restaurants and verified stays.
- [ ] **10.2 Multi-Filter Search**
  - **URL**: [`http://localhost:3000/search`](http://localhost:3000/search)
  - **Action**: Filter by "Eat" vs "Stay", city ("Kochi"), certified-only toggle, and dietary preferences.
- [ ] **10.3 Public Blog & Community Hub**
  - **URL**: [`http://localhost:3000/blog`](http://localhost:3000/blog)
  - **Action**: Read published articles on food safety and hygiene guidelines.
