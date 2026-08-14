const redis = require('redis');
const logger = require('./logger');

// Crear cliente Redis
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: process.env.REDIS_DB || 0,
  retryStrategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

redisClient.on('connect', () => {
  logger.info('✅ Redis conectado exitosamente');
});

redisClient.on('error', (err) => {
  logger.error('❌ Error de Redis:', err);
});

// Funciones útiles
const cache = {
  // Obtener valor del cache
  get: (key) => {
    return new Promise((resolve, reject) => {
      redisClient.get(key, (err, data) => {
        if (err) reject(err);
        resolve(data ? JSON.parse(data) : null);
      });
    });
  },

  // Guardar valor en cache
  set: (key, value, expiresIn = 3600) => {
    return new Promise((resolve, reject) => {
      redisClient.setex(key, expiresIn, JSON.stringify(value), (err) => {
        if (err) reject(err);
        resolve(true);
      });
    });
  },

  // Eliminar cache
  delete: (key) => {
    return new Promise((resolve, reject) => {
      redisClient.del(key, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    });
  },

  // Limpiar todo el cache
  flush: () => {
    return new Promise((resolve, reject) => {
      redisClient.flushdb((err) => {
        if (err) reject(err);
        resolve(true);
      });
    });
  },

  // Incrementar contador
  increment: (key) => {
    return new Promise((resolve, reject) => {
      redisClient.incr(key, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }
};

module.exports = { redisClient, cache };
