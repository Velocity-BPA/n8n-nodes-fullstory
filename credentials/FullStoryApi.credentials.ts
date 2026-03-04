import {
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
			description: 'The API key for your FullStory account',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.fullstory.com/v2',
			required: true,
			description: 'The base URL for the FullStory API',
		},
	];
}