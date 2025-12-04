const crypto = require('crypto');
const { BlockedDevice, TrackedDevice } = require('../models');

/**
 * Parse user agent string to extract device info
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

    // Detect OS
    let os = { name: 'Unknown', version: '' };
    if (ua.includes('Windows NT 10')) {
        os.name = 'Windows';
        os.version = '10/11';
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
        os.version = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
    } else if (ua.includes('Android')) {
        os.name = 'Android';
        os.version = ua.match(/Android (\d+\.?\d*)/)?.[1] || '';
    } else if (ua.includes('iPhone') || ua.includes('iPad')) {
        os.name = 'iOS';
        os.version = ua.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
    } else if (ua.includes('Linux')) {
        os.name = 'Linux';
        os.version = '';
    }

    // Detect device type and brand
    let device = { type: 'desktop', vendor: '', model: '' };
    if (ua.includes('Mobile') || ua.includes('Android')) {
        device.type = 'mobile';
        
        // Apple devices
        if (ua.includes('iPhone')) {
            device.vendor = 'Apple';
            device.model = 'iPhone';
        } else if (ua.includes('iPad')) {
            device.vendor = 'Apple';
            device.model = 'iPad';
            device.type = 'tablet';
        } 
        // Samsung
        else if (ua.includes('Samsung') || ua.includes('SM-') || ua.includes('GT-')) {
            device.vendor = 'Samsung';
            const match = ua.match(/SM-[A-Z0-9]+|GT-[A-Z0-9]+/);
            device.model = match ? match[0] : 'Galaxy';
        } 
        // Huawei & Honor
        else if (ua.includes('HUAWEI') || ua.includes('Huawei')) {
            device.vendor = 'Huawei';
            const match = ua.match(/HUAWEI\s+([A-Za-z0-9-]+)/i);
            device.model = match ? match[1] : '';
        } else if (ua.includes('HONOR') || ua.includes('Honor')) {
            device.vendor = 'Honor';
            const match = ua.match(/HONOR\s+([A-Za-z0-9-]+)/i);
            device.model = match ? match[1] : '';
        }
        // Xiaomi / Redmi / POCO
        else if (ua.includes('Xiaomi') || ua.includes('Redmi') || ua.includes('POCO') || ua.includes('Mi ')) {
            device.vendor = 'Xiaomi';
            if (ua.includes('Redmi')) {
                const match = ua.match(/Redmi\s+([A-Za-z0-9]+)/);
                device.model = match ? `Redmi ${match[1]}` : 'Redmi';
            } else if (ua.includes('POCO')) {
                const match = ua.match(/POCO\s+([A-Za-z0-9]+)/);
                device.model = match ? `POCO ${match[1]}` : 'POCO';
            } else {
                const match = ua.match(/Mi\s+([A-Za-z0-9]+)/);
                device.model = match ? `Mi ${match[1]}` : '';
            }
        }
        // OPPO
        else if (ua.includes('OPPO') || ua.includes('CPH')) {
            device.vendor = 'OPPO';
            const match = ua.match(/CPH[0-9]+|OPPO\s+([A-Za-z0-9]+)/);
            device.model = match ? match[0] : '';
        }
        // Vivo
        else if (ua.includes('vivo') || ua.includes('V20') || ua.includes('Y')) {
            device.vendor = 'Vivo';
            const match = ua.match(/vivo\s+([A-Za-z0-9]+)/i);
            device.model = match ? match[1] : '';
        }
        // Realme
        else if (ua.includes('RMX') || ua.includes('Realme') || ua.includes('realme')) {
            device.vendor = 'Realme';
            const match = ua.match(/RMX[0-9]+|Realme\s+([A-Za-z0-9]+)/i);
            device.model = match ? match[0] : '';
        }
        // OnePlus
        else if (ua.includes('OnePlus') || ua.includes('ONEPLUS')) {
            device.vendor = 'OnePlus';
            const match = ua.match(/OnePlus\s*([A-Za-z0-9]+)|ONEPLUS\s+A[0-9]+/i);
            device.model = match ? match[0] : '';
        }
        // Google Pixel
        else if (ua.includes('Pixel')) {
            device.vendor = 'Google';
            const match = ua.match(/Pixel\s+([0-9a-zA-Z]+)/);
            device.model = match ? `Pixel ${match[1]}` : 'Pixel';
        }
        // Motorola
        else if (ua.includes('motorola') || ua.includes('Moto') || ua.includes('XT')) {
            device.vendor = 'Motorola';
            const match = ua.match(/moto\s+([a-z0-9]+)|XT[0-9]+/i);
            device.model = match ? match[0] : '';
        }
        // LG
        else if (ua.includes('LG-') || ua.includes('LGE')) {
            device.vendor = 'LG';
            const match = ua.match(/LG-[A-Z0-9]+|LM-[A-Z0-9]+/);
            device.model = match ? match[0] : '';
        }
        // Sony
        else if (ua.includes('Sony') || ua.includes('Xperia')) {
            device.vendor = 'Sony';
            const match = ua.match(/Xperia\s+([A-Za-z0-9]+)/);
            device.model = match ? `Xperia ${match[1]}` : '';
        }
        // Nokia
        else if (ua.includes('Nokia')) {
            device.vendor = 'Nokia';
            const match = ua.match(/Nokia\s+([0-9.]+)/);
            device.model = match ? match[1] : '';
        }
        // ASUS
        else if (ua.includes('ASUS') || ua.includes('ZenFone') || ua.includes('ROG')) {
            device.vendor = 'ASUS';
            if (ua.includes('ROG')) device.model = 'ROG Phone';
            else if (ua.includes('ZenFone')) device.model = 'ZenFone';
        }
        // Infinix
        else if (ua.includes('Infinix') || ua.includes('INFINIX')) {
            device.vendor = 'Infinix';
            const match = ua.match(/Infinix\s+([A-Za-z0-9]+)/i);
            device.model = match ? match[1] : '';
        }
        // Tecno
        else if (ua.includes('TECNO') || ua.includes('Tecno')) {
            device.vendor = 'Tecno';
            const match = ua.match(/TECNO\s+([A-Za-z0-9]+)/i);
            device.model = match ? match[1] : '';
        }
        // iTel
        else if (ua.includes('itel') || ua.includes('ITEL')) {
            device.vendor = 'iTel';
            const match = ua.match(/itel\s+([A-Za-z0-9]+)/i);
            device.model = match ? match[1] : '';
        }
        // ZTE
        else if (ua.includes('ZTE')) {
            device.vendor = 'ZTE';
            const match = ua.match(/ZTE\s+([A-Za-z0-9]+)/);
            device.model = match ? match[1] : '';
        }
        // Lenovo
        else if (ua.includes('Lenovo')) {
            device.vendor = 'Lenovo';
            const match = ua.match(/Lenovo\s+([A-Za-z0-9-]+)/);
            device.model = match ? match[1] : '';
        }
        // Generic Android
        else if (ua.includes('Android')) {
            device.vendor = 'Android';
            device.model = 'Phone';
        }
    } else if (ua.includes('Tablet')) {
        device.type = 'tablet';
    }

    return { browser, os, device };
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
