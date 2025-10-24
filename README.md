# DevX360 - DORA Metrics & Repository Analytics Platform

This project provides a comprehensive GitHub repository analysis platform that evaluates codebases for DevOps performance using **DORA Metrics**. It includes a backend API, MCP (Model Context Protocol) server for Claude Desktop integration, and AI-powered insights generation.

---

## Features

### Core Analytics
- **DORA Metric Detection**: Evaluates repositories for the four DORA metrics:
  - Deployment Frequency
  - Lead Time for Changes
  - Mean Time to Recovery (MTTR)
  - Change Failure Rate (CFR)
- **Parallel Processing**: Uses `concurrentMap` to concurrently fetch and analyze files/directories while respecting API limits.
- **Token Management**: Leverages `tokenManager.js` to cycle GitHub tokens for rate limit handling.
- **AI-Powered Insight Generation**: Generates actionable recommendations and improvement opportunities.
- **Critical File Detection**: Identifies files relevant to CI/CD, testing, monitoring, security, and more.

### MCP Server (Claude Desktop Integration)
- **Real-time Analysis**: Analyze any GitHub repository directly from Claude Desktop
- **Private Repository Support**: Multiple authentication methods for private repos
- **Team Analytics**: AI-generated insights for development teams
- **Secure Configuration**: Environment-based token management (no hardcoded credentials)
- **Self-Service Tokens**: Users generate their own MCP tokens via web UI

---

---

## File Structure

- `codeInterpretor.js`: Main orchestrator module that runs the full analysis.
- `tokenManager.js`: Manages and rotates GitHub API tokens.
- `../api/utils/concurrentMap.js`: Processes tasks concurrently with a configurable concurrency limit.

---

## Requirements

- Node.js (v18+)
- GitHub Personal Access Tokens (PATs)
- AWS Account (for Lambda deployment) or local server
- Claude Desktop (optional, for MCP integration)

---

## Installation

### Backend API Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/your-org/DevX360.git
   cd DevX360
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Backend API tokens
   export GITHUB_TOKEN_1="your-github-token-1"
   export GITHUB_TOKEN_2="your-github-token-2"  # Optional
   ```

4. Run the backend:
   ```bash
   npm start
   # Or for development
   npm run dev
   ```

### MCP Server Setup (Claude Desktop Integration)

**🔐 Important: The MCP server now requires environment variable configuration.**

See detailed setup instructions in:
- **Quick Start**: `CLAUDE_DESKTOP_SETUP.md`
- **Token Configuration**: `MCP_TOKEN_SETUP.md`
- **Example Config**: `claude-config.example.json`

**Quick Setup:**
```json
// ~/.config/Claude/config.json (or equivalent)
{
  "mcpServers": {
    "devx360-dora-analytics": {
      "command": "npx",
      "args": ["-y", "@devx360/mcp-server"],
      "env": {
        "DEVX360_MCP_API_TOKEN": "your-personal-mcp-token"
      }
    }
  }
}
```

**Note**: The server automatically connects to the DevX360 production API. No additional configuration needed!

**Get Your Token:**

**Option 1 - Self-Service (Recommended):**
1. Log into DevX360 web interface
2. Go to Settings → MCP Tokens
3. Click "Generate New Token"
4. Copy token and add to config.json

**Option 2 - Request from Admin:**
Contact your DevX360 administrator for your personal `DEVX360_MCP_API_TOKEN`.

See `MCP_TOKEN_API.md` for API documentation.

---

## Example Usage

```js
import { performDORAAnalysis } from "./codeInterpretor.js";

const result = await performDORAAnalysis("facebook", "react", {
  deployment_frequency: {},
  lead_time: {},
  mttr: {},
  change_failure_rate: {},
});

console.log(result.insights);
```

---

## Output Structure

```json
{
  "insights": "## DEPLOYMENT FREQUENCY\n**Opportunity:** ...",
  "repositoryAnalysis": {
    "repository": { "name": "...", "language": "...", ... },
    "structure": {...},
    "doraIndicators": {...},
    "fileStats": {...},
    "patterns": {...},
    "allFiles": [...]
  },
  "performance": {
    "totalTimeMs": 9435,
    "filesAnalyzed": 88,
    "doraIndicatorsFound": 23
  }
}
```

---

## Documentation

### For End Users
- **`QUICK_START_MCP.md`** - 5-minute setup guide for Claude Desktop
- **`MCP_TOKEN_SETUP.md`** - Complete token configuration guide
- **`CLAUDE_DESKTOP_SETUP.md`** - Full Claude Desktop integration guide

### For Developers
- **`MCP_TOKEN_API.md`** - REST API reference for token management
- **`PRIVATE_REPO_SECURITY.md`** - Security model and best practices
- **`test-mcp-tokens.js`** - Test suite for token management

### For Administrators
- **`MCP_ADMIN_GUIDE.md`** - Deployment and token management
- **`CHANGES.md`** - Change log and migration guide

## Metrics and Analysis

### Deployment Frequency

- Detected from workflows, release patterns, and deploy-related commits.

### Lead Time for Changes

- Derived from pull request open-to-merge durations and test/review files.

### MTTR

- Inferred via log, monitoring, alert, and rollback-related files.

### Change Failure Rate

- Estimated using fix-to-feature commit ratios and PR merge rates.

---

## Additional Notes

- The `concurrentMap` utility is essential for efficient processing of large repositories without overloading the GitHub API.
- `tokenManager.js` must supply rotating Octokit clients with valid GitHub PATs.
- The AI prompt used is dynamically constructed based on detected repo patterns.

---

## LLM Prompt

A custom prompt is sent to a local LLM like so:

```
POST http://localhost:11434/api/generate
Content-Type: application/json

{
  "model": "mistral:instruct",
  "prompt": "You are a senior DevOps engineer analyzing ...",
  ...
}
```
