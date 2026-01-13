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
import { removeEmptyProperties, buildTimeRange } from '../../utils';

export const errorOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['error'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get error details',
				action: 'Get an error',
			},
			{
				name: 'Get Sessions',
				value: 'getSessions',
				description: 'Get sessions with a specific error',
				action: 'Get error sessions',
			},
			{
				name: 'Group',
				value: 'group',
				description: 'Get error groupings',
				action: 'Group errors',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List captured errors',
				action: 'List errors',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search errors by message or stack',
				action: 'Search errors',
			},
		],
		default: 'list',
	},
];

export const errorFields: INodeProperties[] = [
	// Error ID for get, getSessions
	{
		displayName: 'Error ID',
		name: 'errorId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['error'],
				operation: ['get', 'getSessions'],
			},
		},
		description: 'The ID of the error',
	},
	// Return all
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['error'],
				operation: ['list', 'search', 'getSessions', 'group'],
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
				resource: ['error'],
				operation: ['list', 'search', 'getSessions', 'group'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	// Search query
	{
		displayName: 'Search Query',
		name: 'query',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['error'],
				operation: ['search'],
			},
		},
		description: 'Search term to find in error message or stack trace',
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
				resource: ['error'],
				operation: ['list', 'group'],
			},
		},
		options: [
			{
				displayName: 'Error Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'JavaScript Error', value: 'js_error' },
					{ name: 'Network Error', value: 'network_error' },
					{ name: 'Console Error', value: 'console_error' },
					{ name: 'Custom Error', value: 'custom_error' },
				],
				default: '',
				description: 'Filter by error type',
			},
			{
				displayName: 'Start Time',
				name: 'startTime',
				type: 'dateTime',
				default: '',
				description: 'Filter errors after this time',
			},
			{
				displayName: 'End Time',
				name: 'endTime',
				type: 'dateTime',
				default: '',
				description: 'Filter errors before this time',
			},
			{
				displayName: 'URL Pattern',
				name: 'urlPattern',
				type: 'string',
				default: '',
				description: 'Filter errors by URL pattern',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'Filter errors by user',
			},
		],
	},
	// Group by field
	{
		displayName: 'Group By',
		name: 'groupBy',
		type: 'options',
		options: [
			{ name: 'Message', value: 'message' },
			{ name: 'Type', value: 'type' },
			{ name: 'URL', value: 'url' },
			{ name: 'Stack', value: 'stack' },
		],
		default: 'message',
		displayOptions: {
			show: {
				resource: ['error'],
				operation: ['group'],
			},
		},
		description: 'Field to group errors by',
	},
];

export async function executeErrorOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	if (operation === 'get') {
		const errorId = this.getNodeParameter('errorId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			`/errors/v1/${encodeURIComponent(errorId)}`,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'list') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

		const query: IDataObject = removeEmptyProperties({
			type: filters.type,
			url_pattern: filters.urlPattern,
			user_id: filters.userId,
		});

		// Add time range if specified
		if (filters.startTime || filters.endTime) {
			const timeRange = buildTimeRange(
				filters.startTime as string,
				filters.endTime as string,
			);
			if (timeRange) {
				query.start = timeRange.start;
				query.end = timeRange.end;
			}
		}

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/errors/v1',
				undefined,
				query,
				'errors',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(this, 'GET', '/errors/v1', undefined, query);
			const errors = (response as IDataObject).errors as IDataObject[] || [];
			returnData.push(...errors.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'getSessions') {
		const errorId = this.getNodeParameter('errorId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				`/errors/v1/${encodeURIComponent(errorId)}/sessions`,
				undefined,
				{},
				'sessions',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;

			const response = await fullStoryApiRequest.call(
				this,
				'GET',
				`/errors/v1/${encodeURIComponent(errorId)}/sessions`,
				undefined,
				{ limit },
			);
			const sessions = (response as IDataObject).sessions as IDataObject[] || [];
			returnData.push(...sessions.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'group') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const groupBy = this.getNodeParameter('groupBy', i) as string;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

		const query: IDataObject = removeEmptyProperties({
			group_by: groupBy,
			type: filters.type,
			url_pattern: filters.urlPattern,
			user_id: filters.userId,
		});

		// Add time range if specified
		if (filters.startTime || filters.endTime) {
			const timeRange = buildTimeRange(
				filters.startTime as string,
				filters.endTime as string,
			);
			if (timeRange) {
				query.start = timeRange.start;
				query.end = timeRange.end;
			}
		}

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/errors/v1/groups',
				undefined,
				query,
				'groups',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(this, 'GET', '/errors/v1/groups', undefined, query);
			const groups = (response as IDataObject).groups as IDataObject[] || [];
			returnData.push(...groups.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'search') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const searchQuery = this.getNodeParameter('query', i) as string;

		const query: IDataObject = { q: searchQuery };

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/errors/v1/search',
				undefined,
				query,
				'errors',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(this, 'GET', '/errors/v1/search', undefined, query);
			const errors = (response as IDataObject).errors as IDataObject[] || [];
			returnData.push(...errors.map((item: IDataObject) => ({ json: item })));
		}
	}

	return returnData;
}
