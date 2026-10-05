const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const mockupsDir = path.join(__dirname, '../public/images/mockups');
const uploadsDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(mockupsDir)) fs.mkdirSync(mockupsDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const photoMap = {
    'lab-safety-goggles.jpg': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&q=85',
    'drafting-triangle-compass.jpg': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000&q=85',
    'acoustic-guitar-case.jpg': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1000&q=85',
    'guitar-clipon-tuner.jpg': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&q=85',
    'yonex-badminton-racket.jpg': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1000&q=85',
    'spalding-indoor-basketball.jpg': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&q=85',
    'dorm-brass-keys.jpg': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=1000&q=85',
    'college-registration-com.jpg': 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1000&q=85',
    'student-id-mark-villanueva.jpg': 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=1000&q=85'
};

function fetchImageBuffer(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                return fetchImageBuffer(response.headers.location).then(resolve).catch(reject);
            }
            if (response.statusCode !== 200) {
                return reject(new Error(`Status ${response.statusCode}`));
            }
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject);
    });
}

async function run() {
    console.log('Downloading real photorealistic images to replace flat SVG graphics...');

    for (const [filename, url] of Object.entries(photoMap)) {
        const mockupPath = path.join(mockupsDir, filename);
        const uploadPath = path.join(uploadsDir, filename);

        try {
            console.log(`Downloading photographic image for ${filename}...`);
            const rawBuffer = await fetchImageBuffer(url);
            
            // Optimize with sharp to uniform 1000x750 4:3 landscape ratio
            const buffer = await sharp(rawBuffer)
                .resize(1000, 750, { fit: 'cover', position: 'center' })
                .jpeg({ quality: 88 })
                .toBuffer();

            fs.writeFileSync(mockupPath, buffer);
            fs.writeFileSync(uploadPath, buffer);
            console.log(`[OK] Successfully replaced ${filename} with real photo (${buffer.length} bytes).`);
        } catch (err) {
            console.error(`Error downloading ${filename}:`, err.message);
        }
    }

    console.log('All flat graphics replaced with genuine photorealistic images!');
}

run();
