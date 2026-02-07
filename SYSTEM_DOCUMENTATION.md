# Campus Lost & Found Management System
## Complete System Documentation

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Design](#4-database-design)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Features & Functionality](#6-features--functionality)
7. [System Workflow](#7-system-workflow)
8. [File Structure Explained](#8-file-structure-explained)
9. [Security Features](#9-security-features)
10. [API Endpoints](#10-api-endpoints)

---

## 1. SYSTEM OVERVIEW

### What is this system?
The **Campus Lost & Found Management System** is a web-based application designed to help students and faculty report lost or found items on campus. It provides a centralized platform where:

- **Users** can report items they've lost or found
- **Administrators** can manage and verify reports
- **Claimants** can submit claims to recover their lost items

### Problem Being Solved
- Lost items on campus often go unclaimed because there's no organized system
- Found items pile up at security offices with no way to match them to owners
- No communication channel between finders and owners

### Solution
This system provides:
- A searchable database of all lost and found items
- An organized claim process with proof verification
- Email notifications when potential matches are found
- Admin oversight to prevent fraud

---

## 2. TECHNOLOGY STACK

### Backend (Server-Side)
| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **Node.js** | Runtime Environment | Runs JavaScript on the server |
| **Express.js** | Web Framework | Handles HTTP requests, routing, middleware |
| **MongoDB** | Database | NoSQL database for flexible data storage |
| **Mongoose** | ODM (Object Data Modeling) | Makes MongoDB easier to use in Node.js |

### Frontend (Client-Side)
| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **EJS** | Template Engine | Generates HTML pages with dynamic data |
| **Bootstrap 5** | CSS Framework | Pre-built responsive design components |
| **JavaScript** | Interactivity | Client-side functionality |
| **FontAwesome** | Icons | Beautiful icons throughout the site |

### External Services
| Service | Purpose | Why We Use It |
|---------|---------|---------------|
| **Cloudinary** | Image Storage | Stores uploaded images in the cloud |
| **MongoDB Atlas** | Cloud Database | Hosted database that never goes down |
| **Render.com** | Hosting | Deploys and hosts the web application |
| **Nodemailer** | Email | Sends notification emails to users |

---

## 3. SYSTEM ARCHITECTURE

### MVC Pattern (Model-View-Controller)
This system follows the MVC architectural pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│              (Browser - User Interface)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP Request
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVER                                │
│  ┌─────────┐    ┌──────────────┐    ┌─────────────────┐     │
│  │ ROUTES  │───▶│ CONTROLLERS  │───▶│     MODELS      │     │
│  │         │    │              │    │                 │     │
│  │ Define  │    │ Handle       │    │ Define data     │     │
│  │ URLs    │    │ logic        │    │ structure       │     │
│  └─────────┘    └──────┬───────┘    └────────┬────────┘     │
│                        │                      │              │
│                        ▼                      ▼              │
│                 ┌──────────────┐      ┌──────────────┐      │
│                 │    VIEWS     │      │   DATABASE   │      │
│                 │              │      │              │      │
│                 │ EJS Templates│      │   MongoDB    │      │
│                 └──────────────┘      └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### How a Request Flows:
1. **User** clicks a link or submits a form
2. **Browser** sends HTTP request to server
3. **Router** matches the URL to a controller function
4. **Controller** processes the request, gets data from Model
5. **Model** interacts with the database
6. **Controller** passes data to View
7. **View** generates HTML page
8. **Server** sends HTML back to browser
9. **Browser** displays the page to user

---

## 4. DATABASE DESIGN

### Collections (Tables)

#### 4.1 Users Collection
Stores all user accounts (students, faculty, admins)

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier (auto-generated) |
| username | String | Login username (unique) |
| email | String | Email address (unique) |
| password | String | Encrypted password (bcrypt hash) |
| role | String | 'user' or 'admin' |
| isActive | Boolean | Account active status |
| isEmailVerified | Boolean | Email verified status |
| createdAt | Date | When account was created |

#### 4.2 Items Collection
Stores all lost and found item reports

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| itemName | String | Name of the item |
| category | ObjectId | Reference to Category |
| description | String | Detailed description |
| location | String | Where lost/found |
| imagePath | String | Cloudinary image URL |
| type | String | 'lost' or 'found' |
| status | String | 'pending', 'approved', 'claimed', 'rejected' |
| reportedBy | ObjectId | Reference to User |
| reporterName | String | Name of reporter |
| reporterEmail | String | Email of reporter |
| dateLostFound | Date | When item was lost/found |
| dateReported | Date | When report was submitted |

#### 4.3 ClaimRequests Collection
Stores claims submitted by users

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| item | ObjectId | Reference to Item being claimed |
| claimant | ObjectId | Reference to User claiming |
| description | String | Why they believe it's theirs |
| proofOfOwnership | String | Evidence description |
| proofImages | Array | Uploaded proof photos |
| status | String | 'pending', 'approved', 'rejected', etc. |
| reviewedBy | ObjectId | Admin who reviewed |
| reviewedAt | Date | When reviewed |

#### 4.4 Categories Collection
Stores item categories

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| name | String | Category name |
| description | String | Category description |
| icon | String | FontAwesome icon class |
| isActive | Boolean | Is category visible |

#### 4.5 Locations Collection
Stores campus locations for dropdown

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| name | String | Location name |
| description | String | Location description |
| isActive | Boolean | Is location visible |

### Relationships Diagram
```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     USER     │       │     ITEM     │       │   CATEGORY   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ _id          │◄──┐   │ _id          │   ┌──▶│ _id          │
│ username     │   │   │ itemName     │   │   │ name         │
│ email        │   │   │ category ────┼───┘   │ description  │
│ password     │   │   │ reportedBy ──┼───┐   │ icon         │
│ role         │   │   │ type         │   │   └──────────────┘
└──────────────┘   │   │ status       │   │
       ▲           │   └──────────────┘   │
       │           │          ▲           │
       │           │          │           │
       │   ┌───────┴──────────┴───────────┘
       │   │
┌──────┴───┴─────┐
│  CLAIMREQUEST  │
├────────────────┤
│ _id            │
│ item ──────────┼──▶ References Item
│ claimant ──────┼──▶ References User
│ status         │
│ reviewedBy ────┼──▶ References User (Admin)
└────────────────┘
```

---

## 5. USER ROLES & PERMISSIONS

### 5.1 Regular User (Student/Faculty)
| Action | Allowed |
|--------|---------|
| Register account | ✅ |
| Login/Logout | ✅ |
| Report lost item | ✅ |
| Report found item | ✅ |
| Search items | ✅ |
| View item details | ✅ |
| Submit claim | ✅ |
| View own claims | ✅ |
| View own reported items | ✅ |
| Approve/Reject items | ❌ |
| Manage users | ❌ |
| Access admin panel | ❌ |

### 5.2 Administrator
| Action | Allowed |
|--------|---------|
| All user actions | ✅ |
| Access admin dashboard | ✅ |
| View all pending items | ✅ |
| Approve items | ✅ |
| Reject items | ✅ |
| Edit any item | ✅ |
| Delete any item | ✅ |
| View all claims | ✅ |
| Approve/Reject claims | ✅ |
| Manage categories | ✅ |
| Manage locations | ✅ |
| Manage users | ✅ |
| View statistics | ✅ |

---

## 6. FEATURES & FUNCTIONALITY

### 6.1 User Features

#### Registration
- Users create account with username, email, password
- Password is encrypted before storing
- Email verification available (optional)

#### Login/Logout
- Session-based authentication
- Sessions stored in MongoDB (persist across server restarts)
- Secure cookie handling

#### Report Lost Item
1. User fills form: item name, category, description, location, date, image
2. System saves report with status = 'pending'
3. Admin reviews and approves/rejects
4. If approved, item appears in public listings

#### Report Found Item
- Same process as lost item
- Item marked as type = 'found'

#### Search Items
- Full-text search across item name, description, location
- Filter by category, type (lost/found), date range

#### Submit Claim
1. User sees item they believe is theirs
2. Clicks "Claim This Item"
3. Fills claim form with proof of ownership
4. Uploads proof images
5. Admin reviews claim
6. If approved, item marked as claimed

### 6.2 Admin Features

#### Dashboard
- Overview statistics (total items, pending, approved, claimed)
- Quick action buttons
- Recent activity

#### Item Management
- View all items (pending, approved, rejected, claimed)
- Approve pending items
- Reject items with reason
- Edit item details
- Delete items

#### Claim Management
- View all claims
- Review claim details and proof
- Approve or reject claims
- Add admin notes

#### Category Management
- Add new categories
- Edit existing categories
- Delete categories
- Set category icons

#### Location Management
- Add campus locations
- Edit location names
- Delete locations
- Locations appear in dropdown when reporting items

#### User Management
- View all registered users
- Activate/deactivate accounts
- View user activity

---

## 7. SYSTEM WORKFLOW

### 7.1 Lost Item Workflow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │   System    │     │   Admin     │
│  Reports    │────▶│   Saves     │────▶│  Reviews    │
│  Lost Item  │     │  (pending)  │     │   Report    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
            ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
            │  APPROVED   │           │  REJECTED   │           │   NEEDS     │
            │             │           │             │           │   MORE INFO │
            │ Item shows  │           │ User        │           │             │
            │ on website  │           │ notified    │           │ Admin       │
            └─────────────┘           └─────────────┘           │ contacts    │
                    │                                           │ user        │
                    ▼                                           └─────────────┘
            ┌─────────────┐
            │   Someone   │
            │   Claims    │
            │   Item      │
            └─────────────┘
                    │
                    ▼
            ┌─────────────┐     ┌─────────────┐
            │   Admin     │────▶│   CLAIMED   │
            │   Approves  │     │             │
            │   Claim     │     │ Item marked │
            └─────────────┘     │ as returned │
                                └─────────────┘
```

### 7.2 Claim Workflow
```
User Submits Claim
        │
        ▼
┌───────────────────┐
│  Status: PENDING  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Admin Reviews     │
│ - Check proof     │
│ - Verify details  │
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌────────┐  ┌────────┐
│APPROVED│  │REJECTED│
└────┬───┘  └────┬───┘
     │           │
     ▼           ▼
Item marked   User notified
as CLAIMED    with reason
```

---

## 8. FILE STRUCTURE EXPLAINED

```
lost-and-found-system/
│
├── config/                    # Configuration files
│   ├── cloudinary.js         # Cloudinary image upload setup
│   ├── database.js           # MongoDB connection
│   └── multer.js             # File upload configuration
│
├── controllers/               # Business logic (handle requests)
│   ├── adminController.js    # Admin panel logic
│   ├── authController.js     # Login/Register logic
│   ├── claimController.js    # Claim handling logic
│   ├── itemController.js     # Item CRUD logic
│   └── userController.js     # User profile logic
│
├── middleware/                # Request processing
│   ├── auth.js               # Authentication checks
│   ├── errorHandler.js       # Error handling
│   └── security.js           # Security measures
│
├── models/                    # Database schemas
│   ├── User.js               # User model
│   ├── Item.js               # Item model
│   ├── ClaimRequest.js       # Claim model
│   ├── Category.js           # Category model
│   └── Location.js           # Location model
│
├── public/                    # Static files (served directly)
│   ├── css/                  # Stylesheets
│   │   ├── style.css         # Main styles
│   │   └── admin.css         # Admin panel styles
│   ├── js/                   # Client-side JavaScript
│   │   ├── main.js           # Main scripts
│   │   └── admin.js          # Admin scripts
│   └── images/               # Static images
│
├── routes/                    # URL routing
│   ├── index.js              # Main router (combines all routes)
│   ├── admin.js              # Admin routes (/admin/...)
│   ├── auth.js               # Auth routes (/login, /register)
│   ├── items.js              # Item routes (/items/...)
│   ├── claims.js             # Claim routes (/claims/...)
│   └── user.js               # User routes (/user/...)
│
├── services/                  # Business services
│   ├── emailService.js       # Send emails
│   └── matchingService.js    # Match lost/found items
│
├── views/                     # EJS templates (HTML)
│   ├── layouts/              # Page layouts
│   │   ├── main.ejs          # Main site layout
│   │   └── admin.ejs         # Admin layout
│   ├── partials/             # Reusable components
│   │   ├── navbar.ejs        # Navigation bar
│   │   ├── footer.ejs        # Footer
│   │   └── flash.ejs         # Alert messages
│   ├── admin/                # Admin pages
│   ├── auth/                 # Login/Register pages
│   ├── items/                # Item pages
│   └── claims/               # Claim pages
│
├── .env                       # Environment variables (secrets)
├── package.json               # Dependencies and scripts
├── server.js                  # Application entry point
└── README.md                  # Project documentation
```

---

## 9. SECURITY FEATURES

### 9.1 Authentication & Authorization
- **Password Hashing**: Passwords encrypted with bcrypt (never stored plain)
- **Session Management**: Secure sessions stored in MongoDB
- **Role-Based Access**: Admin vs User permissions
- **Protected Routes**: Middleware checks authentication

### 9.2 Input Validation
- **Sanitization**: Remove dangerous characters from input
- **NoSQL Injection Prevention**: Block database attacks
- **File Upload Validation**: Only allow image files

### 9.3 HTTP Security
- **Security Headers**: Prevent clickjacking, XSS
- **HTTPS**: Secure connection in production
- **Cookie Security**: HttpOnly, Secure, SameSite flags

### 9.4 Rate Limiting
- Prevent brute force attacks
- Limit requests per IP

---

## 10. API ENDPOINTS

### Public Routes (No Login Required)
| Method | URL | Description |
|--------|-----|-------------|
| GET | / | Home page |
| GET | /items/lost | Lost items list |
| GET | /items/found | Found items list |
| GET | /items/:id | Item details |
| GET | /search | Search items |
| GET | /login | Login page |
| GET | /register | Register page |
| POST | /login | Process login |
| POST | /register | Process registration |

### Protected Routes (Login Required)
| Method | URL | Description |
|--------|-----|-------------|
| GET | /report/lost | Report lost item form |
| POST | /report/lost | Submit lost item |
| GET | /report/found | Report found item form |
| POST | /report/found | Submit found item |
| GET | /claims/my-claims | User's claims |
| POST | /claims/:id | Submit claim |
| GET | /user/dashboard | User dashboard |
| GET | /user/my-items | User's reported items |

### Admin Routes (Admin Only)
| Method | URL | Description |
|--------|-----|-------------|
| GET | /admin/dashboard | Admin dashboard |
| GET | /admin/items | All items |
| GET | /admin/items/pending | Pending items |
| PUT | /admin/items/:id/approve | Approve item |
| PUT | /admin/items/:id/reject | Reject item |
| GET | /admin/claims | All claims |
| PUT | /admin/claims/:id/approve | Approve claim |
| PUT | /admin/claims/:id/reject | Reject claim |
| GET | /admin/categories | Manage categories |
| GET | /admin/locations | Manage locations |
| GET | /admin/users | Manage users |

---

## 📞 SYSTEM CREDENTIALS

### Live Website
- **URL**: https://lost-and-found-system-7ro8.onrender.com

### Admin Account
- **Username**: admin
- **Password**: admin123

### GitHub Repository
- **URL**: https://github.com/DeathKnell837/lost-and-found-system

---

## 🎓 FOR PRESENTATION

### Key Points to Mention:
1. **Problem**: Lost items on campus lack organized recovery system
2. **Solution**: Centralized web platform for reporting and claiming
3. **Users**: Students, Faculty, Administrators
4. **Technology**: Node.js, Express, MongoDB, EJS, Bootstrap
5. **Features**: Report items, search, claim, admin management
6. **Security**: Password encryption, session management, input validation
7. **Deployment**: Hosted on Render.com, database on MongoDB Atlas

### Demo Flow:
1. Show home page with recent items
2. Register a new account
3. Report a lost item
4. Login as admin
5. Approve the item
6. Show item on public listing
7. Submit a claim
8. Approve claim as admin
9. Show item marked as claimed

---

*Documentation created for Software Engineering Project - 2026*
