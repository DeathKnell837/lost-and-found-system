const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');
const http = require('http');

// Initialize Gemini API Client
const apiKey = process.env.GEMINI_API_KEY || '';
let genAI = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
} else {
    console.warn('GEMINI_API_KEY is not set in environment variables.');
}

/**
 * Helper to download image from URL into inline Data Part for Gemini
 */
const fetchImagePart = async (url) => {
    return new Promise((resolve, reject) => {
        if (!url || typeof url !== 'string') return resolve(null);
        
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            if (res.statusCode !== 200) {
                return resolve(null);
            }
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const mimeType = res.headers['content-type'] || 'image/jpeg';
                resolve({
                    inlineData: {
                        data: buffer.toString('base64'),
                        mimeType
                    }
                });
            });
            res.on('error', () => resolve(null));
        }).on('error', () => resolve(null));
    });
};

/**
 * Compare two items visually using Gemini Flash vision capability
 * @param {string} url1 - Cloudinary URL for item 1
 * @param {string} url2 - Cloudinary URL for item 2
 * @param {string} desc1 - Description of item 1
 * @param {string} desc2 - Description of item 2
 * @returns {Promise<Object>} - { similarityScore: number (0-100), reasoning: string }
 */
const compareImages = async (url1, url2, desc1 = '', desc2 = '') => {
    if (!genAI) {
        return {
            similarityScore: 50,
            reasoning: 'Gemini API Key not configured; relying on rule-based score.'
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const parts = [];

        // Fetch image parts if URLs exist
        const imgPart1 = url1 ? await fetchImagePart(url1) : null;
        const imgPart2 = url2 ? await fetchImagePart(url2) : null;

        let prompt = `You are an AI assistant for a Campus Lost and Found system.
Your task is to compare two items (from images and text descriptions) and determine if they are likely the same physical item lost and found by different people.

Item 1 Description: "${desc1}"
Item 2 Description: "${desc2}"

`;

        if (imgPart1 && imgPart2) {
            prompt += `I have provided images for both Item 1 and Item 2. Compare their visual appearance, color, brand, material, condition, and distinctive markings.`;
            parts.push(imgPart1);
            parts.push(imgPart2);
        } else if (imgPart1) {
            prompt += `Image 1 is provided above for Item 1. Compare it with the description of Item 2.`;
            parts.push(imgPart1);
        } else if (imgPart2) {
            prompt += `Image 2 is provided above for Item 2. Compare it with the description of Item 1.`;
            parts.push(imgPart2);
        } else {
            prompt += `No images are available. Compare the two textual descriptions for item characteristics.`;
        }

        prompt += `\n\nReturn ONLY a valid JSON object in this exact format (no markdown codeblock wrapper):
{
  "similarityScore": <integer between 0 and 100>,
  "reasoning": "<concise 1-2 sentence plain language explanation highlighting why they match or differ>"
}`;

        parts.push(prompt);

        const result = await model.generateContent(parts);
        const responseText = result.response.text().trim();
        
        // Clean potential markdown wrappers
        const cleanedJsonText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonResult = JSON.parse(cleanedJsonText);

        return {
            similarityScore: Math.min(100, Math.max(0, parseInt(jsonResult.similarityScore) || 50)),
            reasoning: jsonResult.reasoning || 'Visual comparison completed.'
        };
    } catch (error) {
        console.error('Gemini image comparison error:', error.message);
        return {
            similarityScore: 50,
            reasoning: 'Visual comparison unavailable due to API error.'
        };
    }
};

/**
 * Conversational query parser and responder
 * @param {string} userMessage - User search description or chat prompt
 * @returns {Promise<Object>} - { extracted: { category, color, brand, location, keywords }, conversationalResponse: string }
 */
const parseSearchQuery = async (userMessage) => {
    if (!genAI) {
        return {
            extracted: { keywords: userMessage.split(/\s+/) },
            conversationalResponse: `Here are the top matches I found for "${userMessage}":`
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `You are a helpful and polite Campus Lost and Found AI Assistant.
A user says: "${userMessage}"

Analyze their message and:
1. Extract key attributes: category (e.g. Electronics, Clothing, Accessories, Keys, Documents, Bags, Books, Other), color, brand, location, and key descriptive words.
2. Formulate a warm, helpful 1-2 sentence response acknowledging their query and confirming what you are looking for in the campus database.

Return ONLY a valid JSON object in this exact format (no markdown codeblock wrapper):
{
  "category": "<extracted category or empty string>",
  "color": "<extracted color or empty string>",
  "brand": "<extracted brand or empty string>",
  "location": "<extracted location or empty string>",
  "keywords": ["<keyword1>", "<keyword2>"],
  "conversationalResponse": "<warm 1-2 sentence response>"
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        const cleanedJsonText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonResult = JSON.parse(cleanedJsonText);

        return {
            extracted: {
                category: jsonResult.category || '',
                color: jsonResult.color || '',
                brand: jsonResult.brand || '',
                location: jsonResult.location || '',
                keywords: Array.isArray(jsonResult.keywords) ? jsonResult.keywords : []
            },
            conversationalResponse: jsonResult.conversationalResponse || `I searched our database for "${userMessage}" and found these potential items:`
        };
    } catch (error) {
        console.error('Gemini query parse error:', error.message);
        return {
            extracted: { keywords: userMessage.split(/\s+/) },
            conversationalResponse: `I looked up items matching "${userMessage}" in our campus database:`
        };
    }
};

module.exports = {
    compareImages,
    parseSearchQuery
};
