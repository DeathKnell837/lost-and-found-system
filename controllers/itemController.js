const { Item, Category } = require('../models');
const { cloudinary } = require('../config/cloudinary');
const { CAMPUS_LOCATIONS, getLocationsByCategory, getLocationName } = require('../config/locations');
const matchingService = require('../services/matchingService');

// Get lost items listing page
exports.getLostItems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        // Build query
        let query = { type: 'lost', status: 'approved' };

        // Category filter
        if (req.query.category && req.query.category !== '') {
            query.category = req.query.category;
        }

        // Date filter
        if (req.query.dateFrom || req.query.dateTo) {
            query.dateLostFound = {};
            if (req.query.dateFrom) {
                query.dateLostFound.$gte = new Date(req.query.dateFrom);
            }
            if (req.query.dateTo) {
                query.dateLostFound.$lte = new Date(req.query.dateTo);
            }
        }

        const items = await Item.find(query)
            .populate('category')
            .sort({ dateReported: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Item.countDocuments(query);
        const categories = await Category.find({ isActive: true });

        res.render('items/lost', {
            title: 'Lost Items - Lost & Found',
            items,
            categories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            query: req.query
        });
    } catch (error) {
        console.error('Error loading lost items:', error);
        req.flash('error', 'Error loading items');
        res.redirect('/');
    }
};

// Get found items listing page
exports.getFoundItems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        // Build query
        let query = { type: 'found', status: 'approved' };

        // Category filter
        if (req.query.category && req.query.category !== '') {
            query.category = req.query.category;
        }

        // Date filter
        if (req.query.dateFrom || req.query.dateTo) {
            query.dateLostFound = {};
            if (req.query.dateFrom) {
                query.dateLostFound.$gte = new Date(req.query.dateFrom);
            }
            if (req.query.dateTo) {
                query.dateLostFound.$lte = new Date(req.query.dateTo);
            }
        }

        const items = await Item.find(query)
            .populate('category')
            .sort({ dateReported: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Item.countDocuments(query);
        const categories = await Category.find({ isActive: true });

        res.render('items/found', {
            title: 'Found Items - Lost & Found',
            items,
            categories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            query: req.query
        });
    } catch (error) {
        console.error('Error loading found items:', error);
        req.flash('error', 'Error loading items');
        res.redirect('/');
    }
};

// Get claimed items listing page
exports.getClaimedItems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        let query = { status: 'claimed' };

        // Type filter
        if (req.query.type && req.query.type !== '') {
            query.type = req.query.type;
        }

        const items = await Item.find(query)
            .populate('category')
            .sort({ 'claimedBy.date': -1 })
            .skip(skip)
            .limit(limit);

        const total = await Item.countDocuments(query);

        res.render('items/claimed', {
            title: 'Claimed Items - Lost & Found',
            items,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            query: req.query
        });
    } catch (error) {
        console.error('Error loading claimed items:', error);
        req.flash('error', 'Error loading items');
        res.redirect('/');
    }
};

// Get single item details
exports.getItemDetails = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('category')
            .populate('reportedBy', 'username email');

        if (!item) {
            req.flash('error', 'Item not found');
            return res.redirect('/');
        }

        // Only show approved or claimed items to public, or if user is admin
        const isAdmin = req.session.user && req.session.user.role === 'admin';
        if (!isAdmin && item.status !== 'approved' && item.status !== 'claimed') {
            req.flash('error', 'Item not available');
            return res.redirect('/');
        }

        // Get related items
        const relatedItems = await Item.find({
            category: item.category._id,
            _id: { $ne: item._id },
            status: 'approved'
        })
        .limit(4)
        .populate('category');

        res.render('items/details', {
            title: item.itemName + ' - Lost & Found',
            item,
            relatedItems
        });
    } catch (error) {
        console.error('Error loading item details:', error);
        req.flash('error', 'Error loading item');
        res.redirect('/');
    }
};

// Show report lost item form
exports.getReportLostForm = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        const locationsByCategory = getLocationsByCategory();
        res.render('items/report-lost', {
            title: 'Report Lost Item - Lost & Found',
            categories,
            locationsByCategory,
            campusLocations: CAMPUS_LOCATIONS
        });
    } catch (error) {
        console.error('Error loading form:', error);
        req.flash('error', 'Error loading form');
        res.redirect('/');
    }
};

// Show report found item form
exports.getReportFoundForm = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        const locationsByCategory = getLocationsByCategory();
        res.render('items/report-found', {
            title: 'Report Found Item - Lost & Found',
            categories,
            locationsByCategory,
            campusLocations: CAMPUS_LOCATIONS
        });
    } catch (error) {
        console.error('Error loading form:', error);
        req.flash('error', 'Error loading form');
        res.redirect('/');
    }
};

// Handle report lost item submission
exports.reportLostItem = async (req, res) => {
    try {
        const {
            itemName,
            category,
            description,
            locationId,
            customLocation,
            contactInfo,
            reporterName,
            reporterEmail,
            dateLostFound
        } = req.body;

        // Determine location name
        let location = customLocation;
        if (locationId && locationId !== 'other') {
            location = getLocationName(locationId);
        }

        const item = new Item({
            itemName,
            category,
            description,
            location,
            locationId: locationId !== 'other' ? locationId : null,
            customLocation: locationId === 'other' ? customLocation : null,
            contactInfo,
            reporterName,
            reporterEmail,
            dateLostFound: new Date(dateLostFound),
            type: 'lost',
            status: 'pending',
            reportedBy: req.session.user ? req.session.user.id : null,
            imagePath: req.file ? req.file.path : null
        });

        await item.save();

        req.flash('success', 'Your lost item report has been submitted and is pending approval.');
        res.redirect('/items/lost');
    } catch (error) {
        console.error('Error reporting lost item:', error);
        // Clean up uploaded file from Cloudinary if exists
        if (req.file && req.file.filename) {
            cloudinary.uploader.destroy(req.file.filename).catch(() => {});
        }
        req.flash('error', 'Error submitting report. Please try again.');
        res.redirect('/report/lost');
    }
};

// Handle report found item submission
exports.reportFoundItem = async (req, res) => {
    try {
        const {
            itemName,
            category,
            description,
            locationId,
            customLocation,
            contactInfo,
            reporterName,
            reporterEmail,
            dateLostFound
        } = req.body;

        // Determine location name
        let location = customLocation;
        if (locationId && locationId !== 'other') {
            location = getLocationName(locationId);
        }

        const item = new Item({
            itemName,
            category,
            description,
            location,
            locationId: locationId !== 'other' ? locationId : null,
            customLocation: locationId === 'other' ? customLocation : null,
            contactInfo,
            reporterName,
            reporterEmail,
            dateLostFound: new Date(dateLostFound),
            type: 'found',
            status: 'pending',
            reportedBy: req.session.user ? req.session.user.id : null,
            imagePath: req.file ? req.file.path : null
        });

        await item.save();

        req.flash('success', 'Your found item report has been submitted and is pending approval.');
        res.redirect('/items/found');
    } catch (error) {
        console.error('Error reporting found item:', error);
        // Clean up uploaded file from Cloudinary if exists
        if (req.file && req.file.filename) {
            cloudinary.uploader.destroy(req.file.filename).catch(() => {});
        }
        req.flash('error', 'Error submitting report. Please try again.');
        res.redirect('/report/found');
    }
};

// Search items
exports.searchItems = async (req, res) => {
    try {
        const { q, type, category, dateFrom, dateTo } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        // Build query
        let query = { status: 'approved' };

        // Text search
        if (q && q.trim() !== '') {
            query.$or = [
                { itemName: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { location: { $regex: q, $options: 'i' } }
            ];
        }

        // Type filter
        if (type && type !== '') {
            query.type = type;
        }

        // Category filter
        if (category && category !== '') {
            query.category = category;
        }

        // Date filter
        if (dateFrom || dateTo) {
            query.dateLostFound = {};
            if (dateFrom) {
                query.dateLostFound.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                query.dateLostFound.$lte = new Date(dateTo);
            }
        }

        const items = await Item.find(query)
            .populate('category')
            .sort({ dateReported: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Item.countDocuments(query);
        const categories = await Category.find({ isActive: true });

        res.render('items/search', {
            title: 'Search Results - Lost & Found',
            items,
            categories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            query: req.query,
            searchTerm: q
        });
    } catch (error) {
        console.error('Error searching items:', error);
        req.flash('error', 'Error searching items');
        res.redirect('/');
    }
};

// Get potential matches for an item
exports.getItemMatches = async (req, res) => {
    try {
        const itemId = req.params.id;
        const matches = await matchingService.getItemMatches(itemId);
        
        res.json({ 
            success: true, 
            matches: matches.slice(0, 10).map(m => ({
                item: {
                    _id: m.item._id,
                    itemName: m.item.itemName,
                    description: m.item.description?.substring(0, 100) + '...',
                    location: m.item.location,
                    type: m.item.type,
                    imagePath: m.item.imagePath,
                    category: m.item.category?.name
                },
                score: m.score
            }))
        });
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ success: false, message: 'Failed to get matches' });
    }
};
