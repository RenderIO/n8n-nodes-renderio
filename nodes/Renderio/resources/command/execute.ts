import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { renderioApiRequest } from '../../shared/transport';

const LEGACY_ALIAS_PATTERN = /{{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/;
const LEGACY_ALIAS_PATTERN_GLOBAL = /{{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/g;
const CURRENT_ALIAS_PATTERN_GLOBAL = /<<\s*([A-Za-z][A-Za-z0-9_]*)\s*>>/g;
const MAX_COMMANDS = 10;
const MAX_METADATA_ENTRIES = 10;

interface MapValidationOptions {
	fieldDisplayName: string;
	keyDisplayName: string;
	valueDisplayName: string;
	keyPrefix: string;
	required: boolean;
}

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

function assertSupportedPlaceholderSyntax(
	context: IExecuteFunctions,
	command: string,
	fieldName: string,
	i: number,
): void {
	if ((context.getNode().typeVersion ?? 1) < 2) return;

	const match = command.match(LEGACY_ALIAS_PATTERN);
	if (!match) return;

	const alias = match[1];
	throw new NodeOperationError(
		context.getNode(),
		'Use <<alias>> placeholders in FFmpeg commands',
		{
			description: `Found "${match[0]}" in ${fieldName}. In node version 2, {{ ... }} is reserved for n8n expressions. Replace it with "<<${alias}>>".`,
			itemIndex: i,
		},
	);
}

/**
 * Build a validated key-value object from fixedCollection entries.
 */
function buildMapFromEntries(
	context: IExecuteFunctions,
	entries: IDataObject[],
	i: number,
	options: MapValidationOptions,
): Record<string, string> {
	if (options.required && entries.length === 0) {
		throwValidationError(
			context,
			`${options.fieldDisplayName} are required`,
			`Add at least one row in the "${options.fieldDisplayName}" field.`,
			i,
		);
	}

	const result: Record<string, string> = {};
	for (const [index, entry] of entries.entries()) {
		const rowNumber = index + 1;
		const key = asString(entry.key);
		const value = asString(entry.value);

		if (!key && !value && !options.required) {
			continue;
		}

		if (!key) {
			throwValidationError(
				context,
				`${options.keyDisplayName} is required`,
				`Set a ${options.keyDisplayName.toLowerCase()} for row ${rowNumber} in "${options.fieldDisplayName}".`,
				i,
			);
		}

		if (!key.startsWith(options.keyPrefix)) {
			throwValidationError(
				context,
				`${options.keyDisplayName} must start with "${options.keyPrefix}"`,
				`Row ${rowNumber} in "${options.fieldDisplayName}" uses "${key}". Rename it to start with "${options.keyPrefix}".`,
				i,
			);
		}

		if (!value) {
			throwValidationError(
				context,
				`${options.valueDisplayName} is required`,
				`Set a ${options.valueDisplayName.toLowerCase()} for "${key}" in "${options.fieldDisplayName}".`,
				i,
			);
		}

		if (result[key] !== undefined) {
			throwValidationError(
				context,
				`Duplicate ${options.keyDisplayName.toLowerCase()}: ${key}`,
				`Each ${options.keyDisplayName.toLowerCase()} in "${options.fieldDisplayName}" must be unique.`,
				i,
			);
		}

		result[key] = value;
	}

	if (options.required && Object.keys(result).length === 0) {
		throwValidationError(
			context,
			`${options.fieldDisplayName} are required`,
			`Add at least one complete row in the "${options.fieldDisplayName}" field.`,
			i,
		);
	}

	return result;
}

/**
 * Build the input_files or output_files object from a fixedCollection parameter.
 */
function buildFileMap(
	context: IExecuteFunctions,
	paramName: string,
	i: number,
	keyPrefix: 'in_' | 'out_',
	fieldDisplayName: string,
	keyDisplayName: string,
	valueDisplayName: string,
): Record<string, string> {
	const filesData = context.getNodeParameter(paramName, i, {}) as IDataObject;
	const fileEntries = (filesData.fileValues as IDataObject[] | undefined) ?? [];
	return buildMapFromEntries(context, fileEntries, i, {
		fieldDisplayName,
		keyDisplayName,
		valueDisplayName,
		keyPrefix,
		required: true,
	});
}

function buildMediaUrlMap(
	context: IExecuteFunctions,
	paramName: string,
	i: number,
): Record<string, string> {
	const urlsData = context.getNodeParameter(paramName, i, {}) as IDataObject;
	const urlEntries = (urlsData.urlValues as IDataObject[] | undefined) ?? [];
	return buildMapFromEntries(context, urlEntries, i, {
		fieldDisplayName: 'Media URLs',
		keyDisplayName: 'Downloaded media placeholder',
		valueDisplayName: 'URL',
		keyPrefix: 'in_',
		required: true,
	});
}

/**
 * Build the metadata object from the top-level metadata fixedCollection.
 */
function buildMetadataFromData(
	context: IExecuteFunctions,
	metadataData: IDataObject,
	i: number,
): Record<string, string> | undefined {
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

function getOptionalDataParameter(
	context: IExecuteFunctions,
	paramName: string,
	i: number,
): IDataObject {
	try {
		return context.getNodeParameter(paramName, i, {}) as IDataObject;
	} catch {
		return {};
	}
}

function buildMetadata(
	context: IExecuteFunctions,
	i: number,
): Record<string, string> | undefined {
	const commandOptions = getOptionalDataParameter(context, 'commandOptions', i);
	const metadataFromOptions = buildMetadataFromData(
		context,
		(commandOptions.metadata as IDataObject | undefined) ?? {},
		i,
	);
	if (metadataFromOptions) {
		return metadataFromOptions;
	}

	return buildMetadataFromData(
		context,
		getOptionalDataParameter(context, 'metadata', i),
		i,
	);
}

function assertNonEmptyCommand(
	context: IExecuteFunctions,
	command: string,
	fieldName: string,
	i: number,
): void {
	if (command.trim()) return;

	throwValidationError(
		context,
		`${fieldName} is required`,
		`Enter an FFmpeg command in "${fieldName}".`,
		i,
	);
}

function extractReferencedAliases(
	command: string,
	useCurrentSyntax: boolean,
): string[] {
	const pattern = useCurrentSyntax
		? CURRENT_ALIAS_PATTERN_GLOBAL
		: LEGACY_ALIAS_PATTERN_GLOBAL;
	pattern.lastIndex = 0;

	const aliases = new Set<string>();
	let match = pattern.exec(command);
	while (match) {
		aliases.add(match[1]);
		match = pattern.exec(command);
	}

	return [...aliases];
}

function assertKnownPlaceholders(
	context: IExecuteFunctions,
	command: string,
	fieldName: string,
	knownPlaceholders: Set<string>,
	i: number,
): void {
	const useCurrentSyntax = (context.getNode().typeVersion ?? 1) >= 2;
	const referencedAliases = extractReferencedAliases(command, useCurrentSyntax);
	const missingAliases = referencedAliases.filter(
		(alias) => !knownPlaceholders.has(alias),
	);
	if (missingAliases.length === 0) return;

	throwValidationError(
		context,
		'FFmpeg command references unknown placeholders',
		`"${fieldName}" references ${missingAliases.map((alias) => `"${alias}"`).join(', ')}, but no matching input, media URL, or output key was configured.`,
		i,
	);
}

function buildKnownPlaceholders(
	...maps: Array<Record<string, string>>
): Set<string> {
	return new Set(maps.flatMap((map) => Object.keys(map)));
}

/**
 * Build the common body fields shared between run and runChained operations.
 */
function buildCommonBody(context: IExecuteFunctions, i: number): IDataObject {
	const inputFiles = buildFileMap(
		context,
		'inputFiles',
		i,
		'in_',
		'Input Files',
		'Input placeholder',
		'URL',
	);
	const outputFiles = buildFileMap(
		context,
		'outputFiles',
		i,
		'out_',
		'Output Files',
		'Output placeholder',
		'Filename',
	);

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

function buildYtDlpBody(context: IExecuteFunctions, i: number): IDataObject {
	const body: IDataObject = {
		input_urls: buildMediaUrlMap(context, 'mediaUrls', i),
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
			responseData = (await renderioApiRequest.call(
				this,
				'GET',
				`/api/v1/commands/${commandId}`,
			)) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not retrieve command',
				description: `Check that the command ID '${commandId}' is correct and exists.`,
			});
		}
	} else if (operation === 'run') {
		const body = buildCommonBody(this, i);
		const ffmpegCommand = this.getNodeParameter('ffmpegCommand', i) as string;
		assertNonEmptyCommand(this, ffmpegCommand, 'FFmpeg Command', i);
		assertSupportedPlaceholderSyntax(this, ffmpegCommand, 'FFmpeg Command', i);
		assertKnownPlaceholders(
			this,
			ffmpegCommand,
			'FFmpeg Command',
			buildKnownPlaceholders(
				body.input_files as Record<string, string>,
				body.output_files as Record<string, string>,
			),
			i,
		);
		body.ffmpeg_command = ffmpegCommand;

		try {
			responseData = (await renderioApiRequest.call(
				this,
				'POST',
				'/api/v1/run-ffmpeg-command',
				body,
			)) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not run FFmpeg command',
				description:
					'Check that your input files are accessible URLs and the FFmpeg command syntax is valid.',
			});
		}
	} else if (operation === 'runChained') {
		const body = buildCommonBody(this, i);
		const commandsData = this.getNodeParameter(
			'ffmpegCommands',
			i,
			{},
		) as IDataObject;
		const commandEntries =
			(commandsData.commandValues as IDataObject[] | undefined) ?? [];

		if (commandEntries.length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one FFmpeg command is required',
				{
					description:
						'Add at least one command in the "FFmpeg Commands" field.',
					itemIndex: i,
				},
			);
		}

		if (commandEntries.length > MAX_COMMANDS) {
			throwValidationError(
				this,
				'Too many FFmpeg commands',
				`Add at most ${MAX_COMMANDS} commands in the "FFmpeg Commands" field.`,
				i,
			);
		}

		const ffmpegCommands = commandEntries.map((entry, index) => {
			const command = asString(entry.command);
			assertNonEmptyCommand(this, command, `FFmpeg Command ${index + 1}`, i);
			return command;
		});

		const knownPlaceholders = buildKnownPlaceholders(
			body.input_files as Record<string, string>,
			body.output_files as Record<string, string>,
		);
		for (const ffmpegCommand of ffmpegCommands) {
			assertSupportedPlaceholderSyntax(
				this,
				ffmpegCommand,
				'FFmpeg Commands',
				i,
			);
			assertKnownPlaceholders(
				this,
				ffmpegCommand,
				'FFmpeg Commands',
				knownPlaceholders,
				i,
			);
		}

		body.ffmpeg_commands = ffmpegCommands;

		try {
			responseData = (await renderioApiRequest.call(
				this,
				'POST',
				'/api/v1/run-chained-ffmpeg-commands',
				body,
			)) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not run chained FFmpeg commands',
				description:
					'Check that your input files are accessible URLs and the FFmpeg command syntax is valid.',
			});
		}
	} else if (operation === 'runMultiple') {
		const commandsData = this.getNodeParameter(
			'commands',
			i,
			{},
		) as IDataObject;
		const commandEntries =
			(commandsData.commandValues as IDataObject[] | undefined) ?? [];

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

		if (commandEntries.length > MAX_COMMANDS) {
			throwValidationError(
				this,
				'Too many commands',
				`Add at most ${MAX_COMMANDS} commands in the "Commands" field.`,
				i,
			);
		}

		const commands = commandEntries.map((entry, index) => {
			const ffmpegCommand = asString(entry.ffmpegCommand);
			assertNonEmptyCommand(this, ffmpegCommand, `Command ${index + 1}`, i);
			assertSupportedPlaceholderSyntax(this, ffmpegCommand, 'Commands', i);

			const inputFilesData = entry.inputFiles as IDataObject | undefined;
			const inputFileEntries =
				(inputFilesData?.fileValues as IDataObject[] | undefined) ?? [];
			const inputFiles = buildMapFromEntries(this, inputFileEntries, i, {
				fieldDisplayName: `Input Files for command ${index + 1}`,
				keyDisplayName: 'Input placeholder',
				valueDisplayName: 'URL',
				keyPrefix: 'in_',
				required: true,
			});

			const outputFilesData = entry.outputFiles as IDataObject | undefined;
			const outputFileEntries =
				(outputFilesData?.fileValues as IDataObject[] | undefined) ?? [];
			const outputFiles = buildMapFromEntries(this, outputFileEntries, i, {
				fieldDisplayName: `Output Files for command ${index + 1}`,
				keyDisplayName: 'Output placeholder',
				valueDisplayName: 'Filename',
				keyPrefix: 'out_',
				required: true,
			});

			assertKnownPlaceholders(
				this,
				ffmpegCommand,
				`Command ${index + 1}`,
				buildKnownPlaceholders(inputFiles, outputFiles),
				i,
			);

			return {
				input_files: inputFiles,
				output_files: outputFiles,
				ffmpeg_command: ffmpegCommand,
			};
		});

		try {
			responseData = (await renderioApiRequest.call(
				this,
				'POST',
				'/api/v1/run-multiple-ffmpeg-commands',
				{ commands } as IDataObject,
			)) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not run multiple FFmpeg commands',
				description:
					'Check that each command has valid input files and FFmpeg syntax.',
			});
		}
	} else if (operation === 'downloadMedia') {
		const body = buildYtDlpBody(this, i);
		const formatSelector = this.getNodeParameter(
			'formatSelector',
			i,
			'best',
		) as string;
		if (formatSelector !== 'best') {
			body.format_selector = formatSelector;
		}

		try {
			responseData = (await renderioApiRequest.call(
				this,
				'POST',
				'/api/v1/ytdlp-download',
				body,
			)) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not download media',
				description:
					'Check that your media URLs are accessible and supported by yt-dlp.',
			});
		}
	} else if (operation === 'downloadAndProcessMedia') {
		const body = buildYtDlpBody(this, i);
		body.output_files = buildFileMap(
			this,
			'outputFiles',
			i,
			'out_',
			'Output Files',
			'Output placeholder',
			'Filename',
		);
		const ffmpegCommand = this.getNodeParameter('ffmpegCommand', i) as string;
		assertNonEmptyCommand(this, ffmpegCommand, 'FFmpeg Command', i);
		assertSupportedPlaceholderSyntax(this, ffmpegCommand, 'FFmpeg Command', i);
		assertKnownPlaceholders(
			this,
			ffmpegCommand,
			'FFmpeg Command',
			buildKnownPlaceholders(
				body.input_urls as Record<string, string>,
				body.output_files as Record<string, string>,
			),
			i,
		);
		body.ffmpeg_command = ffmpegCommand;

		try {
			responseData = (await renderioApiRequest.call(
				this,
				'POST',
				'/api/v1/run-ytdlp-command',
				body,
			)) as IDataObject;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Could not download and process media',
				description:
					'Check that your media URLs are supported by yt-dlp and the FFmpeg command syntax is valid.',
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
