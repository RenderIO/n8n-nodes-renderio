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

const showOnlyForDownloadMedia = {
	operation: ['downloadMedia'],
	resource: ['command'],
};

const showOnlyForDownloadAndProcessMedia = {
	operation: ['downloadAndProcessMedia'],
	resource: ['command'],
};

const showOnlyForGet = {
	operation: ['get'],
	resource: ['command'],
};

const showForAsyncCommand = {
	operation: [
		'run',
		'runChained',
		'runMultiple',
		'downloadMedia',
		'downloadAndProcessMedia',
	],
	resource: ['command'],
};

const showForRunOrChained = {
	operation: ['run', 'runChained', 'downloadMedia', 'downloadAndProcessMedia'],
	resource: ['command'],
};

const showForRunOrDownloadAndProcessMedia = {
	operation: ['run', 'downloadAndProcessMedia'],
	resource: ['command'],
};

const showForVersion = (show: Record<string, string[]>, version: number) => ({
	...show,
	'@version': [version],
});

// Shared field definitions reused across run and runChained operations.

const inputFilesField: INodeProperties = {
	displayName: 'Input Files',
	name: 'inputFiles',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	placeholder: 'Add Input File',
	default: {
		fileValues: [
			{
				key: 'in_video',
				value: '',
			},
		],
	},
	required: true,
	description:
		'Source files for the FFmpeg command. Keys must start with "in_" and become placeholders, for example key "in_video" is used as "&lt;&lt;in_video&gt;&gt;". Values must be URLs.',
	options: [
		{
			name: 'fileValues',
			displayName: 'Input File',
			values: [
				{
					displayName: 'Input Placeholder',
					name: 'key',
					type: 'string',
					default: 'in_video',
					placeholder: 'e.g. in_video',
					description:
						'Placeholder key used in the FFmpeg command. Must start with "in_".',
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
	default: {
		fileValues: [
			{
				key: 'out_video',
				value: 'output.mp4',
			},
		],
	},
	required: true,
	description:
		'Output files created by the FFmpeg command. Keys must start with "out_" and become placeholders, for example key "out_video" is used as "&lt;&lt;out_video&gt;&gt;". Values are filenames.',
	options: [
		{
			name: 'fileValues',
			displayName: 'Output File',
			values: [
				{
					displayName: 'Output Placeholder',
					name: 'key',
					type: 'string',
					default: 'out_video',
					placeholder: 'e.g. out_video',
					description:
						'Placeholder key used in the FFmpeg command. Must start with "out_".',
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

const mediaUrlsField: INodeProperties = {
	displayName: 'Media URLs',
	name: 'mediaUrls',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	placeholder: 'Add Media URL',
	default: {
		urlValues: [
			{
				key: 'in_1',
				value: '',
			},
		],
	},
	required: true,
	description:
		'Media URLs to download with yt-dlp. Keys must start with "in_" and can be used as FFmpeg placeholders when processing, for example "&lt;&lt;in_1&gt;&gt;".',
	options: [
		{
			name: 'urlValues',
			displayName: 'Media URL',
			values: [
				{
					displayName: 'Downloaded Media Placeholder',
					name: 'key',
					type: 'string',
					default: 'in_1',
					placeholder: 'e.g. in_1',
					description:
						'The placeholder key for this downloaded media file (must start with "in_")',
				},
				{
					displayName: 'URL',
					name: 'value',
					type: 'string',
					default: '',
					placeholder: 'e.g. https://www.youtube.com/watch?v=...',
					description:
						'The media URL to download. YouTube, Instagram, TikTok, and other yt-dlp-supported sites may work.',
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
			name: 'Download and Process Media',
			value: 'downloadAndProcessMedia',
			action: 'Download and process media',
			description:
				'Download media with yt-dlp and process it with an FFmpeg command',
		},
		{
			name: 'Download Media',
			value: 'downloadMedia',
			action: 'Download media',
			description:
				'Download media from YouTube, Instagram, TikTok, and other yt-dlp-supported URLs',
		},
		{
			name: 'Run FFmpeg Command',
			value: 'run',
			action: 'Run ffmpeg command',
			description:
				'Execute a single FFmpeg command with input and output files',
		},
		{
			name: 'Run Chained FFmpeg Commands',
			value: 'runChained',
			action: 'Run chained ffmpeg commands',
			description: 'Execute multiple chained FFmpeg commands sequentially',
		},
		{
			name: 'Run Multiple FFmpeg Commands',
			value: 'runMultiple',
			action: 'Run multiple ffmpeg commands',
			description:
				'Execute multiple independent FFmpeg commands in one request',
		},
		{
			name: 'Get Command Status',
			value: 'get',
			action: 'Get command status',
			description: 'Retrieve a command by ID to check its status and results',
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
	{
		displayName:
			'This starts a background RenderIO job and returns a command_id. Use Custom FFmpeg Command > Get Command Status with that command_id to check completion and output files.',
		name: 'asyncCommandNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: showForAsyncCommand,
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
		displayName:
			'Legacy RenderIO placeholders use {{in_video}} and {{out_video}}. This field does not support n8n expressions. New workflows should use node version 2 with &lt;&lt;in_video&gt;&gt; placeholders.',
		name: 'ffmpegCommandLegacyNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: showForVersion(showForRunOrDownloadAndProcessMedia, 1),
		},
	},
	{
		displayName:
			'Example: add input key "in_video", output key "out_video", then use -i &lt;&lt;in_video&gt;&gt; -c:v libx264 &lt;&lt;out_video&gt;&gt;. The {{ ... }} syntax is for n8n expressions.',
		name: 'ffmpegCommandExpressionNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: showForVersion(showForRunOrDownloadAndProcessMedia, 2),
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
		description:
			'The FFmpeg command to execute. Use {{in_key}} and {{out_key}} placeholders matching your input/media URL and output file keys. This is the legacy syntax for existing workflows.',
		displayOptions: {
			show: showForVersion(showForRunOrDownloadAndProcessMedia, 1),
		},
	},
	{
		displayName: 'FFmpeg Command',
		name: 'ffmpegCommand',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		required: true,
		default: '',
		placeholder: 'e.g. -i <<in_video>> -c:v libx264 <<out_video>>',
		description:
			'The FFmpeg command to execute. Use &lt;&lt;in_key&gt;&gt; and &lt;&lt;out_key&gt;&gt; placeholders matching your input/media URL and output file keys. Use {{ ... }} only for n8n expressions.',
		displayOptions: {
			show: showForVersion(showForRunOrDownloadAndProcessMedia, 2),
		},
	},

	// ===========================================
	// Download Media fields
	// ===========================================
	{
		...mediaUrlsField,
		displayOptions: {
			show: showOnlyForDownloadMedia,
		},
	},
	{
		displayName: 'Format',
		name: 'formatSelector',
		type: 'options',
		default: 'best',
		description: 'Quality preset for the downloaded media',
		displayOptions: {
			show: showOnlyForDownloadMedia,
		},
		options: [
			{ name: 'Best', value: 'best', description: 'Highest available quality' },
			{ name: '2160p (4K)', value: '2160p', description: 'Max 4K resolution' },
			{ name: '1440p', value: '1440p', description: 'Max 1440p resolution' },
			{
				name: '1080p (Full HD)',
				value: '1080p',
				description: 'Max 1080p resolution',
			},
			{ name: '720p (HD)', value: '720p', description: 'Max 720p resolution' },
			{ name: '480p (SD)', value: '480p', description: 'Max 480p resolution' },
			{ name: '360p', value: '360p', description: 'Max 360p resolution' },
			{
				name: 'Audio Only',
				value: 'audio_only',
				description: 'Audio only, no video',
			},
			{
				name: 'Worst',
				value: 'worst',
				description: 'Lowest available quality',
			},
		],
	},

	// ===========================================
	// Download and Process Media fields
	// ===========================================
	{
		...mediaUrlsField,
		displayOptions: {
			show: showOnlyForDownloadAndProcessMedia,
		},
	},
	{
		...outputFilesField,
		displayOptions: {
			show: showOnlyForDownloadAndProcessMedia,
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
		displayName:
			'Legacy RenderIO placeholders use {{in_video}} and {{out_video}}. These fields do not support n8n expressions. New workflows should use node version 2 with &lt;&lt;in_video&gt;&gt; placeholders.',
		name: 'ffmpegCommandsLegacyNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: showForVersion(showOnlyForRunChained, 1),
		},
	},
	{
		displayName:
			'Example: add input key "in_video", output key "out_video", then use -i &lt;&lt;in_video&gt;&gt; -c:v libx264 &lt;&lt;out_video&gt;&gt;. The {{ ... }} syntax is for n8n expressions.',
		name: 'ffmpegCommandsExpressionNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: showForVersion(showOnlyForRunChained, 2),
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
		default: {
			commandValues: [
				{
					command: '',
				},
			],
		},
		description: 'A list of FFmpeg commands to execute sequentially (max 10)',
		displayOptions: {
			show: showForVersion(showOnlyForRunChained, 1),
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
						description:
							'An FFmpeg command to execute. Use {{in_key}} and {{out_key}} placeholders matching your input/output file keys. This is the legacy syntax for existing workflows.',
					},
				],
			},
		],
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
		default: {
			commandValues: [
				{
					command: '',
				},
			],
		},
		description: 'A list of FFmpeg commands to execute sequentially (max 10)',
		displayOptions: {
			show: showForVersion(showOnlyForRunChained, 2),
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
						default: '',
						placeholder: 'e.g. -i <<in_video>> -c:v libx264 <<out_video>>',
						description:
							'An FFmpeg command to execute. Use &lt;&lt;in_key&gt;&gt; and &lt;&lt;out_key&gt;&gt; for RenderIO placeholders. Use {{ ... }} only for n8n expressions.',
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
		description:
			'Custom key-value metadata to attach to the command (max 10 entries)',
		displayOptions: {
			show: showForVersion(showForRunOrChained, 1),
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
	{
		displayName: 'Options',
		name: 'commandOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showForVersion(showForRunOrChained, 2),
		},
		options: [
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Metadata',
				default: {},
				description:
					'Custom key-value metadata to attach to the command (max 10 entries)',
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
		],
	},

	// ===========================================
	// Run Multiple FFmpeg Commands fields
	// ===========================================
	{
		displayName:
			'Legacy RenderIO placeholders use {{in_video}} and {{out_video}}. These fields do not support n8n expressions. New workflows should use node version 2 with &lt;&lt;in_video&gt;&gt; placeholders.',
		name: 'runMultipleLegacyNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: showForVersion(showOnlyForRunMultiple, 1),
		},
	},
	{
		displayName:
			'Example: add input key "in_video", output key "out_video", then use -i &lt;&lt;in_video&gt;&gt; -c:v libx264 &lt;&lt;out_video&gt;&gt;. The {{ ... }} syntax is for n8n expressions.',
		name: 'runMultipleExpressionNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: showForVersion(showOnlyForRunMultiple, 2),
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
		default: {
			commandValues: [
				{
					ffmpegCommand: '',
					inputFiles: {
						fileValues: [
							{
								key: 'in_video',
								value: '',
							},
						],
					},
					outputFiles: {
						fileValues: [
							{
								key: 'out_video',
								value: 'output.mp4',
							},
						],
					},
				},
			],
		},
		description: 'A list of independent FFmpeg commands to execute (max 10)',
		displayOptions: {
			show: showForVersion(showOnlyForRunMultiple, 1),
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
						description:
							'The FFmpeg command to execute. Use {{in_key}} and {{out_key}} placeholders. This is the legacy syntax for existing workflows.',
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
						description:
							'Input files for this command. Keys must start with "in_".',
						options: [
							{
								name: 'fileValues',
								displayName: 'Input File',
								values: [
									{
										displayName: 'Input Placeholder',
										name: 'key',
										type: 'string',
										default: 'in_video',
										placeholder: 'e.g. in_video',
										description:
											'Placeholder key used in the FFmpeg command (must start with "in_")',
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
						description:
							'Output files for this command. Keys must start with "out_".',
						options: [
							{
								name: 'fileValues',
								displayName: 'Output File',
								values: [
									{
										displayName: 'Output Placeholder',
										name: 'key',
										type: 'string',
										default: 'out_video',
										placeholder: 'e.g. out_video',
										description:
											'Placeholder key used in the FFmpeg command (must start with "out_")',
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
	{
		displayName: 'Commands',
		name: 'commands',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Command',
		required: true,
		default: {
			commandValues: [
				{
					ffmpegCommand: '',
					inputFiles: {
						fileValues: [
							{
								key: 'in_video',
								value: '',
							},
						],
					},
					outputFiles: {
						fileValues: [
							{
								key: 'out_video',
								value: 'output.mp4',
							},
						],
					},
				},
			],
		},
		description: 'A list of independent FFmpeg commands to execute (max 10)',
		displayOptions: {
			show: showForVersion(showOnlyForRunMultiple, 2),
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
						required: true,
						default: '',
						placeholder: 'e.g. -i <<in_video>> -c:v libx264 <<out_video>>',
						description:
							'The FFmpeg command to execute. Use &lt;&lt;in_key&gt;&gt; and &lt;&lt;out_key&gt;&gt; for RenderIO placeholders. Use {{ ... }} only for n8n expressions.',
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
						description:
							'Input files for this command. Keys must start with "in_".',
						options: [
							{
								name: 'fileValues',
								displayName: 'Input File',
								values: [
									{
										displayName: 'Input Placeholder',
										name: 'key',
										type: 'string',
										default: 'in_video',
										placeholder: 'e.g. in_video',
										description:
											'Placeholder key used in the FFmpeg command (must start with "in_")',
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
						description:
							'Output files for this command. Keys must start with "out_".',
						options: [
							{
								name: 'fileValues',
								displayName: 'Output File',
								values: [
									{
										displayName: 'Output Placeholder',
										name: 'key',
										type: 'string',
										default: 'out_video',
										placeholder: 'e.g. out_video',
										description:
											'Placeholder key used in the FFmpeg command (must start with "out_")',
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
