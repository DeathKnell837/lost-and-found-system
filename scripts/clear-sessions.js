/**
 * Clear corrupted sessions from MongoDB
 * 
 * Usage: node scripts/clear-sessions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function clearSessions() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get the sessions collection
        const db = mongoose.connection.db;
        const sessionsCollection = db.collection('sessions');

        // Count existing sessions
        const count = await sessionsCollection.countDocuments();
        console.log(`Found ${count} sessions in database`);

        // Delete all sessions (forces everyone to re-login)
        const result = await sessionsCollection.deleteMany({});
        console.log(`Deleted ${result.deletedCount} sessions`);

        console.log('\n========================================');
        console.log('  Sessions cleared successfully!');
        console.log('  All users will need to log in again.');
        console.log('========================================\n');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
}

clearSessions();
