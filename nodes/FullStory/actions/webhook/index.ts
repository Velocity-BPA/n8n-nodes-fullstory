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

import { fullStoryApiRequest, fullStoryApiRequestAllItems } from '../../transport';
import { removeEmptyProperties, formatWebhookEventTypes, isValidWebhookUrl } from '../../utils';
import { NodeOperationError } from 'n8n-workflow';

export const webhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a webhook endpoint',
				action: 'Create a webhook endpoint',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a webhook endpoint',
				action: 'Delete a webhook endpoint',
			},
			{
				name: 'Disable',
				value: 'disable',
				description: 'Disable an endpoint',
				action: 'Disable a webhook endpoint',
			},
			{
				name: 'Enable',
				value: 'enable',
				description: 'Enable a disabled endpoint',
				action: 'Enable a webhook endpoint',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get webhook endpoint details',
				action: 'Get a webhook endpoint',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all webhook endpoints',
				action: 'List webhook endpoints',
			},
			{
				name: 'List Deliveries',
				value: 'listDeliveries',
				description: 'Get webhook delivery history',
				action: 'List webhook deliveries',
			},
			{
				name: 'Retry Delivery',
				value: 'retryDelivery',
				description: 'Retry a failed delivery',
				action: 'Retry webhook delivery',
			},
			{
				name: 'Test',
				value: 'test',
				description: 'Send test webhook payload',
				action: 'Test a webhook endpoint',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update webhook endpoint configuration',
				action: 'Update a webhook endpoint',
			},
		],
		default: 'list',
	},
];

export const webhookFields: INodeProperties[] = [
	// Endpoint ID for get, update, delete, enable, disable, test, listDeliveries
	{
		displayName: 'Endpoint ID',
		name: 'endpointId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['get', 'update', 'delete', 'enable', 'disable', 'test', 'listDeliveries'],
			},
		},
		description: 'The ID of the webhook endpoint',
	},
	// Delivery ID for retry
	{
		displayName: 'Endpoint ID',
		name: 'endpointIdForRetry',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['retryDelivery'],
			},
		},
		description: 'The ID of the webhook endpoint',
	},
	{
		displayName: 'Delivery ID',
		name: 'deliveryId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['retryDelivery'],
			},
		},
		description: 'The ID of the delivery to retry',
	},
	// Create fields
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		description: 'The HTTPS URL to receive webhook payloads',
	},
	{
		displayName: 'Event Types',
		name: 'eventTypes',
		type: 'multiOptions',
		required: true,
		options: [
			{ name: 'Note Created', value: 'note.created' },
			{ name: 'Note Updated', value: 'note.updated' },
			{ name: 'Note Deleted', value: 'note.deleted' },
			{ name: 'Recording Custom Event', value: 'recording.event.custom' },
			{ name: 'Recording Completed', value: 'recording.completed' },
			{ name: 'Segment Entered', value: 'segment.entered' },
			{ name: 'Segment Exited', value: 'segment.exited' },
			{ name: 'User Created', value: 'user.created' },
			{ name: 'User Updated', value: 'user.updated' },
			{ name: 'Error Captured', value: 'error.captured' },
		],
		default: [],
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		description: 'Events to subscribe to',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the endpoint is enabled',
			},
			{
				displayName: 'Secret',
				name: 'secret',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Webhook signing secret',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description for the endpoint',
			},
		],
	},
	// Update fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'New webhook URL',
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				options: [
					{ name: 'Note Created', value: 'note.created' },
					{ name: 'Note Updated', value: 'note.updated' },
					{ name: 'Note Deleted', value: 'note.deleted' },
					{ name: 'Recording Custom Event', value: 'recording.event.custom' },
					{ name: 'Recording Completed', value: 'recording.completed' },
					{ name: 'Segment Entered', value: 'segment.entered' },
					{ name: 'Segment Exited', value: 'segment.exited' },
					{ name: 'User Created', value: 'user.created' },
					{ name: 'User Updated', value: 'user.updated' },
					{ name: 'Error Captured', value: 'error.captured' },
				],
				default: [],
				description: 'Events to subscribe to',
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the endpoint is enabled',
			},
			{
				displayName: 'Secret',
				name: 'secret',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'New webhook signing secret',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'New description for the endpoint',
			},
		],
	},
	// Return all
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['list', 'listDeliveries'],
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
				resource: ['webhook'],
				operation: ['list', 'listDeliveries'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	// Delivery filters
	{
		displayName: 'Delivery Filters',
		name: 'deliveryFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['listDeliveries'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Success', value: 'success' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Pending', value: 'pending' },
				],
				default: '',
				description: 'Filter by delivery status',
			},
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'string',
				default: '',
				description: 'Filter by event type',
			},
		],
	},
];

export async function executeWebhookOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	if (operation === 'create') {
		const url = this.getNodeParameter('url', i) as string;
		const eventTypes = this.getNodeParameter('eventTypes', i) as string[];
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		// Validate URL
		if (!isValidWebhookUrl(url)) {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid webhook URL. Must be HTTPS.',
				{ itemIndex: i },
			);
		}

		const body: IDataObject = removeEmptyProperties({
			url,
			event_types: formatWebhookEventTypes(eventTypes),
			enabled: additionalFields.enabled,
			secret: additionalFields.secret,
			description: additionalFields.description,
		});

		const response = await fullStoryApiRequest.call(this, 'POST', '/webhooks/v1/endpoints', body);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'get') {
		const endpointId = this.getNodeParameter('endpointId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			`/webhooks/v1/endpoints/${encodeURIComponent(endpointId)}`,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'update') {
		const endpointId = this.getNodeParameter('endpointId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

		// Validate URL if provided
		if (updateFields.url && !isValidWebhookUrl(updateFields.url as string)) {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid webhook URL. Must be HTTPS.',
				{ itemIndex: i },
			);
		}

		const body: IDataObject = removeEmptyProperties({
			url: updateFields.url,
			event_types: updateFields.eventTypes ? formatWebhookEventTypes(updateFields.eventTypes as string[]) : undefined,
			enabled: updateFields.enabled,
			secret: updateFields.secret,
			description: updateFields.description,
		});

		const response = await fullStoryApiRequest.call(
			this,
			'PATCH',
			`/webhooks/v1/endpoints/${encodeURIComponent(endpointId)}`,
			body,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'delete') {
		const endpointId = this.getNodeParameter('endpointId', i) as string;

		await fullStoryApiRequest.call(
			this,
			'DELETE',
			`/webhooks/v1/endpoints/${encodeURIComponent(endpointId)}`,
		);
		returnData.push({ json: { success: true, endpointId } });
	}

	if (operation === 'list') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/webhooks/v1/endpoints',
				undefined,
				{},
				'endpoints',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;

			const response = await fullStoryApiRequest.call(
				this,
				'GET',
				'/webhooks/v1/endpoints',
				undefined,
				{ limit },
			);
			const endpoints = (response as IDataObject).endpoints as IDataObject[] || [];
			returnData.push(...endpoints.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'enable') {
		const endpointId = this.getNodeParameter('endpointId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'POST',
			`/webhooks/v1/endpoints/${encodeURIComponent(endpointId)}/enable`,
		);
		returnData.push({ json: response as IDataObject || { success: true, endpointId, enabled: true } });
	}

	if (operation === 'disable') {
		const endpointId = this.getNodeParameter('endpointId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'POST',
			`/webhooks/v1/endpoints/${encodeURIComponent(endpointId)}/disable`,
		);
		returnData.push({ json: response as IDataObject || { success: true, endpointId, enabled: false } });
	}

	if (operation === 'test') {
		const endpointId = this.getNodeParameter('endpointId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'POST',
			`/webhooks/v1/endpoints/${encodeURIComponent(endpointId)}/test`,
		);
		returnData.push({ json: response as IDataObject || { success: true, endpointId } });
	}

	if (operation === 'listDeliveries') {
		const endpointId = this.getNodeParameter('endpointId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const deliveryFilters = this.getNodeParameter('deliveryFilters', i, {}) as IDataObject;

		const query: IDataObject = removeEmptyProperties({
			status: deliveryFilters.status,
			event_type: deliveryFilters.eventType,
		});

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				`/webhooks/v1/endpoints/${encodeURIComponent(endpointId)}/deliveries`,
				undefined,
				query,
				'deliveries',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(
				this,
				'GET',
				`/webhooks/v1/endpoints/${encodeURIComponent(endpointId)}/deliveries`,
				undefined,
				query,
			);
			const deliveries = (response as IDataObject).deliveries as IDataObject[] || [];
			returnData.push(...deliveries.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'retryDelivery') {
		const endpointId = this.getNodeParameter('endpointIdForRetry', i) as string;
		const deliveryId = this.getNodeParameter('deliveryId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'POST',
			`/webhooks/v1/endpoints/${encodeURIComponent(endpointId)}/deliveries/${encodeURIComponent(deliveryId)}/retry`,
		);
		returnData.push({ json: response as IDataObject || { success: true, endpointId, deliveryId } });
	}

	return returnData;
}
