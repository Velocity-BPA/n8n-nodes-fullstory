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
import { removeEmptyProperties, parseJsonParameter } from '../../utils';

export const integrationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['integration'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Set up a new integration',
				action: 'Create an integration',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Remove an integration',
				action: 'Delete an integration',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get integration details',
				action: 'Get an integration',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List configured integrations',
				action: 'List integrations',
			},
			{
				name: 'Test',
				value: 'test',
				description: 'Test integration connection',
				action: 'Test an integration',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update integration config',
				action: 'Update an integration',
			},
		],
		default: 'list',
	},
];

export const integrationFields: INodeProperties[] = [
	// Integration ID for get, update, delete, test
	{
		displayName: 'Integration ID',
		name: 'integrationId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['integration'],
				operation: ['get', 'update', 'delete', 'test'],
			},
		},
		description: 'The ID of the integration',
	},
	// Integration type for create
	{
		displayName: 'Integration Type',
		name: 'integrationType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Amplitude', value: 'amplitude' },
			{ name: 'BigQuery', value: 'bigquery' },
			{ name: 'Datadog', value: 'datadog' },
			{ name: 'Google Analytics', value: 'google_analytics' },
			{ name: 'Heap', value: 'heap' },
			{ name: 'Intercom', value: 'intercom' },
			{ name: 'Jira', value: 'jira' },
			{ name: 'Mixpanel', value: 'mixpanel' },
			{ name: 'PagerDuty', value: 'pagerduty' },
			{ name: 'Salesforce', value: 'salesforce' },
			{ name: 'Segment', value: 'segment' },
			{ name: 'Slack', value: 'slack' },
			{ name: 'Snowflake', value: 'snowflake' },
			{ name: 'Zendesk', value: 'zendesk' },
			{ name: 'Other', value: 'other' },
		],
		default: 'slack',
		displayOptions: {
			show: {
				resource: ['integration'],
				operation: ['create'],
			},
		},
		description: 'The type of integration to create',
	},
	// Name for create
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['integration'],
				operation: ['create'],
			},
		},
		description: 'Display name for the integration',
	},
	// Config for create
	{
		displayName: 'Configuration (JSON)',
		name: 'config',
		type: 'json',
		required: true,
		default: '{}',
		displayOptions: {
			show: {
				resource: ['integration'],
				operation: ['create'],
			},
		},
		description: 'Integration configuration as JSON object. Structure depends on integration type.',
	},
	// Return all
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['integration'],
				operation: ['list'],
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
				resource: ['integration'],
				operation: ['list'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	// Filters for list
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['integration'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'Filter by integration type',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Active', value: 'active' },
					{ name: 'Inactive', value: 'inactive' },
					{ name: 'Error', value: 'error' },
				],
				default: '',
				description: 'Filter by integration status',
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
				resource: ['integration'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the integration',
			},
			{
				displayName: 'Configuration (JSON)',
				name: 'config',
				type: 'json',
				default: '{}',
				description: 'Updated configuration as JSON object',
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the integration is enabled',
			},
		],
	},
];

export async function executeIntegrationOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	if (operation === 'create') {
		const integrationType = this.getNodeParameter('integrationType', i) as string;
		const name = this.getNodeParameter('name', i) as string;
		const config = this.getNodeParameter('config', i) as string;

		const body: IDataObject = {
			type: integrationType,
			name,
			config: parseJsonParameter(config),
		};

		const response = await fullStoryApiRequest.call(this, 'POST', '/integrations/v1', body);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'get') {
		const integrationId = this.getNodeParameter('integrationId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			`/integrations/v1/${encodeURIComponent(integrationId)}`,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'update') {
		const integrationId = this.getNodeParameter('integrationId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

		const body: IDataObject = removeEmptyProperties({
			name: updateFields.name,
			enabled: updateFields.enabled,
			config: updateFields.config ? parseJsonParameter(updateFields.config as string) : undefined,
		});

		const response = await fullStoryApiRequest.call(
			this,
			'PATCH',
			`/integrations/v1/${encodeURIComponent(integrationId)}`,
			body,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'delete') {
		const integrationId = this.getNodeParameter('integrationId', i) as string;

		await fullStoryApiRequest.call(
			this,
			'DELETE',
			`/integrations/v1/${encodeURIComponent(integrationId)}`,
		);
		returnData.push({ json: { success: true, integrationId } });
	}

	if (operation === 'list') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

		const query: IDataObject = removeEmptyProperties({
			type: filters.type,
			status: filters.status,
		});

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/integrations/v1',
				undefined,
				query,
				'integrations',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(this, 'GET', '/integrations/v1', undefined, query);
			const integrations = (response as IDataObject).integrations as IDataObject[] || [];
			returnData.push(...integrations.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'test') {
		const integrationId = this.getNodeParameter('integrationId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'POST',
			`/integrations/v1/${encodeURIComponent(integrationId)}/test`,
		);
		returnData.push({ json: response as IDataObject || { success: true } });
	}

	return returnData;
}
