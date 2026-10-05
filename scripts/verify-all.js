const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

function get(urlPath, cookies = '') {
    return new Promise((resolve, reject) => {
        const req = http.get({
            hostname: 'localhost',
            port: 3000,
            path: urlPath,
            headers: cookies ? { 'Cookie': cookies } : {}
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                body: data
            }));
        });
        req.on('error', reject);
    });
}

function postJson(urlPath, bodyObj, cookies = '') {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(bodyObj);
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: urlPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                ...(cookies ? { 'Cookie': cookies } : {})
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch (_) {}
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: parsed || data
                });
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function postMultipart(urlPath, fields, fileField, filePath, cookies = '') {
    return new Promise((resolve, reject) => {
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        let header = '';
        for (const [key, val] of Object.entries(fields)) {
            header += `--${boundary}\r\n`;
            header += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
            header += `${val}\r\n`;
        }
        
        let fileHeader = '';
        let fileBuffer = Buffer.alloc(0);
        if (filePath && fs.existsSync(filePath)) {
            fileBuffer = fs.readFileSync(filePath);
            const fileName = path.basename(filePath);
            fileHeader += `--${boundary}\r\n`;
            fileHeader += `Content-Disposition: form-data; name="${fileField}"; filename="${fileName}"\r\n`;
            fileHeader += `Content-Type: image/jpeg\r\n\r\n`;
        }

        const footer = `\r\n--${boundary}--\r\n`;
        const payload = Buffer.concat([
            Buffer.from(header, 'utf8'),
            Buffer.from(fileHeader, 'utf8'),
            fileBuffer,
            Buffer.from(footer, 'utf8')
        ]);

        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: urlPath,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': payload.length,
                ...(cookies ? { 'Cookie': cookies } : {})
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch (_) {}
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: parsed || data
                });
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function verify() {
    console.log('=== STARTING DEEP SYSTEM VERIFICATION ===\n');
    let passed = 0;
    let failed = 0;

    function assert(cond, name, details = '') {
        if (cond) {
            console.log(`[PASS] ${name} ${details ? '(' + details + ')' : ''}`);
            passed++;
        } else {
            console.error(`[FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
            failed++;
        }
    }

    // 1. Static Asset Serving
    const testAssets = [
        'student-id-sarah-delacruz.jpg',
        'student-id-mark-villanueva.jpg',
        'asus-vivobook-laptop.jpg',
        'aquaflask-lilac-tumbler.jpg',
        'aquaflask-mint-tumbler.jpg',
        'apple-airpods-pro-case.jpg',
        'spalding-indoor-basketball.jpg',
        'yonex-badminton-racket.jpg',
        'acoustic-guitar-case.jpg',
        'guitar-clipon-tuner.jpg',
        'college-registration-com.jpg',
        'drafting-triangle-compass.jpg',
        'dorm-brass-keys.jpg',
        'lab-safety-goggles.jpg'
    ];

    console.log('--- 1. Testing Static Mockup Assets Delivery ---');
    for (const a of testAssets) {
        const res = await get(`/uploads/${a}`);
        assert(
            res.statusCode === 200 && res.headers['content-type']?.includes('image'),
            `Serve /uploads/${a}`,
            `${res.statusCode}, len: ${res.body.length}`
        );
    }

    // 2. Page Rendering & Data Counts
    console.log('\n--- 2. Testing Page Rendering & Category Catalogs ---');
    const homeRes = await get('/');
    assert(homeRes.statusCode === 200 && homeRes.body.includes('Campus Lost &amp; Found') || homeRes.body.includes('Campus Lost & Found'), 'GET / (Home)', `HTTP ${homeRes.statusCode}`);

    const lostRes = await get('/items/lost');
    assert(lostRes.statusCode === 200 && lostRes.body.includes('Lost Items'), 'GET /items/lost', `HTTP ${lostRes.statusCode}`);

    const foundRes = await get('/items/found');
    assert(foundRes.statusCode === 200 && foundRes.body.includes('Found Items'), 'GET /items/found', `HTTP ${foundRes.statusCode}`);

    const claimedRes = await get('/items/claimed');
    assert(claimedRes.statusCode === 200 && claimedRes.body.includes('Claimed Items'), 'GET /items/claimed', `HTTP ${claimedRes.statusCode}`);

    // 3. Item Details & Potential Match Rendering
    console.log('\n--- 3. Testing Item Details Page & AI Match Card ---');
    // Extract an item ID from /items/lost
    const idMatch = lostRes.body.match(/\/items\/([a-f0-9]{24})/);
    if (idMatch) {
        const itemId = idMatch[1];
        const detailRes = await get(`/items/${itemId}`);
        assert(
            detailRes.statusCode === 200 && (detailRes.body.includes('Potential Matches') || detailRes.body.includes('Match') || detailRes.body.includes('/uploads/')),
            `GET /items/${itemId} (Detail)`,
            `HTTP ${detailRes.statusCode}`
        );
    } else {
        assert(false, 'Extract item ID from /items/lost');
    }

    // 4. Chatbot NLP & Database Search
    console.log('\n--- 4. Testing Chatbot Natural Language Search ---');
    const queries = [
        { q: 'Did anyone find an Apple AirPods case?', expectItem: 'AirPods' },
        { q: 'I lost my ID card Sarah Dela Cruz', expectItem: 'Sarah' },
        { q: 'Did anyone find a basketball in the gym?', expectItem: 'Basketball' },
        { q: 'Lost acoustic guitar in Primera Hall', expectItem: 'Guitar' }
    ];

    for (const { q, expectItem } of queries) {
        const chatRes = await postJson('/api/chat', { message: q });
        const success = chatRes.body && chatRes.body.success;
        const matchesCount = chatRes.body?.matches?.length || 0;
        const hasExpected = JSON.stringify(chatRes.body).toLowerCase().includes(expectItem.toLowerCase());
        assert(
            success && hasExpected,
            `Chat search: "${q}"`,
            `Matches: ${matchesCount}, Found keyword: ${hasExpected}`
        );
    }

    // 5. Chatbot Multimodal Image Upload
    console.log('\n--- 5. Testing Chatbot Multimodal Photo Search ---');
    const photoPath = path.join(__dirname, '../public/uploads/student-id-sarah-delacruz.jpg');
    const photoRes = await postMultipart('/api/chat', { message: 'Can you check if this ID card is in your system?' }, 'image', photoPath);
    const photoSuccess = photoRes.body && photoRes.body.success;
    const photoMatches = photoRes.body?.matches?.length || 0;
    const photoHasSarah = JSON.stringify(photoRes.body).toLowerCase().includes('dela cruz') || JSON.stringify(photoRes.body).toLowerCase().includes('student id');
    assert(
        photoSuccess && photoHasSarah,
        'Multimodal Chat photo upload (Sarah Dela Cruz ID)',
        `Matches: ${photoMatches}, Recognized: ${photoHasSarah}`
    );

    // 6. Admin Authentication & Management
    console.log('\n--- 6. Testing Admin Login and Dashboard ---');
    const loginRes = await new Promise((resolve, reject) => {
        const postData = 'username=admin&password=admin123';
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, res => {
            resolve({
                statusCode: res.statusCode,
                cookies: (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ')
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });

    assert(
        loginRes.statusCode === 302,
        'POST /auth/login (Admin login redirect)',
        `HTTP ${loginRes.statusCode}`
    );

    const adminCookies = loginRes.cookies;
    if (adminCookies) {
        const adminDash = await get('/admin/dashboard', adminCookies);
        assert(
            adminDash.statusCode === 200 && adminDash.body.includes('Dashboard'),
            'GET /admin/dashboard',
            `HTTP ${adminDash.statusCode}`
        );

        const adminItems = await get('/admin/items', adminCookies);
        assert(
            adminItems.statusCode === 200 && (adminItems.body.includes('Manage Items') || adminItems.body.includes('Items')),
            'GET /admin/items',
            `HTTP ${adminItems.statusCode}`
        );

        const adminClaims = await get('/admin/claims', adminCookies);
        assert(
            adminClaims.statusCode === 200 && (adminClaims.body.includes('Manage Claims') || adminClaims.body.includes('Claims')),
            'GET /admin/claims',
            `HTTP ${adminClaims.statusCode}`
        );
    }

    console.log('\n=============================================');
    console.log(` VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('=============================================\n');
}

verify().catch(err => console.error('Verification error:', err));
