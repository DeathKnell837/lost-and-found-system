const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { isAuthenticated } = require('../middleware/auth');
const { apiRateLimit, validateObjectIdParams } = require('../middleware/security');

// Public routes (with API rate limiting)
router.get('/item/:itemId', apiRateLimit, validateObjectIdParams('itemId'), commentController.getItemComments);

// Authenticated user routes (with API rate limiting)
router.post('/item/:itemId', isAuthenticated, apiRateLimit, validateObjectIdParams('itemId'), commentController.addComment);
router.put('/:commentId', isAuthenticated, apiRateLimit, validateObjectIdParams('commentId'), commentController.editComment);
router.delete('/:commentId', isAuthenticated, apiRateLimit, validateObjectIdParams('commentId'), commentController.deleteComment);
router.post('/:commentId/reply', isAuthenticated, apiRateLimit, validateObjectIdParams('commentId'), commentController.addReply);
router.post('/:commentId/helpful', isAuthenticated, apiRateLimit, validateObjectIdParams('commentId'), commentController.voteHelpful);

module.exports = router;
