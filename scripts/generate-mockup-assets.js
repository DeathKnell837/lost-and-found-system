const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const mockupsDir = path.join(__dirname, '../public/images/mockups');
const uploadsDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(mockupsDir)) fs.mkdirSync(mockupsDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

async function createVariant(sourceName, targetName, options = {}) {
    const src = path.join(mockupsDir, sourceName);
    const dest = path.join(mockupsDir, targetName);
    if (!fs.existsSync(src)) {
        console.warn(`Source ${src} missing, skipping ${targetName}`);
        return;
    }

    let pipeline = sharp(src);
    const meta = await pipeline.metadata();

    if (options.crop) {
        const width = Math.round(meta.width * options.crop.w);
        const height = Math.round(meta.height * options.crop.h);
        const left = Math.round(meta.width * options.crop.x);
        const top = Math.round(meta.height * options.crop.y);
        pipeline = pipeline.extract({ left, top, width, height });
    }

    if (options.rotate) {
        pipeline = pipeline.rotate(options.rotate);
    }

    if (options.modulate) {
        pipeline = pipeline.modulate(options.modulate);
    }

    if (options.tint) {
        pipeline = pipeline.tint(options.tint);
    }

    pipeline = pipeline.resize(1024, 768, { fit: 'cover' }).jpeg({ quality: 90 });
    await pipeline.toFile(dest);
    console.log(`Created variant: ${targetName}`);
}

async function createSvgGraphic(targetName, svgString) {
    const dest = path.join(mockupsDir, targetName);
    const svgBuffer = Buffer.from(svgString);
    await sharp(svgBuffer)
        .resize(1024, 768, { fit: 'cover' })
        .jpeg({ quality: 92 })
        .toFile(dest);
    console.log(`Created graphic asset: ${targetName}`);
}

async function run() {
    console.log('Generating realistic mockup image variants and assets...');

    // 1. Variations of existing photos for Lost vs Found pairs
    // Sarah Dela Cruz Lost Reference (close-up crop on ID card)
    await createVariant('student-id-sarah-delacruz.jpg', 'student-id-sarah-lost-ref.jpg', {
        crop: { x: 0.12, y: 0.1, w: 0.76, h: 0.78 }
    });

    // Asus Vivobook Lost Angle (crop closer to keyboard & screen)
    await createVariant('asus-vivobook-laptop.jpg', 'asus-vivobook-lost-angle.jpg', {
        crop: { x: 0.08, y: 0.12, w: 0.82, h: 0.76 }
    });

    // AquaFlask Lilac Lost Ref (close-up on tumbler body)
    await createVariant('aquaflask-lilac-tumbler.jpg', 'aquaflask-lilac-lost-ref.jpg', {
        crop: { x: 0.15, y: 0.05, w: 0.7, h: 0.88 }
    });

    // AquaFlask Mint Green Tumbler (hue shift to vibrant mint green)
    await createVariant('aquaflask-lilac-tumbler.jpg', 'aquaflask-mint-tumbler.jpg', {
        modulate: { hue: 140, saturation: 1.2, brightness: 1.05 }
    });

    // Apple AirPods Lost Case (tight crop on white charging case)
    await createVariant('apple-airpods-pro-case.jpg', 'apple-airpods-lost-case.jpg', {
        crop: { x: 0.18, y: 0.18, w: 0.64, h: 0.64 }
    });

    // Casio fx-991ES Lost Detail (tight crop on display & solar panel)
    await createVariant('casio-fx991es-calculator.jpg', 'casio-fx991es-lost-detail.jpg', {
        crop: { x: 0.1, y: 0.08, w: 0.8, h: 0.82 }
    });

    // Brown Leather Lost Wallet (tight crop on stitching)
    await createVariant('brown-leather-wallet.jpg', 'brown-leather-lost-wallet.jpg', {
        crop: { x: 0.12, y: 0.12, w: 0.76, h: 0.74 }
    });

    // Black Leather Cardholder (darker wallet variant)
    await createVariant('brown-leather-wallet.jpg', 'black-leather-cardholder.jpg', {
        modulate: { saturation: 0.15, brightness: 0.65 }
    });

    // Herschel Backpack Lost View (tight crop on canvas & straps)
    await createVariant('herschel-black-backpack.jpg', 'herschel-black-lost-backpack.jpg', {
        crop: { x: 0.1, y: 0.05, w: 0.8, h: 0.85 }
    });

    // Maroon JanSport Backpack (hue shift to college maroon)
    await createVariant('herschel-black-backpack.jpg', 'jansport-maroon-backpack.jpg', {
        tint: { r: 130, g: 30, b: 45 },
        modulate: { brightness: 1.1, saturation: 1.3 }
    });

    // Honda Keys Lost View (close crop on ignition key)
    await createVariant('honda-motorcycle-keys.jpg', 'honda-motorcycle-lost-keys.jpg', {
        crop: { x: 0.15, y: 0.12, w: 0.7, h: 0.72 }
    });

    // Yamaha Keys (red lanyard variant via hue/tint)
    await createVariant('honda-motorcycle-keys.jpg', 'yamaha-motorcycle-keys.jpg', {
        modulate: { hue: 200, saturation: 1.25 }
    });

    // Tortoiseshell Glasses Lost View (tight crop on acetate frames)
    await createVariant('tortoiseshell-eyeglasses.jpg', 'tortoiseshell-lost-glasses.jpg', {
        crop: { x: 0.12, y: 0.15, w: 0.75, h: 0.7 }
    });

    // Blue iPhone Lost Screen (crop on smartphone)
    await createVariant('blue-iphone-13.jpg', 'blue-iphone-lost-screen.jpg', {
        crop: { x: 0.12, y: 0.1, w: 0.75, h: 0.78 }
    });

    // Black Armor Smartphone (dark monochrome phone variant)
    await createVariant('blue-iphone-13.jpg', 'black-smartphone-found.jpg', {
        modulate: { saturation: 0.1, brightness: 0.7 }
    });

    // Navy Folding Umbrella Closed (close crop on umbrella handle)
    await createVariant('navy-folding-umbrella.jpg', 'navy-folding-umbrella-closed.jpg', {
        crop: { x: 0.15, y: 0.15, w: 0.7, h: 0.7 }
    });

    // Casio G-Shock Lost Watch (tight crop on digital face)
    await createVariant('casio-gshock-sports-watch.jpg', 'casio-gshock-lost-watch.jpg', {
        crop: { x: 0.18, y: 0.15, w: 0.65, h: 0.68 }
    });

    // Maroon Varsity Lost Hoodie (crop on embroidered chest logo)
    await createVariant('maroon-varsity-hoodie.jpg', 'maroon-varsity-lost-hoodie.jpg', {
        crop: { x: 0.15, y: 0.1, w: 0.7, h: 0.78 }
    });

    // Calculus Textbook Lost View (tight crop on book formulas)
    await createVariant('calculus-textbook-notebook.jpg', 'calculus-textbook-lost-view.jpg', {
        crop: { x: 0.08, y: 0.08, w: 0.82, h: 0.8 }
    });

    // 2. SVG-rendered graphic assets for missing categories:
    // Mark Villanueva Student ID Card
    const markIdSvg = `
    <svg width="1024" height="768" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4a3728"/>
          <stop offset="100%" stop-color="#2a1f18"/>
        </linearGradient>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f4ede2"/>
        </linearGradient>
        <linearGradient id="maroonBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#7a1c28"/>
          <stop offset="100%" stop-color="#55121b"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="768" fill="url(#bg)"/>
      <!-- Wood grain effect lines -->
      <path d="M0,150 Q512,180 1024,140 M0,380 Q512,410 1024,370 M0,600 Q512,630 1024,590" stroke="#3d2d20" stroke-width="4" fill="none" opacity="0.6"/>
      <!-- Lanyard strap -->
      <path d="M512,-50 Q490,160 480,240" stroke="#1d4d35" stroke-width="36" fill="none"/>
      <path d="M512,-50 Q490,160 480,240" stroke="#d4af37" stroke-dasharray="12,18" stroke-width="6" fill="none"/>
      <!-- ID Badge Card with Drop Shadow -->
      <rect x="230" y="160" width="564" height="460" rx="20" fill="#000" opacity="0.3" transform="translate(10, 15)"/>
      <rect x="230" y="160" width="564" height="460" rx="20" fill="url(#cardGrad)" stroke="#c8b8a0" stroke-width="3"/>
      <!-- Card Header -->
      <rect x="230" y="160" width="564" height="96" rx="20" fill="url(#maroonBar)"/>
      <rect x="230" y="236" width="564" height="20" fill="url(#maroonBar)"/>
      <!-- NDMC Logo Seal Placeholder -->
      <circle cx="295" cy="208" r="32" fill="#d4af37"/>
      <circle cx="295" cy="208" r="28" fill="#7a1c28"/>
      <text x="295" y="214" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#fff" text-anchor="middle">NDMC</text>
      <text x="340" y="200" font-family="'Times New Roman', serif" font-weight="bold" font-size="22" fill="#ffffff">NOTRE DAME OF MIDSAYAP COLLEGE</text>
      <text x="340" y="224" font-family="Arial, sans-serif" font-size="13" fill="#e5d0a0" letter-spacing="1">COLLEGE OF INFORMATION TECHNOLOGY &amp; ENGINEERING</text>
      <!-- Student Photo -->
      <rect x="270" y="280" width="160" height="195" rx="10" fill="#2c3e50" stroke="#888" stroke-width="2"/>
      <circle cx="350" cy="350" r="42" fill="#c49a6c"/>
      <path d="M308,445 C308,395 392,395 392,445 Z" fill="#1b2a4a"/>
      <rect x="270" y="482" width="160" height="20" rx="4" fill="#7a1c28"/>
      <text x="350" y="496" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#fff" text-anchor="middle">VALID AY 2025-2026</text>
      <!-- Student Details -->
      <text x="460" y="315" font-family="Arial, sans-serif" font-size="13" fill="#666">STUDENT NAME</text>
      <text x="460" y="345" font-family="Arial, sans-serif" font-weight="bold" font-size="26" fill="#111">MARK VILLANUEVA</text>
      <text x="460" y="380" font-family="Arial, sans-serif" font-size="13" fill="#666">COURSE &amp; YEAR</text>
      <text x="460" y="405" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#7a1c28">BS Information Technology - 3rd Year</text>
      <text x="460" y="440" font-family="Arial, sans-serif" font-size="13" fill="#666">STUDENT ID NUMBER</text>
      <text x="460" y="465" font-family="'Courier New', monospace" font-weight="bold" font-size="22" fill="#111">2022-10892</text>
      <!-- Barcode simulation -->
      <rect x="460" y="520" width="290" height="45" fill="#fff" stroke="#ccc" stroke-width="1"/>
      <g fill="#111">
        <rect x="475" y="528" width="4" height="28"/>
        <rect x="483" y="528" width="8" height="28"/>
        <rect x="495" y="528" width="3" height="28"/>
        <rect x="502" y="528" width="6" height="28"/>
        <rect x="514" y="528" width="4" height="28"/>
        <rect x="524" y="528" width="10" height="28"/>
        <rect x="540" y="528" width="5" height="28"/>
        <rect x="550" y="528" width="8" height="28"/>
        <rect x="564" y="528" width="4" height="28"/>
        <rect x="572" y="528" width="7" height="28"/>
        <rect x="585" y="528" width="4" height="28"/>
        <rect x="595" y="528" width="9" height="28"/>
        <rect x="610" y="528" width="5" height="28"/>
        <rect x="620" y="528" width="3" height="28"/>
        <rect x="630" y="528" width="7" height="28"/>
        <rect x="644" y="528" width="4" height="28"/>
        <rect x="655" y="528" width="8" height="28"/>
        <rect x="670" y="528" width="5" height="28"/>
        <rect x="682" y="528" width="9" height="28"/>
        <rect x="698" y="528" width="4" height="28"/>
        <rect x="708" y="528" width="6" height="28"/>
        <rect x="720" y="528" width="8" height="28"/>
      </g>
    </svg>`;
    await createSvgGraphic('student-id-mark-villanueva.jpg', markIdSvg);

    // NDMC Certificate of Matriculation (COM) / Registration Assessment Document
    const comSvg = `
    <svg width="1024" height="768" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="768" fill="#3a404a"/>
      <!-- Wood Table Underlay -->
      <rect x="80" y="40" width="864" height="688" rx="8" fill="#fcfbf7" stroke="#e0ded6" stroke-width="2"/>
      <!-- Header Border -->
      <rect x="110" y="65" width="804" height="105" fill="#7a1c28"/>
      <circle cx="165" cy="117" r="35" fill="#d4af37"/>
      <circle cx="165" cy="117" r="30" fill="#7a1c28"/>
      <text x="165" y="123" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#fff" text-anchor="middle">NDMC</text>
      <text x="220" y="105" font-family="'Times New Roman', serif" font-weight="bold" font-size="24" fill="#ffffff">NOTRE DAME OF MIDSAYAP COLLEGE</text>
      <text x="220" y="128" font-family="Arial, sans-serif" font-size="14" fill="#eed9b3">OFFICE OF THE REGISTRAR • CERTIFICATE OF MATRICULATION (COM)</text>
      <text x="220" y="148" font-family="Arial, sans-serif" font-size="12" fill="#fff">FIRST SEMESTER • ACADEMIC YEAR 2025-2026</text>
      <!-- Student Info Grid -->
      <rect x="110" y="185" width="804" height="85" fill="#f7f5ef" stroke="#ddd" stroke-width="1"/>
      <text x="130" y="212" font-family="Arial, sans-serif" font-size="13" fill="#555">STUDENT NAME:</text>
      <text x="250" y="212" font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="#111">DELA CRUZ, SARAH J.</text>
      <text x="560" y="212" font-family="Arial, sans-serif" font-size="13" fill="#555">STUDENT ID:</text>
      <text x="670" y="212" font-family="'Courier New', monospace" font-weight="bold" font-size="16" fill="#7a1c28">2023-45678</text>
      <text x="130" y="245" font-family="Arial, sans-serif" font-size="13" fill="#555">DEGREE / PROGRAM:</text>
      <text x="280" y="245" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#111">Bachelor of Science in Accountancy (BSA-2)</text>
      <!-- Enrolled Subject Table -->
      <rect x="110" y="285" width="804" height="30" fill="#7a1c28"/>
      <text x="130" y="305" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#fff">COURSE CODE</text>
      <text x="250" y="305" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#fff">DESCRIPTIVE TITLE</text>
      <text x="600" y="305" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#fff">UNITS</text>
      <text x="670" y="305" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#fff">TIME &amp; DAY</text>
      <text x="810" y="305" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#fff">ROOM</text>
      <!-- Rows -->
      <g font-family="'Courier New', monospace" font-size="13" fill="#222">
        <text x="130" y="340">ACT 201</text><text x="250" y="340">Intermediate Accounting 1</text><text x="615" y="340">3.0</text><text x="670" y="340">MWF 08:00-09:00</text><text x="810" y="340">Bldg 1-204</text>
        <line x1="110" y1="352" x2="914" y2="352" stroke="#eee"/>
        <text x="130" y="375">ACT 203</text><text x="250" y="375">Cost Accounting and Control</text><text x="615" y="375">3.0</text><text x="670" y="375">TTH 09:30-11:00</text><text x="810" y="375">Bldg 1-205</text>
        <line x1="110" y1="387" x2="914" y2="387" stroke="#eee"/>
        <text x="130" y="410">LAW 101</text><text x="250" y="410">Law on Obligations and Contracts</text><text x="615" y="410">3.0</text><text x="670" y="410">MWF 10:00-11:00</text><text x="810" y="410">Bldg 8-102</text>
        <line x1="110" y1="422" x2="914" y2="422" stroke="#eee"/>
        <text x="130" y="445">ECO 102</text><text x="250" y="445">Managerial Economics</text><text x="615" y="445">3.0</text><text x="670" y="445">TTH 13:00-14:30</text><text x="810" y="410">Bldg 26-101</text>
        <line x1="110" y1="457" x2="914" y2="457" stroke="#eee"/>
        <text x="130" y="480">PE 103</text><text x="250" y="480">Physical Activities &amp; Fitness</text><text x="615" y="480">2.0</text><text x="670" y="480">SAT 08:00-10:00</text><text x="810" y="480">Gym 14</text>
      </g>
      <!-- Official Registrar Stamp -->
      <g transform="translate(680, 560) rotate(-12)">
        <circle cx="80" cy="50" r="58" fill="none" stroke="#2563eb" stroke-width="3" stroke-dasharray="6,4"/>
        <circle cx="80" cy="50" r="50" fill="none" stroke="#2563eb" stroke-width="2"/>
        <text x="80" y="36" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="#2563eb" text-anchor="middle">NOTRE DAME OF MIDSAYAP</text>
        <text x="80" y="55" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#2563eb" text-anchor="middle">OFFICIALLY ENROLLED</text>
        <text x="80" y="72" font-family="Arial, sans-serif" font-size="10" fill="#2563eb" text-anchor="middle">REGISTRAR OFFICE</text>
      </g>
    </svg>`;
    await createSvgGraphic('college-registration-com.jpg', comSvg);

    // Spalding Indoor Basketball (Sports Equipment)
    const basketballSvg = `
    <svg width="1024" height="768" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="court" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#b8834a"/>
          <stop offset="100%" stop-color="#69431e"/>
        </radialGradient>
        <radialGradient id="ballShade" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stop-color="#e86b24"/>
          <stop offset="60%" stop-color="#c44a0e"/>
          <stop offset="100%" stop-color="#6e2504"/>
        </radialGradient>
      </defs>
      <rect width="1024" height="768" fill="url(#court)"/>
      <!-- Court Floor Planks -->
      <line x1="0" y1="200" x2="1024" y2="200" stroke="#523215" stroke-width="3"/>
      <line x1="0" y1="420" x2="1024" y2="420" stroke="#523215" stroke-width="3"/>
      <line x1="0" y1="640" x2="1024" y2="640" stroke="#523215" stroke-width="3"/>
      <line x1="512" y1="0" x2="512" y2="768" stroke="#ffffff" stroke-width="8" opacity="0.4"/>
      <!-- Basketball Shadow -->
      <ellipse cx="512" cy="560" rx="210" ry="45" fill="#000" opacity="0.45"/>
      <!-- Basketball Body -->
      <circle cx="512" cy="400" r="190" fill="url(#ballShade)"/>
      <!-- Basketball Ribs / Seams -->
      <circle cx="512" cy="400" r="190" fill="none" stroke="#1a110b" stroke-width="5"/>
      <path d="M512,210 L512,590" stroke="#1a110b" stroke-width="6"/>
      <path d="M322,400 L702,400" stroke="#1a110b" stroke-width="6"/>
      <path d="M360,260 Q512,400 360,540" fill="none" stroke="#1a110b" stroke-width="6"/>
      <path d="M664,260 Q512,400 664,540" fill="none" stroke="#1a110b" stroke-width="6"/>
      <!-- Spalding Brand & Text -->
      <text x="512" y="380" font-family="'Impact', Arial Black, sans-serif" font-size="44" fill="#1a110b" text-anchor="middle" letter-spacing="3">SPALDING</text>
      <text x="512" y="435" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#1a110b" text-anchor="middle" letter-spacing="2">TF-1000 LEGACY</text>
      <text x="512" y="465" font-family="Arial, sans-serif" font-size="12" fill="#2d1c0f" text-anchor="middle">NDMC ATHLETICS DEPT.</text>
    </svg>`;
    await createSvgGraphic('spalding-indoor-basketball.jpg', basketballSvg);

    // Yonex Badminton Racket in Case (Sports Equipment)
    const racketSvg = `
    <svg width="1024" height="768" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gymBench" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4a5568"/>
          <stop offset="100%" stop-color="#2d3748"/>
        </linearGradient>
        <linearGradient id="caseGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1a202c"/>
          <stop offset="100%" stop-color="#0f131a"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="768" fill="url(#gymBench)"/>
      <!-- Wooden Bleacher Slate -->
      <rect x="80" y="100" width="864" height="568" rx="16" fill="#2d3748" stroke="#1a202c" stroke-width="4"/>
      <!-- Shadow -->
      <path d="M220,530 L820,230 L840,280 L240,580 Z" fill="#000" opacity="0.4"/>
      <!-- Racket Head Bag (Oval) -->
      <ellipse cx="360" cy="460" rx="170" ry="120" fill="url(#caseGrad)" stroke="#e53e3e" stroke-width="8" transform="rotate(-25 360 460)"/>
      <!-- Racket Shaft & Handle Bag -->
      <path d="M480,410 L780,270 L800,310 L500,450 Z" fill="url(#caseGrad)"/>
      <!-- Zipper trim -->
      <path d="M470,415 L770,275" stroke="#cbd5e0" stroke-width="3" stroke-dasharray="4,3"/>
      <!-- Yonex Brand on Case -->
      <g transform="translate(350, 440) rotate(-25)">
        <polygon points="-40,-15 -20,-15 -10,0 -30,0" fill="#3182ce"/>
        <polygon points="-15,-15 5,-15 15,0 -5,0" fill="#e53e3e"/>
        <text x="35" y="0" font-family="'Arial Black', sans-serif" font-weight="900" font-size="34" fill="#ffffff">YONEX</text>
        <text x="0" y="28" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#cbd5e0">NANORAY 70 LIGHT</text>
      </g>
      <!-- Shuttlecock near racket -->
      <circle cx="700" cy="520" r="16" fill="#f7fafc" stroke="#cbd5e0" stroke-width="2"/>
      <path d="M685,520 L660,470 L740,470 L715,520 Z" fill="#edf2f7" stroke="#cbd5e0" stroke-width="1" opacity="0.9"/>
    </svg>`;
    await createSvgGraphic('yonex-badminton-racket.jpg', racketSvg);

    // Acoustic Guitar Gig Bag Case (Musical Instruments)
    const guitarSvg = `
    <svg width="1024" height="768" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="768" fill="#1e2229"/>
      <!-- Wall & Floor Angle in Primera Hall -->
      <polygon points="0,520 1024,520 1024,768 0,768" fill="#2b313d"/>
      <line x1="0" y1="520" x2="1024" y2="520" stroke="#161a22" stroke-width="4"/>
      <!-- Guitar Case Body Shadow -->
      <ellipse cx="440" cy="460" rx="210" ry="160" fill="#000" opacity="0.5" transform="rotate(18 440 460)"/>
      <!-- Gig Bag Canvas Body -->
      <g transform="translate(512, 384) rotate(-35) translate(-512, -384)">
        <!-- Lower Bout -->
        <circle cx="360" cy="384" r="130" fill="#181a1f" stroke="#e67e22" stroke-width="5"/>
        <!-- Upper Bout -->
        <circle cx="530" cy="384" r="95" fill="#181a1f" stroke="#e67e22" stroke-width="5"/>
        <!-- Waist connector -->
        <rect x="420" y="270" width="90" height="228" fill="#181a1f"/>
        <!-- Neck Case -->
        <rect x="600" y="340" width="220" height="88" rx="10" fill="#181a1f" stroke="#e67e22" stroke-width="5"/>
        <!-- Headstock Pocket -->
        <rect x="800" y="325" width="90" height="118" rx="12" fill="#181a1f" stroke="#e67e22" stroke-width="5"/>
        <!-- Front Pocket -->
        <rect x="300" y="330" width="130" height="110" rx="8" fill="#252930" stroke="#444" stroke-width="2"/>
        <!-- Yamaha Logo on Pocket -->
        <circle cx="365" cy="370" r="16" fill="#e67e22"/>
        <text x="365" y="415" font-family="'Arial Black', sans-serif" font-size="16" fill="#ffffff" text-anchor="middle">YAMAHA</text>
        <text x="365" y="430" font-family="Arial, sans-serif" font-size="10" fill="#aaa" text-anchor="middle">F310 ACOUSTIC</text>
        <!-- Padded Handle -->
        <rect x="460" y="240" width="80" height="22" rx="8" fill="#e67e22"/>
      </g>
    </svg>`;
    await createSvgGraphic('acoustic-guitar-case.jpg', guitarSvg);

    // Clip-on Chromatic Guitar Tuner (Musical Instruments)
    const tunerSvg = `
    <svg width="1024" height="768" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="768" fill="#2c2724"/>
      <!-- Sheet music on table background -->
      <rect x="180" y="100" width="664" height="568" rx="8" fill="#fdfcf7" stroke="#d5cfc1" stroke-width="2"/>
      <g stroke="#333" stroke-width="1.5">
        <line x1="230" y1="160" x2="790" y2="160"/><line x1="230" y1="172" x2="790" y2="172"/>
        <line x1="230" y1="184" x2="790" y2="184"/><line x1="230" y1="196" x2="790" y2="196"/>
        <line x1="230" y1="208" x2="790" y2="208"/>
        <line x1="230" y1="260" x2="790" y2="260"/><line x1="230" y1="272" x2="790" y2="272"/>
        <line x1="230" y1="284" x2="790" y2="284"/><line x1="230" y1="296" x2="790" y2="296"/>
        <line x1="230" y1="308" x2="790" y2="308"/>
      </g>
      <!-- Clip-on Digital Tuner Device -->
      <!-- Shadow -->
      <rect x="440" y="320" width="240" height="300" rx="24" fill="#000" opacity="0.45" transform="translate(10, 15)"/>
      <!-- Tuner Body -->
      <rect x="440" y="320" width="240" height="300" rx="24" fill="#1a1a1a" stroke="#333" stroke-width="4"/>
      <!-- Display Screen (LCD) -->
      <rect x="465" y="350" width="190" height="180" rx="14" fill="#08140c" stroke="#222" stroke-width="2"/>
      <!-- Tuning Meter Needle & Note -->
      <path d="M495,440 A65,65 0 0,1 625,440" fill="none" stroke="#22543d" stroke-width="8"/>
      <line x1="560" y1="440" x2="560" y2="385" stroke="#38a169" stroke-width="6"/>
      <text x="560" y="490" font-family="'Arial Black', sans-serif" font-weight="900" font-size="54" fill="#48bb78" text-anchor="middle">E</text>
      <text x="560" y="515" font-family="'Courier New', monospace" font-size="16" fill="#38a169" text-anchor="middle">440 Hz</text>
      <!-- Power Button -->
      <circle cx="560" cy="575" r="18" fill="#2d3748" stroke="#4a5568" stroke-width="2"/>
      <text x="560" y="581" font-family="Arial, sans-serif" font-size="14" fill="#e2e8f0" text-anchor="middle">⏻</text>
      <!-- Clip Base -->
      <path d="M420,440 C380,450 380,520 440,530 Z" fill="#111" stroke="#222" stroke-width="3"/>
    </svg>`;
    await createSvgGraphic('guitar-clipon-tuner.jpg', tunerSvg);

    // Engineering Technical Drafting Triangle & Compass Set (Stationery)
    const draftingSvg = `
    <svg width="1024" height="768" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="768" fill="#e2e8f0"/>
      <!-- Green Drafting Cutting Mat Grid -->
      <rect x="80" y="60" width="864" height="648" rx="8" fill="#1c4532" stroke="#0f291e" stroke-width="4"/>
      <!-- Grid lines -->
      <g stroke="#2f664e" stroke-width="1">
        <line x1="80" y1="160" x2="944" y2="160"/><line x1="80" y1="260" x2="944" y2="260"/>
        <line x1="80" y1="360" x2="944" y2="360"/><line x1="80" y1="460" x2="944" y2="460"/>
        <line x1="80" y1="560" x2="944" y2="560"/><line x1="80" y1="660" x2="944" y2="660"/>
        <line x1="180" y1="60" x2="180" y2="708"/><line x1="280" y1="60" x2="280" y2="708"/>
        <line x1="380" y1="60" x2="380" y2="708"/><line x1="480" y1="60" x2="480" y2="708"/>
        <line x1="580" y1="60" x2="580" y2="708"/><line x1="680" y1="60" x2="680" y2="708"/>
        <line x1="780" y1="60" x2="780" y2="708"/><line x1="880" y1="60" x2="880" y2="708"/>
      </g>
      <!-- Transparent 30-60 Triangle Ruler -->
      <polygon points="220,580 720,580 720,290" fill="#63b3ed" opacity="0.45" stroke="#3182ce" stroke-width="3"/>
      <polygon points="360,540 680,540 680,360" fill="#1c4532" stroke="#3182ce" stroke-width="2"/>
      <text x="490" y="570" font-family="Arial, sans-serif" font-size="12" fill="#fff">ROTAPEN 30/60 PROFESSIONAL</text>
      <!-- Silver Precision Compass -->
      <g stroke="#cbd5e0" stroke-width="8" stroke-linecap="round">
        <line x1="460" y1="220" x2="380" y2="440"/>
        <line x1="460" y1="220" x2="540" y2="440"/>
      </g>
      <circle cx="460" cy="220" r="14" fill="#a0aec0" stroke="#718096" stroke-width="3"/>
      <!-- Compass adjustment wheel -->
      <circle cx="460" cy="320" r="12" fill="#d69e2e" stroke="#b7791f" stroke-width="2"/>
      <line x1="420" y1="320" x2="500" y2="320" stroke="#d69e2e" stroke-width="4"/>
      <!-- Mechanical Pencil (Rotring 0.5) -->
      <rect x="760" y="160" width="22" height="420" rx="4" fill="#2d3748" stroke="#1a202c" stroke-width="2"/>
      <rect x="762" y="180" width="18" height="6" fill="#e53e3e"/>
      <polygon points="760,580 782,580 771,620" fill="#a0aec0"/>
      <line x1="771" y1="620" x2="771" y2="640" stroke="#2d3748" stroke-width="2"/>
    </svg>`;
    await createSvgGraphic('drafting-triangle-compass.jpg', draftingSvg);

    // St. Benedict Dormitory Brass Keys with NDMC Emblem Acrylic Tag (Keys)
    const dormKeysSvg = `
    <svg width="1024" height="768" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="deskBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#5a4230"/>
          <stop offset="100%" stop-color="#342318"/>
        </radialGradient>
        <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f6e05e"/>
          <stop offset="50%" stop-color="#d69e2e"/>
          <stop offset="100%" stop-color="#b7791f"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="768" fill="url(#deskBg)"/>
      <!-- Shadow -->
      <ellipse cx="512" cy="460" rx="260" ry="140" fill="#000" opacity="0.45"/>
      <!-- Metal Keyring -->
      <circle cx="420" cy="340" r="55" fill="none" stroke="#cbd5e0" stroke-width="12"/>
      <circle cx="420" cy="340" r="48" fill="none" stroke="#718096" stroke-width="3"/>
      <!-- Acrylic NDMC Keychain Tag -->
      <g transform="translate(320, 240) rotate(-15)">
        <rect x="0" y="0" width="140" height="200" rx="18" fill="#7a1c28" stroke="#d4af37" stroke-width="4"/>
        <circle cx="70" cy="25" r="8" fill="#342318" stroke="#cbd5e0" stroke-width="3"/>
        <circle cx="70" cy="90" r="40" fill="#d4af37"/>
        <circle cx="70" cy="90" r="34" fill="#7a1c28"/>
        <text x="70" y="97" font-family="'Times New Roman', serif" font-weight="bold" font-size="20" fill="#ffffff" text-anchor="middle">NDMC</text>
        <text x="70" y="150" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#f6e05e" text-anchor="middle">LADIES DORM</text>
        <text x="70" y="172" font-family="'Courier New', monospace" font-weight="bold" font-size="18" fill="#ffffff" text-anchor="middle">RM-208</text>
      </g>
      <!-- Brass Key 1 -->
      <g transform="translate(430, 360) rotate(35)">
        <!-- Bow / Head -->
        <circle cx="40" cy="40" r="38" fill="url(#brass)" stroke="#744210" stroke-width="3"/>
        <circle cx="40" cy="40" r="14" fill="#342318"/>
        <text x="40" y="24" font-family="Arial, sans-serif" font-weight="bold" font-size="10" fill="#744210" text-anchor="middle">YALE</text>
        <!-- Shaft -->
        <rect x="75" y="32" width="160" height="18" fill="url(#brass)" stroke="#744210" stroke-width="2"/>
        <!-- Bits / Cuts -->
        <rect x="150" y="16" width="15" height="18" fill="url(#brass)"/>
        <rect x="175" y="12" width="18" height="22" fill="url(#brass)"/>
        <rect x="205" y="8" width="22" height="26" fill="url(#brass)"/>
      </g>
      <!-- Brass Key 2 -->
      <g transform="translate(410, 370) rotate(70)">
        <circle cx="40" cy="40" r="34" fill="url(#brass)" stroke="#744210" stroke-width="3"/>
        <circle cx="40" cy="40" r="12" fill="#342318"/>
        <rect x="70" y="32" width="140" height="16" fill="url(#brass)" stroke="#744210" stroke-width="2"/>
        <rect x="140" y="16" width="16" height="18" fill="url(#brass)"/>
        <rect x="170" y="10" width="24" height="24" fill="url(#brass)"/>
      </g>
    </svg>`;
    await createSvgGraphic('dorm-brass-keys.jpg', dormKeysSvg);

    // Chemistry / Science Lab Impact Safety Goggles (Other Category)
    const gogglesSvg = `
    <svg width="1024" height="768" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="labBench" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2d3748"/>
          <stop offset="100%" stop-color="#1a202c"/>
        </radialGradient>
        <linearGradient id="lensGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e6fffa" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#b2f5ea" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#81e6d9" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="768" fill="url(#labBench)"/>
      <!-- Science Lab Worktop Surface -->
      <rect x="80" y="80" width="864" height="608" rx="16" fill="#171923" stroke="#4a5568" stroke-width="3"/>
      <!-- Shadow -->
      <ellipse cx="512" cy="450" rx="330" ry="120" fill="#000" opacity="0.6"/>
      <!-- Black Elastic Headband Strap -->
      <path d="M210,380 C180,380 140,430 220,450 C360,470 660,470 800,450 C880,430 840,380 810,380" fill="none" stroke="#1a202c" stroke-width="26"/>
      <path d="M210,380 C180,380 140,430 220,450 C360,470 660,470 800,450 C880,430 840,380 810,380" fill="none" stroke="#4a5568" stroke-width="2"/>
      <!-- Goggles Silicone Transparent Frame -->
      <rect x="230" y="270" width="564" height="210" rx="55" fill="#e2e8f0" opacity="0.35" stroke="#718096" stroke-width="6"/>
      <!-- Left Lens Eye Area -->
      <rect x="260" y="295" width="220" height="160" rx="40" fill="url(#lensGrad)" stroke="#4fd1c5" stroke-width="3"/>
      <!-- Right Lens Eye Area -->
      <rect x="544" y="295" width="220" height="160" rx="40" fill="url(#lensGrad)" stroke="#4fd1c5" stroke-width="3"/>
      <!-- Lens Reflections -->
      <path d="M280,320 L360,320 L300,420 L280,420 Z" fill="#ffffff" opacity="0.4"/>
      <path d="M564,320 L644,320 L584,420 L564,420 Z" fill="#ffffff" opacity="0.4"/>
      <!-- Ventilation Caps (4 corner vents) -->
      <circle cx="280" cy="300" r="10" fill="#2d3748" stroke="#a0aec0" stroke-width="2"/>
      <circle cx="460" cy="300" r="10" fill="#2d3748" stroke="#a0aec0" stroke-width="2"/>
      <circle cx="564" cy="300" r="10" fill="#2d3748" stroke="#a0aec0" stroke-width="2"/>
      <circle cx="744" cy="300" r="10" fill="#2d3748" stroke="#a0aec0" stroke-width="2"/>
      <!-- Bridge / Nosepiece -->
      <path d="M480,420 Q512,390 544,420" stroke="#718096" stroke-width="8" fill="none"/>
      <!-- Lab Badge Text -->
      <text x="512" y="525" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#a0aec0" text-anchor="middle">NDMC NEW SCIENCE LABORATORY • ROOM 302</text>
    </svg>`;
    await createSvgGraphic('lab-safety-goggles.jpg', gogglesSvg);

    // Sync all generated mockups to public/uploads
    console.log('Syncing all images to public/uploads...');
    const allFiles = fs.readdirSync(mockupsDir);
    for (const f of allFiles) {
        fs.copyFileSync(path.join(mockupsDir, f), path.join(uploadsDir, f));
    }
    console.log(`Sync complete. Total images in uploads: ${allFiles.length}`);
}

run().catch(err => console.error('Asset generation failed:', err));
