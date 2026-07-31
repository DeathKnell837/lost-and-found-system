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
 * Conversational query parser & open-ended chat responder
 * @param {string} userMessage - User search description or chat prompt
 * @returns {Promise<Object>} - { isSearch, extracted, conversationalResponse }
 */
const parseSearchQuery = async (userMessage) => {
    const textTrimmed = (userMessage || '').trim();

    // Explicit Search Intent Detection:
    // Only set isSearch: true if user explicitly asks to search/find/look up an item OR describes lost/found item details
    const explicitSearchKeywords = /^\s*(search for|find my|look for|did someone find|has anyone seen|where is my|i lost|i found|is there a lost|do you have my|check if someone|scan for|match my|wallet|keys|phone|bag|backpack|airpods|laptop|umbrella|jacket|coat|glasses|watch|id card|student card|badge)/i;
    const isSearchIntent = explicitSearchKeywords.test(textTrimmed);

    if (!genAI) {
        return {
            isSearch: isSearchIntent,
            extracted: { keywords: isSearchIntent ? textTrimmed.split(/\s+/).filter(w => w.length > 2) : [] },
            conversationalResponse: isSearchIntent 
                ? `I am scanning our campus database for items matching "${textTrimmed}":`
                : "Hello! I am your Campus Lost & Found Assistant. How can I help you today?"
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        if (!isSearchIntent) {
            // NORMAL FREE-FORM AI CONVERSATION MODE
            const chatPrompt = `You are a friendly, intelligent, and helpful AI Assistant for the Campus Lost & Found System.
Engage in natural, warm, and helpful open-ended conversation with the user.
Answer their questions on any topic, converse naturally, or assist them with campus life and lost & found procedures.
Keep responses concise, natural, and helpful (1-3 sentences).

User message: "${textTrimmed}"`;

            const chatResult = await model.generateContent(chatPrompt);
            const chatResponseText = chatResult.response.text().trim();

            return {
                isSearch: false,
                extracted: { keywords: [] },
                conversationalResponse: chatResponseText || "I'm here to chat or help you with anything on campus! Let me know if you lose or find something."
            };
        }

        // EXPLICIT ITEM SEARCH MODE
        const searchPrompt = `You are the Official Campus Lost & Found AI Assistant.
A user is searching for a lost or found item: "${textTrimmed}"

Extract search attributes:
- category (Electronics, Clothing, Accessories, Keys, ID Card, Bags, Books, Other)
- color
- brand
- location
- keywords

Formulate a warm 1-2 sentence response confirming you are searching the campus database for their item.

Return ONLY a valid JSON object in this exact format (no markdown):
{
  "category": "<extracted category or empty string>",
  "color": "<extracted color or empty string>",
  "brand": "<extracted brand or empty string>",
  "location": "<extracted location or empty string>",
  "keywords": ["<keyword1>", "<keyword2>"],
  "conversationalResponse": "<your response text>"
}`;

        const searchResult = await model.generateContent(searchPrompt);
        const searchResponseText = searchResult.response.text().trim();
        const cleanedJsonText = searchResponseText.replace(/^```json\s*/gi, '').replace(/\s*```$/g, '').trim();
        const jsonResult = JSON.parse(cleanedJsonText);

        return {
            isSearch: true,
            extracted: {
                category: jsonResult.category || '',
                color: jsonResult.color || '',
                brand: jsonResult.brand || '',
                location: jsonResult.location || '',
                keywords: Array.isArray(jsonResult.keywords) ? jsonResult.keywords : []
            },
            conversationalResponse: jsonResult.conversationalResponse || `I am scanning our campus database for "${textTrimmed}":`
        };
    } catch (error) {
        console.error('Gemini query parse error:', error.message);
        return {
            isSearch: isSearchIntent,
            extracted: { keywords: isSearchIntent ? textTrimmed.split(/\s+/).filter(w => w.length > 2) : [] },
            conversationalResponse: isSearchIntent
                ? `I am scanning our campus database for "${textTrimmed}":`
                : "Hello! I am your Campus Lost & Found Assistant. How can I help you today?"
        };
    }
};

/**
 * Multimodal image analysis using Gemini 2.0 Flash
 * @param {Buffer} imageBuffer - Buffer of uploaded file
 * @param {string} mimeType - e.g. 'image/jpeg' or 'image/png'
 * @param {string} userPrompt - Optional text prompt
 */
const analyzeUploadedImage = async (imageBuffer, mimeType = 'image/jpeg', userPrompt = '') => {
    if (!genAI) {
        return {
            extracted: { keywords: ['item'] },
            conversationalResponse: "I received your photo! Gemini API key is not configured, but I am scanning our database for matching items."
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType
            }
        };

        const prompt = `You are a Campus Lost & Found AI Assistant.
Analyze this photo of an item ${userPrompt ? `along with user message: "${userPrompt}"` : ''}.
Identify the item type, primary colors, brand/logo, materials, condition, and key features.

Return ONLY a valid JSON object in this exact format (no markdown):
{
  "category": "<best fitting category like Electronics, Keys, Wallet, Bag, Clothing, Accessories, ID Card, Books, Other>",
  "color": "<primary color>",
  "brand": "<brand name or empty>",
  "keywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "conversationalResponse": "<friendly 1-2 sentence response confirming what item you see in the photo and that you are scanning our campus database for matches>"
}`;

        const result = await model.generateContent([imagePart, prompt]);
        const text = result.response.text().trim();
        const cleanedText = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleanedText);

        return {
            extracted: {
                category: parsed.category || '',
                color: parsed.color || '',
                brand: parsed.brand || '',
                keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
            },
            conversationalResponse: parsed.conversationalResponse || "I analyzed your item photo and am checking our campus database for matches!"
        };
    } catch (err) {
        console.error('Error analyzing image with Gemini:', err);
        return {
            extracted: { keywords: ['item'] },
            conversationalResponse: "I received your photo and am checking our campus database for matching items!"
        };
    }
};

module.exports = {
    compareImages,
    parseSearchQuery,
    analyzeUploadedImage
};
