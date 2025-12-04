const QRCode = require('qrcode');
const { Item } = require('../models');

/**
 * Generate QR code for an item
 */
exports.generateQRCode = async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId);
        
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const itemUrl = `${req.protocol}://${req.get('host')}/items/${item._id}`;
        
        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(itemUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        res.json({ 
            success: true, 
            qrCode: qrCodeDataUrl,
            itemUrl 
        });
    } catch (error) {
        console.error('Generate QR error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate QR code' });
    }
};

/**
 * Get printable poster for an item
 */
exports.getPoster = async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId)
            .populate('category');
        
        if (!item) {
            req.flash('error', 'Item not found');
            return res.redirect('/items');
        }

        const itemUrl = `${req.protocol}://${req.get('host')}/items/${item._id}`;
        
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(itemUrl, {
            width: 200,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        res.render('items/poster', {
            title: `Poster - ${item.title}`,
            item,
            qrCode: qrCodeDataUrl,
            itemUrl,
            layout: false // No navbar/footer for printing
        });
    } catch (error) {
        console.error('Get poster error:', error);
        req.flash('error', 'Failed to generate poster');
        res.redirect('/items');
    }
};

/**
 * Get mini poster/flyer (smaller version)
 */
exports.getMiniPoster = async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId)
            .populate('category');
        
        if (!item) {
            req.flash('error', 'Item not found');
            return res.redirect('/items');
        }

        const itemUrl = `${req.protocol}://${req.get('host')}/items/${item._id}`;
        
        // Generate smaller QR code
        const qrCodeDataUrl = await QRCode.toDataURL(itemUrl, {
            width: 120,
            margin: 1
        });

        res.render('items/mini-poster', {
            title: `Flyer - ${item.title}`,
            item,
            qrCode: qrCodeDataUrl,
            itemUrl,
            layout: false
        });
    } catch (error) {
        console.error('Get mini poster error:', error);
        req.flash('error', 'Failed to generate poster');
        res.redirect('/items');
    }
};

/**
 * Generate multiple mini posters for batch printing
 */
exports.getBatchPosters = async (req, res) => {
    try {
        const { itemIds } = req.query;
        
        if (!itemIds) {
            req.flash('error', 'No items selected');
            return res.redirect('/items');
        }

        const ids = itemIds.split(',');
        const items = await Item.find({ _id: { $in: ids } }).populate('category');

        const postersData = await Promise.all(items.map(async (item) => {
            const itemUrl = `${req.protocol}://${req.get('host')}/items/${item._id}`;
            const qrCode = await QRCode.toDataURL(itemUrl, {
                width: 100,
                margin: 1
            });
            return { item, qrCode, itemUrl };
        }));

        res.render('items/batch-posters', {
            title: 'Batch Posters',
            posters: postersData,
            layout: false
        });
    } catch (error) {
        console.error('Batch posters error:', error);
        req.flash('error', 'Failed to generate posters');
        res.redirect('/items');
    }
};
