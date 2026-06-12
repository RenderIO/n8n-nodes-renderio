import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeParameterResourceLocator,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { renderioApiRequest } from '../../shared/transport';

const MAX_METADATA_ENTRIES = 10;

function asString(value: unknown): string {
	if (value !== null && typeof value === 'object' && 'value' in value) {
		return String((value as { value?: unknown }).value ?? '').trim();
	}

	return String(value ?? '').trim();
}

function throwValidationError(
	context: IExecuteFunctions,
	message: string,
	description: string,
	i: number,
): never {
	throw new NodeOperationError(context.getNode(), message, {
		description,
		itemIndex: i,
	});
}

/**
 * Build a key-value map from a fixedCollection parameter.
 */
function buildKeyValueMap(
	context: IExecuteFunctions,
	paramName: string,
	i: number,
	collectionName: string,
	fieldDisplayName: string,
): Record<string, string> {
	const data = context.getNodeParameter(paramName, i, {}) as IDataObject;
	const entries = (data[collectionName] as IDataObject[] | undefined) ?? [];
	if (entries.length === 0) {
		throwValidationError(
			context,
			`${fieldDisplayName} are required`,
			`Add at least one row in the "${fieldDisplayName}" field.`,
			i,
		);
	}

	const result: Record<string, string> = {};
	for (const [index, entry] of entries.entries()) {
		const key = asString(entry.key);
		const value = asString(entry.value);

		if (!key) {
			throwValidationError(
				context,
				'Input key is required',
				`Select an input key for row ${index + 1} in "${fieldDisplayName}".`,
				i,
			);
		}

		if (!value) {
			throwValidationError(
				context,
				'Input file URL is required',
				`Set a URL for "${key}" in "${fieldDisplayName}".`,
				i,
			);
		}

		if (result[key] !== undefined) {
			throwValidationError(
				context,
				`Duplicate input key: ${key}`,
				`Each input key in "${fieldDisplayName}" must be unique.`,
				i,
			);
		}

		result[key] = value;
	}
	return result;
}

/**
 * Build the metadata object from a fixedCollection inside an options parameter.
 */
function buildMetadata(
	context: IExecuteFunctions,
	options: IDataObject,
	i: number,
): Record<string, string> | undefined {
	const metadataData = options.metadata as IDataObject | undefined;
	if (!metadataData) return undefined;

	const metadataEntries =
		(metadataData.metadataValues as IDataObject[] | undefined) ?? [];
	if (metadataEntries.length === 0) return undefined;

	if (metadataEntries.length > MAX_METADATA_ENTRIES) {
		throwValidationError(
			context,
			'Too many metadata entries',
			`Add at most ${MAX_METADATA_ENTRIES} metadata entries.`,
			i,
		);
	}

	const result: Record<string, string> = {};
	for (const [index, entry] of metadataEntries.entries()) {
		const key = asString(entry.key);
		const value = asString(entry.value);
		if (!key && !value) {
			continue;
		}
		if (!key) {
			throwValidationError(
				context,
				'Metadata key is required',
				`Set a key for metadata row ${index + 1}.`,
				i,
			);
		}
		if (result[key] !== undefined) {
			throwValidationError(
				context,
				`Duplicate metadata key: ${key}`,
				'Each metadata key must be unique.',
				i,
			);
		}
		result[key] = value;
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
		const presetLocator = this.getNodeParameter('presetId', i) as
			| string
			| INodeParameterResourceLocator;
		const presetId = asString(presetLocator);
		if (!presetId) {
			throwValidationError(
				this,
				'Preset is required',
				'Choose a preset from the list or enter a preset ID.',
				i,
			);
		}

		const inputFiles = buildKeyValueMap(
			this,
			'inputFiles',
			i,
			'fileValues',
			'Input Files',
		);
		const executeOptions = this.getNodeParameter(
			'executeOptions',
			i,
			{},
		) as IDataObject;

		const body: IDataObject = {
			input_files: inputFiles,
		};

		const metadata = buildMetadata(this, executeOptions, i);
		if (metadata) {
			body.metadata = metadata;
		}

		if (executeOptions.webhookUrl) {
			body.webhook_url = executeOptions.webhookUrl;
		}

		try {
			responseData = (await renderioApiRequest.call(
				this,
				'POST',
				`/api/v1/presets/${presetId}/execute`,
				body,
			)) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not execute preset',
				description: `Check that the preset ID '${presetId}' is correct and input files match the preset's input_file_keys.`,
			});
		}
	} else if (operation === 'get') {
		const presetLocator = this.getNodeParameter('presetId', i) as
			| string
			| INodeParameterResourceLocator;
		const presetId = asString(presetLocator);
		if (!presetId) {
			throwValidationError(
				this,
				'Preset is required',
				'Choose a preset from the list or enter a preset ID.',
				i,
			);
		}

		try {
			responseData = (await renderioApiRequest.call(
				this,
				'GET',
				`/api/v1/presets/${presetId}`,
			)) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not retrieve preset',
				description: `Check that the preset ID '${presetId}' is correct and exists.`,
			});
		}
	} else if (operation === 'getMany') {
		const limit = this.getNodeParameter('limit', i) as number;
		const getManyOptions = this.getNodeParameter(
			'getManyOptions',
			i,
			{},
		) as IDataObject;

		const qs: IDataObject = {
			limit,
		};

		if (getManyOptions.offset !== undefined && getManyOptions.offset !== 0) {
			qs.offset = getManyOptions.offset;
		}

		try {
			const response = (await renderioApiRequest.call(
				this,
				'GET',
				'/api/v1/presets',
				undefined,
				qs,
			)) as IDataObject;

			const presets = (response.presets ?? []) as JsonObject[];
			return presets.map((preset) => ({
				json: preset,
				pairedItem: { item: i },
			}));
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
