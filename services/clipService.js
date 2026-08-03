const https = require('https');
const http = require('http');

/**
 * ============================================================
 * CLIP EMBEDDING SERVICE
 * ============================================================
 * 
 * Provides CLIP-based image similarity for the matching pipeline.
 * Uses Hugging Face Inference API with openai/clip-vit-base-patch32.
 * 
 * FUNCTIONS:
 * - getEmbedding(imageUrl) — Downloads image, sends to HF API, returns 512-float vector
 * - computeCosineSimilarity(vecA, vecB) — Pure math cosine similarity (0–1)
 * - getMatchReasoning(desc1, desc2, similarity) — Text-only Gemini call for match explanation
 * 
 * ============================================================
 */

const HF_API_KEY = (process.env.HUGGINGFACE_API_KEY || '').trim();
const HF_MODEL_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/openai/clip-vit-base-patch32';

// In-memory LRU embedding cache for image URLs to avoid duplicate API calls
const embeddingCache = new Map();
const MAX_CACHE_SIZE = 500;

const getCachedEmbedding = (url) => embeddingCache.get(url) || null;
const setCachedEmbedding = (url, embedding) => {
    if (!url || !embedding) return;
    if (embeddingCache.size >= MAX_CACHE_SIZE) {
        // Evict oldest entry
        const firstKey = embeddingCache.keys().next().value;
        if (firstKey) embeddingCache.delete(firstKey);
    }
    embeddingCache.set(url, embedding);
};

/**
 * Download image from URL into a raw Buffer with 10s timeout
 * @param {string} url - Image URL (Cloudinary or any HTTP/HTTPS)
 * @returns {Promise<Buffer|null>}
 */
const downloadImage = (url) => {
    return new Promise((resolve) => {
        if (!url || typeof url !== 'string') return resolve(null);

        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, (res) => {
            if (res.statusCode !== 200) {
                res.resume(); // Drain response
                return resolve(null);
            }
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', () => resolve(null));
        });

        req.setTimeout(10000, () => {
            req.destroy();
            resolve(null);
        });

        req.on('error', () => resolve(null));
    });
};

/**
 * Send image bytes to Hugging Face CLIP model and get embedding vector
 * @param {Buffer} imageBuffer - Raw image bytes
 * @param {number} retryCount - Internal retry counter
 * @returns {Promise<number[]|null>} - 512-float embedding array or null on failure
 */
const getEmbeddingFromBuffer = (imageBuffer, retryCount = 0) => {
    return new Promise((resolve) => {
        if (!HF_API_KEY) {
            console.warn('HUGGINGFACE_API_KEY not configured; skipping CLIP embedding.');
            return resolve(null);
        }
        if (!imageBuffer || imageBuffer.length === 0) {
            return resolve(null);
        }

        const urlObj = new URL(HF_MODEL_URL);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/octet-stream',
                'Content-Length': imageBuffer.length
            }
        };

        const req = https.request(options, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString('utf8');

                if (res.statusCode === 503 && retryCount < 1) {
                    // Model is loading — retry after backoff
                    let waitTime = 10000;
                    try {
                        const parsed = JSON.parse(body);
                        if (parsed.estimated_time) {
                            waitTime = Math.min(Math.ceil(parsed.estimated_time * 1000) + 1000, 30000);
                        }
                    } catch (e) { /* use default wait */ }
                    console.log(`CLIP model loading, retrying in ${waitTime / 1000}s...`);
                    setTimeout(() => {
                        getEmbeddingFromBuffer(imageBuffer, retryCount + 1).then(resolve);
                    }, waitTime);
                    return;
                }

                if (res.statusCode !== 200) {
                    console.error(`CLIP API error (${res.statusCode}):`, body.substring(0, 200));
                    return resolve(null);
                }

                try {
                    const parsed = JSON.parse(body);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        const embedding = Array.isArray(parsed[0]) ? parsed[0] : parsed;
                        if (embedding.length > 0 && typeof embedding[0] === 'number') {
                            return resolve(embedding);
                        }
                    }
                    console.error('Unexpected CLIP response shape:', JSON.stringify(parsed).substring(0, 200));
                    return resolve(null);
                } catch (parseErr) {
                    console.error('CLIP JSON parse error:', parseErr.message);
                    return resolve(null);
                }
            });
        });

        req.setTimeout(12000, () => {
            req.destroy();
            resolve(null);
        });

        req.on('error', (err) => {
            console.error('CLIP request error:', err.message);
            resolve(null);
        });

        req.write(imageBuffer);
        req.end();
    });
};

/**
 * Get CLIP embedding for an image given its URL (with LRU caching)
 * @param {string} imageUrl - Cloudinary (or other) image URL
 * @returns {Promise<number[]|null>} - 512-float embedding array or null
 */
const getEmbedding = async (imageUrl) => {
    if (!imageUrl) return null;
    const cached = getCachedEmbedding(imageUrl);
    if (cached) return cached;

    const buffer = await downloadImage(imageUrl);
    if (!buffer) {
        console.warn('Failed to download image for CLIP embedding:', imageUrl);
        return null;
    }
    const embedding = await getEmbeddingFromBuffer(buffer);
    if (embedding) {
        setCachedEmbedding(imageUrl, embedding);
    }
    return embedding;
};

/**
 * Compute cosine similarity between two embedding vectors
 * @param {number[]} vecA - First embedding vector
 * @param {number[]} vecB - Second embedding vector
 * @returns {number} - Similarity score between 0 and 1
 */
const computeCosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }

    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) return 0;

    // Clamp to [0, 1] range (cosine sim can be slightly negative for very different items)
    return Math.max(0, Math.min(1, dotProduct / (magA * magB)));
};

/**
 * Get text-only Gemini reasoning for why two items match
 * Only called for high-confidence matches (>70% cosine similarity)
 * Does NOT use vision — purely text descriptions
 * @param {string} desc1 - Description of item 1
 * @param {string} desc2 - Description of item 2
 * @param {number} similarity - Cosine similarity score (0–1)
 * @returns {Promise<string>} - Human-readable reasoning string
 */
const getMatchReasoning = async (desc1, desc2, similarity) => {
    const percentScore = Math.round(similarity * 100);
    const defaultReasoning = `Visual similarity: ${percentScore}%. Items appear visually similar based on AI image analysis.`;

    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        if (!apiKey) return defaultReasoning;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are a Campus Lost & Found AI Assistant. Two items have been visually compared by an AI image model and scored ${percentScore}% similar.

Item 1: "${desc1}"
Item 2: "${desc2}"

Write a concise 1-2 sentence explanation for why these items likely match (or don't), based on the descriptions and the ${percentScore}% visual similarity score. Be specific about shared characteristics (color, brand, type, condition). Return ONLY the reasoning text, no JSON.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        return text || defaultReasoning;
    } catch (err) {
        console.error('Gemini reasoning fallback:', err.message);
        return defaultReasoning;
    }
};

module.exports = {
    getEmbedding,
    getEmbeddingFromBuffer,
    computeCosineSimilarity,
    getMatchReasoning
};
