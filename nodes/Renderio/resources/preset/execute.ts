import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeParameterResourceLocator,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { renderioApiRequest } from '../../shared/transport';

/**
 * Build a key-value map from a fixedCollection parameter.
 */
function buildKeyValueMap(
	context: IExecuteFunctions,
	paramName: string,
	i: number,
	collectionName: string,
): Record<string, string> {
	const data = context.getNodeParameter(paramName, i, {}) as IDataObject;
	const entries = (data[collectionName] as IDataObject[] | undefined) ?? [];
	const result: Record<string, string> = {};
	for (const entry of entries) {
		const key = entry.key as string;
		const value = entry.value as string;
		if (key && value) {
			result[key] = value;
		}
	}
	return result;
}

/**
 * Build the metadata object from a fixedCollection inside an options parameter.
 */
function buildMetadata(options: IDataObject): Record<string, string> | undefined {
	const metadataData = options.metadata as IDataObject | undefined;
	if (!metadataData) return undefined;

	const metadataEntries = (metadataData.metadataValues as IDataObject[] | undefined) ?? [];
	if (metadataEntries.length === 0) return undefined;

	const result: Record<string, string> = {};
	for (const entry of metadataEntries) {
		const key = entry.key as string;
		const value = entry.value as string;
		if (key) {
			result[key] = value;
		}
	}
	return Object.keys(result).length > 0 ? result : undefined;
}

export async function executePresetOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject;

	if (operation === 'execute') {
		const presetLocator = this.getNodeParameter('presetId', i) as INodeParameterResourceLocator;
		const presetId = presetLocator.value as string;
		const inputFiles = buildKeyValueMap(this, 'inputFiles', i, 'fileValues');
		const executeOptions = this.getNodeParameter('executeOptions', i, {}) as IDataObject;

		const body: IDataObject = {
			input_files: inputFiles,
		};

		const metadata = buildMetadata(executeOptions);
		if (metadata) {
			body.metadata = metadata;
		}

		if (executeOptions.webhookUrl) {
			body.webhook_url = executeOptions.webhookUrl;
		}

		try {
			responseData = await renderioApiRequest.call(
				this,
				'POST',
				`/api/v1/presets/${presetId}/execute`,
				body,
			) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not execute preset',
				description: `Check that the preset ID '${presetId}' is correct and input files match the preset's input_file_keys.`,
			});
		}
	} else if (operation === 'get') {
		const presetLocator = this.getNodeParameter('presetId', i) as INodeParameterResourceLocator;
		const presetId = presetLocator.value as string;

		try {
			responseData = await renderioApiRequest.call(
				this,
				'GET',
				`/api/v1/presets/${presetId}`,
			) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not retrieve preset',
				description: `Check that the preset ID '${presetId}' is correct and exists.`,
			});
		}
	} else if (operation === 'getMany') {
		const limit = this.getNodeParameter('limit', i) as number;
		const getManyOptions = this.getNodeParameter('getManyOptions', i, {}) as IDataObject;

		const qs: IDataObject = {
			limit,
		};

		if (getManyOptions.offset !== undefined && getManyOptions.offset !== 0) {
			qs.offset = getManyOptions.offset;
		}

		try {
			responseData = await renderioApiRequest.call(
				this,
				'GET',
				'/api/v1/presets',
				undefined,
				qs,
			) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not retrieve presets',
				description: 'Check your parameters and try again.',
			});
		}
	} else {
		throw new NodeOperationError(
			this.getNode(),
			`Unsupported operation: ${operation}`,
			{ itemIndex: i },
		);
	}

	return [{ json: responseData, pairedItem: { item: i } }];
}
