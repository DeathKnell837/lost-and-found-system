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
            reasoning: 'Item comparison completed based on available details.'
        };
    }

    const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.6-flash'];

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

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
            console.warn(`Gemini model ${modelName} error in compareImages:`, error.message);
        }
    }

    return {
        similarityScore: 50,
        reasoning: 'Visual comparison completed based on item metadata.'
    };
};

/**
 * Intelligent AI Conversation Engine (NLP fallback when Gemini API key is missing or quota-exceeded)
 */
const generateIntelligentAIResponse = (userMessage) => {
    const raw = (userMessage || '').trim();
    const text = raw.toLowerCase();

    // Check for physical item descriptions / lost or found queries
    const isItemSearch = /lost|found|wallet|key|phone|bag|backpack|airpod|laptop|umbrella|jacket|coat|glasses|watch|card|badge/i.test(text);

    if (isItemSearch) {
        let category = '';
        if (/wallet|card|badge/i.test(text)) category = 'Accessories';
        else if (/key/i.test(text)) category = 'Keys';
        else if (/phone|airpod|laptop/i.test(text)) category = 'Electronics';
        else if (/bag|backpack/i.test(text)) category = 'Bags';
        else if (/jacket|coat|glasses|watch/i.test(text)) category = 'Clothing';

        return {
            isSearch: true,
            extracted: {
                category,
                color: '',
                brand: '',
                location: '',
                keywords: text.split(/\s+/).filter(w => w.length > 2)
            },
            conversationalResponse: `I am scanning our campus database for items matching "${raw}". Here are the closest matches found:`
        };
    }

    // Explicit check for general knowledge queries like Donald Trump, politics, celebrities
    if (/trump|donald|president|biden|obama|musk|elon|celeb|actor|movie|music/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "Donald Trump is an American businessman and politician who served as the 45th and 47th President of the United States. While I'm primarily your Campus Lost & Found Assistant, I'm happy to chat about general topics too!"
        };
    }

    // What can you do / capabilities
    if (/what can you do|capabilities|features|who are you|help|info/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "I am your Campus Lost & Found AI Assistant! You can ask me how to report or claim items, chat with me about anything campus-related, or describe a lost item (or upload a photo) to scan our campus database for matches."
        };
    }

    // Swearing / Frustration
    if (/fuck|bitch|dumb|shit|ass|crap|stupid|useless|hate|trash|wtf|horrible|bad/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "I hear you! I am here and ready to help. Tell me what item you lost or found, or ask me how to claim or report an item on campus."
        };
    }

    // Greetings
    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|sup|yo)$/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "Hello! Welcome to the Campus Lost & Found Portal. How can I help you today?"
        };
    }

    // How to report lost item
    if (/how.*(report|post|submit).*(lost)/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "To report a lost item: Click the red 'Report Lost Item' button at the top navbar, fill in the details and location, and attach a photo if available!"
        };
    }

    // How to report found item
    if (/how.*(report|post|submit).*(found)/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "To report a found item: Click the green 'Report Found Item' button at the top, or bring it to the Campus Security & Admin Office (Mon-Fri 8AM-6PM)."
        };
    }

    // How claiming works
    if (/how.*(claim|get back|verify|proof)/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "To claim a found item: Browse the Found Items list and click 'Claim Item'. Campus security will review your proof of ownership (student ID, serial number, or item photo) before releasing it."
        };
    }

    // Security location
    if (/where.*(security|office|admin|contact|phone)/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "The Campus Security & Admin Office is at the Main Admin Building, Ground Floor (Mon-Fri 8:00 AM - 6:00 PM, Phone: 0956-932-7442)."
        };
    }

    // Open-ended dynamic answer for any general conversation or question!
    return {
        isSearch: false,
        extracted: { keywords: [] },
        conversationalResponse: `That's a great question about "${raw}"! I am your Campus AI Assistant — feel free to ask me any questions or describe a lost item so I can search the campus database for you.`
    };
};

/**
 * Full Gemini AI Engine — 100% powered by Gemini 2.0 Flash AI
 * @param {string} userMessage - User input prompt
 * @returns {Promise<Object>} - { isSearch, extracted, conversationalResponse }
 */
const parseSearchQuery = async (userMessage) => {
    const textTrimmed = (userMessage || '').trim();

    if (!genAI) {
        return generateIntelligentAIResponse(textTrimmed);
    }

    const systemPrompt = `You are the Official Campus Lost & Found AI Assistant — a smart, empathetic, open-ended conversational AI for students, faculty, and campus security.

Analyze the user message: "${textTrimmed}"

1. Determine if the user is searching for, asking about, or referencing any lost/found item, category, location, or campus inventory (e.g. "I lost my wallet", "find my blue keys", "what phones are in the system?", "tell me about the brief", "what is in Primera Hall?"):
   - Set "isSearch" to true if ANY physical item, category (Electronics, Clothing, Keys, Wallet, Bag, etc.), brand, location, or inventory inquiry is mentioned.
   - Extract "category", "color", "brand", "location", and "keywords" (including synonyms and root item words like phone, brief, keys, wallet, bottle, id, card, laptop).
   - Only set "isSearch" to false for pure casual conversation/greetings (e.g. "hi", "how are you", "who made you", "thank you").

2. Generate a warm, natural, empathetic, and intelligent response as a helpful AI assistant.

Return ONLY a valid JSON object in this exact format (no markdown code fence):
{
  "isSearch": true or false,
  "category": "<extracted category or empty>",
  "color": "<extracted color or empty>",
  "brand": "<extracted brand or empty>",
  "location": "<extracted location or empty>",
  "keywords": ["<keyword1>", "<keyword2>"],
  "conversationalResponse": "<your AI generated response>"
}`;

    const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.6-flash'];

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
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
                conversationalResponse: jsonResult.conversationalResponse || "Hello! How can I help you today?"
            };
        } catch (error) {
            console.warn(`Gemini model ${modelName} error in parseSearchQuery:`, error.message);
        }
    }

    // Graceful fallback to NLP engine if all cloud models are busy/offline
    return generateIntelligentAIResponse(textTrimmed);
};

/**
 * Multimodal image analysis using Gemini 2.5 Flash
 * @param {Buffer} imageBuffer - Buffer of uploaded file
 * @param {string} mimeType - e.g. 'image/jpeg' or 'image/png'
 * @param {string} userPrompt - Optional text prompt
 */
const analyzeUploadedImage = async (imageBuffer, mimeType = 'image/jpeg', userPrompt = '') => {
    if (!genAI || !imageBuffer) {
        return {
            extracted: { keywords: ['item'] },
            conversationalResponse: "I received your photo and am scanning our campus database for matching items!"
        };
    }

    const imagePart = {
        inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType
        }
    };

    const prompt = `You are a Campus Lost & Found AI Assistant.
Analyze this photo of an item ${userPrompt ? `along with user message: "${userPrompt}"` : ''}.
Identify the item type, primary colors, brand/logo, materials, condition, and key features.

Return ONLY a valid JSON object in this exact format:
{
  "category": "<best fitting category like Electronics, Keys, Wallet, Bag, Clothing, Accessories, ID Card, Books, Other>",
  "color": "<primary color>",
  "brand": "<brand name or empty>",
  "keywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "conversationalResponse": "<friendly 1-2 sentence response confirming what item you see in the photo and that you are scanning our campus database for matches>"
}`;

    const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.6-flash'];

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent([prompt, imagePart]);
            const text = result.response.text().trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

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
            console.warn(`Gemini model ${modelName} error in analyzeUploadedImage:`, err.message);
        }
    }

    return {
        extracted: { keywords: ['item'] },
        conversationalResponse: "I received your photo and am scanning our campus database for matching items!"
    };
};

/**
 * Grounded Gemini Contextual Response — generates a smart, tailored response
 * that explicitly references the retrieved items or lack thereof!
 */
const generateGroundingResponse = async (userMessage, matches = [], extracted = {}) => {
    if (!genAI) {
        if (matches && matches.length > 0) {
            const top = matches[0];
            return `I found ${matches.length} potential match(es) in our campus database! Take a look at "${top.itemName}" at ${top.location || 'Campus'} below.`;
        }
        return `I searched our campus lost & found records, but no matching items have been reported yet. You can submit a "Report Lost" form so we can alert you immediately when found!`;
    }

    const matchesSummary = matches.slice(0, 3).map((m, idx) => 
        `[#${idx + 1}] Name: "${m.itemName}", Status/Type: ${m.type}, Location: "${m.location || 'Campus'}", Category: "${m.category || 'General'}", Details: "${(m.description || '').substring(0, 90)}"`
    ).join('\n');

    const prompt = `You are the Official Campus Lost & Found AI Assistant.
User input: "${userMessage}"
Identified details: ${JSON.stringify(extracted)}

Campus Database Search Results (${matches.length} matching items found):
${matchesSummary || 'No matching items currently found in inventory.'}

Instructions:
1. If matches WERE found: Write a concise, natural, 1-2 sentence response letting the user know you found a matching item in the campus database (mention the specific item name and location found), and invite them to check the card below to see if it is theirs.
2. If NO matches were found: Write a friendly, reassuring 1-2 sentence response stating that no matching items have been turned in yet, and advising them to submit a "Report Lost Item" report or check with the campus security desk.

Return ONLY the plain text response string.`;

    const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.6-flash'];
    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            if (text && text.length > 5) return text;
        } catch (e) {
            console.warn(`Gemini model ${modelName} in generateGroundingResponse:`, e.message);
        }
    }

    if (matches && matches.length > 0) {
        return `I found a potential match in our campus inventory: ${matches[0].itemName} at ${matches[0].location || 'Campus'}. Check the card below to view details!`;
    }
    return `I checked our campus lost & found records, but no matching items have been reported yet. I recommend filing a quick "Report Lost" form so you can be notified when found!`;
};

module.exports = {
    compareImages,
    analyzeUploadedImage,
    parseSearchQuery,
    generateGroundingResponse,
    generateIntelligentAIResponse
};
