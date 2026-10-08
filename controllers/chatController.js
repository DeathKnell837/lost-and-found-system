const { Item, Category } = require('../models');
const geminiService = require('../services/geminiService');

// Stop words and generic filler tokens in English and Filipino
const STOP_WORDS = new Set([
    // English query / filler words
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'over', 'after', 'is', 'am', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'should',
    'would', 'will', 'shall', 'may', 'might', 'must', 'i', 'me', 'my', 'myself', 'we', 'our',
    'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
    'she', 'her', 'hers', 'it', 'its', 'they', 'them', 'their', 'theirs', 'what', 'which',
    'who', 'whom', 'this', 'that', 'these', 'those', 'there', 'here', 'when', 'where', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'item', 'items',
    'lost', 'found', 'find', 'finding', 'anyone', 'someone', 'somebody', 'anybody', 'look',
    'looking', 'search', 'searching', 'please', 'help', 'know', 'tell', 'saw', 'see', 'seen',
    'turned', 'surrendered', 'claimed', 'report', 'reported', 'campus', 'ndmc', 'college',
    'give', 'back', 'get', 'got', 'has', 'photo', 'picture', 'image', 'pic', 'object',
    'thing', 'things', 'yesterday', 'today', 'morning', 'afternoon', 'evening', 'room', 'floor',
    // Filipino / Taglish
    'ang', 'mga', 'ng', 'sa', 'kay', 'kina', 'ni', 'nila', 'ko', 'mo', 'niya', 'namin', 'ninyo',
    'ba', 'po', 'opo', 'kasi', 'nga', 'din', 'rin', 'lang', 'naman', 'pala', 'sana', 'kaya',
    'may', 'mayroon', 'meron', 'wala', 'walang', 'nawala', 'nawawala', 'nakita', 'nakakita',
    'hanap', 'naghahanap', 'hinahanap', 'saan', 'kailan', 'ano', 'sino', 'paano', 'paki',
    'kuha', 'basta', 'yun', 'ito', 'iyan', 'iyon', 'kuya', 'ate', 'bale'
]);

// Filipino / Taglish aliases mapped to standard terms
const TAGALOG_ITEM_MAP = {
    'payong': 'umbrella',
    'pitaka': 'wallet',
    'pitaca': 'wallet',
    'dompet': 'wallet',
    'susi': 'key',
    'salamin': 'glasses',
    'tubig': 'tumbler',
    'botelya': 'bottle',
    'pera': 'wallet',
    'damit': 'jacket',
    'dyaket': 'jacket',
    'sapatos': 'shoes',
    'tsinelas': 'slippers',
    'selpon': 'phone',
    'telepono': 'phone',
    'kwaderno': 'notebook',
    'libro': 'book',
    'aklat': 'book',
    'relo': 'watch',
    'calcu': 'calculator'
};

const KNOWN_COLORS = new Set([
    'black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple',
    'orange', 'brown', 'gray', 'grey', 'silver', 'gold', 'navy', 'maroon',
    'beige', 'teal', 'cyan'
]);

const KNOWN_CAMPUS_LOCATIONS = new Set([
    'library', 'canteen', 'gym', 'gymnasium', 'court', 'admin', 'primera',
    'mongeau', 'eugene', 'clinic', 'registrar', 'cashier', 'quadrangle',
    'chapel', 'dormitory', 'farm', 'garage', 'rotonda', 'lounge', 'lab',
    'laboratory', 'facade', 'gate', 'kiosk'
]);

const escapeRegex = (str) => (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const extractCleanTokens = (str) => {
    if (!str || typeof str !== 'string') return [];
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .map(w => TAGALOG_ITEM_MAP[w] || w)
        .filter(w => w.length >= 2 && !STOP_WORDS.has(w));
};

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

                // If intent is general chat/greeting, return AI answer directly
                if (geminiAnalysis.isSearch === false) {
                    return res.json({
                        success: true,
                        isSearch: false,
                        response: conversationalResponse,
                        matches: []
                    });
                }
            }

            // Extract item tokens (nouns/distinct descriptors)
            let itemTokens = [];
            if (extracted.itemName && extracted.itemName !== 'Uploaded Item') {
                itemTokens.push(...extractCleanTokens(extracted.itemName));
            }
            if (Array.isArray(extracted.keywords)) {
                extracted.keywords.forEach(kw => {
                    itemTokens.push(...extractCleanTokens(kw));
                });
            }

            // Isolate location and color to prevent false item-name matches
            const locTokens = extractCleanTokens(extracted.location);
            const colorToken = (extracted.color || '').toLowerCase();

            itemTokens = itemTokens.filter(tok =>
                !locTokens.includes(tok) &&
                tok !== colorToken &&
                !KNOWN_COLORS.has(tok) &&
                !KNOWN_CAMPUS_LOCATIONS.has(tok)
            );

            // Fallback tokens from prompt if no explicit item tokens detected
            if (itemTokens.length === 0 && userPrompt) {
                const promptTokens = extractCleanTokens(userPrompt);
                itemTokens = promptTokens.filter(tok =>
                    !locTokens.includes(tok) &&
                    tok !== colorToken &&
                    !KNOWN_COLORS.has(tok) &&
                    !KNOWN_CAMPUS_LOCATIONS.has(tok)
                );
            }

            // Deduplicate
            itemTokens = [...new Set(itemTokens)];
            const hasSpecificItemTarget = itemTokens.length > 0;

            // Formulate database search query
            const queryConditions = { status: 'approved' };

            // Determine if user is searching for found items or lost items
            const isLookingForFound = extracted.queryType === 'lost' || /lost|nawala|hanap|find/i.test(userPrompt);
            const isLookingForLost = extracted.queryType === 'found' || /found|nakita|surrender|turn\s*in/i.test(userPrompt);

            if (isLookingForFound && !isLookingForLost) {
                queryConditions.type = 'found';
            } else if (isLookingForLost && !isLookingForFound) {
                queryConditions.type = 'lost';
            }

            if (hasSpecificItemTarget) {
                // CANDIDATE MUST MATCH THE REQUESTED OBJECT!
                // An umbrella query will NEVER match an iPhone or calculator.
                const itemRegexes = itemTokens.map(tok => new RegExp(escapeRegex(tok), 'i'));
                queryConditions.$or = [
                    { itemName: { $in: itemRegexes } },
                    { description: { $in: itemRegexes } }
                ];
            } else if (extracted.location) {
                // User asked a general location query: e.g. "What was found in the library?"
                queryConditions.location = { $regex: new RegExp(escapeRegex(extracted.location), 'i') };
            } else if (extracted.category) {
                const matchedCategory = await Category.findOne({
                    name: { $regex: new RegExp(extracted.category.split(/\s+/)[0], 'i') }
                });
                if (matchedCategory) {
                    queryConditions.category = matchedCategory._id;
                }
            }

            let foundItems = [];
            try {
                foundItems = await Item.find(queryConditions)
                    .select('+embedding')
                    .populate('category')
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .maxTimeMS(2000);

                // If user specified type='found' but 0 items matched, try without type restriction
                // BUT STILL STRICTLY REQUIRE THE REQUESTED ITEM!
                if (foundItems.length === 0 && queryConditions.type && hasSpecificItemTarget) {
                    const fallbackConditions = { ...queryConditions };
                    delete fallbackConditions.type;
                    foundItems = await Item.find(fallbackConditions)
                        .select('+embedding')
                        .populate('category')
                        .sort({ createdAt: -1 })
                        .limit(10)
                        .maxTimeMS(2000);
                }
            } catch (dbErr) {
                console.warn('DB query in chatController timed out or error:', dbErr.message);
                foundItems = [];
            }

            // High-precision relevance scoring
            const rankedMatches = foundItems
                .map((item) => {
                    const itemFullName = (item.itemName || '').toLowerCase();
                    const itemFullDesc = (item.description || '').toLowerCase();
                    const itemLocation = (item.location || '').toLowerCase();
                    const itemCatName = (item.category?.name || '').toLowerCase();

                    let matchScore = 0;

                    if (hasSpecificItemTarget) {
                        const nameMatches = itemTokens.filter(tok => itemFullName.includes(tok));
                        const descMatches = itemTokens.filter(tok => itemFullDesc.includes(tok));

                        if (nameMatches.length > 0) {
                            matchScore += 50 + (nameMatches.length * 5);
                        } else if (descMatches.length > 0) {
                            matchScore += 30 + (descMatches.length * 5);
                        } else {
                            // Does not mention target item at all -> Discard!
                            return null;
                        }

                        // Bonus for location match
                        if (extracted.location && itemLocation.includes(extracted.location.toLowerCase())) {
                            matchScore += 20;
                        }

                        // Bonus for color match
                        if (extracted.color && (itemFullName.includes(extracted.color.toLowerCase()) || itemFullDesc.includes(extracted.color.toLowerCase()))) {
                            matchScore += 10;
                        }

                        // Bonus for brand match
                        if (extracted.brand && (itemFullName.includes(extracted.brand.toLowerCase()) || itemFullDesc.includes(extracted.brand.toLowerCase()))) {
                            matchScore += 10;
                        }

                        // Bonus for category match
                        if (extracted.category && itemCatName.includes(extracted.category.toLowerCase().split(/\s+/)[0])) {
                            matchScore += 10;
                        }
                    } else {
                        // General inquiry without specific item name (e.g. "What was found in the library?")
                        matchScore = 50;
                        if (extracted.location && itemLocation.includes(extracted.location.toLowerCase())) {
                            matchScore += 30;
                        }
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
                        matchScore: Math.min(100, Math.max(30, matchScore))
                    };
                })
                .filter(Boolean)
                .filter(m => m.matchScore >= (hasSpecificItemTarget ? 45 : 30))
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 4);

            // Construct accurate, intelligent conversational answer
            let finalResponse = conversationalResponse;
            const targetLabel = extracted.itemName || (itemTokens.length > 0 ? itemTokens.join(' ') : 'item');
            const locLabel = extracted.location ? ` near or at the ${extracted.location}` : '';

            if (imageFile) {
                if (rankedMatches.length > 0) {
                    finalResponse = conversationalResponse
                        ? `${conversationalResponse}\n\nI found **${rankedMatches.length} matching candidate(s)** in our campus records:`
                        : `I analyzed your photo: It looks like **${targetLabel}**. I found ${rankedMatches.length} possible matching record(s) in our campus database:`;
                } else {
                    finalResponse = conversationalResponse
                        ? `${conversationalResponse}\n\n*(Note: No direct matches were found in our database records yet. You can file an official Lost or Found report at any time.)*`
                        : `I analyzed your photo: It appears to be **${targetLabel}**${extracted.description ? ` (${extracted.description})` : ''}. I checked our database, but no matching lost or found records were found yet.`;
                }
            } else {
                if (rankedMatches.length > 0) {
                    finalResponse = conversationalResponse 
                        ? `${conversationalResponse}\n\nHere are **${rankedMatches.length} matching record(s)** from our campus database:`
                        : `I found ${rankedMatches.length} matching item(s) in our campus records for "${userPrompt}":`;
                } else {
                    if (hasSpecificItemTarget) {
                        finalResponse = conversationalResponse
                            ? `${conversationalResponse}\n\n*(No matching database records found for **${targetLabel}**${locLabel} yet. Would you like to file an official report?)*`
                            : `I searched our campus database for **${targetLabel}**${locLabel}, but no matching records are currently listed. Would you like to submit an official Lost Item report so campus security can notify you if someone surrenders it?`;
                    } else {
                        finalResponse = conversationalResponse 
                            ? `${conversationalResponse}`
                            : `I searched our campus database, but couldn't find any recorded items matching your query. Would you like to file a Lost or Found report?`;
                    }
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
