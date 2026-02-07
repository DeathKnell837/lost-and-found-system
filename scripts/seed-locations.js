// Script to seed initial campus locations
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Location = require('../models/Location');

console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden)' : 'NOT SET');

const locations = [
    // 1-9: Main Campus Buildings & Facilities
    { name: 'Madonna Building', description: 'Building 1' },
    { name: 'Facade (Main Entrance)', description: 'Building 1a - Main gate entrance' },
    { name: 'Madonna Grotto', description: 'Building 2' },
    { name: 'Old Library Bldg.', description: 'Building 3' },
    { name: 'College Library Bldg.', description: 'Building 4' },
    { name: 'McGrath Bldg.', description: 'Building 5' },
    { name: 'Student Lounge 1', description: 'Building 6' },
    { name: 'Student Lounge 3', description: 'Building 7' },
    { name: 'De Mazenod Bldg.', description: 'Building 8' },
    { name: 'Garage', description: 'Building 9' },

    // 10-16: Student & Campus Facilities
    { name: 'College Canteen', description: 'Building 10 - Main dining area' },
    { name: 'Student Lounge 2', description: 'Building 11' },
    { name: 'Rotonda', description: 'Building 12' },
    { name: 'Student Lounge', description: 'Building 13' },
    { name: 'Gym', description: 'Building 14 - Campus gymnasium' },
    { name: 'Carpentry Shop', description: 'Building 15' },
    { name: 'Clinic', description: 'Building 16 - Campus clinic' },

    // 17-26: Academic & Administrative
    { name: 'Primera Hall', description: 'Building 17' },
    { name: 'Chapel', description: 'Building 18' },
    { name: 'Guest House', description: 'Building 19' },
    { name: 'CCGE Bldg.', description: 'Building 20' },
    { name: 'Taekwondo Gym', description: 'Building 21' },
    { name: 'Power House', description: 'Building 22' },
    { name: 'Water Pump', description: 'Building 23' },
    { name: 'Fr. Sullivan Bldg.', description: 'Building 24' },
    { name: 'NDMC Chapel', description: 'Building 25' },
    { name: 'Joseph Bldg.', description: 'Building 26' },

    // 27-31: Housing & Utilities
    { name: 'Reco House', description: 'Building 27' },
    { name: 'NDMC Farm', description: 'Building 28' },
    { name: 'Ladies Dormitory', description: 'Building 29' },
    { name: 'Refilling Station', description: 'Building 29a' },
    { name: 'MEMED Office', description: 'Building 29b' },
    { name: 'GSD Office', description: 'Building 29c' },
    { name: 'Material Recovery Facility 2', description: 'Building 29d' },
    { name: 'New Science Laboratory', description: 'Building 30' },
    { name: 'Water Pump (HS)', description: 'Building 31' },

    // 32-37: High School Area
    { name: 'HS Gordon Bldg.', description: 'Building 32' },
    { name: 'IBED Computer Laboratory', description: 'Building 33' },
    { name: 'HS Chemistry Laboratory (Old)', description: 'Building 34' },
    { name: 'HS Student Lounge', description: 'Building 35' },
    { name: 'Bishop Mongeau Bldg.', description: 'Building 36' },
    { name: 'Clinic (HS)', description: 'Building 37 - High School clinic' },

    // 38-42: ETD & Security Area
    { name: 'ETD Bldg.', description: 'Building 38' },
    { name: 'ETD Asst. Principal\'s Office', description: 'Building 38a' },
    { name: 'ETD Covered Court', description: 'Building 39' },
    { name: 'Halad Stage', description: 'Building 40' },
    { name: 'Chief Security Office', description: 'Building 41' },
    { name: 'Coop Building', description: 'Building 41a' },
    { name: 'Guard House Gate 02', description: 'Building 41b' },
    { name: 'Nursery Play Ground', description: 'Building 42' },
    { name: 'ETD Stage', description: 'Building 39a' },
];

async function seedLocations() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Delete all old locations and re-seed with campus map locations
        const deleted = await Location.deleteMany({});
        console.log(`Deleted ${deleted.deletedCount} old locations.`);

        // Insert new campus map locations
        await Location.insertMany(locations);
        console.log(`Added ${locations.length} campus locations successfully!`);
        
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
