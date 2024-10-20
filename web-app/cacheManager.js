

const redis = require('redis');
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let client;

function createClient() {
  if (!client) {
    client = redis.createClient({
      url: REDIS_URL
    });

    client.on('error', (err) => console.error('Redis Client Error', err));
  }
  return client;
}

async function getConnectedClient() {
  const client = createClient();
  if (!client.isReady) {
    await client.connect().catch((err) => console.error('Redis Connection Error', err));
  }
  return client;
}

async function connectRedis() {
  try {
    const client = createClient();
    await client.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
}

async function getCache(key) {
  try {
    const client = await getConnectedClient();
    return await client.get(key);
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
}

async function setCache(key, value, expirationInSeconds = 3600) {
  try {
    const client = await getConnectedClient();
    await client.set(key, JSON.stringify(value), {
      EX: expirationInSeconds
    });
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
}

async function deleteCache(key) {
  try {
    const client = await getConnectedClient();
    await client.del(key);
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error);
  }
}

// For testing purposes
async function _testGetConnectedClient() {
  return await getConnectedClient();
}

module.exports = {
  connectRedis,
  getCache,
  setCache,
  deleteCache,
  createClient,
  getConnectedClient,
  _testGetConnectedClient
};

