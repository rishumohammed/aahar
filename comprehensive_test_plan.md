# Comprehensive End-to-End Test Plan: Aahar Platform

This document provides a deep, module-by-module manual testing guide to ensure the entire Aahar platform functions correctly from the perspective of different users (Customers, Business Owners, Auditors, and Admins).

---

## Module 1: Authentication & User Management
**Objective:** Ensure users can securely register, log in, and are routed to their correct portals based on their roles.

| Test Case | Steps to Execute | Expected Result |
| :--- | :--- | :--- |
| **1.1 Admin Login** | Navigate to `/auth/login`. Enter admin credentials. | Successful login, redirected to `/admin/dashboard`. Admin tools visible. |
| **1.2 Owner Login** | Navigate to `/auth/login`. Enter business owner credentials. | Successful login, redirected to `/owner/dashboard`. |
| **1.3 Auditor Login** | Navigate to `/auth/login`. Enter auditor credentials. | Successful login, redirected to `/auditor/dashboard`. |
| **1.4 Registration (Lead)** | Navigate to `/auth/register`. Fill out as a new business. | Lead is created in the database. Status is `new`. User cannot access owner portal until approved/converted. |
| **1.5 Invalid Login** | Attempt login with wrong password. | Error toast appears: "Invalid credentials". Access denied. |
| **1.6 JWT Persistence** | Log in successfully. Refresh the browser tab. | Session is maintained. No redirect to login screen. |

---

## Module 2: Lead Generation & Onboarding
**Objective:** Ensure new business inquiries are captured and converted properly by the Admin.

| Test Case | Steps to Execute | Expected Result |
| :--- | :--- | :--- |
| **2.1 Submit Enquiry** | As an unauthenticated user, submit the 'Get Certified' form. | Lead appears in Admin dashboard under "Leads". |
| **2.2 Status Update** | As Admin, change lead status to `contacted`. | Status updates. Activity log records the change. |
| **2.3 Lead Conversion** | As Admin, click "Convert to Application" on a lead. | Lead is converted. A new user account is created for the owner. An initial `Application` record is created. |

---

## Module 3: Application & Certification Workflow
**Objective:** Test the core flow of a business applying for certification.

| Test Case | Steps to Execute | Expected Result |
| :--- | :--- | :--- |
| **3.1 Draft Application** | As Owner, open the new application. Fill out basic details, save without submitting. | Application status remains `draft`. Data persists on reload. |
| **3.2 Document Upload** | As Owner, upload required compliance documents (FSSAI, Trade License). | Documents upload successfully to storage. Links appear in the application portal. |
| **3.3 Submit Application** | As Owner, click submit. | Status changes to `submitted`. Admin receives a notification. |
| **3.4 Admin Review** | As Admin, review the documents. Change status to `under_review` or `gap_analysis`. | Owner sees status change. If gap analysis, owner is prompted to upload missing info. |
| **3.5 Assign Auditor** | As Admin, schedule an audit and assign an Auditor to the application. | Status changes to `audit_scheduled`. Auditor sees it in their dashboard. |

---

## Module 4: Auditing Engine (Deep Test)
*(See previous test cases for specifics on Offline, Geolocation, and CAPA)*

| Test Case | Steps to Execute | Expected Result |
| :--- | :--- | :--- |
| **4.1 Checklist Rendering** | As Auditor, open the assigned audit. | The dynamic checklist matching the specific standard (Restaurant vs Hotel) loads correctly. |
| **4.2 Scoring Math** | Score items with different weights. | `Total Score` calculates accurately based on weighted averages. |
| **4.3 Critical Failure** | Score 0 on a `CRITICAL` item. | Overall score instantly drops to 0 (Failure). |
| **4.4 Evidence Upload** | Auditor takes/uploads a photo for a specific question. | Image uploads. URL is bound to that specific checklist item. |
| **4.5 Submit & GPS** | Auditor submits the report. | GPS coordinates captured. Status changes to `audit_complete` (or `pending_corrections`). |
| **4.6 Report Generation** | Admin clicks "Download Report". | Multi-page PDF generated showing line-by-line scores and photos. |

---

## Module 5: Admin Management & Analytics
**Objective:** Ensure the Admin has full control over the platform configuration.

| Test Case | Steps to Execute | Expected Result |
| :--- | :--- | :--- |
| **5.1 Standard Builder** | As Admin, navigate to "Standards". Add a new Criterion to the checklist. | New question appears immediately on all future audits for that track. |
| **5.2 Certify Business** | As Admin, review a completed audit (Score > 3.5). Click "Issue Certificate". | Status changes to `certified`. Certificate PDF is generated and emailed/made available to the Owner. |
| **5.3 Revoke Cert** | As Admin, revoke an active certificate. | Status updates. Business no longer appears in public search. |
| **5.4 Dashboard Stats** | View the Admin dashboard charts. | Total certifications, pending audits, and revenue stats aggregate correctly. |

---

## Module 6: Owner Portal (Restaurants & Hotels)
**Objective:** Test the tools available to certified businesses.

| Test Case | Steps to Execute | Expected Result |
| :--- | :--- | :--- |
| **6.1 Compliance View** | As Owner, view the Compliance Dashboard. | Shows current score, days until expiry, and a download link for the active Certificate. |
| **6.2 Manage Rooms (Hotels)** | As Hotel Owner, add a new Room Type and price. | Room saves to database and becomes publicly visible on their profile. |
| **6.3 Manage Menus (Rest.)** | As Restaurant Owner, add menu categories and items. | Menu updates and reflects on the QR ordering system. |

---

## Module 7: QR Ordering & Table Management
**Objective:** Test the in-restaurant digital ordering flow.

| Test Case | Steps to Execute | Expected Result |
| :--- | :--- | :--- |
| **7.1 Generate QR** | As Restaurant Owner, create "Table 5". Generate QR code. | Unique QR code generated linking to Table 5's menu session. |
| **7.2 Customer Scan** | As Customer (via mobile simulator), scan the QR / open the link. | Sees the correct restaurant menu. URL tracks `?table=5`. |
| **7.3 Place Order** | As Customer, add items to cart and checkout. | Order submits. Owner receives a real-time (Socket.io) notification. |
| **7.4 Update Order Status** | As Owner, change order from `received` to `preparing` to `completed`. | Customer sees live status update on their phone. |

---

## Module 8: Public Search & Verification
**Objective:** Ensure the public can find and trust certified businesses.

| Test Case | Steps to Execute | Expected Result |
| :--- | :--- | :--- |
| **8.1 Public Search** | Go to the public homepage. Search for "Biryani" or a city name. | Certified restaurants matching criteria appear. Uncertified ones do not. |
| **8.2 Profile View** | Click on a restaurant profile. | Shows address, hygiene score badge, and public menu/photos. |
| **8.3 Certificate Verify** | Go to `/verify`. Enter a valid Certificate Number. | Shows a green "Verified" badge and details of the business. |
| **8.4 Invalid Verify** | Enter a fake or revoked certificate number. | Shows a red "Invalid or Revoked" message. |

---

## Module 9: Guest Enquiries (Hotels)
**Objective:** Test the communication channel between guests and hotels.

| Test Case | Steps to Execute | Expected Result |
| :--- | :--- | :--- |
| **9.1 Submit Enquiry** | As a public user, click "Contact Hotel" on a hotel profile and send a message. | Enquiry saves. Hotel owner gets a notification. |
| **9.2 Hotel Reply** | As Hotel Owner, reply to the guest enquiry via the portal. | Message appends to the thread. Guest receives email (if configured) or updates in UI. |
