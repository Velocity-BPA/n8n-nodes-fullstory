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

import { fullStoryApiRequest, fullStoryApiRequestAllItems, waitForOperation } from '../../transport';
import { removeEmptyProperties, buildTimeRange } from '../../utils';

export const dataExportOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['dataExport'],
			},
		},
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a pending export',
				action: 'Cancel export',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a data export job',
				action: 'Create a data export job',
			},
			{
				name: 'Create Segment Export',
				value: 'createSegmentExport',
				description: 'Create segment-specific export job',
				action: 'Create segment export',
			},
			{
				name: 'Download',
				value: 'download',
				description: 'Wait for and get download URLs for an export',
				action: 'Download export',
			},
			{
				name: 'Get Schema',
				value: 'getSchema',
				description: 'Get export data schema',
				action: 'Get export schema',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Check export job status',
				action: 'Check export job status',
			},
			{
				name: 'List Operations',
				value: 'listOperations',
				description: 'List all export operations',
				action: 'List export operations',
			},
		],
		default: 'create',
	},
];

export const dataExportFields: INodeProperties[] = [
	// Create operation fields
	{
		displayName: 'Export Type',
		name: 'exportType',
		type: 'options',
		required: true,
		default: 'TYPE_EVENT',
		displayOptions: {
			show: {
				resource: ['dataExport'],
				operation: ['create', 'createSegmentExport'],
			},
		},
		options: [
			{
				name: 'Event',
				value: 'TYPE_EVENT',
				description: 'Export event data',
			},
			{
				name: 'User',
				value: 'TYPE_USER',
				description: 'Export user data',
			},
		],
		description: 'The type of data to export',
	},
	{
		displayName: 'Start Time',
		name: 'startTime',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['dataExport'],
				operation: ['create', 'createSegmentExport'],
			},
		},
		description: 'Start of the time range for export',
	},
	{
		displayName: 'End Time',
		name: 'endTime',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['dataExport'],
				operation: ['create', 'createSegmentExport'],
			},
		},
		description: 'End of the time range for export',
	},
	// Segment ID for segment export
	{
		displayName: 'Segment ID',
		name: 'segmentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['dataExport'],
				operation: ['createSegmentExport'],
			},
		},
		description: 'The segment to export data from',
	},
	{
		displayName: 'Export Options',
		name: 'exportOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['dataExport'],
				operation: ['create', 'createSegmentExport'],
			},
		},
		options: [
			{
				displayName: 'Format',
				name: 'format',
				type: 'options',
				default: 'FORMAT_CSV',
				options: [
					{
						name: 'CSV',
						value: 'FORMAT_CSV',
					},
					{
						name: 'JSON',
						value: 'FORMAT_JSON',
					},
					{
						name: 'NDJSON',
						value: 'FORMAT_NDJSON',
					},
				],
				description: 'Export file format',
			},
		],
	},
	// Operation ID for getStatus, download, cancel
	{
		displayName: 'Operation ID',
		name: 'operationId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['dataExport'],
				operation: ['getStatus', 'download', 'cancel'],
			},
		},
		description: 'The operation/export job ID',
	},
	// Download options
	{
		displayName: 'Download Options',
		name: 'downloadOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['dataExport'],
				operation: ['download'],
			},
		},
		options: [
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				default: true,
				description: 'Whether to wait for the export to complete before returning',
			},
			{
				displayName: 'Max Wait Time (seconds)',
				name: 'maxWaitTime',
				type: 'number',
				default: 300,
				typeOptions: {
					minValue: 60,
					maxValue: 3600,
				},
				description: 'Maximum time to wait for export completion',
			},
			{
				displayName: 'Poll Interval (seconds)',
				name: 'pollInterval',
				type: 'number',
				default: 5,
				typeOptions: {
					minValue: 2,
					maxValue: 60,
				},
				description: 'How often to check export status',
			},
		],
	},
	// List operations options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['dataExport'],
				operation: ['listOperations'],
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
				resource: ['dataExport'],
				operation: ['listOperations'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['dataExport'],
				operation: ['listOperations'],
			},
		},
		options: [
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Pending', value: 'STATE_PENDING' },
					{ name: 'Running', value: 'STATE_RUNNING' },
					{ name: 'Completed', value: 'STATE_COMPLETED' },
					{ name: 'Failed', value: 'STATE_FAILED' },
					{ name: 'Cancelled', value: 'STATE_CANCELLED' },
				],
				default: '',
				description: 'Filter by operation state',
			},
		],
	},
	// Get schema options
	{
		displayName: 'Schema Type',
		name: 'schemaType',
		type: 'options',
		required: true,
		default: 'event',
		displayOptions: {
			show: {
				resource: ['dataExport'],
				operation: ['getSchema'],
			},
		},
		options: [
			{
				name: 'Event',
				value: 'event',
			},
			{
				name: 'User',
				value: 'user',
			},
		],
		description: 'Type of export schema to retrieve',
	},
];

export async function executeDataExportOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	if (operation === 'create') {
		const exportType = this.getNodeParameter('exportType', i) as string;
		const startTime = this.getNodeParameter('startTime', i) as string;
		const endTime = this.getNodeParameter('endTime', i) as string;
		const exportOptions = this.getNodeParameter('exportOptions', i, {}) as IDataObject;

		const body: IDataObject = removeEmptyProperties({
			type: exportType,
			time_range: buildTimeRange(startTime, endTime),
			format: exportOptions.format || 'FORMAT_CSV',
		});

		const response = await fullStoryApiRequest.call(
			this,
			'POST',
			'/segments/v1/exports',
			body,
		);

		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'createSegmentExport') {
		const segmentId = this.getNodeParameter('segmentId', i) as string;
		const exportType = this.getNodeParameter('exportType', i) as string;
		const startTime = this.getNodeParameter('startTime', i) as string;
		const endTime = this.getNodeParameter('endTime', i) as string;
		const exportOptions = this.getNodeParameter('exportOptions', i, {}) as IDataObject;

		const body: IDataObject = removeEmptyProperties({
			segment_id: segmentId,
			type: exportType,
			time_range: buildTimeRange(startTime, endTime),
			format: exportOptions.format || 'FORMAT_CSV',
		});

		const response = await fullStoryApiRequest.call(
			this,
			'POST',
			'/segments/v1/exports',
			body,
		);

		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'getStatus') {
		const operationId = this.getNodeParameter('operationId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			`/operations/v1/${encodeURIComponent(operationId)}`,
		);

		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'listOperations') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

		const query: IDataObject = removeEmptyProperties({
			state: filters.state,
		});

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/operations/v1',
				undefined,
				query,
				'operations',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(this, 'GET', '/operations/v1', undefined, query);
			const operations = (response as IDataObject).operations as IDataObject[] || [];
			returnData.push(...operations.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'cancel') {
		const operationId = this.getNodeParameter('operationId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'POST',
			`/operations/v1/${encodeURIComponent(operationId)}/cancel`,
		);

		returnData.push({ json: response as IDataObject || { success: true, operationId } });
	}

	if (operation === 'getSchema') {
		const schemaType = this.getNodeParameter('schemaType', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			`/exports/v1/schema/${encodeURIComponent(schemaType)}`,
		);

		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'download') {
		const operationId = this.getNodeParameter('operationId', i) as string;
		const downloadOptions = this.getNodeParameter('downloadOptions', i, {}) as IDataObject;

		const waitForCompletion = downloadOptions.waitForCompletion !== false;
		const maxWaitTime = (downloadOptions.maxWaitTime as number) || 300;
		const pollInterval = (downloadOptions.pollInterval as number) || 5;

		let status: IDataObject;

		if (waitForCompletion) {
			const maxAttempts = Math.ceil(maxWaitTime / pollInterval);
			status = await waitForOperation.call(
				this,
				operationId,
				maxAttempts,
				pollInterval * 1000,
			);
		} else {
			status = (await fullStoryApiRequest.call(
				this,
				'GET',
				`/operations/v1/${encodeURIComponent(operationId)}`,
			)) as IDataObject;
		}

		// Extract download URLs from results
		const results = status.results as IDataObject | undefined;
		const downloadUrls: string[] = [];

		if (results?.exports && Array.isArray(results.exports)) {
			for (const exportItem of results.exports as IDataObject[]) {
				if (exportItem.url) {
					downloadUrls.push(exportItem.url as string);
				}
			}
		}

		returnData.push({
			json: {
				operation_id: operationId,
				state: status.state,
				progress: status.progress,
				download_urls: downloadUrls,
				results: results,
			},
		});
	}

	return returnData;
}
