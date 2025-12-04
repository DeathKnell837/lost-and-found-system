/**
 * Predefined Campus Locations
 * Organized by building/area for easy selection
 */

const CAMPUS_LOCATIONS = [
    // Academic Buildings
    { id: 'main-building', name: 'Main Building', category: 'Academic', icon: 'fa-university' },
    { id: 'science-building', name: 'Science Building', category: 'Academic', icon: 'fa-flask' },
    { id: 'engineering-building', name: 'Engineering Building', category: 'Academic', icon: 'fa-cogs' },
    { id: 'arts-building', name: 'Arts & Humanities Building', category: 'Academic', icon: 'fa-paint-brush' },
    { id: 'business-building', name: 'Business School', category: 'Academic', icon: 'fa-briefcase' },
    { id: 'it-building', name: 'IT / Computer Science Building', category: 'Academic', icon: 'fa-laptop-code' },
    { id: 'law-building', name: 'Law School', category: 'Academic', icon: 'fa-balance-scale' },
    { id: 'medical-building', name: 'Medical / Health Sciences', category: 'Academic', icon: 'fa-heartbeat' },
    
    // Libraries & Study Areas
    { id: 'main-library', name: 'Main Library', category: 'Library', icon: 'fa-book' },
    { id: 'library-floor-1', name: 'Library - 1st Floor', category: 'Library', icon: 'fa-book' },
    { id: 'library-floor-2', name: 'Library - 2nd Floor', category: 'Library', icon: 'fa-book' },
    { id: 'library-floor-3', name: 'Library - 3rd Floor', category: 'Library', icon: 'fa-book' },
    { id: 'study-hall', name: 'Study Hall', category: 'Library', icon: 'fa-book-reader' },
    { id: 'reading-room', name: 'Reading Room', category: 'Library', icon: 'fa-glasses' },
    
    // Dining & Food
    { id: 'main-cafeteria', name: 'Main Cafeteria', category: 'Dining', icon: 'fa-utensils' },
    { id: 'food-court', name: 'Food Court', category: 'Dining', icon: 'fa-hamburger' },
    { id: 'coffee-shop', name: 'Coffee Shop / Café', category: 'Dining', icon: 'fa-coffee' },
    { id: 'snack-bar', name: 'Snack Bar', category: 'Dining', icon: 'fa-cookie' },
    { id: 'student-canteen', name: 'Student Canteen', category: 'Dining', icon: 'fa-utensils' },
    
    // Sports & Recreation
    { id: 'gymnasium', name: 'Gymnasium / Gym', category: 'Sports', icon: 'fa-dumbbell' },
    { id: 'sports-complex', name: 'Sports Complex', category: 'Sports', icon: 'fa-running' },
    { id: 'swimming-pool', name: 'Swimming Pool', category: 'Sports', icon: 'fa-swimmer' },
    { id: 'football-field', name: 'Football Field', category: 'Sports', icon: 'fa-futbol' },
    { id: 'basketball-court', name: 'Basketball Court', category: 'Sports', icon: 'fa-basketball-ball' },
    { id: 'tennis-court', name: 'Tennis Court', category: 'Sports', icon: 'fa-table-tennis' },
    { id: 'track-field', name: 'Track & Field', category: 'Sports', icon: 'fa-medal' },
    
    // Student Services
    { id: 'student-center', name: 'Student Center', category: 'Services', icon: 'fa-users' },
    { id: 'admin-office', name: 'Administration Office', category: 'Services', icon: 'fa-building' },
    { id: 'registrar', name: 'Registrar\'s Office', category: 'Services', icon: 'fa-file-alt' },
    { id: 'financial-aid', name: 'Financial Aid Office', category: 'Services', icon: 'fa-hand-holding-usd' },
    { id: 'health-center', name: 'Health Center / Clinic', category: 'Services', icon: 'fa-clinic-medical' },
    { id: 'counseling', name: 'Counseling Center', category: 'Services', icon: 'fa-user-md' },
    { id: 'career-center', name: 'Career Services', category: 'Services', icon: 'fa-user-tie' },
    
    // Residence & Housing
    { id: 'dorm-a', name: 'Dormitory A', category: 'Housing', icon: 'fa-home' },
    { id: 'dorm-b', name: 'Dormitory B', category: 'Housing', icon: 'fa-home' },
    { id: 'dorm-c', name: 'Dormitory C', category: 'Housing', icon: 'fa-home' },
    { id: 'student-housing', name: 'Student Housing Complex', category: 'Housing', icon: 'fa-building' },
    { id: 'housing-office', name: 'Housing Office', category: 'Housing', icon: 'fa-key' },
    
    // Transportation & Parking
    { id: 'main-entrance', name: 'Main Entrance / Gate', category: 'Transportation', icon: 'fa-door-open' },
    { id: 'parking-lot-a', name: 'Parking Lot A', category: 'Transportation', icon: 'fa-parking' },
    { id: 'parking-lot-b', name: 'Parking Lot B', category: 'Transportation', icon: 'fa-parking' },
    { id: 'bus-stop', name: 'Bus Stop / Transit Hub', category: 'Transportation', icon: 'fa-bus' },
    { id: 'bike-rack', name: 'Bicycle Rack / Station', category: 'Transportation', icon: 'fa-bicycle' },
    
    // Outdoor Areas
    { id: 'quad', name: 'Main Quad / Plaza', category: 'Outdoor', icon: 'fa-tree' },
    { id: 'garden', name: 'Campus Garden', category: 'Outdoor', icon: 'fa-leaf' },
    { id: 'amphitheater', name: 'Amphitheater', category: 'Outdoor', icon: 'fa-theater-masks' },
    { id: 'walkway', name: 'Covered Walkway', category: 'Outdoor', icon: 'fa-road' },
    { id: 'benches', name: 'Outdoor Benches / Seating', category: 'Outdoor', icon: 'fa-chair' },
    
    // Lecture Halls & Labs
    { id: 'lecture-hall-1', name: 'Lecture Hall 1', category: 'Classrooms', icon: 'fa-chalkboard-teacher' },
    { id: 'lecture-hall-2', name: 'Lecture Hall 2', category: 'Classrooms', icon: 'fa-chalkboard-teacher' },
    { id: 'computer-lab', name: 'Computer Lab', category: 'Classrooms', icon: 'fa-desktop' },
    { id: 'science-lab', name: 'Science Laboratory', category: 'Classrooms', icon: 'fa-microscope' },
    { id: 'art-studio', name: 'Art Studio', category: 'Classrooms', icon: 'fa-palette' },
    { id: 'music-room', name: 'Music Room', category: 'Classrooms', icon: 'fa-music' },
    
    // Events & Facilities
    { id: 'auditorium', name: 'Auditorium', category: 'Events', icon: 'fa-building' },
    { id: 'convention-center', name: 'Convention / Event Center', category: 'Events', icon: 'fa-calendar-alt' },
    { id: 'chapel', name: 'Chapel / Prayer Room', category: 'Events', icon: 'fa-pray' },
    { id: 'museum', name: 'Campus Museum', category: 'Events', icon: 'fa-landmark' },
    
    // Common Areas
    { id: 'restroom', name: 'Restroom / Bathroom', category: 'Common', icon: 'fa-restroom' },
    { id: 'elevator', name: 'Elevator / Lift', category: 'Common', icon: 'fa-elevator' },
    { id: 'stairwell', name: 'Stairwell', category: 'Common', icon: 'fa-sort' },
    { id: 'lobby', name: 'Building Lobby', category: 'Common', icon: 'fa-door-open' },
    { id: 'hallway', name: 'Hallway / Corridor', category: 'Common', icon: 'fa-arrows-alt-h' },
    
    // Other
    { id: 'other', name: 'Other Location', category: 'Other', icon: 'fa-map-marker-alt' }
];

// Group locations by category
const getLocationsByCategory = () => {
    const grouped = {};
    CAMPUS_LOCATIONS.forEach(loc => {
        if (!grouped[loc.category]) {
            grouped[loc.category] = [];
        }
        grouped[loc.category].push(loc);
    });
    return grouped;
};

// Get location by ID
const getLocationById = (id) => {
    return CAMPUS_LOCATIONS.find(loc => loc.id === id);
};

// Get location name by ID
const getLocationName = (id) => {
    const loc = getLocationById(id);
    return loc ? loc.name : id;
};

// Search locations
const searchLocations = (query) => {
    const q = query.toLowerCase();
    return CAMPUS_LOCATIONS.filter(loc => 
        loc.name.toLowerCase().includes(q) || 
        loc.category.toLowerCase().includes(q)
    );
};

module.exports = {
    CAMPUS_LOCATIONS,
    getLocationsByCategory,
    getLocationById,
    getLocationName,
    searchLocations
};
