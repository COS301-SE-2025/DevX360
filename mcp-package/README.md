# DevX360 MCP Server

MCP (Model Context Protocol) server for DevX360 integration with Claude Desktop.

## Installation

```bash
npm install -g @devx360/mcp-server
```

Or use without installing:
```bash
npx @devx360/mcp-server
```

## Configuration

Add to your Claude Desktop `config.json`:

```json
{
  "mcpServers": {
    "devx360": {
      "command": "npx",
      "args": ["-y", "@devx360/mcp-server"],
      "env": {
        "DEVX360_MCP_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

**That's it!** The server automatically connects to the DevX360 production API.

### Advanced Configuration (Optional)

Only set these if you're a developer or using a self-hosted instance:

```json
{
  "mcpServers": {
    "devx360": {
      "command": "npx",
      "args": ["-y", "@devx360/mcp-server"],
      "env": {
        "DEVX360_MCP_API_TOKEN": "your_token_here",
        "DEVX360_API_BASE_URL": "http://localhost:5500" 
      }
    }
  }
}
```

## Getting Your Token

1. Go to [DevX360 Web Platform](https://devx360.app)
2. Login to your account
3. Navigate to **Settings → MCP Tokens**
4. Click **Generate New Token**
5. Copy the token (shown only once!)
6. Paste into Claude Desktop config

## Available Tools

- `analyze_repository` - Deep analysis of repository structure and DORA metrics
- `get_dora_metrics` - Get DORA metrics for a repository
- `get_repository_info` - Get repository information and contributors
- `check_github_auth` - Check your GitHub authentication status

## Support

For support, visit [DevX360 Documentation](https://github.com/COS301-SE-2025/DevX360)

