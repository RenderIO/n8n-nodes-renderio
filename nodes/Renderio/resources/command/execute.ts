import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { renderioApiRequest } from '../../shared/transport';

/**
 * Build the input_files or output_files object from a fixedCollection parameter.
 */
function buildFileMap(
	context: IExecuteFunctions,
	paramName: string,
	i: number,
): Record<string, string> {
	const filesData = context.getNodeParameter(paramName, i, {}) as IDataObject;
	const fileEntries = (filesData.fileValues as IDataObject[] | undefined) ?? [];
	const result: Record<string, string> = {};
	for (const entry of fileEntries) {
		const key = entry.key as string;
		const value = entry.value as string;
		if (key && value) {
			result[key] = value;
		}
	}
	return result;
}

/**
 * Build the metadata object from the top-level metadata fixedCollection.
 */
function buildMetadata(
	context: IExecuteFunctions,
	i: number,
): Record<string, string> | undefined {
	const metadataData = context.getNodeParameter('metadata', i, {}) as IDataObject;
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

/**
 * Build the common body fields shared between run and runChained operations.
 */
function buildCommonBody(
	context: IExecuteFunctions,
	i: number,
): IDataObject {
	const inputFiles = buildFileMap(context, 'inputFiles', i);
	const outputFiles = buildFileMap(context, 'outputFiles', i);

	const body: IDataObject = {
		input_files: inputFiles,
		output_files: outputFiles,
	};

	const metadata = buildMetadata(context, i);
	if (metadata) {
		body.metadata = metadata;
	}

	return body;
}

export async function executeCommandOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject;

	if (operation === 'get') {
		const commandId = this.getNodeParameter('commandId', i) as string;

		try {
			responseData = await renderioApiRequest.call(
				this,
				'GET',
				`/api/v1/commands/${commandId}`,
			) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not retrieve command',
				description: `Check that the command ID '${commandId}' is correct and exists.`,
			});
		}
	} else if (operation === 'run') {
		const body = buildCommonBody(this, i);
		const ffmpegCommand = this.getNodeParameter('ffmpegCommand', i) as string;
		body.ffmpeg_command = ffmpegCommand;

		try {
			responseData = await renderioApiRequest.call(
				this,
				'POST',
				'/api/v1/run-ffmpeg-command',
				body,
			) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not run FFmpeg command',
				description: 'Check that your input files are accessible URLs and the FFmpeg command syntax is valid.',
			});
		}
	} else if (operation === 'runChained') {
		const body = buildCommonBody(this, i);
		const commandsData = this.getNodeParameter('ffmpegCommands', i, {}) as IDataObject;
		const commandEntries = (commandsData.commandValues as IDataObject[] | undefined) ?? [];
		const ffmpegCommands = commandEntries
			.map((entry) => entry.command as string)
			.filter(Boolean);

		if (ffmpegCommands.length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one FFmpeg command is required',
				{
					description: 'Add at least one command in the "FFmpeg Commands" field.',
					itemIndex: i,
				},
			);
		}

		body.ffmpeg_commands = ffmpegCommands;

		try {
			responseData = await renderioApiRequest.call(
				this,
				'POST',
				'/api/v1/run-chained-ffmpeg-commands',
				body,
			) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not run chained FFmpeg commands',
				description: 'Check that your input files are accessible URLs and the FFmpeg command syntax is valid.',
			});
		}
	} else if (operation === 'runMultiple') {
		const commandsData = this.getNodeParameter('commands', i, {}) as IDataObject;
		const commandEntries = (commandsData.commandValues as IDataObject[] | undefined) ?? [];

		if (commandEntries.length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one command is required',
				{
					description: 'Add at least one command in the "Commands" field.',
					itemIndex: i,
				},
			);
		}

		const commands = commandEntries.map((entry) => {
			const ffmpegCommand = entry.ffmpegCommand as string;

			const inputFilesData = entry.inputFiles as IDataObject | undefined;
			const inputFileEntries = (inputFilesData?.fileValues as IDataObject[] | undefined) ?? [];
			const inputFiles: Record<string, string> = {};
			for (const f of inputFileEntries) {
				if (f.key && f.value) {
					inputFiles[f.key as string] = f.value as string;
				}
			}

			const outputFilesData = entry.outputFiles as IDataObject | undefined;
			const outputFileEntries = (outputFilesData?.fileValues as IDataObject[] | undefined) ?? [];
			const outputFiles: Record<string, string> = {};
			for (const f of outputFileEntries) {
				if (f.key && f.value) {
					outputFiles[f.key as string] = f.value as string;
				}
			}

			return {
				input_files: inputFiles,
				output_files: outputFiles,
				ffmpeg_command: ffmpegCommand,
			};
		});

		try {
			responseData = await renderioApiRequest.call(
				this,
				'POST',
				'/api/v1/run-multiple-ffmpeg-commands',
				{ commands } as IDataObject,
			) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not run multiple FFmpeg commands',
				description: 'Check that each command has valid input files and FFmpeg syntax.',
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
