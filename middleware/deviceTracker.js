const crypto = require('crypto');
const { BlockedDevice, TrackedDevice } = require('../models');

/**
 * Comprehensive device model database for accurate identification
 * Format: { pattern: regex, vendor: string, modelName: string (optional) }
 */
const DEVICE_DATABASE = {
    // Infinix Models (Transsion Holdings)
    infinix: [
        { pattern: /X6528/i, model: 'Hot 40i' },
        { pattern: /X6711/i, model: 'Hot 40 Pro' },
        { pattern: /X6710/i, model: 'Hot 40' },
        { pattern: /X6831/i, model: 'Note 40 Pro' },
        { pattern: /X6830/i, model: 'Note 40' },
        { pattern: /X6727/i, model: 'Note 30 Pro' },
        { pattern: /X6833B/i, model: 'Note 30 VIP' },
        { pattern: /X6726/i, model: 'Note 30' },
        { pattern: /X6515/i, model: 'Hot 30i' },
        { pattern: /X6516/i, model: 'Hot 30' },
        { pattern: /X6525/i, model: 'Hot 30 Play' },
        { pattern: /X6826/i, model: 'Zero 30' },
        { pattern: /X6821/i, model: 'Zero 20' },
        { pattern: /X6817/i, model: 'Zero Ultra' },
        { pattern: /X6511/i, model: 'Smart 7' },
        { pattern: /X6512/i, model: 'Smart 7 HD' },
        { pattern: /X665[A-Z]?/i, model: 'Note 11 Pro' },
        { pattern: /X663[A-Z]?/i, model: 'Note 11' },
        { pattern: /X662[A-Z]?/i, model: 'Hot 11S' },
        { pattern: /X670[A-Z]?/i, model: 'Hot 12' },
        { pattern: /X6819/i, model: 'Zero X Pro' },
        { pattern: /X6815/i, model: 'Zero X' },
        { pattern: /Infinix[- ]?([A-Za-z0-9 ]+)/i, model: null }, // Generic Infinix
    ],
    
    // Tecno Models (Transsion Holdings)
    tecno: [
        { pattern: /CK8n/i, model: 'Camon 20 Pro' },
        { pattern: /CK8/i, model: 'Camon 20' },
        { pattern: /CK7n/i, model: 'Camon 19 Pro' },
        { pattern: /CK7/i, model: 'Camon 19' },
        { pattern: /CH9n/i, model: 'Phantom X2 Pro' },
        { pattern: /CH9/i, model: 'Phantom X2' },
        { pattern: /AD8/i, model: 'Phantom V Fold' },
        { pattern: /BG6/i, model: 'Spark 10 Pro' },
        { pattern: /BG7/i, model: 'Spark 10' },
        { pattern: /KJ5/i, model: 'Pova 5' },
        { pattern: /KJ6/i, model: 'Pova 5 Pro' },
        { pattern: /KI5[A-Z]?/i, model: 'Pop 7 Pro' },
        { pattern: /TECNO[- ]?([A-Za-z0-9 ]+)/i, model: null },
    ],
    
    // iTel Models (Transsion Holdings)
    itel: [
        { pattern: /A665L/i, model: 'A60' },
        { pattern: /P662L/i, model: 'P40' },
        { pattern: /S661L/i, model: 'S23' },
        { pattern: /A663L/i, model: 'A58' },
        { pattern: /itel[- ]?([A-Za-z0-9 ]+)/i, model: null },
    ],
    
    // Samsung Models
    samsung: [
        { pattern: /SM-S928/i, model: 'Galaxy S24 Ultra' },
        { pattern: /SM-S926/i, model: 'Galaxy S24+' },
        { pattern: /SM-S921/i, model: 'Galaxy S24' },
        { pattern: /SM-S918/i, model: 'Galaxy S23 Ultra' },
        { pattern: /SM-S916/i, model: 'Galaxy S23+' },
        { pattern: /SM-S911/i, model: 'Galaxy S23' },
        { pattern: /SM-S908/i, model: 'Galaxy S22 Ultra' },
        { pattern: /SM-S906/i, model: 'Galaxy S22+' },
        { pattern: /SM-S901/i, model: 'Galaxy S22' },
        { pattern: /SM-G998/i, model: 'Galaxy S21 Ultra' },
        { pattern: /SM-G996/i, model: 'Galaxy S21+' },
        { pattern: /SM-G991/i, model: 'Galaxy S21' },
        { pattern: /SM-F946/i, model: 'Galaxy Z Fold5' },
        { pattern: /SM-F731/i, model: 'Galaxy Z Flip5' },
        { pattern: /SM-F936/i, model: 'Galaxy Z Fold4' },
        { pattern: /SM-F721/i, model: 'Galaxy Z Flip4' },
        { pattern: /SM-A546/i, model: 'Galaxy A54' },
        { pattern: /SM-A346/i, model: 'Galaxy A34' },
        { pattern: /SM-A145/i, model: 'Galaxy A14' },
        { pattern: /SM-A536/i, model: 'Galaxy A53' },
        { pattern: /SM-A336/i, model: 'Galaxy A33' },
        { pattern: /SM-A256/i, model: 'Galaxy A25' },
        { pattern: /SM-A156/i, model: 'Galaxy A15' },
        { pattern: /SM-A057/i, model: 'Galaxy A05s' },
        { pattern: /SM-M546/i, model: 'Galaxy M54' },
        { pattern: /SM-M346/i, model: 'Galaxy M34' },
        { pattern: /SM-N986/i, model: 'Galaxy Note 20 Ultra' },
        { pattern: /SM-N981/i, model: 'Galaxy Note 20' },
        { pattern: /SM-T[0-9]{3}/i, model: 'Galaxy Tab' },
        { pattern: /SM-[AGNMF][0-9]{3}[A-Z]?/i, model: null },
        { pattern: /GT-[A-Z][0-9]{4}/i, model: null },
    ],
    
    // Xiaomi/Redmi/POCO Models
    xiaomi: [
        { pattern: /2312DRA50G|Xiaomi 14 Ultra/i, model: 'Xiaomi 14 Ultra' },
        { pattern: /2311DRK48G|Xiaomi 14 Pro/i, model: 'Xiaomi 14 Pro' },
        { pattern: /2311DRK48C|Xiaomi 14/i, model: 'Xiaomi 14' },
        { pattern: /2304FPN6DC|Xiaomi 13 Ultra/i, model: 'Xiaomi 13 Ultra' },
        { pattern: /2210132G|Xiaomi 13 Pro/i, model: 'Xiaomi 13 Pro' },
        { pattern: /2211133G|Xiaomi 13/i, model: 'Xiaomi 13' },
        { pattern: /Redmi Note 13 Pro\+/i, model: 'Redmi Note 13 Pro+' },
        { pattern: /Redmi Note 13 Pro/i, model: 'Redmi Note 13 Pro' },
        { pattern: /Redmi Note 13/i, model: 'Redmi Note 13' },
        { pattern: /Redmi Note 12 Pro\+/i, model: 'Redmi Note 12 Pro+' },
        { pattern: /Redmi Note 12 Pro/i, model: 'Redmi Note 12 Pro' },
        { pattern: /Redmi Note 12/i, model: 'Redmi Note 12' },
        { pattern: /Redmi 13C/i, model: 'Redmi 13C' },
        { pattern: /Redmi 12/i, model: 'Redmi 12' },
        { pattern: /Redmi A3/i, model: 'Redmi A3' },
        { pattern: /Redmi A2/i, model: 'Redmi A2' },
        { pattern: /POCO X6 Pro/i, model: 'POCO X6 Pro' },
        { pattern: /POCO X6/i, model: 'POCO X6' },
        { pattern: /POCO X5 Pro/i, model: 'POCO X5 Pro' },
        { pattern: /POCO X5/i, model: 'POCO X5' },
        { pattern: /POCO M6 Pro/i, model: 'POCO M6 Pro' },
        { pattern: /POCO M6/i, model: 'POCO M6' },
        { pattern: /POCO F5 Pro/i, model: 'POCO F5 Pro' },
        { pattern: /POCO F5/i, model: 'POCO F5' },
        { pattern: /POCO C65/i, model: 'POCO C65' },
        { pattern: /Mi 1[0-4][A-Z]?( Ultra| Pro| Lite)?/i, model: null },
    ],
    
    // OPPO Models
    oppo: [
        { pattern: /CPH2591/i, model: 'Find X7 Ultra' },
        { pattern: /CPH2519/i, model: 'Find X6 Pro' },
        { pattern: /CPH2451/i, model: 'Find N3' },
        { pattern: /CPH2557/i, model: 'Reno 11 Pro' },
        { pattern: /CPH2553/i, model: 'Reno 11' },
        { pattern: /CPH2531/i, model: 'Reno 10 Pro+' },
        { pattern: /CPH2525/i, model: 'Reno 10 Pro' },
        { pattern: /CPH2521/i, model: 'Reno 10' },
        { pattern: /CPH2505/i, model: 'A98' },
        { pattern: /CPH2493/i, model: 'A78' },
        { pattern: /CPH2483/i, model: 'A58' },
        { pattern: /CPH2477/i, model: 'A38' },
        { pattern: /CPH2471/i, model: 'A18' },
        { pattern: /CPH2[0-9]{3}/i, model: null },
    ],
    
    // Vivo Models
    vivo: [
        { pattern: /V2324/i, model: 'X100 Pro' },
        { pattern: /V2310/i, model: 'X100' },
        { pattern: /V2219/i, model: 'X90 Pro+' },
        { pattern: /V2254/i, model: 'V30 Pro' },
        { pattern: /V2250/i, model: 'V30' },
        { pattern: /V2238/i, model: 'V29 Pro' },
        { pattern: /V2230/i, model: 'V29' },
        { pattern: /V2247/i, model: 'Y100' },
        { pattern: /V2239/i, model: 'Y78' },
        { pattern: /V2225/i, model: 'Y36' },
        { pattern: /V2[0-9]{3}/i, model: null },
    ],
    
    // Realme Models
    realme: [
        { pattern: /RMX3888/i, model: 'GT5 Pro' },
        { pattern: /RMX3851/i, model: 'GT Neo 5' },
        { pattern: /RMX3760/i, model: '12 Pro+' },
        { pattern: /RMX3761/i, model: '12 Pro' },
        { pattern: /RMX3762/i, model: '12' },
        { pattern: /RMX3710/i, model: 'C67' },
        { pattern: /RMX3706/i, model: 'C55' },
        { pattern: /RMX3627/i, model: '11 Pro+' },
        { pattern: /RMX3610/i, model: 'Narzo 60 Pro' },
        { pattern: /RMX3686/i, model: 'Note 50' },
        { pattern: /RMX[0-9]{4}/i, model: null },
    ],
    
    // OnePlus Models
    oneplus: [
        { pattern: /CPH2609|OnePlus 12/i, model: 'OnePlus 12' },
        { pattern: /CPH2449|OnePlus 11/i, model: 'OnePlus 11' },
        { pattern: /NE2213|OnePlus 10 Pro/i, model: 'OnePlus 10 Pro' },
        { pattern: /CPH2423|OnePlus Nord 3/i, model: 'Nord 3' },
        { pattern: /CPH2493|OnePlus Nord CE3/i, model: 'Nord CE 3' },
        { pattern: /OnePlus[- ]?([A-Za-z0-9 ]+)/i, model: null },
        { pattern: /ONEPLUS[- ]?A[0-9]+/i, model: null },
    ],
    
    // Huawei Models
    huawei: [
        { pattern: /ALT-L29/i, model: 'Mate 60 Pro' },
        { pattern: /ALT-AL00/i, model: 'Mate 60' },
        { pattern: /NOH-NX9/i, model: 'Mate 40 Pro' },
        { pattern: /OCE-AN10/i, model: 'Mate 40' },
        { pattern: /ABR-LX9/i, model: 'P60 Pro' },
        { pattern: /LNA-LX9/i, model: 'P60' },
        { pattern: /JAD-LX9/i, model: 'P50 Pro' },
        { pattern: /ABR-AL80/i, model: 'nova 12 Pro' },
        { pattern: /FOL-LX9/i, model: 'nova 11' },
        { pattern: /HUAWEI[- ]?([A-Za-z0-9 -]+)/i, model: null },
    ],
    
    // Honor Models
    honor: [
        { pattern: /FNE-NX9/i, model: 'Magic6 Pro' },
        { pattern: /PLK-LX1/i, model: 'Magic5 Pro' },
        { pattern: /ANY-NX1/i, model: '90 Pro' },
        { pattern: /REA-NX9/i, model: '90' },
        { pattern: /CRT-LX1/i, model: 'X9b' },
        { pattern: /ALI-NX1/i, model: 'X8a' },
        { pattern: /Honor[- ]?([A-Za-z0-9 ]+)/i, model: null },
    ],
    
    // Google Pixel Models
    google: [
        { pattern: /Pixel 8 Pro/i, model: 'Pixel 8 Pro' },
        { pattern: /Pixel 8a/i, model: 'Pixel 8a' },
        { pattern: /Pixel 8/i, model: 'Pixel 8' },
        { pattern: /Pixel 7 Pro/i, model: 'Pixel 7 Pro' },
        { pattern: /Pixel 7a/i, model: 'Pixel 7a' },
        { pattern: /Pixel 7/i, model: 'Pixel 7' },
        { pattern: /Pixel 6 Pro/i, model: 'Pixel 6 Pro' },
        { pattern: /Pixel 6a/i, model: 'Pixel 6a' },
        { pattern: /Pixel 6/i, model: 'Pixel 6' },
        { pattern: /Pixel Fold/i, model: 'Pixel Fold' },
    ],
    
    // Motorola Models
    motorola: [
        { pattern: /XT2347/i, model: 'Edge 50 Pro' },
        { pattern: /XT2343/i, model: 'Edge 50 Ultra' },
        { pattern: /XT2321/i, model: 'Edge 40 Pro' },
        { pattern: /XT2303/i, model: 'Razr 40 Ultra' },
        { pattern: /XT2251/i, model: 'Moto G84' },
        { pattern: /XT2245/i, model: 'Moto G54' },
        { pattern: /XT2239/i, model: 'Moto G34' },
        { pattern: /moto g[0-9]+/i, model: null },
        { pattern: /moto e[0-9]+/i, model: null },
        { pattern: /XT[0-9]{4}/i, model: null },
    ],
    
    // Nokia Models
    nokia: [
        { pattern: /Nokia G42/i, model: 'G42' },
        { pattern: /Nokia G22/i, model: 'G22' },
        { pattern: /Nokia C32/i, model: 'C32' },
        { pattern: /Nokia C22/i, model: 'C22' },
        { pattern: /Nokia C12/i, model: 'C12' },
        { pattern: /Nokia X30/i, model: 'X30' },
        { pattern: /Nokia[- ]?([A-Za-z0-9.]+)/i, model: null },
    ],
    
    // Sony Xperia Models
    sony: [
        { pattern: /XQ-DQ72/i, model: 'Xperia 1 VI' },
        { pattern: /XQ-DE72/i, model: 'Xperia 10 VI' },
        { pattern: /XQ-DC72/i, model: 'Xperia 1 V' },
        { pattern: /XQ-CC72/i, model: 'Xperia 10 V' },
        { pattern: /Xperia[- ]?([A-Za-z0-9 ]+)/i, model: null },
    ],
    
    // LG Models
    lg: [
        { pattern: /LM-V600/i, model: 'V60 ThinQ' },
        { pattern: /LM-G900/i, model: 'Velvet' },
        { pattern: /LM-K520/i, model: 'K52' },
        { pattern: /LM-[A-Z][0-9]{3}/i, model: null },
        { pattern: /LG-[A-Z][0-9]{3}/i, model: null },
    ],
    
    // ASUS Models
    asus: [
        { pattern: /ASUS_AI2302/i, model: 'ROG Phone 8 Pro' },
        { pattern: /ASUS_AI2201/i, model: 'ROG Phone 7' },
        { pattern: /ASUS_I006D/i, model: 'ZenFone 8' },
        { pattern: /ASUS_I004D/i, model: 'ROG Phone 5' },
        { pattern: /ZenFone/i, model: 'ZenFone' },
        { pattern: /ROG Phone/i, model: 'ROG Phone' },
    ],
    
    // ZTE Models
    zte: [
        { pattern: /NX713J/i, model: 'nubia Z60 Ultra' },
        { pattern: /NX709J/i, model: 'nubia Z50 Ultra' },
        { pattern: /NX669J/i, model: 'nubia Red Magic 8 Pro' },
        { pattern: /ZTE[- ]?([A-Za-z0-9]+)/i, model: null },
    ],
    
    // Lenovo Models
    lenovo: [
        { pattern: /TB371FC/i, model: 'Legion Tab' },
        { pattern: /L70081/i, model: 'Legion Phone Duel 2' },
        { pattern: /Lenovo[- ]?([A-Za-z0-9-]+)/i, model: null },
    ],
    
    // Nothing Phone
    nothing: [
        { pattern: /A065/i, model: 'Phone (2a)' },
        { pattern: /A063/i, model: 'Phone (2)' },
        { pattern: /A059/i, model: 'Phone (1)' },
    ],
    
    // Fairphone
    fairphone: [
        { pattern: /FP5/i, model: 'Fairphone 5' },
        { pattern: /FP4/i, model: 'Fairphone 4' },
    ],
    
    // Apple iPhone Models
    apple: [
        { pattern: /iPhone16,2/i, model: 'iPhone 15 Pro Max' },
        { pattern: /iPhone16,1/i, model: 'iPhone 15 Pro' },
        { pattern: /iPhone15,5/i, model: 'iPhone 15 Plus' },
        { pattern: /iPhone15,4/i, model: 'iPhone 15' },
        { pattern: /iPhone15,3/i, model: 'iPhone 14 Pro Max' },
        { pattern: /iPhone15,2/i, model: 'iPhone 14 Pro' },
        { pattern: /iPhone14,8/i, model: 'iPhone 14 Plus' },
        { pattern: /iPhone14,7/i, model: 'iPhone 14' },
        { pattern: /iPhone14,3/i, model: 'iPhone 13 Pro Max' },
        { pattern: /iPhone14,2/i, model: 'iPhone 13 Pro' },
        { pattern: /iPhone14,5/i, model: 'iPhone 13' },
        { pattern: /iPhone14,4/i, model: 'iPhone 13 mini' },
        { pattern: /iPad/i, model: 'iPad' },
    ],
};

/**
 * Get friendly model name from device database
 */
function getDeviceFromDatabase(userAgent) {
    const ua = userAgent || '';
    
    // Check each brand
    for (const [brand, models] of Object.entries(DEVICE_DATABASE)) {
        for (const deviceInfo of models) {
            const match = ua.match(deviceInfo.pattern);
            if (match) {
                // Get vendor name with proper capitalization
                const vendorNames = {
                    infinix: 'Infinix',
                    tecno: 'TECNO',
                    itel: 'iTel',
                    samsung: 'Samsung',
                    xiaomi: 'Xiaomi',
                    oppo: 'OPPO',
                    vivo: 'Vivo',
                    realme: 'Realme',
                    oneplus: 'OnePlus',
                    huawei: 'Huawei',
                    honor: 'Honor',
                    google: 'Google',
                    motorola: 'Motorola',
                    nokia: 'Nokia',
                    sony: 'Sony',
                    lg: 'LG',
                    asus: 'ASUS',
                    zte: 'ZTE',
                    lenovo: 'Lenovo',
                    nothing: 'Nothing',
                    fairphone: 'Fairphone',
                    apple: 'Apple',
                };
                
                const vendor = vendorNames[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
                let model = deviceInfo.model;
                
                // If no predefined model name, try to extract from match
                if (!model && match[1]) {
                    model = match[1].trim();
                } else if (!model) {
                    model = match[0];
                }
                
                return { vendor, model };
            }
        }
    }
    
    return null;
}

/**
 * Parse user agent string to extract device info - ENHANCED VERSION
 */
function parseUserAgent(userAgent) {
    const ua = userAgent || '';
    
    // Detect browser
    let browser = { name: 'Unknown', version: '' };
    if (ua.includes('Firefox/')) {
        browser.name = 'Firefox';
        browser.version = ua.match(/Firefox\/(\d+\.?\d*)/)?.[1] || '';
    } else if (ua.includes('Edg/')) {
        browser.name = 'Edge';
        browser.version = ua.match(/Edg\/(\d+\.?\d*)/)?.[1] || '';
    } else if (ua.includes('OPR/')) {
        browser.name = 'Opera';
        browser.version = ua.match(/OPR\/(\d+\.?\d*)/)?.[1] || '';
    } else if (ua.includes('Brave')) {
        browser.name = 'Brave';
        browser.version = ua.match(/Chrome\/(\d+\.?\d*)/)?.[1] || '';
    } else if (ua.includes('SamsungBrowser')) {
        browser.name = 'Samsung Internet';
        browser.version = ua.match(/SamsungBrowser\/(\d+\.?\d*)/)?.[1] || '';
    } else if (ua.includes('UCBrowser')) {
        browser.name = 'UC Browser';
        browser.version = ua.match(/UCBrowser\/(\d+\.?\d*)/)?.[1] || '';
    } else if (ua.includes('Chrome/')) {
        browser.name = 'Chrome';
        browser.version = ua.match(/Chrome\/(\d+\.?\d*)/)?.[1] || '';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
        browser.name = 'Safari';
        browser.version = ua.match(/Version\/(\d+\.?\d*)/)?.[1] || '';
    } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
        browser.name = 'Internet Explorer';
        browser.version = ua.match(/(?:MSIE |rv:)(\d+\.?\d*)/)?.[1] || '';
    }

    // Detect OS with more precision
    let os = { name: 'Unknown', version: '' };
    if (ua.includes('Windows NT 10')) {
        os.name = 'Windows';
        // Check for Windows 11 indicators
        if (ua.includes('Windows NT 10.0') && parseFloat(ua.match(/Chrome\/(\d+)/)?.[1] || 0) >= 93) {
            os.version = '10/11';
        } else {
            os.version = '10';
        }
    } else if (ua.includes('Windows NT 6.3')) {
        os.name = 'Windows';
        os.version = '8.1';
    } else if (ua.includes('Windows NT 6.2')) {
        os.name = 'Windows';
        os.version = '8';
    } else if (ua.includes('Windows NT 6.1')) {
        os.name = 'Windows';
        os.version = '7';
    } else if (ua.includes('Mac OS X')) {
        os.name = 'macOS';
        os.version = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/)?.[1]?.replace(/_/g, '.') || '';
    } else if (ua.includes('Android')) {
        os.name = 'Android';
        // Get full Android version including minor versions
        const androidMatch = ua.match(/Android (\d+(?:\.\d+)?(?:\.\d+)?)/);
        os.version = androidMatch ? androidMatch[1] : '';
    } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
        os.name = 'iOS';
        os.version = ua.match(/OS (\d+[._]\d+[._]?\d*)/)?.[1]?.replace(/_/g, '.') || '';
    } else if (ua.includes('CrOS')) {
        os.name = 'Chrome OS';
        os.version = ua.match(/CrOS [a-z0-9_]+ (\d+\.\d+)/)?.[1] || '';
    } else if (ua.includes('Linux')) {
        os.name = 'Linux';
        if (ua.includes('Ubuntu')) os.version = 'Ubuntu';
        else if (ua.includes('Fedora')) os.version = 'Fedora';
        else if (ua.includes('Debian')) os.version = 'Debian';
    }

    // Detect device type and brand - Use comprehensive database
    let device = { type: 'desktop', vendor: '', model: '' };
    
    // Check for mobile/tablet first
    const isMobile = ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone');
    const isTablet = ua.includes('Tablet') || ua.includes('iPad') || 
                     (ua.includes('Android') && !ua.includes('Mobile'));
    
    if (isMobile || isTablet) {
        device.type = isTablet ? 'tablet' : 'mobile';
        
        // Try to get device from comprehensive database first
        const dbMatch = getDeviceFromDatabase(ua);
        if (dbMatch) {
            device.vendor = dbMatch.vendor;
            device.model = dbMatch.model;
        } else {
            // Fallback: Try to extract Build ID for model identification
            // Android user agents often have: Build/MODEL_CODE or ; MODEL_CODE Build/
            const buildMatch = ua.match(/;\s*([A-Za-z0-9_\-]+(?:\s+[A-Za-z0-9_\-]+)*)\s+Build\//);
            if (buildMatch && buildMatch[1]) {
                const rawModel = buildMatch[1].trim();
                
                // Try to identify vendor from Build model
                if (/^X[0-9]{4}/i.test(rawModel)) {
                    device.vendor = 'Infinix';
                    device.model = rawModel;
                } else if (/^SM-/i.test(rawModel)) {
                    device.vendor = 'Samsung';
                    device.model = rawModel;
                } else if (/^RMX/i.test(rawModel)) {
                    device.vendor = 'Realme';
                    device.model = rawModel;
                } else if (/^CPH/i.test(rawModel)) {
                    device.vendor = 'OPPO';
                    device.model = rawModel;
                } else if (/^V[0-9]{4}/i.test(rawModel)) {
                    device.vendor = 'Vivo';
                    device.model = rawModel;
                } else if (/^(BG|CH|CK|KJ|AD)[0-9A-Z]+/i.test(rawModel)) {
                    device.vendor = 'TECNO';
                    device.model = rawModel;
                } else if (/^[A-Z][0-9]{3}L/i.test(rawModel)) {
                    device.vendor = 'iTel';
                    device.model = rawModel;
                } else if (/^XT[0-9]/i.test(rawModel)) {
                    device.vendor = 'Motorola';
                    device.model = rawModel;
                } else if (/^LM-/i.test(rawModel)) {
                    device.vendor = 'LG';
                    device.model = rawModel;
                } else if (/^(Pixel|Nexus)/i.test(rawModel)) {
                    device.vendor = 'Google';
                    device.model = rawModel;
                } else {
                    device.model = rawModel;
                }
            }
            
            // If still no vendor, try basic patterns
            if (!device.vendor) {
                if (ua.includes('iPhone')) {
                    device.vendor = 'Apple';
                    device.model = 'iPhone';
                } else if (ua.includes('iPad')) {
                    device.vendor = 'Apple';
                    device.model = 'iPad';
                } else if (ua.includes('Android')) {
                    device.vendor = 'Android';
                    device.model = 'Device';
                }
            }
        }
    } else {
        // Desktop device
        if (os.name === 'Windows') {
            device.vendor = 'Windows';
            device.model = 'PC';
        } else if (os.name === 'macOS') {
            device.vendor = 'Apple';
            device.model = 'Mac';
        } else if (os.name === 'Linux') {
            device.vendor = 'Linux';
            device.model = 'PC';
        } else if (os.name === 'Chrome OS') {
            device.vendor = 'Google';
            device.model = 'Chromebook';
        }
    }

    return { browser, os, device, rawUserAgent: ua };
}

/**
 * Get client IP address
 */
function getClientIP(req) {
    // Check for forwarded headers (when behind proxy/load balancer)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    
    // Check other common headers
    return req.headers['x-real-ip'] || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           req.ip ||
           'unknown';
}

/**
 * Generate device fingerprint
 */
function generateFingerprint(ip, userAgent) {
    const data = `${ip}-${userAgent}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

/**
 * Middleware to check if device is blocked
 */
async function checkBlocked(req, res, next) {
    try {
        const ip = getClientIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const fingerprint = generateFingerprint(ip, userAgent);

        // Check if device is blocked
        const blockedDevice = await BlockedDevice.findOne({ 
            fingerprint, 
            isActive: true 
        });

        if (blockedDevice) {
            // Update access attempt count
            blockedDevice.lastAccessAttempt = new Date();
            blockedDevice.accessAttempts += 1;
            await blockedDevice.save();

            // Return blocked page
            return res.status(403).render('blocked', {
                layout: false,
                title: 'Access Denied',
                reason: blockedDevice.reason,
                blockedAt: blockedDevice.blockedAt
            });
        }

        // Store device info in request for later use
        req.deviceInfo = {
            fingerprint,
            ip,
            userAgent,
            ...parseUserAgent(userAgent)
        };

        next();
    } catch (error) {
        console.error('Device check error:', error);
        next(); // Continue even if check fails
    }
}

/**
 * Middleware to track device visits
 */
async function trackDevice(req, res, next) {
    try {
        if (!req.deviceInfo) {
            const ip = getClientIP(req);
            const userAgent = req.headers['user-agent'] || '';
            const fingerprint = generateFingerprint(ip, userAgent);
            req.deviceInfo = {
                fingerprint,
                ip,
                userAgent,
                ...parseUserAgent(userAgent)
            };
        }

        const { fingerprint, ip, userAgent, browser, os, device } = req.deviceInfo;

        // Find or create tracked device
        let trackedDevice = await TrackedDevice.findOne({ fingerprint });

        if (trackedDevice) {
            // Update existing device
            trackedDevice.lastSeen = new Date();
            trackedDevice.visits += 1;
            trackedDevice.userAgent = userAgent;
            trackedDevice.browser = browser;
            trackedDevice.os = os;
            trackedDevice.device = device;

            // Update IP address tracking
            const existingIP = trackedDevice.ipAddresses.find(i => i.ip === ip);
            if (existingIP) {
                existingIP.lastSeen = new Date();
                existingIP.count += 1;
            } else {
                trackedDevice.ipAddresses.push({ ip, firstSeen: new Date(), lastSeen: new Date(), count: 1 });
            }

            // Track page visit (limit to last 100)
            trackedDevice.pages.push({ path: req.path, visitedAt: new Date() });
            if (trackedDevice.pages.length > 100) {
                trackedDevice.pages = trackedDevice.pages.slice(-100);
            }

            // Update user association if logged in
            if (req.session?.user) {
                const existingUser = trackedDevice.users.find(u => 
                    u.user && u.user.toString() === req.session.user._id.toString()
                );
                if (existingUser) {
                    existingUser.lastSeen = new Date();
                    existingUser.loginCount += 1;
                } else {
                    trackedDevice.users.push({ 
                        user: req.session.user._id, 
                        firstSeen: new Date(), 
                        lastSeen: new Date(), 
                        loginCount: 1 
                    });
                }
            }

            await trackedDevice.save();
        } else {
            // Create new tracked device
            const newDevice = new TrackedDevice({
                fingerprint,
                ipAddresses: [{ ip, firstSeen: new Date(), lastSeen: new Date(), count: 1 }],
                userAgent,
                browser,
                os,
                device,
                visits: 1,
                firstSeen: new Date(),
                lastSeen: new Date(),
                pages: [{ path: req.path, visitedAt: new Date() }]
            });

            if (req.session?.user) {
                newDevice.users.push({ 
                    user: req.session.user._id, 
                    firstSeen: new Date(), 
                    lastSeen: new Date(), 
                    loginCount: 1 
                });
            }

            await newDevice.save();
        }

        next();
    } catch (error) {
        console.error('Device tracking error:', error);
        next(); // Continue even if tracking fails
    }
}

module.exports = {
    parseUserAgent,
    getClientIP,
    generateFingerprint,
    checkBlocked,
    trackDevice
};
