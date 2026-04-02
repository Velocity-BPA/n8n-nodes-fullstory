/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-fullstory/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class FullStory implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'FullStory',
    name: 'fullstory',
    icon: 'file:fullstory.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the FullStory API',
    defaults: {
      name: 'FullStory',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'fullstoryApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Users',
            value: 'users',
          },
          {
            name: 'Events',
            value: 'events',
          },
          {
            name: 'Sessions',
            value: 'sessions',
          },
          {
            name: 'Segments',
            value: 'segments',
          },
          {
            name: 'Exports',
            value: 'exports',
          }
        ],
        default: 'users',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['users'],
    },
  },
  options: [
    {
      name: 'Get Users',
      value: 'getUsers',
      description: 'Retrieve multiple users with filtering',
      action: 'Get users',
    },
    {
      name: 'Get User',
      value: 'getUser',
      description: 'Get a specific user by ID',
      action: 'Get a user',
    },
    {
      name: 'Create User',
      value: 'createUser',
      description: 'Create or update a user profile',
      action: 'Create a user',
    },
    {
      name: 'Update User',
      value: 'updateUser',
      description: 'Update user attributes and properties',
      action: 'Update a user',
    },
    {
      name: 'Delete User',
      value: 'deleteUser',
      description: 'Remove a user from the system',
      action: 'Delete a user',
    },
  ],
  default: 'getUsers',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['events'],
    },
  },
  options: [
    {
      name: 'Get Events',
      value: 'getEvents',
      description: 'Retrieve events with filtering and search',
      action: 'Get events',
    },
    {
      name: 'Get Event',
      value: 'getEvent',
      description: 'Get specific event details',
      action: 'Get event',
    },
    {
      name: 'Create Event',
      value: 'createEvent',
      description: 'Send custom events to FullStory',
      action: 'Create event',
    },
    {
      name: 'Search Events',
      value: 'searchEvents',
      description: 'Search events with advanced filters',
      action: 'Search events',
    },
  ],
  default: 'getEvents',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['sessions'],
    },
  },
  options: [
    {
      name: 'Get Sessions',
      value: 'getSessions',
      description: 'List sessions with filtering options',
      action: 'Get sessions',
    },
    {
      name: 'Get Session',
      value: 'getSession',
      description: 'Get detailed session information',
      action: 'Get session',
    },
    {
      name: 'Get Session Replay',
      value: 'getSessionReplay',
      description: 'Get session replay URL',
      action: 'Get session replay',
    },
    {
      name: 'Search Sessions',
      value: 'searchSessions',
      description: 'Search sessions with filters',
      action: 'Search sessions',
    },
    {
      name: 'Get Session Events',
      value: 'getSessionEvents',
      description: 'Get all events for a specific session',
      action: 'Get session events',
    },
  ],
  default: 'getSessions',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['segments'],
    },
  },
  options: [
    {
      name: 'Get All Segments',
      value: 'getSegments',
      description: 'List all segments in the organization',
      action: 'Get all segments',
    },
    {
      name: 'Get Segment',
      value: 'getSegment',
      description: 'Get specific segment details',
      action: 'Get a segment',
    },
    {
      name: 'Create Segment',
      value: 'createSegment',
      description: 'Create a new user segment',
      action: 'Create a segment',
    },
    {
      name: 'Update Segment',
      value: 'updateSegment',
      description: 'Update segment definition',
      action: 'Update a segment',
    },
    {
      name: 'Delete Segment',
      value: 'deleteSegment',
      description: 'Delete a segment',
      action: 'Delete a segment',
    },
    {
      name: 'Get Segment Users',
      value: 'getSegmentUsers',
      description: 'Get users in a segment',
      action: 'Get segment users',
    },
  ],
  default: 'getSegments',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['exports'],
    },
  },
  options: [
    {
      name: 'Create User Export',
      value: 'createUserExport',
      description: 'Create a user data export job',
      action: 'Create user export',
    },
    {
      name: 'Create Event Export',
      value: 'createEventExport',
      description: 'Create an event data export job',
      action: 'Create event export',
    },
    {
      name: 'Get Export',
      value: 'getExport',
      description: 'Get export job status and results',
      action: 'Get export',
    },
    {
      name: 'List Exports',
      value: 'listExports',
      description: 'List all export jobs',
      action: 'List exports',
    },
  ],
  default: 'createUserExport',
},
      // Parameter definitions
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['users'],
      operation: ['getUsers'],
    },
  },
  default: 50,
  description: 'Maximum number of users to retrieve',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['users'],
      operation: ['getUsers'],
    },
  },
  default: '',
  description: 'Cursor for pagination',
},
{
  displayName: 'Email',
  name: 'email',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['users'],
      operation: ['getUsers'],
    },
  },
  default: '',
  description: 'Filter by user email',
},
{
  displayName: 'UID',
  name: 'uid',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['users'],
      operation: ['getUsers', 'createUser'],
    },
  },
  default: '',
  description: 'Filter by user UID or UID for new user',
},
{
  displayName: 'User ID',
  name: 'userId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['users'],
      operation: ['getUser', 'updateUser', 'deleteUser'],
    },
  },
  default: '',
  description: 'The ID of the user',
},
{
  displayName: 'Email',
  name: 'userEmail',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['users'],
      operation: ['createUser'],
    },
  },
  default: '',
  description: 'Email address for the user',
},
{
  displayName: 'Display Name',
  name: 'displayName',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['users'],
      operation: ['createUser'],
    },
  },
  default: '',
  description: 'Display name for the user',
},
{
  displayName: 'Properties',
  name: 'properties',
  type: 'fixedCollection',
  typeOptions: {
    multipleValues: true,
  },
  displayOptions: {
    show: {
      resource: ['users'],
      operation: ['createUser', 'updateUser'],
    },
  },
  default: {},
  description: 'Custom properties for the user',
  options: [
    {
      name: 'property',
      displayName: 'Property',
      values: [
        {
          displayName: 'Key',
          name: 'key',
          type: 'string',
          default: '',
          description: 'Property key',
        },
        {
          displayName: 'Value',
          name: 'value',
          type: 'string',
          default: '',
          description: 'Property value',
        },
      ],
    },
  ],
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEvents'],
    },
  },
  default: 50,
  description: 'Maximum number of events to return',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEvents'],
    },
  },
  default: '',
  description: 'Pagination cursor for next page of results',
},
{
  displayName: 'Start Date',
  name: 'start',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEvents'],
    },
  },
  default: '',
  description: 'Start date for filtering events',
},
{
  displayName: 'End Date',
  name: 'end',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEvents'],
    },
  },
  default: '',
  description: 'End date for filtering events',
},
{
  displayName: 'Event Name',
  name: 'eventName',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEvents'],
    },
  },
  default: '',
  description: 'Filter events by event name',
},
{
  displayName: 'User ID',
  name: 'userId',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEvents', 'createEvent'],
    },
  },
  default: '',
  description: 'Filter events by user ID',
},
{
  displayName: 'Session URL',
  name: 'session_url',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['createEvent'],
    },
  },
  default: '',
  description: 'The URL of the session where the event occurred',
},
{
  displayName: 'Event ID',
  name: 'eventId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEvent'],
    },
  },
  default: '',
  description: 'The ID of the event to retrieve',
},
{
  displayName: 'Event Name',
  name: 'eventName',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['createEvent'],
    },
  },
  default: '',
  description: 'Name of the event to create',
},
{
  displayName: 'Properties',
  name: 'properties',
  type: 'fixedCollection',
  typeOptions: { multipleValues: true },
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['createEvent'],
    },
  },
  default: {},
  options: [
    {
      name: 'property',
      displayName: 'Property',
      values: [
        {
          displayName: 'Key',
          name: 'key',
          type: 'string',
          default: '',
          description: 'Property key',
        },
        {
          displayName: 'Value',
          name: 'value',
          type: 'string',
          default: '',
          description: 'Property value',
        },
      ],
    },
  ],
  description: 'Additional properties for the event',
},
{
  displayName: 'Timestamp',
  name: 'timestamp',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['createEvent'],
    },
  },
  default: '',
  description: 'Timestamp for the event (defaults to current time)',
},
{
  displayName: 'Query',
  name: 'query',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['searchEvents'],
    },
  },
  default: '',
  description: 'Search query for events',
},
{
  displayName: 'Start Date',
  name: 'start',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['searchEvents'],
    },
  },
  default: '',
  description: 'Start date for search range',
},
{
  displayName: 'End Date',
  name: 'end',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['searchEvents'],
    },
  },
  default: '',
  description: 'End date for search range',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['searchEvents'],
    },
  },
  default: 50,
  description: 'Maximum number of search results to return',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['sessions'],
      operation: ['getSessions'],
    },
  },
  default: 50,
  description: 'Maximum number of sessions to return',
  typeOptions: {
    minValue: 1,
    maxValue: 1000,
  },
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['sessions'],
      operation: ['getSessions'],
    },
  },
  default: '',
  description: 'Cursor for pagination',
},
{
  displayName: 'Start Time',
  name: 'start',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['sessions'],
      operation: ['getSessions'],
    },
  },
  default: '',
  description: 'Start time for session filtering (ISO 8601 format)',
},
{
  displayName: 'End Time',
  name: 'end',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['sessions'],
      operation: ['getSessions'],
    },
  },
  default: '',
  description: 'End time for session filtering (ISO 8601 format)',
},
{
  displayName: 'User ID',
  name: 'userId',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['sessions'],
      operation: ['getSessions', 'searchSessions'],
    },
  },
  default: '',
  description: 'Filter sessions by user ID',
},
{
  displayName: 'Session ID',
  name: 'sessionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sessions'],
      operation: ['getSession', 'getSessionReplay', 'getSessionEvents'],
    },
  },
  default: '',
  description: 'The ID of the session',
},
{
  displayName: 'Start Time',
  name: 'start',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['sessions'],
      operation: ['searchSessions'],
    },
  },
  default: '',
  description: 'Start time for session search (ISO 8601 format)',
},
{
  displayName: 'End Time',
  name: 'end',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['sessions'],
      operation: ['searchSessions'],
    },
  },
  default: '',
  description: 'End time for session search (ISO 8601 format)',
},
{
  displayName: 'Has Errors',
  name: 'hasErrors',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['sessions'],
      operation: ['searchSessions'],
    },
  },
  default: false,
  description: 'Filter sessions that have errors',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['sessions'],
      operation: ['searchSessions', 'getSessionEvents'],
    },
  },
  default: 50,
  description: 'Maximum number of sessions to return',
  typeOptions: {
    minValue: 1,
    maxValue: 1000,
  },
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['getSegments'],
    },
  },
  default: 20,
  description: 'Maximum number of segments to return',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['getSegments'],
    },
  },
  default: '',
  description: 'Cursor for pagination',
},
{
  displayName: 'Segment ID',
  name: 'segmentId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['getSegment', 'updateSegment', 'deleteSegment', 'getSegmentUsers'],
    },
  },
  default: '',
  description: 'The ID of the segment',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['createSegment'],
    },
  },
  default: '',
  description: 'Name of the segment',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['updateSegment'],
    },
  },
  default: '',
  description: 'Name of the segment',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['createSegment'],
    },
  },
  default: '',
  description: 'Description of the segment',
},
{
  displayName: 'Rules',
  name: 'rules',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['createSegment', 'updateSegment'],
    },
  },
  default: '{}',
  description: 'Segment rules as JSON object',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['getSegmentUsers'],
    },
  },
  default: 20,
  description: 'Maximum number of users to return',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['getSegmentUsers'],
    },
  },
  default: '',
  description: 'Cursor for pagination',
},
{
  displayName: 'Criteria',
  name: 'criteria',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['exports'],
      operation: ['createUserExport'],
    },
  },
  default: '{}',
  description: 'Criteria for filtering users to export',
  required: true,
},
{
  displayName: 'Format',
  name: 'format',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['exports'],
      operation: ['createUserExport', 'createEventExport'],
    },
  },
  options: [
    { name: 'CSV', value: 'csv' },
    { name: 'JSON', value: 'json' }
  ],
  default: 'json',
  description: 'Export format',
},
{
  displayName: 'Fields',
  name: 'fields',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['exports'],
      operation: ['createUserExport'],
    },
  },
  default: '',
  description: 'Comma-separated list of fields to include in export',
},
{
  displayName: 'Criteria',
  name: 'criteria',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['exports'],
      operation: ['createEventExport'],
    },
  },
  default: '{}',
  description: 'Criteria for filtering events to export',
  required: true,
},
{
  displayName: 'Start Time',
  name: 'startTime',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['exports'],
      operation: ['createEventExport'],
    },
  },
  default: '',
  description: 'Start time for event export range',
  required: true,
},
{
  displayName: 'End Time',
  name: 'endTime',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['exports'],
      operation: ['createEventExport'],
    },
  },
  default: '',
  description: 'End time for event export range',
  required: true,
},
{
  displayName: 'Export ID',
  name: 'exportId',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['exports'],
      operation: ['getExport'],
    },
  },
  default: '',
  description: 'ID of the export job',
  required: true,
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['exports'],
      operation: ['listExports'],
    },
  },
  default: 50,
  description: 'Maximum number of exports to return',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['exports'],
      operation: ['listExports'],
    },
  },
  options: [
    { name: 'All', value: '' },
    { name: 'Pending', value: 'pending' },
    { name: 'Processing', value: 'processing' },
    { name: 'Completed', value: 'completed' },
    { name: 'Failed', value: 'failed' }
  ],
  default: '',
  description: 'Filter exports by status',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'users':
        return [await executeUsersOperations.call(this, items)];
      case 'events':
        return [await executeEventsOperations.call(this, items)];
      case 'sessions':
        return [await executeSessionsOperations.call(this, items)];
      case 'segments':
        return [await executeSegmentsOperations.call(this, items)];
      case 'exports':
        return [await executeExportsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeUsersOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('fullstoryApi') as any;

  // Encode API key for Basic auth
  const encodedKey = Buffer.from(`${credentials.apiKey}:`).toString('base64');

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getUsers': {
          const limit = this.getNodeParameter('limit', i) as number;
          const cursor = this.getNodeParameter('cursor', i) as string;
          const email = this.getNodeParameter('email', i) as string;
          const uid = this.getNodeParameter('uid', i) as string;

          const queryParams: any = {};
          if (limit) queryParams.limit = limit;
          if (cursor) queryParams.cursor = cursor;
          if (email) queryParams.email = email;
          if (uid) queryParams.uid = uid;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `https://api.fullstory.com/v2/users${queryString ? `?${queryString}` : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Basic ${encodedKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getUser': {
          const userId = this.getNodeParameter('userId', i) as string;

          const options: any = {
            method: 'GET',
            url: `https://api.fullstory.com/v2/users/${userId}`,
            headers: {
              'Authorization': `Basic ${encodedKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createUser': {
          const uid = this.getNodeParameter('uid', i) as string;
          const userEmail = this.getNodeParameter('userEmail', i) as string;
          const displayName = this.getNodeParameter('displayName', i) as string;
          const properties = this.getNodeParameter('properties', i) as any;

          const body: any = {
            uid,
            email: userEmail,
          };

          if (displayName) {
            body.displayName = displayName;
          }

          if (properties && properties.property) {
            body.properties = {};
            for (const prop of properties.property) {
              body.properties[prop.key] = prop.value;
            }
          }

          const options: any = {
            method: 'POST',
            url: 'https://api.fullstory.com/v2/users',
            headers: {
              'Authorization': `Basic ${encodedKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateUser': {
          const userId = this.getNodeParameter('userId', i) as string;
          const properties = this.getNodeParameter('properties', i) as any;

          const body: any = {};

          if (properties && properties.property) {
            body.properties = {};
            for (const prop of properties.property) {
              body.properties[prop.key] = prop.value;
            }
          }

          const options: any = {
            method: 'PUT',
            url: `https://api.fullstory.com/v2/users/${userId}`,
            headers: {
              'Authorization': `Basic ${encodedKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'deleteUser': {
          const userId = this.getNodeParameter('userId', i) as string;

          const options: any = {
            method: 'DELETE',
            url: `https://api.fullstory.com/v2/users/${userId}`,
            headers: {
              'Authorization': `Basic ${encodedKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeEventsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('fullstoryApi') as any;

  // Create base64 encoded API key with colon suffix for Basic auth
  const encodedApiKey = Buffer.from(`${credentials.apiKey}:`).toString('base64');

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getEvents': {
          const limit = this.getNodeParameter('limit', i) as number;
          const cursor = this.getNodeParameter('cursor', i) as string;
          const start = this.getNodeParameter('start', i) as string;
          const end = this.getNodeParameter('end', i) as string;
          const eventName = this.getNodeParameter('eventName', i) as string;
          const userId = this.getNodeParameter('userId', i) as string;

          const queryParams: any = {};
          if (limit) queryParams.limit = limit;
          if (cursor) queryParams.cursor = cursor;
          if (start) queryParams.start = new Date(start).toISOString();
          if (end) queryParams.end = new Date(end).toISOString();
          if (eventName) queryParams.eventName = eventName;
          if (userId) queryParams.userId = userId;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `https://api.fullstory.com/v2/events${queryString ? `?${queryString}` : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Basic ${encodedApiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getEvent': {
          const eventId = this.getNodeParameter('eventId', i) as string;

          const options: any = {
            method: 'GET',
            url: `https://api.fullstory.com/v2/events/${eventId}`,
            headers: {
              'Authorization': `Basic ${encodedApiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createEvent': {
          const sessionUrl = this.getNodeParameter('session_url', i) as string;
          const eventName = this.getNodeParameter('eventName', i) as string;
          const userId = this.getNodeParameter('userId', i) as string;
          const properties = this.getNodeParameter('properties', i) as any;
          const timestamp = this.getNodeParameter('timestamp', i) as string;

          const body: any = {
            session_url: sessionUrl,
            name: eventName,
          };

          if (userId) body.userId = userId;
          if (timestamp) body.timestamp = new Date(timestamp).toISOString();
          
          // Process properties collection
          if (properties && properties.property) {
            const processedProperties: any = {};
            if (Array.isArray(properties.property)) {
              for (const prop of properties.property) {
                if (prop.key && prop.value !== undefined) {
                  processedProperties[prop.key] = prop.value;
                }
              }
            } else if (properties.property.key) {
              processedProperties[properties.property.key] = properties.property.value;
            }
            if (Object.keys(processedProperties).length > 0) {
              body.properties = processedProperties;
            }
          }

          const options: any = {
            method: 'POST',
            url: 'https://api.fullstory.com/v2/events',
            headers: {
              'Authorization': `Basic ${encodedApiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'searchEvents': {
          const query = this.getNodeParameter('query', i) as string;
          const start = this.getNodeParameter('start', i) as string;
          const end = this.getNodeParameter('end', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;

          const queryParams: any = {
            query,
          };
          if (start) queryParams.start = new Date(start).toISOString();
          if (end) queryParams.end = new Date(end).toISOString();
          if (limit) queryParams.limit = limit;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `https://api.fullstory.com/v2/events/search?${queryString}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Basic ${encodedApiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.response?.body) {
          throw new NodeApiError(this.getNode(), error.response.body, { itemIndex: i });
        }
        throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
      }
    }
  }

  return returnData;
}

async function executeSessionsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('fullstoryApi') as any;

  // Base64 encode API key with colon suffix for Basic auth
  const authToken = Buffer.from(credentials.apiKey + ':').toString('base64');

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getSessions': {
          const limit = this.getNodeParameter('limit', i, 50) as number;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const start = this.getNodeParameter('start', i, '') as string;
          const end = this.getNodeParameter('end', i, '') as string;
          const userId = this.getNodeParameter('userId', i, '') as string;

          const queryParams: any = {};
          if (limit) queryParams.limit = limit;
          if (cursor) queryParams.cursor = cursor;
          if (start) queryParams.start = start;
          if (end) queryParams.end = end;
          if (userId) queryParams.userId = userId;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = queryString 
            ? `https://api.fullstory.com/v2/sessions?${queryString}`
            : 'https://api.fullstory.com/v2/sessions';

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Basic ${authToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSession': {
          const sessionId = this.getNodeParameter('sessionId', i) as string;

          const options: any = {
            method: 'GET',
            url: `https://api.fullstory.com/v2/sessions/${sessionId}`,
            headers: {
              'Authorization': `Basic ${authToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSessionReplay': {
          const sessionId = this.getNodeParameter('sessionId', i) as string;

          const options: any = {
            method: 'GET',
            url: `https://api.fullstory.com/v2/sessions/${sessionId}/replay`,
            headers: {
              'Authorization': `Basic ${authToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'searchSessions': {
          const userId = this.getNodeParameter('userId', i, '') as string;
          const start = this.getNodeParameter('start', i, '') as string;
          const end = this.getNodeParameter('end', i, '') as string;
          const hasErrors = this.getNodeParameter('hasErrors', i, false) as boolean;
          const limit = this.getNodeParameter('limit', i, 50) as number;

          const queryParams: any = {};
          if (userId) queryParams.userId = userId;
          if (start) queryParams.start = start;
          if (end) queryParams.end = end;
          if (hasErrors) queryParams.hasErrors = hasErrors;
          if (limit) queryParams.limit = limit;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = queryString 
            ? `https://api.fullstory.com/v2/sessions/search?${queryString}`
            : 'https://api.fullstory.com/v2/sessions/search';

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Basic ${authToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSessionEvents': {
          const sessionId = this.getNodeParameter('sessionId', i) as string;
          const limit = this.getNodeParameter('limit', i, 50) as number;

          const queryParams: any = {};
          if (limit) queryParams.limit = limit;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = queryString 
            ? `https://api.fullstory.com/v2/sessions/${sessionId}/events?${queryString}`
            : `https://api.fullstory.com/v2/sessions/${sessionId}/events`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Basic ${authToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${operation}`,
            { itemIndex: i }
          );
      }

      returnData.push({ json: result, pairedItem: { item: i } });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error, { itemIndex: i });
        }
        throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
      }
    }
  }

  return returnData;
}

async function executeSegmentsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('fullstoryApi') as any;

  // Create base64 encoded API key with colon suffix for Basic auth
  const encodedKey = Buffer.from(credentials.apiKey + ':').toString('base64');

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const baseUrl = 'https://api.fullstory.com/v2';

      switch (operation) {
        case 'getSegments': {
          const limit = this.getNodeParameter('limit', i, 20) as number;
          const cursor = this.getNodeParameter('cursor', i, '') as string;

          const queryParams = new URLSearchParams();
          queryParams.append('limit', limit.toString());
          if (cursor) {
            queryParams.append('cursor', cursor);
          }

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/segments?${queryParams.toString()}`,
            headers: {
              'Authorization': `Basic ${encodedKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSegment': {
          const segmentId = this.getNodeParameter('segmentId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/segments/${segmentId}`,
            headers: {
              'Authorization': `Basic ${encodedKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createSegment': {
          const name = this.getNodeParameter('name', i) as string;
          const description = this.getNodeParameter('description', i, '') as string;
          const rulesParam = this.getNodeParameter('rules', i) as string;

          let rules: any;
          try {
            rules = typeof rulesParam === 'string' ? JSON.parse(rulesParam) : rulesParam;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Invalid JSON in rules parameter: ${error.message}`, { itemIndex: i });
          }

          const body: any = {
            name,
            rules,
          };

          if (description) {
            body.description = description;
          }

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/segments`,
            headers: {
              'Authorization': `Basic ${encodedKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateSegment': {
          const segmentId = this.getNodeParameter('segmentId', i) as string;
          const name = this.getNodeParameter('name', i, '') as string;
          const rulesParam = this.getNodeParameter('rules', i) as string;

          let rules: any;
          try {
            rules = typeof rulesParam === 'string' ? JSON.parse(rulesParam) : rulesParam;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Invalid JSON in rules parameter: ${error.message}`, { itemIndex: i });
          }

          const body: any = {
            rules,
          };

          if (name) {
            body.name = name;
          }

          const options: any = {
            method: 'PUT',
            url: `${baseUrl}/segments/${segmentId}`,
            headers: {
              'Authorization': `Basic ${encodedKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'deleteSegment': {
          const segmentId = this.getNodeParameter('segmentId', i) as string;

          const options: any = {
            method: 'DELETE',
            url: `${baseUrl}/segments/${segmentId}`,
            headers: {
              'Authorization': `Basic ${encodedKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSegmentUsers': {
          const segmentId = this.getNodeParameter('segmentId', i) as string;
          const limit = this.getNodeParameter('limit', i, 20) as number;
          const cursor = this.getNodeParameter('cursor', i, '') as string;

          const queryParams = new URLSearchParams();
          queryParams.append('limit', limit.toString());
          if (cursor) {
            queryParams.append('cursor', cursor);
          }

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/segments/${segmentId}/users?${queryParams.toString()}`,
            headers: {
              'Authorization': `Basic ${encodedKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error, { itemIndex: i });
        } else {
          throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
        }
      }
    }
  }

  return returnData;
}

async function executeExportsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('fullstoryApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'createUserExport': {
          const criteria = this.getNodeParameter('criteria', i) as any;
          const format = this.getNodeParameter('format', i) as string;
          const fields = this.getNodeParameter('fields', i) as string;

          const body: any = {
            criteria: typeof criteria === 'string' ? JSON.parse(criteria) : criteria,
            format,
          };

          if (fields) {
            body.fields = fields.split(',').map((field: string) => field.trim());
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/exports/users`,
            headers: {
              'Authorization': `Basic ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createEventExport': {
          const criteria = this.getNodeParameter('criteria', i) as any;
          const format = this.getNodeParameter('format', i) as string;
          const startTime = this.getNodeParameter('startTime', i) as string;
          const endTime = this.getNodeParameter('endTime', i) as string;

          const body: any = {
            criteria: typeof criteria === 'string' ? JSON.parse(criteria) : criteria,
            format,
            start_time: startTime,
            end_time: endTime,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/exports/events`,
            headers: {
              'Authorization': `Basic ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getExport': {
          const exportId = this.getNodeParameter('exportId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/exports/${exportId}`,
            headers: {
              'Authorization': `Basic ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'listExports': {
          const limit = this.getNodeParameter('limit', i) as number;
          const status = this.getNodeParameter('status', i) as string;

          const params: any = {};
          if (limit) params.limit = limit;
          if (status) params.status = status;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/exports`,
            headers: {
              'Authorization': `Basic ${credentials.apiKey}`,
            },
            qs: params,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}