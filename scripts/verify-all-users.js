/**
 * Script to verify all existing users
 * Run with: node scripts/verify-all-users.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function verifyAllUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.db.collection('users').updateMany(
            {}, 
            { $set: { isEmailVerified: true } }
        );

        console.log(`Updated ${result.modifiedCount} users to verified status`);
        
        await mongoose.disconnect();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifyAllUsers();
