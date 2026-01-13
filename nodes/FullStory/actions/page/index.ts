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

export const pageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['page'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get page analytics',
				action: 'Get page analytics',
			},
			{
				name: 'Get Heatmap',
				value: 'getHeatmap',
				description: 'Get page heatmap data',
				action: 'Get page heatmap',
			},
			{
				name: 'Get Sessions',
				value: 'getSessions',
				description: 'Get sessions for a page',
				action: 'Get page sessions',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List tracked pages',
				action: 'List pages',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search pages by URL pattern',
				action: 'Search pages',
			},
		],
		default: 'list',
	},
];

export const pageFields: INodeProperties[] = [
	// Page ID for get operations
	{
		displayName: 'Page ID',
		name: 'pageId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['get', 'getHeatmap', 'getSessions'],
			},
		},
		description: 'The ID of the page',
	},
	// Return all
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['list', 'search', 'getSessions'],
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
				resource: ['page'],
				operation: ['list', 'search', 'getSessions'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	// Search query / URL pattern
	{
		displayName: 'URL Pattern',
		name: 'urlPattern',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['search'],
			},
		},
		description: 'URL pattern to search for (supports wildcards)',
	},
	// Time range for analytics
	{
		displayName: 'Time Range',
		name: 'timeRange',
		type: 'collection',
		placeholder: 'Add Time Range',
		default: {},
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['get', 'getHeatmap', 'list'],
			},
		},
		options: [
			{
				displayName: 'Start Time',
				name: 'startTime',
				type: 'dateTime',
				default: '',
				description: 'Start of analysis time range',
			},
			{
				displayName: 'End Time',
				name: 'endTime',
				type: 'dateTime',
				default: '',
				description: 'End of analysis time range',
			},
		],
	},
	// Heatmap options
	{
		displayName: 'Heatmap Options',
		name: 'heatmapOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['getHeatmap'],
			},
		},
		options: [
			{
				displayName: 'Heatmap Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'Click', value: 'click' },
					{ name: 'Move', value: 'move' },
					{ name: 'Scroll', value: 'scroll' },
					{ name: 'Attention', value: 'attention' },
				],
				default: 'click',
				description: 'Type of heatmap to generate',
			},
			{
				displayName: 'Device Type',
				name: 'deviceType',
				type: 'options',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Desktop', value: 'desktop' },
					{ name: 'Mobile', value: 'mobile' },
					{ name: 'Tablet', value: 'tablet' },
				],
				default: 'all',
				description: 'Filter by device type',
			},
		],
	},
	// List filters
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Page Views', value: 'page_views' },
					{ name: 'Unique Users', value: 'unique_users' },
					{ name: 'Avg Time on Page', value: 'avg_time' },
					{ name: 'Bounce Rate', value: 'bounce_rate' },
				],
				default: 'page_views',
				description: 'Field to sort results by',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
					{ name: 'Descending', value: 'desc' },
					{ name: 'Ascending', value: 'asc' },
				],
				default: 'desc',
				description: 'Sort order',
			},
		],
	},
];

export async function executePageOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	if (operation === 'get') {
		const pageId = this.getNodeParameter('pageId', i) as string;
		const timeRange = this.getNodeParameter('timeRange', i, {}) as IDataObject;

		const query: IDataObject = {};

		if (timeRange.startTime || timeRange.endTime) {
			const range = buildTimeRange(
				timeRange.startTime as string,
				timeRange.endTime as string,
			);
			if (range) {
				query.start = range.start;
				query.end = range.end;
			}
		}

		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			`/pages/v1/${encodeURIComponent(pageId)}`,
			undefined,
			query,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'list') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const timeRange = this.getNodeParameter('timeRange', i, {}) as IDataObject;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

		const query: IDataObject = removeEmptyProperties({
			sort_by: filters.sortBy,
			sort_order: filters.sortOrder,
		});

		if (timeRange.startTime || timeRange.endTime) {
			const range = buildTimeRange(
				timeRange.startTime as string,
				timeRange.endTime as string,
			);
			if (range) {
				query.start = range.start;
				query.end = range.end;
			}
		}

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/pages/v1',
				undefined,
				query,
				'pages',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(this, 'GET', '/pages/v1', undefined, query);
			const pages = (response as IDataObject).pages as IDataObject[] || [];
			returnData.push(...pages.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'getSessions') {
		const pageId = this.getNodeParameter('pageId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				`/pages/v1/${encodeURIComponent(pageId)}/sessions`,
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
				`/pages/v1/${encodeURIComponent(pageId)}/sessions`,
				undefined,
				{ limit },
			);
			const sessions = (response as IDataObject).sessions as IDataObject[] || [];
			returnData.push(...sessions.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'getHeatmap') {
		const pageId = this.getNodeParameter('pageId', i) as string;
		const timeRange = this.getNodeParameter('timeRange', i, {}) as IDataObject;
		const heatmapOptions = this.getNodeParameter('heatmapOptions', i, {}) as IDataObject;

		const query: IDataObject = removeEmptyProperties({
			type: heatmapOptions.type,
			device_type: heatmapOptions.deviceType,
		});

		if (timeRange.startTime || timeRange.endTime) {
			const range = buildTimeRange(
				timeRange.startTime as string,
				timeRange.endTime as string,
			);
			if (range) {
				query.start = range.start;
				query.end = range.end;
			}
		}

		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			`/pages/v1/${encodeURIComponent(pageId)}/heatmap`,
			undefined,
			query,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'search') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const urlPattern = this.getNodeParameter('urlPattern', i) as string;

		const query: IDataObject = { url_pattern: urlPattern };

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/pages/v1/search',
				undefined,
				query,
				'pages',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(this, 'GET', '/pages/v1/search', undefined, query);
			const pages = (response as IDataObject).pages as IDataObject[] || [];
			returnData.push(...pages.map((item: IDataObject) => ({ json: item })));
		}
	}

	return returnData;
}
