import nock from 'nock';
import { Renderio } from '../Renderio.node';
import { executeWorkflow } from './utils/executeWorkflow';
import { CredentialsHelper } from './utils/credentialHelper';
import { getRunTaskDataByNodeName, getTaskData, getTaskArrayData } from './utils/getNodeResultData';
import * as fixtures from './utils/fixtures';

import getCommandWorkflow from './workflows/commands/get-command.workflow.json';
import runCommandWorkflow from './workflows/commands/run-command.workflow.json';
import runChainedWorkflow from './workflows/commands/run-chained.workflow.json';
import runMultipleWorkflow from './workflows/commands/run-multiple.workflow.json';
import downloadMediaWorkflow from './workflows/commands/download-media.workflow.json';
import downloadAndProcessMediaWorkflow from './workflows/commands/download-and-process-media.workflow.json';
import getFileWorkflow from './workflows/files/get-file.workflow.json';
import getFilesWorkflow from './workflows/files/get-files.workflow.json';
import storeFileWorkflow from './workflows/files/store-file.workflow.json';
import deleteFileWorkflow from './workflows/files/delete-file.workflow.json';
import getPresetWorkflow from './workflows/presets/get-preset.workflow.json';
import getPresetsWorkflow from './workflows/presets/get-presets.workflow.json';
import executePresetWorkflow from './workflows/presets/execute-preset.workflow.json';

describe('Renderio Node', () => {
	let renderioNode: Renderio;
	let credentialsHelper: CredentialsHelper;

	beforeEach(() => {
		renderioNode = new Renderio();
		credentialsHelper = new CredentialsHelper({
			renderioApi: {
				apiKey: 'ffsk_test-api-key',
				baseUrl: 'https://renderio.dev',
			},
		});
	});

	afterEach(() => {
		nock.cleanAll();
	});

	describe('description', () => {
		it('should have correct name', () => {
			expect(renderioNode.description.name).toBe('renderio');
		});

		it('should have properties defined', () => {
			expect(renderioNode.description.properties).toBeDefined();
			expect(renderioNode.description.properties.length).toBeGreaterThan(0);
		});

		it('should have API key credential type defined', () => {
			expect(renderioNode.description.credentials).toBeDefined();
			expect(renderioNode.description.credentials).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ name: 'renderioApi' }),
				]),
			);
		});

		it('should be usable as a tool', () => {
			expect(renderioNode.description.usableAsTool).toBe(true);
		});
	});

	describe('commands', () => {
		it('should get a command by ID', async () => {
			const commandId = 'cmd-550e8400-e29b-41d4-a716-446655440000';
			const mockCommand = fixtures.getCommandResult();

			const scope = nock('https://renderio.dev')
				.get(`/api/v1/commands/${commandId}`)
				.reply(200, mockCommand);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: getCommandWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Get command');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');
			expect(getTaskData(nodeResult)).toEqual(mockCommand);
			expect(scope.isDone()).toBe(true);
		});

		it('should run a single FFmpeg command', async () => {
			const mockResult = fixtures.runCommandResult();

			const scope = nock('https://renderio.dev')
				.post('/api/v1/run-ffmpeg-command')
				.reply(200, mockResult);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: runCommandWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Run command');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');
			expect(getTaskData(nodeResult)).toEqual(mockResult);
			expect(scope.isDone()).toBe(true);
		});

		it('should run chained FFmpeg commands', async () => {
			const mockResult = fixtures.runChainedResult();

			const scope = nock('https://renderio.dev')
				.post('/api/v1/run-chained-ffmpeg-commands')
				.reply(200, mockResult);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: runChainedWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Run chained');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');
			expect(getTaskData(nodeResult)).toEqual(mockResult);
			expect(scope.isDone()).toBe(true);
		});

		it('should run multiple FFmpeg commands', async () => {
			const mockResult = fixtures.runMultipleResult();

			const scope = nock('https://renderio.dev')
				.post('/api/v1/run-multiple-ffmpeg-commands')
				.reply(200, mockResult);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: runMultipleWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Run multiple');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');
			expect(getTaskData(nodeResult)).toEqual(mockResult);
			expect(scope.isDone()).toBe(true);
		});

		it('should download media with yt-dlp', async () => {
			const mockResult = fixtures.ytdlpDownloadResult();

			const scope = nock('https://renderio.dev')
				.post('/api/v1/ytdlp-download', {
					input_urls: {
						in_1: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
						in_2: 'https://vm.tiktok.com/ZGdHeRRNL/',
					},
					metadata: { source: 'n8n' },
				})
				.reply(200, mockResult);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: downloadMediaWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Download media');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');
			expect(getTaskData(nodeResult)).toEqual(mockResult);
			expect(scope.isDone()).toBe(true);
		});

		it('should download and process media with yt-dlp and FFmpeg', async () => {
			const mockResult = fixtures.ytdlpCommandResult();

			const scope = nock('https://renderio.dev')
				.post('/api/v1/run-ytdlp-command', {
					input_urls: { in_1: 'https://www.instagram.com/reel/abc123/' },
					output_files: { out_1: 'clip.mp4' },
					ffmpeg_command: '-i {{in_1}} -t 10 -c copy {{out_1}}',
					metadata: { source: 'instagram' },
				})
				.reply(200, mockResult);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: downloadAndProcessMediaWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Download and process media');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');
			expect(getTaskData(nodeResult)).toEqual(mockResult);
			expect(scope.isDone()).toBe(true);
		});
	});

	describe('files', () => {
		it('should get a file by ID', async () => {
			const fileId = 'file-550e8400-e29b-41d4-a716-446655440000';
			const mockFile = fixtures.getFileResult();

			const scope = nock('https://renderio.dev')
				.get(`/api/v1/files/${fileId}`)
				.reply(200, mockFile);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: getFileWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Get file');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');
			expect(getTaskData(nodeResult)).toEqual(mockFile);
			expect(scope.isDone()).toBe(true);
		});

		it('should get many files', async () => {
			const mockFiles = fixtures.getFilesResult();

			const scope = nock('https://renderio.dev')
				.get('/api/v1/files')
				.query(true)
				.reply(200, mockFiles);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: getFilesWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Get files');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');

			const data = getTaskArrayData(nodeResult);
			expect(Array.isArray(data)).toBe(true);
			expect(data?.map((item: { json: any }) => item.json)).toEqual(mockFiles.files);
			expect(scope.isDone()).toBe(true);
		});

		it('should store a file from URL', async () => {
			const mockResult = fixtures.storeFileResult();

			const scope = nock('https://renderio.dev')
				.post('/api/v1/files/store-file')
				.reply(200, mockResult);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: storeFileWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Store file');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');
			expect(getTaskData(nodeResult)).toEqual(mockResult);
			expect(scope.isDone()).toBe(true);
		});

		it('should delete a file', async () => {
			const fileId = 'file-550e8400-e29b-41d4-a716-446655440000';
			const mockResult = fixtures.deleteFileResult();

			const scope = nock('https://renderio.dev')
				.delete(`/api/v1/files/${fileId}`)
				.reply(200, mockResult);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: deleteFileWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Delete file');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');
			expect(getTaskData(nodeResult)).toEqual(mockResult);
			expect(scope.isDone()).toBe(true);
		});
	});

	describe('presets', () => {
		it('should get a preset by ID', async () => {
			const presetId = 'preset-550e8400-e29b-41d4-a716-446655440000';
			const mockPreset = fixtures.getPresetResult();

			const scope = nock('https://renderio.dev')
				.get(`/api/v1/presets/${presetId}`)
				.reply(200, mockPreset);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: getPresetWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Get preset');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');
			expect(getTaskData(nodeResult)).toEqual(mockPreset);
			expect(scope.isDone()).toBe(true);
		});

		it('should get many presets', async () => {
			const mockPresets = fixtures.getPresetsResult();

			const scope = nock('https://renderio.dev')
				.get('/api/v1/presets')
				.query(true)
				.reply(200, mockPresets);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: getPresetsWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Get presets');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');

			const data = getTaskArrayData(nodeResult);
			expect(Array.isArray(data)).toBe(true);
			expect(data?.map((item: { json: any }) => item.json)).toEqual(mockPresets.presets);
			expect(scope.isDone()).toBe(true);
		});

		it('should execute a preset', async () => {
			const presetId = 'preset-550e8400-e29b-41d4-a716-446655440000';
			const mockResult = fixtures.executePresetResult();

			const scope = nock('https://renderio.dev')
				.post(`/api/v1/presets/${presetId}/execute`)
				.reply(200, mockResult);

			const { executionData } = await executeWorkflow({
				credentialsHelper,
				workflow: executePresetWorkflow,
			});

			const nodeResults = getRunTaskDataByNodeName(executionData, 'Execute preset');
			expect(nodeResults.length).toBe(1);
			const [nodeResult] = nodeResults;
			expect(nodeResult.executionStatus).toBe('success');
			expect(getTaskData(nodeResult)).toEqual(mockResult);
			expect(scope.isDone()).toBe(true);
		});
	});

	describe('api error handling', () => {
		it('should throw on 404 when getting a command', async () => {
			nock('https://renderio.dev')
				.get('/api/v1/commands/nonexistent')
				.reply(404, { error: 'Not found' });

			const workflow = {
				nodes: [
					{
						name: 'Get command',
						type: 'n8n-nodes-renderio.renderio',
						typeVersion: 1,
						parameters: {
							authentication: 'apiKey',
							resource: 'command',
							operation: 'get',
							commandId: 'nonexistent',
						},
					},
				],
			};

			await expect(
				executeWorkflow({ credentialsHelper, workflow }),
			).rejects.toThrow();
		});

		it('should throw on 500 server error', async () => {
			nock('https://renderio.dev')
				.post('/api/v1/run-ffmpeg-command')
				.reply(500, { error: 'Internal server error' });

			await expect(
				executeWorkflow({ credentialsHelper, workflow: runCommandWorkflow }),
			).rejects.toThrow();
		});
	});
});
