import type {
	IExecuteFunctions,
	INodeExecutionData,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { renderioApiRequest } from '../../shared/transport';

export async function executeFileOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData;

	if (operation === 'get') {
		const fileId = this.getNodeParameter('fileId', i) as string;

		try {
			responseData = await renderioApiRequest.call(
				this,
				'GET',
				`/api/v1/files/${fileId}`,
			);
		} catch (e) {
			throw new NodeApiError(this.getNode(), e as JsonObject, {
				message: 'Could not retrieve file',
				description: `Check that the file ID '${fileId}' is correct and exists.`,
			});
		}
	} else if (operation === 'getMany') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		if (returnAll) {
			const allFiles: JsonObject[] = [];
			let offset = 0;
			const pageSize = 100;
			let hasMore = true;

			try {
				while (hasMore) {
					const response = await renderioApiRequest.call(
						this,
						'GET',
						'/api/v1/files',
						undefined,
						{ limit: pageSize, offset } as IDataObject,
					);

					const files = (response.files ?? []) as JsonObject[];
					allFiles.push(...files);

					if (files.length < pageSize) {
						hasMore = false;
					} else {
						offset += pageSize;
					}
				}
			} catch (e) {
				throw new NodeApiError(this.getNode(), e as JsonObject, {
					message: 'Could not retrieve files',
					description: 'Check your connection and try again.',
				});
			}

			return allFiles.map((file) => ({
				json: file,
				pairedItem: { item: i },
			}));
		} else {
			const limit = this.getNodeParameter('limit', i) as number;

			try {
				const response = await renderioApiRequest.call(
					this,
					'GET',
					'/api/v1/files',
					undefined,
					{ limit, offset: 0 } as IDataObject,
				);

				const files = (response.files ?? []) as JsonObject[];
				return files.map((file) => ({
					json: file,
					pairedItem: { item: i },
				}));
			} catch (e) {
				throw new NodeApiError(this.getNode(), e as JsonObject, {
					message: 'Could not retrieve files',
					description: 'Check your parameters and try again.',
				});
			}
		}
	} else if (operation === 'store') {
		const fileUrl = this.getNodeParameter('fileUrl', i) as string;

		try {
			responseData = await renderioApiRequest.call(
				this,
				'POST',
				'/api/v1/files/store-file',
				{ file_url: fileUrl } as IDataObject,
			);
		} catch (e) {
			throw new NodeApiError(this.getNode(), e as JsonObject, {
				message: 'Could not store file',
				description: 'Check that the file URL is accessible and valid.',
			});
		}
	} else if (operation === 'upload') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
		const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
		const dataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

		const authType = this.getNodeParameter('authentication', 0) as string;
		const credentialType = authType === 'oAuth2' ? 'renderioOAuth2Api' : 'renderioApi';
		let baseUrl: string;
		if (authType === 'oAuth2') {
			baseUrl = 'https://renderio.dev';
		} else {
			const credentials = await this.getCredentials('renderioApi');
			baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
		}

		try {
			const formData = new FormData();
			const blob = new Blob([new Uint8Array(dataBuffer)], { type: binaryData.mimeType });
			formData.append('file', blob, binaryData.fileName || 'file');

			responseData = await this.helpers.httpRequestWithAuthentication.call(
				this,
				credentialType,
				{
					method: 'POST',
					url: `${baseUrl}/api/v1/files/upload`,
					body: formData,
				},
			);
		} catch (e) {
			throw new NodeApiError(this.getNode(), e as JsonObject, {
				message: 'Could not upload file',
				description: 'Check that the binary data is valid and try again.',
			});
		}
	} else if (operation === 'delete') {
		const fileId = this.getNodeParameter('fileId', i) as string;

		try {
			responseData = await renderioApiRequest.call(
				this,
				'DELETE',
				`/api/v1/files/${fileId}`,
			);
		} catch (e) {
			throw new NodeApiError(this.getNode(), e as JsonObject, {
				message: 'Could not delete file',
				description: `Check that the file ID '${fileId}' is correct and exists.`,
			});
		}
	} else {
		throw new NodeOperationError(
			this.getNode(),
			`The operation "${operation}" is not supported for the file resource`,
			{ itemIndex: i },
		);
	}

	return [
		{
			json: responseData as JsonObject,
			pairedItem: { item: i },
		},
	];
}
