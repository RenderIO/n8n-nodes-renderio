import {
	IExecuteFunctions,
	INodeExecutionData,
	IRun,
	ITaskData,
	IGetNodeParameterOptions,
} from 'n8n-workflow';
import { nodeTypes } from './nodeTypesClass';
import { CredentialsHelper } from './credentialHelper';
import https from 'https';
import http from 'http';
import { URL } from 'url';

export type ExecuteWorkflowArgs = {
	workflow: any;
	credentialsHelper: CredentialsHelper;
};

const makeHttpRequest = (options: any): Promise<any> => {
	return new Promise((resolve, reject) => {
		const url = new URL(options.url);
		const protocol = url.protocol === 'https:' ? https : http;

		if (options.params) {
			const queryString = new URLSearchParams(options.params).toString();
			if (queryString) {
				url.search = url.search ? `${url.search}&${queryString}` : `?${queryString}`;
			}
		}

		const reqOptions = {
			hostname: url.hostname,
			port: url.port,
			path: url.pathname + url.search,
			method: options.method || 'GET',
			headers: options.headers || {},
		};

		if (options.data && !reqOptions.headers['Content-Type']) {
			reqOptions.headers['Content-Type'] = 'application/json';
		}

		const req = protocol.request(reqOptions, (res) => {
			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				try {
					const parsedData = data ? JSON.parse(data) : {};

					if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
						resolve({
							data: parsedData,
							status: res.statusCode,
							headers: res.headers,
						});
					} else {
						const error: any = new Error(res.statusMessage || 'Request failed');
						error.response = {
							data: parsedData,
							status: res.statusCode,
							statusText: res.statusMessage,
						};
						reject(error);
					}
				} catch (_e) {
					if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
						resolve({
							data,
							status: res.statusCode,
							headers: res.headers,
						});
					} else {
						const error: any = new Error(res.statusMessage || 'Request failed');
						error.response = {
							data,
							status: res.statusCode,
							statusText: res.statusMessage,
						};
						reject(error);
					}
				}
			});
		});

		req.on('error', (error) => {
			reject(error);
		});

		if (options.data) {
			const body = typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
			req.write(body);
		}

		req.end();
	});
};

export const executeWorkflow = async ({
	credentialsHelper,
	workflow: workflowJson,
}: ExecuteWorkflowArgs): Promise<{ executionData: IRun }> => {
	const [node] = workflowJson.nodes;

	const fakeExecuteFunctions = {
		getCredentials: async (name: string) => {
			return credentialsHelper.getDecrypted({} as any, { name } as any, name, 'manual');
		},
		getNodeParameter: (
			parameterName: string,
			_itemIndex: number,
			fallbackValue?: any,
			options?: IGetNodeParameterOptions,
		) => {
			if (options?.extractValue) return node.parameters[parameterName].value;
			const value = node.parameters[parameterName];
			return value !== undefined ? value : fallbackValue;
		},
		getInputData: (): INodeExecutionData[] => {
			return [{ json: {} }];
		},
		continueOnFail: () => false,
		getNode: () => node,
		helpers: {
			httpRequestWithAuthentication: async function (
				this: IExecuteFunctions,
				_credentialType: string,
				options: any,
			) {
				const response = await makeHttpRequest({
					method: options.method || 'GET',
					url: options.url,
					params: options.qs,
					data: options.body,
					headers: options.headers,
				});

				return response.data;
			},
			returnJsonArray: (items: any[]) => {
				return items.map((i) => ({ json: i }));
			},
			constructExecutionMetaData: (inputData: any, _options: any) => {
				return inputData;
			},
		},
	} as unknown as IExecuteFunctions;

	const nodeType = nodeTypes.getByNameAndVersion(node.type, node.typeVersion);
	if (!('execute' in nodeType) || typeof nodeType.execute !== 'function') {
		throw new Error(`Node ${node.type} has no execute() method`);
	}
	const result = await (nodeType.execute as Function).call(fakeExecuteFunctions);

	const taskData = {
		startTime: Date.now(),
		executionTime: 1,
		executionIndex: 0,
		executionStatus: 'success',
		data: { main: result as any },
		source: [{ previousNode: '' }],
	} as ITaskData;

	const executionData = {
		mode: 'manual',
		status: 'success',
		data: {
			version: 1,
			resultData: {
				runData: {
					[node.name]: [taskData],
				},
			},
		},
		finished: true,
		startedAt: new Date(),
		stoppedAt: new Date(),
	} as unknown as IRun;

	return { executionData };
};
