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
import { removeEmptyProperties } from '../../utils';

export const noteOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['note'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a note on a session or user',
				action: 'Create a note',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a note',
				action: 'Delete a note',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get note details',
				action: 'Get a note',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all notes',
				action: 'List notes',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search notes by content',
				action: 'Search notes',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update note content',
				action: 'Update a note',
			},
		],
		default: 'list',
	},
];

export const noteFields: INodeProperties[] = [
	// Note ID for get, update, delete
	{
		displayName: 'Note ID',
		name: 'noteId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The ID of the note',
	},
	// Create fields
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		description: 'The content of the note',
	},
	{
		displayName: 'Session ID',
		name: 'sessionId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		description: 'Associate note with a session',
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		description: 'Associate note with a user',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Author Email',
				name: 'author',
				type: 'string',
				default: '',
				description: 'Email of the note author',
			},
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'dateTime',
				default: '',
				description: 'Timestamp for the note within a session',
			},
		],
	},
	// Update fields
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['update'],
			},
		},
		description: 'The updated content of the note',
	},
	// List options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['list', 'search'],
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
				resource: ['note'],
				operation: ['list', 'search'],
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
				resource: ['note'],
				operation: ['search'],
			},
		},
		description: 'Search term to find in note content',
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
				resource: ['note'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Session ID',
				name: 'sessionId',
				type: 'string',
				default: '',
				description: 'Filter notes by session',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'Filter notes by user',
			},
			{
				displayName: 'Author',
				name: 'author',
				type: 'string',
				default: '',
				description: 'Filter notes by author email',
			},
		],
	},
];

export async function executeNoteOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	if (operation === 'create') {
		const body_content = this.getNodeParameter('body', i) as string;
		const sessionId = this.getNodeParameter('sessionId', i, '') as string;
		const userId = this.getNodeParameter('userId', i, '') as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const body: IDataObject = removeEmptyProperties({
			body: body_content,
			session_id: sessionId,
			user_id: userId,
			author: additionalFields.author,
			timestamp: additionalFields.timestamp,
		});

		const response = await fullStoryApiRequest.call(this, 'POST', '/notes/v1', body);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'get') {
		const noteId = this.getNodeParameter('noteId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			`/notes/v1/${encodeURIComponent(noteId)}`,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'update') {
		const noteId = this.getNodeParameter('noteId', i) as string;
		const body_content = this.getNodeParameter('body', i) as string;

		const body: IDataObject = { body: body_content };

		const response = await fullStoryApiRequest.call(
			this,
			'PUT',
			`/notes/v1/${encodeURIComponent(noteId)}`,
			body,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'delete') {
		const noteId = this.getNodeParameter('noteId', i) as string;

		await fullStoryApiRequest.call(
			this,
			'DELETE',
			`/notes/v1/${encodeURIComponent(noteId)}`,
		);
		returnData.push({ json: { success: true, noteId } });
	}

	if (operation === 'list') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

		const query: IDataObject = removeEmptyProperties({
			session_id: filters.sessionId,
			user_id: filters.userId,
			author: filters.author,
		});

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				'/notes/v1',
				undefined,
				query,
				'notes',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(this, 'GET', '/notes/v1', undefined, query);
			const notes = (response as IDataObject).notes as IDataObject[] || [];
			returnData.push(...notes.map((item: IDataObject) => ({ json: item })));
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
				'/notes/v1/search',
				undefined,
				query,
				'notes',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(this, 'GET', '/notes/v1/search', undefined, query);
			const notes = (response as IDataObject).notes as IDataObject[] || [];
			returnData.push(...notes.map((item: IDataObject) => ({ json: item })));
		}
	}

	return returnData;
}
