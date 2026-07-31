const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat - AI Assistant conversational search endpoint
router.post('/chat', chatController.handleChatMessage);

module.exports = router;
