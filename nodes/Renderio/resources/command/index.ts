import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCommand = {
	resource: ['command'],
};

const showOnlyForRun = {
	operation: ['run'],
	resource: ['command'],
};

const showOnlyForRunChained = {
	operation: ['runChained'],
	resource: ['command'],
};

const showOnlyForRunMultiple = {
	operation: ['runMultiple'],
	resource: ['command'],
};

const showOnlyForGet = {
	operation: ['get'],
	resource: ['command'],
};

const showForRunOrChained = {
	operation: ['run', 'runChained'],
	resource: ['command'],
};

// Shared field definitions reused across run and runChained operations.

const inputFilesField: INodeProperties = {
	displayName: 'Input Files',
	name: 'inputFiles',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	placeholder: 'Add Input File',
	default: {},
	required: true,
	description: 'Input files for the FFmpeg command. Keys must start with "in_" and values must be URLs.',
	options: [
		{
			name: 'fileValues',
			displayName: 'Input File',
			values: [
				{
					displayName: 'Key',
					name: 'key',
					type: 'string',
					default: 'in_video',
					placeholder: 'e.g. in_video',
					description: 'The placeholder key used in the FFmpeg command (must start with "in_")',
				},
				{
					displayName: 'URL',
					name: 'value',
					type: 'string',
					default: '',
					placeholder: 'e.g. https://example.com/video.mp4',
					description: 'The URL of the input file',
				},
			],
		},
	],
};

const outputFilesField: INodeProperties = {
	displayName: 'Output Files',
	name: 'outputFiles',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	placeholder: 'Add Output File',
	default: {},
	required: true,
	description: 'Output files for the FFmpeg command. Keys must start with "out_" and values are filenames.',
	options: [
		{
			name: 'fileValues',
			displayName: 'Output File',
			values: [
				{
					displayName: 'Key',
					name: 'key',
					type: 'string',
					default: 'out_video',
					placeholder: 'e.g. out_video',
					description: 'The placeholder key used in the FFmpeg command (must start with "out_")',
				},
				{
					displayName: 'Filename',
					name: 'value',
					type: 'string',
					default: '',
					placeholder: 'e.g. output.mp4',
					description: 'The output filename',
				},
			],
		},
	],
};

export const commandOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: showOnlyForCommand,
	},
	options: [
		{
			name: 'Get',
			value: 'get',
			action: 'Get a command',
			description: 'Retrieve a command by ID to check its status and results',
		},
		{
			name: 'Run',
			value: 'run',
			action: 'Run command',
			description: 'Execute a single FFmpeg command with input and output files',
		},
		{
			name: 'Run Chained',
			value: 'runChained',
			action: 'Run chained commands',
			description: 'Execute multiple chained FFmpeg commands sequentially',
		},
		{
			name: 'Run Multiple',
			value: 'runMultiple',
			action: 'Run multiple commands',
			description: 'Execute multiple independent FFmpeg commands in one request',
		},
	],
	default: 'run',
};

export const commandFields: INodeProperties[] = [
	// ===========================================
	// Get Command fields
	// ===========================================
	{
		displayName: 'Command ID',
		name: 'commandId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 550e8400-e29b-41d4-a716-446655440000',
		description: 'The unique identifier of the command to retrieve',
		displayOptions: {
			show: showOnlyForGet,
		},
	},

	// ===========================================
	// Run FFmpeg Command fields
	// ===========================================
	{
		...inputFilesField,
		displayOptions: {
			show: showOnlyForRun,
		},
	},
	{
		...outputFilesField,
		displayOptions: {
			show: showOnlyForRun,
		},
	},
	{
		displayName: 'The FFmpeg command field does not support n8n expressions because RenderIO uses the same {{placeholder}} syntax. To use dynamic values, set expressions on the Input/Output File URL fields above instead.',
		name: 'ffmpegCommandNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: showOnlyForRun,
		},
	},
	{
		displayName: 'FFmpeg Command',
		name: 'ffmpegCommand',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		noDataExpression: true,
		required: true,
		default: '',
		placeholder: 'e.g. -i {{in_video}} -c:v libx264 {{out_video}}',
		description: 'The FFmpeg command to execute. Use {{in_key}} and {{out_key}} placeholders matching your input/output file keys.',
		displayOptions: {
			show: showOnlyForRun,
		},
	},

	// ===========================================
	// Run Chained FFmpeg Commands fields
	// ===========================================
	{
		...inputFilesField,
		displayOptions: {
			show: showOnlyForRunChained,
		},
	},
	{
		...outputFilesField,
		displayOptions: {
			show: showOnlyForRunChained,
		},
	},
	{
		displayName: 'The FFmpeg command fields do not support n8n expressions because RenderIO uses the same {{placeholder}} syntax. To use dynamic values, set expressions on the Input/Output File fields above instead.',
		name: 'ffmpegCommandsNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: showOnlyForRunChained,
		},
	},
	{
		displayName: 'FFmpeg Commands',
		name: 'ffmpegCommands',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add FFmpeg Command',
		required: true,
		default: {},
		description: 'A list of FFmpeg commands to execute sequentially (max 10)',
		displayOptions: {
			show: showOnlyForRunChained,
		},
		options: [
			{
				name: 'commandValues',
				displayName: 'Command',
				values: [
					{
						displayName: 'Command',
						name: 'command',
						type: 'string',
						typeOptions: {
							rows: 2,
						},
						noDataExpression: true,
						default: '',
						placeholder: 'e.g. -i {{in_video}} -c:v libx264 {{out_video}}',
						description: 'An FFmpeg command to execute. Use {{in_key}} and {{out_key}} placeholders matching your input/output file keys.',
					},
				],
			},
		],
	},

	// ===========================================
	// Shared options for Run and Run Chained
	// ===========================================
	{
		displayName: 'Metadata',
		name: 'metadata',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Metadata',
		default: {},
		description: 'Custom key-value metadata to attach to the command (max 10 entries)',
		displayOptions: {
			show: showForRunOrChained,
		},
		options: [
			{
				name: 'metadataValues',
				displayName: 'Metadata',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						description: 'The metadata key',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The metadata value',
					},
				],
			},
		],
	},

	// ===========================================
	// Run Multiple FFmpeg Commands fields
	// ===========================================
	{
		displayName: 'The FFmpeg command fields do not support n8n expressions because RenderIO uses the same {{placeholder}} syntax. To use dynamic values, set expressions on the Input/Output File fields within each command instead.',
		name: 'runMultipleNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: showOnlyForRunMultiple,
		},
	},
	{
		displayName: 'Commands',
		name: 'commands',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Command',
		required: true,
		default: {},
		description: 'A list of independent FFmpeg commands to execute (max 10)',
		displayOptions: {
			show: showOnlyForRunMultiple,
		},
		options: [
			{
				name: 'commandValues',
				displayName: 'Command',
				values: [
					{
						displayName: 'FFmpeg Command',
						name: 'ffmpegCommand',
						type: 'string',
						typeOptions: {
							rows: 2,
						},
						noDataExpression: true,
						required: true,
						default: '',
						placeholder: 'e.g. -i {{in_video}} -c:v libx264 {{out_video}}',
						description: 'The FFmpeg command to execute. Use {{in_key}} and {{out_key}} placeholders.',
					},
					{
						displayName: 'Input Files',
						name: 'inputFiles',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						placeholder: 'Add Input File',
						default: {},
						description: 'Input files for this command. Keys must start with "in_".',
						options: [
							{
								name: 'fileValues',
								displayName: 'Input File',
								values: [
									{
										displayName: 'Key',
										name: 'key',
										type: 'string',
										default: 'in_video',
										placeholder: 'e.g. in_video',
										description: 'Placeholder key used in the FFmpeg command (must start with "in_")',
									},
									{
										displayName: 'URL',
										name: 'value',
										type: 'string',
										default: '',
										placeholder: 'e.g. https://example.com/video.mp4',
										description: 'The URL of the input file',
									},
								],
							},
						],
					},
					{
						displayName: 'Output Files',
						name: 'outputFiles',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						placeholder: 'Add Output File',
						default: {},
						description: 'Output files for this command. Keys must start with "out_".',
						options: [
							{
								name: 'fileValues',
								displayName: 'Output File',
								values: [
									{
										displayName: 'Key',
										name: 'key',
										type: 'string',
										default: 'out_video',
										placeholder: 'e.g. out_video',
										description: 'Placeholder key used in the FFmpeg command (must start with "out_")',
									},
									{
										displayName: 'Filename',
										name: 'value',
										type: 'string',
										default: '',
										placeholder: 'e.g. output.mp4',
										description: 'The output filename',
									},
								],
							},
						],
					},
				],
			},
		],
	},
];
