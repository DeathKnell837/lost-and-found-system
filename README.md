# Lost and Found Item Management System

A comprehensive web-based Lost and Found Item Management System designed for campus usage.

## Features

### User Features
- Report lost items with details and images
- Report found items with details and images
- View all approved lost items
- View all approved found items
- Search items by keyword
- Filter items by category, type, and date
- View detailed item information

### Admin Features
- Secure admin login
- Dashboard with statistics (lost, found, claimed counts)
- Approve/reject pending item reports
- Edit item details
- Delete items
- Mark items as claimed
- Manage item categories

## Technology Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Frontend:** EJS Templates, HTML5, CSS3, JavaScript
- **Authentication:** Express-session with bcrypt password hashing
- **File Upload:** Multer with Sharp for image processing

## Project Structure
```
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/             # Mongoose models
├── public/             # Static assets
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/
├── routes/             # Express routes
├── seeds/              # Database seeders
├── views/              # EJS templates
│   ├── admin/
│   ├── items/
│   ├── layouts/
│   └── partials/
├── .env                # Environment variables
├── package.json
├── server.js           # Application entry point
└── README.md
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Setup Steps

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the MongoDB URI if needed
   - Change the session secret for production

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/lost_found_db`

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```
   This creates default categories and an admin account.

6. **Start the server**
   ```bash
   # Production mode
   npm start
   
   # Development mode (with auto-reload)
   npm run dev
   ```

7. **Access the application**
   - User Interface: `http://localhost:3000`
   - Admin Panel: `http://localhost:3000/admin/login`

## Default Admin Credentials
- **Username:** admin
- **Password:** admin123

> ⚠️ **Important:** Change the default admin password after first login.

## Database Schema

### Users Collection
| Field | Type | Description |
|-------|------|-------------|
| username | String | Unique username |
| email | String | User email |
| password | String | Hashed password |
| role | String | 'user' or 'admin' |
| createdAt | Date | Account creation date |

### Items Collection
| Field | Type | Description |
|-------|------|-------------|
| itemName | String | Name of the item |
| category | ObjectId | Reference to Category |
| description | String | Detailed description |
| location | String | Where item was lost/found |
| imagePath | String | Path to uploaded image |
| contactInfo | String | Contact information |
| reportedBy | ObjectId | Reference to User (optional) |
| reporterName | String | Name of reporter |
| reporterEmail | String | Email of reporter |
| type | String | 'lost' or 'found' |
| status | String | 'pending', 'approved', 'claimed', 'rejected' |
| dateReported | Date | When report was submitted |
| dateLostFound | Date | When item was lost/found |

### Categories Collection
| Field | Type | Description |
|-------|------|-------------|
| name | String | Category name |
| description | String | Category description |
| icon | String | Icon class (optional) |

## API Endpoints

### Public Routes
- `GET /` - Home page
- `GET /items/lost` - Lost items listing
- `GET /items/found` - Found items listing
- `GET /items/:id` - Item details
- `GET /report/lost` - Report lost item form
- `GET /report/found` - Report found item form
- `POST /report/lost` - Submit lost item report
- `POST /report/found` - Submit found item report
- `GET /search` - Search items

### Admin Routes (Protected)
- `GET /admin/login` - Admin login page
- `POST /admin/login` - Admin authentication
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/items` - Manage all items
- `GET /admin/items/pending` - Pending items
- `PUT /admin/items/:id/approve` - Approve item
- `PUT /admin/items/:id/reject` - Reject item
- `PUT /admin/items/:id/claim` - Mark as claimed
- `PUT /admin/items/:id` - Update item
- `DELETE /admin/items/:id` - Delete item
- `GET /admin/categories` - Manage categories
- `POST /admin/categories` - Create category
- `PUT /admin/categories/:id` - Update category
- `DELETE /admin/categories/:id` - Delete category

## License
MIT License - Free for educational and personal use.

## Author
Software Engineering Final Project
