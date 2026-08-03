const { Item, User } = require('../models');
const emailService = require('./emailService');
const clipService = require('./clipService');

/**
 * Item Matching Service
 * Automatically finds potential matches between lost and found items
 */

/**
 * Common color and brand keywords for matching bonus
 */
const colorKeywords = ['red', 'blue', 'green', 'black', 'white', 'pink', 'purple', 'orange', 'yellow', 'brown', 'gray', 'grey', 'silver', 'gold', 'navy', 'beige', 'maroon', 'teal', 'cyan'];
const brandKeywords = ['apple', 'samsung', 'iphone', 'ipad', 'macbook', 'dell', 'hp', 'lenovo', 'sony', 'nike', 'adidas', 'jansport', 'north face', 'toyota', 'honda', 'ray-ban', 'gucci', 'louis vuitton', 'casio', 'seiko', 'fossil', 'anker', 'xiaomi', 'huawei', 'oppo', 'vivo', 'realme', 'asus'];

/**
 * Extract keywords from text
 */
const extractKeywords = (text) => {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'was', 'it', 'this', 'that', 'my', 'i', 'has', 'have', 'had', 'been', 'are', 'were', 'be', 'near', 'from'];
    return text.toLowerCase().split(/[\s\-_,.:;!?()]+/)
        .filter(w => w.length > 1 && !stopWords.includes(w));
};

/**
 * Calculate detailed match score between two items
 * @param {Object} lostItem - Lost item
 * @param {Object} foundItem - Found item
 * @returns {Object} - { total, breakdown: { category, location, date, name, description, keywords }, highlights }
 */
const calculateMatchScore = (lostItem, foundItem) => {
    const breakdown = { category: 0, location: 0, date: 0, name: 0, description: 0, keywords: 0 };
    const highlights = [];

    // Category Match (25 points)
    if (lostItem.category && foundItem.category) {
        const lostCat = lostItem.category._id?.toString() || lostItem.category.toString();
        const foundCat = foundItem.category._id?.toString() || foundItem.category.toString();
        if (lostCat === foundCat) {
            breakdown.category = 25;
            highlights.push('Same category');
        }
    }

    // Location Match (20 points)
    if (lostItem.location && foundItem.location) {
        const lostLoc = lostItem.location.toLowerCase();
        const foundLoc = foundItem.location.toLowerCase();

        if (lostLoc === foundLoc) {
            breakdown.location = 20;
            highlights.push('Exact location match');
        } else if (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc)) {
            breakdown.location = 15;
            highlights.push('Similar location');
        } else {
            const lostWords = lostLoc.split(/[\s\-_]+/);
            const foundWords = foundLoc.split(/[\s\-_]+/);
            const commonWords = lostWords.filter(w => foundWords.some(fw => fw.includes(w) || w.includes(fw)));
            if (commonWords.length > 0) {
                breakdown.location = Math.min(10, commonWords.length * 5);
                highlights.push('Partial location match');
            }
        }
    }

    // Date Proximity (20 points)
    if (lostItem.dateLostFound && foundItem.dateLostFound) {
        const lostDate = new Date(lostItem.dateLostFound);
        const foundDate = new Date(foundItem.dateLostFound);
        const daysDiff = Math.abs((foundDate - lostDate) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
            breakdown.date = 20;
            highlights.push('Same day');
        } else if (daysDiff <= 3) {
            breakdown.date = 15;
            highlights.push('Within 3 days');
        } else if (daysDiff <= 7) {
            breakdown.date = 10;
            highlights.push('Within a week');
        } else if (daysDiff <= 14) {
            breakdown.date = 5;
        }
        if (foundDate < lostDate) {
            breakdown.date = Math.max(0, breakdown.date - 10);
        }
    }

    // Item Name Similarity (20 points)
    if (lostItem.itemName && foundItem.itemName) {
        const lostName = lostItem.itemName.toLowerCase();
        const foundName = foundItem.itemName.toLowerCase();

        if (lostName === foundName) {
            breakdown.name = 20;
            highlights.push('Exact name match');
        } else {
            const lostWords = lostName.split(/[\s\-_,]+/).filter(w => w.length > 2);
            const foundWords = foundName.split(/[\s\-_,]+/).filter(w => w.length > 2);
            let matchCount = 0;
            const matchedWords = [];
            lostWords.forEach(lw => {
                const match = foundWords.find(fw => fw.includes(lw) || lw.includes(fw));
                if (match) {
                    matchCount++;
                    matchedWords.push(lw);
                }
            });
            if (matchCount > 0) {
                const matchRatio = matchCount / Math.max(lostWords.length, 1);
                breakdown.name = Math.round(matchRatio * 20);
                if (matchedWords.length > 0) {
                    highlights.push('Name keywords: ' + matchedWords.join(', '));
                }
            }
        }
    }

    // Description Similarity (15 points)
    if (lostItem.description && foundItem.description) {
        const lostWords = extractKeywords(lostItem.description);
        const foundWords = extractKeywords(foundItem.description);

        let matchCount = 0;
        lostWords.forEach(lw => {
            if (foundWords.some(fw => fw === lw || (fw.length > 4 && lw.length > 4 && (fw.includes(lw) || lw.includes(fw))))) {
                matchCount++;
            }
        });

        if (matchCount > 0) {
            const matchRatio = matchCount / Math.max(lostWords.length, 1);
            breakdown.description = Math.round(Math.min(matchRatio * 2, 1) * 15);
        }
    }

    // Color & Brand Keyword Bonus (up to 10 extra points)
    const allLostText = ((lostItem.itemName || '') + ' ' + (lostItem.description || '')).toLowerCase();
    const allFoundText = ((foundItem.itemName || '') + ' ' + (foundItem.description || '')).toLowerCase();

    // Check color matches
    const lostColors = colorKeywords.filter(c => allLostText.includes(c));
    const foundColors = colorKeywords.filter(c => allFoundText.includes(c));
    const commonColors = lostColors.filter(c => foundColors.includes(c));
    if (commonColors.length > 0) {
        breakdown.keywords += Math.min(5, commonColors.length * 3);
        highlights.push('Color match: ' + commonColors.join(', '));
    }

    // Check brand matches
    const lostBrands = brandKeywords.filter(b => allLostText.includes(b));
    const foundBrands = brandKeywords.filter(b => allFoundText.includes(b));
    const commonBrands = lostBrands.filter(b => foundBrands.includes(b));
    if (commonBrands.length > 0) {
        breakdown.keywords += Math.min(5, commonBrands.length * 5);
        highlights.push('Brand match: ' + commonBrands.join(', '));
    }

    // Calculate total (max is 110 with bonus, normalize to 100)
    const rawTotal = breakdown.category + breakdown.location + breakdown.date + breakdown.name + breakdown.description + breakdown.keywords;
    const total = Math.min(100, rawTotal);

    return { total, breakdown, highlights };
};

/**
 * Find matches for a specific lost item using rule-based + Gemini AI shortlist comparison
 * @param {Object} lostItem - Lost item to find matches for
 * @param {number} minScore - Minimum match score (default: 50)
 * @returns {Array} - Array of matches with combined scores and AI reasoning
 */
const findMatchesForLostItem = async (lostItem, minScore = 50) => {
    try {
        const foundItems = await Item.find({
            type: 'found',
            status: 'approved',
            _id: { $ne: lostItem._id }
        }).select('+embedding').populate('category');

        const initialCandidates = [];
        const threshold = Math.max(30, minScore - 15);

        for (const foundItem of foundItems) {
            const result = calculateMatchScore(lostItem, foundItem);
            if (result.total >= threshold) {
                initialCandidates.push({
                    item: foundItem,
                    ruleScore: result.total,
                    breakdown: result.breakdown,
                    highlights: result.highlights
                });
            }
        }

        // Sort by rule score and take top 5 shortlist for Gemini AI evaluation
        initialCandidates.sort((a, b) => b.ruleScore - a.ruleScore);
        const shortlist = initialCandidates.slice(0, 5);

        const finalMatches = [];

        // Load the lost item's embedding (may need on-the-fly computation)
        let lostEmbedding = lostItem.embedding || null;
        if (!lostEmbedding && lostItem.imagePath) {
            try {
                lostEmbedding = await clipService.getEmbedding(lostItem.imagePath);
            } catch (e) { /* proceed without embedding */ }
        }

        for (const candidate of shortlist) {
            let aiScore = candidate.ruleScore;
            let reasoning = 'Matched based on item properties, location, and description.';

            // CLIP cosine similarity (embedding-based visual comparison)
            let clipSimilarity = 0;
            try {
                let foundEmbedding = candidate.item.embedding || null;
                if (!foundEmbedding && candidate.item.imagePath) {
                    foundEmbedding = await clipService.getEmbedding(candidate.item.imagePath);
                }
                if (lostEmbedding && foundEmbedding) {
                    clipSimilarity = clipService.computeCosineSimilarity(lostEmbedding, foundEmbedding);
                    aiScore = Math.round(clipSimilarity * 100);
                }
            } catch (err) {
                console.error('CLIP similarity fallback:', err.message);
            }

            // For high-confidence matches (>70%), get text-only Gemini reasoning
            if (clipSimilarity > 0.70) {
                try {
                    const desc1 = `${lostItem.itemName}: ${lostItem.description}`;
                    const desc2 = `${candidate.item.itemName}: ${candidate.item.description}`;
                    reasoning = await clipService.getMatchReasoning(desc1, desc2, clipSimilarity);
                } catch (err) {
                    reasoning = `Visual similarity: ${Math.round(clipSimilarity * 100)}%. Items appear visually similar.`;
                }
            }

            const combinedScore = Math.round((candidate.ruleScore * 0.55) + (aiScore * 0.45));

            if (combinedScore >= minScore) {
                finalMatches.push({
                    item: candidate.item,
                    score: combinedScore,
                    ruleScore: candidate.ruleScore,
                    aiScore,
                    reasoning,
                    breakdown: candidate.breakdown,
                    highlights: candidate.highlights,
                    matchedAt: new Date()
                });
            }
        }

        finalMatches.sort((a, b) => b.score - a.score);
        return finalMatches;
    } catch (error) {
        console.error('Find matches error:', error);
        return [];
    }
};

/**
 * Find matches for a specific found item using rule-based + Gemini AI shortlist comparison
 * @param {Object} foundItem - Found item to find matches for
 * @param {number} minScore - Minimum match score (default: 50)
 * @returns {Array} - Array of matches with combined scores and AI reasoning
 */
const findMatchesForFoundItem = async (foundItem, minScore = 50) => {
    try {
        const lostItems = await Item.find({
            type: 'lost',
            status: 'approved',
            _id: { $ne: foundItem._id }
        }).select('+embedding').populate('category').populate('reportedBy');

        const initialCandidates = [];
        const threshold = Math.max(30, minScore - 15);

        for (const lostItem of lostItems) {
            const result = calculateMatchScore(lostItem, foundItem);
            if (result.total >= threshold) {
                initialCandidates.push({
                    item: lostItem,
                    ruleScore: result.total,
                    breakdown: result.breakdown,
                    highlights: result.highlights
                });
            }
        }

        // Sort by rule score and take top 5 shortlist for Gemini AI evaluation
        initialCandidates.sort((a, b) => b.ruleScore - a.ruleScore);
        const shortlist = initialCandidates.slice(0, 5);

        const finalMatches = [];

        // Load the found item's embedding (may need on-the-fly computation)
        let foundEmbedding = foundItem.embedding || null;
        if (!foundEmbedding && foundItem.imagePath) {
            try {
                foundEmbedding = await clipService.getEmbedding(foundItem.imagePath);
            } catch (e) { /* proceed without embedding */ }
        }

        for (const candidate of shortlist) {
            let aiScore = candidate.ruleScore;
            let reasoning = 'Matched based on item properties, location, and description.';

            // CLIP cosine similarity (embedding-based visual comparison)
            let clipSimilarity = 0;
            try {
                let lostEmbedding = candidate.item.embedding || null;
                if (!lostEmbedding && candidate.item.imagePath) {
                    lostEmbedding = await clipService.getEmbedding(candidate.item.imagePath);
                }
                if (foundEmbedding && lostEmbedding) {
                    clipSimilarity = clipService.computeCosineSimilarity(foundEmbedding, lostEmbedding);
                    aiScore = Math.round(clipSimilarity * 100);
                }
            } catch (err) {
                console.error('CLIP similarity fallback:', err.message);
            }

            // For high-confidence matches (>70%), get text-only Gemini reasoning
            if (clipSimilarity > 0.70) {
                try {
                    const desc1 = `${candidate.item.itemName}: ${candidate.item.description}`;
                    const desc2 = `${foundItem.itemName}: ${foundItem.description}`;
                    reasoning = await clipService.getMatchReasoning(desc1, desc2, clipSimilarity);
                } catch (err) {
                    reasoning = `Visual similarity: ${Math.round(clipSimilarity * 100)}%. Items appear visually similar.`;
                }
            }

            const combinedScore = Math.round((candidate.ruleScore * 0.55) + (aiScore * 0.45));

            if (combinedScore >= minScore) {
                finalMatches.push({
                    item: candidate.item,
                    score: combinedScore,
                    ruleScore: candidate.ruleScore,
                    aiScore,
                    reasoning,
                    breakdown: candidate.breakdown,
                    highlights: candidate.highlights,
                    matchedAt: new Date()
                });
            }
        }

        finalMatches.sort((a, b) => b.score - a.score);
        return finalMatches;
    } catch (error) {
        console.error('Find matches error:', error);
        return [];
    }
};

/**
 * Process matches and send notifications
 * @param {Object} item - Item to process matches for
 */
const processMatchesAndNotify = async (item) => {
    try {
        const populatedItem = await Item.findById(item._id)
            .populate('category')
            .populate('reportedBy');

        if (!populatedItem) return;

        let matches = [];

        if (populatedItem.type === 'lost') {
            matches = await findMatchesForLostItem(populatedItem, 60);

            // Notify the owner of the lost item about potential matches
            if (matches.length > 0 && populatedItem.reportedBy) {
                const user = await User.findById(populatedItem.reportedBy._id || populatedItem.reportedBy);
                if (user && user.notificationPreferences?.emailOnMatch !== false) {
                    // Send email about top match
                    const topMatch = matches[0];
                    await emailService.sendMatchFoundEmail(
                        user,
                        populatedItem,
                        topMatch.item,
                        topMatch.score
                    );
                }
            }
        } else {
            matches = await findMatchesForFoundItem(populatedItem, 60);

            // Notify owners of matching lost items
            for (const match of matches.slice(0, 3)) { // Top 3 matches
                const lostItem = match.item;
                if (lostItem.reportedBy) {
                    const user = await User.findById(lostItem.reportedBy._id || lostItem.reportedBy);
                    if (user && user.notificationPreferences?.emailOnMatch !== false) {
                        await emailService.sendMatchFoundEmail(
                            user,
                            lostItem,
                            populatedItem,
                            match.score
                        );
                    }
                }
            }
        }

        // Store matches in database
        if (matches.length > 0) {
            await Item.findByIdAndUpdate(item._id, {
                potentialMatches: matches.slice(0, 10).map(m => ({
                    item: m.item._id,
                    score: m.score,
                    reasoning: m.reasoning || '',
                    matchedAt: m.matchedAt
                }))
            });
        }

        return matches;
    } catch (error) {
        console.error('Process matches error:', error);
        return [];
    }
};

/**
 * Get all potential matches for an item
 * @param {string} itemId - Item ID
 * @returns {Array} - Array of populated matches
 */
const getItemMatches = async (itemId) => {
    try {
        const item = await Item.findById(itemId)
            .populate('category')
            .populate({
                path: 'potentialMatches.item',
                populate: { path: 'category' }
            });

        if (!item) return [];

        // Also calculate fresh matches
        let freshMatches = [];
        if (item.type === 'lost') {
            freshMatches = await findMatchesForLostItem(item, 40);
        } else {
            freshMatches = await findMatchesForFoundItem(item, 40);
        }

        return freshMatches;
    } catch (error) {
        console.error('Get item matches error:', error);
        return [];
    }
};

/**
 * Run matching algorithm for all approved items
 * Can be used as a scheduled job
 */
const runBatchMatching = async () => {
    try {
        console.log('Starting batch matching...');

        const items = await Item.find({
            status: 'approved'
        }).populate('category');

        let totalMatches = 0;

        for (const item of items) {
            const matches = await processMatchesAndNotify(item);
            totalMatches += matches.length;
        }

        console.log(`Batch matching complete. Found ${totalMatches} potential matches.`);
        return totalMatches;
    } catch (error) {
        console.error('Batch matching error:', error);
        return 0;
    }
};

module.exports = {
    calculateMatchScore,
    findMatchesForLostItem,
    findMatchesForFoundItem,
    processMatchesAndNotify,
    getItemMatches,
    runBatchMatching
};
