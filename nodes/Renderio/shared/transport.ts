import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';

/**
 * Make an authenticated API request to the RenderIO API.
 *
 * Supports both API Key and OAuth2 authentication.
 * Uses `httpRequestWithAuthentication` so that credentials are injected automatically.
 */
export async function renderioApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject> {
	const authType = this.getNodeParameter('authentication', 0) as string;
	const credentialType = authType === 'oAuth2' ? 'renderioOAuth2Api' : 'renderioApi';

	let baseUrl: string;
	if (authType === 'oAuth2') {
		baseUrl = 'https://renderio.dev';
	} else {
		const credentials = await this.getCredentials('renderioApi');
		baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
	}

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${endpoint}`,
		json: true,
	};

	if (qs && Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	return await this.helpers.httpRequestWithAuthentication.call(
		this,
		credentialType,
		options,
	);
}
