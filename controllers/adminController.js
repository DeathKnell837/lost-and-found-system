const { User, Item, Category, BlockedDevice, TrackedDevice } = require('../models');
const { cloudinary } = require('../config/cloudinary');
const { generateFingerprint, getClientIP, parseUserAgent } = require('../middleware/deviceTracker');
const emailService = require('../services/emailService');

// Admin login page
exports.getLoginPage = (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', {
        title: 'Admin Login - Lost & Found',
        layout: 'layouts/admin'
    });
};

// Handle admin login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({
            $or: [{ username }, { email: username }],
            role: 'admin'
        });

        if (!user) {
            req.flash('error', 'Invalid admin credentials');
            return res.redirect('/admin/login');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Invalid admin credentials');
            return res.redirect('/admin/login');
        }

        // Use separate admin session (doesn't affect user session)
        req.session.admin = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        req.flash('success', 'Welcome to Admin Dashboard');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Admin login error:', error);
        req.flash('error', 'Login failed');
        res.redirect('/admin/login');
    }
};

// Admin logout (only destroys admin session, keeps user session)
exports.logout = (req, res) => {
    delete req.session.admin;
    req.flash('success', 'Logged out from admin panel');
    res.redirect('/admin/login');
};

// Dashboard
exports.getDashboard = async (req, res) => {
    try {
        // Get counts
        const stats = {
            totalItems: await Item.countDocuments(),
            pendingItems: await Item.countDocuments({ status: 'pending' }),
            approvedItems: await Item.countDocuments({ status: 'approved' }),
            claimedItems: await Item.countDocuments({ status: 'claimed' }),
            rejectedItems: await Item.countDocuments({ status: 'rejected' }),
            lostItems: await Item.countDocuments({ type: 'lost', status: 'approved' }),
            foundItems: await Item.countDocuments({ type: 'found', status: 'approved' }),
            totalUsers: await User.countDocuments({ role: 'user' }),
            totalCategories: await Category.countDocuments()
        };

        // Recent items
        const recentItems = await Item.find()
            .populate('category')
            .sort({ dateReported: -1 })
            .limit(10);

        // Pending items
        const pendingItems = await Item.find({ status: 'pending' })
            .populate('category')
            .sort({ dateReported: -1 })
            .limit(5);

        res.render('admin/dashboard', {
            title: 'Admin Dashboard - Lost & Found',
            layout: 'layouts/admin',
            stats,
            recentItems,
            pendingItems
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Error loading dashboard');
        res.redirect('/admin/login');
    }
};

// Get all items with filters
exports.getItems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        let query = {};

        // Status filter
        if (req.query.status && req.query.status !== '') {
            query.status = req.query.status;
        }

        // Type filter
        if (req.query.type && req.query.type !== '') {
            query.type = req.query.type;
        }

        // Category filter
        if (req.query.category && req.query.category !== '') {
            query.category = req.query.category;
        }

        // Search
        if (req.query.search && req.query.search !== '') {
            query.$or = [
                { itemName: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { reporterName: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const items = await Item.find(query)
            .populate('category')
            .sort({ dateReported: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Item.countDocuments(query);
        const categories = await Category.find();

        res.render('admin/items', {
            title: 'Manage Items - Admin',
            layout: 'layouts/admin',
            items,
            categories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            query: req.query
        });
    } catch (error) {
        console.error('Error loading items:', error);
        req.flash('error', 'Error loading items');
        res.redirect('/admin/dashboard');
    }
};

// Get pending items
exports.getPendingItems = async (req, res) => {
    try {
        const items = await Item.find({ status: 'pending' })
            .populate('category')
            .sort({ dateReported: -1 });

        res.render('admin/pending', {
            title: 'Pending Items - Admin',
            layout: 'layouts/admin',
            items
        });
    } catch (error) {
        console.error('Error loading pending items:', error);
        req.flash('error', 'Error loading pending items');
        res.redirect('/admin/dashboard');
    }
};

// Get single item for editing
exports.getEditItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('category');
        if (!item) {
            req.flash('error', 'Item not found');
            return res.redirect('/admin/items');
        }

        const categories = await Category.find({ isActive: true });

        res.render('admin/edit-item', {
            title: 'Edit Item - Admin',
            layout: 'layouts/admin',
            item,
            categories
        });
    } catch (error) {
        console.error('Error loading item:', error);
        req.flash('error', 'Error loading item');
        res.redirect('/admin/items');
    }
};

// Update item
exports.updateItem = async (req, res) => {
    try {
        const {
            itemName,
            category,
            description,
            location,
            contactInfo,
            reporterName,
            reporterEmail,
            dateLostFound,
            type,
            status,
            adminNotes
        } = req.body;

        const item = await Item.findById(req.params.id);
        if (!item) {
            req.flash('error', 'Item not found');
            return res.redirect('/admin/items');
        }

        // Update fields
        item.itemName = itemName;
        item.category = category;
        item.description = description;
        item.location = location;
        item.contactInfo = contactInfo;
        item.reporterName = reporterName;
        item.reporterEmail = reporterEmail;
        item.dateLostFound = new Date(dateLostFound);
        item.type = type;
        item.status = status;
        item.adminNotes = adminNotes;

        // Handle new image upload
        if (req.file) {
            // Delete old image from Cloudinary if exists
            if (item.imagePath) {
                // Extract public_id from Cloudinary URL
                const urlParts = item.imagePath.split('/');
                const publicIdWithExt = urlParts.slice(-2).join('/'); // folder/filename
                const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); // remove extension
                cloudinary.uploader.destroy(publicId).catch(err => console.log('Error deleting old image:', err));
            }
            item.imagePath = req.file.path;
        }

        await item.save();

        req.flash('success', 'Item updated successfully');
        res.redirect('/admin/items');
    } catch (error) {
        console.error('Error updating item:', error);
        req.flash('error', 'Error updating item');
        res.redirect('/admin/items/' + req.params.id + '/edit');
    }
};

// Approve item
exports.approveItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        
        // Send email notification if user exists
        if (item.reportedBy) {
            const user = await User.findById(item.reportedBy);
            if (user && user.notificationPreferences?.emailOnApproval !== false) {
                emailService.sendItemApprovedEmail(user, item);
            }
        }
        
        req.flash('success', 'Item approved successfully');
        res.redirect('back');
    } catch (error) {
        console.error('Error approving item:', error);
        req.flash('error', 'Error approving item');
        res.redirect('back');
    }
};

// Reject item
exports.rejectItem = async (req, res) => {
    try {
        const reason = req.body.reason || 'Rejected by admin';
        const item = await Item.findByIdAndUpdate(req.params.id, { 
            status: 'rejected',
            adminNotes: reason
        }, { new: true });
        
        // Send email notification if user exists
        if (item.reportedBy) {
            const user = await User.findById(item.reportedBy);
            if (user && user.notificationPreferences?.emailOnRejection !== false) {
                emailService.sendItemRejectedEmail(user, item, reason);
            }
        }
        
        req.flash('success', 'Item rejected');
        res.redirect('back');
    } catch (error) {
        console.error('Error rejecting item:', error);
        req.flash('error', 'Error rejecting item');
        res.redirect('back');
    }
};

// Mark item as claimed
exports.claimItem = async (req, res) => {
    try {
        const { claimerName, claimerEmail, claimerPhone } = req.body;
        const claimerInfo = { name: claimerName, email: claimerEmail, phone: claimerPhone, date: new Date() };

        const item = await Item.findByIdAndUpdate(req.params.id, {
            status: 'claimed',
            claimedBy: claimerInfo
        }, { new: true });

        // Send email notification if user exists
        if (item.reportedBy) {
            const user = await User.findById(item.reportedBy);
            if (user && user.notificationPreferences?.emailOnClaim !== false) {
                emailService.sendItemClaimedEmail(user, item, claimerInfo);
            }
        }

        req.flash('success', 'Item marked as claimed');
        res.redirect('back');
    } catch (error) {
        console.error('Error claiming item:', error);
        req.flash('error', 'Error updating item');
        res.redirect('back');
    }
};

// Delete item
exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            req.flash('error', 'Item not found');
            return res.redirect('/admin/items');
        }

        // Delete image from Cloudinary if exists
        if (item.imagePath) {
            const urlParts = item.imagePath.split('/');
            const publicIdWithExt = urlParts.slice(-2).join('/');
            const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
            cloudinary.uploader.destroy(publicId).catch(err => console.log('Error deleting image:', err));
        }

        await Item.findByIdAndDelete(req.params.id);
        req.flash('success', 'Item deleted successfully');
        res.redirect('/admin/items');
    } catch (error) {
        console.error('Error deleting item:', error);
        req.flash('error', 'Error deleting item');
        res.redirect('/admin/items');
    }
};

// Get categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        
        // Get item count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const count = await Item.countDocuments({ category: cat._id });
                return { ...cat.toObject(), itemCount: count };
            })
        );

        res.render('admin/categories', {
            title: 'Manage Categories - Admin',
            layout: 'layouts/admin',
            categories: categoriesWithCount
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        req.flash('error', 'Error loading categories');
        res.redirect('/admin/dashboard');
    }
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;

        const category = new Category({
            name,
            description,
            icon: icon || 'fa-box'
        });

        await category.save();
        req.flash('success', 'Category created successfully');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Error creating category:', error);
        req.flash('error', 'Error creating category');
        res.redirect('/admin/categories');
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, icon, isActive } = req.body;

        await Category.findByIdAndUpdate(req.params.id, {
            name,
            description,
            icon,
            isActive: isActive === 'true'
        });

        req.flash('success', 'Category updated successfully');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Error updating category:', error);
        req.flash('error', 'Error updating category');
        res.redirect('/admin/categories');
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        // Check if category has items
        const itemCount = await Item.countDocuments({ category: req.params.id });
        if (itemCount > 0) {
            req.flash('error', 'Cannot delete category with existing items');
            return res.redirect('/admin/categories');
        }

        await Category.findByIdAndDelete(req.params.id);
        req.flash('success', 'Category deleted successfully');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Error deleting category:', error);
        req.flash('error', 'Error deleting category');
        res.redirect('/admin/categories');
    }
};

// Get users list
exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.render('admin/users', {
            title: 'Manage Users - Admin',
            layout: 'layouts/admin',
            users,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total
        });
    } catch (error) {
        console.error('Error loading users:', error);
        req.flash('error', 'Error loading users');
        res.redirect('/admin/dashboard');
    }
};

// Toggle user status
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }

        // Prevent deactivating yourself
        if (user._id.toString() === req.session.admin.id) {
            req.flash('error', 'Cannot deactivate your own account');
            return res.redirect('/admin/users');
        }

        user.isActive = !user.isActive;
        await user.save();

        req.flash('success', `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error updating user:', error);
        req.flash('error', 'Error updating user');
        res.redirect('/admin/users');
    }
};

// ==================== DEVICE TRACKING ====================

// Get all tracked devices
exports.getDevices = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        let query = {};

        // Device type filter
        if (req.query.deviceType) {
            query['device.type'] = req.query.deviceType;
        }

        // Status filter
        if (req.query.status === 'blocked') {
            query.isBlocked = true;
        } else if (req.query.status === 'suspicious') {
            query.isSuspicious = true;
        } else if (req.query.status === 'active') {
            query.isBlocked = { $ne: true };
        }

        // Search filter
        if (req.query.search) {
            query.$or = [
                { 'browser.name': { $regex: req.query.search, $options: 'i' } },
                { 'os.name': { $regex: req.query.search, $options: 'i' } },
                { 'ipAddresses.ip': { $regex: req.query.search, $options: 'i' } },
                { fingerprint: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const devices = await TrackedDevice.find(query)
            .populate('users.user', 'username email')
            .sort({ lastSeen: -1 })
            .skip(skip)
            .limit(limit);

        const total = await TrackedDevice.countDocuments(query);

        // Get stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = {
            total: await TrackedDevice.countDocuments(),
            activeToday: await TrackedDevice.countDocuments({ lastSeen: { $gte: today } }),
            blocked: await TrackedDevice.countDocuments({ isBlocked: true }),
            suspicious: await TrackedDevice.countDocuments({ isSuspicious: true })
        };

        res.render('admin/devices', {
            title: 'Device Tracking - Admin',
            layout: 'layouts/admin',
            devices,
            stats,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            query: req.query
        });
    } catch (error) {
        console.error('Error loading devices:', error);
        req.flash('error', 'Error loading devices');
        res.redirect('/admin/dashboard');
    }
};

// Get device detail
exports.getDeviceDetail = async (req, res) => {
    try {
        const device = await TrackedDevice.findById(req.params.id)
            .populate('users.user', 'username email role');

        if (!device) {
            req.flash('error', 'Device not found');
            return res.redirect('/admin/devices');
        }

        // Check if device is blocked
        const blockedInfo = await BlockedDevice.findOne({ fingerprint: device.fingerprint, isActive: true })
            .populate('blockedBy', 'username');

        res.render('admin/device-detail', {
            title: 'Device Details - Admin',
            layout: 'layouts/admin',
            device,
            blockedInfo
        });
    } catch (error) {
        console.error('Error loading device:', error);
        req.flash('error', 'Error loading device details');
        res.redirect('/admin/devices');
    }
};

// Block a device
exports.blockDevice = async (req, res) => {
    try {
        const { reason, notes } = req.body;
        const device = await TrackedDevice.findById(req.params.id);

        if (!device) {
            req.flash('error', 'Device not found');
            return res.redirect('/admin/devices');
        }

        // Check if already blocked
        let blockedDevice = await BlockedDevice.findOne({ fingerprint: device.fingerprint });

        if (blockedDevice) {
            // Reactivate block
            blockedDevice.isActive = true;
            blockedDevice.reason = reason + (notes ? ` - ${notes}` : '');
            blockedDevice.blockedAt = new Date();
            blockedDevice.blockedBy = req.session.admin.id;
            blockedDevice.blockHistory.push({
                action: 'blocked',
                date: new Date(),
                by: req.session.admin.id,
                reason: reason
            });
            await blockedDevice.save();
        } else {
            // Create new block
            blockedDevice = new BlockedDevice({
                fingerprint: device.fingerprint,
                ipAddress: device.ipAddresses.length > 0 ? device.ipAddresses[device.ipAddresses.length - 1].ip : 'unknown',
                userAgent: device.userAgent,
                browser: device.browser,
                os: device.os,
                device: device.device,
                reason: reason + (notes ? ` - ${notes}` : ''),
                blockedBy: req.session.admin.id,
                blockHistory: [{
                    action: 'blocked',
                    date: new Date(),
                    by: req.session.admin.id,
                    reason: reason
                }]
            });
            await blockedDevice.save();
        }

        // Mark device as blocked in tracking
        device.isBlocked = true;
        await device.save();

        req.flash('success', 'Device has been blocked');
        res.redirect('/admin/devices/' + req.params.id);
    } catch (error) {
        console.error('Error blocking device:', error);
        req.flash('error', 'Error blocking device');
        res.redirect('/admin/devices');
    }
};

// Unblock a device
exports.unblockDevice = async (req, res) => {
    try {
        const device = await TrackedDevice.findById(req.params.id);

        if (!device) {
            req.flash('error', 'Device not found');
            return res.redirect('/admin/devices');
        }

        // Find and deactivate block
        const blockedDevice = await BlockedDevice.findOne({ fingerprint: device.fingerprint });
        if (blockedDevice) {
            blockedDevice.isActive = false;
            blockedDevice.blockHistory.push({
                action: 'unblocked',
                date: new Date(),
                by: req.session.admin.id,
                reason: 'Unblocked by admin'
            });
            await blockedDevice.save();
        }

        // Update tracking
        device.isBlocked = false;
        await device.save();

        req.flash('success', 'Device has been unblocked');
        res.redirect('/admin/devices/' + req.params.id);
    } catch (error) {
        console.error('Error unblocking device:', error);
        req.flash('error', 'Error unblocking device');
        res.redirect('/admin/devices');
    }
};

// Delete device tracking record
exports.deleteDevice = async (req, res) => {
    try {
        const device = await TrackedDevice.findById(req.params.id);

        if (!device) {
            req.flash('error', 'Device not found');
            return res.redirect('/admin/devices');
        }

        // Also delete from blocked list if exists
        await BlockedDevice.deleteOne({ fingerprint: device.fingerprint });
        await TrackedDevice.findByIdAndDelete(req.params.id);

        req.flash('success', 'Device record deleted');
        res.redirect('/admin/devices');
    } catch (error) {
        console.error('Error deleting device:', error);
        req.flash('error', 'Error deleting device');
        res.redirect('/admin/devices');
    }
};

// ==================== STATISTICS ====================

// Get statistics page
exports.getStatistics = async (req, res) => {
    try {
        // Basic counts
        const totalItems = await Item.countDocuments();
        const lostItems = await Item.countDocuments({ type: 'lost' });
        const foundItems = await Item.countDocuments({ type: 'found' });
        const claimedItems = await Item.countDocuments({ status: 'claimed' });
        const pendingItems = await Item.countDocuments({ status: 'pending' });
        const approvedItems = await Item.countDocuments({ status: 'approved' });
        const rejectedItems = await Item.countDocuments({ status: 'rejected' });
        const totalUsers = await User.countDocuments({ role: 'user' });

        // Success rate
        const successRate = totalItems > 0 ? ((claimedItems / totalItems) * 100).toFixed(1) : 0;

        // Items by category
        const categories = await Category.find();
        const itemsByCategory = await Promise.all(
            categories.map(async (cat) => ({
                name: cat.name,
                count: await Item.countDocuments({ category: cat._id }),
                icon: cat.icon
            }))
        );
        itemsByCategory.sort((a, b) => b.count - a.count);

        // Monthly data for the last 6 months
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

            const lost = await Item.countDocuments({
                type: 'lost',
                dateReported: { $gte: startOfMonth, $lte: endOfMonth }
            });
            const found = await Item.countDocuments({
                type: 'found',
                dateReported: { $gte: startOfMonth, $lte: endOfMonth }
            });
            const claimed = await Item.countDocuments({
                status: 'claimed',
                'claimedBy.date': { $gte: startOfMonth, $lte: endOfMonth }
            });

            monthlyData.push({
                month: date.toLocaleString('default', { month: 'short' }),
                year: date.getFullYear(),
                lost,
                found,
                claimed
            });
        }

        // Recent activity (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentItems = await Item.countDocuments({ dateReported: { $gte: weekAgo } });
        const recentClaims = await Item.countDocuments({ 
            status: 'claimed', 
            'claimedBy.date': { $gte: weekAgo } 
        });

        // Top locations
        const locationAggregation = await Item.aggregate([
            { $group: { _id: '$location', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Average time to claim (for claimed items)
        const claimedItemsData = await Item.find({ status: 'claimed', 'claimedBy.date': { $exists: true } });
        let avgDaysToClaim = 0;
        if (claimedItemsData.length > 0) {
            const totalDays = claimedItemsData.reduce((sum, item) => {
                const reported = new Date(item.dateReported);
                const claimed = new Date(item.claimedBy.date);
                return sum + Math.ceil((claimed - reported) / (1000 * 60 * 60 * 24));
            }, 0);
            avgDaysToClaim = (totalDays / claimedItemsData.length).toFixed(1);
        }

        res.render('admin/statistics', {
            title: 'Statistics - Admin',
            layout: 'layouts/admin',
            stats: {
                totalItems,
                lostItems,
                foundItems,
                claimedItems,
                pendingItems,
                approvedItems,
                rejectedItems,
                totalUsers,
                successRate,
                recentItems,
                recentClaims,
                avgDaysToClaim
            },
            itemsByCategory,
            monthlyData,
            topLocations: locationAggregation
        });
    } catch (error) {
        console.error('Statistics error:', error);
        req.flash('error', 'Error loading statistics');
        res.redirect('/admin/dashboard');
    }
};
