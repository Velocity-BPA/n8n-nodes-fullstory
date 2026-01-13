/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { FullStory } from '../../nodes/FullStory/FullStory.node';
import { FullStoryTrigger } from '../../nodes/FullStory/FullStoryTrigger.node';

describe('FullStory Node Integration', () => {
	describe('FullStory Node', () => {
		let fullStoryNode: FullStory;

		beforeEach(() => {
			fullStoryNode = new FullStory();
		});

		it('should have correct node name', () => {
			expect(fullStoryNode.description.name).toBe('fullStory');
		});

		it('should have correct display name', () => {
			expect(fullStoryNode.description.displayName).toBe('FullStory');
		});

		it('should require fullStoryApi credentials', () => {
			const creds = fullStoryNode.description.credentials;
			expect(creds).toBeDefined();
			expect(creds).toHaveLength(1);
			expect(creds![0].name).toBe('fullStoryApi');
			expect(creds![0].required).toBe(true);
		});

		it('should have all 10 resources defined', () => {
			const resourceProperty = fullStoryNode.description.properties.find(
				p => p.name === 'resource',
			);
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.type).toBe('options');

			const options = resourceProperty?.options as Array<{ value: string }>;
			const resourceValues = options.map(o => o.value);

			// All 10 resources
			expect(resourceValues).toContain('user');
			expect(resourceValues).toContain('event');
			expect(resourceValues).toContain('session');
			expect(resourceValues).toContain('segment');
			expect(resourceValues).toContain('webhook');
			expect(resourceValues).toContain('dataExport');
			expect(resourceValues).toContain('note');
			expect(resourceValues).toContain('error');
			expect(resourceValues).toContain('page');
			expect(resourceValues).toContain('integration');
			expect(resourceValues).toHaveLength(10);
		});

		describe('User Operations', () => {
			it('should have all user operations', () => {
				const operationProperty = fullStoryNode.description.properties.find(
					p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('user'),
				);
				expect(operationProperty).toBeDefined();

				const options = operationProperty?.options as Array<{ value: string }>;
				const operationValues = options.map(o => o.value);

				expect(operationValues).toContain('create');
				expect(operationValues).toContain('get');
				expect(operationValues).toContain('getByUid');
				expect(operationValues).toContain('update');
				expect(operationValues).toContain('batchCreate');
				expect(operationValues).toContain('delete');
				expect(operationValues).toContain('list');
				expect(operationValues).toContain('search');
				expect(operationValues).toContain('getSessions');
				expect(operationValues).toContain('merge');
			});
		});

		describe('Event Operations', () => {
			it('should have all event operations', () => {
				const operationProperty = fullStoryNode.description.properties.find(
					p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('event'),
				);
				expect(operationProperty).toBeDefined();

				const options = operationProperty?.options as Array<{ value: string }>;
				const operationValues = options.map(o => o.value);

				expect(operationValues).toContain('track');
				expect(operationValues).toContain('batchTrack');
				expect(operationValues).toContain('listDefinitions');
				expect(operationValues).toContain('getDefinition');
				expect(operationValues).toContain('createDefinition');
				expect(operationValues).toContain('updateDefinition');
				expect(operationValues).toContain('deleteDefinition');
			});
		});

		describe('Session Operations', () => {
			it('should have all session operations', () => {
				const operationProperty = fullStoryNode.description.properties.find(
					p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('session'),
				);
				expect(operationProperty).toBeDefined();

				const options = operationProperty?.options as Array<{ value: string }>;
				const operationValues = options.map(o => o.value);

				expect(operationValues).toContain('get');
				expect(operationValues).toContain('list');
				expect(operationValues).toContain('getUrl');
				expect(operationValues).toContain('search');
				expect(operationValues).toContain('getEvents');
				expect(operationValues).toContain('getNotes');
				expect(operationValues).toContain('addNote');
				expect(operationValues).toContain('deleteNote');
			});
		});

		describe('Segment Operations', () => {
			it('should have all segment operations', () => {
				const operationProperty = fullStoryNode.description.properties.find(
					p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('segment'),
				);
				expect(operationProperty).toBeDefined();

				const options = operationProperty?.options as Array<{ value: string }>;
				const operationValues = options.map(o => o.value);

				expect(operationValues).toContain('list');
				expect(operationValues).toContain('get');
				expect(operationValues).toContain('create');
				expect(operationValues).toContain('update');
				expect(operationValues).toContain('delete');
				expect(operationValues).toContain('getUsers');
				expect(operationValues).toContain('getSessions');
				expect(operationValues).toContain('createExport');
			});
		});

		describe('Webhook Operations', () => {
			it('should have all webhook operations', () => {
				const operationProperty = fullStoryNode.description.properties.find(
					p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('webhook'),
				);
				expect(operationProperty).toBeDefined();

				const options = operationProperty?.options as Array<{ value: string }>;
				const operationValues = options.map(o => o.value);

				expect(operationValues).toContain('create');
				expect(operationValues).toContain('list');
				expect(operationValues).toContain('get');
				expect(operationValues).toContain('update');
				expect(operationValues).toContain('delete');
				expect(operationValues).toContain('enable');
				expect(operationValues).toContain('disable');
				expect(operationValues).toContain('test');
				expect(operationValues).toContain('listDeliveries');
				expect(operationValues).toContain('retryDelivery');
			});
		});

		describe('Data Export Operations', () => {
			it('should have all data export operations', () => {
				const operationProperty = fullStoryNode.description.properties.find(
					p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('dataExport'),
				);
				expect(operationProperty).toBeDefined();

				const options = operationProperty?.options as Array<{ value: string }>;
				const operationValues = options.map(o => o.value);

				expect(operationValues).toContain('create');
				expect(operationValues).toContain('createSegmentExport');
				expect(operationValues).toContain('getStatus');
				expect(operationValues).toContain('listOperations');
				expect(operationValues).toContain('download');
				expect(operationValues).toContain('cancel');
				expect(operationValues).toContain('getSchema');
			});
		});

		describe('Note Operations', () => {
			it('should have all note operations', () => {
				const operationProperty = fullStoryNode.description.properties.find(
					p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('note'),
				);
				expect(operationProperty).toBeDefined();

				const options = operationProperty?.options as Array<{ value: string }>;
				const operationValues = options.map(o => o.value);

				expect(operationValues).toContain('create');
				expect(operationValues).toContain('get');
				expect(operationValues).toContain('update');
				expect(operationValues).toContain('delete');
				expect(operationValues).toContain('list');
				expect(operationValues).toContain('search');
			});
		});

		describe('Error Operations', () => {
			it('should have all error operations', () => {
				const operationProperty = fullStoryNode.description.properties.find(
					p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('error'),
				);
				expect(operationProperty).toBeDefined();

				const options = operationProperty?.options as Array<{ value: string }>;
				const operationValues = options.map(o => o.value);

				expect(operationValues).toContain('list');
				expect(operationValues).toContain('get');
				expect(operationValues).toContain('getSessions');
				expect(operationValues).toContain('group');
				expect(operationValues).toContain('search');
			});
		});

		describe('Page Operations', () => {
			it('should have all page operations', () => {
				const operationProperty = fullStoryNode.description.properties.find(
					p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('page'),
				);
				expect(operationProperty).toBeDefined();

				const options = operationProperty?.options as Array<{ value: string }>;
				const operationValues = options.map(o => o.value);

				expect(operationValues).toContain('list');
				expect(operationValues).toContain('get');
				expect(operationValues).toContain('getSessions');
				expect(operationValues).toContain('getHeatmap');
				expect(operationValues).toContain('search');
			});
		});

		describe('Integration Operations', () => {
			it('should have all integration operations', () => {
				const operationProperty = fullStoryNode.description.properties.find(
					p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('integration'),
				);
				expect(operationProperty).toBeDefined();

				const options = operationProperty?.options as Array<{ value: string }>;
				const operationValues = options.map(o => o.value);

				expect(operationValues).toContain('create');
				expect(operationValues).toContain('get');
				expect(operationValues).toContain('update');
				expect(operationValues).toContain('delete');
				expect(operationValues).toContain('list');
				expect(operationValues).toContain('test');
			});
		});
	});

	describe('FullStory Trigger Node', () => {
		let triggerNode: FullStoryTrigger;

		beforeEach(() => {
			triggerNode = new FullStoryTrigger();
		});

		it('should have correct node name', () => {
			expect(triggerNode.description.name).toBe('fullStoryTrigger');
		});

		it('should have correct display name', () => {
			expect(triggerNode.description.displayName).toBe('FullStory Trigger');
		});

		it('should be in trigger group', () => {
			expect(triggerNode.description.group).toContain('trigger');
		});

		it('should have no inputs', () => {
			expect(triggerNode.description.inputs).toEqual([]);
		});

		it('should require fullStoryApi credentials', () => {
			const creds = triggerNode.description.credentials;
			expect(creds).toBeDefined();
			expect(creds).toHaveLength(1);
			expect(creds![0].name).toBe('fullStoryApi');
		});

		it('should have events property', () => {
			const eventsProperty = triggerNode.description.properties.find(
				p => p.name === 'events',
			);
			expect(eventsProperty).toBeDefined();
			expect(eventsProperty?.type).toBe('multiOptions');
			expect(eventsProperty?.required).toBe(true);
		});

		it('should have webhook configuration', () => {
			expect(triggerNode.description.webhooks).toBeDefined();
			expect(triggerNode.description.webhooks).toHaveLength(1);
			expect(triggerNode.description.webhooks![0].httpMethod).toBe('POST');
		});

		it('should have webhook methods', () => {
			expect(triggerNode.webhookMethods).toBeDefined();
			expect(triggerNode.webhookMethods.default).toBeDefined();
			expect(triggerNode.webhookMethods.default.checkExists).toBeDefined();
			expect(triggerNode.webhookMethods.default.create).toBeDefined();
			expect(triggerNode.webhookMethods.default.delete).toBeDefined();
		});
	});
});
