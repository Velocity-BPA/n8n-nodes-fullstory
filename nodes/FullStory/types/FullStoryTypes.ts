/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface IFullStoryUser {
	uid: string;
	display_name?: string;
	email?: string;
	properties?: Record<string, unknown>;
}

export interface IFullStoryUserResponse {
	id: string;
	uid: string;
	display_name?: string;
	email?: string;
	properties?: Record<string, unknown>;
}

export interface IFullStoryEvent {
	user?: {
		uid?: string;
		id?: string;
	};
	session?: {
		id?: string;
		use_most_recent?: boolean;
	};
	context?: {
		browser?: {
			url?: string;
			user_agent?: string;
			initial_referrer?: string;
		};
		location?: {
			latitude?: number;
			longitude?: number;
			city?: string;
			region?: string;
			country?: string;
			ip_address?: string;
		};
		device?: {
			manufacturer?: string;
			model?: string;
		};
		mobile?: {
			app_id?: string;
			app_name?: string;
			app_version?: string;
		};
	};
	name: string;
	timestamp?: string;
	properties?: Record<string, unknown>;
}

export interface IFullStoryBatchEventsRequest {
	requests: IFullStoryEvent[];
}

export interface IFullStorySession {
	id: string;
	user_id?: string;
	created_time?: string;
	playback_url?: string;
	app_host?: string;
	pages_visited?: number;
	events_count?: number;
}

export interface IFullStorySessionListResponse {
	sessions: IFullStorySession[];
	next_pagination_token?: string;
}

export interface IFullStorySegment {
	id: string;
	name: string;
	description?: string;
	created_time?: string;
	last_modified_time?: string;
	creator?: {
		id: string;
		email?: string;
	};
	search_type?: string;
}

export interface IFullStorySegmentListResponse {
	segments: IFullStorySegment[];
	next_pagination_token?: string;
	total_results?: number;
}

export interface IFullStoryWebhookEndpoint {
	id?: string;
	url: string;
	event_types: string[];
	enabled?: boolean;
	created_time?: string;
	last_modified_time?: string;
}

export interface IFullStoryWebhookListResponse {
	endpoints: IFullStoryWebhookEndpoint[];
	next_pagination_token?: string;
}

export interface IFullStoryExportRequest {
	type: 'TYPE_EVENT' | 'TYPE_USER';
	time_range: {
		start: string;
		end: string;
	};
	segment_id?: string;
	format?: 'FORMAT_CSV' | 'FORMAT_JSON' | 'FORMAT_NDJSON';
}

export interface IFullStoryExportResponse {
	operation_id: string;
	search_export_id: string;
}

export interface IFullStoryOperationStatus {
	id: string;
	state: 'STATE_UNSPECIFIED' | 'STATE_PENDING' | 'STATE_RUNNING' | 'STATE_COMPLETED' | 'STATE_FAILED';
	progress?: number;
	results?: {
		export_id?: string;
		search_export_id?: string;
		exports?: Array<{
			url: string;
			size?: number;
			expires?: string;
		}>;
	};
	error?: {
		code?: string;
		message?: string;
	};
}

export interface IFullStoryPaginationParams {
	pagination_token?: string;
	limit?: number;
}

export interface IFullStoryApiError {
	message: string;
	code?: string;
	details?: unknown;
}

export type FullStoryResource = 'user' | 'event' | 'session' | 'segment' | 'webhook' | 'dataExport';

export type UserOperation = 'create' | 'get' | 'batchCreate' | 'delete';
export type EventOperation = 'track' | 'batchTrack';
export type SessionOperation = 'get' | 'list' | 'getUrl';
export type SegmentOperation = 'list' | 'get' | 'createExport';
export type WebhookOperation = 'create' | 'list' | 'get' | 'update' | 'delete';
export type DataExportOperation = 'create' | 'getStatus' | 'download';
