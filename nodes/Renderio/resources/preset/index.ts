import type { INodeProperties } from 'n8n-workflow';

const showOnlyForPreset = {
	resource: ['preset'],
};

const showOnlyForExecute = {
	resource: ['preset'],
	operation: ['execute'],
};

const showOnlyForGet = {
	resource: ['preset'],
	operation: ['get'],
};

const showOnlyForGetMany = {
	resource: ['preset'],
	operation: ['getMany'],
};

const metadataField: INodeProperties = {
	displayName: 'Metadata',
	name: 'metadata',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	placeholder: 'Add Metadata',
	default: {},
	description: 'Custom key-value metadata to attach (max 10 entries)',
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
};

export const presetOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: showOnlyForPreset,
	},
	options: [
		{
			name: 'Execute',
			value: 'execute',
			action: 'Execute a preset',
			description: 'Run a preset with provided input files',
		},
		{
			name: 'Get',
			value: 'get',
			action: 'Get a preset',
			description: 'Retrieve a single preset by ID',
		},
		{
			name: 'Get Many',
			value: 'getMany',
			action: 'Get many presets',
			description: 'Retrieve a list of presets',
		},
	],
	default: 'execute',
};

export const presetFields: INodeProperties[] = [
	// ===========================================
	// Execute Preset fields
	// ===========================================
	{
		displayName: 'Preset',
		name: 'presetId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list', value: '' },
		description: 'The preset to execute',
		displayOptions: {
			show: showOnlyForExecute,
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchPresets',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				hint: 'Enter a preset ID',
				placeholder: 'e.g. 550e8400-e29b-41d4-a716-446655440000',
			},
		],
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
		required: true,
		description: 'Input files for execution. Keys must match the preset\'s input_file_keys.',
		displayOptions: {
			show: showOnlyForExecute,
		},
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
						description: 'The input file key (must match a key defined in the preset)',
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
		displayName: 'Options',
		name: 'executeOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForExecute,
		},
		options: [
			{
				...metadataField,
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				placeholder: 'e.g. https://example.com/webhook',
				description: 'URL to receive a webhook notification when the execution completes',
			},
		],
	},

	// ===========================================
	// Get Preset fields
	// ===========================================
	{
		displayName: 'Preset',
		name: 'presetId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list', value: '' },
		description: 'The preset to retrieve',
		displayOptions: {
			show: showOnlyForGet,
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchPresets',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				hint: 'Enter a preset ID',
				placeholder: 'e.g. 550e8400-e29b-41d4-a716-446655440000',
			},
		],
	},

	// ===========================================
	// Get Many Presets fields
	// ===========================================
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: showOnlyForGetMany,
		},
	},
	{
		displayName: 'Options',
		name: 'getManyOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForGetMany,
		},
		options: [
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description: 'Number of results to skip for pagination',
			},
		],
	},
];
