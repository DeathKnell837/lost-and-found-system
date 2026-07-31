# Campus Lost & Found Management System

A comprehensive web-based Lost and Found Item Management System designed for campus usage. Helps students and faculty report lost/found items and facilitates the claiming process with AI-powered item matching and a dark luxury interface.

## 🌐 Live Demo

**Website:** https://lost-and-found-system-7ro8.onrender.com

**Admin Login:**
- Username: `admin`
- Password: `Siladan2026`

## ✨ Features

### 🤖 Gemini AI Features (New)
- **Multimodal Visual Item Comparison**: Powered by Gemini 2.0 Flash (`@google/generative-ai`) to compare photos and descriptions of lost and found items.
- **Hybrid AI + Rule Matching**: Shortlists candidates with rule-based criteria and ranks them with Gemini visual similarity scores and plain-language reasoning.
- **Conversational AI Assistant**: Floating Glassmorphism chat widget (`views/partials/ai-assistant.ejs`) providing natural-language search and instant database recommendations.

### 🎨 Dark Luxury Interface (New)
- **Deep Metallic Palette**: Built on a deep near-black base (`#0b0c10` to `#14151a`) with warm copper and amber accents (`#c98a4b` to `#e0a85c`).
- **Sophisticated Typography**: Playfair Display serif headings paired with Inter body font.
- **Glassmorphism Panels**: Semi-transparent dark cards with `backdrop-filter: blur`, 1px copper borders, and outer glow hover effects.
- **Micro-Interactions**: Scroll reveal animations (`IntersectionObserver`), animated stat count-ups, hero radar-sweep animation, and button shine sweeps.
- **UI Backup Branch**: Original UI saved on branch `backup-ui` (or tag `ui-backup-tag`) for easy reversal if needed.

### 👤 User Features
- Register and login
- Report lost items with details, location, and images
- Report found items with details, location, and images
- Search and filter items by keyword, category, and date
- Submit claims on items with proof of ownership
- Track claim status
- Password reset via email
- User dashboard with personal stats
- Receive email notifications
- Dark mode support
- PWA (Progressive Web App) - installable on mobile

### 🔧 Admin Features
- Secure admin dashboard with statistics and analytics
- Approve/reject pending item reports
- Review and manage claim requests
- Item matching algorithm (finds potential matches between lost & found items with AI reasoning)
- Manage item categories
- Manage campus locations (70+ predefined + user-suggested)
- User management (activate/deactivate accounts)
- Statistics with charts (monthly trends, category breakdown)
- Export data as CSV (items, claims, statistics)
- QR code and poster generation for items

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| AI Integration | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Database | MongoDB Atlas |
| Frontend | EJS Templates, Bootstrap 5, Dark Luxury Glassmorphism CSS3, Vanilla JS |
| Authentication | Express-session, bcrypt.js |
| File Storage | Cloudinary |
| Email | Nodemailer |
| Deployment | Render.com |

## 📁 Project Structure

```
├── config/              # Configuration files
│   ├── cloudinary.js    # Cloudinary + Multer setup
│   └── database.js      # MongoDB connection
├── controllers/         # Route controllers
│   ├── adminController.js
│   ├── authController.js
│   ├── claimController.js
│   ├── homeController.js
│   └── itemController.js
├── middleware/          # Custom middleware
│   ├── auth.js          # Authentication & authorization
│   ├── deviceTracker.js # Device fingerprint tracking
│   ├── errorHandler.js  # Error handling
│   └── security.js      # Security headers & sanitization
├── models/              # Mongoose models
│   ├── Category.js
│   ├── ClaimRequest.js
│   ├── Item.js
│   ├── Location.js
│   └── User.js
├── public/              # Static assets
│   ├── css/
│   ├── js/
│   ├── manifest.json    # PWA manifest
│   ├── sw.js            # Service worker
│   ├── robots.txt       # SEO crawler rules
│   └── sitemap.xml      # SEO sitemap
├── routes/              # Express routes
├── services/            # Business logic
│   ├── emailService.js  # Gmail SMTP notifications
│   └── matchingService.js # Item matching algorithm
├── views/               # EJS templates
│   ├── admin/
│   ├── auth/
│   ├── claims/
│   ├── items/
│   ├── layouts/
│   ├── user/
│   └── partials/
├── server.js            # Application entry point
└── package.json
```

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account (for image uploads)
- Gmail account (for email notifications)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/DeathKnell837/lost-and-found-system.git
   cd lost-and-found-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Production
   npm start
   
   # Development (with auto-reload)
   npm run dev
   ```

6. **Access the application**
   - Website: `http://localhost:3000`
   - Admin: `http://localhost:3000/admin/login`

## 📊 Database Schema

### Users
| Field | Type | Description |
|-------|------|-------------|
| username | String | Unique username |
| email | String | User email |
| password | String | Hashed password |
| role | String | 'user' or 'admin' |
| isEmailVerified | Boolean | Email verification status |

### Items
| Field | Type | Description |
|-------|------|-------------|
| itemName | String | Name of the item |
| category | ObjectId | Reference to Category |
| description | String | Detailed description |
| location | String | Where item was lost/found |
| type | String | 'lost' or 'found' |
| status | String | 'pending', 'approved', 'claimed', 'rejected' |
| reportedBy | ObjectId | Reference to User |
| imagePath | String | Cloudinary image URL |

### Claims
| Field | Type | Description |
|-------|------|-------------|
| item | ObjectId | Reference to Item |
| claimant | ObjectId | Reference to User |
| description | String | Why they believe it's theirs |
| proofOfOwnership | String | Proof description |
| status | String | 'pending', 'approved', 'rejected' |

### Categories
| Field | Type | Description |
|-------|------|-------------|
| name | String | Category name |
| description | String | Category description |
| icon | String | FontAwesome icon class |

### Locations
| Field | Type | Description |
|-------|------|-------------|
| name | String | Location name |
| description | String | Location description |
| isActive | Boolean | Active status |

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- Session-based authentication (MongoDB session store)
- Security headers (X-Frame-Options, XSS protection)
- NoSQL injection prevention
- Input sanitization
- Separate admin authentication session

## 📱 Responsive Design

- Mobile-friendly interface
- Dark mode support
- PWA capabilities (installable, offline support)
- Service Worker for caching

## 🔍 SEO

- robots.txt and sitemap.xml
- Open Graph and Twitter Card meta tags
- JSON-LD structured data
- Google Search Console integration

## 👥 Target Users

| User Type | Capabilities |
|-----------|--------------|
| Students | Report items, search, submit claims |
| Faculty/Staff | Report items, search, submit claims |
| Admin | Full system management |

## 📄 License

MIT License - Free for educational and personal use.

## 👨‍💻 Author

Software Engineering Project - 2026

---

**GitHub:** https://github.com/DeathKnell837/lost-and-found-system
