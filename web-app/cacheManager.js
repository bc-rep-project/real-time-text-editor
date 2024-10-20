
const redis = require('redis');
const logger = require('./logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const client = redis.createClient({
  url: REDIS_URL
});

client.on('error', (err) => logger.error('Redis Client Error', err));

async function connectRedis() {
  try {
    await client.connect();
    logger.info('Connected to Redis');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
  }
}

connectRedis();

async function getCache(key) {
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
}

async function setCache(key, value, expirationInSeconds = 3600) {
  try {
    await client.setEx(key, expirationInSeconds, JSON.stringify(value));
  } catch (error) {
    logger.error(`Error setting cache for key ${key}:`, error);
  }
}

async function deleteCache(key) {
  try {
    await client.del(key);
  } catch (error) {
    logger.error(`Error deleting cache for key ${key}:`, error);
  }
}

module.exports = {
  getCache,
  setCache,
  deleteCache
};
