/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FullStoryApi implements ICredentialType {
	name = 'fullStoryApi';
	displayName = 'FullStory API';
	documentationUrl = 'https://developer.fullstory.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'FullStory API Key. Create one in Settings > Integrations > API Keys.',
		},
		{
			displayName: 'Data Center',
			name: 'dataCenter',
			type: 'options',
			options: [
				{
					name: 'United States (NA1)',
					value: 'na1',
				},
				{
					name: 'Europe (EU1)',
					value: 'eu1',
				},
			],
			default: 'na1',
			required: true,
			description: 'The data center region for your FullStory account',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Basic {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '=https://api.fullstory.com',
			url: '/segments/v1',
			method: 'GET',
		},
	};
}
