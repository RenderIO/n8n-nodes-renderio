import { ICredentialDataDecryptedObject } from 'n8n-workflow';

export class CredentialsHelper {
	private credentials: Record<string, ICredentialDataDecryptedObject>;

	constructor(credentials: Record<string, ICredentialDataDecryptedObject>) {
		this.credentials = credentials;
	}

	async getDecrypted(
		_additionalData: any,
		_nodeCredentials: any,
		type: string,
		_mode: any,
	): Promise<ICredentialDataDecryptedObject> {
		return this.credentials[type];
	}
}
