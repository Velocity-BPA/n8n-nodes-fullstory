/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHookFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import { FULLSTORY_API_BASE_URL } from '../constants';

type FullStoryExecuteContext = IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions;

/**
 * Make an authenticated request to the FullStory API
 */
export async function fullStoryApiRequest(
	this: FullStoryExecuteContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('fullStoryApi');

	if (!credentials?.apiKey) {
		throw new NodeOperationError(this.getNode(), 'No API key provided in credentials');
	}

	const options: IHttpRequestOptions = {
		method,
		url: `${FULLSTORY_API_BASE_URL}${endpoint}`,
		headers: {
			'Authorization': `Basic ${credentials.apiKey}`,
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (query && Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		const response = await this.helpers.httpRequest(options);
		return response as IDataObject | IDataObject[];
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		throw new NodeApiError(this.getNode(), {} as JsonObject, {
			message: errorMessage,
		});
	}
}

/**
 * Make a paginated request to the FullStory API and return all results
 */
export async function fullStoryApiRequestAllItems(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | undefined,
	query: IDataObject | undefined,
	propertyName: string,
): Promise<IDataObject[]> {
	const results: IDataObject[] = [];
	let responseData: IDataObject;
	let paginationToken: string | undefined;

	query = query || {};

	do {
		if (paginationToken) {
			query.pagination_token = paginationToken;
		}

		responseData = (await fullStoryApiRequest.call(this, method, endpoint, body, query)) as IDataObject;

		const items = responseData[propertyName] as IDataObject[];
		if (items && Array.isArray(items)) {
			results.push(...items);
		}

		paginationToken = responseData.next_pagination_token as string | undefined;
	} while (paginationToken);

	return results;
}

/**
 * Extract meaningful error message from FullStory API error
 */
function getErrorMessage(error: unknown): string {
	if (error && typeof error === 'object') {
		const err = error as Record<string, unknown>;
		
		// Check for FullStory specific error format
		if (err.response && typeof err.response === 'object') {
			const response = err.response as Record<string, unknown>;
			if (response.body && typeof response.body === 'object') {
				const body = response.body as Record<string, unknown>;
				if (body.message) {
					return String(body.message);
				}
			}
		}
		
		if (err.message) {
			return String(err.message);
		}
	}
	
	return 'An unknown error occurred';
}

/**
 * Build the endpoint URL for user operations
 */
export function buildUserEndpoint(userId?: string): string {
	if (userId) {
		return `/v2/users/${encodeURIComponent(userId)}`;
	}
	return '/v2/users';
}

/**
 * Build the endpoint URL for session operations
 */
export function buildSessionEndpoint(sessionId?: string, userId?: string): string {
	if (sessionId) {
		return `/sessions/v1/${encodeURIComponent(sessionId)}`;
	}
	if (userId) {
		return `/sessions/v1/users/${encodeURIComponent(userId)}`;
	}
	return '/sessions/v1';
}

/**
 * Build the endpoint URL for segment operations
 */
export function buildSegmentEndpoint(segmentId?: string): string {
	if (segmentId) {
		return `/segments/v1/${encodeURIComponent(segmentId)}`;
	}
	return '/segments/v1';
}

/**
 * Build the endpoint URL for webhook operations
 */
export function buildWebhookEndpoint(endpointId?: string): string {
	if (endpointId) {
		return `/webhooks/v1/endpoints/${encodeURIComponent(endpointId)}`;
	}
	return '/webhooks/v1/endpoints';
}

/**
 * Build the endpoint URL for data export operations
 */
export function buildExportEndpoint(exportId?: string): string {
	if (exportId) {
		return `/operations/v1/${encodeURIComponent(exportId)}`;
	}
	return '/segments/v1/exports';
}

/**
 * Wait for an async operation to complete
 */
export async function waitForOperation(
	this: IExecuteFunctions,
	operationId: string,
	maxAttempts = 60,
	delayMs = 5000,
): Promise<IDataObject> {
	let attempts = 0;
	
	while (attempts < maxAttempts) {
		const status = (await fullStoryApiRequest.call(
			this,
			'GET',
			`/operations/v1/${encodeURIComponent(operationId)}`,
		)) as IDataObject;

		const state = status.state as string;

		if (state === 'STATE_COMPLETED') {
			return status;
		}

		if (state === 'STATE_FAILED') {
			const errorInfo = status.error as IDataObject | undefined;
			throw new NodeOperationError(
				this.getNode(),
				`Export operation failed: ${errorInfo?.message || 'Unknown error'}`,
			);
		}

		attempts++;
		await new Promise(resolve => setTimeout(resolve, delayMs));
	}

	throw new NodeOperationError(
		this.getNode(),
		`Operation ${operationId} timed out after ${maxAttempts} attempts`,
	);
}
