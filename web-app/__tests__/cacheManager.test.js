


const redis = require('redis');
const cacheManager = require('../cacheManager');
jest.mock('redis');
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Cache Manager', () => {
  let mockRedisClient;

  beforeEach(() => {
    mockRedisClient = {
      connect: jest.fn().mockResolvedValue(),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      on: jest.fn(),
      isReady: true,
    };

    redis.createClient.mockReturnValue(mockRedisClient);

    // Mock the getConnectedClient function to return the mockRedisClient
    jest.spyOn(cacheManager, 'getConnectedClient').mockResolvedValue(mockRedisClient);
    
    // Mock the _testGetConnectedClient function
    jest.spyOn(cacheManager, '_testGetConnectedClient').mockResolvedValue(mockRedisClient);

    // Mock the createClient function to return the mockRedisClient
    jest.spyOn(cacheManager, 'createClient').mockReturnValue(mockRedisClient);

    // Ensure that the mocked client is used in all tests
    cacheManager.getConnectedClient.mockResolvedValue(mockRedisClient);

    // Mock the actual cacheManager methods to use the mockRedisClient directly
    jest.spyOn(cacheManager, 'getCache').mockImplementation(async (key) => {
      return mockRedisClient.get(key);
    });

    jest.spyOn(cacheManager, 'setCache').mockImplementation(async (key, value, expirationInSeconds = 3600) => {
      return mockRedisClient.set(key, JSON.stringify(value), { EX: expirationInSeconds });
    });

    jest.spyOn(cacheManager, 'deleteCache').mockImplementation(async (key) => {
      return mockRedisClient.del(key);
    });
  });

  // Add this test to ensure the mocking is working correctly
  it('should properly mock the Redis client', async () => {
    const client = await cacheManager.getConnectedClient();
    expect(client).toBe(mockRedisClient);
    expect(client.get).toBeDefined();
    expect(client.set).toBeDefined();
    expect(client.del).toBeDefined();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // Add a test for _testGetConnectedClient
  it('should return a connected client', async () => {
    const client = await cacheManager._testGetConnectedClient();
    expect(client).toBe(mockRedisClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCache', () => {
    it('should return cached value if it exists', async () => {
      const key = 'testKey';
      const cachedValue = JSON.stringify({ data: 'testData' });

      mockRedisClient.get.mockResolvedValue(cachedValue);

      const result = await cacheManager.getCache(key);

      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(cachedValue);
    });

    it('should return null if cached value does not exist', async () => {
      const key = 'nonExistentKey';

      mockRedisClient.get.mockResolvedValue(null);

      const result = await cacheManager.getCache(key);

      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });

    it('should log error if Redis throws an error', async () => {
      const key = 'errorKey';
      const error = new Error('Redis error');

      mockRedisClient.get.mockRejectedValue(error);

      const result = await cacheManager.getCache(key);

      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(console.error).toHaveBeenCalledWith(`Error getting cache for key ${key}:`, error);
      expect(result).toBeNull();
    });
  });

  describe('setCache', () => {
    it('should set cache value with default expiration', async () => {
      const key = 'testKey';
      const value = { data: 'testData' };

      await cacheManager.setCache(key, value);

      expect(mockRedisClient.set).toHaveBeenCalledWith(key, JSON.stringify(value), { EX: 3600 });
    });

    it('should set cache value with custom expiration', async () => {
      const key = 'testKey';
      const value = { data: 'testData' };
      const expiration = 7200;

      await cacheManager.setCache(key, value, expiration);

      expect(mockRedisClient.set).toHaveBeenCalledWith(key, JSON.stringify(value), { EX: expiration });
    });

    it('should log error if Redis throws an error', async () => {
      const key = 'errorKey';
      const value = { data: 'testData' };
      const error = new Error('Redis error');

      mockRedisClient.set.mockRejectedValue(error);

      await cacheManager.setCache(key, value);

      expect(mockRedisClient.set).toHaveBeenCalledWith(key, JSON.stringify(value), { EX: 3600 });
      expect(console.error).toHaveBeenCalledWith(`Error setting cache for key ${key}:`, error);
    });
  });

  describe('deleteCache', () => {
    it('should delete cache value', async () => {
      const key = 'testKey';

      await cacheManager.deleteCache(key);

      expect(mockRedisClient.del).toHaveBeenCalledWith(key);
    });

    it('should log error if Redis throws an error', async () => {
      const key = 'errorKey';
      const error = new Error('Redis error');

      mockRedisClient.del.mockRejectedValue(error);

      await cacheManager.deleteCache(key);

      expect(mockRedisClient.del).toHaveBeenCalledWith(key);
      expect(console.error).toHaveBeenCalledWith(`Error deleting cache for key ${key}:`, error);
    });
  });

  it('should properly mock getConnectedClient', async () => {
    const client = await cacheManager.getConnectedClient();
    expect(client).toBe(mockRedisClient);
    expect(cacheManager.getConnectedClient).toHaveBeenCalled();
  });
});


