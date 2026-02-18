import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import {
	NodeOperationError,
} from 'n8n-workflow';

import { renderioApiRequest } from './shared/transport';

import { commandOperations, commandFields } from './resources/command/index';
import { fileOperations, fileFields } from './resources/file/index';
import { presetOperations, presetFields } from './resources/preset/index';

import { executeCommandOperation } from './resources/command/execute';
import { executeFileOperation } from './resources/file/execute';
import { executePresetOperation } from './resources/preset/execute';

export class Renderio implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RenderIO',
		name: 'renderio',
		icon: { light: 'file:renderio.svg', dark: 'file:renderio.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Run FFmpeg commands in the cloud with RenderIO',
		defaults: {
			name: 'RenderIO',
		},
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'renderioOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
			{
				name: 'renderioApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiKey'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'API Key',
						value: 'apiKey',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'oAuth2',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Command',
						value: 'command',
					},
					{
						name: 'File',
						value: 'file',
					},
					{
						name: 'Preset',
						value: 'preset',
					},
				],
				default: 'command',
			},
			commandOperations,
			...commandFields,
			fileOperations,
			...fileFields,
			presetOperations,
			...presetFields,
		],
	};

	methods = {
		listSearch: {
			async searchPresets(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const response = await renderioApiRequest.call(
					this,
					'GET',
					'/api/v1/presets',
					undefined,
					{ limit: 100 },
				);

				const presets = (response.data as IDataObject[] | undefined) ?? [];

				let results = presets.map((preset) => ({
					name: (preset.name as string) || (preset.id as string),
					value: preset.id as string,
				}));

				if (filter) {
					const lowerFilter = filter.toLowerCase();
					results = results.filter((r) =>
						r.name.toLowerCase().includes(lowerFilter),
					);
				}

				return { results };
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: INodeExecutionData[];

				switch (resource) {
					case 'command':
						responseData = await executeCommandOperation.call(this, operation, i);
						break;
					case 'file':
						responseData = await executeFileOperation.call(this, operation, i);
						break;
					case 'preset':
						responseData = await executePresetOperation.call(this, operation, i);
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unknown resource: ${resource}`,
						);
				}

				returnData.push(...responseData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
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
