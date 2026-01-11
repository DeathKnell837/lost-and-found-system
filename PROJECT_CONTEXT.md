# Project Context: Campus Lost & Found Management System

## Project Overview
I'm building a **Campus Lost & Found Management System** using Node.js, Express.js, MongoDB Atlas, and EJS templating. The project is deployed on **Render.com**.

- **Live URL**: https://lost-and-found-system-7ro8.onrender.com
- **GitHub Repo**: https://github.com/DeathKnell837/lost-and-found-system
- **Local Path**: `C:\Users\ADMIN\Desktop\My_Projects\Lost&Found Item Management`

---

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Frontend**: EJS, Bootstrap 5.3, Font Awesome 6.5
- **Image Storage**: Cloudinary
- **Email**: Nodemailer (Gmail SMTP)
- **Other**: QR Code generation (qrcode npm), Service Worker (PWA)

---

## Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

---

## Features Implemented

| # | Feature | Status |
|---|---------|--------|
| 1 | User Authentication (login/register) | ✅ Done (email verification removed) |
| 2 | Report Lost/Found Items with image upload | ✅ Done |
| 3 | Item Categories & Search with filters | ✅ Done |
| 4 | Admin Dashboard with statistics | ✅ Done |
| 5 | Device Tracking & Blocking | ✅ Done |
| 6 | Enhanced Device Detection (50+ brands) | ✅ Done |
| 7 | Claim Request System | ✅ Done |
| 8 | QR Code & Poster Generation | ✅ Done |
| 9 | Location Dropdown (70+ campus locations) | ✅ Done |
| 11 | PWA Support (manifest + service worker) | ✅ Done |
| 12 | Item Matching Algorithm | ✅ Done |
| 13 | User Dashboard | ✅ Done |
| 14 | Email Notifications | ✅ Done |
| 15 | Health Check Endpoint (`/health`) | ✅ Done |

---

## Current Issues to Fix

1. **PWA icon 404 errors** - Old cached service worker looking for `/images/icons/icon-144x144.png` that doesn't exist. Need to clear browser cache/service worker.

2. **Rate limiting was removed** - Was blocking logins with "Too Many Requests" error

---

## Key Files Structure

```
├── server.js                 # Main Express app
├── config/
│   ├── database.js           # MongoDB connection
│   ├── cloudinary.js         # Image upload config
│   └── locations.js          # 70+ campus locations
├── controllers/
│   ├── authController.js     # Login/register
│   ├── itemController.js     # Items CRUD
│   ├── claimController.js    # Claim requests
│   └── adminController.js    # Admin functions
├── models/
│   ├── User.js
│   ├── Item.js
│   ├── Category.js
│   ├── ClaimRequest.js
│   ├── BlockedDevice.js
│   ├── TrackedDevice.js
│   └── index.js              # Exports all models
├── routes/
│   ├── auth.js
│   ├── items.js
│   ├── claims.js
│   ├── admin.js
│   ├── posters.js
│   ├── home.js
│   ├── user.js
│   ├── search.js
│   ├── report.js
│   └── index.js              # Route mounting
├── middleware/
│   ├── auth.js               # Authentication middleware
│   ├── security.js           # Security headers, sanitization
│   ├── errorHandler.js       # Error handling
│   └── deviceTracker.js      # Device tracking
├── services/
│   ├── emailService.js       # Email notifications
│   └── matchingService.js    # Item matching algorithm
├── public/
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service worker (v2)
├── views/
│   ├── layouts/main.ejs      # Main layout
│   ├── home.ejs
│   ├── auth/                 # Login, register, profile
│   ├── items/                # List, details, search
│   ├── admin/                # Dashboard, manage items
│   └── partials/             # Navbar, footer
└── scripts/
    └── verify-all-users.js   # Script to verify existing users
```

---

## Environment Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lost-and-found
SESSION_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
PORT=3000
```

---

## Recent Changes Made

1. **Removed email verification requirement** - Users can login without verifying email
2. **Removed all rate limiting** - Was causing "Too Many Requests" errors
3. **Simplified database connection** - No blocking retries, server starts immediately
4. **Server binds to 0.0.0.0** - Required for Render deployment
5. **Fixed params sanitization** - Was breaking MongoDB ObjectIds
6. **Updated service worker to v2** - To clear old cached assets
7. **Removed comments feature** - Comments functionality was removed from the system

---

## API Endpoints

### Public
- `GET /` - Home page
- `GET /items/lost` - Lost items list
- `GET /items/found` - Found items list
- `GET /items/:id` - Item details
- `GET /search` - Search items
- `GET /health` - Health check

### Authenticated Users
- `POST /report/lost` - Report lost item
- `POST /report/found` - Report found item
- `GET /claims/form/:itemId` - Claim form
- `POST /claims/submit/:itemId` - Submit claim
- `GET /user/dashboard` - User dashboard

### Admin Only
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/items` - Manage items
- `GET /admin/users` - Manage users
- `GET /admin/claims` - Manage claims
- `GET /admin/statistics` - View statistics
- `GET /admin/devices` - View tracked devices
- `GET /admin/matching` - Item matching dashboard

---

## How to Run Locally

```bash
cd "C:\Users\ADMIN\Desktop\My_Projects\Lost&Found Item Management"
npm install
node server.js
```

Server runs at: http://localhost:3000

---

## Deployment

The app is deployed on **Render.com** and auto-deploys when you push to GitHub.

### How to Deploy Changes

1. **Make your changes** in VS Code

2. **Commit and push to GitHub**:
```bash
cd "C:\Users\ADMIN\Desktop\My_Projects\Lost&Found Item Management"
git add .
git commit -m "Your commit message"
git push origin master
```

3. **Render auto-deploys** - Go to https://dashboard.render.com to see deployment status

4. **Wait 2-5 minutes** for build and deploy to complete

5. **Check your live site**: https://lost-and-found-system-7ro8.onrender.com

### Render.com Settings
- **Service Name**: lost-and-found-system
- **Branch**: master
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Auto-Deploy**: Enabled (deploys on every push)

### Environment Variables on Render
Go to Render Dashboard → Your Service → Environment → Add these:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lost-and-found
SESSION_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### If Deployment Fails
1. Check Render logs in Dashboard → Logs
2. Make sure `package.json` has all dependencies
3. Server must bind to `0.0.0.0` (already configured)
4. Database connection must not block startup (already fixed)

---

## GitHub Repository

- **Repo URL**: https://github.com/DeathKnell837/lost-and-found-system
- **Branch**: master

### Common Git Commands
```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Your message"

# Push to GitHub (triggers auto-deploy)
git push origin master

# Pull latest changes
git pull origin master

# View commit history
git log --oneline
```

---

## Database Details

- **Database**: MongoDB Atlas (cloud)
- **Database Name**: lost-and-found
- **Collections**:
  - `users` - User accounts
  - `items` - Lost/found items
  - `categories` - Item categories (Electronics, Documents, Clothing, etc.)
  - `claimrequests` - Claim requests for items
  - `blockeddevices` - Blocked device fingerprints
  - `trackeddevices` - All tracked device visits
  - `sessions` - User sessions (connect-mongo)

---

## NPM Dependencies (package.json)

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cloudinary": "^1.41.0",
    "connect-flash": "^0.1.1",
    "connect-mongo": "^5.1.0",
    "dotenv": "^16.3.1",
    "ejs": "^3.1.9",
    "express": "^4.18.2",
    "express-ejs-layouts": "^2.5.1",
    "method-override": "^3.0.0",
    "mongoose": "^8.0.3",
    "multer": "^1.4.5-lts.1",
    "multer-storage-cloudinary": "^4.0.0",
    "nodemailer": "^6.9.7",
    "express-session": "^1.17.3",
    "qrcode": "^1.5.3"
  }
}
```

---

## User Roles

1. **Guest** - Can view items, search
2. **User** - Can report items, submit claims
3. **Admin** - Full access to dashboard, manage items/users/claims, view statistics

---

## Item Categories (in database)

- Electronics
- Documents  
- Clothing
- Accessories
- Books
- Keys
- Bags
- Sports Equipment
- Others

---

## Item Status Flow

1. `active` - Item is reported and visible
2. `claimed` - Someone submitted a claim
3. `resolved` - Item returned to owner
4. `expired` - Item expired after time limit

---

## Claim Request Status Flow

1. `pending` - Claim submitted, waiting for admin review
2. `approved` - Admin approved the claim
3. `rejected` - Admin rejected the claim
4. `withdrawn` - User withdrew their claim

---

## Key Implementation Details

### Password Hashing
- Using `bcryptjs` with salt rounds of 10
- Passwords hashed before saving to database

### Session Management
- Using `express-session` with `connect-mongo` store
- Sessions stored in MongoDB `sessions` collection
- 24-hour session expiry

### Image Upload
- Using Cloudinary for cloud storage
- Multer for handling multipart/form-data
- Max 5 images per item

### Device Tracking
- Fingerprints devices using User-Agent, IP, screen size
- Tracks all visits for analytics
- Admin can block suspicious devices

### Item Matching Algorithm
- Compares lost vs found items
- Scores based on: category, keywords, location, date, brand
- Shows potential matches to admin

---

## Views/Templates Structure

```
views/
├── layouts/
│   └── main.ejs              # Main layout with navbar/footer
├── partials/
│   ├── navbar.ejs
│   └── footer.ejs
├── home.ejs                  # Homepage
├── offline.ejs               # PWA offline page
├── error.ejs                 # Error page
├── auth/
│   ├── login.ejs
│   ├── register.ejs
│   ├── profile.ejs
│   └── resend-verification.ejs
├── items/
│   ├── lost.ejs              # Lost items list
│   ├── found.ejs             # Found items list
│   ├── details.ejs           # Item details
│   ├── search.ejs            # Search results
│   └── claimed.ejs           # Claimed items
├── report/
│   ├── lost.ejs              # Report lost form
│   └── found.ejs             # Report found form
├── claims/
│   ├── form.ejs              # Submit claim form
│   ├── my-claims.ejs         # User's claims
│   └── details.ejs           # Claim details
├── user/
│   └── dashboard.ejs         # User dashboard
└── admin/
    ├── login.ejs             # Admin login
    ├── dashboard.ejs         # Admin dashboard
    ├── items.ejs             # Manage items
    ├── users.ejs             # Manage users
    ├── claims.ejs            # Manage claims
    ├── statistics.ejs        # Statistics with charts
    ├── devices.ejs           # Tracked devices
    └── matching.ejs          # Item matching
```

---

## Important Notes

1. **The project uses EJS templating** - Not React/Vue, it's server-side rendered
2. **MongoDB ObjectIds are 24-character hex strings** - Don't sanitize/modify them
3. **Cloudinary stores images** - Not local storage
4. **Service worker caches pages** - May need to clear cache when testing
5. **Render free tier sleeps after 15 min inactivity** - First request may be slow

---

## Middleware Chain (Order Matters!)

In `server.js`, middleware is applied in this order:
1. `securityHeaders` - Sets X-Frame-Options, XSS protection headers
2. `slowRequestLogger` - Logs requests taking > 5 seconds
3. `express.json()` - Parse JSON bodies (limit 5mb)
4. `express.urlencoded()` - Parse form data (limit 5mb)
5. `methodOverride` - Support PUT/DELETE in forms
6. `sanitizeInput` - Sanitize req.body and req.query (NOT params!)
7. `preventNoSQLInjection` - Block MongoDB operators in input
8. `express.static` - Serve public files
9. `express-session` - Session management with MongoDB store
10. `connect-flash` - Flash messages
11. `setLocals` - Set user and flash messages in res.locals
12. `checkBlocked` - Check if device is blocked
13. `trackDevice` - Track device fingerprint
14. Routes mounted last

---

## Authentication Flow

### Registration
1. User submits username, email, password
2. Password hashed with bcryptjs (10 rounds)
3. User saved with `isEmailVerified: true` (auto-verified now)
4. Redirect to login

### Login
1. User submits username/email + password
2. Find user by username OR email
3. Compare password with bcryptjs
4. Check if user `isActive`
5. Create session: `req.session.user = { id, _id, username, email, role }`
6. Redirect to home

### Session Structure
```javascript
req.session.user = {
    id: "MongoDB ObjectId",
    _id: "MongoDB ObjectId", 
    username: "john",
    email: "john@example.com",
    role: "user" // or "admin"
}
```

---

## Admin Authentication

Admin uses SEPARATE login at `/admin/login`:
- Checks `user.role === 'admin'`
- Sets `req.session.admin` separately
- Admin routes check `req.session.admin` exists

---

## Models Schema Details

### User Model
```javascript
{
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: true },
    createdAt: Date,
    updatedAt: Date
}
```

### Item Model
```javascript
{
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: ObjectId, ref: 'Category' },
    type: { type: String, enum: ['lost', 'found'], required: true },
    status: { type: String, enum: ['active', 'claimed', 'resolved', 'expired'], default: 'active' },
    location: String, // from locations dropdown
    dateLostFound: Date,
    images: [{ url: String, publicId: String }], // Cloudinary
    reportedBy: { type: ObjectId, ref: 'User' },
    contactEmail: String,
    contactPhone: String,
    brand: String, // for electronics
    color: String,
    dateReported: { type: Date, default: Date.now },
    deviceInfo: { ... } // tracked device data
}
```

### ClaimRequest Model
```javascript
{
    item: { type: ObjectId, ref: 'Item' },
    claimant: { type: ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'withdrawn'], default: 'pending' },
    proofDescription: String,
    proofImages: [{ url: String, publicId: String }],
    identifyingDetails: String,
    contactPhone: String,
    adminNotes: String,
    processedBy: { type: ObjectId, ref: 'User' },
    processedAt: Date,
    createdAt: Date
}
```

---

## Frontend JavaScript (in EJS files)

### Item Details Page (`views/items/details.ejs`)
- `showQRCode()` - Generate and display QR code
- `shareOnFacebook/Twitter/WhatsApp()` - Social sharing
- `copyLink()` - Copy item URL to clipboard

### Admin Dashboard (`views/admin/dashboard.ejs`)
- Chart.js for statistics graphs
- Real-time stats display

---

## Email Service (`services/emailService.js`)

Sends emails for:
- `sendClaimNotification(item, claim)` - When someone claims an item
- `sendClaimStatusUpdate(claim, status)` - When admin approves/rejects
- `sendMatchNotification(item, matches)` - When matching items found
- Uses Gmail SMTP with app password

---

## Matching Service (`services/matchingService.js`)

```javascript
calculateMatchScore(lostItem, foundItem) {
    // Returns 0-100 score based on:
    // - Category match: 30 points
    // - Keyword similarity: 25 points  
    // - Location proximity: 20 points
    // - Date proximity: 15 points
    // - Brand match: 10 points
}
```

---

## Location Dropdown (`config/locations.js`)

70+ predefined campus locations organized by category:
- Academic Buildings (Library, Science Building, etc.)
- Dormitories
- Cafeteria/Dining
- Sports Facilities
- Administrative Buildings
- Outdoor Areas
- Parking Lots
- Other

---

## Device Tracking (`middleware/deviceTracker.js`)

Tracks:
- User-Agent string
- IP address
- Screen resolution
- Device brand detection (50+ brands)
- Visit timestamps

Admin can:
- View all tracked devices
- Block suspicious devices
- See device visit history

---

## Error Handling (`middleware/errorHandler.js`)

Handles:
- 404 Not Found
- 500 Server Errors
- MongoDB CastError (invalid ObjectId)
- Validation Errors
- Returns JSON for API requests, HTML for page requests

---

## Flash Messages

```javascript
req.flash('success', 'Item reported successfully!');
req.flash('error', 'Something went wrong');
req.flash('info', 'Please login to continue');
```

Displayed in `views/layouts/main.ejs` as Bootstrap alerts.

---

## File Upload (Cloudinary)

```javascript
// config/cloudinary.js
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'lost-and-found',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
});

const upload = multer({ storage });
// Usage: upload.array('images', 5) - max 5 images
```

---

## Service Worker (`public/sw.js`)

- Version: v3 (cache name: `static-v3`, `dynamic-v3`)
- Caches: `/`, `/offline`, `/manifest.json`, `/css/style.css`
- **API routes are NEVER cached** - Claims, auth, admin routes bypass service worker
- Network-first for HTML pages
- Cache-first for static assets
- Shows `/offline` page when offline
- No icon references (icons were removed)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Too Many Requests" | Rate limiting removed, clear browser cache |
| Can't login | Check if user exists, password correct, isActive=true |
| Images not uploading | Check Cloudinary credentials in .env |
| Deployment timeout | Server must bind to 0.0.0.0, DB connection non-blocking |
| 404 on icons | Clear service worker, icons were removed from manifest |
| Session not persisting | Check MONGODB_URI for session store |

---

## Browser Cache Clearing Steps

1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers" → Unregister
4. Click "Storage" → "Clear site data"
5. Hard refresh: Ctrl + Shift + R

---

## Quick Debug Commands

```bash
# Test if server starts
node server.js

# Check MongoDB connection
node -e "require('dotenv').config(); require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('DB OK')).catch(e => console.log(e))"

# Count items in database
node -e "require('dotenv').config(); require('mongoose').connect(process.env.MONGODB_URI).then(async () => { const count = await require('mongoose').connection.db.collection('items').countDocuments(); console.log('Items:', count); process.exit(); })"

# Verify all users
node scripts/verify-all-users.js
```

---
