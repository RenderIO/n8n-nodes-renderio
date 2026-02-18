import type { ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

const scopes = [
	'openid',
	'profile',
	'email',
	'read:commands',
	'write:commands',
	'read:files',
	'write:files',
	'read:presets',
	'write:presets',
];

export class RenderioOAuth2Api implements ICredentialType {
	name = 'renderioOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'RenderIO OAuth2 API';

	icon: Icon = { light: 'file:../icons/renderio.svg', dark: 'file:../icons/renderio.dark.svg' };

	documentationUrl = 'https://renderio.dev/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'pkce',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://renderio.dev/api/auth/oauth2/authorize',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://renderio.dev/api/auth/oauth2/token',
		},
		{
			displayName: 'Scope (do not change)',
			name: 'scope',
			type: 'string',
			default: `${scopes.join(' ')}`,
			noDataExpression: true,
			displayOptions: {
				hideOnCloud: true,
			},
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'hidden',
			default: '',
			typeOptions: { password: true },
		},
		{
			displayName:
				'This credential type is not available on self hosted n8n instances, please use an API key instead.',
			name: 'notice',
			type: 'notice',
			default: '',
			displayOptions: {
				hideOnCloud: true,
			},
		},
	];
}
