import { config } from '@n8n/node-cli/eslint';

export default [
	{ ignores: ['nodes/Renderio/__tests__/**'] },
	...config,
	// package.json specific
	{
		files: ['package.json'],
		rules: {
			'n8n-nodes-base/community-package-json-name-still-default': 'off',
		},
	},

	// credentials specific
	{
		files: ['credentials/**/*.ts'],
		rules: {
			'n8n-nodes-base/cred-class-field-documentation-url-missing': 'off',
			'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
		},
	},

	// nodes specific
	{
		files: ['nodes/**/*.ts'],
		rules: {
			'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'off',
			'n8n-nodes-base/node-resource-description-filename-against-convention': 'off',
			'n8n-nodes-base/node-param-fixed-collection-type-unsorted-items': 'off',
			'n8n-nodes-base/node-param-default-wrong-for-options': 'off',
		},
	},
];
