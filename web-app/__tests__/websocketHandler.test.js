



const WebSocket = require('ws');
const setupWebSocket = require('../websocketHandler');
const { getCache, setCache, deleteCache } = require('../cacheManager');
const db = require('../database');
const logger = require('../logger');

jest.mock('ws');
jest.mock('../cacheManager');
jest.mock('../database');
jest.mock('../logger');

describe('WebSocket Handler', () => {
  let wss;
  let mockServer;
  let mockWs;

  beforeEach(() => {
    mockServer = {
      on: jest.fn(),
    };
    mockWs = {
      on: jest.fn(),
      send: jest.fn(),
    };
    WebSocket.Server.mockImplementation(() => ({
      on: (event, callback) => {
        if (event === 'connection') {
          callback(mockWs);
        }
      },
      clients: new Set([mockWs]),
    }));
    wss = setupWebSocket(mockServer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('setupWebSocket should create a WebSocket server', () => {
    expect(WebSocket.Server).toHaveBeenCalledWith({ server: mockServer });
  });

  test('handleWebSocketMessage should handle documentUpdate', async () => {
    const mockData = {
      type: 'documentUpdate',
      documentId: 1,
      content: 'Updated content',
      userId: 1,
    };

    deleteCache.mockResolvedValue();
    db.run.mockImplementation((query, params, callback) => {
      callback(null);
    });

    await mockWs.on.mock.calls[0][1](JSON.stringify(mockData));

    expect(deleteCache).toHaveBeenCalledWith('document:1');
    expect(db.run).toHaveBeenCalled();
  });

  test('handleWebSocketMessage should handle getDocument', async () => {
    const mockData = {
      type: 'getDocument',
      documentId: 1,
    };
    const mockDocument = { id: 1, content: 'Test content' };

    getCache.mockResolvedValue(null);
    db.get.mockImplementation((query, params, callback) => {
      callback(null, mockDocument);
    });
    setCache.mockResolvedValue();

    await mockWs.on.mock.calls[0][1](JSON.stringify(mockData));

    expect(getCache).toHaveBeenCalledWith('document:1');
    expect(db.get).toHaveBeenCalled();
    expect(setCache).toHaveBeenCalledWith('document:1', mockDocument);
    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
      type: 'documentContent',
      content: mockDocument,
    }));
  });
});



