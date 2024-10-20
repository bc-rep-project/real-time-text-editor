


const redis = require('redis');
const { getCache, setCache, deleteCache, createClient } = require('../cacheManager');
const logger = require('../logger');

jest.mock('redis');
jest.mock('../logger');

describe('Cache Manager', () => {
  let mockRedisClient;

  beforeEach(() => {
    mockRedisClient = {
      connect: jest.fn(),
      get: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
    };

    redis.createClient.mockReturnValue(mockRedisClient);

    // Reset modules to ensure a fresh instance of cacheManager for each test
    jest.resetModules();
    jest.mock('../cacheManager', () => {
      const actualCacheManager = jest.requireActual('../cacheManager');
      return {
        ...actualCacheManager,
        createClient: jest.fn().mockReturnValue(mockRedisClient),
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCache', () => {
    it('should return cached value if it exists', async () => {
      const key = 'testKey';
      const cachedValue = JSON.stringify({ data: 'testData' });

      mockRedisClient.get.mockResolvedValue(cachedValue);

      const result = await getCache(key);

      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(result).toEqual({ data: 'testData' });
    });

    it('should return null if cached value does not exist', async () => {
      const key = 'nonExistentKey';

      mockRedisClient.get.mockResolvedValue(null);

      const result = await getCache(key);

      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });

    it('should log error if Redis throws an error', async () => {
      const key = 'errorKey';
      const error = new Error('Redis error');

      mockRedisClient.get.mockRejectedValue(error);

      const result = await getCache(key);

      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(logger.error).toHaveBeenCalledWith(`Error getting cache for key ${key}:`, error);
      expect(result).toBeNull();
    });
  });

  describe('setCache', () => {
    it('should set cache value with default expiration', async () => {
      const key = 'testKey';
      const value = { data: 'testData' };

      await setCache(key, value);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(key, 3600, JSON.stringify(value));
    });

    it('should set cache value with custom expiration', async () => {
      const key = 'testKey';
      const value = { data: 'testData' };
      const expiration = 7200;

      await setCache(key, value, expiration);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(key, expiration, JSON.stringify(value));
    });

    it('should log error if Redis throws an error', async () => {
      const key = 'errorKey';
      const value = { data: 'testData' };
      const error = new Error('Redis error');

      mockRedisClient.setEx.mockRejectedValue(error);

      await setCache(key, value);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(key, 3600, JSON.stringify(value));
      expect(logger.error).toHaveBeenCalledWith(`Error setting cache for key ${key}:`, error);
    });
  });

  describe('deleteCache', () => {
    it('should delete cache value', async () => {
      const key = 'testKey';

      await deleteCache(key);

      expect(mockRedisClient.del).toHaveBeenCalledWith(key);
    });

    it('should log error if Redis throws an error', async () => {
      const key = 'errorKey';
      const error = new Error('Redis error');

      mockRedisClient.del.mockRejectedValue(error);

      await deleteCache(key);

      expect(mockRedisClient.del).toHaveBeenCalledWith(key);
      expect(logger.error).toHaveBeenCalledWith(`Error deleting cache for key ${key}:`, error);
    });
  });
});


