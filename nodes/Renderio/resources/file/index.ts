import type { INodeProperties } from 'n8n-workflow';

const showOnlyForFile = {
	resource: ['file'],
};

const showOnlyForFileGet = {
	resource: ['file'],
	operation: ['get'],
};

const showOnlyForFileGetMany = {
	resource: ['file'],
	operation: ['getMany'],
};

const showOnlyForFileStore = {
	resource: ['file'],
	operation: ['store'],
};

const showOnlyForFileUpload = {
	resource: ['file'],
	operation: ['upload'],
};

const showOnlyForFileDelete = {
	resource: ['file'],
	operation: ['delete'],
};

export const fileOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: showOnlyForFile,
	},
	options: [
		{
			name: 'Delete',
			value: 'delete',
			action: 'Delete a file',
			description: 'Delete a file permanently',
		},
		{
			name: 'Get',
			value: 'get',
			action: 'Retrieve a file',
			description: 'Retrieve a single file by ID',
		},
		{
			name: 'Get Many',
			value: 'getMany',
			action: 'Retrieve a list of files',
			description: 'Retrieve a list of files',
		},
		{
			name: 'Store',
			value: 'store',
			action: 'Store a file from URL',
			description: 'Store a file from a URL into RenderIO storage',
		},
		{
			name: 'Upload',
			value: 'upload',
			action: 'Upload a file',
			description: 'Upload a binary file directly to RenderIO storage',
		},
	],
	default: 'get',
};

export const fileFields: INodeProperties[] = [
	// ----------------------------------
	//         file: get
	// ----------------------------------
	{
		displayName: 'File ID',
		name: 'fileId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 550e8400-e29b-41d4-a716-446655440000',
		description: 'The unique identifier of the file to retrieve',
		displayOptions: {
			show: showOnlyForFileGet,
		},
	},

	// ----------------------------------
	//         file: getMany
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: showOnlyForFileGetMany,
		},
	},
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
			show: {
				...showOnlyForFileGetMany,
				returnAll: [false],
			},
		},
	},

	// ----------------------------------
	//         file: store
	// ----------------------------------
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. https://example.com/video.mp4',
		description: 'The URL of the file to store in RenderIO storage',
		displayOptions: {
			show: showOnlyForFileStore,
		},
	},

	// ----------------------------------
	//         file: upload
	// ----------------------------------
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		hint: 'The name of the input binary field containing the file to upload',
		description: 'The name of the binary property which contains the file data to upload',
		displayOptions: {
			show: showOnlyForFileUpload,
		},
	},

	// ----------------------------------
	//         file: delete
	// ----------------------------------
	{
		displayName: 'File ID',
		name: 'fileId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 550e8400-e29b-41d4-a716-446655440000',
		description: 'The unique identifier of the file to delete',
		displayOptions: {
			show: showOnlyForFileDelete,
		},
	},
];
