# NOTRE DAME OF MIDSAYAP COLLEGE
## COLLEGE OF INFORMATION TECHNOLOGY AND ENGINEERING
### Midsayap, Cotabato, Philippines

# CAMPUS LOST & FOUND MANAGEMENT SYSTEM
*An AI-Powered Web-Based Lost and Found Item Management and Recovery Platform*

**A Software Engineering 2 Project Documentation**

- **Prepared by:** [STUDENT NAME 1] (DeathKnell837)
- **Submitted to:** [INSTRUCTOR NAME], Faculty, CITE
- **Academic Year:** 2025–2026
- **Date:** October 2026

---

## TABLE OF CONTENTS
- **CHAPTER 1 – INTRODUCTION**
  - 1.1 Background
  - 1.2 Problem Statement
  - 1.3 Objectives
  - 1.4 Scope and Delimitation
  - 1.5 Significance
- **CHAPTER 2 – RELATED SYSTEMS AND TECHNOLOGIES**
  - 2.1 Technologies
- **CHAPTER 3 – REQUIREMENTS ANALYSIS**
  - 3.1 Stakeholders
  - 3.2 User Roles
- **CHAPTER 4 – SYSTEM ANALYSIS**
  - 4.1 Context Diagram
  - 4.2 Use Case Diagram
  - 4.3 Use Case Descriptions
- **CHAPTER 5 – SYSTEM DESIGN**
  - 5.1 System Architecture
  - 5.2 ERD
- **CHAPTER 6 – USER INTERFACE DESIGN**
  - 6.1 Screen Designs
  - 6.2 Navigation Flow
- **CHAPTER 7 – IMPLEMENTATION**
  - 7.1 Development Environment
  - 7.2 System Modules
  - 7.3 Screenshots of the Final System
- **CHAPTER 8 – TESTING**
  - 8.1 Test Plan
  - 8.2 Test Cases
  - 8.3 Test Results
  - 8.4 Bugs Found and Fixes
- **CHAPTER 9 – CONCLUSION AND RECOMMENDATIONS**
  - 9.1 Conclusion
  - 9.2 Recommendations
- **REFERENCES**
- **APPENDICES**
  - Appendix A: Complete System API Endpoints
  - Appendix B: NDMC Campus Locations Inventory (Buildings 1–42)
  - Appendix C: System Environment Configuration Reference

---

# CHAPTER 1 – INTRODUCTION

## 1.1 Background
In tertiary educational institutions such as Notre Dame of Midsayap College (NDMC), the daily movement of thousands of students, faculty members, administrative staff, and campus visitors across multiple academic complexes, laboratories, recreational grounds, and service departments inevitably leads to the frequent misplacement and loss of valuable personal belongings. Among the commonly misplaced items are essential student identification cards, high-value textbooks, scientific and graphing calculators, electronic peripherals (including smartphones, laptops, chargers, and wireless earbuds), keys, tumblers, and personal accessories.

Traditionally, the handling of lost and found belongings across the NDMC campus has relied upon informal, decentralized, and manual mechanisms. When an item is found, the finder either surrenders it to the nearest guardhouse (such as Guard House Gate 02 or the Chief Security Office), submits it to a departmental faculty lounge, posts an announcement on personal or student-council social media groups, or leaves the item where it was discovered. Conversely, students and personnel who lose items are forced to physically inspect numerous departmental offices, guard posts, and student centers, hoping someone turned their property in.

This traditional approach suffers from significant operational drawbacks: lack of a unified searchable inventory, vulnerability to fraudulent claims without rigorous ownership verification, physical item accumulation and clutter at security offices, and the absence of direct, automated communication channels between finders and owners. To address these systemic inefficiencies, the Campus Lost & Found Management System was designed, developed, and deployed. Built upon modern web technologies (Node.js, Express.js, MongoDB Atlas, Bootstrap 5) and enhanced with cutting-edge Multimodal Generative AI (Google Gemini 2.0/2.5 Flash), the system bridges the communication and logistical gap by providing a centralized, accessible, transparent, and intelligent platform for reporting, searching, matching, and recovering campus belongings.

## 1.2 Problem Statement
The management of misplaced and found property in a bustling campus environment presents severe logistical and security challenges when conducted without an organized digital infrastructure. Specifically, the system was developed to resolve three (3) critical problems:

1. **Decentralized & Inefficient Tracking:** Campus lost and found operations are fragmented across 42 distinct campus buildings, departmental offices, and security guard posts without a single centralized registry. This lack of a unified repository forces students to wander across campus checking multiple offices, resulting in low recovery rates, unnecessary physical strain, and eventual abandonment of unclaimed items.
2. **Lack of Ownership Verification & High Fraud Risk:** Traditional surrender-and-claim protocols rely on casual visual inspection without formalized proof of ownership. Consequently, campus custodians are exposed to fraudulent claims, accidental handover to incorrect parties, or legal ambiguity regarding custodian liability. There is no recorded audit trail or photographic comparison to establish rightful ownership before property release.
3. **Information Bottleneck & Absence of Automated Matching:** There is no synchronized communication channel connecting the individual who lost an item with the individual who found it. Manual paper logbooks and informal social media posts lack semantic searching, location filtering, and category indexing. Misplaced belongings often remain in security storage indefinitely because owners describe items using different terminology than finders.

## 1.3 Objectives

### 1.3.1 General Objective
To design, develop, test, and deploy a secure, web-based, AI-enhanced Campus Lost & Found Management System for Notre Dame of Midsayap College that centralizes property reporting, automates lost-to-found matching using multimodal artificial intelligence, establishes a verifiable ownership claiming protocol, and streamlines administrative custody and recovery operations.

### 1.3.2 Specific Objectives
- Develop secure user registration, session-based authentication with bcrypt password encryption, and role-based access control distinguishing regular campus users (Students, Faculty, Staff) from Administrators.
- Implement a comprehensive reporting workflow for lost and found items featuring category categorization (10 standard categories), location selection from 70+ NDMC campus landmarks (Buildings 1 through 42), and cloud-hosted photo uploads via Cloudinary.
- Construct an advanced multi-criteria search and filtering system allowing instant discovery by keyword regex, category, date intervals, and campus locations.
- Integrate Google Gemini 2.0/2.5 Flash multimodal AI and a weighted scoring algorithm to compute similarity percentages (0–100%) between lost and found items based on categories, geographic proximity, temporal proximity, and textual/visual features.
- Embed a real-time conversational AI Assistant chat widget capable of understanding natural-language campus queries, analyzing uploaded photos, and delivering instant candidate item recommendations.
- Formulate a fraud-resistant claim processing module requiring detailed ownership proof descriptions, identifying characteristics, multiple proof photo attachments, and a transparent 4-stage claim status stepper.
- Build a comprehensive administrative control panel with analytical KPI cards, pending report moderation, claim approval/rejection workflows with automatic competing claim rejection, campus location/category management, and CSV/print data reporting.
- Deploy the completed application on Render.com with MongoDB Atlas cloud clustering and implement Progressive Web App (PWA) capabilities for mobile installation and offline resilience.

## 1.4 Scope and Delimitation

### 1.4.1 Project Scope
The functional and operational boundaries of the Campus Lost & Found Management System encompass:
- **User management:** Account registration, secure credential login, password reset via encrypted email tokens, profile updating, and notification preference configuration.
- **Item inventory lifecycle:** Public reporting of lost and found items, pending review queue for administrators, public publication upon approval, status updates (pending, approved, claimed, rejected), and permanent item resolution.
- **Campus geographical integration:** Full mapping of 70+ Notre Dame of Midsayap College buildings, classrooms, gates, laboratories, and lounges, with a crowdsourced mechanism for users to suggest new campus locations.
- **Claim adjudication pipeline:** Formal claim submission, ownership proof submission with up to 3 evidence photos, administrative timeline auditing, priority setting (low, normal, high), and automated resolution.
- **AI intelligence services:** Multi-modal visual comparison, semantic query parsing, conversational chatbot guidance, and algorithmic candidate ranking.
- **System reporting & analytics:** Live statistical calculation of campus recovery success rates, average turnaround days to claim, monthly trend charts, category distributions, top loss locations, and tabular CSV spreadsheet exports.

### 1.4.2 Project Delimitations
- **Geographical Boundary:** The system is designed strictly for items lost or found within the premises and academic facilities of Notre Dame of Midsayap College. Municipal or off-campus lost items are outside the system's operational jurisdiction.
- **Exclusion of Financial Transactions:** The system explicitly prohibits monetary transactions, bounty payments, or cash rewards for finding items to eliminate extortion and counterfeit recovery schemes.
- **Physical Custody Mediation:** The web platform coordinates digital identification, claims, and verification; physical turnover and custody of high-value items remain under the authorized supervision of the NDMC Chief Security Office.

## 1.5 Significance
- **Significance to Students:** Significantly reduces emotional stress and financial burden caused by lost academic requirements, calculators, gadgets, and identification cards by accelerating item recovery through a 24/7 accessible platform.
- **Significance to Faculty & Staff:** Offers an effortless, organized medium to log items found in classrooms and corridors without having to personally store property or interrupt teaching responsibilities.
- **Significance to Campus Security Personnel & Administration:** Eliminates physical clutter in security logbooks and storage rooms, minimizes administrative overhead, provides auditable proof of release, and supplies data-driven insights into campus security hotspots.
- **Significance to Future Researchers & IT Students:** Provides a documented reference architecture for modern Node.js/Express web applications integrating cloud NoSQL databases with applied Generative AI and Multimodal Vision for community service systems.

---

# CHAPTER 2 – RELATED SYSTEMS AND TECHNOLOGIES

## 2.1 Technologies
The system was engineered utilizing an industry-standard full-stack web architecture selected for scalability, security, rapid response times, and ease of cross-platform deployment:

| Layer | Technology / Library | Version | Technical Purpose in Project |
|---|---|---|---|
| Backend Runtime | Node.js | v18.0+ | Asynchronous, event-driven JavaScript server runtime handling high-concurrency requests |
| Web Framework | Express.js | ^4.18.2 | RESTful routing, middleware orchestration, request parsing, and HTTP pipeline management |
| Database | MongoDB Atlas | v7.0+ (Cloud) | Fully managed NoSQL document database providing dynamic schemas and JSON data models |
| ODM Library | Mongoose | ^8.0.3 | Schema definition, relationship population, data validation hooks, and text indexing |
| Artificial Intelligence | Google Gemini 2.0 / 2.5 Flash | ^0.24.1 (@google/generative-ai) | Multimodal visual item comparison, image feature extraction, and conversational search |
| Vision Embeddings | Hugging Face CLIP Inference | clip-vit-base-patch32 | 512-dimensional vector embedding extraction for cosine similarity visual matching |
| Templating Engine | EJS (Embedded JavaScript) | ^3.1.9 | Server-side HTML rendering with dynamic variable injection and component partials |
| Layout Framework | express-ejs-layouts | ^2.5.1 | Master layout wrapper supporting header, footer, navigation bar, and modular views |
| CSS Framework | Bootstrap 5 | v5.3.2 | Mobile-first responsive grid system, form controls, modal dialogs, and utility classes |
| Iconography | Font Awesome | v6.5.1 | Vector icons across all UI modules ensuring zero dependency on inconsistent emojis |
| Password Security | bcryptjs | ^2.4.3 | Salted, one-way password hashing (10 salt rounds) securing user authentication credentials |
| Session Store | connect-mongo & express-session | ^5.1.0 / ^1.17.3 | Server-side persistent session management stored in MongoDB Atlas with TTL auto-cleanup |
| Media Storage | Cloudinary SDK | ^1.41.3 | Cloud-based image storage, automatic WebP format compression, and CDN image delivery |
| File Uploads | Multer & multer-storage-cloudinary | ^2.0.0 / ^4.0.0 | Multipart/form-data upload handling with 5MB file size limits and image mime-type validation |
| Transactional Email | Nodemailer | ^7.0.11 | Automated email dispatching via Gmail SMTP and Brevo HTTP API for claim and approval alerts |
| Code & Utilities | qrcode & sharp | ^1.5.4 / ^0.33.1 | Dynamic QR code generation for campus lost item posters and server-side image processing |
| Hosting & CI/CD | Render.com | Cloud PAAS | Automated cloud deployment from GitHub master branch with zero-downtime health monitoring |

---

# CHAPTER 3 – REQUIREMENTS ANALYSIS

## 3.1 Stakeholders
- **Students (Primary End-Users):** Enrolled college and basic education students who require a frictionless, mobile-accessible medium to report lost items, search for found property, and submit verifiable ownership claims without bureaucratic hurdles.
- **Faculty and Staff:** Professors, instructors, and non-teaching personnel who frequently encounter forgotten items in lecture halls, laboratories, and offices, needing a rapid method to log property directly into the official campus record.
- **Campus Security Personnel:** Campus security officers and guards stationed across Gates 1 and 2 and the Chief Security Office who act as physical custodians of property. They require an auditable digital register that validates claims before releasing property.
- **System Administrators:** College of Information Technology & Engineering administrators who monitor system uptime, manage user privileges, moderate reported content, and extract campus trend telemetry.
- **College Administration:** Institutional leaders of Notre Dame of Midsayap College who benefit from enhanced campus welfare, modern digital service offerings, and data-driven loss prevention metrics.

## 3.2 User Roles
The system implements a strict Role-Based Access Control (RBAC) model defining two primary operational roles:
1. **Regular User (Student / Faculty / Staff):** Accounts created through public registration. Authenticated users can report lost items, report found items, browse the approved public catalog, submit claims on found items, withdraw their own pending claims, chat with the AI Assistant, manage personal notification settings, and track personal claim statuses.
2. **Administrator:** Privileged accounts accessing the dedicated `/admin` portal. Administrators possess full administrative rights over the entire system, including moderation of pending item submissions, adjudication of claim requests, execution of AI item matching routines, management of campus categories and locations, activation/deactivation of user accounts, and generation of analytical reports and CSV exports.

### 3.2.1 Role-Based Permissions Matrix
| System Function / Action | Guest (Unauthenticated) | Regular User (Student/Faculty) | Administrator |
|---|---|---|---|
| Browse Home & Public Listings | Allowed (View Only) | Allowed (Full Access) | Allowed (Full Access) |
| Search Items by Keyword & Filters | Allowed | Allowed | Allowed |
| Chat with AI Assistant Widget | Allowed (General Inquiries) | Allowed (Personalized Matching) | Allowed |
| User Registration & Login | Allowed | N/A (Already Logged In) | N/A (Admin Session) |
| Report Lost / Found Items | Blocked (Redirects to Login) | Allowed (Creates Pending Report) | Allowed |
| Submit Item Claim Request | Blocked (Requires Login) | Allowed (Requires Ownership Proof) | Allowed |
| Track Personal Claims & Stepper | Blocked | Allowed (Personal Claims Only) | Allowed (All System Claims) |
| Withdraw Own Pending Claim | Blocked | Allowed | Allowed |
| Update Personal Profile & Password | Blocked | Allowed | Allowed |
| Access Admin Dashboard (/admin) | Blocked (403 / Redirect) | Blocked (Access Denied) | Allowed (Full Control) |
| Approve / Reject Pending Items | Blocked | Blocked | Allowed |
| Edit / Delete Any Item Report | Blocked | Blocked | Allowed |
| Review Claim Evidence & Timeline | Blocked | Blocked | Allowed |
| Approve / Reject Claims | Blocked | Blocked | Allowed (Auto-Rejects Competing) |
| Run AI Item Matching Engine | Blocked | Blocked | Allowed (Triggers Matching) |
| Manage Categories (CRUD) | Blocked | Blocked | Allowed |
| Manage Locations & Review Suggestions | Blocked | Blocked | Allowed |
| Activate / Deactivate User Accounts | Blocked | Blocked | Allowed |
| View Analytics & Export CSV Reports | Blocked | Blocked | Allowed |

---

# CHAPTER 4 – SYSTEM ANALYSIS

## 4.1 Context Diagram
```
                 +-----------------------+
                 |  Student / Faculty    |
                 |  (Regular User)       |
                 +-----------------------+
                    |                 ^
     Item Reports,  |                 |  Item Catalog, Claim Status,
     Claims, Proofs |                 |  AI Assistant Answers, Alerts
                    v                 |
             +-------------------------------+       Item Images       +----------------+
             |                               | ----------------------> |                |
             |     CAMPUS LOST & FOUND       | <---------------------- |   Cloudinary   |
             |     MANAGEMENT SYSTEM         |       Image URLs        |   Media CDN    |
             |                               |                         +----------------+
             +-------------------------------+                                 
                |           |             |           Image Base64     +----------------+
     Approval / |           |             +--------------------------> |  Google Gemini |
     Rejection, |           | Notifications                            |  2.5 Flash API |
     Mod Notes  |           v                                          +----------------+
                |   +---------------+                                           
                |   | Nodemailer /  |                                           
                |   | Gmail / Brevo |                                           
                v   +---------------+                                           
     +-----------------------+                                                  
     |     Administrator     |                                                  
     +-----------------------+                                                  
```

## 4.2 Use Case Diagram
The system includes 3 primary actors (Student, Faculty/Staff, and Administrator) interacting with 24 distinct use cases:
- **Student & Faculty/Staff (Left):**
  1. Register Account
  2. User Login
  3. Report Lost Item (includes Email Notification)
  4. Report Found Item (includes Email Notification)
  5. View Lost Items (includes Search Items)
  6. View Found Items (includes Search Items)
  7. Submit Claim
  8. Track Claim Status
  9. View Personal Dashboard
  10. Update Profile & Settings
  11. Withdraw Claim
- **Shared Use Case (Center):**
  23. Search Items
- **Internal Included Use Case (Bottom):**
  24. Email Notification
- **Administrator (Right):**
  12. Admin Login
  13. View All Reports
  14. Verify Lost Report (includes Email Notification)
  15. Verify Found Report (includes Email Notification)
  16. Approve Claim (includes Email Notification, extended by Reject Other Claims)
  17. Reject Claim (includes Email Notification)
  18. Edit / Delete Items
  19. Generate Statistics & CSV Export
  20. Manage Item Categories
  21. Manage Locations & Suggestions
  22. Manage User Accounts

## 4.3 Use Case Descriptions

### UC-01: Report Lost / Found Item
- **Primary Actors:** Student, Faculty/Staff
- **Pre-conditions:** User must be authenticated and possessing an active account.
- **Trigger:** User clicks 'Report Lost' or 'Report Found' button.
- **Main Flow:**
  1. System displays report form with input fields.
  2. User enters Item Name, Category, Location, Date, Description, and Contact Info.
  3. User attaches a photograph (validated for image mime-type and <=5MB limit).
  4. Client provides live photo preview and character count telemetry.
  5. User submits form; server sanitizes input and uploads image to Cloudinary.
  6. Server records item in MongoDB with status = 'pending'.
  7. System triggers matchingService to compute potential matches against existing approved items.
  8. System displays confirmation flash message and redirects user to dashboard.
- **Post-conditions:** Item is created in database awaiting administrator verification.

### UC-02: Submit Claim Request
- **Primary Actors:** Student, Faculty/Staff
- **Pre-conditions:** User is logged in; target item has type = 'found' and status = 'approved'.
- **Trigger:** User clicks 'Claim This Item' on an approved item's details page.
- **Main Flow:**
  1. System renders Claim Form alongside a sticky item summary card.
  2. User fills detailed description of ownership and unique identifying features.
  3. User uploads up to 3 proof photos (receipts, past photos with item, purchase invoice).
  4. User selects preferred contact method (Email, Phone, Both).
  5. Server validates claim data, checks for existing pending claims by user, and saves record with status = 'pending'.
  6. System registers audit entry in claim timeline.
  7. System redirects user to 'My Claims' page with status tracking stepper.
- **Post-conditions:** Claim is registered in ClaimRequest collection with status 'pending' awaiting admin review.

### UC-03: Verify Item Report (Admin)
- **Primary Actors:** Administrator
- **Pre-conditions:** Admin is authenticated in /admin portal; pending items exist.
- **Trigger:** Admin opens 'Pending Review' tab.
- **Main Flow:**
  1. Admin reviews item photo, description, location, and reporter identity.
  2. Admin clicks 'Approve': System updates item status to 'approved', publishes it to the public directory, and sends confirmation email.
  3. Alternatively, Admin clicks 'Reject': System opens modal, admin supplies rejection rationale, status changes to 'rejected', and reporter is notified.
- **Post-conditions:** Item becomes publicly discoverable or is archived with rejection reason.

### UC-04: Evaluate Claim Request (Admin)
- **Primary Actors:** Administrator
- **Pre-conditions:** Admin is authenticated; a claim is submitted with status 'pending' or 'under_review'.
- **Trigger:** Admin opens 'All Claims' and clicks 'Review' on a claim.
- **Main Flow:**
  1. System displays claimant info, proof description, identifying marks, and uploaded proof images.
  2. Admin inspects claimant history and competing claims on the same item.
  3. Admin can set Priority (Low/Normal/High) and update status to 'under_review'.
  4. If proof is satisfactory, Admin clicks 'Approve': Claim status becomes 'approved'; Item status becomes 'claimed'; competing claims auto-rejected; notification emails dispatched.
  5. If proof is insufficient, Admin clicks 'Reject', enters reason, and claimant is notified.
- **Post-conditions:** Claim is adjudicated, item marked claimed, and audit timeline updated.

---

# CHAPTER 5 – SYSTEM DESIGN

## 5.1 System Architecture
The system employs a 3-Tier Model-View-Controller (MVC) pattern:
1. **Client Tier:** Web Browser / Mobile Browser / PWA (Service Worker v2, Web App Manifest).
2. **Application Tier:** Node.js & Express.js server hosted on Render.com with modular routing, security middleware, Mongoose models, and services (matchingService, geminiService, emailService).
3. **Data Persistence Tier:** MongoDB Atlas cloud cluster storing collections for users, items, claimrequests, categories, locations, and sessions.

## 5.2 ERD (Entity Relationship Diagram)
- **User Collection:** `_id`, `username`, `email`, `password`, `role`, `isActive`, `phoneNumber`, `notificationPreferences`, `createdAt`, `updatedAt`.
- **Item Collection:** `_id`, `itemName`, `category` (ref: Category), `description`, `location`, `locationId`, `customLocation`, `imagePath`, `embedding` (512-float vector), `contactInfo`, `reportedBy` (ref: User), `reporterName`, `reporterEmail`, `type` (lost/found), `status` (pending/approved/claimed/rejected), `dateLostFound`, `dateReported`, `claimedBy`, `potentialMatches`, `createdAt`, `updatedAt`.
- **ClaimRequest Collection:** `_id`, `item` (ref: Item), `claimant` (ref: User), `description`, `proofOfOwnership`, `proofImages`, `identifyingFeatures`, `contactPhone`, `preferredContactMethod`, `status` (pending/under_review/approved/rejected/withdrawn), `reviewedBy` (ref: User), `reviewedAt`, `rejectionReason`, `priority`, `timeline`, `createdAt`, `updatedAt`.
- **Category Collection:** `_id`, `name`, `description`, `icon`, `isActive`, `createdAt`, `updatedAt`.
- **Location Collection:** `_id`, `name`, `description`, `status` (approved/pending), `isActive`, `suggestedBy` (ref: User), `createdAt`, `updatedAt`.

---

# CHAPTER 6 – USER INTERFACE DESIGN

## 6.1 Screen Designs
1. **Home Page:** Hero section with radar-sweep animation, quick action buttons ('Report Lost', 'Report Found'), live statistics counters, How It Works guide, and recent lost/found item cards.
2. **Lost & Found Directories:** Tactile category filter pills with live item count badges, multi-criteria filter bar, and a responsive 4-column card grid (`col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3`) with uniform heights, glassmorphic badges, and location chips.
3. **Item Details:** Full-resolution photo preview with zoom lightbox, reporter contact buttons, social share buttons, and potential match recommendation sidebar.
4. **Report Form:** Image upload with instant client preview, live character counter, campus location selector with custom suggestion option, and future date prevention.
5. **Claim Form:** Sticky item summary card, proof of ownership textarea, multi-image proof upload (up to 3 photos), and contact preference selectors.
6. **User Dashboard & My Claims:** Personal reporting metrics, report list, and a 4-step claim status stepper (Submitted -> Under Review -> Action Taken -> Resolution).
7. **Admin Dashboard & Review Queue:** System KPI cards, pending approval queue with quick action modals, user management table, category/location CRUD editors, and CSV export.
8. **AI Assistant Drawer:** Floating Glassmorphic chat widget providing conversational natural-language item search and photo attachment analysis.

## 6.2 Navigation Flow
Clear 2-click shallow navigation structure connecting Home, Public Catalogs, Detail Pages, Claim Forms, User Dashboard, and Admin Control Center.

---

# CHAPTER 7 – IMPLEMENTATION

## 7.1 Development Environment
- **Operating System:** Windows 11 Pro 64-bit
- **IDE:** Visual Studio Code v1.90+
- **Runtime:** Node.js v18.17+ / v20.10+
- **Database:** MongoDB Atlas M0 Sandbox Cluster
- **Media CDN:** Cloudinary SDK v1.41.3
- **Hosting:** Render.com Linux Container

## 7.2 System Modules
1. Authentication & Access Control Module (`authController.js`, `middleware/auth.js`)
2. Item Inventory & Catalog Module (`itemController.js`, `models/Item.js`)
3. Search & Filter Engine (`routes/search.js`, `itemController.js`)
4. Item Matching Algorithm Module (`services/matchingService.js`)
5. Multimodal AI Assistant Module (`services/geminiService.js`, `controllers/chatController.js`)
6. Claim Adjudication Module (`claimController.js`, `models/ClaimRequest.js`)
7. Administration & Analytics Module (`adminController.js`)
8. Transactional Notification Module (`services/emailService.js`)

## 7.3 Screenshots of the Final System
- **Figure 7.1:** Lost Items Directory (Responsive 4-Column Grid, Dynamic Category Pills, Glassmorphic Badges)
- **Figure 7.2:** Found Items Directory (Campus Location Chips, Clean Typography, Verified Item Listings)
- **Figure 7.3:** Admin Control Panel (System Analytics, Pending Report Queue, Item Management)
- **Figure 7.4:** User Dashboard & 4-Step Claim Status Stepper (Submitted -> Under Review -> Action -> Resolution)

---

# CHAPTER 8 – TESTING

## 8.1 Test Plan
Validation across functional requirements, security boundaries, database transactions, and UI responsiveness using automated scripts (`scripts/verify-all.js`) and manual test procedures.

## 8.2 Test Cases
| Test ID | Test Scenario | Input Data / Action | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-01 | User Registration (Valid) | New username, valid email, 8-char password | Account created; password hashed with bcrypt; redirect to login | Account saved; bcrypt hash verified; redirected | PASSED |
| TC-02 | Duplicate Registration | Existing registered email or username | System rejects registration; shows duplicate flash error | Duplicate key 11000 caught; user warned | PASSED |
| TC-03 | User Authentication | Correct username/email and password | Session established in MongoDB; user dashboard rendered | Session active; user dashboard loaded | PASSED |
| TC-04 | Invalid Login Attempt | Valid username with incorrect password | Authentication denied; error flash message displayed | Login rejected; error message displayed | PASSED |
| TC-05 | Report Lost Item Submission | Valid item name, category, location, date, photo | Record saved with status='pending'; photo on Cloudinary | Item created; Cloudinary URL stored; status pending | PASSED |
| TC-06 | Future Date Validation | Date lost set to tomorrow's date | Validation rejects input; form prompts for valid date | Datepicker max attribute and server reject future date | PASSED |
| TC-07 | File Size Exceeding 5MB | Upload 8MB high-resolution raw image | Multer LIMIT_FILE_SIZE triggered; error returned | Upload rejected with 5MB maximum file size alert | PASSED |
| TC-08 | Public Search & Filters | Query 'calculator', category 'Stationery' | Only matching approved items returned in result grid | Search returned exact matching items accurately | PASSED |
| TC-09 | Submit Claim with Proof | Ownership description, identifying marks, proof image | Claim created in ClaimRequest collection with status 'pending' | Claim saved; timeline audit entry created; user alerted | PASSED |
| TC-10 | Duplicate Claim Block | Submit second claim on same item by same user | System blocks duplicate claim; redirects to My Claims | Duplicate check prevented duplicate claim creation | PASSED |
| TC-11 | Admin Item Approval | Admin clicks 'Approve' on pending report | Item status='approved'; item visible in public catalog | Item published publicly; confirmation email dispatched | PASSED |
| TC-12 | Admin Claim Approval | Admin clicks 'Approve' on valid claim | Claim='approved'; Item='claimed'; competing claims rejected | Item marked claimed; competing claims auto-rejected | PASSED |
| TC-13 | AI Matching Calculation | Run matching between Casio fx-991ES lost/found | Similarity score computed with category/location/text | Calculated 85% match score with reasoning | PASSED |
| TC-14 | AI Chatbot Search Query | Post message 'I lost my scientific calculator' | Gemini parses intent, queries database, returns matches | Chatbot returned natural reply and item link in <800ms | PASSED |
| TC-15 | CSV Data Export | Admin clicks 'Export CSV' on items list | Server generates RFC-4180 compliant CSV stream | Browser downloaded full item CSV spreadsheet | PASSED |

## 8.3 Test Results
- **Authentication & Security:** 4 / 4 PASSED (100%)
- **Item Reporting & File Handling:** 3 / 3 PASSED (100%)
- **Search & Catalog Filtering:** 1 / 1 PASSED (100%)
- **Claim Processing & Adjudication:** 3 / 3 PASSED (100%)
- **AI Multimodal Matching & Chat:** 2 / 2 PASSED (100%)
- **Admin Moderation & Data Export:** 2 / 2 PASSED (100%)
- **Overall Total:** 15 / 15 Test Cases PASSED (100% Pass Rate)

## 8.4 Bugs Found and Fixes
1. **BUG-01: MongoDB ObjectId Cast Errors on Sanitization** — Input sanitization regex stripped valid hex characters from 24-character ObjectIds. Fixed by exempting valid ObjectId hex strings.
2. **BUG-02: Render.com Container Deployment Failure** — Server bound strictly to localhost ('127.0.0.1'). Fixed by binding explicitly to '0.0.0.0'.
3. **BUG-03: Blocking Startup on Database Connection Delay** — Server blocked waiting for MongoDB ping, causing Render 502 timeouts. Fixed by non-blocking asynchronous connection.
4. **BUG-04: False Positive 429 Rate Limiting** — In-memory rate limiter blocked rapid test logins. Fixed by tuning thresholds to 100 req/min and excluding static files.
5. **BUG-05: Grid Cramping & Title Truncation** — 6-column `col-xl-2` grid cramped cards to ~180px. Refactored to responsive 4-column `col-xl-3` layout with 2-line clamps.
6. **BUG-06: Browser Caching of Seed Mockup Photos** — Browsers cached outdated placeholders. Fixed by implementing `Cache-Control: no-cache` and `?v=2026` versioning.

---

# CHAPTER 9 – CONCLUSION AND RECOMMENDATIONS

## 9.1 Conclusion
The Campus Lost & Found Management System successfully fulfills all functional, technical, and operational objectives established for this Software Engineering 2 project. By replacing informal, scattered, and paper-based lost property handling with a centralized web platform, the system significantly improves property recovery rates, eliminates administrative bottlenecks, and safeguards against fraudulent claims. The novel integration of Multimodal Generative AI (Google Gemini 2.0/2.5 Flash) provides an intelligent dimension that automatically identifies candidate matches between lost and found items using visual and semantic cues.

## 9.2 Recommendations
1. **Push Notification Expansion:** Integrate native Web Push Notifications for instant device alerts when a potential match is reported.
2. **Hardware Asset Integration:** Implement student RFID/NFC card scanning or QR asset tagging for pre-registered laptops and calculators.
3. **Multi-Campus Federation:** Extend the architecture across the Notre Dame Educational Association (NDEA) network.
4. **Mediated In-App Chat:** Provide a secure in-app messaging channel between finders and owners mediated by security personnel.

---

# REFERENCES
- Google Cloud. (2025). Gemini 2.0 Flash Documentation and Multimodal API Guide. Google AI for Developers. https://ai.google.dev/docs
- OpenJS Foundation. (2024). Node.js v20.x Long Term Support (LTS) Documentation. https://nodejs.org/docs/
- Express.js Foundation. (2024). Express 4.x API Reference and Middleware Architecture Guide. https://expressjs.com/
- MongoDB Inc. (2024). MongoDB Atlas Cloud Database Manual and Aggregation Framework. MongoDB Documentation. https://www.mongodb.com/docs/
- Mongoose ODM. (2024). Mongoose v8.0 Guide: Schemas, Middleware, and Validation. https://mongoosejs.com/docs/
- Bootstrap Team. (2024). Bootstrap v5.3 Framework: Responsive Layouts and Component Library. https://getbootstrap.com/
- Cloudinary Ltd. (2024). Cloudinary Node.js SDK and Image Transformation Guide. https://cloudinary.com/documentation
- Pressman, R. S., & Maxim, B. R. (2020). Software Engineering: A Practitioner's Approach (9th ed.). McGraw-Hill Education.
- Sommerville, I. (2016). Software Engineering (10th ed.). Pearson Education.
- Fielding, R. T. (2000). Architectural Styles and the Design of Network-based Software Architectures (Doctoral dissertation). University of California, Irvine.

---

# APPENDICES

## Appendix A: Complete System API Endpoints
| HTTP Method | Route Endpoint | Access Level | Module / Purpose |
|---|---|---|---|
| GET | / | Public | Renders Home Page with recent items and live statistics |
| GET | /items/lost | Public | Paginated lost items catalog with category and date filters |
| GET | /items/found | Public | Paginated found items catalog with location filters |
| GET | /items/claimed | Public | Catalog of successfully reunited and claimed items |
| GET | /items/:id | Public | Detailed view of single item, gallery, and potential matches |
| GET | /search | Public | Multi-parameter search engine across keyword, type, category |
| POST | /api/chat | Public | Conversational AI Assistant endpoint supporting multimodal photos |
| GET / POST | /auth/login | Guest Only | User login form and credential verification |
| GET / POST | /auth/register | Guest Only | Account creation with bcrypt encryption |
| GET | /auth/logout | Authenticated | Destroys session and clears cookies |
| GET / POST | /report/lost | Authenticated | Report lost item form and Cloudinary upload submission |
| GET / POST | /report/found | Authenticated | Report found item form and Cloudinary upload submission |
| GET / POST | /claims/form/:itemId | Authenticated | Submit ownership claim request with proof photos |
| GET | /claims/my-claims | Authenticated | User claims tracking page with 4-step status stepper |
| POST | /claims/:id/withdraw | Authenticated | Allows user to cancel a pending claim request |
| GET | /user/dashboard | Authenticated | User dashboard with personal reporting telemetry |
| GET / POST | /user/settings | Authenticated | Profile update, password change, notification toggles |
| GET / POST | /admin/login | Guest / Admin | Dedicated administrator authentication portal |
| GET | /admin/dashboard | Administrator | Admin control center with overview statistics and pending queue |
| GET | /admin/pending | Administrator | Moderation queue of pending item submissions |
| POST | /admin/items/:id/approve | Administrator | Approves item report and publishes to catalog |
| POST | /admin/items/:id/reject | Administrator | Rejects item report with recorded justification |
| GET | /admin/items | Administrator | Inventory list of all items with status filters and CSV export |
| GET / POST | /admin/items/edit/:id | Administrator | Full editing of item metadata, status, and photos |
| POST | /admin/items/delete/:id | Administrator | Permanent removal of item record and associated claims |
| GET | /admin/claims | Administrator | Claims adjudication portal with priority sorting |
| POST | /admin/claims/:id/approve | Administrator | Approves claim, marks item claimed, rejects competitors |
| POST | /admin/claims/:id/reject | Administrator | Rejects claim with reason sent to claimant |
| GET / POST | /admin/matching | Administrator | AI Matching console; computes visual and semantic scores |
| GET | /admin/statistics | Administrator | Analytics dashboard with Chart.js trends and print view |
| GET | /admin/export/csv | Administrator | Exports items, claims, or statistics as CSV spreadsheets |
| GET / POST | /admin/categories | Administrator | CRUD management for item categories and icons |
| GET / POST | /admin/locations | Administrator | CRUD management for campus locations & user suggestions |
| GET / POST | /admin/users | Administrator | User management; toggle user account active status |

## Appendix B: NDMC Campus Locations Inventory (Buildings 1–42)
| Bldg # | Campus Location Name | Landmark Description / Operational Context |
|---|---|---|
| 1 | Madonna Building | Main Administration & College Classrooms |
| 1a | Facade (Main Entrance) | Main Campus Entrance Gate & Security Guard Post |
| 2 | Madonna Grotto | Outdoor Spiritual Grotto & Garden Pavilion |
| 3 | Old Library Bldg. | Heritage Library, Archive & Study Rooms |
| 4 | College Library Bldg. | Three-Story Modern College Central Library |
| 5 | McGrath Bldg. | College of Arts & Sciences & Audio-Visual Presentation Hall |
| 6 | Student Lounge 1 | Open-Air Student Pavilion 1 |
| 7 | Student Lounge 3 | Student Pavilion 3 |
| 8 | De Mazenod Bldg. | Academic & Religious Education Center |
| 9 | Garage | Student & Staff Motor Vehicle Parking Area |
| 10 | College Canteen | Main Campus Dining Hall & Food Stalls |
| 11 | Student Lounge 2 | Covered Student Study Lounge 2 |
| 12 | Rotonda | Central Campus Rotonda & Circular Park Landmark |
| 13 | Student Lounge | Central Student Recreation & Assembly Lounge |
| 14 | Gym | NDMC Campus Gymnasium & Sports Arena |
| 15 | Carpentry Shop | Campus Maintenance, Engineering & Workshop Facility |
| 16 | Clinic | College Health Clinic & Medical First Aid Center |
| 17 | Primera Hall | Student Activity, Seminar & Conference Hall |
| 18 | Chapel | Historic Campus Spiritual Chapel |
| 19 | Guest House | University Visitor & Faculty Lodge Residence |
| 20 | CCGE Bldg. | College of Computer & Geodetic Engineering Complex |
| 21 | Taekwondo Gym | Martial Arts & Physical Fitness Dojo |
| 22 | Power House | Campus Central Electrical Substation & Generator Facility |
| 23 | Water Pump | Campus Central Water Purification & Supply Facility |
| 24 | Fr. Sullivan Bldg. | Administrative Offices & Faculty Department Rooms |
| 25 | NDMC Chapel | Central University Chapel |
| 26 | Joseph Bldg. | Business Administration & Hospitality Management Complex |
| 27 | Reco House | Religious Community Residence |
| 28 | NDMC Farm | Agricultural & Botanical Research Extension Farm |
| 29 | Ladies Dormitory | Female Student Residence & Living Hall |
| 29a | Refilling Station | Campus Purified Drinking Water Refilling Station |
| 29b | MEMED Office | Media, Educational & Multimedia Resource Department |
| 29c | GSD Office | General Services Department & Custodial Office |
| 29d | Material Recovery Facility 2 | Campus Waste Segregation & Environmental Recycling Center |
| 30 | New Science Laboratory | Modern Chemistry, Biology & Physics Research Laboratories |
| 31 | Water Pump (HS) | High School Water Reservoir & Supply System |
| 32 | HS Gordon Bldg. | Junior High School Classrooms & Faculty Office |
| 33 | IBED Computer Laboratory | Integrated Basic Education Computer & Information Labs |
| 34 | HS Chemistry Laboratory (Old) | Basic Sciences Experimental Laboratory |
| 35 | HS Student Lounge | High School Student Assembly & Recreation Lounge |
| 36 | Bishop Mongeau Bldg. | Senior High School Academic Complex |
| 37 | Clinic (HS) | High School Department Health Clinic |
| 38 | ETD Bldg. | Elementary Training Department Classrooms |
| 38a | ETD Asst. Principal's Office | Elementary Department Administrative Office |
| 39 | ETD Covered Court | Elementary Sports, Physical Education & Play Court |
| 39a | ETD Stage | Elementary Assembly & Performance Stage |
| 40 | Halad Stage | Open-Air Cultural Performance Amphitheater |
| 41 | Chief Security Office | Campus Security Headquarters & Central Lost and Found Depository |
| 41a | Coop Building | Multi-Purpose Cooperative & Campus Bookstore |
| 41b | Guard House Gate 02 | Secondary Campus Entrance Gate & Security Booth |
| 42 | Nursery Play Ground | Kindergarten Recreation & Outdoor Play Area |

## Appendix C: System Environment Configuration Reference
| Variable Name | Configuration Purpose | Production Context |
|---|---|---|
| PORT | Application port | Default 3000 (Set by Render in production) |
| NODE_ENV | Runtime environment mode | 'production' on Render.com, 'development' locally |
| MONGODB_URI | MongoDB Atlas connection string | Encrypted connection URI with cluster credentials |
| SESSION_SECRET | HMAC key for signing session cookies | Cryptographically random secret string |
| CLOUDINARY_CLOUD_NAME | Cloudinary tenant cloud identifier | Account cloud name for media routing |
| CLOUDINARY_API_KEY | Cloudinary client API key | Public API identification key |
| CLOUDINARY_API_SECRET | Cloudinary client API secret | Private secret for authenticated uploads |
| GEMINI_API_KEY | Google Gemini AI API Key | API key from Google AI Studio for Gemini 2.0/2.5 Flash |
| EMAIL_USER | Sender email address | Gmail SMTP sender address (e.g., campus account) |
| EMAIL_PASS | Sender email app password | 16-character Google App Password (not standard password) |
| BREVO_API_KEY | Brevo HTTPS Email API key | Fallback HTTP email dispatcher for cloud platforms |
| AUTO_SEED | Automated sample data populator | 'true' populates 50 items and 42 mockups on first boot |
