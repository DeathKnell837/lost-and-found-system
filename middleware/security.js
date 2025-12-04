/**
 * Security Middleware
 * Provides security headers, rate limiting, and input sanitization
 */

// Simple in-memory rate limiter (for production, use Redis)
const requestCounts = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestCounts) {
        if (now - value.windowStart > 60000) {
            requestCounts.delete(key);
        }
    }
}, 300000);

/**
 * Security Headers Middleware
 */
const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS filter in browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Control referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions policy
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    next();
};

/**
 * Rate Limiter Middleware
 * @param {Object} options - Configuration options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {number} options.max - Maximum requests per window (default: 100)
 * @param {string} options.message - Error message when limit exceeded
 */
const rateLimit = (options = {}) => {
    const windowMs = options.windowMs || 60000; // 1 minute
    const max = options.max || 100;
    const message = options.message || 'Too many requests, please try again later.';

    return (req, res, next) => {
        // Get client identifier (IP or session)
        const key = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();

        // Get or create entry for this client
        let entry = requestCounts.get(key);
        
        if (!entry || now - entry.windowStart > windowMs) {
            // New window
            entry = { windowStart: now, count: 1 };
            requestCounts.set(key, entry);
        } else {
            entry.count++;
        }

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
        res.setHeader('X-RateLimit-Reset', Math.ceil((entry.windowStart + windowMs) / 1000));

        if (entry.count > max) {
            // Check if this is an API request
            const isAPI = req.path.startsWith('/api') || 
                          req.path.startsWith('/comments') || 
                          req.path.startsWith('/claims') ||
                          req.xhr || 
                          req.headers.accept?.includes('application/json');

            if (isAPI) {
                return res.status(429).json({ 
                    success: false, 
                    message,
                    retryAfter: Math.ceil((entry.windowStart + windowMs - now) / 1000)
                });
            }

            return res.status(429).render('error', {
                title: 'Too Many Requests',
                message,
                error: { status: 429 },
                user: req.session?.user
            });
        }

        next();
    };
};

/**
 * Strict rate limiter for authentication routes
 */
const authRateLimit = rateLimit({
    windowMs: 900000, // 15 minutes
    max: 10, // 10 login attempts per 15 minutes
    message: 'Too many login attempts. Please try again after 15 minutes.'
});

/**
 * API rate limiter
 */
const apiRateLimit = rateLimit({
    windowMs: 60000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'API rate limit exceeded. Please slow down.'
});

/**
 * General rate limiter
 */
const generalRateLimit = rateLimit({
    windowMs: 60000, // 1 minute
    max: 200, // 200 requests per minute (generous)
    message: 'Too many requests. Please slow down.'
});

/**
 * Sanitize input strings to prevent XSS
 * Only sanitize dangerous HTML characters, not URL-safe characters
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

/**
 * Recursively sanitize an object
 */
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return sanitizeString(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const key of Object.keys(obj)) {
            sanitized[sanitizeString(key)] = sanitizeObject(obj[key]);
        }
        return sanitized;
    }
    return obj;
};

/**
 * Input Sanitization Middleware
 * Sanitizes req.body and req.query only (NOT params - they contain ObjectIds)
 */
const sanitizeInput = (req, res, next) => {
    // Skip file uploads
    if (req.is('multipart/form-data')) {
        return next();
    }

    try {
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeObject(req.query);
        }
        // DON'T sanitize req.params - they contain ObjectIds
    } catch (err) {
        console.error('Sanitization error:', err);
    }

    next();
};

/**
 * Validate MongoDB ObjectId format
 */
const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * MongoDB ObjectId validation middleware for params
 * @param {string[]} paramNames - Array of param names to validate
 */
const validateObjectIdParams = (...paramNames) => {
    return (req, res, next) => {
        for (const paramName of paramNames) {
            const paramValue = req.params[paramName];
            if (paramValue && !isValidObjectId(paramValue)) {
                const isAPI = req.path.startsWith('/api') || 
                              req.path.startsWith('/comments') || 
                              req.path.startsWith('/claims') ||
                              req.xhr || 
                              req.headers.accept?.includes('application/json');

                if (isAPI) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Invalid ${paramName} format` 
                    });
                }

                req.flash('error', 'Invalid request');
                return res.redirect('back');
            }
        }
        next();
    };
};

/**
 * Request size limiter for JSON payloads
 */
const limitRequestSize = (maxSize = '1mb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || 0);
        const maxBytes = typeof maxSize === 'number' ? maxSize : 
                         parseInt(maxSize) * (maxSize.includes('mb') ? 1024 * 1024 : 1024);
        
        if (contentLength > maxBytes) {
            return res.status(413).json({
                success: false,
                message: 'Request too large'
            });
        }
        next();
    };
};

/**
 * Prevent NoSQL injection by checking for MongoDB operators
 */
const preventNoSQLInjection = (req, res, next) => {
    const check = (obj) => {
        if (typeof obj === 'string') {
            // Check for MongoDB operators
            if (obj.includes('$') && /\$[a-z]+/i.test(obj)) {
                return true;
            }
        } else if (typeof obj === 'object' && obj !== null) {
            for (const key of Object.keys(obj)) {
                if (key.startsWith('$')) return true;
                if (check(obj[key])) return true;
            }
        }
        return false;
    };

    if (check(req.body) || check(req.query)) {
        const isAPI = req.xhr || req.headers.accept?.includes('application/json');
        if (isAPI) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid input detected' 
            });
        }
        req.flash('error', 'Invalid input');
        return res.redirect('back');
    }

    next();
};

/**
 * Log slow requests for monitoring
 */
const slowRequestLogger = (threshold = 5000) => {
    return (req, res, next) => {
        const start = Date.now();
        
        res.on('finish', () => {
            const duration = Date.now() - start;
            if (duration > threshold) {
                console.warn(`[SLOW REQUEST] ${req.method} ${req.originalUrl} - ${duration}ms`);
            }
        });
        
        next();
    };
};

module.exports = {
    securityHeaders,
    rateLimit,
    authRateLimit,
    apiRateLimit,
    generalRateLimit,
    sanitizeInput,
    validateObjectIdParams,
    isValidObjectId,
    limitRequestSize,
    preventNoSQLInjection,
    slowRequestLogger
};
