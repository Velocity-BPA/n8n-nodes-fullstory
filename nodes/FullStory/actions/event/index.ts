/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { fullStoryApiRequest, fullStoryApiRequestAllItems } from '../../transport';
import {
	removeEmptyProperties,
	parseJsonParameter,
	toIsoTimestamp,
	buildEventContext,
	chunkArray,
} from '../../utils';
import { FULLSTORY_BATCH_SIZE_LIMIT } from '../../constants';

export const eventOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['event'],
			},
		},
		options: [
			{
				name: 'Batch Track',
				value: 'batchTrack',
				description: 'Track multiple events in batch',
				action: 'Batch track events',
			},
			{
				name: 'Create Definition',
				value: 'createDefinition',
				description: 'Create custom event schema',
				action: 'Create event definition',
			},
			{
				name: 'Delete Definition',
				value: 'deleteDefinition',
				description: 'Delete event definition',
				action: 'Delete event definition',
			},
			{
				name: 'Get Definition',
				value: 'getDefinition',
				description: 'Get event definition details',
				action: 'Get event definition',
			},
			{
				name: 'List Definitions',
				value: 'listDefinitions',
				description: 'List all custom event definitions',
				action: 'List event definitions',
			},
			{
				name: 'Track',
				value: 'track',
				description: 'Track a custom event',
				action: 'Track a custom event',
			},
			{
				name: 'Update Definition',
				value: 'updateDefinition',
				description: 'Update event schema',
				action: 'Update event definition',
			},
		],
		default: 'track',
	},
];

export const eventFields: INodeProperties[] = [
	// Track operation fields
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['track'],
			},
		},
		description: 'The user ID associated with this event',
	},
	{
		displayName: 'Event Name',
		name: 'eventName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['track'],
			},
		},
		description: 'Name of the event to track',
	},
	{
		displayName: 'Timestamp',
		name: 'timestamp',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['track'],
			},
		},
		description: 'When the event occurred. If not provided, the current time will be used.',
	},
	{
		displayName: 'Properties (JSON)',
		name: 'properties',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['track'],
			},
		},
		description: 'Custom event properties as JSON object',
	},
	{
		displayName: 'Context Options',
		name: 'contextOptions',
		type: 'collection',
		placeholder: 'Add Context',
		default: {},
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['track'],
			},
		},
		options: [
			{
				displayName: 'Session ID',
				name: 'sessionId',
				type: 'string',
				default: '',
				description: 'Associate event with a specific session',
			},
			{
				displayName: 'Use Most Recent Session',
				name: 'useMostRecentSession',
				type: 'boolean',
				default: false,
				description: 'Whether to associate event with the user\'s most recent session',
			},
			{
				displayName: 'Browser URL',
				name: 'browserUrl',
				type: 'string',
				default: '',
				description: 'The URL where the event occurred',
			},
			{
				displayName: 'User Agent',
				name: 'userAgent',
				type: 'string',
				default: '',
				description: 'Browser user agent string',
			},
			{
				displayName: 'Initial Referrer',
				name: 'initialReferrer',
				type: 'string',
				default: '',
				description: 'The referring URL',
			},
			{
				displayName: 'IP Address',
				name: 'ipAddress',
				type: 'string',
				default: '',
				description: 'User\'s IP address for geolocation',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'User\'s city',
			},
			{
				displayName: 'Region',
				name: 'region',
				type: 'string',
				default: '',
				description: 'User\'s region/state',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				description: 'User\'s country',
			},
		],
	},
	// Batch track fields
	{
		displayName: 'Events',
		name: 'events',
		type: 'json',
		required: true,
		default: '[]',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['batchTrack'],
			},
		},
		description: 'Array of event objects. Each should have user.uid, name, and optionally timestamp and properties.',
	},
	// Event definition fields
	{
		displayName: 'Definition ID',
		name: 'definitionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['getDefinition', 'updateDefinition', 'deleteDefinition'],
			},
		},
		description: 'The ID of the event definition',
	},
	// Create definition fields
	{
		displayName: 'Definition Name',
		name: 'definitionName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['createDefinition'],
			},
		},
		description: 'Name for the event definition',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['createDefinition'],
			},
		},
		description: 'Description of the event',
	},
	{
		displayName: 'Schema (JSON)',
		name: 'schema',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['createDefinition', 'updateDefinition'],
			},
		},
		description: 'Property schema definition as JSON object',
	},
	// List definitions options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['listDefinitions'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['listDefinitions'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	// Update definition fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['updateDefinition'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the event definition',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'New description for the event',
			},
		],
	},
];

export async function executeEventOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	if (operation === 'track') {
		const userId = this.getNodeParameter('userId', i) as string;
		const eventName = this.getNodeParameter('eventName', i) as string;
		const timestamp = this.getNodeParameter('timestamp', i, '') as string;
		const properties = this.getNodeParameter('properties', i, '{}') as string;
		const contextOptions = this.getNodeParameter('contextOptions', i, {}) as IDataObject;

		const body: IDataObject = {
			user: { uid: userId },
			name: eventName,
		};

		if (timestamp) {
			body.timestamp = toIsoTimestamp(timestamp);
		}

		const parsedProperties = parseJsonParameter(properties);
		if (parsedProperties && Object.keys(parsedProperties).length > 0) {
			body.properties = parsedProperties;
		}

		// Build session context
		if (contextOptions.sessionId || contextOptions.useMostRecentSession) {
			body.session = removeEmptyProperties({
				id: contextOptions.sessionId,
				use_most_recent: contextOptions.useMostRecentSession,
			});
		}

		// Build browser/location context
		const context = buildEventContext(
			contextOptions.browserUrl as string,
			contextOptions.userAgent as string,
			contextOptions.initialReferrer as string,
			contextOptions.ipAddress as string,
			contextOptions.city as string,
			contextOptions.region as string,
			contextOptions.country as string,
		);

		if (context) {
			body.context = context;
		}

		const response = await fullStoryApiRequest.call(this, 'POST', '/v2/events', body);
		returnData.push({ json: response as IDataObject || { success: true } });
	}

	if (operation === 'batchTrack') {
		const eventsJson = this.getNodeParameter('events', i) as string;
		let events: IDataObject[];

		try {
			events = JSON.parse(eventsJson) as IDataObject[];
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid JSON format for events array',
				{ itemIndex: i },
			);
		}

		if (!Array.isArray(events)) {
			throw new NodeOperationError(
				this.getNode(),
				'Events must be an array',
				{ itemIndex: i },
			);
		}

		// Process in batches
		const batches = chunkArray(events, FULLSTORY_BATCH_SIZE_LIMIT);
		const responses: IDataObject[] = [];

		for (const batch of batches) {
			const body: IDataObject = {
				requests: batch.map((event: IDataObject) => {
					const eventBody: IDataObject = {
						user: event.user || { uid: event.userId || event.user_id },
						name: event.name || event.eventName || event.event_name,
					};

					if (event.timestamp) {
						eventBody.timestamp = toIsoTimestamp(event.timestamp as string);
					}

					if (event.properties) {
						eventBody.properties = event.properties;
					}

					if (event.session) {
						eventBody.session = event.session;
					}

					if (event.context) {
						eventBody.context = event.context;
					}

					return removeEmptyProperties(eventBody);
				}),
			};

			const response = await fullStoryApiRequest.call(this, 'POST', '/v2/events', body);
			if (response) {
				responses.push(response as IDataObject);
			}
		}

		returnData.push({ json: { success: true, batchCount: batches.length, responses } });
	}

	if (operation === 'listDefinitions') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/events/v1/definitions',
				undefined,
				{},
				'definitions',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;

			const response = await fullStoryApiRequest.call(
				this,
				'GET',
				'/events/v1/definitions',
				undefined,
				{ limit },
			);
			const definitions = (response as IDataObject).definitions as IDataObject[] || [];
			returnData.push(...definitions.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'getDefinition') {
		const definitionId = this.getNodeParameter('definitionId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			`/events/v1/definitions/${encodeURIComponent(definitionId)}`,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'createDefinition') {
		const name = this.getNodeParameter('definitionName', i) as string;
		const description = this.getNodeParameter('description', i, '') as string;
		const schema = this.getNodeParameter('schema', i, '{}') as string;

		const body: IDataObject = removeEmptyProperties({
			name,
			description,
			schema: parseJsonParameter(schema),
		});

		const response = await fullStoryApiRequest.call(this, 'POST', '/events/v1/definitions', body);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'updateDefinition') {
		const definitionId = this.getNodeParameter('definitionId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		const schema = this.getNodeParameter('schema', i, '{}') as string;

		const body: IDataObject = removeEmptyProperties({
			name: updateFields.name,
			description: updateFields.description,
			schema: parseJsonParameter(schema),
		});

		const response = await fullStoryApiRequest.call(
			this,
			'PATCH',
			`/events/v1/definitions/${encodeURIComponent(definitionId)}`,
			body,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'deleteDefinition') {
		const definitionId = this.getNodeParameter('definitionId', i) as string;

		await fullStoryApiRequest.call(
			this,
			'DELETE',
			`/events/v1/definitions/${encodeURIComponent(definitionId)}`,
		);
		returnData.push({ json: { success: true, definitionId } });
	}

	return returnData;
}
