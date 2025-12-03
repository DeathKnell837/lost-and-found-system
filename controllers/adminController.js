const { User, Item, Category } = require('../models');
const fs = require('fs');
const path = require('path');

// Admin login page
exports.getLoginPage = (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
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

        req.session.user = {
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

// Admin logout
exports.logout = (req, res) => {
    req.session.destroy();
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
            // Delete old image if exists
            if (item.imagePath) {
                const oldPath = path.join(__dirname, '../public', item.imagePath);
                fs.unlink(oldPath, (err) => {
                    if (err) console.log('Error deleting old image:', err);
                });
            }
            item.imagePath = '/uploads/' + req.file.filename;
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
        await Item.findByIdAndUpdate(req.params.id, { status: 'approved' });
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
        await Item.findByIdAndUpdate(req.params.id, { 
            status: 'rejected',
            adminNotes: req.body.reason || 'Rejected by admin'
        });
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

        await Item.findByIdAndUpdate(req.params.id, {
            status: 'claimed',
            claimedBy: {
                name: claimerName,
                email: claimerEmail,
                phone: claimerPhone,
                date: new Date()
            }
        });

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

        // Delete image if exists
        if (item.imagePath) {
            const imagePath = path.join(__dirname, '../public', item.imagePath);
            fs.unlink(imagePath, (err) => {
                if (err) console.log('Error deleting image:', err);
            });
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
        if (user._id.toString() === req.session.user.id) {
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
