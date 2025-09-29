# Claude Desktop + DevX360 MCP Server Setup

## ✅ Configuration Complete!

Your DevX360 MCP server has been successfully configured to work with Claude Desktop.

## 🔧 What Was Configured

### 1. Claude Desktop Configuration
- **File**: `~/Library/Application Support/Claude/config.json`
- **Added**: MCP server configuration for `devx360-dora-analytics`

### 2. MCP Server Location
- **Path**: `/Users/sbudx/Documents/GitHub/DevX360/mcp-server.js`
- **Status**: ✅ Working and tested

## 🚀 Available MCP Tools

Your MCP server provides these tools to Claude Desktop:

### 1. `analyze_dora_metrics`
- **Purpose**: Get comprehensive DORA metrics for any GitHub repository
- **Input**: `repositoryUrl` (GitHub repository URL)
- **Output**: Deployment frequency, lead time, MTTR, change failure rate with trends

### 2. `get_repository_insights`
- **Purpose**: Get repository information including contributors, languages, statistics
- **Input**: `repositoryUrl` (GitHub repository URL)
- **Output**: Team structure, technology stack, activity metrics

### 3. `analyze_repository`
- **Purpose**: Deep analysis of repository structure and development patterns
- **Input**: `repositoryUrl` (GitHub repository URL)
- **Output**: Code structure analysis, DORA indicators, improvement opportunities

### 4. `get_ai_analysis`
- **Purpose**: AI-generated analysis and recommendations for teams
- **Input**: `teamId` (Team identifier)
- **Output**: AI insights, recommendations, improvement suggestions

## 📋 Next Steps

### 1. Restart Claude Desktop
- Close Claude Desktop completely
- Reopen Claude Desktop
- The MCP server will automatically start when needed

### 2. Test the Integration
Try these example prompts in Claude Desktop:

```
"Analyze the DORA metrics for https://github.com/facebook/react"
```

```
"Get repository insights for https://github.com/microsoft/vscode"
```

```
"Perform a deep analysis of https://github.com/nodejs/node"
```

### 3. Verify MCP Tools Are Available
- In Claude Desktop, you should see the MCP tools available
- Look for indicators that the `devx360-dora-analytics` server is connected

## 🔍 Troubleshooting

### If MCP Tools Don't Appear:
1. **Check Claude Desktop Logs**:
   - Look for MCP-related errors in Claude Desktop
   - Verify the server path is correct

2. **Manual Server Test**:
   ```bash
   cd /Users/sbudx/Documents/GitHub/DevX360
   npm run mcp
   ```

3. **Check Configuration**:
   ```bash
   cat ~/Library/Application\ Support/Claude/config.json
   ```

### If Tools Timeout:
- The GitHub API calls can take time for large repositories
- This is normal behavior - the tools are working but may need patience for complex analyses

### GitHub API Warnings:
- You may see deprecation warnings for GitHub API calls
- These don't affect functionality but indicate some API endpoints will be updated
- Your GitHub tokens are properly configured

## 🎯 Usage Examples

### DevOps Assessment
```
"Assess the DevOps maturity of https://github.com/owner/repo by analyzing their DORA metrics and providing improvement recommendations"
```

### Team Analysis
```
"Analyze the development team structure and performance for https://github.com/owner/repo"
```

### Repository Health Check
```
"Perform a comprehensive health check of https://github.com/owner/repo including code quality, deployment patterns, and team collaboration"
```

## 📊 Expected Output Format

The tools will provide structured analysis including:
- **DORA Metrics**: Deployment frequency, lead time, MTTR, change failure rate
- **Trends**: Performance improvements or declines over time
- **Insights**: AI-generated recommendations and observations
- **Repository Stats**: Language distribution, contributor activity, project health

## 🔧 Advanced Configuration

### Custom Environment Variables
If you need to modify the MCP server environment, update the config.json:

```json
{
  "mcpServers": {
    "devx360-dora-analytics": {
      "command": "node",
      "args": ["/Users/sbudx/Documents/GitHub/DevX360/mcp-server.js"],
      "env": {
        "CUSTOM_VAR": "value"
      }
    }
  }
}
```

### Multiple MCP Servers
You can add additional MCP servers to the same configuration file.

---

## 🎉 You're All Set!

Your DevX360 DORA analytics tools are now integrated with Claude Desktop. You can now ask Claude to analyze GitHub repositories using your custom DORA metrics tools!

**Happy analyzing! 🚀**