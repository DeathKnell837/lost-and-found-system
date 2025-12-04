const { ClaimRequest, Item, User } = require('../models');
const emailService = require('../services/emailService');

/**
 * Get claim request form for an item
 */
exports.getClaimForm = async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId)
            .populate('category');
        
        if (!item) {
            req.flash('error', 'Item not found');
            return res.redirect('/items');
        }

        if (item.status !== 'approved') {
            req.flash('error', 'This item is not available for claiming');
            return res.redirect(`/items/${item._id}`);
        }

        // Check if user already has a pending claim
        const existingClaim = await ClaimRequest.findOne({
            item: item._id,
            claimant: req.session.user._id,
            status: { $in: ['pending', 'under_review'] }
        });

        if (existingClaim) {
            req.flash('info', 'You already have a pending claim for this item');
            return res.redirect(`/claims/my-claims`);
        }

        res.render('claims/claim-form', {
            title: `Claim Item - ${item.title}`,
            item,
            user: req.session.user
        });
    } catch (error) {
        console.error('Get claim form error:', error);
        req.flash('error', 'Something went wrong');
        res.redirect('/items');
    }
};

/**
 * Submit a claim request
 */
exports.submitClaim = async (req, res) => {
    try {
        const { description, proofOfOwnership, identifyingFeatures, contactPhone, preferredContactMethod } = req.body;
        const itemId = req.params.itemId;

        const item = await Item.findById(itemId);
        if (!item) {
            req.flash('error', 'Item not found');
            return res.redirect('/items');
        }

        if (item.status !== 'approved') {
            req.flash('error', 'This item is not available for claiming');
            return res.redirect(`/items/${item._id}`);
        }

        // Check for existing claim
        const existingClaim = await ClaimRequest.findOne({
            item: itemId,
            claimant: req.session.user._id,
            status: { $in: ['pending', 'under_review'] }
        });

        if (existingClaim) {
            req.flash('error', 'You already have a pending claim for this item');
            return res.redirect('/claims/my-claims');
        }

        // Handle proof images if uploaded
        let proofImages = [];
        if (req.files && req.files.length > 0) {
            proofImages = req.files.map(file => ({
                url: file.path,
                publicId: file.filename
            }));
        }

        const claim = new ClaimRequest({
            item: itemId,
            claimant: req.session.user._id,
            description,
            proofOfOwnership,
            identifyingFeatures: identifyingFeatures || '',
            contactPhone: contactPhone || '',
            preferredContactMethod: preferredContactMethod || 'email',
            proofImages,
            timeline: [{
                action: 'Claim submitted',
                performedBy: req.session.user._id,
                timestamp: new Date()
            }]
        });

        await claim.save();

        req.flash('success', 'Your claim has been submitted successfully! We will review it shortly.');
        res.redirect('/claims/my-claims');
    } catch (error) {
        console.error('Submit claim error:', error);
        if (error.code === 11000) {
            req.flash('error', 'You already have a pending claim for this item');
        } else {
            req.flash('error', error.message || 'Failed to submit claim');
        }
        res.redirect(`/claims/form/${req.params.itemId}`);
    }
};

/**
 * Get user's claims
 */
exports.getMyClaims = async (req, res) => {
    try {
        const claims = await ClaimRequest.find({ claimant: req.session.user._id })
            .populate('item')
            .sort({ createdAt: -1 });

        res.render('claims/my-claims', {
            title: 'My Claims',
            claims,
            user: req.session.user
        });
    } catch (error) {
        console.error('Get my claims error:', error);
        req.flash('error', 'Failed to load claims');
        res.redirect('/user/dashboard');
    }
};

/**
 * Get single claim details
 */
exports.getClaimDetails = async (req, res) => {
    try {
        const claim = await ClaimRequest.findById(req.params.claimId)
            .populate('item')
            .populate('claimant', 'username email')
            .populate('reviewedBy', 'username')
            .populate('timeline.performedBy', 'username');

        if (!claim) {
            req.flash('error', 'Claim not found');
            return res.redirect('/claims/my-claims');
        }

        // Check if user owns this claim or is admin
        if (claim.claimant._id.toString() !== req.session.user._id.toString() && req.session.user.role !== 'admin') {
            req.flash('error', 'Unauthorized');
            return res.redirect('/claims/my-claims');
        }

        res.render('claims/claim-details', {
            title: 'Claim Details',
            claim,
            user: req.session.user
        });
    } catch (error) {
        console.error('Get claim details error:', error);
        req.flash('error', 'Failed to load claim details');
        res.redirect('/claims/my-claims');
    }
};

/**
 * Withdraw a claim
 */
exports.withdrawClaim = async (req, res) => {
    try {
        const claim = await ClaimRequest.findById(req.params.claimId);

        if (!claim) {
            req.flash('error', 'Claim not found');
            return res.redirect('/claims/my-claims');
        }

        if (claim.claimant.toString() !== req.session.user._id.toString()) {
            req.flash('error', 'Unauthorized');
            return res.redirect('/claims/my-claims');
        }

        if (!['pending', 'under_review'].includes(claim.status)) {
            req.flash('error', 'This claim cannot be withdrawn');
            return res.redirect('/claims/my-claims');
        }

        claim.status = 'withdrawn';
        claim.timeline.push({
            action: 'Claim withdrawn by user',
            performedBy: req.session.user._id,
            timestamp: new Date()
        });
        await claim.save();

        req.flash('success', 'Claim withdrawn successfully');
        res.redirect('/claims/my-claims');
    } catch (error) {
        console.error('Withdraw claim error:', error);
        req.flash('error', 'Failed to withdraw claim');
        res.redirect('/claims/my-claims');
    }
};

// ============ ADMIN FUNCTIONS ============

/**
 * Get all claims for admin
 */
exports.adminGetClaims = async (req, res) => {
    try {
        const { status, sort } = req.query;
        
        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        else if (sort === 'priority') sortOption = { priority: -1, createdAt: -1 };

        const claims = await ClaimRequest.find(query)
            .populate('item')
            .populate('claimant', 'username email')
            .sort(sortOption);

        // Get counts for filters
        const counts = {
            all: await ClaimRequest.countDocuments(),
            pending: await ClaimRequest.countDocuments({ status: 'pending' }),
            under_review: await ClaimRequest.countDocuments({ status: 'under_review' }),
            approved: await ClaimRequest.countDocuments({ status: 'approved' }),
            rejected: await ClaimRequest.countDocuments({ status: 'rejected' })
        };

        res.render('admin/claims', {
            title: 'Manage Claims',
            claims,
            counts,
            currentStatus: status || 'all',
            currentSort: sort || 'newest',
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin get claims error:', error);
        req.flash('error', 'Failed to load claims');
        res.redirect('/admin/dashboard');
    }
};

/**
 * Get single claim for admin review
 */
exports.adminGetClaimDetail = async (req, res) => {
    try {
        const claim = await ClaimRequest.findById(req.params.claimId)
            .populate({
                path: 'item',
                populate: { path: 'category' }
            })
            .populate('claimant', 'username email createdAt')
            .populate('reviewedBy', 'username')
            .populate('timeline.performedBy', 'username');

        if (!claim) {
            req.flash('error', 'Claim not found');
            return res.redirect('/admin/claims');
        }

        // Get other claims for this item
        const otherClaims = await ClaimRequest.find({
            item: claim.item._id,
            _id: { $ne: claim._id }
        }).populate('claimant', 'username');

        // Get claimant's claim history
        const claimantHistory = await ClaimRequest.find({
            claimant: claim.claimant._id,
            _id: { $ne: claim._id }
        }).populate('item', 'title').limit(5).sort({ createdAt: -1 });

        res.render('admin/claim-detail', {
            title: 'Review Claim',
            claim,
            otherClaims,
            claimantHistory,
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin get claim detail error:', error);
        req.flash('error', 'Failed to load claim');
        res.redirect('/admin/claims');
    }
};

/**
 * Update claim status (admin)
 */
exports.adminUpdateClaimStatus = async (req, res) => {
    try {
        const { status, adminNotes, rejectionReason } = req.body;
        const claim = await ClaimRequest.findById(req.params.claimId)
            .populate('item')
            .populate('claimant');

        if (!claim) {
            req.flash('error', 'Claim not found');
            return res.redirect('/admin/claims');
        }

        claim.status = status;
        claim.adminNotes = adminNotes || claim.adminNotes;
        claim.reviewedBy = req.session.user._id;
        claim.reviewedAt = new Date();

        if (status === 'rejected' && rejectionReason) {
            claim.rejectionReason = rejectionReason;
        }

        claim.timeline.push({
            action: `Status updated to ${status}`,
            performedBy: req.session.user._id,
            note: adminNotes || '',
            timestamp: new Date()
        });

        await claim.save();

        // If approved, update item status to claimed
        if (status === 'approved') {
            await Item.findByIdAndUpdate(claim.item._id, {
                status: 'claimed',
                claimedBy: claim.claimant._id,
                claimedAt: new Date()
            });

            // Send email to claimant
            if (claim.claimant.email) {
                try {
                    await emailService.sendItemClaimedEmail(
                        claim.claimant.email,
                        claim.claimant.username,
                        claim.item
                    );
                } catch (emailError) {
                    console.error('Failed to send claim approval email:', emailError);
                }
            }

            // Reject other pending claims for this item
            await ClaimRequest.updateMany(
                {
                    item: claim.item._id,
                    _id: { $ne: claim._id },
                    status: { $in: ['pending', 'under_review'] }
                },
                {
                    status: 'rejected',
                    rejectionReason: 'Another claim was approved for this item',
                    reviewedBy: req.session.user._id,
                    reviewedAt: new Date()
                }
            );
        }

        req.flash('success', `Claim ${status} successfully`);
        res.redirect('/admin/claims');
    } catch (error) {
        console.error('Admin update claim error:', error);
        req.flash('error', 'Failed to update claim');
        res.redirect('/admin/claims');
    }
};

/**
 * Set claim priority (admin)
 */
exports.adminSetPriority = async (req, res) => {
    try {
        const { priority } = req.body;
        await ClaimRequest.findByIdAndUpdate(req.params.claimId, { priority });
        
        req.flash('success', 'Priority updated');
        res.redirect(`/admin/claims/${req.params.claimId}`);
    } catch (error) {
        console.error('Set priority error:', error);
        req.flash('error', 'Failed to update priority');
        res.redirect('/admin/claims');
    }
};
