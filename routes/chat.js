const express = require('express');
const router = express.Router();
const multer = require('multer');
const chatController = require('../controllers/chatController');

// Multer memory storage for AI Assistant image upload
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/chat - AI Assistant conversational search endpoint (supports optional image)
router.post('/chat', upload.single('image'), chatController.handleChatMessage);

module.exports = router;
