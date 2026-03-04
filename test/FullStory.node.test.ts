/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { FullStory } from '../nodes/FullStory/FullStory.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('FullStory Node', () => {
  let node: FullStory;

  beforeAll(() => {
    node = new FullStory();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('FullStory');
      expect(node.description.name).toBe('fullstory');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Users Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.fullstory.com/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should get users successfully', async () => {
    const mockResponse = {
      users: [
        { id: 'user1', email: 'test@example.com', uid: 'uid1' },
        { id: 'user2', email: 'test2@example.com', uid: 'uid2' },
      ],
      cursor: 'next-cursor',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
      switch (name) {
        case 'operation': return 'getUsers';
        case 'limit': return 10;
        case 'cursor': return '';
        case 'email': return '';
        case 'uid': return '';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeUsersOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/users?limit=10',
        headers: expect.objectContaining({
          'Authorization': expect.stringMatching(/^Basic /),
        }),
      })
    );
  });

  test('should get a specific user successfully', async () => {
    const mockResponse = {
      id: 'user123',
      email: 'test@example.com',
      uid: 'uid123',
      displayName: 'Test User',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
      switch (name) {
        case 'operation': return 'getUser';
        case 'userId': return 'user123';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeUsersOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/users/user123',
      })
    );
  });

  test('should create a user successfully', async () => {
    const mockResponse = {
      id: 'new-user-id',
      email: 'newuser@example.com',
      uid: 'new-uid',
      displayName: 'New User',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
      switch (name) {
        case 'operation': return 'createUser';
        case 'uid': return 'new-uid';
        case 'userEmail': return 'newuser@example.com';
        case 'displayName': return 'New User';
        case 'properties': return { property: [{ key: 'department', value: 'engineering' }] };
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeUsersOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.fullstory.com/v2/users',
        body: expect.objectContaining({
          uid: 'new-uid',
          email: 'newuser@example.com',
          displayName: 'New User',
          properties: { department: 'engineering' },
        }),
      })
    );
  });

  test('should update a user successfully', async () => {
    const mockResponse = {
      id: 'user123',
      email: 'test@example.com',
      uid: 'uid123',
      properties: { department: 'marketing' },
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
      switch (name) {
        case 'operation': return 'updateUser';
        case 'userId': return 'user123';
        case 'properties': return { property: [{ key: 'department', value: 'marketing' }] };
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeUsersOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        url: 'https://api.fullstory.com/v2/users/user123',
        body: expect.objectContaining({
          properties: { department: 'marketing' },
        }),
      })
    );
  });

  test('should delete a user successfully', async () => {
    const mockResponse = { success: true };

    mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
      switch (name) {
        case 'operation': return 'deleteUser';
        case 'userId': return 'user123';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeUsersOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: 'https://api.fullstory.com/v2/users/user123',
      })
    );
  });

  test('should handle errors when continue on fail is enabled', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
      switch (name) {
        case 'operation': return 'getUser';
        case 'userId': return 'invalid-user';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('User not found'));

    const result = await executeUsersOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ error: 'User not found' });
  });
});

describe('Events Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.fullstory.com/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getEvents operation', () => {
    it('should retrieve events successfully', async () => {
      const mockResponse = {
        events: [
          { id: 'event1', name: 'test-event', userId: 'user1' },
          { id: 'event2', name: 'test-event-2', userId: 'user2' },
        ],
        cursor: 'next-cursor',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getEvents';
          case 'limit': return 50;
          case 'cursor': return '';
          case 'start': return '';
          case 'end': return '';
          case 'eventName': return '';
          case 'userId': return '';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeEventsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/events?limit=50',
        headers: {
          'Authorization': expect.stringContaining('Basic '),
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle getEvents error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getEvents';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('API Error');
    });
  });

  describe('getEvent operation', () => {
    it('should retrieve specific event successfully', async () => {
      const mockResponse = {
        id: 'event123',
        name: 'test-event',
        userId: 'user1',
        timestamp: '2023-01-01T00:00:00Z',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getEvent';
          case 'eventId': return 'event123';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeEventsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/events/event123',
        headers: {
          'Authorization': expect.stringContaining('Basic '),
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('createEvent operation', () => {
    it('should create event successfully', async () => {
      const mockResponse = {
        id: 'new-event-123',
        eventName: 'custom-event',
        userId: 'user1',
        success: true,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'createEvent';
          case 'eventName': return 'custom-event';
          case 'userId': return 'user1';
          case 'properties': return { property: { key: 'testKey', value: 'testValue' } };
          case 'timestamp': return '2023-01-01T00:00:00Z';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeEventsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.fullstory.com/v2/events',
        headers: {
          'Authorization': expect.stringContaining('Basic '),
          'Content-Type': 'application/json',
        },
        body: {
          eventName: 'custom-event',
          userId: 'user1',
          timestamp: '2023-01-01T00:00:00.000Z',
          properties: { testKey: 'testValue' },
        },
        json: true,
      });
    });
  });

  describe('searchEvents operation', () => {
    it('should search events successfully', async () => {
      const mockResponse = {
        events: [
          { id: 'event1', name: 'search-result', userId: 'user1' },
        ],
        total: 1,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'searchEvents';
          case 'query': return 'search-term';
          case 'start': return '';
          case 'end': return '';
          case 'limit': return 50;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeEventsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/events/search?query=search-term&limit=50',
        headers: {
          'Authorization': expect.stringContaining('Basic '),
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });
});

describe('Sessions Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.fullstory.com/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getSessions', () => {
    it('should successfully get sessions list', async () => {
      const mockResponse = {
        sessions: [
          { id: 'session1', userId: 'user1', startTime: '2023-01-01T00:00:00Z' },
          { id: 'session2', userId: 'user2', startTime: '2023-01-01T01:00:00Z' },
        ],
        cursor: 'next-cursor',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getSessions';
          case 'limit': return 50;
          case 'cursor': return '';
          case 'start': return '';
          case 'end': return '';
          case 'userId': return '';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSessionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([
        { json: mockResponse, pairedItem: { item: 0 } },
      ]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/sessions?limit=50',
        headers: {
          'Authorization': `Basic ${Buffer.from('test-api-key:').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle getSessions error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getSessions';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        executeSessionsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('API Error');
    });
  });

  describe('getSession', () => {
    it('should successfully get a single session', async () => {
      const mockResponse = {
        id: 'session123',
        userId: 'user123',
        startTime: '2023-01-01T00:00:00Z',
        endTime: '2023-01-01T01:00:00Z',
        duration: 3600,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getSession';
          case 'sessionId': return 'session123';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSessionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([
        { json: mockResponse, pairedItem: { item: 0 } },
      ]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/sessions/session123',
        headers: {
          'Authorization': `Basic ${Buffer.from('test-api-key:').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getSessionReplay', () => {
    it('should successfully get session replay URL', async () => {
      const mockResponse = {
        replayUrl: 'https://app.fullstory.com/ui/ORGID/session/SESSION123',
        expiresAt: '2023-01-01T12:00:00Z',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getSessionReplay';
          case 'sessionId': return 'session123';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSessionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([
        { json: mockResponse, pairedItem: { item: 0 } },
      ]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/sessions/session123/replay',
        headers: {
          'Authorization': `Basic ${Buffer.from('test-api-key:').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('searchSessions', () => {
    it('should successfully search sessions', async () => {
      const mockResponse = {
        sessions: [
          { id: 'session1', userId: 'user123', hasErrors: true },
          { id: 'session2', userId: 'user123', hasErrors: false },
        ],
        totalCount: 2,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'searchSessions';
          case 'userId': return 'user123';
          case 'start': return '2023-01-01T00:00:00Z';
          case 'end': return '2023-01-01T23:59:59Z';
          case 'hasErrors': return true;
          case 'limit': return 100;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSessionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([
        { json: mockResponse, pairedItem: { item: 0 } },
      ]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/sessions/search?userId=user123&start=2023-01-01T00%3A00%3A00Z&end=2023-01-01T23%3A59%3A59Z&hasErrors=true&limit=100',
        headers: {
          'Authorization': `Basic ${Buffer.from('test-api-key:').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });
});

describe('Segments Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.fullstory.com/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('getSegments operation should list all segments', async () => {
    const mockResponse = {
      segments: [
        { id: 'seg1', name: 'Test Segment 1' },
        { id: 'seg2', name: 'Test Segment 2' },
      ],
      cursor: 'next-cursor',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number, defaultValue?: any) => {
      if (paramName === 'operation') return 'getSegments';
      if (paramName === 'limit') return 20;
      if (paramName === 'cursor') return '';
      return defaultValue;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.fullstory.com/v2/segments?limit=20',
      headers: {
        'Authorization': 'Basic dGVzdC1hcGkta2V5Og==',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('getSegment operation should get specific segment', async () => {
    const mockResponse = {
      id: 'seg123',
      name: 'Test Segment',
      description: 'Test Description',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getSegment';
      if (paramName === 'segmentId') return 'seg123';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('createSegment operation should create new segment', async () => {
    const mockResponse = {
      id: 'new-seg-id',
      name: 'New Segment',
      rules: { event: 'page_view' },
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'createSegment';
      if (paramName === 'name') return 'New Segment';
      if (paramName === 'description') return 'New segment description';
      if (paramName === 'rules') return JSON.stringify({ event: 'page_view' });
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('updateSegment operation should update segment', async () => {
    const mockResponse = {
      id: 'seg123',
      name: 'Updated Segment',
      rules: { event: 'click' },
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'updateSegment';
      if (paramName === 'segmentId') return 'seg123';
      if (paramName === 'name') return 'Updated Segment';
      if (paramName === 'rules') return JSON.stringify({ event: 'click' });
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('deleteSegment operation should delete segment', async () => {
    const mockResponse = { success: true };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'deleteSegment';
      if (paramName === 'segmentId') return 'seg123';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('getSegmentUsers operation should get users in segment', async () => {
    const mockResponse = {
      users: [
        { id: 'user1', email: 'user1@example.com' },
        { id: 'user2', email: 'user2@example.com' },
      ],
      cursor: 'next-cursor',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number, defaultValue?: any) => {
      if (paramName === 'operation') return 'getSegmentUsers';
      if (paramName === 'segmentId') return 'seg123';
      if (paramName === 'limit') return 20;
      if (paramName === 'cursor') return '';
      return defaultValue;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('should handle API errors correctly', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getSegment';
      if (paramName === 'segmentId') return 'invalid-id';
    });

    const apiError = new Error('Segment not found');
    (apiError as any).httpCode = '404';
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

    await expect(
      executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Segment not found');
  });

  test('should handle invalid JSON in rules parameter', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'createSegment';
      if (paramName === 'name') return 'Test Segment';
      if (paramName === 'rules') return 'invalid-json';
    });

    await expect(
      executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow();
  });
});
});
