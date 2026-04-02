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
describe('User Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://api.fullstory.com/v2'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  it('should get user successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getUser';
      if (param === 'uid') return 'user123';
      return '';
    });

    const mockResponse = { id: 'user123', email: 'test@example.com' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.fullstory.com/v2/users/user123',
      headers: {
        'Authorization': 'Basic test-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  it('should handle get user error', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getUser';
      if (param === 'uid') return 'user123';
      return '';
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('User not found'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'User not found' }, pairedItem: { item: 0 } }]);
  });

  it('should list users successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'listUsers';
      if (param === 'limit') return 50;
      return '';
    });

    const mockResponse = { users: [{ id: 'user1' }, { id: 'user2' }] };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  it('should create user successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'createUser';
      if (param === 'uid') return 'newuser123';
      if (param === 'display_name') return 'Test User';
      if (param === 'email') return 'test@example.com';
      if (param === 'properties') return '{"role": "admin"}';
      return '';
    });

    const mockResponse = { id: 'newuser123', display_name: 'Test User' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.fullstory.com/v2/users',
      headers: {
        'Authorization': 'Basic test-key',
        'Content-Type': 'application/json',
      },
      body: {
        uid: 'newuser123',
        display_name: 'Test User',
        email: 'test@example.com',
        properties: { role: 'admin' }
      },
      json: true,
    });
  });

  it('should update user successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'updateUser';
      if (param === 'uid') return 'user123';
      if (param === 'display_name') return 'Updated User';
      return '';
    });

    const mockResponse = { id: 'user123', display_name: 'Updated User' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  it('should delete user successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'deleteUser';
      if (param === 'uid') return 'user123';
      return '';
    });

    const mockResponse = { success: true };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'DELETE',
      url: 'https://api.fullstory.com/v2/users/user123',
      headers: {
        'Authorization': 'Basic test-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });
});

describe('Event Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-api-key', 
        baseUrl: 'https://api.fullstory.com/v2' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  test('createEvent operation should create an event successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createEvent')
      .mockReturnValueOnce('https://app.fullstory.com/ui/session-id')
      .mockReturnValueOnce('custom_event')
      .mockReturnValueOnce({ property: [{ key: 'prop1', value: 'value1' }] })
      .mockReturnValueOnce('2023-01-01T00:00:00Z');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ success: true, event_id: '12345' });

    const items = [{ json: {} }];
    const result = await executeEventOperations.call(mockExecuteFunctions, items);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.fullstory.com/v2/events',
      headers: {
        'Authorization': expect.stringContaining('Basic'),
        'Content-Type': 'application/json',
      },
      body: {
        session_url: 'https://app.fullstory.com/ui/session-id',
        name: 'custom_event',
        properties: { prop1: 'value1' },
        timestamp: '2023-01-01T00:00:00Z',
      },
      json: true,
    });

    expect(result).toEqual([{ json: { success: true, event_id: '12345' }, pairedItem: { item: 0 } }]);
  });

  test('listEvents operation should retrieve events successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('listEvents')
      .mockReturnValueOnce(50)
      .mockReturnValueOnce('test_event')
      .mockReturnValueOnce('user123')
      .mockReturnValueOnce('session456')
      .mockReturnValueOnce('2023-01-01T00:00:00Z')
      .mockReturnValueOnce('2023-01-02T00:00:00Z');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ events: [], total: 0 });

    const items = [{ json: {} }];
    const result = await executeEventOperations.call(mockExecuteFunctions, items);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.fullstory.com/v2/events?limit=50&event_name=test_event&user_uid=user123&session_id=session456&start_time=2023-01-01T00%3A00%3A00Z&end_time=2023-01-02T00%3A00%3A00Z',
      headers: {
        'Authorization': expect.stringContaining('Basic'),
      },
      json: true,
    });

    expect(result).toEqual([{ json: { events: [], total: 0 }, pairedItem: { item: 0 } }]);
  });

  test('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createEvent');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const items = [{ json: {} }];
    const result = await executeEventOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
  });

  test('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

    const items = [{ json: {} }];

    await expect(executeEventOperations.call(mockExecuteFunctions, items)).rejects.toThrow('Unknown operation: unknownOperation');
  });
});

describe('Session Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-key', baseUrl: 'https://api.fullstory.com/v2' }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  describe('getSession operation', () => {
    it('should retrieve session details successfully', async () => {
      const mockSession = { id: 'session123', user_id: 'user456' };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getSession';
        if (param === 'id') return 'session123';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockSession);

      const result = await executeSessionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockSession);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/sessions/session123',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Basic'),
        }),
        json: true,
      });
    });

    it('should handle getSession errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getSession';
        if (param === 'id') return 'session123';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Session not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSessionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Session not found');
    });
  });

  describe('listSessions operation', () => {
    it('should list sessions successfully', async () => {
      const mockSessions = { sessions: [{ id: 'session1' }, { id: 'session2' }] };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'listSessions';
        if (param === 'limit') return 50;
        if (param === 'user_uid') return 'user123';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockSessions);

      const result = await executeSessionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockSessions);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/sessions',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Basic'),
        }),
        qs: { limit: 50, user_uid: 'user123' },
        json: true,
      });
    });
  });

  describe('getSessionEvents operation', () => {
    it('should retrieve session events successfully', async () => {
      const mockEvents = { events: [{ type: 'click' }, { type: 'scroll' }] };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getSessionEvents';
        if (param === 'id') return 'session123';
        if (param === 'limit') return 100;
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockEvents);

      const result = await executeSessionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockEvents);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/sessions/session123/events',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Basic'),
        }),
        qs: { limit: 100 },
        json: true,
      });
    });

    it('should handle getSessionEvents errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getSessionEvents';
        if (param === 'id') return 'session123';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Events not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSessionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Events not found');
    });
  });
});

describe('Segment Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.fullstory.com/v2' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('listSegments', () => {
    it('should list segments successfully', async () => {
      const mockResponse = { segments: [{ id: '1', name: 'Test Segment' }] };
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('listSegments')
        .mockReturnValueOnce(50);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/segments',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        qs: { limit: 50 },
        json: true,
      });
    });

    it('should handle errors when listing segments', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('listSegments');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getSegment', () => {
    it('should get segment successfully', async () => {
      const mockResponse = { id: '1', name: 'Test Segment' };
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getSegment')
        .mockReturnValueOnce('1');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('createSegment', () => {
    it('should create segment successfully', async () => {
      const mockResponse = { id: '1', name: 'New Segment' };
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createSegment')
        .mockReturnValueOnce('New Segment')
        .mockReturnValueOnce('{"field": "value"}')
        .mockReturnValueOnce('Test description');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('updateSegment', () => {
    it('should update segment successfully', async () => {
      const mockResponse = { id: '1', name: 'Updated Segment' };
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('updateSegment')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('Updated Segment')
        .mockReturnValueOnce('{"field": "new_value"}')
        .mockReturnValueOnce('Updated description');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('deleteSegment', () => {
    it('should delete segment successfully', async () => {
      const mockResponse = { success: true };
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('deleteSegment')
        .mockReturnValueOnce('1');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getSegmentUsers', () => {
    it('should get segment users successfully', async () => {
      const mockResponse = { users: [{ id: 'user1', email: 'test@example.com' }] };
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getSegmentUsers')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce(25);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
    });
  });
});

describe('Export Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://api.fullstory.com/v2'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('createUserExport', () => {
    it('should create user export successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createUserExport')
        .mockReturnValueOnce({ segment: 'active_users' })
        .mockReturnValueOnce('json')
        .mockReturnValueOnce('id,email,properties');

      const mockResponse = { id: 'export_123', status: 'pending' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeExportOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.fullstory.com/v2/exports/users',
        headers: {
          'Authorization': 'Basic test-key',
          'Content-Type': 'application/json',
        },
        body: {
          criteria: { segment: 'active_users' },
          format: 'json',
          fields: ['id', 'email', 'properties'],
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle createUserExport error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createUserExport')
        .mockReturnValueOnce({ segment: 'active_users' })
        .mockReturnValueOnce('json')
        .mockReturnValueOnce('');

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeExportOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('createEventExport', () => {
    it('should create event export successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createEventExport')
        .mockReturnValueOnce({ event_type: 'click' })
        .mockReturnValueOnce('csv')
        .mockReturnValueOnce('2023-01-01T00:00:00Z')
        .mockReturnValueOnce('2023-01-31T23:59:59Z');

      const mockResponse = { id: 'export_456', status: 'pending' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeExportOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.fullstory.com/v2/exports/events',
        headers: {
          'Authorization': 'Basic test-key',
          'Content-Type': 'application/json',
        },
        body: {
          criteria: { event_type: 'click' },
          format: 'csv',
          start_time: '2023-01-01T00:00:00Z',
          end_time: '2023-01-31T23:59:59Z',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getExport', () => {
    it('should get export successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getExport')
        .mockReturnValueOnce('export_123');

      const mockResponse = { id: 'export_123', status: 'completed', download_url: 'https://example.com/download' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeExportOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/exports/export_123',
        headers: {
          'Authorization': 'Basic test-key',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('listExports', () => {
    it('should list exports successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('listExports')
        .mockReturnValueOnce(10)
        .mockReturnValueOnce('completed');

      const mockResponse = { exports: [{ id: 'export_1' }, { id: 'export_2' }], total: 2 };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeExportOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.fullstory.com/v2/exports',
        headers: {
          'Authorization': 'Basic test-key',
        },
        qs: {
          limit: 10,
          status: 'completed',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});
});
