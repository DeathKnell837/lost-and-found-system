# Campus Lost & Found System — Presentation Demo Script
### (Aligned to Teacher's Evaluation Criteria)

> **Estimated Time:** 15–20 minutes  
> **Setup:** Open your deployed site in a browser. Have 2 tabs ready — one for the main site, one for `/admin`. Prepare a sample image on your desktop. Log in to your test user account beforehand.

---

## EVALUATION CRITERIA COVERAGE MAP
> *(Know what to highlight for each criterion before you start)*

| Criterion | Where to Show It |
|---|---|
| **Add / Create** | Report lost/found item form, Register account, Admin add category/location |
| **Edit / Update** | Admin edit item, Update profile/settings, Admin update claim status |
| **Delete / Remove** | Admin delete item, User withdraw claim |
| **Search / Filter** | Search page, lost/found filter bar, admin items filter, claims filter |
| **Generate / Report** | Admin Statistics page |
| **Print / Export** | Export CSV (items + claims), Print Report button |
| **Compute / Calculate** | Success rate %, Average days to claim, Matching algorithm scores |
| **Usability / User-Friendly** | Clean navbar, flash messages, breadcrumbs, dark mode |
| **Performance / Speed** | Fast page loads, image caching, progressive web app |
| **Reliability / Stability** | MongoDB Atlas cloud DB, session persistence, error handling |
| **Security / Data Protection** | Bcrypt passwords, secure sessions, login required routes, input validation |
| **Accessibility / Compatibility** | Responsive layout on mobile, Bootstrap 5, works on any browser |
| **User Experience / Feedback** | Dark mode, loading spinner, auto-dismiss alerts, character counter, tooltips |

---

## PART 1 — INTRODUCTION (1–2 min)

**Say:**
> "Good day! I'm presenting our **Campus Lost & Found Management System** — a web-based platform that helps students and faculty report, track, and recover lost items on campus. The system has three roles: Student, Faculty/Staff, and Admin. Let me walk you through every feature."

**On screen:** Show the **Home Page**.

**Point out:**
- Hero section — two main action buttons: **Report Lost Item** (red) and **Report Found Item** (green)
- **Live statistics** — dynamically updated count of Lost Items, Found Items, and Successfully Claimed
- **"How It Works"** — 3-step process: Report → Review → Connect
- Recent lost and found item cards

> **[Evaluator note — Usability]** *"Everything a user needs is visible immediately on the home page — no hunting around."*

---

## PART 2 — NON-FUNCTIONAL: USER EXPERIENCE & USABILITY (1 min)

### Dark Mode
**Say:**
> "The system has a built-in dark mode for accessibility and comfort."

**Action:** Click the **moon icon** in the navbar.

**Point out:**
- Entire site switches instantly — navbar, cards, forms, buttons
- Preference is saved in the browser — stays even after refresh

> **[Evaluator note — UX / Accessibility]** *"Dark mode + responsive design = comfort for all users."*

### Responsive Design
**Action:** Slowly drag the browser window narrower to show mobile layout.

**Point out:**
- Navbar collapses to a hamburger menu
- Cards stack vertically
- Works on any device — phone, tablet, desktop

> **[Evaluator note — Accessibility / Compatibility]** *"Built with Bootstrap 5 — fully responsive, works on any browser."*

**Action:** Restore to full width.

---

## PART 3 — SEARCH / FILTER (1–2 min)
> *Covers evaluation criterion: **Search / Filter***

### Browse & Filter Lost Items
**Action:** Click **"Lost Items"** in the navbar.

**Say:**
> "Users can filter items by category, date range, and keyword to quickly find what they're looking for."

**Action:** Select a **category** from the dropdown, then click **Filter**.

**Point out:**
- Results update immediately with "Showing X of Y items"
- Pagination when many results

**Action:** Click **"Found Items"** — show the same filtering works there too.

### Advanced Search
**Action:** Click the **search box** in the navbar and type a keyword, or navigate to the Search page.

**Point out:**
- Keyword search across item name, description, and location
- Filter by Type (Lost / Found / All), Category, Date range
- "Clear Filters" button to reset

> **[Evaluator note — Search/Filter]** *"Users can filter by category, type, date range, and keyword across all items."*

---

## PART 4 — REGISTRATION & LOGIN (1 min)
> *Covers: **Add/Create** (new account), **Security***

**Action:** Click **Register** in the navbar.

**Point out:**
- Fields: Username, Email, Password, Confirm Password
- Passwords are **encrypted with bcrypt** — never stored in plain text

> **[Evaluator note — Security]** *"All passwords are hashed using bcrypt encryption before storing."*

**Action:** Navigate to **Login**.

**Point out:**
- Login works with either username OR email
- **"Forgot Password"** link sends a secure reset email
- Session is stored securely in the database — stays logged in across browser sessions

> **[Evaluator note — Security / Reliability]** *"Sessions are encrypted and stored in MongoDB Atlas — persistent and secure."*

**Action:** Log in with your test account.

---

## PART 5 — USER DASHBOARD (1 min)
> *Covers: **Compute/Calculate**, **Usability***

**Say:**
> "After login, users see a personal dashboard with their activity summary."

**Point out:**
- **Statistics cards:** Total Reported, Pending Review, Approved, Claimed, Lost, Found — all calculated in real time
- **Recent Reports table** — item name, type badge, status badge, date
- Quick action buttons: Report Lost / Report Found

> **[Evaluator note — Compute/Calculate]** *"The dashboard computes and displays live statistics per user."*

---

## PART 6 — ADD / CREATE: REPORTING AN ITEM (2 min)
> *Covers: **Add/Create**, **Security** (input validation), **UX** (image preview)*

**Action:** Click **"Report Lost Item"** from the dashboard or navbar.

**Walk through the form:**
1. **Item Name** — type a sample name (e.g., "Blue Samsung Earbuds")
2. **Category** — select from dropdown
3. **Description** — detailed text (show **character counter** as you type)
4. **Location** — select from list; if not listed, choose **"Other"** — a text box appears for a custom location suggestion
5. **Date Lost** — date picker (automatically blocks future dates)
6. **Image Upload** — choose your sample image

**Point out the instant image preview appearing** before upload.

> **[Evaluator note — Add/Create]** *"The report form includes validation, character counters, image preview, and dynamic location suggestion."*

**Action:** Submit the form.

**Point out:**
- **Loading spinner** appears while submitting
- **Flash message** confirms success (auto-dismisses after 5 seconds)
- Redirected to dashboard — new item shows as **"Pending"**

> **[Evaluator note — UX/Feedback]** *"Real-time feedback: loading indicator during submission, success alert after."*

---

## PART 7 — DELETE/REMOVE + EDIT/UPDATE: USER SIDE (1 min)
> *Covers: **Edit/Update**, **Delete/Remove***

**Action:** Go to **Settings** from the navbar dropdown.

**Point out:**
- **Edit/Update Profile** — Username, Email, Phone Number
- **Change Password** — current + new + confirm
- **Email Notification Preferences** — toggle on/off: Item Approved, Rejected, Claimed, Match Found

> **[Evaluator note — Edit/Update]** *"Users update their own profile, password, and notification preferences."*

**Action:** Go to **My Claims**.

**Point out:**
- Status filter tabs — All, Pending, Under Review, Approved, Rejected
- **Withdraw (Delete) Claim button** — removes a pending claim with confirmation

> **[Evaluator note — Delete/Remove]** *"Users can withdraw/delete their pending claims."*

---

## PART 8 — ADD / CREATE: CLAIM SUBMISSION (1–2 min)
> *Covers: **Add/Create**, **UX***

**Action:** Go to an approved **Found Item** and open its detail page.

**Point out on the Item Detail page:**
- Full image, location, date, description
- **Contact Reporter button** — opens Gmail compose pre-filled (easy communication)
- **Social Share** — Facebook, Twitter, WhatsApp, Copy Link
- **Potential Matches** sidebar — system-detected similar items

**Action:** Click **"Claim This Item"**.

**Walk through the Claim Form:**
1. Item preview sidebar (sticky — always visible while filling the form)
2. Description — why this item belongs to you
3. Proof of Ownership — receipt, serial number, etc.
4. Identifying Features — unique marks or stickers
5. Upload up to 3 proof images
6. Contact phone + preferred contact method (Email / Phone / Both)

**Action:** Submit the claim.

> **[Evaluator note — Add/Create]** *"Claim submission captures full proof of ownership with images and contact preference."*

---

## PART 9 — ADMIN PANEL (5–6 min)
> *Covers ALL functional criteria*

**Say:**
> "Now let me show the admin panel — the control center of the system."

**Action:** Open `/admin` → log in as admin.

---

### 9A — Admin Dashboard
**Point out:**
- Live stats: Total Items, Pending, Lost, Found, Claimed, Users, Categories
- **Needs Your Attention** panel — pending items listed with quick Approve button
- **Recent Activity** table

---

### 9B — ADD/CREATE + DELETE: Pending Review
> *Covers: **Add/Create** (publish), **Delete/Remove** (reject)*

**Action:** Click **"Pending Review"** in the sidebar.

**Point out:**
- Card layout with item image, reporter info, description
- **Approve** → item becomes publicly visible (creates/publishes the listing)
- **Reject** → opens modal to enter a reason, removes from public view

**Action:** **Approve** the item you submitted in Part 6.

**Say:** *"Once approved, the reporter receives an automatic email notification."*

> **[Evaluator note — Add/Create + Delete]** *"Admin publishes items by approving them, or removes them by rejecting with a reason."*

---

### 9C — EDIT/UPDATE + DELETE + SEARCH/FILTER: All Items
> *Covers: **Edit/Update**, **Delete/Remove**, **Search/Filter***

**Action:** Click **"All Items"** in the sidebar.

**Point out:**
- Search bar + Status / Type / Category filters
- **Export CSV** button at the top

> **[Evaluator note — Search/Filter]** *"Admin can search and filter all items across multiple criteria."*

**Action:** Click **Edit** on any item.

**Point out:**
- Full edit form — name, category, location, status, image, admin notes
- Can mark as Claimed, Approved, or Rejected directly

> **[Evaluator note — Edit/Update]** *"Admin has full edit control over every item in the system."*

**Action:** Back on All Items — show the **Delete** button + confirmation modal (cancel without deleting).

> **[Evaluator note — Delete/Remove]** *"Admin can permanently delete any item — confirmation modal prevents accidents."*

---

### 9D — EDIT/UPDATE: Claims Management
> *Covers: **Edit/Update***

**Action:** Click **"All Claims"** → click **"Review"** on a claim.

**Point out:**
- Full claim details: description, proof text, proof images
- **Priority** — Low / Normal / High (one-click update)
- **Take Action** — change status: Under Review / Approve / Reject + admin notes
- **Timeline** — every change recorded with timestamp
- **Other Claims sidebar** — competing claims for the same item
- **Claimant History** — previous claims by this user

**Action:** Change status to **Under Review** + add a note → Save.

> **[Evaluator note — Edit/Update]** *"Admin updates claim status, priority, and notes — all tracked in a timeline."*

---

### 9E — ADD/CREATE + EDIT/UPDATE + DELETE: Categories & Locations
**Action:** Click **"Categories"** → show **Add Category** modal (Name, Description, Icon).

**Action:** Click **"Locations"** → show:
- **User-Suggested Locations** — custom locations submitted by users pending admin approval
- Approve / Reject suggestions
- Add new locations, edit existing ones, delete unused ones

> **[Evaluator note — Add/Create + Edit/Update + Delete]** *"Full CRUD on categories and locations, including crowd-sourced location suggestions."*

---

### 9F — EDIT/UPDATE: User Management
**Action:** Click **"Users"** in the sidebar.

**Point out:**
- User table — username, email, role badge, status badge, registration date
- **Activate / Deactivate** toggle per user

> **[Evaluator note — Edit/Update]** *"Admin manages user account access — activate or deactivate accounts."*

---

### 9G — GENERATE/REPORT + PRINT/EXPORT + COMPUTE/CALCULATE: Statistics
> *Covers: **Generate/Report**, **Print/Export**, **Compute/Calculate***

**Action:** Click **"Statistics"** in the sidebar.

**Say:**
> "This is the full analytics and reporting module."

**Point out the COMPUTED metrics:**
- **Success Rate %** — (Claimed ÷ Total Approved × 100), computed live
- **Average Days to Claim** — computed from submission date to claim approval date
- Total, Lost, Found, Claimed, Pending counts

> **[Evaluator note — Compute/Calculate]** *"Automatically computes success rate and average resolution time from live data."*

**Point out the GENERATED charts:**
- **Monthly Trends** (line chart) — Lost, Found, Claimed over 6 months
- **Status Distribution** (doughnut chart)
- **Items by Category** table with percentage progress bars
- **Top Locations** ranked list

> **[Evaluator note — Generate/Report]** *"Full report generated from live data — charts, tables, trends, and rankings."*

**Action:** Click **"Export CSV"**.

> **[Evaluator note — Print/Export]** *"Exports all data as a CSV spreadsheet file."*

**Action:** Click **"Print Report"**.

> **[Evaluator note — Print/Export]** *"Reports can be printed directly from the browser."*

---

### 9H — COMPUTE/CALCULATE: Item Matching Algorithm
> *Covers: **Compute/Calculate***

**Action:** Click **"Item Matching"** → click **"Run Matching Algorithm"**.

**Say:**
> "The system automatically computes similarity scores between lost and found items."

**Point out the scoring formula:**
- Category match = 25 pts
- Location proximity = up to 20 pts
- Date proximity = up to 20 pts
- Description keyword similarity = up to 35 pts
- **Total score shown as %** — 60%+ Good, 40–59% Possible

> **[Evaluator note — Compute/Calculate]** *"Multi-criteria weighted algorithm computes match scores automatically."*

---

## PART 10 — SECURITY HIGHLIGHTS (30 sec)
> *Covers: **Security / Data Protection***

**Say:**
> "Let me quickly highlight the security features."

- **Password Encryption** — bcrypt hashing, never plain text
- **Secure Sessions** — encrypted, stored in MongoDB, HTTP-only cookies
- **Input Validation** — all form inputs validated and sanitized server-side
- **Protected Routes** — admin panel and user pages require authentication
- **Image Validation** — file type and 5MB size limit enforced
- **NoSQL Injection Prevention** — MongoDB input sanitization middleware

> **[Evaluator note — Security]** *"Multi-layered: encrypted passwords, secure sessions, input validation, and route guards."*

---

## PART 11 — CLOSING (1 min)

**Say:**
> "To summarize, here's what the system covers from the evaluation criteria:"

| Criterion | Demonstrated Feature |
|---|---|
| Add / Create | Report items, register, submit claims, add categories/locations |
| Edit / Update | Edit items, update profile, update claim status, manage users |
| Delete / Remove | Delete items, reject reports, withdraw claims |
| Search / Filter | Filter by category, type, status, date, keyword |
| Generate / Report | Statistics dashboard with charts, tables, and rankings |
| Print / Export | Export CSV, Print Report |
| Compute / Calculate | Success rate %, avg days to claim, matching algorithm scores |
| Usability | Clean UI, flash messages, intuitive navigation |
| Performance | Cloud deployment, caching, fast response |
| Reliability | MongoDB Atlas, persistent sessions, error handling |
| Security | Bcrypt, secure sessions, input validation, route protection |
| Accessibility | Fully responsive, Bootstrap 5, works on all browsers/devices |
| User Experience | Dark mode, loading indicators, auto-alerts, character counters |

> "Thank you! I'm open to any questions."

---

## PRE-PRESENTATION CHECKLIST

- [ ] Test user account ready (verified, logged in)
- [ ] Admin account credentials ready
- [ ] At least **1 pending item** to approve live during the demo
- [ ] At least **1 approved Found item** for the claim demo
- [ ] **Sample image** on desktop for the report form
- [ ] Statistics page has data (charts visible)
- [ ] Render site is live — open it 2 minutes early so it's not asleep
- [ ] Both tabs open: main site + `/admin`

---

## QUICK REFERENCE — IF ASKED ABOUT A SPECIFIC CRITERION

| They ask about... | Go to... |
|---|---|
| Add/Create | Report form (Part 6), Admin approve pending (Part 9B), Add category (Part 9E) |
| Edit/Update | Admin edit item (Part 9C), Settings (Part 7), Claim status update (Part 9D) |
| Delete/Remove | Admin delete item (Part 9C), Reject item (Part 9B), Withdraw claim (Part 7) |
| Search/Filter | Lost Items filters (Part 3), Admin All Items filter (Part 9C) |
| Generate/Report | Statistics charts (Part 9G) |
| Print/Export | Export CSV + Print buttons (Part 9G) |
| Compute/Calculate | Statistics metrics (Part 9G), Matching algorithm (Part 9H) |
| Security | Part 10 |
| Usability | Home page (Part 1), Dark mode (Part 2) |
| Accessibility | Responsive design demo (Part 2) |
| User Experience | Flash messages, dark mode, spinners, dark mode (Parts 2, 6) |
