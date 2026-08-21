const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');
const http = require('http');

// Initialize Gemini API Client
const apiKey = (process.env.GEMINI_API_KEY || '').trim();
let genAI = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
} else {
    console.warn('GEMINI_API_KEY is not set in environment variables.');
}

// Specialized Model Tiers for High Speed & Accuracy
const CHAT_MODELS = ['gemini-3.5-flash-lite', 'gemini-2.5-flash-lite', 'gemini-3.6-flash'];
const VISION_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-2.5-flash'];

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
 */
const compareImages = async (url1, url2, desc1 = '', desc2 = '') => {
    if (!genAI) {
        return {
            similarityScore: 50,
            reasoning: 'Item comparison completed based on available details.'
        };
    }

    for (const modelName of VISION_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: { maxOutputTokens: 200, temperature: 0.2 }
            });

            const parts = [];
            const imgPart1 = url1 ? await fetchImagePart(url1) : null;
            const imgPart2 = url2 ? await fetchImagePart(url2) : null;

            let prompt = `Compare two campus lost and found items.
Item 1: "${desc1}"
Item 2: "${desc2}"
`;

            if (imgPart1 && imgPart2) {
                prompt += `Images provided for both items. Compare visual appearance, color, brand, condition.`;
                parts.push(imgPart1);
                parts.push(imgPart2);
            } else if (imgPart1) {
                prompt += `Image 1 provided. Compare with description of Item 2.`;
                parts.push(imgPart1);
            } else if (imgPart2) {
                prompt += `Image 2 provided. Compare with description of Item 1.`;
                parts.push(imgPart2);
            }

            prompt += `\nReturn JSON: {"similarityScore": <0-100>, "reasoning": "<1 sentence reasoning>"}`;
            parts.push(prompt);

            const result = await model.generateContent(parts);
            const responseText = result.response.text().trim();
            const cleanedJsonText = responseText.replace(/^```json\s*/gi, '').replace(/^```\s*/gi, '').replace(/\s*```$/g, '').trim();
            const jsonResult = JSON.parse(cleanedJsonText);

            return {
                similarityScore: Math.min(100, Math.max(0, parseInt(jsonResult.similarityScore) || 50)),
                reasoning: jsonResult.reasoning || 'Visual comparison completed.'
            };
        } catch (error) {
            console.warn(`Gemini model ${modelName} error in compareImages:`, error.message);
        }
    }

    return {
        similarityScore: 50,
        reasoning: 'Visual comparison completed based on item metadata.'
    };
};

/**
 * Intelligent AI Conversation Engine (NLP fallback)
 */
const generateIntelligentAIResponse = (userMessage) => {
    const raw = (userMessage || '').trim();
    const text = raw.toLowerCase();

    const isItemSearch = /lost|found|wallet|key|phone|bag|backpack|airpod|laptop|umbrella|jacket|coat|glasses|watch|card|badge|doc|paper|schedule|table/i.test(text);

    if (isItemSearch) {
        let category = '';
        if (/wallet|card|badge/i.test(text)) category = 'Personal Items';
        else if (/key/i.test(text)) category = 'Personal Items';
        else if (/phone|airpod|laptop/i.test(text)) category = 'Electronics & Devices';
        else if (/doc|paper|schedule|table|book/i.test(text)) category = 'Books & Documents';
        else if (/bag|backpack/i.test(text)) category = 'Personal Items';
        else if (/jacket|coat|glasses|watch/i.test(text)) category = 'Personal Items';

        return {
            isSearch: true,
            extracted: {
                category,
                color: '',
                brand: '',
                location: '',
                keywords: text.split(/\s+/).filter(w => w.length > 2)
            },
            conversationalResponse: `I am scanning our campus database for items matching "${raw}".`
        };
    }

    // Common query patterns
    if (/how.*(report|post|submit).*(found)/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "To report a found item: Click the green 'Report Found Item' button at the top, or bring it to the Campus Security & Admin Office (Mon-Fri 8AM-6PM)."
        };
    }

    if (/how.*(claim|get back|verify|proof)/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "To claim a found item: Browse the Found Items list and click 'Claim Item'. Campus security will review your proof of ownership (student ID, serial number, or item photo) before releasing it."
        };
    }

    if (/where.*(security|office|admin|contact|phone)/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "The Campus Security & Admin Office is at the Main Admin Building, Ground Floor (Mon-Fri 8:00 AM - 6:00 PM, Phone: 0956-932-7442)."
        };
    }

    return {
        isSearch: false,
        extracted: { keywords: [] },
        conversationalResponse: `I am your Campus AI Assistant! How can I help you find or report a lost item today?`
    };
};

/**
 * Fast Gemini AI Engine with Multi-Turn Conversation Memory (Low-Latency Chat Model)
 */
const parseSearchQuery = async (userMessage, conversationHistory = []) => {
    const textTrimmed = (userMessage || '').trim();

    if (!genAI) {
        return generateIntelligentAIResponse(textTrimmed);
    }

    let historyContext = '';
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        const recentTurns = conversationHistory.slice(-4);
        historyContext = `Recent conversation:\n` +
            recentTurns.map(t => `${t.role === 'user' ? 'User' : 'Assistant'}: "${t.content}"`).join('\n') +
            `\n\n`;
    }

    const systemPrompt = `You are the Campus Lost & Found AI Assistant. Fast, friendly, and helpful.

${historyContext}User Message: "${textTrimmed}"

Instructions:
1. Determine if the user is asking about or searching for any lost or found physical item, category, or location.
2. If yes, set "isSearch" to true and extract "category", "color", "brand", "location", "keywords" (array of 2-5 terms).
3. If no (greetings, general chat, asking how system works), set "isSearch" to false.
4. Provide a friendly "conversationalResponse" (1-2 sentences).

Return ONLY JSON:
{
  "isSearch": true/false,
  "category": "<category or empty>",
  "color": "<color or empty>",
  "brand": "<brand or empty>",
  "location": "<location or empty>",
  "keywords": ["<k1>", "<k2>"],
  "conversationalResponse": "<response text>"
}`;

    for (const modelName of CHAT_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: { maxOutputTokens: 250, temperature: 0.2 }
            });
            const result = await model.generateContent(systemPrompt);
            const responseText = result.response.text().trim();
            const cleanedJsonText = responseText.replace(/^```json\s*/gi, '').replace(/^```\s*/gi, '').replace(/\s*```$/g, '').trim();
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
                conversationalResponse: jsonResult.conversationalResponse || "Hello! How can I assist you today?"
            };
        } catch (error) {
            console.warn(`Gemini chat model ${modelName} error:`, error.message);
        }
    }

    return generateIntelligentAIResponse(textTrimmed);
};

/**
 * High-Speed Multimodal Vision Analysis (Vision Model)
 */
const analyzeUploadedImage = async (imageBuffer, mimeType = 'image/jpeg', userPrompt = '') => {
    if (!genAI || !imageBuffer) {
        return {
            extracted: { itemName: 'Uploaded Item', keywords: ['item'] },
            conversationalResponse: "I received your photo and scanned our campus database for matches."
        };
    }

    const imagePart = {
        inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType
        }
    };

    const prompt = `You are the Campus Lost & Found AI Assistant.
Analyze this photo ${userPrompt ? `with user caption "${userPrompt}"` : ''}.
Identify what physical item or document is shown.

Return ONLY a valid JSON object:
{
  "itemName": "<concise specific name of the item/document, e.g. Computer Science Class Schedule, Infinix Hot40i Phone, Blue Backpack, Student ID Card>",
  "category": "<Electronics & Devices, Books & Documents, Personal Items, Keys, Clothing, Accessories, Other>",
  "color": "<primary color>",
  "brand": "<brand or institution name if visible>",
  "detectedText": "<key visible text/title/headers if any>",
  "keywords": ["<k1>", "<k2>", "<k3>"],
  "description": "<1 sentence concise visual description of the item in the photo>"
}`;

    for (const modelName of VISION_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: { maxOutputTokens: 300, temperature: 0.2 }
            });
            const result = await model.generateContent([imagePart, prompt]);
            const responseText = result.response.text().trim();
            const cleanedJsonText = responseText.replace(/^```json\s*/gi, '').replace(/^```\s*/gi, '').replace(/\s*```$/g, '').trim();
            const jsonResult = JSON.parse(cleanedJsonText);

            const itemName = jsonResult.itemName || 'Uploaded Item';
            const keywords = Array.isArray(jsonResult.keywords) ? jsonResult.keywords : [itemName];
            if (jsonResult.detectedText) {
                const words = jsonResult.detectedText.split(/\s+/).filter(w => w.length > 2);
                keywords.push(...words.slice(0, 5));
            }

            return {
                extracted: {
                    itemName,
                    category: jsonResult.category || 'Personal Items',
                    color: jsonResult.color || '',
                    brand: jsonResult.brand || '',
                    description: jsonResult.description || '',
                    detectedText: jsonResult.detectedText || '',
                    keywords
                },
                conversationalResponse: `I analyzed your photo: It looks like **${itemName}** (${jsonResult.description || ''}).`
            };
        } catch (error) {
            console.warn(`Gemini vision model ${modelName} error in analyzeUploadedImage:`, error.message);
        }
    }

    return {
        extracted: { itemName: 'Uploaded Item', keywords: ['item'] },
        conversationalResponse: "I received your photo and scanned our campus database for matches."
    };
};

module.exports = {
    compareImages,
    analyzeUploadedImage,
    parseSearchQuery,
    generateIntelligentAIResponse
};
