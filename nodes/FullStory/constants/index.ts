/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const FULLSTORY_API_BASE_URL = 'https://api.fullstory.com';

export const FULLSTORY_API_ENDPOINTS = {
	// V2 Endpoints
	USERS_V2: '/v2/users',
	EVENTS_V2: '/v2/events',
	
	// V1 Endpoints
	USERS_V1: '/users/v1',
	SEGMENTS_V1: '/segments/v1',
	OPERATIONS_V1: '/operations/v1',
	WEBHOOKS_V1: '/webhooks/v1/endpoints',
	SESSIONS_V1: '/sessions/v1',
} as const;

export const FULLSTORY_DATA_CENTERS = {
	NA1: 'na1',
	EU1: 'eu1',
} as const;

export const FULLSTORY_EXPORT_FORMATS = {
	CSV: 'FORMAT_CSV',
	JSON: 'FORMAT_JSON',
	NDJSON: 'FORMAT_NDJSON',
} as const;

export const FULLSTORY_EXPORT_TYPES = {
	EVENT: 'TYPE_EVENT',
	USER: 'TYPE_USER',
} as const;

export const FULLSTORY_OPERATION_STATES = {
	UNSPECIFIED: 'STATE_UNSPECIFIED',
	PENDING: 'STATE_PENDING',
	RUNNING: 'STATE_RUNNING',
	COMPLETED: 'STATE_COMPLETED',
	FAILED: 'STATE_FAILED',
} as const;

export const FULLSTORY_WEBHOOK_EVENT_TYPES = [
	'note.created',
	'recording.event.custom',
	'segment.updated',
] as const;

export const FULLSTORY_DEFAULT_PAGINATION_LIMIT = 25;
export const FULLSTORY_MAX_PAGINATION_LIMIT = 100;
export const FULLSTORY_BATCH_SIZE_LIMIT = 100;

export const FULLSTORY_RATE_LIMITS = {
	DEFAULT: 100,
	SEGMENT_EXPORT: 2,
} as const;
