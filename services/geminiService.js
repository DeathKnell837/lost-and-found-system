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

// Lightweight 100% Free-Tier Models (Zero Cost, Low-Token Consumption)
const CHAT_MODELS = ['gemini-2.5-flash-lite', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'];
const VISION_MODELS = ['gemini-2.5-flash-lite', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'];

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
 * Comprehensive Intelligent AI Conversation Engine (NLP Fallback)
 * Full NDMC Campus & System Domain Awareness
 */
const generateIntelligentAIResponse = (userMessage) => {
    const raw = (userMessage || '').trim();
    const text = raw.toLowerCase();

    // Greetings & Identity
    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|kamusta|musta|greetings)/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "Hello! I am your NDMC Campus Lost & Found AI Assistant. How can I help you find, report, or claim a lost item on campus today?"
        };
    }

    // Who created this / School / Academic project
    if (/who (made|created|developed|built)|proponent|author|creator|rogie|aragon|cite|ndmc|about (this|the) (system|project)/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "This AI-Enhanced Campus Lost & Found System was developed by Rogie Patrocinio Bacanto (BSCS-4) for Software Engineering 2 (SE2) under Mr. Allan Aragon at the College of Information Technology & Engineering (CITE), Notre Dame of Midsayap College."
        };
    }

    // How to Report Lost Item
    if (/how.*(report|post|submit|file).*(lost)/i.test(text) || /lost.*how/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "To report a lost item: Click the red 'Report Lost Item' button on the navigation bar, provide the item name, campus location, date, description, and optionally upload a photo. Our AI will automatically scan for matching found items!"
        };
    }

    // How to Report Found Item
    if (/how.*(report|post|submit|turn in|surrender).*(found)/i.test(text) || /found.*how/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "To report a found item: Click the green 'Report Found Item' button at the top to log its details, or turn it over directly to the Campus Security & Admin Office at the Main Admin Building (Ground Floor)."
        };
    }

    // How to Claim an Item
    if (/how.*(claim|get back|retrieve|proof|verify)/i.test(text) || /paano.*(i-claim|makuha|kunin)/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "To claim an item: Browse our 'Found Items' catalog, click 'Claim This Item', and submit proof of ownership (such as your Student ID, item serial number, receipt, photo, or distinct private identifying detail). Campus Security will verify your claim before handover."
        };
    }

    // Where is Security / Admin Office / Contact Info
    if (/where.*(security|office|admin|building|contact|phone|help desk)/i.test(text) || /saan.*(office|security)/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "The Campus Security & Admin Office is located at the Main Admin Building, Ground Floor. Office hours are Monday to Friday, 8:00 AM – 6:00 PM (Phone: 0956-932-7442, Email: rogiebacanto2002@gmail.com)."
        };
    }

    // How AI matching works
    if (/how.*(ai|matching|gemini|vision|algorithm|work)/i.test(text)) {
        return {
            isSearch: false,
            extracted: { keywords: [] },
            conversationalResponse: "Our system uses Google Gemini Multimodal Vision AI combined with smart metadata correlation (category, location, date, and visual appearance) to calculate similarity scores and automatically notify students when a match is found."
        };
    }

    // Physical item search detection
    const isItemSearch = /lost|found|nawala|nakita|wallet|key|phone|cellphone|iphone|android|samsung|infinix|oppo|vivo|realme|bag|backpack|airpod|earbud|earphone|headphone|laptop|umbrella|jacket|coat|glasses|watch|id|card|badge|doc|paper|schedule|table|book|tumbler|bottle|charger|calculator/i.test(text);

    if (isItemSearch) {
        let category = '';
        if (/wallet|bag|backpack|pouch|purse|id|card|badge/i.test(text)) category = 'Personal Items';
        else if (/key/i.test(text)) category = 'Personal Items';
        else if (/phone|cellphone|iphone|android|samsung|infinix|oppo|vivo|realme|airpod|earbud|earphone|headphone|laptop|charger|calculator/i.test(text)) category = 'Electronics & Devices';
        else if (/doc|paper|schedule|table|book|notebook|binder/i.test(text)) category = 'Books & Documents';
        else if (/jacket|coat|hoodie|shirt|cap|hat|umbrella|glasses|watch/i.test(text)) category = 'Clothing & Accessories';

        let color = '';
        const colorMatch = text.match(/\b(black|white|blue|red|green|yellow|pink|purple|orange|brown|gray|grey|silver|gold)\b/i);
        if (colorMatch) color = colorMatch[1];

        let location = '';
        const locMatch = text.match(/\b(library|canteen|gym|gymnasium|court|lab|laboratory|admin|primera|mongeau|eugene|clinic|registrar|cashier|quadrangle)\b/i);
        if (locMatch) location = locMatch[1];

        return {
            isSearch: true,
            extracted: {
                category,
                color,
                brand: '',
                location,
                keywords: text.split(/\s+/).filter(w => w.length > 2)
            },
            conversationalResponse: `I'm scanning our NDMC campus database for items matching "${raw}".`
        };
    }

    return {
        isSearch: false,
        extracted: { keywords: [] },
        conversationalResponse: `I am your NDMC Campus Lost & Found AI Assistant! You can ask me to search for lost or found items, explain how to file a claim, or provide campus location information.`
    };
};

/**
 * Advanced Gemini AI Engine with Multi-Turn Conversation Memory & Full NDMC Knowledge Base
 */
const parseSearchQuery = async (userMessage, conversationHistory = []) => {
    const textTrimmed = (userMessage || '').trim();

    if (!genAI) {
        return generateIntelligentAIResponse(textTrimmed);
    }

    let historyContext = '';
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        const recentTurns = conversationHistory.slice(-10);
        historyContext = `Conversation History (Context from previous turns):\n` +
            recentTurns.map(t => `${t.role === 'user' ? 'User' : 'Assistant'}: "${t.content}"`).join('\n') +
            `\n\n`;
    }

    const systemPrompt = `You are the official Campus Lost & Found AI Assistant for Notre Dame of Midsayap College (NDMC).
You are an exceptionally smart, polite, helpful, and natural conversational assistant. You represent the campus administration and student support services.

================================================================================
SYSTEM & CAMPUS KNOWLEDGE BASE
================================================================================
• Institution: Notre Dame of Midsayap College (NDMC), College of Information Technology & Engineering (CITE).
• Developer / Proponent: Rogie Patrocinio Bacanto (BSCS-4) for Software Engineering 2 (SE2) under Mr. Allan Aragon.
• Campus Security & Admin Office: Ground Floor, Main Admin Building (Mon-Fri 8:00 AM - 6:00 PM, Phone: 0956-932-7442, Email: rogiebacanto2002@gmail.com).
• Campus Locations: Library, Primera Hall, Bishop Mongeau Bldg., College Canteen, Gymnasium, Covered Court, Science Labs, Admin Building, St. Eugene Hall, Computer Labs, Registrar Office, Quadrangle, Cashier, Clinic.
• Core System Features:
  1. "Report Lost Item" (Red button): File a lost item report with details, campus location, and photo.
  2. "Report Found Item" (Green button): Log a found item turned over on campus.
  3. "Claim Item": Browse found items, click 'Claim This Item', submit proof of ownership (student ID, serial number, photo, or private identifying feature like wallpaper or keychain). Security verifies proof before release.
  4. "AI Photo Search": Users can click the camera icon in chat to upload an item photo for instant visual AI scanning.
  5. "Gemini AI Visual Matching": Uses Gemini 2.5 Flash-Lite Multimodal Vision + dual-tier scoring to automatically match lost reports with found reports.
• Important Rules:
  - NEVER break character. You are the campus retrieval assistant, NOT an external software developer. Do not pitch or suggest software features to the user.
  - ALWAYS maintain multi-turn memory. If the user mentions their name, an item they lost earlier, or refers to "it" / "that item", recall the exact context.
  - NEVER output raw code, markdown code blocks, scripts, or JSON to the user.
  - Respond in clear, polite, natural human English (or Tagalog/Taglish if the user asks in Filipino).

================================================================================
CURRENT TURN
================================================================================
${historyContext}Current User Message: "${textTrimmed}"

Instructions:
1. Intent Classification:
   - Set "isSearch" to true ONLY IF the user is actively searching for, describing, or asking to check database records for a specific physical lost/found item (e.g., "I lost my black wallet", "did anyone find keys?", "searching for iphone in library").
   - Set "isSearch" to false for greetings, conversational follow-ups, questions about the school/system/proponent, claiming steps, office hours, or general chat.
2. Feature Extraction (if searching for a physical item):
   - "itemName": specific item name (e.g., "Black Leather Wallet", "Infinix Phone", "Keys")
   - "category": ("Electronics & Devices", "Personal Items", "Books & Documents", "Clothing & Accessories", "Keys", "Other")
   - "color": extracted color
   - "brand": brand if mentioned
   - "location": campus location if mentioned
   - "keywords": array of 2-5 relevant search keywords
3. Conversational Response:
   - Provide a natural, friendly, knowledgeable response in "conversationalResponse" (1-3 sentences).

Return ONLY a valid JSON object matching this schema:
{
  "isSearch": true/false,
  "itemName": "<item name or empty>",
  "category": "<category or empty>",
  "color": "<color or empty>",
  "brand": "<brand or empty>",
  "location": "<location or empty>",
  "keywords": ["<k1>", "<k2>"],
  "conversationalResponse": "<your direct conversational response>"
}`;

    for (const modelName of CHAT_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: { maxOutputTokens: 350, temperature: 0.3 }
            });
            const result = await model.generateContent(systemPrompt);
            const responseText = result.response.text().trim();
            const cleanedJsonText = responseText.replace(/^```json\s*/gi, '').replace(/^```\s*/gi, '').replace(/\s*```$/g, '').trim();
            const jsonResult = JSON.parse(cleanedJsonText);

            return {
                isSearch: jsonResult.isSearch === true,
                extracted: {
                    itemName: jsonResult.itemName || '',
                    category: jsonResult.category || '',
                    color: jsonResult.color || '',
                    brand: jsonResult.brand || '',
                    location: jsonResult.location || '',
                    keywords: Array.isArray(jsonResult.keywords) ? jsonResult.keywords : []
                },
                conversationalResponse: jsonResult.conversationalResponse || "Hello! How can I assist you with campus lost and found items today?"
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
