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

const isNonSearchInput = (msg) => {
    if (!msg || typeof msg !== 'string') return true;
    const text = msg.trim().toLowerCase();
    const casualRegex = /^(hi|hello|hey|good|howdy|what|who|where|how|can|thanks|thank|nothing|nothging|nvm|nevermind|ok|okay|cool|fine|bye|no|nah|none|not really|just looking|nope|nothing much|k|thx)/i;
    if (casualRegex.test(text)) return true;
    if (text.length < 3 && !/id|key/i.test(text)) return true;
    return false;
};

/**
 * Conversational query parser and responder
 * @param {string} userMessage - User search description or chat prompt
 * @returns {Promise<Object>} - { isSearch, extracted: { category, color, brand, location, keywords }, conversationalResponse: string }
 */
const parseSearchQuery = async (userMessage) => {
    // Immediate pre-check for casual/non-search phrases (e.g. "hi", "nothing", "nothging", "ok", "nvm")
    if (isNonSearchInput(userMessage)) {
        let reply = "Hello! I am your Campus Lost & Found Assistant. How can I help you find or report a lost item on campus today?";
        const textLower = userMessage.trim().toLowerCase();
        
        if (/nothing|nothging|nvm|nevermind|no|nah|none|nope|nothing much/i.test(textLower)) {
            reply = "No problem! Feel free to reach out anytime if you lose or find something on campus. Have a great day!";
        } else if (/thanks|thank|thx|cool|ok|okay|great|awesome/i.test(textLower)) {
            reply = "You're very welcome! I'm always here if you need help finding or reporting an item.";
        } else if (/bye|see ya|goodnight|cya/i.test(textLower)) {
            reply = "Goodbye! Take care and have a wonderful day on campus!";
        }

        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: reply
        };
    }

    if (!genAI) {
        return {
            isSearch: true,
            extracted: { keywords: userMessage.split(/\s+/).filter(w => w.length > 2) },
            conversationalResponse: `Here are the top matches I found for "${userMessage}":`
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `You are the Official Campus Lost & Found AI Assistant — an intelligent, friendly, and comprehensive AI guide for students, faculty, and campus security.
User message: "${userMessage}"

SYSTEM CONTEXT & CAPABILITIES YOU COVER:
1. GREETINGS & CASUAL CHAT: Respond warmly, introduce yourself, and offer assistance with lost/found belongings or campus procedures.
2. REPORTING LOST ITEMS: Guide users to click "Report Lost Item" at the top navbar or describe their lost item to search our database.
3. REPORTING FOUND ITEMS: Guide finders to click "Report Found Item" or surrender items to the Campus Security & Admin Office (Mon-Fri 8AM-6PM, Tel: 0956-932-7442).
4. CLAIMING PROCESS: Explain that owners can claim found items by providing proof of ownership (student ID, serial number, or detailed description).
5. GEMINI AI VISUAL MATCHING: Explain that Gemini 2.0 Flash Vision automatically calculates similarity scores between lost and found item photos.
6. PHYSICAL ITEM SEARCH: If the user is searching for a specific physical item (e.g., "lost my black leather wallet", "blue car keys"), set isSearch to true and extract key attributes.

Determine INTENT:
- "search": User is explicitly describing a physical lost or found item to look up in the database.
- "chat": User is greeting, asking a system question, inquiring about campus procedures, thanking you, or asking general questions.

If intent is "chat":
- Set isSearch to false.
- Provide a clear, polite, and helpful 1-3 sentence answer directly addressing their question.

If intent is "search":
- Set isSearch to true.
- Extract attributes: category, color, brand, location, keywords.
- Provide a warm 1-2 sentence response confirming what item you are scanning the campus database for.

Return ONLY a valid JSON object in this exact format (no markdown):
{
  "isSearch": true or false,
  "category": "<extracted category or empty string>",
  "color": "<extracted color or empty string>",
  "brand": "<extracted brand or empty string>",
  "location": "<extracted location or empty string>",
  "keywords": ["<keyword1>", "<keyword2>"],
  "conversationalResponse": "<your response text>"
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        const cleanedJsonText = responseText.replace(/^```json\s*/gi, '').replace(/\s*```$/g, '').trim();
        const jsonResult = JSON.parse(cleanedJsonText);

        return {
            isSearch: jsonResult.isSearch === true,
            extracted: {
                category: jsonResult.category || '',
                color: jsonResult.color || '',
                brand: jsonResult.brand || '',
                location: jsonResult.location || '',
                keywords: Array.isArray(jsonResult.keywords) ? jsonResult.keywords : []
            },
            conversationalResponse: jsonResult.conversationalResponse || "Hello! How can I assist you with lost or found items on campus today?"
        };
    } catch (error) {
        console.error('Gemini query parse error:', error.message);
        const isGreeting = /^(hi|hello|hey|good|how|what|who|where|can|thanks|thank)/i.test(userMessage.trim());
        return {
            isSearch: !isGreeting,
            extracted: { keywords: isGreeting ? [] : userMessage.split(/\s+/).filter(w => w.length > 2) },
            conversationalResponse: isGreeting 
                ? "Hello! I am your Campus Lost & Found Assistant. How can I help you find or report a lost item on campus today?"
                : `I scanned our campus database for items matching "${userMessage}":`
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
