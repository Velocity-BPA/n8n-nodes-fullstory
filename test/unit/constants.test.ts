/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	FULLSTORY_API_BASE_URL,
	FULLSTORY_API_ENDPOINTS,
	FULLSTORY_DATA_CENTERS,
	FULLSTORY_EXPORT_FORMATS,
	FULLSTORY_EXPORT_TYPES,
	FULLSTORY_OPERATION_STATES,
	FULLSTORY_WEBHOOK_EVENT_TYPES,
	FULLSTORY_DEFAULT_PAGINATION_LIMIT,
	FULLSTORY_MAX_PAGINATION_LIMIT,
	FULLSTORY_BATCH_SIZE_LIMIT,
	FULLSTORY_RATE_LIMITS,
} from '../../nodes/FullStory/constants';

describe('FullStory Constants', () => {
	describe('API Configuration', () => {
		it('should have correct base URL', () => {
			expect(FULLSTORY_API_BASE_URL).toBe('https://api.fullstory.com');
		});

		it('should have all required endpoints', () => {
			expect(FULLSTORY_API_ENDPOINTS.USERS_V2).toBe('/v2/users');
			expect(FULLSTORY_API_ENDPOINTS.EVENTS_V2).toBe('/v2/events');
			expect(FULLSTORY_API_ENDPOINTS.USERS_V1).toBe('/users/v1');
			expect(FULLSTORY_API_ENDPOINTS.SEGMENTS_V1).toBe('/segments/v1');
			expect(FULLSTORY_API_ENDPOINTS.OPERATIONS_V1).toBe('/operations/v1');
			expect(FULLSTORY_API_ENDPOINTS.WEBHOOKS_V1).toBe('/webhooks/v1/endpoints');
			expect(FULLSTORY_API_ENDPOINTS.SESSIONS_V1).toBe('/sessions/v1');
		});
	});

	describe('Data Centers', () => {
		it('should have NA1 and EU1 data centers', () => {
			expect(FULLSTORY_DATA_CENTERS.NA1).toBe('na1');
			expect(FULLSTORY_DATA_CENTERS.EU1).toBe('eu1');
		});
	});

	describe('Export Formats', () => {
		it('should have all export formats', () => {
			expect(FULLSTORY_EXPORT_FORMATS.CSV).toBe('FORMAT_CSV');
			expect(FULLSTORY_EXPORT_FORMATS.JSON).toBe('FORMAT_JSON');
			expect(FULLSTORY_EXPORT_FORMATS.NDJSON).toBe('FORMAT_NDJSON');
		});
	});

	describe('Export Types', () => {
		it('should have event and user export types', () => {
			expect(FULLSTORY_EXPORT_TYPES.EVENT).toBe('TYPE_EVENT');
			expect(FULLSTORY_EXPORT_TYPES.USER).toBe('TYPE_USER');
		});
	});

	describe('Operation States', () => {
		it('should have all operation states', () => {
			expect(FULLSTORY_OPERATION_STATES.UNSPECIFIED).toBe('STATE_UNSPECIFIED');
			expect(FULLSTORY_OPERATION_STATES.PENDING).toBe('STATE_PENDING');
			expect(FULLSTORY_OPERATION_STATES.RUNNING).toBe('STATE_RUNNING');
			expect(FULLSTORY_OPERATION_STATES.COMPLETED).toBe('STATE_COMPLETED');
			expect(FULLSTORY_OPERATION_STATES.FAILED).toBe('STATE_FAILED');
		});
	});

	describe('Webhook Event Types', () => {
		it('should have all webhook event types', () => {
			expect(FULLSTORY_WEBHOOK_EVENT_TYPES).toContain('note.created');
			expect(FULLSTORY_WEBHOOK_EVENT_TYPES).toContain('recording.event.custom');
			expect(FULLSTORY_WEBHOOK_EVENT_TYPES).toContain('segment.updated');
		});

		it('should have exactly 3 event types', () => {
			expect(FULLSTORY_WEBHOOK_EVENT_TYPES).toHaveLength(3);
		});
	});

	describe('Pagination Limits', () => {
		it('should have correct default limit', () => {
			expect(FULLSTORY_DEFAULT_PAGINATION_LIMIT).toBe(25);
		});

		it('should have correct max limit', () => {
			expect(FULLSTORY_MAX_PAGINATION_LIMIT).toBe(100);
		});

		it('should have correct batch size limit', () => {
			expect(FULLSTORY_BATCH_SIZE_LIMIT).toBe(100);
		});
	});

	describe('Rate Limits', () => {
		it('should have correct rate limits', () => {
			expect(FULLSTORY_RATE_LIMITS.DEFAULT).toBe(100);
			expect(FULLSTORY_RATE_LIMITS.SEGMENT_EXPORT).toBe(2);
		});
	});
});
