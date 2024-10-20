
const WebSocket = require('ws');
const setupWebSocket = require('../websocketHandler');
const { getCache, setCache, deleteCache } = require('../cacheManager');
const db = require('../database');

jest.mock('../cacheManager');
jest.mock('../database');
jest.mock('../logger');

describe('WebSocket Handler', () => {
  let wss;
  let mockServer;

  beforeEach(() => {
    mockServer = {
      on: jest.fn(),
    };
    wss = setupWebSocket(mockServer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('setupWebSocket should create a WebSocket server', () => {
    expect(WebSocket.Server).toHaveBeenCalledWith({ server: mockServer });
  });

  test('handleWebSocketMessage should handle documentUpdate', async () => {
    const mockWs = {
      send: jest.fn(),
    };
    const mockData = {
      type: 'documentUpdate',
      documentId: 1,
      content: 'Updated content',
      userId: 1,
    };

    await wss.emit('connection', mockWs);
    await mockWs.emit('message', JSON.stringify(mockData));

    expect(deleteCache).toHaveBeenCalledWith('document:1');
    expect(db.run).toHaveBeenCalled();
  });

  test('handleWebSocketMessage should handle getDocument', async () => {
    const mockWs = {
      send: jest.fn(),
    };
    const mockData = {
      type: 'getDocument',
      documentId: 1,
    };
    const mockDocument = { id: 1, content: 'Test content' };

    getCache.mockResolvedValue(null);
    db.get.mockImplementation((query, params, callback) => {
      callback(null, mockDocument);
    });

    await wss.emit('connection', mockWs);
    await mockWs.emit('message', JSON.stringify(mockData));

    expect(getCache).toHaveBeenCalledWith('document:1');
    expect(db.get).toHaveBeenCalled();
    expect(setCache).toHaveBeenCalledWith('document:1', mockDocument);
    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
      type: 'documentContent',
      content: mockDocument,
    }));
  });
});
