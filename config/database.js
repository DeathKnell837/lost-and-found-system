const mongoose = require('mongoose');

// Connection options for reliability
const connectionOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000
};

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB error:', err.message);
        });

    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        // Don't exit - let the app try to reconnect
    }
};

module.exports = connectDB;
