/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	toIsoTimestamp,
	removeEmptyProperties,
	parseJsonParameter,
	buildTimeRange,
	formatUserProperties,
	buildEventContext,
	chunkArray,
	generateSessionReplayUrl,
	isValidWebhookUrl,
	formatWebhookEventTypes,
} from '../../nodes/FullStory/utils';

describe('FullStory Utils', () => {
	describe('toIsoTimestamp', () => {
		it('should convert Date object to ISO string', () => {
			const date = new Date('2024-01-15T10:30:00.000Z');
			expect(toIsoTimestamp(date)).toBe('2024-01-15T10:30:00.000Z');
		});

		it('should convert timestamp number to ISO string', () => {
			const timestamp = 1705314600000; // 2024-01-15T10:30:00.000Z
			const result = toIsoTimestamp(timestamp);
			expect(result).toBe('2024-01-15T10:30:00.000Z');
		});

		it('should parse date string to ISO format', () => {
			const dateStr = '2024-01-15';
			const result = toIsoTimestamp(dateStr);
			expect(result).toContain('2024-01-15');
		});

		it('should return original string if already ISO format', () => {
			const isoStr = '2024-01-15T10:30:00.000Z';
			expect(toIsoTimestamp(isoStr)).toBe(isoStr);
		});
	});

	describe('removeEmptyProperties', () => {
		it('should remove undefined values', () => {
			const obj = { a: 1, b: undefined, c: 'test' };
			const result = removeEmptyProperties(obj);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should remove null values', () => {
			const obj = { a: 1, b: null, c: 'test' };
			const result = removeEmptyProperties(obj);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should remove empty strings', () => {
			const obj = { a: 1, b: '', c: 'test' };
			const result = removeEmptyProperties(obj);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should handle nested objects', () => {
			const obj = { a: 1, nested: { x: undefined, y: 2 } };
			const result = removeEmptyProperties(obj);
			expect(result).toEqual({ a: 1, nested: { y: 2 } });
		});

		it('should remove empty nested objects', () => {
			const obj = { a: 1, nested: { x: undefined } };
			const result = removeEmptyProperties(obj);
			expect(result).toEqual({ a: 1 });
		});
	});

	describe('parseJsonParameter', () => {
		it('should parse valid JSON string', () => {
			const json = '{"key": "value"}';
			const result = parseJsonParameter(json);
			expect(result).toEqual({ key: 'value' });
		});

		it('should return object as-is', () => {
			const obj = { key: 'value' };
			const result = parseJsonParameter(obj);
			expect(result).toEqual({ key: 'value' });
		});

		it('should return undefined for invalid JSON', () => {
			const invalid = 'not json';
			const result = parseJsonParameter(invalid);
			expect(result).toBeUndefined();
		});

		it('should return undefined for null/undefined', () => {
			expect(parseJsonParameter(null)).toBeUndefined();
			expect(parseJsonParameter(undefined)).toBeUndefined();
		});
	});

	describe('buildTimeRange', () => {
		it('should create time range object', () => {
			const start = '2024-01-01T00:00:00.000Z';
			const end = '2024-01-31T23:59:59.999Z';
			const result = buildTimeRange(start, end);
			expect(result).toEqual({ start, end });
		});
	});

	describe('formatUserProperties', () => {
		it('should parse and clean user properties', () => {
			const props = '{"name": "Test", "empty": ""}';
			const result = formatUserProperties(props);
			expect(result).toEqual({ name: 'Test' });
		});

		it('should return undefined for invalid input', () => {
			expect(formatUserProperties('invalid')).toBeUndefined();
		});
	});

	describe('buildEventContext', () => {
		it('should build browser context', () => {
			const result = buildEventContext(
				'https://example.com',
				'Mozilla/5.0',
				'https://google.com',
			);
			expect(result).toEqual({
				browser: {
					url: 'https://example.com',
					user_agent: 'Mozilla/5.0',
					initial_referrer: 'https://google.com',
				},
			});
		});

		it('should build location context', () => {
			const result = buildEventContext(
				undefined,
				undefined,
				undefined,
				'192.168.1.1',
				'New York',
				'NY',
				'US',
			);
			expect(result).toEqual({
				location: {
					ip_address: '192.168.1.1',
					city: 'New York',
					region: 'NY',
					country: 'US',
				},
			});
		});

		it('should return undefined when no context provided', () => {
			const result = buildEventContext();
			expect(result).toBeUndefined();
		});
	});

	describe('chunkArray', () => {
		it('should split array into chunks', () => {
			const arr = [1, 2, 3, 4, 5];
			const result = chunkArray(arr, 2);
			expect(result).toEqual([[1, 2], [3, 4], [5]]);
		});

		it('should handle empty array', () => {
			const result = chunkArray([], 2);
			expect(result).toEqual([]);
		});

		it('should handle array smaller than chunk size', () => {
			const arr = [1, 2];
			const result = chunkArray(arr, 5);
			expect(result).toEqual([[1, 2]]);
		});
	});

	describe('generateSessionReplayUrl', () => {
		it('should generate NA1 URL', () => {
			const result = generateSessionReplayUrl('session123', 'na1');
			expect(result).toBe('https://app.fullstory.com/ui/session/session123');
		});

		it('should generate EU1 URL', () => {
			const result = generateSessionReplayUrl('session123', 'eu1');
			expect(result).toBe('https://app.eu1.fullstory.com/ui/session/session123');
		});

		it('should include timestamp when provided', () => {
			const result = generateSessionReplayUrl('session123', 'na1', 5000);
			expect(result).toBe('https://app.fullstory.com/ui/session/session123:5000');
		});
	});

	describe('isValidWebhookUrl', () => {
		it('should accept HTTPS URLs', () => {
			expect(isValidWebhookUrl('https://example.com/webhook')).toBe(true);
		});

		it('should reject HTTP URLs', () => {
			expect(isValidWebhookUrl('http://example.com/webhook')).toBe(false);
		});

		it('should reject invalid URLs', () => {
			expect(isValidWebhookUrl('not-a-url')).toBe(false);
		});
	});

	describe('formatWebhookEventTypes', () => {
		it('should return array as-is', () => {
			const events = ['note.created', 'segment.updated'];
			expect(formatWebhookEventTypes(events)).toEqual(events);
		});

		it('should parse comma-separated string', () => {
			const events = 'note.created, segment.updated';
			expect(formatWebhookEventTypes(events)).toEqual(['note.created', 'segment.updated']);
		});

		it('should handle empty string', () => {
			expect(formatWebhookEventTypes('')).toEqual([]);
		});
	});
});
