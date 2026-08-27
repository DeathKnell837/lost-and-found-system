const { Item, Category } = require('../models');
const geminiService = require('../services/geminiService');
const { calculateMatchScore } = require('../services/matchingService');

/**
 * Chat Controller for High-Speed Gemini AI Conversational Search
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

            let conversationHistory = [];
            if (req.body && req.body.history) {
                try {
                    conversationHistory = typeof req.body.history === 'string' ? JSON.parse(req.body.history) : req.body.history;
                    if (!Array.isArray(conversationHistory)) conversationHistory = [];
                } catch (e) { conversationHistory = []; }
            }

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
                // High-speed multimodal image analysis using Gemini Vision
                const analysis = await geminiService.analyzeUploadedImage(
                    imageFile.buffer,
                    imageFile.mimetype,
                    userPrompt
                );
                extracted = analysis.extracted || {};
                conversationalResponse = analysis.conversationalResponse;
            } else {
                // Low-latency text query analysis
                const geminiAnalysis = await geminiService.parseSearchQuery(userPrompt, conversationHistory);
                extracted = geminiAnalysis.extracted || {};
                conversationalResponse = geminiAnalysis.conversationalResponse;

                // If intent is general chat/greeting, return AI answer directly in <800ms
                if (geminiAnalysis.isSearch === false) {
                    return res.json({
                        success: true,
                        isSearch: false,
                        response: conversationalResponse,
                        matches: []
                    });
                }
            }

            // Query items database for approved candidates
            const queryConditions = { status: 'approved' };

            // Match category if detected
            if (extracted.category) {
                const matchedCategory = await Category.findOne({
                    name: { $regex: new RegExp(extracted.category.split(/\s+/)[0], 'i') }
                });
                if (matchedCategory) {
                    queryConditions.category = matchedCategory._id;
                }
            }

            // Build search conditions for items safely with escaped regex
            const escapeRegex = (str) => (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const orConditions = [];

            if (extracted.keywords && extracted.keywords.length > 0) {
                const filteredKeywords = extracted.keywords.filter(k => k && !['item', 'photo', 'picture', 'image', 'object', 'thing'].includes(k.toLowerCase()));
                if (filteredKeywords.length > 0) {
                    const keywordRegex = filteredKeywords.map(k => new RegExp(escapeRegex(k), 'i'));
                    orConditions.push(
                        { itemName: { $in: keywordRegex } },
                        { description: { $in: keywordRegex } },
                        { location: { $in: keywordRegex } }
                    );
                }
            }

            if (extracted.itemName && extracted.itemName !== 'Uploaded Item') {
                const safeName = escapeRegex(extracted.itemName);
                orConditions.push(
                    { itemName: { $regex: new RegExp(safeName, 'i') } },
                    { description: { $regex: new RegExp(safeName, 'i') } }
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

            // Fallback keywords from prompt
            if (orConditions.length === 0 && userPrompt) {
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
                    .select('+embedding')
                    .populate('category')
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .maxTimeMS(2000);

                if (foundItems.length === 0) {
                    foundItems = await Item.find({ status: 'approved' })
                        .select('+embedding')
                        .populate('category')
                        .sort({ createdAt: -1 })
                        .limit(6)
                        .maxTimeMS(2000);
                }
            } catch (dbErr) {
                console.warn('DB query in chatController timed out, proceeding:', dbErr.message);
                foundItems = [];
            }

            // Synthetic item for scoring
            const syntheticText = userPrompt || [
                extracted.itemName,
                extracted.category,
                extracted.color,
                extracted.brand,
                (extracted.keywords || []).join(' ')
            ].filter(Boolean).join(' ');

            const syntheticItem = {
                itemName: extracted.itemName || syntheticText || 'Item',
                description: extracted.description || syntheticText || 'Item query',
                location: extracted.location || '',
                dateLostFound: new Date(),
                category: queryConditions.category || null
            };

            const searchTokens = (userPrompt + ' ' + (extracted.keywords || []).join(' ') + ' ' + (extracted.itemName || '')).toLowerCase().split(/\s+/).filter(t => t.length > 2);

            const rankedMatches = foundItems.map((item) => {
                const scoreResult = calculateMatchScore(syntheticItem, item);
                let finalScore = scoreResult.total;

                const itemFullText = ((item.itemName || '') + ' ' + (item.description || '') + ' ' + (item.location || '')).toLowerCase();
                const hasDirectWordMatch = searchTokens.some(tok => itemFullText.includes(tok));
                if (hasDirectWordMatch) {
                    finalScore = Math.max(finalScore, 40);
                }

                return {
                    _id: item._id,
                    itemName: item.itemName,
                    type: item.type,
                    category: item.category ? item.category.name : 'Item',
                    location: item.location,
                    description: item.description,
                    imagePath: item.imagePath,
                    dateLostFound: item.dateLostFound ? new Date(item.dateLostFound).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
                    matchScore: finalScore,
                    hasDirectWordMatch
                };
            })
            .filter(m => m.matchScore >= 35 || m.hasDirectWordMatch)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 4);

            // Construct accurate conversational answer without overwriting Gemini's intelligence
            let finalResponse = conversationalResponse;

            if (imageFile) {
                const nameLabel = extracted.itemName || 'this item';
                if (rankedMatches.length > 0) {
                    finalResponse = conversationalResponse
                        ? `${conversationalResponse}\n\nI found **${rankedMatches.length} matching candidate(s)** in our campus records:`
                        : `I analyzed your photo: It looks like **${nameLabel}**. I found ${rankedMatches.length} possible matching record(s) in our campus database:`;
                } else {
                    finalResponse = conversationalResponse
                        ? `${conversationalResponse}\n\n*(Note: No direct matches were found in our current database records yet. You can file an official Lost or Found report at any time.)*`
                        : `I analyzed your photo: It appears to be **${nameLabel}**${extracted.description ? ` (${extracted.description})` : ''}. I checked our database, but no matching lost or found records were found yet.`;
                }
            } else {
                if (rankedMatches.length > 0) {
                    finalResponse = conversationalResponse 
                        ? `${conversationalResponse}\n\nHere are **${rankedMatches.length} matching record(s)** from our campus database:`
                        : `I found ${rankedMatches.length} matching item(s) in our campus records for "${userPrompt}":`;
                } else {
                    finalResponse = conversationalResponse 
                        ? `${conversationalResponse}`
                        : `I searched our campus database, but couldn't find any recorded items matching "${userPrompt}" yet. Would you like to file a Lost or Found report?`;
                }
            }

            return res.json({
                success: true,
                isSearch: true,
                response: finalResponse,
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

