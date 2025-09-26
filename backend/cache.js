/**
 * Система кэширования для масштабирования
 */

import Redis from 'ioredis';

class CacheManager {
  constructor() {
    this.redis = null;
    this.memoryCache = new Map();
    this.isRedisAvailable = false;
    
    this.initRedis();
  }

  async initRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        });
        
        this.redis.on('connect', () => {
          console.log('✅ Redis подключен');
          this.isRedisAvailable = true;
        });
        
        this.redis.on('error', (err) => {
          console.log('⚠️ Redis недоступен, используется память:', err.message);
          this.isRedisAvailable = false;
        });
      }
    } catch (error) {
      console.log('⚠️ Redis недоступен, используется память:', error.message);
      this.isRedisAvailable = false;
    }
  }

  async get(key) {
    try {
      if (this.isRedisAvailable && this.redis) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback to memory cache
        const item = this.memoryCache.get(key);
        if (item && item.expires > Date.now()) {
          return item.value;
        }
        this.memoryCache.delete(key);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        // Fallback to memory cache
        this.memoryCache.set(key, {
          value,
          expires: Date.now() + (ttlSeconds * 1000)
        });
        
        // Cleanup expired items periodically
        if (this.memoryCache.size > 1000) {
          this.cleanupMemoryCache();
        }
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key) {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern) {
    try {
      if (this.isRedisAvailable && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // For memory cache, we need to iterate
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern.replace('*', ''))) {
            this.memoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expires <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Cache key generators
  static getMenuKey(schoolId, weekStart) {
    return `menu:${schoolId}:${weekStart}`;
  }

  static getUserKey(userId) {
    return `user:${userId}`;
  }

  static getStatsKey(schoolId, weekStart) {
    return `stats:${schoolId}:${weekStart}`;
  }

  static getOrdersKey(userId, weekStart) {
    return `orders:${userId}:${weekStart}`;
  }
}

// Singleton instance
export const cache = new CacheManager();

// Cache middleware
export function cacheMiddleware(ttlSeconds = 300, keyGenerator = null) {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = keyGenerator ? keyGenerator(req) : `cache:${req.originalUrl}`;
    
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }
    } catch (error) {
      console.error('Cache middleware error:', error);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Cache the response
      cache.set(cacheKey, data, ttlSeconds).catch(console.error);
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

export default cache;
