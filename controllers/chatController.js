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
                return res.json({
                    success: true,
                    isSearch: false,
                    response: "Hello! I am your Campus Lost & Found AI Assistant. How can I help you find or report a lost item today?",
                    matches: []
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

                // If intent is general chat/greeting, return AI answer directly without database searching
                if (geminiAnalysis.isSearch === false) {
                    return res.json({
                        success: true,
                        response: conversationalResponse,
                        matches: []
                    });
                }
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

            // Build search conditions for items safely with escaped regex
            const escapeRegex = (str) => (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const orConditions = [];

            if (extracted.keywords && extracted.keywords.length > 0) {
                const keywordRegex = extracted.keywords.map(k => new RegExp(escapeRegex(k), 'i'));
                orConditions.push(
                    { itemName: { $in: keywordRegex } },
                    { description: { $in: keywordRegex } },
                    { location: { $in: keywordRegex } }
                );
            }

            if (extracted.color) {
                const safeColor = escapeRegex(extracted.color);
                orConditions.push(
                    { itemName: { $regex: new RegExp(safeColor, 'i') } },
                    { description: { $regex: new RegExp(safeColor, 'i') } }
                );
            }

            if (extracted.brand) {
                const safeBrand = escapeRegex(extracted.brand);
                orConditions.push(
                    { itemName: { $regex: new RegExp(safeBrand, 'i') } },
                    { description: { $regex: new RegExp(safeBrand, 'i') } }
                );
            }

            if (extracted.location) {
                const safeLoc = escapeRegex(extracted.location);
                orConditions.push(
                    { location: { $regex: new RegExp(safeLoc, 'i') } }
                );
            }

            // If no specific conditions extracted, search raw prompt in text fields
            if (orConditions.length === 0) {
                const words = userPrompt.split(/\s+/).filter(w => w.length > 2);
                words.forEach(w => {
                    const safeW = escapeRegex(w);
                    orConditions.push(
                        { itemName: { $regex: new RegExp(safeW, 'i') } },
                        { description: { $regex: new RegExp(safeW, 'i') } },
                        { location: { $regex: new RegExp(safeW, 'i') } }
                    );
                });
            }

            if (orConditions.length > 0) {
                queryConditions.$or = orConditions;
            }

            let foundItems = [];
            try {
                foundItems = await Item.find(queryConditions)
                    .populate('category')
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .maxTimeMS(2500);

                if (foundItems.length === 0) {
                    foundItems = await Item.find({ status: 'approved' })
                        .populate('category')
                        .sort({ createdAt: -1 })
                        .limit(3)
                        .maxTimeMS(2500);
                }
            } catch (dbErr) {
                console.warn('DB query in chatController timed out or erred, proceeding without DB items:', dbErr.message);
                foundItems = [];
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
                isSearch: true,
                response: conversationalResponse,
                matches: rankedMatches
            });

        } catch (error) {
            console.error('Chat controller error:', error);
            const userMsg = req.body ? (req.body.message || '') : '';
            const isGreeting = /^(hi|hello|hey|good|how|what|who|where|can|thanks|thank)/i.test(userMsg.trim());
            
            return res.json({
                success: true,
                isSearch: false,
                response: isGreeting 
                    ? "Hello! I am your Campus Lost & Found Assistant. How can I assist you today?"
                    : "I am ready to help! You can describe any lost or found item (or attach a photo using the camera button), and I will scan our campus database for matches.",
                matches: []
            });
        }
    }
};

module.exports = chatController;
