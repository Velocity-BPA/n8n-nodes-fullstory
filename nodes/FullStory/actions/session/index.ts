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
import { removeEmptyProperties, generateSessionReplayUrl, buildTimeRange } from '../../utils';

export const sessionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['session'],
			},
		},
		options: [
			{
				name: 'Add Note',
				value: 'addNote',
				description: 'Add a note to a session',
				action: 'Add session note',
			},
			{
				name: 'Delete Note',
				value: 'deleteNote',
				description: 'Remove a note from a session',
				action: 'Delete session note',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get session details by ID',
				action: 'Get a session',
			},
			{
				name: 'Get Events',
				value: 'getEvents',
				description: 'Get events within a session',
				action: 'Get session events',
			},
			{
				name: 'Get Notes',
				value: 'getNotes',
				description: 'Get notes on a session',
				action: 'Get session notes',
			},
			{
				name: 'Get Replay URL',
				value: 'getUrl',
				description: 'Generate session replay URL',
				action: 'Get session replay URL',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List sessions with filters',
				action: 'List sessions',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search sessions by criteria',
				action: 'Search sessions',
			},
		],
		default: 'list',
	},
];

export const sessionFields: INodeProperties[] = [
	// Session ID for get, getUrl, getEvents, getNotes, addNote
	{
		displayName: 'Session ID',
		name: 'sessionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['get', 'getUrl', 'getEvents', 'getNotes', 'addNote'],
			},
		},
		description: 'The ID of the session',
	},
	// Note ID for deleteNote
	{
		displayName: 'Session ID',
		name: 'sessionIdForNote',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['deleteNote'],
			},
		},
		description: 'The ID of the session',
	},
	{
		displayName: 'Note ID',
		name: 'noteId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['deleteNote'],
			},
		},
		description: 'The ID of the note to delete',
	},
	// Add note fields
	{
		displayName: 'Note Body',
		name: 'noteBody',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['addNote'],
			},
		},
		description: 'Content of the note',
	},
	{
		displayName: 'Note Options',
		name: 'noteOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['addNote'],
			},
		},
		options: [
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'dateTime',
				default: '',
				description: 'Timestamp within the session for this note',
			},
			{
				displayName: 'Author Email',
				name: 'author',
				type: 'string',
				default: '',
				description: 'Email of the note author',
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
				resource: ['session'],
				operation: ['list', 'search', 'getEvents', 'getNotes'],
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
				resource: ['session'],
				operation: ['list', 'search', 'getEvents', 'getNotes'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
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
				resource: ['session'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'Filter by user ID',
			},
			{
				displayName: 'Start Time',
				name: 'startTime',
				type: 'dateTime',
				default: '',
				description: 'Filter sessions after this time',
			},
			{
				displayName: 'End Time',
				name: 'endTime',
				type: 'dateTime',
				default: '',
				description: 'Filter sessions before this time',
			},
			{
				displayName: 'Minimum Duration (seconds)',
				name: 'minDuration',
				type: 'number',
				default: 0,
				description: 'Minimum session duration in seconds',
			},
			{
				displayName: 'Has Errors',
				name: 'hasErrors',
				type: 'boolean',
				default: false,
				description: 'Whether to filter for sessions with errors',
			},
		],
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
				resource: ['session'],
				operation: ['search'],
			},
		},
		description: 'Search criteria for sessions',
	},
	{
		displayName: 'Search Options',
		name: 'searchOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['search'],
			},
		},
		options: [
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'Filter by user',
			},
			{
				displayName: 'Start Time',
				name: 'startTime',
				type: 'dateTime',
				default: '',
				description: 'Filter sessions after this time',
			},
			{
				displayName: 'End Time',
				name: 'endTime',
				type: 'dateTime',
				default: '',
				description: 'Filter sessions before this time',
			},
		],
	},
	// Get URL options
	{
		displayName: 'URL Options',
		name: 'urlOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['getUrl'],
			},
		},
		options: [
			{
				displayName: 'Data Center',
				name: 'dataCenter',
				type: 'options',
				options: [
					{ name: 'NA1 (US)', value: 'na1' },
					{ name: 'EU1 (Europe)', value: 'eu1' },
				],
				default: 'na1',
				description: 'FullStory data center',
			},
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'number',
				default: 0,
				description: 'Jump to specific timestamp in milliseconds',
			},
		],
	},
	// Get events filters
	{
		displayName: 'Event Filters',
		name: 'eventFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['getEvents'],
			},
		},
		options: [
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'string',
				default: '',
				description: 'Filter by event type',
			},
			{
				displayName: 'Event Name',
				name: 'eventName',
				type: 'string',
				default: '',
				description: 'Filter by event name',
			},
		],
	},
];

export async function executeSessionOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	if (operation === 'get') {
		const sessionId = this.getNodeParameter('sessionId', i) as string;

		const response = await fullStoryApiRequest.call(
			this,
			'GET',
			`/v2/sessions/${encodeURIComponent(sessionId)}`,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'list') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

		const query: IDataObject = removeEmptyProperties({
			user_id: filters.userId,
			min_duration: filters.minDuration,
			has_errors: filters.hasErrors,
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
				'/v2/sessions',
				undefined,
				query,
				'sessions',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(this, 'GET', '/v2/sessions', undefined, query);
			const sessions = (response as IDataObject).sessions as IDataObject[] || [];
			returnData.push(...sessions.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'getUrl') {
		const sessionId = this.getNodeParameter('sessionId', i) as string;
		const urlOptions = this.getNodeParameter('urlOptions', i, {}) as IDataObject;

		const url = generateSessionReplayUrl(
			sessionId,
			(urlOptions.dataCenter as string) || 'na1',
			urlOptions.timestamp as number,
		);

		returnData.push({ json: { sessionId, url } });
	}

	if (operation === 'search') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const searchQuery = this.getNodeParameter('searchQuery', i) as string;
		const searchOptions = this.getNodeParameter('searchOptions', i, {}) as IDataObject;

		const query: IDataObject = removeEmptyProperties({
			q: searchQuery,
			user_id: searchOptions.userId,
		});

		// Add time range if specified
		if (searchOptions.startTime || searchOptions.endTime) {
			const timeRange = buildTimeRange(
				searchOptions.startTime as string,
				searchOptions.endTime as string,
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
				'/v2/sessions/search',
				undefined,
				query,
				'sessions',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(this, 'GET', '/v2/sessions/search', undefined, query);
			const sessions = (response as IDataObject).sessions as IDataObject[] || [];
			returnData.push(...sessions.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'getEvents') {
		const sessionId = this.getNodeParameter('sessionId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const eventFilters = this.getNodeParameter('eventFilters', i, {}) as IDataObject;

		const query: IDataObject = removeEmptyProperties({
			type: eventFilters.eventType,
			name: eventFilters.eventName,
		});

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				`/v2/sessions/${encodeURIComponent(sessionId)}/events`,
				undefined,
				query,
				'events',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;

			const response = await fullStoryApiRequest.call(
				this,
				'GET',
				`/v2/sessions/${encodeURIComponent(sessionId)}/events`,
				undefined,
				query,
			);
			const events = (response as IDataObject).events as IDataObject[] || [];
			returnData.push(...events.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'getNotes') {
		const sessionId = this.getNodeParameter('sessionId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		if (returnAll) {
			const results = await fullStoryApiRequestAllItems.call(
				this,
				'GET',
				`/sessions/v1/${encodeURIComponent(sessionId)}/notes`,
				undefined,
				{},
				'notes',
			);
			returnData.push(...results.map((item: IDataObject) => ({ json: item })));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;

			const response = await fullStoryApiRequest.call(
				this,
				'GET',
				`/sessions/v1/${encodeURIComponent(sessionId)}/notes`,
				undefined,
				{ limit },
			);
			const notes = (response as IDataObject).notes as IDataObject[] || [];
			returnData.push(...notes.map((item: IDataObject) => ({ json: item })));
		}
	}

	if (operation === 'addNote') {
		const sessionId = this.getNodeParameter('sessionId', i) as string;
		const noteBody = this.getNodeParameter('noteBody', i) as string;
		const noteOptions = this.getNodeParameter('noteOptions', i, {}) as IDataObject;

		const body: IDataObject = removeEmptyProperties({
			body: noteBody,
			timestamp: noteOptions.timestamp,
			author: noteOptions.author,
		});

		const response = await fullStoryApiRequest.call(
			this,
			'POST',
			`/sessions/v1/${encodeURIComponent(sessionId)}/notes`,
			body,
		);
		returnData.push({ json: response as IDataObject });
	}

	if (operation === 'deleteNote') {
		const sessionId = this.getNodeParameter('sessionIdForNote', i) as string;
		const noteId = this.getNodeParameter('noteId', i) as string;

		await fullStoryApiRequest.call(
			this,
			'DELETE',
			`/sessions/v1/${encodeURIComponent(sessionId)}/notes/${encodeURIComponent(noteId)}`,
		);
		returnData.push({ json: { success: true, sessionId, noteId } });
	}

	return returnData;
}
