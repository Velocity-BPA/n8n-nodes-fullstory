/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

/**
 * Convert a timestamp to ISO 8601 format
 */
export function toIsoTimestamp(timestamp: string | number | Date): string {
	if (timestamp instanceof Date) {
		return timestamp.toISOString();
	}
	
	if (typeof timestamp === 'number') {
		return new Date(timestamp).toISOString();
	}
	
	// Try to parse as date string
	const date = new Date(timestamp);
	if (!isNaN(date.getTime())) {
		return date.toISOString();
	}
	
	// Return as-is if already in ISO format or unable to parse
	return timestamp;
}

/**
 * Remove undefined and null values from an object
 */
export function removeEmptyProperties(obj: IDataObject): IDataObject {
	const result: IDataObject = {};
	
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null && value !== '') {
			if (typeof value === 'object' && !Array.isArray(value)) {
				const nested = removeEmptyProperties(value as IDataObject);
				if (Object.keys(nested).length > 0) {
					result[key] = nested;
				}
			} else {
				result[key] = value;
			}
		}
	}
	
	return result;
}

/**
 * Parse JSON string to object, return original if already an object or invalid JSON
 */
export function parseJsonParameter(value: unknown): IDataObject | undefined {
	if (!value) {
		return undefined;
	}
	
	if (typeof value === 'object') {
		return value as IDataObject;
	}
	
	if (typeof value === 'string') {
		try {
			return JSON.parse(value) as IDataObject;
		} catch {
			return undefined;
		}
	}
	
	return undefined;
}

/**
 * Build time range object for export requests
 */
export function buildTimeRange(
	startTime?: string | number | Date,
	endTime?: string | number | Date,
): { start: string; end: string } | undefined {
	if (!startTime && !endTime) {
		return undefined;
	}
	
	const result: { start?: string; end?: string } = {};
	
	if (startTime) {
		result.start = toIsoTimestamp(startTime);
	}
	if (endTime) {
		result.end = toIsoTimestamp(endTime);
	}
	
	// Only return if we have at least one value
	if (result.start || result.end) {
		return result as { start: string; end: string };
	}
	
	return undefined;
}

/**
 * Validate and format user properties
 */
export function formatUserProperties(properties: unknown): IDataObject | undefined {
	const parsed = parseJsonParameter(properties);
	if (!parsed) {
		return undefined;
	}
	
	return removeEmptyProperties(parsed);
}

/**
 * Build context object for event tracking
 */
export function buildEventContext(
	browserUrl?: string,
	userAgent?: string,
	initialReferrer?: string,
	ipAddress?: string,
	city?: string,
	region?: string,
	country?: string,
	latitude?: number,
	longitude?: number,
): IDataObject | undefined {
	const context: IDataObject = {};
	
	// Browser context
	if (browserUrl || userAgent || initialReferrer) {
		context.browser = removeEmptyProperties({
			url: browserUrl,
			user_agent: userAgent,
			initial_referrer: initialReferrer,
		});
	}
	
	// Location context
	if (ipAddress || city || region || country || latitude !== undefined || longitude !== undefined) {
		context.location = removeEmptyProperties({
			ip_address: ipAddress,
			city,
			region,
			country,
			latitude,
			longitude,
		});
	}
	
	if (Object.keys(context).length === 0) {
		return undefined;
	}
	
	return context;
}

/**
 * Chunk array into smaller arrays of specified size
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
	const chunks: T[][] = [];
	
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	
	return chunks;
}

/**
 * Generate a session replay URL
 */
export function generateSessionReplayUrl(
	sessionId: string,
	dataCenter: string = 'na1',
	timestamp?: number,
): string {
	const baseUrl = dataCenter === 'eu1' 
		? 'https://app.eu1.fullstory.com' 
		: 'https://app.fullstory.com';
	
	let url = `${baseUrl}/ui/session/${sessionId}`;
	
	if (timestamp) {
		url += `:${timestamp}`;
	}
	
	return url;
}

/**
 * Validate webhook URL format
 */
export function isValidWebhookUrl(url: string): boolean {
	try {
		const parsedUrl = new URL(url);
		return parsedUrl.protocol === 'https:';
	} catch {
		return false;
	}
}

/**
 * Format webhook event types array
 */
export function formatWebhookEventTypes(eventTypes: string | string[]): string[] {
	if (Array.isArray(eventTypes)) {
		return eventTypes;
	}
	
	if (typeof eventTypes === 'string') {
		return eventTypes.split(',').map(type => type.trim()).filter(Boolean);
	}
	
	return [];
}
