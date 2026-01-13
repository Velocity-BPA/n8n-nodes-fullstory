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

export const segmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['segment'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new segment',
				action: 'Create a segment',
			},
			{
				name: 'Create Export',
				value: 'createExport',
				description: 'Create an export job for segment data',
				action: 'Create segment export',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a segment',
				action: 'Delete a segment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get segment details',
				action: 'Get a segment',
			},
			{
				name: 'Get Sessions',
				value: 'getSessions',
				description: 'Get sessions matching segment',
				action: 'Get segment sessions',
			},
			{
				name: 'Get Users',
				value: 'getUsers',
				description: 'Get users in segment',
				action: 'Get segment users',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all segments',
				action: 'List segments',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update segment definition',
				action: 'Update a segment',
			},
		],
		default: 'list',
	},
];

export const segmentFields: INodeProperties[] = [
	// Segment ID for get, update, delete, getUsers, getSessions, createExport
	{
		displayName: 'Segment ID',
		name: 'segmentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['get', 'update', 'delete', 'getUsers', 'getSessions', 'createExport'],
			},
		},
		description: 'The ID of the segment',
	},
	// Create segment fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['create'],
			},
		},
		description: 'Name for the segment',
	},
	{
		displayName: 'Filter (JSON)',
		name: 'filter',
		type: 'json',
		required: true,
		default: '{}',
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['create'],
			},
		},
		description: 'Segment filter definition as JSON object',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the segment',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'User', value: 'user' },
					{ name: 'Session', value: 'session' },
				],
				default: 'user',
				description: 'Segment type',
			},
		],
	},
	// Update segment fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the segment',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'New description for the segment',
			},
			{
				displayName: 'Filter (JSON)',
				name: 'filter',
				type: 'json',
				default: '{}',
				description: 'Updated segment filter definition as JSON object',
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
				resource: ['segment'],
				operation: ['list', 'getUsers', 'getSessions'],
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
				resource: ['segment'],
				operation: ['list', 'getUsers', 'getSessions'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	// Export options
	{
		displayName: 'Export Format',
		name: 'format',
		type: 'options',
		required: true,
		options: [
			{ name: 'CSV', value: 'FORMAT_CSV' },
			{ name: 'JSON', value: 'FORMAT_JSON' },
			{ name: 'NDJSON', value: 'FORMAT_NDJSON' },
		],
		default: 'FORMAT_CSV',
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['createExport'],
			},
		},
		description: 'Format for the exported data',
	},
	{
		displayName: 'Export Type',
		name: 'exportType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Event', value: 'TYPE_EVENT' },
			{ name: 'User', value: 'TYPE_USER' },
		],
		default: 'TYPE_EVENT',
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['createExport'],
			},
		},
		description: 'Type of data to export',
	},
	{
		displayName: 'Time Range',
		name: 'timeRange',
		type: 'fixedCollection',
		placeholder: 'Add Time Range',
		default: {},
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['createExport'],
			},
		},
		options: [
			{
				name: 'range',
				displayName: 'Range',
				values: [
					{
						displayName: 'Start Time',
						name: 'start',
						type: 'dateTime',
						default: '',
						description: 'Start of export time range (ISO 8601)',
					},
					{
						displayName: 'End Time',
						name: 'end',
						type: 'dateTime',
						default: '',
						description: 'End of export time range (ISO 8601)',
					},
				],
			},
		],
	},
];

export async function executeSegmentOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	if (operation === 'list') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/segments/v1',
				undefined,
				{},
				'segments',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;

			const response = await fullStoryApiRequest.call(this, 'GET', '/segments/v1', undefined, { limit });
			const segments = (response as IDataObject).segments as IDataObject[] || [];
			returnData.push(...segments.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'get') {
		const segmentId = this.getNodeParameter('segmentId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			`/segments/v1/${encodeURIComponent(segmentId)}`,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'create') {
		const name = this.getNodeParameter('name', i) as string;
		const filter = this.getNodeParameter('filter', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const body: IDataObject = removeEmptyProperties({
			name,
			filter: parseJsonParameter(filter),
			description: additionalFields.description,
			type: additionalFields.type,
		});

		const response = await fullStoryApiRequest.call(this, 'POST', '/segments/v1', body);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'update') {
		const segmentId = this.getNodeParameter('segmentId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

		const body: IDataObject = removeEmptyProperties({
			name: updateFields.name,
			description: updateFields.description,
			filter: updateFields.filter ? parseJsonParameter(updateFields.filter as string) : undefined,
		});

		const response = await fullStoryApiRequest.call(
			this,
			'PATCH',
			`/segments/v1/${encodeURIComponent(segmentId)}`,
			body,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'delete') {
		const segmentId = this.getNodeParameter('segmentId', i) as string;

		await fullStoryApiRequest.call(
			this,
			'DELETE',
			`/segments/v1/${encodeURIComponent(segmentId)}`,
		);
		returnData.push({ json: { success: true, segmentId } });
	}

	if (operation === 'getUsers') {
		const segmentId = this.getNodeParameter('segmentId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				`/segments/v1/${encodeURIComponent(segmentId)}/users`,
				undefined,
				{},
				'users',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;

			const response = await fullStoryApiRequest.call(
				this,
				'GET',
				`/segments/v1/${encodeURIComponent(segmentId)}/users`,
				undefined,
				{ limit },
			);
			const users = (response as IDataObject).users as IDataObject[] || [];
			returnData.push(...users.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'getSessions') {
		const segmentId = this.getNodeParameter('segmentId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				`/segments/v1/${encodeURIComponent(segmentId)}/sessions`,
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
				`/segments/v1/${encodeURIComponent(segmentId)}/sessions`,
				undefined,
				{ limit },
			);
			const sessions = (response as IDataObject).sessions as IDataObject[] || [];
			returnData.push(...sessions.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'createExport') {
		const segmentId = this.getNodeParameter('segmentId', i) as string;
		const format = this.getNodeParameter('format', i) as string;
		const exportType = this.getNodeParameter('exportType', i) as string;
		const timeRange = this.getNodeParameter('timeRange', i, {}) as IDataObject;

		const body: IDataObject = {
			segmentId,
			format,
			type: exportType,
		};

		// Add time range if specified
		if (timeRange.range) {
			const range = timeRange.range as IDataObject;
			body.timeRange = removeEmptyProperties({
				start: range.start,
				end: range.end,
			});
		}

		const response = await fullStoryApiRequest.call(
			this,
			'POST',
			'/segments/v1/exports',
			body,
		);

		returnData.push({ json: response as IDataObject });
	}

	return returnData;
}
