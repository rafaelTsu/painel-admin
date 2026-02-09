
const rateLimit = new Map();

/**
 * Basic in-memory rate limiter middleware.
 * @param {Object} options { windowMs: milliseconds (default 15min), max: limit (default 100) }
 */
export const rateLimiter = (options = {}) => {
    const windowMs = options.windowMs || 15 * 60 * 1000;
    const max = options.max || 100;

    // Cleanup interval (simple garbage collection)
    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of rateLimit.entries()) {
            if (now - record.startTime > windowMs) {
                rateLimit.delete(key);
            }
        }
    }, windowMs);
    
    // Prevent process exit hang logic if needed, but for middleware typical.
    // Unref so it doesn't hold process up if using testing (optional).
    if (cleanupInterval.unref) cleanupInterval.unref();

    return (req, res, next) => {
        const key = req.ip; // Or req.user.id if auth'd, but this is usually for login (IP)
        const now = Date.now();
        
        if (!rateLimit.has(key)) {
            rateLimit.set(key, { count: 1, startTime: now });
        } else {
            const record = rateLimit.get(key);
            if (now - record.startTime > windowMs) {
                // Reset
                record.count = 1;
                record.startTime = now;
            } else {
                record.count++;
                if (record.count > max) {
                    // Audit this? T093 audit services only.
                    return res.status(429).json({ error: 'Too many requests, please try again later.' });
                }
            }
        }
        next();
    };
};
