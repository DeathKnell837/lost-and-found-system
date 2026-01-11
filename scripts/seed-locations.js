// Script to seed initial campus locations
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Location = require('../models/Location');

console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden)' : 'NOT SET');

const locations = [
    // Academic Buildings
    { name: 'Library', description: 'Main campus library' },
    { name: 'Science Building', description: 'Science laboratories and classrooms' },
    { name: 'Engineering Building', description: 'Engineering department' },
    { name: 'Arts Building', description: 'Arts and humanities classrooms' },
    { name: 'Business Building', description: 'Business department' },
    { name: 'Computer Lab', description: 'Main computer laboratory' },
    { name: 'Lecture Hall A', description: 'Large lecture hall' },
    { name: 'Lecture Hall B', description: 'Large lecture hall' },
    { name: 'Classroom Building 1', description: 'General classrooms' },
    { name: 'Classroom Building 2', description: 'General classrooms' },
    
    // Student Facilities
    { name: 'Cafeteria', description: 'Main dining area' },
    { name: 'Student Center', description: 'Student activities center' },
    { name: 'Gymnasium', description: 'Sports and fitness facility' },
    { name: 'Sports Field', description: 'Outdoor sports area' },
    { name: 'Swimming Pool', description: 'Campus swimming pool' },
    { name: 'Auditorium', description: 'Main auditorium' },
    
    // Administrative
    { name: 'Administration Building', description: 'Main admin offices' },
    { name: 'Registrar Office', description: 'Student registration' },
    { name: 'Finance Office', description: 'Payments and finance' },
    { name: 'Security Office', description: 'Campus security' },
    
    // Common Areas
    { name: 'Main Gate', description: 'Campus main entrance' },
    { name: 'Parking Lot A', description: 'Main parking area' },
    { name: 'Parking Lot B', description: 'Secondary parking' },
    { name: 'Bus Stop', description: 'Campus bus stop' },
    { name: 'Garden Area', description: 'Campus garden' },
    { name: 'Hallway/Corridor', description: 'Building corridors' },
    { name: 'Restroom', description: 'Campus restrooms' },
    { name: 'Canteen', description: 'Snack and drinks area' },
    
    // Dormitory
    { name: 'Dormitory Building 1', description: 'Student housing' },
    { name: 'Dormitory Building 2', description: 'Student housing' },
];

async function seedLocations() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Check existing locations
        const existingCount = await Location.countDocuments();
        console.log(`Existing locations: ${existingCount}`);
        
        if (existingCount > 0) {
            console.log('Locations already exist. Skipping seed.');
            console.log('If you want to reset, delete all locations first from admin panel.');
        } else {
            // Insert locations
            await Location.insertMany(locations);
            console.log(`Added ${locations.length} locations successfully!`);
        }
        
        // Show all locations
        const allLocations = await Location.find().sort({ name: 1 });
        console.log('\nCurrent locations:');
        allLocations.forEach(loc => console.log(`  - ${loc.name}`));
        
        await mongoose.disconnect();
        console.log('\nDone!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedLocations();
