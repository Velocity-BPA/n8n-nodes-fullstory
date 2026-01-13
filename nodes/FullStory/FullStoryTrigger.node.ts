/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';

import { fullStoryApiRequest } from './transport';
import { FULLSTORY_WEBHOOK_EVENT_TYPES } from './constants';

export class FullStoryTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FullStory Trigger',
		name: 'fullStoryTrigger',
		icon: 'file:fullstory.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Receive FullStory webhook events',
		defaults: {
			name: 'FullStory Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'fullStoryApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				options: FULLSTORY_WEBHOOK_EVENT_TYPES.map(event => ({
					name: event,
					value: event,
				})),
				description: 'The events to listen for',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');

				// Check if webhook already exists
				if (webhookData.webhookId) {
					try {
						const endpoint = (await fullStoryApiRequest.call(
							this,
							'GET',
							`/webhooks/v1/endpoints/${webhookData.webhookId}`,
						)) as IDataObject;

						if (endpoint && endpoint.url === webhookUrl) {
							return true;
						}
					} catch {
						// Webhook doesn't exist anymore
						delete webhookData.webhookId;
					}
				}

				// Search through existing webhooks
				try {
					const response = (await fullStoryApiRequest.call(
						this,
						'GET',
						'/webhooks/v1/endpoints',
					)) as IDataObject;

					const endpoints = (response.endpoints || []) as IDataObject[];
					for (const endpoint of endpoints) {
						if (endpoint.url === webhookUrl) {
							webhookData.webhookId = endpoint.id;
							return true;
						}
					}
				} catch {
					// Unable to fetch webhooks
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const events = this.getNodeParameter('events') as string[];
				const webhookData = this.getWorkflowStaticData('node');

				const body: IDataObject = {
					url: webhookUrl,
					event_types: events,
					enabled: true,
				};

				try {
					const response = (await fullStoryApiRequest.call(
						this,
						'POST',
						'/webhooks/v1/endpoints',
						body,
					)) as IDataObject;

					webhookData.webhookId = response.id;
					return true;
				} catch (error) {
					return false;
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (!webhookData.webhookId) {
					return true;
				}

				try {
					await fullStoryApiRequest.call(
						this,
						'DELETE',
						`/webhooks/v1/endpoints/${webhookData.webhookId}`,
					);
				} catch {
					return false;
				}

				delete webhookData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const headerData = this.getHeaderData();

		// Return webhook payload
		return {
			workflowData: [
				this.helpers.returnJsonArray({
					...bodyData,
					_webhookHeaders: headerData,
				} as IDataObject),
			],
		};
	}
}
