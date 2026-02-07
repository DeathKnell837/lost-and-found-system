# Campus Lost & Found Management System

A comprehensive web-based Lost and Found Item Management System designed for campus usage. Helps students and faculty report lost/found items and facilitates the claiming process.

## 🌐 Live Demo

**Website:** https://lost-and-found-system-7ro8.onrender.com

**Admin Login:**
- Username: `admin`
- Password: ``

## ✨ Features

### 👤 User Features
- Register and login with email verification
- Report lost items with details, location, and images
- Report found items with details, location, and images
- Search and filter items by keyword, category, and date
- Submit claims on items with proof of ownership
- Track claim status
- Receive email notifications
- Dark mode support

### 🔧 Admin Features
- Secure admin dashboard with statistics
- Approve/reject pending item reports
- Review and manage claim requests
- Manage item categories
- Manage campus locations
- User management
- View system statistics

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Frontend | EJS Templates, Bootstrap 5, CSS3 |
| Authentication | Express-session, bcrypt.js |
| File Storage | Cloudinary |
| Email | Nodemailer |
| Deployment | Render.com |

## 📁 Project Structure

```
├── config/             # Configuration files
│   ├── cloudinary.js   # Cloudinary setup
│   ├── database.js     # MongoDB connection
│   └── multer.js       # File upload config
├── controllers/        # Route controllers
│   ├── adminController.js
│   ├── authController.js
│   ├── claimController.js
│   ├── itemController.js
│   └── userController.js
├── middleware/         # Custom middleware
│   ├── auth.js         # Authentication
│   ├── errorHandler.js # Error handling
│   └── security.js     # Security middleware
├── models/             # Mongoose models
│   ├── Category.js
│   ├── ClaimRequest.js
│   ├── Item.js
│   ├── Location.js
│   └── User.js
├── public/             # Static assets
│   ├── css/
│   ├── js/
│   └── images/
├── routes/             # Express routes
├── services/           # Business logic
│   ├── emailService.js
│   └── matchingService.js
├── views/              # EJS templates
│   ├── admin/
│   ├── auth/
│   ├── claims/
│   ├── items/
│   ├── layouts/
│   └── partials/
├── .env                # Environment variables
├── package.json
├── server.js           # Application entry point
└── README.md
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

- Password hashing with bcrypt
- Session-based authentication
- CSRF protection
- XSS prevention
- Rate limiting
- Input validation and sanitization

## 📱 Responsive Design

- Mobile-friendly interface
- Dark mode support
- PWA capabilities

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
