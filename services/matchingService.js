const { Item, User } = require('../models');
const emailService = require('./emailService');

/**
 * Item Matching Service
 * Automatically finds potential matches between lost and found items
 */

/**
 * Calculate similarity score between two items
 * @param {Object} lostItem - Lost item
 * @param {Object} foundItem - Found item
 * @returns {number} - Match score (0-100)
 */
const calculateMatchScore = (lostItem, foundItem) => {
    let score = 0;
    let maxScore = 0;

    // Category Match (25 points)
    maxScore += 25;
    if (lostItem.category && foundItem.category) {
        const lostCat = lostItem.category._id?.toString() || lostItem.category.toString();
        const foundCat = foundItem.category._id?.toString() || foundItem.category.toString();
        if (lostCat === foundCat) {
            score += 25;
        }
    }

    // Location Match (20 points)
    maxScore += 20;
    if (lostItem.location && foundItem.location) {
        const lostLoc = lostItem.location.toLowerCase();
        const foundLoc = foundItem.location.toLowerCase();
        
        if (lostLoc === foundLoc) {
            score += 20;
        } else if (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc)) {
            score += 15;
        } else {
            // Check for partial word matches
            const lostWords = lostLoc.split(/[\s-_]+/);
            const foundWords = foundLoc.split(/[\s-_]+/);
            const commonWords = lostWords.filter(w => foundWords.some(fw => fw.includes(w) || w.includes(fw)));
            if (commonWords.length > 0) {
                score += Math.min(10, commonWords.length * 5);
            }
        }
    }

    // Date Proximity (20 points)
    maxScore += 20;
    if (lostItem.dateLostFound && foundItem.dateLostFound) {
        const lostDate = new Date(lostItem.dateLostFound);
        const foundDate = new Date(foundItem.dateLostFound);
        const daysDiff = Math.abs((foundDate - lostDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
            score += 20;
        } else if (daysDiff <= 3) {
            score += 15;
        } else if (daysDiff <= 7) {
            score += 10;
        } else if (daysDiff <= 14) {
            score += 5;
        }
        // Found date should be on or after lost date
        if (foundDate < lostDate) {
            score -= 10; // Penalty if found before lost
        }
    }

    // Item Name Similarity (20 points)
    maxScore += 20;
    if (lostItem.itemName && foundItem.itemName) {
        const lostName = lostItem.itemName.toLowerCase();
        const foundName = foundItem.itemName.toLowerCase();
        
        if (lostName === foundName) {
            score += 20;
        } else {
            // Word matching
            const lostWords = lostName.split(/[\s-_,]+/).filter(w => w.length > 2);
            const foundWords = foundName.split(/[\s-_,]+/).filter(w => w.length > 2);
            
            let matchCount = 0;
            lostWords.forEach(lw => {
                if (foundWords.some(fw => fw.includes(lw) || lw.includes(fw))) {
                    matchCount++;
                }
            });
            
            if (matchCount > 0) {
                const matchRatio = matchCount / Math.max(lostWords.length, 1);
                score += Math.round(matchRatio * 20);
            }
        }
    }

    // Description Similarity (15 points)
    maxScore += 15;
    if (lostItem.description && foundItem.description) {
        const lostDesc = lostItem.description.toLowerCase();
        const foundDesc = foundItem.description.toLowerCase();
        
        // Extract significant words (exclude common words)
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'was', 'it', 'this', 'that', 'my', 'i'];
        
        const extractWords = (text) => {
            return text.split(/[\s-_,.:;!?]+/)
                .filter(w => w.length > 2 && !stopWords.includes(w));
        };
        
        const lostWords = extractWords(lostDesc);
        const foundWords = extractWords(foundDesc);
        
        let matchCount = 0;
        lostWords.forEach(lw => {
            if (foundWords.some(fw => fw === lw || (fw.length > 4 && lw.length > 4 && (fw.includes(lw) || lw.includes(fw))))) {
                matchCount++;
            }
        });
        
        if (matchCount > 0) {
            const matchRatio = matchCount / Math.max(lostWords.length, 1);
            score += Math.round(Math.min(matchRatio * 2, 1) * 15);
        }
    }

    // Calculate percentage
    return Math.round((score / maxScore) * 100);
};

/**
 * Find matches for a specific lost item
 * @param {Object} lostItem - Lost item to find matches for
 * @param {number} minScore - Minimum match score (default: 50)
 * @returns {Array} - Array of matches with scores
 */
const findMatchesForLostItem = async (lostItem, minScore = 50) => {
    try {
        // Find approved found items that are not claimed
        const foundItems = await Item.find({
            type: 'found',
            status: 'approved',
            _id: { $ne: lostItem._id }
        }).populate('category');

        const matches = [];

        for (const foundItem of foundItems) {
            const score = calculateMatchScore(lostItem, foundItem);
            if (score >= minScore) {
                matches.push({
                    item: foundItem,
                    score,
                    matchedAt: new Date()
                });
            }
        }

        // Sort by score descending
        matches.sort((a, b) => b.score - a.score);

        return matches;
    } catch (error) {
        console.error('Find matches error:', error);
        return [];
    }
};

/**
 * Find matches for a specific found item
 * @param {Object} foundItem - Found item to find matches for
 * @param {number} minScore - Minimum match score (default: 50)
 * @returns {Array} - Array of matches with scores
 */
const findMatchesForFoundItem = async (foundItem, minScore = 50) => {
    try {
        // Find approved lost items that are not claimed
        const lostItems = await Item.find({
            type: 'lost',
            status: 'approved',
            _id: { $ne: foundItem._id }
        }).populate('category').populate('reportedBy');

        const matches = [];

        for (const lostItem of lostItems) {
            const score = calculateMatchScore(lostItem, foundItem);
            if (score >= minScore) {
                matches.push({
                    item: lostItem,
                    score,
                    matchedAt: new Date()
                });
            }
        }

        // Sort by score descending
        matches.sort((a, b) => b.score - a.score);

        return matches;
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
