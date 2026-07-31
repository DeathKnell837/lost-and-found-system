const { Item, Category } = require('../models');
const geminiService = require('../services/geminiService');
const { calculateMatchScore } = require('../services/matchingService');

/**
 * Chat Controller for Gemini AI Conversational Search
 */
const chatController = {
    /**
     * Handle incoming chat message from AI Assistant widget
     * POST /api/chat
     */
    handleChatMessage: async (req, res) => {
        try {
            const message = req.body ? (req.body.message || '') : '';
            const imageFile = req.file;

            if (!message.trim() && !imageFile) {
                return res.status(400).json({
                    success: false,
                    response: "Please enter a description or attach a photo of the item."
                });
            }

            const userPrompt = message.trim();
            let extracted = {};
            let conversationalResponse = '';

            if (imageFile) {
                // Multimodal image analysis using Gemini 2.0 Flash Vision
                const analysis = await geminiService.analyzeUploadedImage(
                    imageFile.buffer,
                    imageFile.mimetype,
                    userPrompt
                );
                extracted = analysis.extracted || {};
                conversationalResponse = analysis.conversationalResponse;
            } else {
                // Text-only query analysis using Gemini 2.0 Flash
                const geminiAnalysis = await geminiService.parseSearchQuery(userPrompt);
                extracted = geminiAnalysis.extracted || {};
                conversationalResponse = geminiAnalysis.conversationalResponse;
            }

            // Query items database for approved candidates
            const queryConditions = { status: 'approved' };

            // Find matching category ID if category was extracted
            if (extracted.category) {
                const matchedCategory = await Category.findOne({
                    name: { $regex: new RegExp(extracted.category, 'i') }
                });
                if (matchedCategory) {
                    queryConditions.category = matchedCategory._id;
                }
            }

            // Build search conditions for items
            const orConditions = [];

            if (extracted.keywords && extracted.keywords.length > 0) {
                const keywordRegex = extracted.keywords.map(k => new RegExp(k, 'i'));
                orConditions.push(
                    { itemName: { $in: keywordRegex } },
                    { description: { $in: keywordRegex } },
                    { location: { $in: keywordRegex } }
                );
            }

            if (extracted.color) {
                orConditions.push(
                    { itemName: { $regex: new RegExp(extracted.color, 'i') } },
                    { description: { $regex: new RegExp(extracted.color, 'i') } }
                );
            }

            if (extracted.brand) {
                orConditions.push(
                    { itemName: { $regex: new RegExp(extracted.brand, 'i') } },
                    { description: { $regex: new RegExp(extracted.brand, 'i') } }
                );
            }

            if (extracted.location) {
                orConditions.push(
                    { location: { $regex: new RegExp(extracted.location, 'i') } }
                );
            }

            // If no specific conditions extracted, search raw prompt in text fields
            if (orConditions.length === 0) {
                const words = userPrompt.split(/\s+/).filter(w => w.length > 2);
                words.forEach(w => {
                    orConditions.push(
                        { itemName: { $regex: new RegExp(w, 'i') } },
                        { description: { $regex: new RegExp(w, 'i') } },
                        { location: { $regex: new RegExp(w, 'i') } }
                    );
                });
            }

            if (orConditions.length > 0) {
                queryConditions.$or = orConditions;
            }

            let foundItems = await Item.find(queryConditions)
                .populate('category')
                .sort({ createdAt: -1 })
                .limit(10);

            // Fallback: If no exact matched items found, get 3 most recent approved items
            if (foundItems.length === 0) {
                foundItems = await Item.find({ status: 'approved' })
                    .populate('category')
                    .sort({ createdAt: -1 })
                    .limit(3);
            }

            // Score and rank candidates against virtual lost item prompt
            const syntheticItem = {
                itemName: userPrompt,
                description: userPrompt,
                location: extracted.location || '',
                dateLostFound: new Date(),
                category: queryConditions.category || null
            };

            const rankedMatches = foundItems.map(item => {
                const scoreResult = calculateMatchScore(syntheticItem, item);
                return {
                    _id: item._id,
                    itemName: item.itemName,
                    type: item.type,
                    category: item.category ? item.category.name : 'Item',
                    location: item.location,
                    description: item.description,
                    imagePath: item.imagePath,
                    dateLostFound: item.dateLostFound ? new Date(item.dateLostFound).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
                    matchScore: scoreResult.total
                };
            }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);

            return res.json({
                success: true,
                response: conversationalResponse,
                matches: rankedMatches
            });

        } catch (error) {
            console.error('Chat controller error:', error);
            return res.status(500).json({
                success: false,
                response: "I encountered an issue processing your query. Please try searching on the main page."
            });
        }
    }
};

module.exports = chatController;
