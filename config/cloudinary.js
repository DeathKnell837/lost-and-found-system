const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const fs = require('fs');
const path = require('path');

const hasCloudinary = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

// Configure Cloudinary if credentials exist
if (hasCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// Local disk storage fallback for uploads directory
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, 'item-' + uniqueSuffix + ext);
    }
});

// Configure Storage for Multer (Cloudinary when configured, local disk storage otherwise)
const storage = hasCloudinary
    ? new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'lost-and-found', // Folder name in Cloudinary
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [
                { width: 800, height: 800, crop: 'limit', quality: 'auto' }
            ]
        }
    })
    : diskStorage;

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = {
    cloudinary,
    upload
};
