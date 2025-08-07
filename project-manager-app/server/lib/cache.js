// Simple in-memory LRU cache for backend optimization
const LRU = require("lru-cache");

const options = {
  max: 100, // max items
  ttl: 1000 * 60 * 5, // 5 minutes
};

const cache = new LRU(options);

module.exports = cache;
