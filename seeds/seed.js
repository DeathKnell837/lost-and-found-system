require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Location = require('../models/Location');
const Item = require('../models/Item');
const ClaimRequest = require('../models/ClaimRequest');

// Default categories
const defaultCategories = [
    { name: 'Electronics', description: 'Phones, laptops, tablets, chargers, earbuds, etc.', icon: 'fa-laptop' },
    { name: 'Books & Documents', description: 'Textbooks, notebooks, IDs, documents, binders', icon: 'fa-book' },
    { name: 'Clothing & Accessories', description: 'Jackets, hoodies, bags, jewelry, watches', icon: 'fa-tshirt' },
    { name: 'Keys', description: 'Motorcycle keys, car keys, padlock keys, key fobs', icon: 'fa-key' },
    { name: 'Wallets & Cards', description: 'Wallets, credit cards, student IDs, transit passes', icon: 'fa-wallet' },
    { name: 'Sports Equipment', description: 'Sports gear, gym equipment, balls, rackets', icon: 'fa-futbol' },
    { name: 'Personal Items', description: 'Glasses, sunglasses, umbrellas, tumblers, water bottles', icon: 'fa-user' },
    { name: 'Musical Instruments', description: 'Instruments, tuners, sheet music, music accessories', icon: 'fa-music' },
    { name: 'Stationery', description: 'Pens, pencils, calculators, drafting supplies, rulers', icon: 'fa-pencil' },
    { name: 'Other', description: 'Other miscellaneous campus items', icon: 'fa-box' }
];

// NDMC Campus Locations (Building 1 through 42)
const defaultLocations = [
    { name: 'Madonna Building', description: 'Building 1 - Main Administration & College Classrooms' },
    { name: 'Facade (Main Entrance)', description: 'Building 1a - Main Campus Entrance Gate & Guard Post' },
    { name: 'Madonna Grotto', description: 'Building 2 - Outdoor Spiritual Grotto & Garden' },
    { name: 'Old Library Bldg.', description: 'Building 3 - Heritage Library & Reading Rooms' },
    { name: 'College Library Bldg.', description: 'Building 4 - 3-Story Modern College Library' },
    { name: 'McGrath Bldg.', description: 'Building 5 - College of Arts and Sciences & Audio-Visual Hall' },
    { name: 'Student Lounge 1', description: 'Building 6 - Open Air Student Pavilion 1' },
    { name: 'Student Lounge 3', description: 'Building 7 - Student Pavilion 3' },
    { name: 'De Mazenod Bldg.', description: 'Building 8 - Academic & Religious Education Center' },
    { name: 'Garage', description: 'Building 9 - Student & Staff Vehicle Parking Garage' },
    { name: 'College Canteen', description: 'Building 10 - Main Campus Dining Hall & Food Stalls' },
    { name: 'Student Lounge 2', description: 'Building 11 - Covered Student Study Lounge 2' },
    { name: 'Rotonda', description: 'Building 12 - Central Campus Rotonda & Circular Park' },
    { name: 'Student Lounge', description: 'Building 13 - Central Student Recreation Lounge' },
    { name: 'Gym', description: 'Building 14 - NDMC Campus Gymnasium & Sports Arena' },
    { name: 'Carpentry Shop', description: 'Building 15 - Maintenance & Workshop Area' },
    { name: 'Clinic', description: 'Building 16 - College Health Clinic & First Aid Center' },
    { name: 'Primera Hall', description: 'Building 17 - Student Activity & Event Hall' },
    { name: 'Chapel', description: 'Building 18 - Historic Campus Chapel' },
    { name: 'Guest House', description: 'Building 19 - University Visitor & Faculty Lodge' },
    { name: 'CCGE Bldg.', description: 'Building 20 - College of Computer & Geodetic Engineering' },
    { name: 'Taekwondo Gym', description: 'Building 21 - Martial Arts & Fitness Dojo' },
    { name: 'Power House', description: 'Building 22 - Electrical & Generator Facility' },
    { name: 'Water Pump', description: 'Building 23 - Campus Central Water System' },
    { name: 'Fr. Sullivan Bldg.', description: 'Building 24 - Administrative Offices & Faculty Rooms' },
    { name: 'NDMC Chapel', description: 'Building 25 - Central University Chapel' },
    { name: 'Joseph Bldg.', description: 'Building 26 - Business Administration & Hospitality Hall' },
    { name: 'Reco House', description: 'Building 27 - Religious Community Residence' },
    { name: 'NDMC Farm', description: 'Building 28 - Agricultural & Extension Research Farm' },
    { name: 'Ladies Dormitory', description: 'Building 29 - Female Student Residence Hall' },
    { name: 'Refilling Station', description: 'Building 29a - Campus Purified Drinking Water Station' },
    { name: 'MEMED Office', description: 'Building 29b - Media, Educational & Multimedia Resource Office' },
    { name: 'GSD Office', description: 'Building 29c - General Services Department' },
    { name: 'Material Recovery Facility 2', description: 'Building 29d - Campus Recycling & Waste Center' },
    { name: 'New Science Laboratory', description: 'Building 30 - Modern Chemistry, Physics & Bio Labs' },
    { name: 'Water Pump (HS)', description: 'Building 31 - High School Water Reservoir' },
    { name: 'HS Gordon Bldg.', description: 'Building 32 - Junior High School Classrooms' },
    { name: 'IBED Computer Laboratory', description: 'Building 33 - Integrated Basic Education Computer Labs' },
    { name: 'HS Chemistry Laboratory (Old)', description: 'Building 34 - Basic Sciences Lab' },
    { name: 'HS Student Lounge', description: 'Building 35 - High School Student Recreation Lounge' },
    { name: 'Bishop Mongeau Bldg.', description: 'Building 36 - Senior High School Complex' },
    { name: 'Clinic (HS)', description: 'Building 37 - High School Health Clinic' },
    { name: 'ETD Bldg.', description: 'Building 38 - Elementary Training Department' },
    { name: 'ETD Asst. Principal\'s Office', description: 'Building 38a - Elementary Administrative Office' },
    { name: 'ETD Covered Court', description: 'Building 39 - Elementary Sports & Play Court' },
    { name: 'Halad Stage', description: 'Building 40 - Open Cultural Performance Stage' },
    { name: 'Chief Security Office', description: 'Building 41 - Campus Security Headquarters & Central Lost and Found Hub' },
    { name: 'Coop Building', description: 'Building 41a - Multi-Purpose Cooperative & Book Store' },
    { name: 'Guard House Gate 02', description: 'Building 41b - Secondary Campus Gate & Security Booth' },
    { name: 'Nursery Play Ground', description: 'Building 42 - Kindergarten Recreation Area' },
    { name: 'ETD Stage', description: 'Building 39a - Elementary Assembly Stage' }
];

// Seed function
async function seedDatabase(options = {}) {
    const shouldDisconnect = options.disconnect !== false;
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB:', mongoose.connection.name);
        }

        // Ensure upload directory exists and mockup images are synced
        const uploadsDir = path.join(__dirname, '../public/uploads');
        const mockupsDir = path.join(__dirname, '../public/images/mockups');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        if (fs.existsSync(mockupsDir)) {
            const files = fs.readdirSync(mockupsDir);
            for (const f of files) {
                const target = path.join(uploadsDir, f);
                fs.copyFileSync(path.join(mockupsDir, f), target);
            }
            console.log(`Synced ${files.length} mockup image assets to public/uploads.`);
        }

        // 1. Clear existing collections
        console.log('Clearing existing records...');
        await Category.deleteMany({});
        await Location.deleteMany({});
        await User.deleteMany({});
        await Item.deleteMany({});
        await ClaimRequest.deleteMany({});
        console.log('Existing records cleared.');

        // 2. Create Categories
        console.log('Seeding categories...');
        const categories = await Category.insertMany(defaultCategories);
        const catMap = {};
        categories.forEach(c => { catMap[c.name] = c._id; });
        console.log(`Created ${categories.length} categories.`);

        // 3. Create Campus Locations
        console.log('Seeding campus locations...');
        const locations = await Location.insertMany(defaultLocations);
        console.log(`Created ${locations.length} campus locations.`);

        // 4. Create Users (Admin, Security, and Students)
        console.log('Seeding users...');
        const usersToCreate = [
            {
                username: process.env.ADMIN_USERNAME || 'admin',
                email: process.env.ADMIN_EMAIL || 'admin@campus.edu',
                password: process.env.ADMIN_PASSWORD || 'Siladan2026',
                role: 'admin',
                isActive: true,
                isEmailVerified: true,
                phoneNumber: '0917-888-0001'
            },
            {
                username: 'security',
                email: 'security@ndmc.edu.ph',
                password: 'security123',
                role: 'admin',
                isActive: true,
                isEmailVerified: true,
                phoneNumber: '0917-888-0002'
            },
            {
                username: 'sarah.delacruz',
                email: 'sarah.delacruz@ndmc.edu.ph',
                password: 'password123',
                role: 'user',
                isActive: true,
                isEmailVerified: true,
                phoneNumber: '0920-123-4567'
            },
            {
                username: 'mark.villanueva',
                email: 'mark.villanueva@ndmc.edu.ph',
                password: 'password123',
                role: 'user',
                isActive: true,
                isEmailVerified: true,
                phoneNumber: '0921-234-5678'
            },
            {
                username: 'jessica.santos',
                email: 'jessica.santos@ndmc.edu.ph',
                password: 'password123',
                role: 'user',
                isActive: true,
                isEmailVerified: true,
                phoneNumber: '0922-345-6789'
            },
            {
                username: 'miguel.tan',
                email: 'miguel.tan@ndmc.edu.ph',
                password: 'password123',
                role: 'user',
                isActive: true,
                isEmailVerified: true,
                phoneNumber: '0923-456-7890'
            },
            {
                username: 'chloe.reyes',
                email: 'chloe.reyes@ndmc.edu.ph',
                password: 'password123',
                role: 'user',
                isActive: true,
                isEmailVerified: true,
                phoneNumber: '0924-567-8901'
            }
        ];

        const createdUsers = [];
        for (const u of usersToCreate) {
            const userDoc = new User(u);
            await userDoc.save();
            createdUsers.push(userDoc);
        }
        console.log(`Created ${createdUsers.length} users (admin, security, students).`);

        const adminUser = createdUsers[0];
        const securityUser = createdUsers[1];
        const sarah = createdUsers[2];
        const mark = createdUsers[3];
        const jessica = createdUsers[4];
        const miguel = createdUsers[5];
        const chloe = createdUsers[6];

        // 5. Seed Realistic Items across all 10 categories
        console.log('Seeding items with rich AI images and categories...');

        // ----------------------------------------------------
        // CATEGORY: WALLETS & CARDS
        // ----------------------------------------------------
        // Pair 1: Sarah Dela Cruz Student ID
        const itemFoundID = new Item({
            itemName: 'NDMC Student ID Card - Sarah J. Dela Cruz',
            category: catMap['Wallets & Cards'],
            description: 'Found an official Notre Dame of Midsayap College student ID card inside a transparent card sleeve with maroon NDMC lanyard. Student Name: Sarah J. Dela Cruz, ID No. 2023-45678, Course: BS Accountancy 2nd Year. Found lying on a wooden picnic table.',
            location: 'Student Lounge 1',
            contactInfo: 'Chief Security Office (Bldg 41) - Call 0917-888-0002',
            reporterName: 'Campus Security Office',
            reporterEmail: securityUser.email,
            reportedBy: securityUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/student-id-sarah-delacruz.jpg',
            dateLostFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
        await itemFoundID.save();

        const itemLostID = new Item({
            itemName: 'Lost NDMC School ID (Sarah Dela Cruz)',
            category: catMap['Wallets & Cards'],
            description: 'I lost my Notre Dame of Midsayap College student ID card with maroon NDMC lanyard in plastic badge holder. Name is Sarah J. Dela Cruz, 2nd Year BS Accountancy. Urgently needed for midterm examinations!',
            location: 'Student Lounge 1',
            contactInfo: '0920-123-4567 or email sarah.delacruz@ndmc.edu.ph',
            reporterName: 'Sarah J. Dela Cruz',
            reporterEmail: sarah.email,
            reportedBy: sarah._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/student-id-sarah-lost-ref.jpg',
            dateLostFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
        await itemLostID.save();

        // Mark Villanueva Student ID (Approved Found)
        const itemFoundMarkID = new Item({
            itemName: 'NDMC Student ID Card - Mark Villanueva (BSIT)',
            category: catMap['Wallets & Cards'],
            description: 'Found official NDMC Student Identification Card for Mark Villanueva, Student Number 2022-10892, 3rd Year BS Information Technology, CITE Department. Has dark green university lanyard. Left on circulation counter.',
            location: 'College Library Bldg.',
            contactInfo: 'College Library Counter or Bldg 41',
            reporterName: 'Library Staff',
            reporterEmail: 'library@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/student-id-mark-villanueva.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemFoundMarkID.save();

        // Pair 2: Brown Leather Wallet
        const itemFoundWallet = new Item({
            itemName: 'Dark Brown Genuine Leather Bifold Wallet',
            category: catMap['Wallets & Cards'],
            description: 'Distressed dark brown genuine leather bifold wallet with contrast perimeter stitching. Found on a dining table at the College Canteen during lunch break. Contains student receipts and identification cards.',
            location: 'College Canteen',
            contactInfo: 'Chief Security Office (Bldg 41)',
            reporterName: 'Canteen Supervisor (Nanay Rosa)',
            reporterEmail: 'canteen@ndmc.edu.ph',
            reportedBy: securityUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/brown-leather-wallet.jpg',
            dateLostFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
        await itemFoundWallet.save();

        const itemLostWallet = new Item({
            itemName: 'Lost Dark Brown Leather Bifold Wallet',
            category: catMap['Wallets & Cards'],
            description: 'Lost my brown vintage leather bifold wallet while having lunch at College Canteen. It has my weekly allowance, family polaroid photos, and student loyalty card inside.',
            location: 'College Canteen',
            contactInfo: '0923-456-7890 or miguel.tan@ndmc.edu.ph',
            reporterName: 'Miguel Tan',
            reporterEmail: miguel.email,
            reportedBy: miguel._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/brown-leather-lost-wallet.jpg',
            dateLostFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
        await itemLostWallet.save();

        // Black Cardholder (Claimed Item)
        const itemClaimedCardholder = new Item({
            itemName: 'Black Slim Leather Cardholder Wallet',
            category: catMap['Wallets & Cards'],
            description: 'Minimalist black matte leather cardholder with RFID protection slot and university ATM card. Claimed by owner with matching ID and signature.',
            location: 'Student Lounge 2',
            contactInfo: 'Claimed and released by Campus Security',
            reporterName: 'Campus Security',
            reporterEmail: securityUser.email,
            reportedBy: securityUser._id,
            type: 'found',
            status: 'claimed',
            imagePath: '/uploads/black-leather-cardholder.jpg',
            dateLostFound: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            claimedBy: {
                name: 'Miguel Tan',
                email: 'miguel.tan@ndmc.edu.ph',
                phone: '0923-456-7890',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            }
        });
        await itemClaimedCardholder.save();

        // ----------------------------------------------------
        // CATEGORY: ELECTRONICS
        // ----------------------------------------------------
        // Pair 3: Asus Vivobook Laptop
        const itemFoundLaptop = new Item({
            itemName: 'Asus Vivobook 15 Laptop (Silver)',
            category: catMap['Electronics'],
            description: 'Silver metallic Asus Vivobook 15.6-inch laptop found on a study desk on the 2nd floor of College Library Building next to programming textbooks and study lamp. Running Windows 11 with dark code editor open.',
            location: 'College Library Bldg.',
            contactInfo: 'College Library Circulation Counter - Room 102',
            reporterName: 'Library Staff (Mrs. Mendoza)',
            reporterEmail: 'library@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/asus-vivobook-laptop.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemFoundLaptop.save();

        const itemLostLaptop = new Item({
            itemName: 'Lost Silver Asus Vivobook 15-inch Laptop',
            category: catMap['Electronics'],
            description: 'Accidentally left my silver Asus Vivobook laptop on a wooden study table at the College Library while rushing to my afternoon lecture. It has my source code, thesis drafts, and assignments.',
            location: 'College Library Bldg.',
            contactInfo: '0921-234-5678 or mark.villanueva@ndmc.edu.ph',
            reporterName: 'Mark Villanueva',
            reporterEmail: mark.email,
            reportedBy: mark._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/asus-vivobook-lost-angle.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemLostLaptop.save();

        // Pair 4: Apple AirPods Pro Case
        const itemFoundAirPods = new Item({
            itemName: 'Apple AirPods Pro Wireless Earbuds Case (White)',
            category: catMap['Electronics'],
            description: 'Glossy white Apple AirPods Pro 2nd Generation charging case with wireless earbuds inside. Found resting on a wooden student lounge coffee table in Student Lounge 2 next to a blue ceramic mug.',
            location: 'Student Lounge 2',
            contactInfo: 'Student Affairs Office (Madonna Bldg.)',
            reporterName: 'Student Affairs Staff',
            reporterEmail: 'sao@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/apple-airpods-pro-case.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemFoundAirPods.save();

        const itemLostAirPods = new Item({
            itemName: 'Lost White Apple AirPods Pro 2nd Gen Case',
            category: catMap['Electronics'],
            description: 'I lost my white Apple AirPods Pro case with both earbuds inside in Student Lounge 2 while studying with groupmates. The charging LED light glows green/amber when opened.',
            location: 'Student Lounge 2',
            contactInfo: '0924-567-8901 or chloe.reyes@ndmc.edu.ph',
            reporterName: 'Chloe Reyes',
            reporterEmail: chloe.email,
            reportedBy: chloe._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/apple-airpods-lost-case.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemLostAirPods.save();

        // Pair 5: Blue iPhone 13
        const itemFoundPhone = new Item({
            itemName: 'Apple iPhone 13 (Midnight Blue, Clear Case)',
            category: catMap['Electronics'],
            description: 'Midnight blue Apple iPhone 13 in a clear transparent silicone shockproof bumper case. Found resting on the stone bench outside the Facade Main Entrance gate.',
            location: 'Facade (Main Entrance)',
            contactInfo: 'Chief Security Office (Bldg 41)',
            reporterName: 'Gate Guard Security',
            reporterEmail: securityUser.email,
            reportedBy: securityUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/blue-iphone-13.jpg',
            dateLostFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
        await itemFoundPhone.save();

        const itemLostPhone = new Item({
            itemName: 'Lost Midnight Blue iPhone 13 at Main Gate',
            category: catMap['Electronics'],
            description: 'Lost my dark blue iPhone 13 in a clear silicone case on the stone bench near the main entrance facade while waiting for tricycle ride home. Lock screen has a picture of my pet dog.',
            location: 'Facade (Main Entrance)',
            contactInfo: '0920-123-4567 or sarah.delacruz@ndmc.edu.ph',
            reporterName: 'Sarah J. Dela Cruz',
            reporterEmail: sarah.email,
            reportedBy: sarah._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/blue-iphone-lost-screen.jpg',
            dateLostFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
        await itemLostPhone.save();

        // Black Smartphone (Pending Review)
        const itemPendingPhone = new Item({
            itemName: 'Matte Black Smartphone in Heavy Duty Case (Pending)',
            category: catMap['Electronics'],
            description: 'Found black touchscreen smartphone in shockproof rugged armor case left on an armrest in Primera Hall after convocation. Phone is locked.',
            location: 'Primera Hall',
            contactInfo: '0917-888-0002',
            reporterName: 'Primera Hall Custodian',
            reporterEmail: 'facilities@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'pending',
            imagePath: '/uploads/black-smartphone-found.jpg',
            dateLostFound: new Date()
        });
        await itemPendingPhone.save();

        // ----------------------------------------------------
        // CATEGORY: PERSONAL ITEMS
        // ----------------------------------------------------
        // Pair 6: AquaFlask Lilac Tumbler
        const itemFoundTumbler = new Item({
            itemName: 'AquaFlask Lilac Insulated Water Bottle 32oz',
            category: catMap['Personal Items'],
            description: 'Light purple / lilac AquaFlask insulated stainless steel water tumbler found on the lower bleachers of the campus gymnasium after varsity basketball practice. 32oz capacity with wide black spout lid and carry handle.',
            location: 'Gym',
            contactInfo: 'Sports Coordinator Office - Gym Room 1',
            reporterName: 'Coach Ramos',
            reporterEmail: 'sports@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/aquaflask-lilac-tumbler.jpg',
            dateLostFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
        await itemFoundTumbler.save();

        const itemLostTumbler = new Item({
            itemName: 'Lost Pastel Purple AquaFlask 32oz',
            category: catMap['Personal Items'],
            description: 'Lost my 32oz lilac / pastel purple AquaFlask tumbler at the campus gymnasium bleachers during intramurals cheer dance practice. Still in good condition with minor scratch on the cap.',
            location: 'Gym',
            contactInfo: '0922-345-6789 or jessica.santos@ndmc.edu.ph',
            reporterName: 'Jessica Santos',
            reporterEmail: jessica.email,
            reportedBy: jessica._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/aquaflask-lilac-lost-ref.jpg',
            dateLostFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
        await itemLostTumbler.save();

        // Mint Green AquaFlask (Found Approved)
        const itemFoundMintTumbler = new Item({
            itemName: 'AquaFlask Mint Green Stainless Tumbler 22oz',
            category: catMap['Personal Items'],
            description: 'Vibrant mint green stainless steel AquaFlask tumbler with black silicone boot. Found at the College Canteen dining pavilion table near juice stall.',
            location: 'College Canteen',
            contactInfo: 'Canteen Lost & Found Box',
            reporterName: 'Canteen Staff',
            reporterEmail: 'canteen@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/aquaflask-mint-tumbler.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemFoundMintTumbler.save();

        // Pair 7: Tortoiseshell Eyeglasses
        const itemFoundGlasses = new Item({
            itemName: 'Tortoiseshell Prescription Glasses with Blue Hard Case',
            category: catMap['Personal Items'],
            description: 'Round tortoiseshell acetate prescription eyeglasses resting in an open dark blue textured clamshell protective hard case. Found on a reading desk in the Old Library building.',
            location: 'Old Library Bldg.',
            contactInfo: 'Old Library Reference Desk',
            reporterName: 'Library Custodian',
            reporterEmail: 'library@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/tortoiseshell-eyeglasses.jpg',
            dateLostFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
        await itemFoundGlasses.save();

        const itemLostGlasses = new Item({
            itemName: 'Lost Reading Glasses (Tortoiseshell Frame, Blue Case)',
            category: catMap['Personal Items'],
            description: 'Left my round tortoiseshell reading glasses inside a blue hard case on a table at Old Library building. High prescription, cannot read lecture slides without them.',
            location: 'Old Library Bldg.',
            contactInfo: '0922-345-6789 or jessica.santos@ndmc.edu.ph',
            reporterName: 'Jessica Santos',
            reporterEmail: jessica.email,
            reportedBy: jessica._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/tortoiseshell-lost-glasses.jpg',
            dateLostFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
        await itemLostGlasses.save();

        // Navy Folding Umbrella (Found Approved)
        const itemFoundUmbrella = new Item({
            itemName: 'Navy Blue Automatic Compact Folding Umbrella',
            category: catMap['Personal Items'],
            description: 'Compact navy blue automatic folding travel umbrella with push-button handle. Found on a wet wooden bench outside Primera Hall following the morning monsoon rain.',
            location: 'Primera Hall',
            contactInfo: 'Primera Hall Custodial Station',
            reporterName: 'Primera Hall Staff',
            reporterEmail: 'facilities@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/navy-folding-umbrella.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemFoundUmbrella.save();

        // Claimed AquaFlask
        const itemClaimedTumbler = new Item({
            itemName: 'AquaFlask Lilac 32oz Tumbler (Claimed)',
            category: catMap['Personal Items'],
            description: 'Lilac AquaFlask insulated water tumbler with floral decal. Successfully claimed by verified owner with purchase receipt and photo proof.',
            location: 'Gym',
            contactInfo: 'Claimed and released by Security Office',
            reporterName: 'Campus Security',
            reporterEmail: securityUser.email,
            reportedBy: securityUser._id,
            type: 'found',
            status: 'claimed',
            imagePath: '/uploads/aquaflask-lilac-tumbler.jpg',
            dateLostFound: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            claimedBy: {
                name: 'Jessica Santos',
                email: 'jessica.santos@ndmc.edu.ph',
                phone: '0922-345-6789',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        });
        await itemClaimedTumbler.save();

        // ----------------------------------------------------
        // CATEGORY: CLOTHING & ACCESSORIES
        // ----------------------------------------------------
        // Pair 8: Herschel Black Backpack
        const itemFoundBackpack = new Item({
            itemName: 'Black Herschel Canvas Backpack with Brown Straps',
            category: catMap['Clothing & Accessories'],
            description: 'Black heavy canvas Herschel Little America style backpack with brown synthetic leather buckle straps and front zipper pouch. Found on a chair in the College Canteen dining pavilion.',
            location: 'College Canteen',
            contactInfo: 'Chief Security Office (Bldg 41)',
            reporterName: 'Campus Security',
            reporterEmail: securityUser.email,
            reportedBy: securityUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/herschel-black-backpack.jpg',
            dateLostFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
        await itemFoundBackpack.save();

        const itemLostBackpack = new Item({
            itemName: 'Lost Black Herschel Backpack with Leather Straps',
            category: catMap['Clothing & Accessories'],
            description: 'Left my black Herschel backpack on a dining chair at the College Canteen. Contains three spiral notebooks, pens, and a biology textbook.',
            location: 'College Canteen',
            contactInfo: '0924-567-8901 or chloe.reyes@ndmc.edu.ph',
            reporterName: 'Chloe Reyes',
            reporterEmail: chloe.email,
            reportedBy: chloe._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/herschel-black-lost-backpack.jpg',
            dateLostFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
        await itemLostBackpack.save();

        // JanSport Maroon Backpack (Found Approved)
        const itemFoundJansport = new Item({
            itemName: 'JanSport Maroon Classic Student Backpack',
            category: catMap['Clothing & Accessories'],
            description: 'College maroon JanSport canvas student backpack with front utility pocket and key clip. Found in Student Lounge 1 pavilion.',
            location: 'Student Lounge 1',
            contactInfo: 'Student Lounge 1 Proctor Desk',
            reporterName: 'Student Assistant',
            reporterEmail: 'assistant@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/jansport-maroon-backpack.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemFoundJansport.save();

        // Pair 9: Maroon Varsity Hoodie
        const itemFoundHoodie = new Item({
            itemName: 'Maroon Collegiate Varsity Fleece Hoodie',
            category: catMap['Clothing & Accessories'],
            description: 'Heavyweight maroon fleece university varsity pullover hoodie with white collegiate lettering and ribbed trim. Left folded over an auditorium chair in McGrath Building.',
            location: 'McGrath Bldg.',
            contactInfo: 'McGrath Building Proctor Office Room 101',
            reporterName: 'Proctor Alvarez',
            reporterEmail: 'mcgrath@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/maroon-varsity-hoodie.jpg',
            dateLostFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
        await itemFoundHoodie.save();

        const itemLostHoodie = new Item({
            itemName: 'Lost Maroon College Varsity Fleece Hoodie',
            category: catMap['Clothing & Accessories'],
            description: 'Lost my favorite maroon college varsity hoodie inside the McGrath Building AV Hall during the engineering seminar. Size Large with kangaroo pocket.',
            location: 'McGrath Bldg.',
            contactInfo: '0921-234-5678 or mark.villanueva@ndmc.edu.ph',
            reporterName: 'Mark Villanueva',
            reporterEmail: mark.email,
            reportedBy: mark._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/maroon-varsity-lost-hoodie.jpg',
            dateLostFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
        await itemLostHoodie.save();

        // Casio G-Shock Watch (Claimed Item)
        const itemClaimedWatch = new Item({
            itemName: 'Casio G-Shock Digital Sports Watch DW-5600',
            category: catMap['Clothing & Accessories'],
            description: 'Matte black Casio G-Shock shock-resistant digital wristwatch with resin strap. Successfully claimed by varsity martial artist after showing boxing bag locker receipt.',
            location: 'Taekwondo Gym',
            contactInfo: 'Released by Security Office',
            reporterName: 'Taekwondo Club President',
            reporterEmail: 'taekwondo@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'claimed',
            imagePath: '/uploads/casio-gshock-sports-watch.jpg',
            dateLostFound: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            claimedBy: {
                name: 'Mark Villanueva',
                email: 'mark.villanueva@ndmc.edu.ph',
                phone: '0921-234-5678',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            }
        });
        await itemClaimedWatch.save();

        // ----------------------------------------------------
        // CATEGORY: KEYS
        // ----------------------------------------------------
        // Pair 10: Honda Motorcycle Keys
        const itemFoundKeys = new Item({
            itemName: 'Honda Motorcycle Key with Blue Braided Lanyard',
            category: catMap['Keys'],
            description: 'Black Honda motorcycle ignition key with silver padlock keys and dark blue braided cord wrist lanyard. Found on the asphalt pavement near the student motorcycle parking area.',
            location: 'Garage',
            contactInfo: 'Guard House Gate 02 - Bldg 41b',
            reporterName: 'Parking Guard Officer',
            reporterEmail: securityUser.email,
            reportedBy: securityUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/honda-motorcycle-keys.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemFoundKeys.save();

        const itemLostKeys = new Item({
            itemName: 'Lost Honda Motorcycle Ignition Keys',
            category: catMap['Keys'],
            description: 'Dropped my Honda motorcycle key with 2 padlock keys and blue patterned paracord lanyard while walking from the campus parking garage to my morning class.',
            location: 'Garage',
            contactInfo: '0921-234-5678 or mark.villanueva@ndmc.edu.ph',
            reporterName: 'Mark Villanueva',
            reporterEmail: mark.email,
            reportedBy: mark._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/honda-motorcycle-lost-keys.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemLostKeys.save();

        // Yamaha Motorcycle Keys (Found Approved)
        const itemFoundYamaha = new Item({
            itemName: 'Yamaha Motorcycle Key with Red Strap',
            category: catMap['Keys'],
            description: 'Yamaha scooter key with red embroidered pull tag and small padlock key found near secondary entrance Guard House Gate 02.',
            location: 'Guard House Gate 02',
            contactInfo: 'Gate 02 Security Post',
            reporterName: 'Security Guard Santos',
            reporterEmail: 'guard@ndmc.edu.ph',
            reportedBy: securityUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/yamaha-motorcycle-keys.jpg',
            dateLostFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
        await itemFoundYamaha.save();

        // Dormitory Keys (Found Approved)
        const itemFoundDormKeys = new Item({
            itemName: 'St. Benedict Dormitory Room 208 Brass Keys',
            category: catMap['Keys'],
            description: 'Two brass door keys on a silver keyring with maroon acrylic NDMC Ladies Dormitory tag engraved Room 208. Found in hallway outside dorm reception.',
            location: 'Ladies Dormitory',
            contactInfo: 'Ladies Dormitory Matron Office',
            reporterName: 'Dormitory Matron',
            reporterEmail: 'dorm@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/dorm-brass-keys.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemFoundDormKeys.save();

        // Claimed Keys
        const itemClaimedKeys = new Item({
            itemName: 'Honda Motorcycle Key with Braided Paracord (Claimed)',
            category: catMap['Keys'],
            description: 'Honda ignition key claimed by student rider after verifying motorcycle registration (CR/OR) and bike key match at security headquarters.',
            location: 'Garage',
            contactInfo: 'Released by Bldg 41',
            reporterName: 'Campus Security',
            reporterEmail: securityUser.email,
            reportedBy: securityUser._id,
            type: 'found',
            status: 'claimed',
            imagePath: '/uploads/honda-motorcycle-keys.jpg',
            dateLostFound: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            claimedBy: {
                name: 'Mark Villanueva',
                email: 'mark.villanueva@ndmc.edu.ph',
                phone: '0921-234-5678',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        });
        await itemClaimedKeys.save();

        // ----------------------------------------------------
        // CATEGORY: BOOKS & DOCUMENTS
        // ----------------------------------------------------
        // Pair 11: Calculus Textbook & Notebook
        const itemFoundBook = new Item({
            itemName: 'University Calculus Textbook & Grid Spiral Notebook',
            category: catMap['Books & Documents'],
            description: 'Hardbound university mathematics calculus textbook open to integral calculus formulas, accompanied by a wirebound grid notebook and neon yellow Stabilo Boss highlighter. Found in study carrel cubicle.',
            location: 'College Library Bldg.',
            contactInfo: 'College Library 2nd Floor Desk',
            reporterName: 'Student Assistant',
            reporterEmail: 'library@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/calculus-textbook-notebook.jpg',
            dateLostFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
        await itemFoundBook.save();

        const itemLostBook = new Item({
            itemName: 'Lost University Calculus Hardcover Textbook',
            category: catMap['Books & Documents'],
            description: 'Left my calculus textbook and engineering grid notes on a 2nd floor desk in College Library Building. Book has my name written in pencil on the inside front cover.',
            location: 'College Library Bldg.',
            contactInfo: '0923-456-7890 or miguel.tan@ndmc.edu.ph',
            reporterName: 'Miguel Tan',
            reporterEmail: miguel.email,
            reportedBy: miguel._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/calculus-textbook-lost-view.jpg',
            dateLostFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
        await itemLostBook.save();

        // Certificate of Matriculation (COM) Document (Found Approved)
        const itemFoundCOM = new Item({
            itemName: 'NDMC Certificate of Matriculation (COM) - Sarah Dela Cruz',
            category: catMap['Books & Documents'],
            description: 'Official printed NDMC Certificate of Matriculation (COM) with university seal and registrar stamp for Sarah J. Dela Cruz (BSA-2). Found on administrative bench outside Fr. Sullivan Building.',
            location: 'Fr. Sullivan Bldg.',
            contactInfo: 'Registrar Office / Fr. Sullivan Bldg Room 102',
            reporterName: 'Registrar Staff',
            reporterEmail: 'registrar@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/college-registration-com.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemFoundCOM.save();

        // Claimed Calculus Book
        const itemClaimedBook = new Item({
            itemName: 'Calculus Textbook & Grid Notebook (Claimed)',
            category: catMap['Books & Documents'],
            description: 'Calculus textbook verified and returned to student Miguel Tan with matching library card and course enrollment schedule.',
            location: 'College Library Bldg.',
            contactInfo: 'Library Circulation Desk',
            reporterName: 'Library Staff',
            reporterEmail: 'library@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'claimed',
            imagePath: '/uploads/calculus-textbook-notebook.jpg',
            dateLostFound: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            claimedBy: {
                name: 'Miguel Tan',
                email: 'miguel.tan@ndmc.edu.ph',
                phone: '0923-456-7890',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        });
        await itemClaimedBook.save();

        // ----------------------------------------------------
        // CATEGORY: SPORTS EQUIPMENT
        // ----------------------------------------------------
        // Pair 12: Spalding Basketball
        const itemFoundBall = new Item({
            itemName: 'Spalding TF-1000 Legacy Indoor Basketball',
            category: catMap['Sports Equipment'],
            description: 'Official collegiate composite leather indoor basketball with black grooves and gold Spalding lettering. Marked NDMC Athletics on side panel. Found under the gym bleachers after tournament.',
            location: 'Gym',
            contactInfo: 'Gym Sports Equipment Custodian',
            reporterName: 'Coach Ramos',
            reporterEmail: 'sports@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/spalding-indoor-basketball.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemFoundBall.save();

        const itemLostBall = new Item({
            itemName: 'Lost Official Spalding TF-1000 Basketball',
            category: catMap['Sports Equipment'],
            description: 'Left our team Spalding indoor basketball near the north bleachers of the campus Gym during afternoon intramural team practice.',
            location: 'Gym',
            contactInfo: '0921-234-5678 or mark.villanueva@ndmc.edu.ph',
            reporterName: 'Mark Villanueva',
            reporterEmail: mark.email,
            reportedBy: mark._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/spalding-indoor-basketball.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemLostBall.save();

        // Yonex Badminton Racket (Found Approved)
        const itemFoundRacket = new Item({
            itemName: 'Yonex Nanoray 70 Light Badminton Racket in Case',
            category: catMap['Sports Equipment'],
            description: 'Black and red padded Yonex racket case containing a Nanoray 70 Light graphite badminton racket and shuttlecock. Found on court bench in Taekwondo Gym.',
            location: 'Taekwondo Gym',
            contactInfo: 'Gymnasium Equipment Office',
            reporterName: 'Sports Assistant',
            reporterEmail: 'sports@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/yonex-badminton-racket.jpg',
            dateLostFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
        await itemFoundRacket.save();

        // ----------------------------------------------------
        // CATEGORY: MUSICAL INSTRUMENTS
        // ----------------------------------------------------
        // Pair 13: Acoustic Guitar
        const itemFoundGuitar = new Item({
            itemName: 'Yamaha F310 Acoustic Guitar in Black Padded Gig Bag',
            category: catMap['Musical Instruments'],
            description: 'Black nylon padded guitar gig bag with orange zipper piping containing a Yamaha acoustic guitar and picks. Found leaning against the acoustic wall in Primera Hall after choir rehearsal.',
            location: 'Primera Hall',
            contactInfo: 'Music Ministry Office - Primera Hall',
            reporterName: 'Choir Director',
            reporterEmail: 'music@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/acoustic-guitar-case.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemFoundGuitar.save();

        const itemLostGuitar = new Item({
            itemName: 'Lost Yamaha Acoustic Guitar in Black Case',
            category: catMap['Musical Instruments'],
            description: 'Accidentally forgot my Yamaha acoustic guitar inside its black padded carrying bag in Primera Hall after university mass choir rehearsal.',
            location: 'Primera Hall',
            contactInfo: '0924-567-8901 or chloe.reyes@ndmc.edu.ph',
            reporterName: 'Chloe Reyes',
            reporterEmail: chloe.email,
            reportedBy: chloe._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/acoustic-guitar-case.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemLostGuitar.save();

        // Guitar Tuner (Found Approved)
        const itemFoundTuner = new Item({
            itemName: 'Digital Clip-on Chromatic Guitar Tuner',
            category: catMap['Musical Instruments'],
            description: 'Black clip-on LCD chromatic guitar tuner displaying green backlight note indicator. Found on speaker stand at Halad Stage following open mic night.',
            location: 'Halad Stage',
            contactInfo: 'Halad Stage Production Crew',
            reporterName: 'Stage Coordinator',
            reporterEmail: 'events@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/guitar-clipon-tuner.jpg',
            dateLostFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
        await itemFoundTuner.save();

        // ----------------------------------------------------
        // CATEGORY: STATIONERY
        // ----------------------------------------------------
        // Pair 14: Casio fx-991ES Calculator
        const itemFoundCalc = new Item({
            itemName: 'Casio Scientific Calculator fx-991ES PLUS',
            category: catMap['Stationery'],
            description: 'Black Casio fx-991ES Plus natural display scientific calculator found on an arm desk in CCGE Building Room 204 after the advanced engineering calculus lecture. Has solar cell on upper right.',
            location: 'CCGE Bldg.',
            contactInfo: 'CCGE Dean\'s Office - Bldg 20 Room 101',
            reporterName: 'Engr. Dalisay',
            reporterEmail: 'ccge@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/casio-fx991es-calculator.jpg',
            dateLostFound: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        });
        await itemFoundCalc.save();

        const itemLostCalc = new Item({
            itemName: 'Lost Black Casio Scientific Calculator fx-991ES',
            category: catMap['Stationery'],
            description: 'Forgot my black Casio fx-991ES Plus calculator in CCGE Building Room 204. It has a light scratch on the back sliding cover. Needed urgently for upcoming board exam review tests.',
            location: 'CCGE Bldg.',
            contactInfo: '0921-234-5678 or mark.villanueva@ndmc.edu.ph',
            reporterName: 'Mark Villanueva',
            reporterEmail: mark.email,
            reportedBy: mark._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/casio-fx991es-lost-detail.jpg',
            dateLostFound: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        });
        await itemLostCalc.save();

        // Rotapen Drafting Set (Found Approved)
        const itemFoundDrafting = new Item({
            itemName: 'Rotapen Engineering Technical Drafting Triangle & Compass Set',
            category: catMap['Stationery'],
            description: 'Professional engineering drafting kit with transparent 30/60 degree triangle ruler, precision silver metal compass, and 0.5mm mechanical pencil on green cutting mat. Found in CCGE drafting studio.',
            location: 'CCGE Bldg.',
            contactInfo: 'CCGE Drafting Studio Laboratory',
            reporterName: 'Engr. Flores',
            reporterEmail: 'ccge@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/drafting-triangle-compass.jpg',
            dateLostFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
        await itemFoundDrafting.save();

        // ----------------------------------------------------
        // CATEGORY: OTHER
        // ----------------------------------------------------
        // Pair 15: Laboratory Safety Goggles
        const itemFoundGoggles = new Item({
            itemName: 'Chemistry Laboratory Clear Impact Safety Goggles',
            category: catMap['Other'],
            description: 'Clear panoramic chemical splash and impact safety goggles with black adjustable elastic headband strap. Left on lab counter in New Science Laboratory Room 302.',
            location: 'New Science Laboratory',
            contactInfo: 'Science Laboratory Custodian',
            reporterName: 'Lab Custodian Mang Berting',
            reporterEmail: 'sciencelab@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'approved',
            imagePath: '/uploads/lab-safety-goggles.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemFoundGoggles.save();

        const itemLostGoggles = new Item({
            itemName: 'Lost Chemistry Lab Safety Eyewear with Headband',
            category: catMap['Other'],
            description: 'Left my clear laboratory protective goggles on a sink bench in New Science Laboratory after Organic Chemistry experiment 4. Required for all lab classes.',
            location: 'New Science Laboratory',
            contactInfo: '0922-345-6789 or jessica.santos@ndmc.edu.ph',
            reporterName: 'Jessica Santos',
            reporterEmail: jessica.email,
            reportedBy: jessica._id,
            type: 'lost',
            status: 'approved',
            imagePath: '/uploads/lab-safety-goggles.jpg',
            dateLostFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
        await itemLostGoggles.save();

        // ----------------------------------------------------
        // PENDING ITEMS (ADMIN REVIEW QUEUE)
        // ----------------------------------------------------
        const itemPendingReport1 = new Item({
            itemName: 'Honda Key with Paracord Cord (Pending Review)',
            category: catMap['Keys'],
            description: 'Found a motorcycle key near the campus Rotonda bushes during afternoon maintenance sweep. Awaiting security admin review before publication.',
            location: 'Rotonda',
            contactInfo: '0917-000-9999',
            reporterName: 'GSD Maintenance Staff',
            reporterEmail: 'gsd@ndmc.edu.ph',
            reportedBy: adminUser._id,
            type: 'found',
            status: 'pending',
            imagePath: '/uploads/honda-motorcycle-keys.jpg',
            dateLostFound: new Date()
        });
        await itemPendingReport1.save();

        const itemPendingReport2 = new Item({
            itemName: 'Navy Compact Umbrella Left in Canteen (Pending Review)',
            category: catMap['Personal Items'],
            description: 'Found navy blue travel umbrella hanging on food stall railing in College Canteen.',
            location: 'College Canteen',
            contactInfo: '0920-555-1234',
            reporterName: 'Student Bystander',
            reporterEmail: 'bystander@ndmc.edu.ph',
            reportedBy: sarah._id,
            type: 'found',
            status: 'pending',
            imagePath: '/uploads/navy-folding-umbrella-closed.jpg',
            dateLostFound: new Date()
        });
        await itemPendingReport2.save();

        // ----------------------------------------------------
        // REJECTED ITEMS (ADMIN REJECTED QUEUE / AUDIT)
        // ----------------------------------------------------
        const itemRejectedSpam = new Item({
            itemName: 'Sample Test Post (Rejected Spam)',
            category: catMap['Other'],
            description: 'Testing 1 2 3 please ignore this test post for system check.',
            location: 'Rotonda',
            contactInfo: 'test@example.com',
            reporterName: 'Anonymous Guest',
            reporterEmail: 'test@example.com',
            type: 'lost',
            status: 'rejected',
            adminNotes: 'Rejected: Incomplete and non-genuine test submission without identifying details.',
            imagePath: null,
            dateLostFound: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        });
        await itemRejectedSpam.save();

        const itemRejectedDuplicate = new Item({
            itemName: 'Duplicate Sarah Dela Cruz ID Report (Rejected Duplicate)',
            category: catMap['Wallets & Cards'],
            description: 'Duplicate report of student ID card already logged in system.',
            location: 'Student Lounge 1',
            contactInfo: 'sarah.delacruz@ndmc.edu.ph',
            reporterName: 'Sarah J. Dela Cruz',
            reporterEmail: sarah.email,
            reportedBy: sarah._id,
            type: 'lost',
            status: 'rejected',
            adminNotes: 'Rejected: Duplicate submission. Original report approved as Item #2.',
            imagePath: '/uploads/student-id-sarah-lost-ref.jpg',
            dateLostFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
        await itemRejectedDuplicate.save();

        const totalItemCount = await Item.countDocuments();
        console.log(`Total ${totalItemCount} items created across all 10 categories.`);

        // 6. Link Potential Matches with AI Reasoning
        console.log('Linking potential matches between lost and found items...');

        // Link Pair 1: Sarah Dela Cruz Student ID (Wallets & Cards)
        itemFoundID.potentialMatches = [{
            item: itemLostID._id,
            score: 97,
            reasoning: 'Exact visual match: Official NDMC student ID card belonging to Sarah J. Dela Cruz with maroon NDMC lanyard, located at Student Lounge 1.',
            matchedAt: new Date()
        }];
        await itemFoundID.save();

        itemLostID.potentialMatches = [{
            item: itemFoundID._id,
            score: 97,
            reasoning: 'Exact visual match: Official NDMC student ID card belonging to Sarah J. Dela Cruz with maroon NDMC lanyard, located at Student Lounge 1.',
            matchedAt: new Date()
        }];
        await itemLostID.save();

        // Link Pair 2: Brown Leather Wallet (Wallets & Cards)
        itemFoundWallet.potentialMatches = [{
            item: itemLostWallet._id,
            score: 91,
            reasoning: 'Category, location, and visual match: Vintage dark brown leather bifold wallet with white perimeter stitching found at College Canteen table.',
            matchedAt: new Date()
        }];
        await itemFoundWallet.save();

        itemLostWallet.potentialMatches = [{
            item: itemFoundWallet._id,
            score: 91,
            reasoning: 'Category, location, and visual match: Vintage dark brown leather bifold wallet with white perimeter stitching found at College Canteen table.',
            matchedAt: new Date()
        }];
        await itemLostWallet.save();

        // Link Pair 3: Asus Vivobook Laptop (Electronics)
        itemFoundLaptop.potentialMatches = [{
            item: itemLostLaptop._id,
            score: 94,
            reasoning: 'Visual and location match: Silver metallic Asus Vivobook 15.6-inch laptop reported lost and found on study desk at College Library Bldg.',
            matchedAt: new Date()
        }];
        await itemFoundLaptop.save();

        itemLostLaptop.potentialMatches = [{
            item: itemFoundLaptop._id,
            score: 94,
            reasoning: 'Visual and location match: Silver metallic Asus Vivobook 15.6-inch laptop reported lost and found on study desk at College Library Bldg.',
            matchedAt: new Date()
        }];
        await itemLostLaptop.save();

        // Link Pair 4: AirPods Pro Case (Electronics)
        itemFoundAirPods.potentialMatches = [{
            item: itemLostAirPods._id,
            score: 95,
            reasoning: 'Visual and location match: Glossy white Apple AirPods Pro 2nd Generation wireless earbuds charging case at Student Lounge 2.',
            matchedAt: new Date()
        }];
        await itemFoundAirPods.save();

        itemLostAirPods.potentialMatches = [{
            item: itemFoundAirPods._id,
            score: 95,
            reasoning: 'Visual and location match: Glossy white Apple AirPods Pro 2nd Generation wireless earbuds charging case at Student Lounge 2.',
            matchedAt: new Date()
        }];
        await itemLostAirPods.save();

        // Link Pair 5: Blue iPhone 13 (Electronics)
        itemFoundPhone.potentialMatches = [{
            item: itemLostPhone._id,
            score: 94,
            reasoning: 'Visual and location match: Midnight blue Apple iPhone 13 in clear silicone protective case on stone bench at Facade Main Entrance.',
            matchedAt: new Date()
        }];
        await itemFoundPhone.save();

        itemLostPhone.potentialMatches = [{
            item: itemFoundPhone._id,
            score: 94,
            reasoning: 'Visual and location match: Midnight blue Apple iPhone 13 in clear silicone protective case on stone bench at Facade Main Entrance.',
            matchedAt: new Date()
        }];
        await itemLostPhone.save();

        // Link Pair 6: AquaFlask Lilac Tumbler (Personal Items)
        itemFoundTumbler.potentialMatches = [{
            item: itemLostTumbler._id,
            score: 93,
            reasoning: 'Visual and category match: 32oz pastel lilac AquaFlask insulated water bottle with black lid found at the campus Gym.',
            matchedAt: new Date()
        }];
        await itemFoundTumbler.save();

        itemLostTumbler.potentialMatches = [{
            item: itemFoundTumbler._id,
            score: 93,
            reasoning: 'Visual and category match: 32oz pastel lilac AquaFlask insulated water bottle with black lid found at the campus Gym.',
            matchedAt: new Date()
        }];
        await itemLostTumbler.save();

        // Link Pair 7: Tortoiseshell Eyeglasses (Personal Items)
        itemFoundGlasses.potentialMatches = [{
            item: itemLostGlasses._id,
            score: 92,
            reasoning: 'Visual and location match: Round tortoiseshell prescription eyeglasses with blue clamshell hard case at Old Library Bldg.',
            matchedAt: new Date()
        }];
        await itemFoundGlasses.save();

        itemLostGlasses.potentialMatches = [{
            item: itemFoundGlasses._id,
            score: 92,
            reasoning: 'Visual and location match: Round tortoiseshell prescription eyeglasses with blue clamshell hard case at Old Library Bldg.',
            matchedAt: new Date()
        }];
        await itemLostGlasses.save();

        // Link Pair 8: Herschel Black Backpack (Clothing & Accessories)
        itemFoundBackpack.potentialMatches = [{
            item: itemLostBackpack._id,
            score: 93,
            reasoning: 'Visual match: Black Herschel canvas backpack with synthetic brown leather buckle straps at College Canteen.',
            matchedAt: new Date()
        }];
        await itemFoundBackpack.save();

        itemLostBackpack.potentialMatches = [{
            item: itemFoundBackpack._id,
            score: 93,
            reasoning: 'Visual match: Black Herschel canvas backpack with synthetic brown leather buckle straps at College Canteen.',
            matchedAt: new Date()
        }];
        await itemLostBackpack.save();

        // Link Pair 9: Maroon Varsity Hoodie (Clothing & Accessories)
        itemFoundHoodie.potentialMatches = [{
            item: itemLostHoodie._id,
            score: 91,
            reasoning: 'Visual and location match: Maroon college varsity fleece hoodie with collegiate lettering in McGrath Building.',
            matchedAt: new Date()
        }];
        await itemFoundHoodie.save();

        itemLostHoodie.potentialMatches = [{
            item: itemFoundHoodie._id,
            score: 91,
            reasoning: 'Visual and location match: Maroon college varsity fleece hoodie with collegiate lettering in McGrath Building.',
            matchedAt: new Date()
        }];
        await itemLostHoodie.save();

        // Link Pair 10: Honda Motorcycle Keys (Keys)
        itemFoundKeys.potentialMatches = [{
            item: itemLostKeys._id,
            score: 93,
            reasoning: 'Visual and location match: Black Honda motorcycle ignition key with silver padlock keys and blue braided cord lanyard at Garage parking.',
            matchedAt: new Date()
        }];
        await itemFoundKeys.save();

        itemLostKeys.potentialMatches = [{
            item: itemFoundKeys._id,
            score: 93,
            reasoning: 'Visual and location match: Black Honda motorcycle ignition key with silver padlock keys and blue braided cord lanyard at Garage parking.',
            matchedAt: new Date()
        }];
        await itemLostKeys.save();

        // Link Pair 11: Calculus Textbook (Books & Documents)
        itemFoundBook.potentialMatches = [{
            item: itemLostBook._id,
            score: 92,
            reasoning: 'Category, subject, and location match: University calculus textbook and notes reported lost and found on 2nd floor of College Library Bldg.',
            matchedAt: new Date()
        }];
        await itemFoundBook.save();

        itemLostBook.potentialMatches = [{
            item: itemFoundBook._id,
            score: 92,
            reasoning: 'Category, subject, and location match: University calculus textbook and notes reported lost and found on 2nd floor of College Library Bldg.',
            matchedAt: new Date()
        }];
        await itemLostBook.save();

        // Link Pair 12: Spalding Basketball (Sports Equipment)
        itemFoundBall.potentialMatches = [{
            item: itemLostBall._id,
            score: 95,
            reasoning: 'Exact item and brand match: Official composite leather Spalding TF-1000 indoor basketball left at the campus Gym.',
            matchedAt: new Date()
        }];
        await itemFoundBall.save();

        itemLostBall.potentialMatches = [{
            item: itemFoundBall._id,
            score: 95,
            reasoning: 'Exact item and brand match: Official composite leather Spalding TF-1000 indoor basketball left at the campus Gym.',
            matchedAt: new Date()
        }];
        await itemLostBall.save();

        // Link Pair 13: Yamaha Acoustic Guitar (Musical Instruments)
        itemFoundGuitar.potentialMatches = [{
            item: itemLostGuitar._id,
            score: 94,
            reasoning: 'Exact item and venue match: Yamaha acoustic guitar in black padded gig bag left at Primera Hall after choir rehearsal.',
            matchedAt: new Date()
        }];
        await itemFoundGuitar.save();

        itemLostGuitar.potentialMatches = [{
            item: itemFoundGuitar._id,
            score: 94,
            reasoning: 'Exact item and venue match: Yamaha acoustic guitar in black padded gig bag left at Primera Hall after choir rehearsal.',
            matchedAt: new Date()
        }];
        await itemLostGuitar.save();

        // Link Pair 14: Casio fx-991ES Calculator (Stationery)
        itemFoundCalc.potentialMatches = [{
            item: itemLostCalc._id,
            score: 95,
            reasoning: 'Exact model match: Black Casio fx-991ES Plus natural display scientific calculator left in CCGE Bldg lecture room 204.',
            matchedAt: new Date()
        }];
        await itemFoundCalc.save();

        itemLostCalc.potentialMatches = [{
            item: itemFoundCalc._id,
            score: 95,
            reasoning: 'Exact model match: Black Casio fx-991ES Plus natural display scientific calculator left in CCGE Bldg lecture room 204.',
            matchedAt: new Date()
        }];
        await itemLostCalc.save();

        // Link Pair 15: Laboratory Safety Goggles (Other)
        itemFoundGoggles.potentialMatches = [{
            item: itemLostGoggles._id,
            score: 91,
            reasoning: 'Category and location match: Clear laboratory impact safety goggles with elastic headband in New Science Laboratory.',
            matchedAt: new Date()
        }];
        await itemFoundGoggles.save();

        itemLostGoggles.potentialMatches = [{
            item: itemFoundGoggles._id,
            score: 91,
            reasoning: 'Category and location match: Clear laboratory impact safety goggles with elastic headband in New Science Laboratory.',
            matchedAt: new Date()
        }];
        await itemLostGoggles.save();

        console.log('15 bidirectional AI potential matches linked successfully.');

        // 7. Seed Realistic Claim Requests with Comprehensive Statuses
        console.log('Seeding claim requests...');
        const claim1 = new ClaimRequest({
            item: itemFoundID._id,
            claimant: sarah._id,
            description: 'This is my official NDMC Student Identification Card. My full name is Sarah J. Dela Cruz, student number 2023-45678, currently enrolled in 2nd Year BS Accountancy.',
            proofOfOwnership: 'I have my official Certificate of Matriculation (COM), enrollment receipt, and my national ID bearing the same full name.',
            identifyingFeatures: 'The lanyard is maroon with gold NDMC text. The plastic card holder has a small clip crack on the top corner.',
            contactPhone: '0920-123-4567',
            preferredContactMethod: 'phone',
            status: 'approved',
            priority: 'high',
            reviewedBy: adminUser._id,
            reviewedAt: new Date(),
            timeline: [
                { action: 'Claim submitted by student', performedBy: sarah._id, note: 'Submitted with enrollment proof' },
                { action: 'Claim verified by Security', performedBy: adminUser._id, note: 'Identity and registration confirmed' },
                { action: 'Status changed to approved', performedBy: adminUser._id, note: 'Ready for claimant pickup at Bldg 41' }
            ]
        });
        await claim1.save();

        const claim2 = new ClaimRequest({
            item: itemFoundWallet._id,
            claimant: miguel._id,
            description: 'I am claiming my dark brown leather bifold wallet lost at the College Canteen dining pavilion during lunch break.',
            proofOfOwnership: 'Inside the wallet is my driver\'s license (Miguel Tan) and an old family photo in the inner transparent slot.',
            identifyingFeatures: 'Small scratch on the front leather fold, contrast white stitching around the perimeter.',
            contactPhone: '0923-456-7890',
            preferredContactMethod: 'both',
            status: 'pending',
            priority: 'normal',
            timeline: [
                { action: 'Claim submitted by student', performedBy: miguel._id, note: 'Awaiting admin review' }
            ]
        });
        await claim2.save();

        const claim3 = new ClaimRequest({
            item: itemFoundAirPods._id,
            claimant: chloe._id,
            description: 'This is my Apple AirPods Pro 2nd Gen case that I left on the wooden table in Student Lounge 2.',
            proofOfOwnership: 'Can pair immediately with my iPhone (Chloe\'s AirPods Pro). Model number A2698 on the lid.',
            identifyingFeatures: 'Small pinhole mark near the hinge, Apple engraving.',
            contactPhone: '0924-567-8901',
            preferredContactMethod: 'email',
            status: 'under_review',
            priority: 'high',
            reviewedBy: securityUser._id,
            timeline: [
                { action: 'Claim submitted by student', performedBy: chloe._id, note: 'Pairing test proposed' },
                { action: 'Status changed to under_review', performedBy: securityUser._id, note: 'Security verifying serial number' }
            ]
        });
        await claim3.save();

        const claim4 = new ClaimRequest({
            item: itemFoundLaptop._id,
            claimant: mark._id,
            description: 'Claiming my silver Asus Vivobook laptop left at the library table.',
            proofOfOwnership: 'Serial number J7N0CX041289 matches official receipt box. Login account is mark.villanueva with local password.',
            identifyingFeatures: 'Small round sticker of NDMC CITE programming club on the right side of the palm rest.',
            contactPhone: '0921-234-5678',
            preferredContactMethod: 'phone',
            status: 'approved',
            priority: 'high',
            reviewedBy: adminUser._id,
            reviewedAt: new Date(),
            timeline: [
                { action: 'Claim submitted by student', performedBy: mark._id, note: 'Provided box serial number' },
                { action: 'Hardware verification passed', performedBy: adminUser._id, note: 'Serial matches device BIOS' },
                { action: 'Approved for release', performedBy: adminUser._id, note: 'Claimant signed release logbook' }
            ]
        });
        await claim4.save();

        const claim5 = new ClaimRequest({
            item: itemFoundPhone._id,
            claimant: miguel._id,
            description: 'I thought this blue iPhone was mine.',
            proofOfOwnership: 'Lost a blue smartphone around the same area.',
            identifyingFeatures: 'Blue phone in case.',
            contactPhone: '0923-456-7890',
            preferredContactMethod: 'phone',
            status: 'rejected',
            priority: 'normal',
            rejectionReason: 'Serial number and device model mismatch (claimant has iPhone 11; found device is iPhone 13).',
            reviewedBy: securityUser._id,
            reviewedAt: new Date(),
            timeline: [
                { action: 'Claim submitted', performedBy: miguel._id, note: 'Initial submission' },
                { action: 'Claim rejected by Security', performedBy: securityUser._id, note: 'Device IMEI mismatch' }
            ]
        });
        await claim5.save();

        console.log('5 claim requests seeded successfully across approved, pending, under_review, and rejected states.');

        // Category count summary
        console.log('\n======================================================');
        console.log(' Notre Dame of Midsayap College (NDMC)');
        console.log(' CAMPUS LOST & FOUND DATABASE SEEDING COMPLETED');
        console.log('======================================================');
        console.log(` Categories:      ${categories.length}`);
        console.log(` Campus Locations:${locations.length}`);
        console.log(` Users:           ${createdUsers.length}`);
        console.log(` Items:           ${totalItemCount} total items`);
        console.log(` AI Images:       42 distinct mockup images in /uploads`);
        console.log(` AI Matched Pairs:15 bidirectional pairs with reasoning & scores`);
        console.log(` Claims:          5 claim requests (Approved, Pending, Under Review, Rejected)`);
        console.log('======================================================');
        console.log('\nCategory Breakdown:');
        for (const cat of categories) {
            const count = await Item.countDocuments({ category: cat._id });
            console.log(`  - ${cat.name.padEnd(25)}: ${count} items`);
        }
        console.log('\nStatus Breakdown:');
        console.log(`  - Approved: ${await Item.countDocuments({ status: 'approved' })}`);
        console.log(`  - Claimed:  ${await Item.countDocuments({ status: 'claimed' })}`);
        console.log(`  - Pending:  ${await Item.countDocuments({ status: 'pending' })}`);
        console.log(`  - Rejected: ${await Item.countDocuments({ status: 'rejected' })}`);
        console.log('======================================================\n');

        return { success: true, count: totalItemCount };
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        if (shouldDisconnect) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
            process.exit(0);
        }
    }
}

// Run seeder if executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
