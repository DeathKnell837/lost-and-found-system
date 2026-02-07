/**
 * ============================================================================
 * DATABASE CONFIGURATION (database.js)
 * ============================================================================
 * 
 * PURPOSE:
 * This file handles the connection to MongoDB Atlas cloud database.
 * It exports a function that establishes and manages the database connection.
 * 
 * WHAT IS MONGODB?
 * MongoDB is a NoSQL database that stores data in JSON-like documents.
 * Unlike SQL databases with tables and rows, MongoDB uses:
 * - Collections (like tables)
 * - Documents (like rows, but more flexible)
 * 
 * WHAT IS MONGODB ATLAS?
 * MongoDB Atlas is the cloud-hosted version of MongoDB.
 * Benefits:
 * - No need to manage our own database server
 * - Automatic backups
 * - High availability
 * - Accessible from anywhere
 * 
 * WHAT IS MONGOOSE?
 * Mongoose is an ODM (Object Document Mapper) for MongoDB.
 * It provides:
 * - Schema definitions (structure for documents)
 * - Validation
 * - Query building
 * - Middleware/hooks
 * 
 * CONNECTION STRING:
 * The connection URI is stored in environment variables for security.
 * Format: mongodb+srv://username:password@cluster.mongodb.net/database
 * 
 * ============================================================================
 */

// Import Mongoose library
const mongoose = require('mongoose');

/**
 * CONNECTION OPTIONS
 * 
 * These settings control how Mongoose connects to MongoDB
 * and handles connection issues.
 */
const connectionOptions = {
    // Maximum number of connections in the pool
    // Allows multiple simultaneous queries
    maxPoolSize: 10,
    
    // How long to wait when selecting a server (10 seconds)
    // If server isn't found in 10s, throw error
    serverSelectionTimeoutMS: 10000,
    
    // How long to wait for socket operations (45 seconds)
    // Prevents hanging on slow queries
    socketTimeoutMS: 45000
};

/**
 * CONNECT TO DATABASE
 * 
 * This async function establishes the connection to MongoDB.
 * It's called once when the server starts (in server.js).
 * 
 * What it does:
 * 1. Attempts to connect using URI from environment variables
 * 2. Logs success message with host info
 * 3. Sets up event listeners for connection issues
 * 
 * @returns {Promise} Resolves when connected, handles errors internally
 */
const connectDB = async () => {
    try {
        // Connect to MongoDB using connection URI from .env file
        // process.env.MONGODB_URI contains the full connection string
        const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
        
        // Log successful connection
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // EVENT LISTENER: Handle disconnection
        // This fires if connection is lost after initial connect
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });

        // EVENT LISTENER: Handle errors
        // This fires on connection errors
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB error:', err.message);
        });

    } catch (error) {
        // Log connection error but don't crash the app
        // Mongoose will automatically try to reconnect
        console.error(`MongoDB connection error: ${error.message}`);
        // Note: We don't call process.exit() here to allow reconnection attempts
    }
};

// Export the connect function for use in server.js
module.exports = connectDB;
