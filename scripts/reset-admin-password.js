/**
 * Reset Admin Password Script
 * 
 * Usage: node scripts/reset-admin-password.js
 * 
 * This script resets the admin account password in the database.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const NEW_PASSWORD = 'Siladan2026';

async function resetAdminPassword() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find admin user
        const admin = await User.findOne({ role: 'admin' });

        if (!admin) {
            console.log('No admin user found! Creating one...');
            const newAdmin = new User({
                username: 'admin',
                email: 'admin@campus.edu',
                password: NEW_PASSWORD,
                role: 'admin',
                isActive: true,
                isEmailVerified: true
            });
            await newAdmin.save();
            console.log('Admin user created with new password.');
        } else {
            console.log(`Found admin user: ${admin.username} (${admin.email})`);

            // Update password (pre-save hook will hash it automatically)
            admin.password = NEW_PASSWORD;
            await admin.save();

            console.log('Admin password updated successfully!');
        }

        console.log('\n========================================');
        console.log('  Admin Login Credentials');
        console.log('========================================');
        console.log(`  Username: admin`);
        console.log(`  Password: ${NEW_PASSWORD}`);
        console.log('========================================\n');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
}

resetAdminPassword();
