import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Redis Connection Configuration
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

export const redisConfig = {
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false
};

// Singleton Redis Client Instance
const redis = new Redis(redisConfig);

redis.on('connect', () => {
  console.log(`⚡ Connected to Redis at ${redisHost}:${redisPort}`);
});

redis.on('error', (err) => {
  console.warn(`⚠️ Redis Connection Warning (${redisHost}:${redisPort}): ${err.message}`);
});

export default redis;
