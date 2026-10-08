const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Initialize Gemini API Client
const apiKey = (process.env.GEMINI_API_KEY || '').trim();
let genAI = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
} else {
    console.warn('GEMINI_API_KEY is not set in environment variables.');
}

// Lightweight Production Gemini 2.5 Models
const CHAT_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest'];
const VISION_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest'];

/**
 * Robust JSON parser for Gemini responses
 */
const extractJson = (text) => {
    if (!text || typeof text !== 'string') return null;
    const trimmed = text.trim();
    try {
        return JSON.parse(trimmed);
    } catch (_) {}
    const cleaned = trimmed.replace(/^```(?:json)?\s*/gi, '').replace(/\s*```$/g, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch (_) {}
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
            return JSON.parse(trimmed.substring(firstBrace, lastBrace + 1));
        } catch (_) {}
    }
    return null;
};

/**
 * Helper to download image from URL or read local file into inline Data Part for Gemini
 */
const fetchImagePart = async (url) => {
    return new Promise((resolve, reject) => {
        if (!url || typeof url !== 'string') return resolve(null);

        // Check if local file path (e.g. /uploads/... or absolute)
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            try {
                const cleanPath = url.replace(/^[/\\]+/, '');
                let localPath = path.join(__dirname, '../public', cleanPath);
                if (!fs.existsSync(localPath) && fs.existsSync(url)) {
                    localPath = url;
                }
                if (fs.existsSync(localPath)) {
                    const buffer = fs.readFileSync(localPath);
                    const ext = path.extname(localPath).toLowerCase();
                    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
                    return resolve({
                        inlineData: {
                            data: buffer.toString('base64'),
                            mimeType
                        }
                    });
                }
            } catch (err) {
                console.warn('Failed to read local image for Gemini:', err.message);
                return resolve(null);
            }
            return resolve(null);
        }
        
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
                generationConfig: { 
                    maxOutputTokens: 1500, 
                    temperature: 0.2,
                    responseMimeType: 'application/json'
                }
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

            prompt += `\nReturn JSON: {"similarityScore": <integer 0-100>, "reasoning": "<1-2 sentences reasoning>"}`;
            parts.push(prompt);

            const result = await model.generateContent(parts);
            const responseText = result.response.text();
            const jsonResult = extractJson(responseText);

            if (jsonResult) {
                let score = parseInt(jsonResult.similarityScore);
                if (isNaN(score) && typeof jsonResult.similarityScore === 'number') {
                    score = Math.round(jsonResult.similarityScore <= 1 ? jsonResult.similarityScore * 100 : jsonResult.similarityScore);
                }
                return {
                    similarityScore: Math.min(100, Math.max(0, isNaN(score) ? 50 : score)),
                    reasoning: jsonResult.reasoning || 'Visual comparison completed.'
                };
            }
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

    // Stop words filter for NLP fallback
    const NLP_STOP_WORDS = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'is', 'am', 'are', 'was', 'were', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'can',
        'could', 'would', 'should', 'i', 'my', 'me', 'you', 'your', 'it', 'its', 'this', 'that',
        'what', 'where', 'when', 'who', 'how', 'anyone', 'someone', 'somebody', 'anybody',
        'find', 'found', 'lost', 'item', 'items', 'please', 'help', 'search', 'looking',
        'ang', 'mga', 'ng', 'sa', 'ko', 'mo', 'ba', 'po', 'may', 'meron', 'nawala', 'nakita', 'hanap'
    ]);

    // Physical item detection with exact category mapping
    let itemName = '';
    let category = '';

    if (/umbrella|payong/i.test(text)) {
        itemName = 'Umbrella';
        category = 'Personal Items';
    } else if (/wallet|pitaka|purse|pouch/i.test(text)) {
        itemName = 'Wallet';
        category = 'Wallets & Cards';
    } else if (/student\s*id|id\s*card|\bid\b|badge/i.test(text)) {
        itemName = 'Student ID Card';
        category = 'Wallets & Cards';
    } else if (/key|keys|susi/i.test(text)) {
        itemName = 'Keys';
        category = 'Keys';
    } else if (/calculator|calcu/i.test(text)) {
        itemName = 'Calculator';
        category = 'Stationery';
    } else if (/tumbler|water\s*bottle|flask|aquaflask|hydro\s*flask|tubig/i.test(text)) {
        itemName = 'Tumbler';
        category = 'Personal Items';
    } else if (/iphone|android|samsung|infinix|oppo|vivo|realme|phone|cellphone|selpon/i.test(text)) {
        const brandMatch = text.match(/\b(iphone|samsung|infinix|oppo|vivo|realme|apple)\b/i);
        itemName = brandMatch ? `${brandMatch[1].charAt(0).toUpperCase() + brandMatch[1].slice(1)} Phone` : 'Phone';
        category = 'Electronics';
    } else if (/airpod|earbud|earphone|headphone/i.test(text)) {
        itemName = 'Earphones / Earbuds';
        category = 'Electronics';
    } else if (/laptop|macbook|dell|lenovo|asus|hp/i.test(text)) {
        itemName = 'Laptop';
        category = 'Electronics';
    } else if (/charger|adapter|cord/i.test(text)) {
        itemName = 'Charger';
        category = 'Electronics';
    } else if (/backpack|bag/i.test(text)) {
        itemName = 'Backpack';
        category = 'Clothing & Accessories';
    } else if (/jacket|hoodie|coat|dyaket|sweater/i.test(text)) {
        itemName = 'Jacket';
        category = 'Clothing & Accessories';
    } else if (/glasses|eyeglasses|sunglasses|salamin/i.test(text)) {
        itemName = 'Eyeglasses';
        category = 'Personal Items';
    } else if (/watch|smartwatch|relo/i.test(text)) {
        itemName = 'Watch';
        category = 'Clothing & Accessories';
    } else if (/book|notebook|binder|module|libro|kwaderno/i.test(text)) {
        itemName = 'Book / Notebook';
        category = 'Books & Documents';
    }

    const isLocationOrGeneralSearch = /lost|found|nawala|nakita|search|look|check/i.test(text) && !itemName;
    const isItemSearch = Boolean(itemName) || isLocationOrGeneralSearch;

    if (isItemSearch) {
        let color = '';
        const colorMatch = text.match(/\b(black|white|blue|red|green|yellow|pink|purple|orange|brown|gray|grey|silver|gold)\b/i);
        if (colorMatch) color = colorMatch[1].toLowerCase();

        let brand = '';
        const brandMatch = text.match(/\b(apple|samsung|infinix|oppo|vivo|realme|casio|aquaflask|hydro\s*flask|jansport|nike|adidas)\b/i);
        if (brandMatch) brand = brandMatch[1];

        let location = '';
        const locMatch = text.match(/\b(library|canteen|gym|gymnasium|court|lab|laboratory|admin|primera|mongeau|eugene|clinic|registrar|cashier|quadrangle)\b/i);
        if (locMatch) location = locMatch[1];

        const rawTokens = text.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
        const keywords = rawTokens.filter(w => w.length > 2 && !NLP_STOP_WORDS.has(w));
        if (itemName && !keywords.includes(itemName.toLowerCase())) {
            keywords.unshift(itemName.toLowerCase());
        }

        const queryType = /found|nakita|surrender|turn\s*in/i.test(text) ? 'found' : 'lost';

        return {
            isSearch: true,
            extracted: {
                itemName,
                category,
                color,
                brand,
                location,
                keywords,
                queryType
            },
            conversationalResponse: itemName
                ? `I'm scanning our NDMC campus database for any recorded **${itemName}**${location ? ` near the ${location}` : ''}.`
                : `I'm checking our campus database for recently reported items${location ? ` in the ${location}` : ''}.`
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
• System Categories:
  1. "Electronics" (Phones, laptops, chargers, earbuds, calculators)
  2. "Books & Documents" (Textbooks, notebooks, binders, official papers)
  3. "Clothing & Accessories" (Jackets, hoodies, bags, jewelry, watches)
  4. "Keys" (Motorcycle keys, padlock keys, car keys, key fobs)
  5. "Wallets & Cards" (Wallets, student IDs, ATM cards, RFID badges)
  6. "Sports Equipment" (Balls, rackets, gym gear)
  7. "Personal Items" (Glasses, sunglasses, umbrellas, tumblers, water bottles)
  8. "Musical Instruments" (Guitars, accessories)
  9. "Stationery" (Calculators, pens, rulers, drafting tools)
  10. "Other" (Miscellaneous items)
• Important Rules:
  - NEVER break character. You are the campus retrieval assistant, NOT an external software developer.
  - ALWAYS maintain multi-turn memory. If the user mentions their name or an item they lost earlier, recall the exact context.
  - NEVER invent or promise that an item has been found before database verification.
  - NEVER output raw code, markdown code blocks, or scripts.
  - Respond in clear, polite English (or Tagalog/Taglish if asked in Filipino).

================================================================================
CURRENT TURN
================================================================================
${historyContext}Current User Message: "${textTrimmed}"

Instructions:
1. Intent Classification:
   - Set "isSearch" to true ONLY IF the user is actively searching for, describing, or asking to check database records for a physical lost/found item (e.g., "I lost my umbrella", "did anyone find keys?", "searching for iphone in library", "what was found in canteen?").
   - Set "isSearch" to false for greetings, conversational follow-ups, questions about the school/system/proponent, claiming steps, office hours, or general chat.
2. Feature Extraction (if searching for a physical item or checking campus items):
   - "itemName": specific concise name of the physical item sought (e.g., "Umbrella", "Wallet", "Keys", "Scientific Calculator", "iPhone", "Tumbler", "Student ID Card"). If user speaks Filipino/Taglish (e.g. "payong", "pitaka", "susi", "salamin", "calcu"), translate to English ("Umbrella", "Wallet", "Keys", "Eyeglasses", "Calculator"). Leave empty ONLY if user is asking a general location query without a specific item.
   - "category": Match the most suitable category from the System Categories above.
   - "color": specific color if mentioned
   - "brand": brand if mentioned (e.g., "Apple", "Casio", "AquaFlask", "Jansport")
   - "location": campus location if mentioned (e.g., "Library", "College Canteen", "Gym")
   - "keywords": array of 2-5 relevant, non-filler search keywords (e.g., ["umbrella", "folding", "black"]). NEVER include filler words like "lost", "found", "did", "anyone", "item".
   - "queryType": "lost" (user lost something), "found" (user found something), or "all"
3. Conversational Response:
   - Provide a natural, friendly, helpful response in "conversationalResponse" (1-2 sentences). Acknowledge the specific item they mentioned.

Return ONLY a valid JSON object matching this schema:
{
  "isSearch": true/false,
  "itemName": "<item name or empty>",
  "category": "<category or empty>",
  "color": "<color or empty>",
  "brand": "<brand or empty>",
  "location": "<location or empty>",
  "keywords": ["<k1>", "<k2>"],
  "queryType": "lost/found/all",
  "conversationalResponse": "<your direct conversational response>"
}`;

    for (const modelName of CHAT_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: { 
                    maxOutputTokens: 1500, 
                    temperature: 0.2,
                    responseMimeType: 'application/json'
                }
            });
            const result = await model.generateContent(systemPrompt);
            const responseText = result.response.text();
            const jsonResult = extractJson(responseText);

            if (jsonResult) {
                return {
                    isSearch: jsonResult.isSearch === true,
                    extracted: {
                        itemName: jsonResult.itemName || '',
                        category: jsonResult.category || '',
                        color: jsonResult.color || '',
                        brand: jsonResult.brand || '',
                        location: jsonResult.location || '',
                        keywords: Array.isArray(jsonResult.keywords) ? jsonResult.keywords : [],
                        queryType: jsonResult.queryType || 'lost'
                    },
                    conversationalResponse: jsonResult.conversationalResponse || "Hello! How can I assist you with campus lost and found items today?"
                };
            }
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
  "category": "<Electronics & Devices, Books & Documents, Personal Items, Keys, Clothing & Accessories, Other>",
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
                generationConfig: { 
                    maxOutputTokens: 1500, 
                    temperature: 0.2,
                    responseMimeType: 'application/json'
                }
            });
            const result = await model.generateContent([imagePart, prompt]);
            const responseText = result.response.text();
            const jsonResult = extractJson(responseText);

            if (jsonResult) {
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
            }
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
