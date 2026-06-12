# n8n Nodes - RenderIO integration

This is an n8n community node that integrates [RenderIO](https://renderio.dev) with your n8n workflows, so you can run FFmpeg commands in the cloud, download web media with yt-dlp, manage media files, and automate video/audio processing tasks.

[RenderIO](https://renderio.dev) is an FFmpeg-as-a-Service cloud API that lets you submit FFmpeg commands via API, get results stored in the cloud, and integrate media processing into your automation workflows, while [n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) tool for AI workflow automation that allows you to connect various services.

## Table of contents

- [Installation on self hosted instance](#installation-self-hosted)
- [Installation on n8n cloud](#installation-n8n-cloud)
- [Installation for development and contributing](#installation-development-and-contributing)
- [Operations](#operations)
- [Credentials](#credentials)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [Placeholder syntax](#placeholder-syntax)
- [Resources](#resources)
- [Release](#releasing-a-new-version)
- [Version History](#version-history)
- [Troubleshooting](#troubleshooting)

## Installation (self-hosted)

To install the RenderIO community node directly from the n8n Editor UI:

1. Open your n8n instance.
2. Go to **Settings > Community Nodes**
3. Select **Install**.
4. Enter the npm package name: `n8n-nodes-renderio` to install the latest version. To install a specific version (e.g 0.1.0) enter `n8n-nodes-renderio@0.1.0`. All versions are available [here](https://www.npmjs.com/package/n8n-nodes-renderio?activeTab=versions)
5. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes and select **Install**
6. The node is now available to use in your workflows.

## Installation (n8n Cloud)

If you're using n8n Cloud, installing community nodes is even simpler:

1. Go to the **Canvas** and open the **nodes panel**.
2. Search for **RenderIO** in the community node registry.
3. Click **Install node** to add the RenderIO node to your instance.

> On n8n cloud users can choose not to show verified community nodes. Instance owners can toggle this in the Cloud Admin Panel. To install the RenderIO node, make sure the installation of verified community nodes is enabled.

## Installation (development and contributing)

### Prerequisites

- **Node.js**: 22.x or higher (required)
- **npm**: 10.8.2 or higher (required)

Verify your versions:

```bash
node --version  # Should be v22.x.x or higher
npm --version   # Should be 10.8.2 or higher
```

If you use `nvm`, the project includes a `.nvmrc` file. Simply run:

```bash
nvm use
```

### 1. Clone and Install Dependencies

Clone the repository and install dependencies:

```bash
git clone https://github.com/RenderIO/n8n-nodes-renderio.git
cd n8n-nodes-renderio
npm install
```

### 2. Build the Node Package

```bash
npm run build
```

### 3. Start Development Server

Start the n8n development server with your node linked:

```bash
npm run dev
```

---

### Making changes

If you make any changes to your custom node locally, remember to rebuild and restart:

```bash
npm run build
```

---

## Operations

This node supports a wide range of RenderIO operations, organized by resource type in the n8n UI:

### Preset Workflow

- **Execute Preset**: Run a preset with input files
  - Use predefined FFmpeg command templates
  - Pass different input files to reusable presets
  - Searchable preset list via dynamic dropdown
  - Returns a `command_id` for status checks
- **Get Preset**: Retrieve a preset by ID
  - View preset configuration and FFmpeg command template
- **List Presets**: Browse available presets

### Custom FFmpeg Command

- **Download and Process Media**: Download media with yt-dlp and process it with FFmpeg
  - Use downloaded media as `<<in_key>>` placeholders in an FFmpeg command
  - Create transformed outputs such as clips, GIFs, resized videos, or extracted audio
- **Download Media**: Download media with yt-dlp
  - Supports YouTube, Instagram, TikTok, and other yt-dlp-supported URLs
  - Stores downloaded media as RenderIO output files
- **Run FFmpeg Command**: Execute a single FFmpeg command
  - Provide FFmpeg arguments and input files
  - Configurable output format and options
  - Background processing with status polling
- **Run Chained FFmpeg Commands**: Execute multiple sequential FFmpeg commands
  - Chain commands where output of one feeds into the next
  - Useful for multi-step media processing pipelines
- **Run Multiple FFmpeg Commands**: Execute multiple independent FFmpeg commands in parallel
  - Process multiple files simultaneously
  - Each command runs independently
- **Get Command Status**: Retrieve a command by ID
  - Check processing status (queued, processing, completed, failed)
  - Access output file references and metadata

### RenderIO File Storage

- **Store From URL**: Store a file from a URL into RenderIO
  - Import media from any publicly accessible URL
  - File is stored in RenderIO's cloud storage for processing
- **Upload Binary File**: Upload a binary file
  - Upload files directly from your n8n workflow
  - Supports any media format compatible with FFmpeg
- **Get**: Retrieve a file by ID
  - Access file metadata and download URLs
- **Get Many**: List files
  - Browse your stored files
  - Pagination support
- **Delete**: Delete a file
  - Remove files from cloud storage

### AI Tools

All RenderIO node operations can be combined with n8n's AI tools to create powerful workflows.
For example, you can process media files using FFmpeg commands and then use an AI model to analyze, transcribe, or classify the output.

## Credentials

To authenticate with RenderIO:

1. Sign up or log in at [RenderIO](https://renderio.dev)
2. Navigate to the **Dashboard** and open the **API Keys** section
3. Generate a new API key. Keys start with `ffsk_`
4. In n8n, create a new **RenderIO API** credential
5. Paste the key into the **API Key** field

For more details, see the [authentication documentation](https://renderio.dev/docs/getting-started/authentication).

## Compatibility

- **n8n**: Version 1.60.0 and higher
- **Node.js**: 22.x or higher
- **npm**: 10.8.2 or higher
- **RenderIO node v1 workflows**: Existing saved workflows keep using legacy `{{alias}}` RenderIO placeholders, with n8n expressions disabled in FFmpeg command fields
- **RenderIO node v2 workflows**: New workflows use `<<alias>>` RenderIO placeholders, allowing `{{ ... }}` to be used for n8n expressions in FFmpeg command fields

## Usage

1. **Run a preset first**: Use **Preset Workflow > Execute Preset**, choose a preset, and add the requested input file URLs.
2. **Use a custom command when needed**: Use **Custom FFmpeg Command > Run FFmpeg Command** for raw FFmpeg, or **Custom FFmpeg Command > Download and Process Media** to download and transform web media in one job.
3. **Check status**: Use **Custom FFmpeg Command > Get Command Status** with the returned `command_id`.
4. **Retrieve results**: Use **RenderIO File Storage > Get** to access an output file by ID or from the searchable file list.
5. **Store or upload reusable media**: Use **RenderIO File Storage > Store From URL** or **Upload Binary File**.

For repeated operations, create a **Preset** with your FFmpeg command template, then use **Preset Workflow > Execute Preset** to run it with different input files.

Common fields returned by the node:

- `command_id`: Use this with **Get Command Status**.
- `status`: Current job or file status.
- `file_id`: Use this with **RenderIO File Storage > Get**.
- `storage_url`: Direct URL for a stored or output file when available.

## Placeholder syntax

RenderIO command fields support two syntax modes through n8n node versioning:

- **Version 1 (legacy)**: Use `{{in_video}}` and `{{out_video}}`. n8n expressions are intentionally disabled in FFmpeg command fields to avoid conflicts with RenderIO placeholders. Existing production workflows stay on this version.
- **Version 2 (current)**: Use `<<in_video>>` and `<<out_video>>` for RenderIO placeholders. The `{{ ... }}` syntax is available for n8n expressions.

Version 2 example:

```text
-i <<in_video>> -metadata title="{{ $json.title }}" -c:v libx264 <<out_video>>
```

If a version 2 command still contains a raw legacy placeholder such as `{{in_video}}`, the node rejects it and asks you to replace it with `<<in_video>>`.

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [RenderIO API Documentation](https://renderio.dev/docs)
- [RenderIO Authentication Documentation](https://renderio.dev/docs/getting-started/authentication)

## Version history

Track changes and updates to the node here.

## Troubleshooting

### Common issues

1. **Authentication errors**
   - Verify your API key is correct and starts with `ffsk_`
   - Check that your RenderIO account is active

2. **Command failures**
   - Verify the FFmpeg arguments are valid
   - Check that input files exist and are accessible
   - In node version 2, use `<<alias>>` for RenderIO placeholders and reserve `{{ ... }}` for n8n expressions
   - Review the command status via **Custom FFmpeg Command > Get Command Status** for detailed error messages

3. **File upload issues**
   - Ensure the file URL is publicly accessible (for Store operations)
   - Verify the file format is supported by FFmpeg
   - Check file size limits on your RenderIO plan

4. **Operation timeouts**
   - FFmpeg processing runs in the background; use **Custom FFmpeg Command > Get Command Status** to poll for completion
   - Large files or complex operations may take longer to process

### Getting help

If you encounter issues:

1. Check the [RenderIO API Documentation](https://renderio.dev/docs)
2. Review the [n8n Community Nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
3. Open an issue in the [GitHub repository](https://github.com/RenderIO/n8n-nodes-renderio)
