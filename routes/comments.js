const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { isAuthenticated } = require('../middleware/auth');

// Public routes
router.get('/item/:itemId', commentController.getItemComments);

// Authenticated user routes
router.post('/item/:itemId', isAuthenticated, commentController.addComment);
router.put('/:commentId', isAuthenticated, commentController.editComment);
router.delete('/:commentId', isAuthenticated, commentController.deleteComment);
router.post('/:commentId/reply', isAuthenticated, commentController.addReply);
router.post('/:commentId/helpful', isAuthenticated, commentController.voteHelpful);

module.exports = router;
