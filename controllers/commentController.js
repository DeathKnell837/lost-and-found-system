const { Comment, Item } = require('../models');
const mongoose = require('mongoose');

/**
 * Get comments for an item - Simplified and robust
 */
exports.getItemComments = async (req, res) => {
    // Always return JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    
    const { itemId } = req.params;
    
    // Quick validation
    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
        console.log('[Comments] Invalid itemId:', itemId);
        return res.json({ success: true, comments: [] });
    }

    try {
        console.log('[Comments] Fetching comments for item:', itemId);
        
        const comments = await Comment.find({ 
            item: itemId,
            isHidden: { $ne: true }
        })
        .populate('author', 'username')
        .populate('replies.author', 'username')
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(50)
        .lean()
        .maxTimeMS(5000); // 5 second timeout on query

        console.log('[Comments] Found', comments?.length || 0, 'comments');
        return res.json({ success: true, comments: comments || [] });
        
    } catch (error) {
        console.error('[Comments] Error:', error.message);
        return res.json({ success: true, comments: [] });
    }
};

/**
 * Add a comment to an item
 */
exports.addComment = async (req, res) => {
    try {
        const { content, type } = req.body;
        const itemId = req.params.itemId;

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const comment = new Comment({
            item: itemId,
            author: req.session.user._id,
            content,
            type: type || 'comment'
        });

        await comment.save();
        await comment.populate('author', 'username');

        res.json({ 
            success: true, 
            message: 'Comment added successfully',
            comment 
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to add comment' 
        });
    }
};

/**
 * Edit a comment
 */
exports.editComment = async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Check ownership
        if (comment.author.toString() !== req.session.user._id.toString() && 
            req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        comment.content = content;
        comment.isEdited = true;
        comment.editedAt = new Date();
        await comment.save();

        res.json({ success: true, message: 'Comment updated', comment });
    } catch (error) {
        console.error('Edit comment error:', error);
        res.status(500).json({ success: false, message: 'Failed to update comment' });
    }
};

/**
 * Delete a comment
 */
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Check ownership or admin
        if (comment.author.toString() !== req.session.user._id.toString() && 
            req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await Comment.findByIdAndDelete(req.params.commentId);

        res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete comment' });
    }
};

/**
 * Add a reply to a comment
 */
exports.addReply = async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        comment.replies.push({
            author: req.session.user._id,
            content,
            createdAt: new Date()
        });

        await comment.save();
        await comment.populate('replies.author', 'username');

        res.json({ 
            success: true, 
            message: 'Reply added',
            reply: comment.replies[comment.replies.length - 1]
        });
    } catch (error) {
        console.error('Add reply error:', error);
        res.status(500).json({ success: false, message: 'Failed to add reply' });
    }
};

/**
 * Vote a comment as helpful
 */
exports.voteHelpful = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Check if user already voted
        const existingVote = comment.helpfulVotes.find(
            v => v.user.toString() === req.session.user._id.toString()
        );

        if (existingVote) {
            // Remove vote
            comment.helpfulVotes = comment.helpfulVotes.filter(
                v => v.user.toString() !== req.session.user._id.toString()
            );
        } else {
            // Add vote
            comment.helpfulVotes.push({
                user: req.session.user._id,
                votedAt: new Date()
            });
        }

        // Update isHelpful flag if >= 3 votes
        comment.isHelpful = comment.helpfulVotes.length >= 3;

        await comment.save();

        res.json({ 
            success: true, 
            voted: !existingVote,
            helpfulCount: comment.helpfulVotes.length,
            isHelpful: comment.isHelpful
        });
    } catch (error) {
        console.error('Vote helpful error:', error);
        res.status(500).json({ success: false, message: 'Failed to vote' });
    }
};

// ============ ADMIN FUNCTIONS ============

/**
 * Hide a comment (admin)
 */
exports.adminHideComment = async (req, res) => {
    try {
        const { reason } = req.body;
        
        await Comment.findByIdAndUpdate(req.params.commentId, {
            isHidden: true,
            hiddenReason: reason,
            hiddenBy: req.session.user._id
        });

        res.json({ success: true, message: 'Comment hidden' });
    } catch (error) {
        console.error('Hide comment error:', error);
        res.status(500).json({ success: false, message: 'Failed to hide comment' });
    }
};

/**
 * Unhide a comment (admin)
 */
exports.adminUnhideComment = async (req, res) => {
    try {
        await Comment.findByIdAndUpdate(req.params.commentId, {
            isHidden: false,
            hiddenReason: null,
            hiddenBy: null
        });

        res.json({ success: true, message: 'Comment restored' });
    } catch (error) {
        console.error('Unhide comment error:', error);
        res.status(500).json({ success: false, message: 'Failed to restore comment' });
    }
};

/**
 * Pin a comment (admin)
 */
exports.adminPinComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        comment.isPinned = !comment.isPinned;
        await comment.save();

        res.json({ 
            success: true, 
            message: comment.isPinned ? 'Comment pinned' : 'Comment unpinned',
            isPinned: comment.isPinned
        });
    } catch (error) {
        console.error('Pin comment error:', error);
        res.status(500).json({ success: false, message: 'Failed to pin comment' });
    }
};

/**
 * Get all comments for admin moderation
 */
exports.adminGetAllComments = async (req, res) => {
    try {
        const { filter } = req.query;
        
        let query = {};
        if (filter === 'hidden') query.isHidden = true;
        else if (filter === 'visible') query.isHidden = false;
        else if (filter === 'helpful') query.isHelpful = true;

        const comments = await Comment.find(query)
            .populate('author', 'username')
            .populate('item', 'itemName')
            .sort({ createdAt: -1 })
            .limit(100);

        const counts = {
            all: await Comment.countDocuments(),
            visible: await Comment.countDocuments({ isHidden: false }),
            hidden: await Comment.countDocuments({ isHidden: true }),
            helpful: await Comment.countDocuments({ isHelpful: true })
        };

        res.render('admin/comments', {
            title: 'Manage Comments',
            comments,
            counts,
            currentFilter: filter || 'all',
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin get comments error:', error);
        req.flash('error', 'Failed to load comments');
        res.redirect('/admin/dashboard');
    }
};
