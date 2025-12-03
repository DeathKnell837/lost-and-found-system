const { Item, Category } = require('../models');

// Home page
exports.getHomePage = async (req, res) => {
    try {
        // Get recent approved items
        const recentLost = await Item.find({ type: 'lost', status: 'approved' })
            .populate('category')
            .sort({ dateReported: -1 })
            .limit(6);

        const recentFound = await Item.find({ type: 'found', status: 'approved' })
            .populate('category')
            .sort({ dateReported: -1 })
            .limit(6);

        // Get statistics
        const stats = {
            totalLost: await Item.countDocuments({ type: 'lost', status: 'approved' }),
            totalFound: await Item.countDocuments({ type: 'found', status: 'approved' }),
            totalClaimed: await Item.countDocuments({ status: 'claimed' })
        };

        res.render('home', {
            title: 'Lost & Found Management System',
            recentLost,
            recentFound,
            stats
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        req.flash('error', 'Error loading page');
        res.render('home', {
            title: 'Lost & Found Management System',
            recentLost: [],
            recentFound: [],
            stats: { totalLost: 0, totalFound: 0, totalClaimed: 0 }
        });
    }
};

// About page
exports.getAboutPage = (req, res) => {
    res.render('about', {
        title: 'About Us - Lost & Found'
    });
};

// Contact page
exports.getContactPage = (req, res) => {
    res.render('contact', {
        title: 'Contact Us - Lost & Found'
    });
};
