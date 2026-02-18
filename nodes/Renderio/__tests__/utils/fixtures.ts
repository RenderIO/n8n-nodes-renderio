export const getCommandResult = () => ({
	id: 'cmd-550e8400-e29b-41d4-a716-446655440000',
	status: 'completed',
	ffmpeg_command: '-i {{in_video}} -c:v libx264 {{out_video}}',
	input_files: { in_video: 'https://example.com/input.mp4' },
	output_files: { out_video: 'output.mp4' },
	created_at: '2025-01-01T00:00:00.000Z',
	completed_at: '2025-01-01T00:01:00.000Z',
});

export const runCommandResult = () => ({
	command_id: 'cmd-550e8400-e29b-41d4-a716-446655440001',
	status: 'processing',
	ffmpeg_command: '-i {{in_video}} -c:v libx264 {{out_video}}',
	input_files: { in_video: 'https://example.com/input.mp4' },
	output_files: { out_video: 'output.mp4' },
	created_at: '2025-01-01T00:00:00.000Z',
});

export const runChainedResult = () => ({
	command_id: 'cmd-550e8400-e29b-41d4-a716-446655440002',
	status: 'processing',
	ffmpeg_commands: [
		'-i {{in_video}} -vf scale=1280:720 {{out_video}}',
		'-i {{out_video}} -c:v libx265 {{out_final}}',
	],
	input_files: { in_video: 'https://example.com/input.mp4' },
	output_files: { out_video: 'intermediate.mp4', out_final: 'final.mp4' },
	created_at: '2025-01-01T00:00:00.000Z',
});

export const runMultipleResult = () => ({
	commands: [
		{
			command_id: 'cmd-multi-001',
			status: 'processing',
			ffmpeg_command: '-i {{in_video}} -c:v libx264 {{out_video}}',
		},
		{
			command_id: 'cmd-multi-002',
			status: 'processing',
			ffmpeg_command: '-i {{in_audio}} -c:a aac {{out_audio}}',
		},
	],
});

export const getFileResult = () => ({
	id: 'file-550e8400-e29b-41d4-a716-446655440000',
	filename: 'video.mp4',
	size: 1048576,
	content_type: 'video/mp4',
	url: 'https://renderio.dev/files/video.mp4',
	created_at: '2025-01-01T00:00:00.000Z',
});

export const getFilesResult = () => ({
	files: [
		{
			id: 'file-001',
			filename: 'video1.mp4',
			size: 1048576,
			content_type: 'video/mp4',
			created_at: '2025-01-01T00:00:00.000Z',
		},
		{
			id: 'file-002',
			filename: 'audio1.mp3',
			size: 524288,
			content_type: 'audio/mpeg',
			created_at: '2025-01-02T00:00:00.000Z',
		},
	],
});

export const storeFileResult = () => ({
	id: 'file-550e8400-e29b-41d4-a716-446655440003',
	filename: 'stored-video.mp4',
	size: 2097152,
	content_type: 'video/mp4',
	url: 'https://renderio.dev/files/stored-video.mp4',
	created_at: '2025-01-01T00:00:00.000Z',
});

export const deleteFileResult = () => ({
	success: true,
});

export const getPresetResult = () => ({
	id: 'preset-550e8400-e29b-41d4-a716-446655440000',
	name: 'Transcode to H.264',
	ffmpeg_command: '-i {{in_video}} -c:v libx264 -preset fast {{out_video}}',
	input_file_keys: ['in_video'],
	output_file_keys: ['out_video'],
	created_at: '2025-01-01T00:00:00.000Z',
});

export const getPresetsResult = () => ({
	data: [
		{
			id: 'preset-001',
			name: 'Transcode to H.264',
			created_at: '2025-01-01T00:00:00.000Z',
		},
		{
			id: 'preset-002',
			name: 'Extract Audio',
			created_at: '2025-01-02T00:00:00.000Z',
		},
	],
});

export const executePresetResult = () => ({
	command_id: 'cmd-preset-exec-001',
	status: 'processing',
	preset_id: 'preset-550e8400-e29b-41d4-a716-446655440000',
	input_files: { in_video: 'https://example.com/input.mp4' },
	created_at: '2025-01-01T00:00:00.000Z',
});
