# n8n Nodes - RenderIO integration

This is an n8n community node that integrates [RenderIO](https://renderio.dev) with your n8n workflows, so you can run FFmpeg commands in the cloud, manage media files, and automate video/audio processing tasks.

[RenderIO](https://renderio.dev) is an FFmpeg-as-a-Service cloud API that lets you submit FFmpeg commands via API, get results stored in the cloud, and integrate media processing into your automation workflows, while [n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) tool for AI workflow automation that allows you to connect various services.

## Table of contents

- [Installation on self hosted instance](#installation-self-hosted)
- [Installation on n8n cloud](#installation-n8n-cloud)
- [Installation for development and contributing](#installation-development-and-contributing)
- [Operations](#operations)
- [Credentials](#credentials)
- [Compatibility](#compatibility)
- [Usage](#usage)
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

This node supports a wide range of RenderIO operations, organized by resource type:

### Command

- **Run**: Execute a single FFmpeg command
  - Provide FFmpeg arguments and input files
  - Configurable output format and options
  - Background processing with status polling
- **Run Chained**: Execute multiple sequential FFmpeg commands
  - Chain commands where output of one feeds into the next
  - Useful for multi-step media processing pipelines
- **Run Multiple**: Execute multiple independent FFmpeg commands in parallel
  - Process multiple files simultaneously
  - Each command runs independently
- **Get**: Retrieve a command by ID
  - Check processing status (queued, processing, completed, failed)
  - Access output file references and metadata

### File

- **Store**: Store a file from a URL into RenderIO
  - Import media from any publicly accessible URL
  - File is stored in RenderIO's cloud storage for processing
- **Upload**: Upload a binary file
  - Upload files directly from your n8n workflow
  - Supports any media format compatible with FFmpeg
- **Get**: Retrieve a file by ID
  - Access file metadata and download URLs
- **Get Many**: List files
  - Browse your stored files
  - Pagination support
- **Delete**: Delete a file
  - Remove files from cloud storage

### Preset

- **Execute**: Run a preset with input files
  - Use predefined FFmpeg command templates
  - Pass different input files to reusable presets
  - Searchable preset list via dynamic dropdown
- **Get**: Retrieve a preset by ID
  - View preset configuration and FFmpeg command template
- **Get Many**: List presets
  - Browse available presets

### AI Tools

All RenderIO node operations can be combined with n8n's AI tools to create powerful workflows.
For example, you can process media files using FFmpeg commands and then use an AI model to analyze, transcribe, or classify the output.

## Credentials

The node supports two authentication methods:

1. **OAuth2 authentication** (Recommended)
   - Sign up or log in at [RenderIO](https://renderio.dev)
   - Navigate to the **Dashboard** and open the **OAuth2 Applications** section
   - Create a new OAuth2 application. Copy the **Client ID** and **Client Secret**
   - In n8n, create a new **RenderIO OAuth2 API** credential
   - Paste the **Client ID** and **Client Secret** into the corresponding fields
   - Click **Connect** to complete the OAuth2 authorization flow

2. **API Key authentication**
   - Sign up or log in at [RenderIO](https://renderio.dev)
   - Navigate to the **Dashboard** and open the **API Keys** section
   - Generate a new API key. Keys start with `ffsk_`
   - In n8n, create a new **RenderIO API** credential
   - Paste the key into the **API Key** field

For more details, see the [authentication documentation](https://renderio.dev/docs/getting-started/authentication).

## Compatibility

- **n8n**: Version 1.60.0 and higher
- **Node.js**: 22.x or higher
- **npm**: 10.8.2 or higher

## Usage

1. **Store or upload media**: Use **File > Store** to import a media file from a URL, or **File > Upload** to upload a binary file directly.
2. **Run an FFmpeg command**: Use **Command > Run** to execute an FFmpeg command on the stored file (e.g., transcode, resize, extract audio).
3. **Check status**: Use **Command > Get** to poll for processing completion.
4. **Retrieve results**: Use **File > Get** to access the output file.

For repeated operations, create a **Preset** with your FFmpeg command template, then use **Preset > Execute** to run it with different input files.

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
   - For OAuth2, ensure the Client ID and Client Secret match your RenderIO dashboard
   - Check that your RenderIO account is active

2. **Command failures**
   - Verify the FFmpeg arguments are valid
   - Check that input files exist and are accessible
   - Review the command status via **Command > Get** for detailed error messages

3. **File upload issues**
   - Ensure the file URL is publicly accessible (for Store operations)
   - Verify the file format is supported by FFmpeg
   - Check file size limits on your RenderIO plan

4. **Operation timeouts**
   - FFmpeg processing runs in the background; use **Command > Get** to poll for completion
   - Large files or complex operations may take longer to process

### Getting help

If you encounter issues:

1. Check the [RenderIO API Documentation](https://renderio.dev/docs)
2. Review the [n8n Community Nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
3. Open an issue in the [GitHub repository](https://github.com/RenderIO/n8n-nodes-renderio)
