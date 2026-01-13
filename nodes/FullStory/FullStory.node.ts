/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	userOperations,
	userFields,
	executeUserOperation,
	eventOperations,
	eventFields,
	executeEventOperation,
	sessionOperations,
	sessionFields,
	executeSessionOperation,
	segmentOperations,
	segmentFields,
	executeSegmentOperation,
	webhookOperations,
	webhookFields,
	executeWebhookOperation,
	dataExportOperations,
	dataExportFields,
	executeDataExportOperation,
	noteOperations,
	noteFields,
	executeNoteOperation,
	errorOperations,
	errorFields,
	executeErrorOperation,
	pageOperations,
	pageFields,
	executePageOperation,
	integrationOperations,
	integrationFields,
	executeIntegrationOperation,
} from './actions';

// Log licensing notice once on module load
const LICENSING_LOGGED = Symbol.for('fullstory.licensing.logged');
const globalSymbols = Object.getOwnPropertySymbols(global);
if (!globalSymbols.includes(LICENSING_LOGGED)) {
	(global as Record<symbol, boolean>)[LICENSING_LOGGED] = true;
	console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
}

export class FullStory implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FullStory',
		name: 'fullStory',
		icon: 'file:fullstory.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with FullStory digital experience intelligence platform',
		defaults: {
			name: 'FullStory',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'fullStoryApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Data Export',
						value: 'dataExport',
						description: 'Create and manage data exports',
					},
					{
						name: 'Error',
						value: 'error',
						description: 'View and analyze captured errors',
					},
					{
						name: 'Event',
						value: 'event',
						description: 'Track custom events',
					},
					{
						name: 'Integration',
						value: 'integration',
						description: 'Manage third-party integrations',
					},
					{
						name: 'Note',
						value: 'note',
						description: 'Manage notes on sessions and users',
					},
					{
						name: 'Page',
						value: 'page',
						description: 'View page analytics and heatmaps',
					},
					{
						name: 'Segment',
						value: 'segment',
						description: 'Manage segments and exports',
					},
					{
						name: 'Session',
						value: 'session',
						description: 'Access session data and replay URLs',
					},
					{
						name: 'User',
						value: 'user',
						description: 'Manage users in FullStory',
					},
					{
						name: 'Webhook',
						value: 'webhook',
						description: 'Manage webhook endpoints',
					},
				],
				default: 'user',
			},
			// User operations and fields
			...userOperations,
			...userFields,
			// Event operations and fields
			...eventOperations,
			...eventFields,
			// Session operations and fields
			...sessionOperations,
			...sessionFields,
			// Segment operations and fields
			...segmentOperations,
			...segmentFields,
			// Webhook operations and fields
			...webhookOperations,
			...webhookFields,
			// Data Export operations and fields
			...dataExportOperations,
			...dataExportFields,
			// Note operations and fields
			...noteOperations,
			...noteFields,
			// Error operations and fields
			...errorOperations,
			...errorFields,
			// Page operations and fields
			...pageOperations,
			...pageFields,
			// Integration operations and fields
			...integrationOperations,
			...integrationFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let results: INodeExecutionData[] = [];

				switch (resource) {
					case 'user':
						results = await executeUserOperation.call(this, operation, i);
						break;
					case 'event':
						results = await executeEventOperation.call(this, operation, i);
						break;
					case 'session':
						results = await executeSessionOperation.call(this, operation, i);
						break;
					case 'segment':
						results = await executeSegmentOperation.call(this, operation, i);
						break;
					case 'webhook':
						results = await executeWebhookOperation.call(this, operation, i);
						break;
					case 'dataExport':
						results = await executeDataExportOperation.call(this, operation, i);
						break;
					case 'note':
						results = await executeNoteOperation.call(this, operation, i);
						break;
					case 'error':
						results = await executeErrorOperation.call(this, operation, i);
						break;
					case 'page':
						results = await executePageOperation.call(this, operation, i);
						break;
					case 'integration':
						results = await executeIntegrationOperation.call(this, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push(...results);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
