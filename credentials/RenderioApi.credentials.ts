import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RenderioApi implements ICredentialType {
	name = 'renderioApi';

	displayName = 'RenderIO API';

	icon: Icon = { light: 'file:../icons/renderio.svg', dark: 'file:../icons/renderio.dark.svg' };

	documentationUrl = 'https://renderio.dev/docs';

	httpRequestNode = {
		name: 'RenderIO',
		docsUrl: 'https://renderio.dev/docs',
		apiBaseUrl: 'https://renderio.dev/',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'e.g. ffsk_abc123...',
			description: 'Your RenderIO API key. Starts with ffsk_.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://renderio.dev',
			description: 'The base URL of the RenderIO API',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-KEY': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v1/commands',
			method: 'GET',
			qs: {
				limit: '1',
			},
		},
	};
}
