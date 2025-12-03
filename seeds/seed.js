require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Item = require('../models/Item');

// Default categories
const defaultCategories = [
    { name: 'Electronics', description: 'Phones, laptops, tablets, chargers, etc.', icon: 'fa-laptop' },
    { name: 'Books & Documents', description: 'Textbooks, notebooks, IDs, documents', icon: 'fa-book' },
    { name: 'Clothing & Accessories', description: 'Jackets, bags, jewelry, watches', icon: 'fa-tshirt' },
    { name: 'Keys', description: 'Car keys, house keys, key cards', icon: 'fa-key' },
    { name: 'Wallets & Cards', description: 'Wallets, credit cards, student IDs', icon: 'fa-wallet' },
    { name: 'Sports Equipment', description: 'Sports gear, gym equipment', icon: 'fa-futbol' },
    { name: 'Personal Items', description: 'Glasses, umbrellas, water bottles', icon: 'fa-user' },
    { name: 'Musical Instruments', description: 'Instruments and music equipment', icon: 'fa-music' },
    { name: 'Stationery', description: 'Pens, pencils, calculators, supplies', icon: 'fa-pencil' },
    { name: 'Other', description: 'Other miscellaneous items', icon: 'fa-box' }
];

// Seed function
async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data (optional - comment out to keep existing data)
        console.log('Clearing existing data...');
        await Category.deleteMany({});
        // Uncomment below to also clear users and items
        // await User.deleteMany({});
        // await Item.deleteMany({});

        // Create categories
        console.log('Creating categories...');
        const categories = await Category.insertMany(defaultCategories);
        console.log(`Created ${categories.length} categories`);

        // Check if admin exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (!existingAdmin) {
            // Create admin user
            console.log('Creating admin user...');
            const admin = new User({
                username: process.env.ADMIN_USERNAME || 'admin',
                email: process.env.ADMIN_EMAIL || 'admin@campus.edu',
                password: process.env.ADMIN_PASSWORD || 'admin123',
                role: 'admin',
                isActive: true
            });
            await admin.save();
            console.log('Admin user created');
            console.log('  Username:', admin.username);
            console.log('  Email:', admin.email);
            console.log('  Password:', process.env.ADMIN_PASSWORD || 'admin123');
        } else {
            console.log('Admin user already exists');
        }

        // Create sample items (optional)
        const sampleItems = [
            {
                itemName: 'Black iPhone 14 Pro',
                category: categories[0]._id, // Electronics
                description: 'Black iPhone 14 Pro with cracked screen protector. Has a blue case with flower pattern. Last seen near the library entrance.',
                location: 'Main Library - 1st Floor',
                contactInfo: 'Call 555-0101 or email john@campus.edu',
                reporterName: 'John Smith',
                reporterEmail: 'john@campus.edu',
                type: 'lost',
                status: 'approved',
                dateLostFound: new Date('2024-11-28')
            },
            {
                itemName: 'Blue Backpack with Books',
                category: categories[2]._id, // Clothing & Accessories
                description: 'Navy blue Jansport backpack containing calculus textbook and spiral notebooks. Found near the cafeteria.',
                location: 'Student Cafeteria',
                contactInfo: 'Visit Lost & Found Office - Admin Building Room 105',
                reporterName: 'Campus Security',
                reporterEmail: 'security@campus.edu',
                type: 'found',
                status: 'approved',
                dateLostFound: new Date('2024-11-29')
            },
            {
                itemName: 'Toyota Car Keys',
                category: categories[3]._id, // Keys
                description: 'Toyota key fob with black leather keychain. Has a small scratched area on the back.',
                location: 'Parking Lot B',
                contactInfo: 'Text 555-0202',
                reporterName: 'Security Office',
                reporterEmail: 'security@campus.edu',
                type: 'found',
                status: 'approved',
                dateLostFound: new Date('2024-11-30')
            },
            {
                itemName: 'Brown Leather Wallet',
                category: categories[4]._id, // Wallets & Cards
                description: 'Brown leather bifold wallet. Contains no cash but has personal photos. Very important to owner.',
                location: 'Science Building - Lab 203',
                contactInfo: 'Email mike@campus.edu',
                reporterName: 'Mike Johnson',
                reporterEmail: 'mike@campus.edu',
                type: 'lost',
                status: 'pending',
                dateLostFound: new Date('2024-12-01')
            },
            {
                itemName: 'Ray-Ban Sunglasses',
                category: categories[6]._id, // Personal Items
                description: 'Classic black Ray-Ban Wayfarer sunglasses. Found on bench near the fountain.',
                location: 'Central Plaza Fountain',
                contactInfo: 'Lost & Found Office',
                reporterName: 'Amy Wilson',
                reporterEmail: 'amy@campus.edu',
                type: 'found',
                status: 'approved',
                dateLostFound: new Date('2024-11-27')
            }
        ];

        // Check if items exist
        const existingItems = await Item.countDocuments();
        if (existingItems === 0) {
            console.log('Creating sample items...');
            await Item.insertMany(sampleItems);
            console.log(`Created ${sampleItems.length} sample items`);
        } else {
            console.log(`${existingItems} items already exist, skipping sample items`);
        }

        console.log('\n========================================');
        console.log('Database seeding completed successfully!');
        console.log('========================================');
        console.log('\nYou can now start the application with:');
        console.log('  npm start');
        console.log('\nAdmin login:');
        console.log('  URL: http://localhost:3000/admin/login');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        console.log('========================================\n');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run seeder
seedDatabase();
