# Aahar Platform - Manual Test Execution Sheet

This document contains detailed, step-by-step manual test cases based on the platform's workflows. You can use the checkboxes to track your progress as you test each module.

---

## Module 1: Authentication & User Management

### [ ] 1.1 Admin Login
*   **Pre-requisite:** Have valid admin credentials.
*   **Steps:** 
    1. Navigate to `/auth/login`.
    2. Enter admin email and password.
    3. Click 'Log In'.
*   **Expected Result:** Successful login. Redirection to `/admin/dashboard`. Admin navigation sidebar is visible.

### [ ] 1.2 Owner Login
*   **Pre-requisite:** Have valid business owner credentials.
*   **Steps:** 
    1. Navigate to `/auth/login`.
    2. Enter owner email and password.
    3. Click 'Log In'.
*   **Expected Result:** Successful login. Redirection to `/owner/dashboard` (or hotel/restaurant specific dashboard).

### [ ] 1.3 Auditor Login
*   **Pre-requisite:** Have valid auditor credentials.
*   **Steps:** 
    1. Navigate to `/auth/login`.
    2. Enter auditor email and password.
    3. Click 'Log In'.
*   **Expected Result:** Successful login. Redirection to `/auditor/dashboard`.

### [ ] 1.4 Invalid Credentials
*   **Steps:** 
    1. Navigate to `/auth/login`.
    2. Enter an incorrect password or unregistered email.
    3. Click 'Log In'.
*   **Expected Result:** Error toast/message appears: "Invalid credentials". Access is denied.

### [ ] 1.5 Session Persistence
*   **Steps:** 
    1. Log in successfully as any user.
    2. Refresh the browser tab (`F5`).
*   **Expected Result:** The user remains logged in; no redirection to the login page occurs.

---

## Module 2: Lead Generation & Onboarding

### [ ] 2.1 Submit 'Get Certified' Enquiry
*   **Steps:** 
    1. As an unauthenticated user, go to the public home page.
    2. Click on 'Get Certified' or 'List your Business'.
    3. Fill out the lead form (Name, Business Name, Email, Phone, District, etc.).
    4. Submit the form.
*   **Expected Result:** Success message shown to user. A new `BusinessLead` is created in the database with status `pending`.

### [ ] 2.2 Admin: Update Lead Status
*   **Steps:** 
    1. Log in as Admin.
    2. Navigate to Leads/Enquiries management.
    3. Find the newly submitted lead.
    4. Change its status to `contacted`.
*   **Expected Result:** Status updates in the UI.

### [ ] 2.3 Admin: Convert Lead to Application
*   **Steps:** 
    1. As Admin, view a `pending` or `contacted` lead.
    2. Click the "Convert to Application" button.
*   **Expected Result:** 
    - The lead status changes to `converted`.
    - A new User account (role: `owner`) is created for the applicant.
    - A draft `Application` is created for that owner.
    - An email with login credentials is (ideally) dispatched to the owner.

---

## Module 3: Application & Certification Workflow

### [ ] 3.1 Owner: Draft Application
*   **Pre-requisite:** Log in as the newly created Owner.
*   **Steps:** 
    1. Navigate to Applications.
    2. Open the new draft application.
    3. Fill out basic business details but do *not* submit.
    4. Save and reload the page.
*   **Expected Result:** Application status remains `draft`. Data persists after reload.

### [ ] 3.2 Owner: Upload Documents
*   **Steps:** 
    1. Inside the application, go to the Documents section.
    2. Upload required files (e.g., FSSAI certificate, Trade License, ID proofs).
*   **Expected Result:** Files upload successfully. Document records are created with status `pending`.

### [ ] 3.3 Owner: Submit Application
*   **Steps:** 
    1. Complete all mandatory fields and document uploads.
    2. Click 'Submit Application'.
*   **Expected Result:** Application status changes to `submitted`. Admin receives a notification.

### [ ] 3.4 Admin: Review & Request Changes (Gap Analysis)
*   **Steps:** 
    1. Log in as Admin and open the submitted application.
    2. Review a document and mark it as `rejected` (or change app status to `gap_analysis`).
    3. Add a note requesting re-upload.
*   **Expected Result:** Owner sees the application status as `gap_analysis` and sees the note requesting new documents.

### [ ] 3.5 Admin: Assign Auditor
*   **Steps:** 
    1. As Admin, approve the documents.
    2. Click 'Schedule Audit'.
    3. Select an Auditor from the dropdown, set a date, and confirm.
*   **Expected Result:** Application status changes to `audit_scheduled`. The assigned Auditor sees this in their dashboard.

---

## Module 4: Auditing Engine

### [ ] 4.1 Auditor: View Checklist
*   **Pre-requisite:** Log in as the assigned Auditor.
*   **Steps:** 
    1. Navigate to the scheduled audit.
    2. Click 'Start Audit'.
*   **Expected Result:** The correct dynamic checklist loads based on the `AuditTrack` (F&B vs Accommodation).

### [ ] 4.2 Auditor: Standard Scoring
*   **Steps:** 
    1. Go through the checklist items.
    2. Assign varying scores (e.g., 3, 4, 5) to non-critical items.
*   **Expected Result:** The `Total Score` calculates correctly based on the weighted averages of the criteria.

### [ ] 4.3 Auditor: Critical Failure
*   **Steps:** 
    1. Find an item marked as `CRITICAL` in the checklist.
    2. Score it as 0 (Fail).
*   **Expected Result:** The overall audit score immediately drops to 0, or the UI indicates an automatic failure regardless of other scores.

### [ ] 4.4 Auditor: Evidence Upload
*   **Steps:** 
    1. Select a checklist item.
    2. Upload a photo as evidence.
*   **Expected Result:** Image uploads successfully and is bound to that specific criterion in the `sitePhotos` JSON.

### [ ] 4.5 Auditor: Submit Audit & GPS
*   **Steps:** 
    1. Complete the checklist.
    2. Click 'Submit Report'.
    3. Accept the browser prompt for Location access (if applicable).
*   **Expected Result:** Audit status changes to `completed`. GPS coordinates (`lat`, `lng`) are captured and saved. Application status changes to `audit_complete`.

### [ ] 4.6 Admin: Download Report
*   **Steps:** 
    1. As Admin, view the completed audit.
    2. Click 'Download PDF Report'.
*   **Expected Result:** A PDF is generated and downloaded, containing line-by-line scores, auditor notes, and attached evidence photos.

---

## Module 5: Admin Management & Analytics

### [ ] 5.1 Admin: Standard Builder
*   **Steps:** 
    1. Navigate to 'Standards' or 'Checklist Builder'.
    2. Add a new Criterion (Question) to an active Standard.
    3. Assign it a weight and save.
*   **Expected Result:** The new question appears immediately on any newly started audits for that track.

### [ ] 5.2 Admin: Issue Certificate
*   **Steps:** 
    1. Review an application with a completed audit (Score > threshold).
    2. Click 'Issue Certificate'.
    3. Set expiration date (e.g., 1 year from now).
*   **Expected Result:** 
    - Application status changes to `certified`.
    - A `Certification` record is created.
    - The business is now marked as `isVerified = true`.
    - Certificate PDF and QR Code are generated.

### [ ] 5.3 Admin: Revoke Certificate
*   **Steps:** 
    1. Find an active certificate.
    2. Click 'Revoke', provide a reason, and confirm.
*   **Expected Result:** Certificate status changes to `revoked`. The business no longer appears in the public verified search.

### [ ] 5.4 Admin: Dashboard Stats
*   **Steps:** 
    1. View the main Admin Dashboard.
*   **Expected Result:** Metrics like "Total Certifications", "Pending Audits", and revenue charts aggregate real data correctly.

---

## Module 6: Owner Portal

### [ ] 6.1 Owner: Compliance View
*   **Pre-requisite:** Log in as an Owner with an active certificate.
*   **Steps:** 
    1. Go to the Compliance/Certificate dashboard.
*   **Expected Result:** Owner can see their hygiene score, days until expiration, and a link to download the PDF certificate.

### [ ] 6.2 Hotel Owner: Manage Rooms
*   **Steps:** 
    1. As a Hotel owner, navigate to Room Management.
    2. Add a new Room Type (e.g., "Deluxe Suite") with pricing and amenities.
*   **Expected Result:** Room saves to the database and becomes publicly visible on the hotel's public profile.

### [ ] 6.3 Restaurant Owner: Manage Menus
*   **Steps:** 
    1. As a Restaurant owner, navigate to Menu Management.
    2. Add a new Menu Section (e.g., "Starters").
    3. Add a Menu Item under that section with an image and price.
*   **Expected Result:** The menu updates instantly and reflects on the QR ordering interface.

---

## Module 7: QR Ordering & Table Management

### [ ] 7.1 Owner: Generate Table QR
*   **Pre-requisite:** Log in as a Restaurant owner.
*   **Steps:** 
    1. Go to Table Management.
    2. Add "Table 5".
    3. Click 'Generate QR'.
*   **Expected Result:** A unique QR code is generated. Scanning it opens the menu with `?table=5` appended.

### [ ] 7.2 Customer: View Digital Menu
*   **Steps:** 
    1. As a public user (or using a mobile simulator), open the QR link.
*   **Expected Result:** The correct restaurant menu is displayed. The UI acknowledges the correct table number.

### [ ] 7.3 Customer: Place Order (Real-time)
*   **Steps:** 
    1. Add items to the cart and proceed to checkout.
    2. Submit the order.
*   **Expected Result:** Order is submitted successfully. The Restaurant Owner's dashboard receives an instant WebSocket notification of the new order (`status = pending`).

### [ ] 7.4 Owner: Update Order Status
*   **Steps:** 
    1. As the Owner, change the order status from `pending` -> `preparing` -> `completed`.
    2. Observe the Customer's screen simultaneously.
*   **Expected Result:** The customer's order tracker updates in real-time via WebSockets without needing a page refresh.

---

## Module 8: Public Search & Verification

### [ ] 8.1 Public Search Filter
*   **Steps:** 
    1. Go to the public homepage.
    2. Search for a specific city or keyword (e.g., "Biryani").
*   **Expected Result:** Only certified (`isVerified = true`) businesses matching the criteria are displayed. Uncertified businesses are hidden.

### [ ] 8.2 Profile View
*   **Steps:** 
    1. Click on a certified restaurant or hotel profile.
*   **Expected Result:** The profile displays address, hygiene score badge, photos, and public menus/rooms.

### [ ] 8.3 Certificate Verification (Valid)
*   **Steps:** 
    1. Go to `/verify` (or scan a Certificate QR).
    2. Enter a valid `certNumber`.
*   **Expected Result:** A green "Verified" badge appears showing the business details and validity dates.

### [ ] 8.4 Certificate Verification (Invalid/Revoked)
*   **Steps:** 
    1. Enter a fake certificate number OR a revoked one.
*   **Expected Result:** A red "Invalid or Revoked" message appears, warning the consumer.

---

## Module 9: Guest Enquiries (Hotels)

### [ ] 9.1 Guest: Submit Enquiry
*   **Steps:** 
    1. As a public user, navigate to a Hotel's profile.
    2. Click 'Contact Hotel' or 'Enquire'.
    3. Fill out dates, guests, and a message. Submit.
*   **Expected Result:** Enquiry is saved in the database. The Hotel Owner receives a notification.

### [ ] 9.2 Hotel Owner: Reply to Enquiry
*   **Steps:** 
    1. Log in as the Hotel Owner.
    2. Go to Enquiries.
    3. Reply to the guest's message.
*   **Expected Result:** The message appends to the thread (`EnquiryMessage`). The status changes (e.g., from `sent` to `quoted` or `viewed`).
