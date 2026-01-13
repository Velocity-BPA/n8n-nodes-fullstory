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
import { removeEmptyProperties, parseJsonParameter, chunkArray } from '../../utils';
import { FULLSTORY_BATCH_SIZE_LIMIT } from '../../constants';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Batch Create',
				value: 'batchCreate',
				description: 'Create or update multiple users',
				action: 'Batch create or update users',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create or update a user',
				action: 'Create or update a user',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a user and their data',
				action: 'Delete a user',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a user by FullStory ID or uid',
				action: 'Get a user',
			},
			{
				name: 'Get by UID',
				value: 'getByUid',
				description: 'Get user by your system\'s user ID',
				action: 'Get a user by UID',
			},
			{
				name: 'Get Sessions',
				value: 'getSessions',
				description: 'Get all sessions for a user',
				action: 'Get user sessions',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all users with pagination',
				action: 'List users',
			},
			{
				name: 'Merge',
				value: 'merge',
				description: 'Merge two user profiles',
				action: 'Merge users',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search users by properties',
				action: 'Search users',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update user display name, email, or properties',
				action: 'Update a user',
			},
		],
		default: 'create',
	},
];

export const userFields: INodeProperties[] = [
	// User ID for create, get, delete, update, getSessions
	{
		displayName: 'User ID',
		name: 'uid',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create', 'get', 'getByUid', 'delete', 'update', 'getSessions'],
			},
		},
		description: 'Your system\'s unique identifier for this user',
	},
	// Display name for create
	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
		description: 'The display name for this user',
	},
	// Email for create
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
		description: 'The email address for this user',
	},
	// Additional fields for create
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Properties (JSON)',
				name: 'properties',
				type: 'json',
				default: '{}',
				description: 'Custom user properties as JSON object',
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
				resource: ['user'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				description: 'New display name for this user',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'New email address for this user',
			},
			{
				displayName: 'Properties (JSON)',
				name: 'properties',
				type: 'json',
				default: '{}',
				description: 'Custom user properties to update as JSON object',
			},
		],
	},
	// Batch create fields
	{
		displayName: 'Users',
		name: 'users',
		type: 'json',
		required: true,
		default: '[]',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['batchCreate'],
			},
		},
		description: 'Array of user objects to create/update. Each object should have uid, and optionally display_name, email, and properties.',
	},
	// Return all for list and search
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['user'],
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
				resource: ['user'],
				operation: ['list', 'search', 'getSessions'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	// Search query
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['search'],
			},
		},
		description: 'Search query string for user properties',
	},
	// Search filters
	{
		displayName: 'Search Options',
		name: 'searchOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['search'],
			},
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Filter by email address',
			},
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				description: 'Filter by display name',
			},
		],
	},
	// Merge fields
	{
		displayName: 'Source User ID',
		name: 'sourceUid',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['merge'],
			},
		},
		description: 'User ID of the source user (will be merged into target)',
	},
	{
		displayName: 'Target User ID',
		name: 'targetUid',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['merge'],
			},
		},
		description: 'User ID of the target user (will receive merged data)',
	},
];

export async function executeUserOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	if (operation === 'create') {
		const uid = this.getNodeParameter('uid', i) as string;
		const displayName = this.getNodeParameter('displayName', i, '') as string;
		const email = this.getNodeParameter('email', i, '') as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const body: IDataObject = removeEmptyProperties({
			uid,
			display_name: displayName,
			email,
			properties: parseJsonParameter(additionalFields.properties),
		});

		const response = await fullStoryApiRequest.call(this, 'POST', '/v2/users', body);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'get') {
		const uid = this.getNodeParameter('uid', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			`/v2/users/${encodeURIComponent(uid)}`,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'getByUid') {
		const uid = this.getNodeParameter('uid', i) as string;

		// Use query parameter to get by uid
		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			'/v2/users',
			undefined,
			{ uid },
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'update') {
		const uid = this.getNodeParameter('uid', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

		const body: IDataObject = removeEmptyProperties({
			display_name: updateFields.displayName,
			email: updateFields.email,
			properties: parseJsonParameter(updateFields.properties),
		});

		const response = await fullStoryApiRequest.call(
			this,
			'PATCH',
			`/v2/users/${encodeURIComponent(uid)}`,
			body,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'batchCreate') {
		const usersJson = this.getNodeParameter('users', i) as string;
		let users: IDataObject[];

		try {
			users = JSON.parse(usersJson) as IDataObject[];
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid JSON format for users array',
				{ itemIndex: i },
			);
		}

		if (!Array.isArray(users)) {
			throw new NodeOperationError(
				this.getNode(),
				'Users must be an array',
				{ itemIndex: i },
			);
		}

		// Process in batches
		const batches = chunkArray(users, FULLSTORY_BATCH_SIZE_LIMIT);
		const responses: IDataObject[] = [];

		for (const batch of batches) {
			const body: IDataObject = {
				requests: batch.map((user: IDataObject) => removeEmptyProperties({
					uid: user.uid,
					display_name: user.display_name || user.displayName,
					email: user.email,
					properties: user.properties,
				})),
			};

			const response = await fullStoryApiRequest.call(this, 'POST', '/v2/users', body);
			if (response) {
				responses.push(response as IDataObject);
			}
		}

		returnData.push({ json: { responses } });
	}

	if (operation === 'delete') {
		const uid = this.getNodeParameter('uid', i) as string;

		await fullStoryApiRequest.call(
			this,
			'DELETE',
			`/v2/users/${encodeURIComponent(uid)}`,
		);

		returnData.push({ json: { success: true, uid } });
	}

	if (operation === 'list') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/v2/users',
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
				'/v2/users',
				undefined,
				{ limit },
			);
			const users = (response as IDataObject).users as IDataObject[] || [];
			returnData.push(...users.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'search') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const searchQuery = this.getNodeParameter('searchQuery', i) as string;
		const searchOptions = this.getNodeParameter('searchOptions', i, {}) as IDataObject;

		const query: IDataObject = removeEmptyProperties({
			q: searchQuery,
			email: searchOptions.email,
			display_name: searchOptions.displayName,
		});

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/v2/users/search',
				undefined,
				query,
				'users',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(
				this,
				'GET',
				'/v2/users/search',
				undefined,
				query,
			);
			const users = (response as IDataObject).users as IDataObject[] || [];
			returnData.push(...users.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'getSessions') {
		const uid = this.getNodeParameter('uid', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				`/v2/users/${encodeURIComponent(uid)}/sessions`,
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
				`/v2/users/${encodeURIComponent(uid)}/sessions`,
				undefined,
				{ limit },
			);
			const sessions = (response as IDataObject).sessions as IDataObject[] || [];
			returnData.push(...sessions.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'merge') {
		const sourceUid = this.getNodeParameter('sourceUid', i) as string;
		const targetUid = this.getNodeParameter('targetUid', i) as string;

		const body: IDataObject = {
			source_uid: sourceUid,
			target_uid: targetUid,
		};

		const response = await fullStoryApiRequest.call(this, 'POST', '/v2/users/merge', body);
		returnData.push({ json: response as IDataObject || { success: true, sourceUid, targetUid } });
	}

	return returnData;
}
