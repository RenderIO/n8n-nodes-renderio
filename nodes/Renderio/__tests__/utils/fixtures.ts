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
	file_id: 'file-550e8400-e29b-41d4-a716-446655440000',
	storage_url: 'https://renderio.dev/api/media/outputs/abc123/video.mp4',
	status: 'STORED',
	rendi_store_type: 'OUTPUT',
	is_deleted: false,
	original_file_url: null,
	size_mbytes: 1.0,
	duration: 30.0,
	file_type: 'video',
	file_format: 'mp4',
	codec: 'h264',
	pixel_format: 'yuv420p',
	mime_type: 'video/mp4',
	width: 1920,
	height: 1080,
	frame_rate: 30,
	bitrate_video_kb: 2500.0,
	bitrate_audio_kb: 128.0,
	sample_rate: 44100,
	channels: 2,
	error_status: null,
	error_message: null,
	created_at: '2025-01-01T00:00:00.000Z',
});

export const getFilesResult = () => ({
	files: [
		{
			file_id: 'file-001',
			storage_url: 'https://renderio.dev/api/media/outputs/abc123/video1.mp4',
			status: 'STORED',
			rendi_store_type: 'OUTPUT',
			is_deleted: false,
			original_file_url: null,
			size_mbytes: 1.0,
			duration: 60.0,
			file_type: 'video',
			file_format: 'mp4',
			codec: 'h264',
			pixel_format: 'yuv420p',
			mime_type: 'video/mp4',
			width: 1920,
			height: 1080,
			frame_rate: 30,
			bitrate_video_kb: 2500.0,
			bitrate_audio_kb: 128.0,
			sample_rate: 44100,
			channels: 2,
			error_status: null,
			error_message: null,
			created_at: '2025-01-01T00:00:00.000Z',
		},
		{
			file_id: 'file-002',
			storage_url: 'https://renderio.dev/api/media/outputs/abc123/audio1.mp3',
			status: 'STORED',
			rendi_store_type: 'STORED_FILE',
			is_deleted: false,
			original_file_url: 'https://example.com/audio1.mp3',
			size_mbytes: 0.5,
			duration: 120.0,
			file_type: 'audio',
			file_format: 'mp3',
			codec: 'mp3',
			pixel_format: null,
			mime_type: 'audio/mpeg',
			width: null,
			height: null,
			frame_rate: null,
			bitrate_video_kb: null,
			bitrate_audio_kb: 192.0,
			sample_rate: 44100,
			channels: 2,
			error_status: null,
			error_message: null,
			created_at: '2025-01-02T00:00:00.000Z',
		},
	],
});

export const storeFileResult = () => ({
	file_id: 'file-550e8400-e29b-41d4-a716-446655440003',
});

export const deleteFileResult = () => ({
	deleted: true,
	file_id: 'file-550e8400-e29b-41d4-a716-446655440000',
});

export const getPresetResult = () => ({
	preset_id: 'preset-550e8400-e29b-41d4-a716-446655440000',
	name: 'Transcode to H.264',
	description: 'Convert a video to H.264 codec with fast preset',
	is_system: false,
	command_type: 'FFMPEG_COMMAND',
	ffmpeg_command: '-i {{in_video}} -c:v libx264 -preset fast {{out_video}}',
	ffmpeg_commands: null,
	input_file_keys: ['in_video'],
	output_file_definitions: { out_video: 'output.mp4' },
	category: 'video-encoding',
	metadata: null,
	created_at: '2025-01-01T00:00:00.000Z',
	updated_at: '2025-01-01T00:00:00.000Z',
});

export const getPresetsResult = () => ({
	presets: [
		{
			preset_id: 'preset-001',
			name: 'Transcode to H.264',
			description: 'Convert a video to H.264 codec',
			is_system: false,
			command_type: 'FFMPEG_COMMAND',
			ffmpeg_command: '-i {{in_video}} -c:v libx264 {{out_video}}',
			ffmpeg_commands: null,
			input_file_keys: ['in_video'],
			output_file_definitions: { out_video: 'output.mp4' },
			category: 'video-encoding',
			metadata: null,
			created_at: '2025-01-01T00:00:00.000Z',
			updated_at: '2025-01-01T00:00:00.000Z',
		},
		{
			preset_id: 'preset-002',
			name: 'Extract Audio',
			description: 'Extract audio track from a video',
			is_system: true,
			command_type: 'FFMPEG_COMMAND',
			ffmpeg_command: '-i {{in_video}} -vn -c:a aac {{out_audio}}',
			ffmpeg_commands: null,
			input_file_keys: ['in_video'],
			output_file_definitions: { out_audio: 'audio.aac' },
			category: 'audio',
			metadata: null,
			created_at: '2025-01-02T00:00:00.000Z',
			updated_at: '2025-01-02T00:00:00.000Z',
		},
	],
});

export const executePresetResult = () => ({
	command_id: 'cmd-preset-exec-001',
});
