// Simple rate limiter middleware using Map
const rateLimitWindowMs = 60 * 1000; // 1 minute
const maxRequests = 60;
const ipMap = new Map();

module.exports = function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  if (!ipMap.has(ip)) {
    ipMap.set(ip, []);
  }
  const timestamps = ipMap.get(ip).filter((ts) => now - ts < rateLimitWindowMs);
  timestamps.push(now);
  ipMap.set(ip, timestamps);
  if (timestamps.length > maxRequests) {
    return res.status(429).json({ error: "Too many requests, slow down." });
  }
  next();
};
