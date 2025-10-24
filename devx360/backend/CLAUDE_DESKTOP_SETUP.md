# Claude Desktop + DevX360 MCP Server Setup

## 🔐 IMPORTANT: Configuration Required (Updated)

**The MCP server now requires environment variables to be configured!** Hardcoded tokens have been removed for security.

## 📋 Quick Setup Guide

### Step 1: Get Your MCP API Token
Contact your DevX360 administrator to get your personal `DEVX360_MCP_API_TOKEN`.

### Step 2: Configure Claude Desktop

**Configuration File Location:**
- **macOS**: `~/Library/Application Support/Claude/config.json`
- **Linux**: `~/.config/Claude/config.json`  
- **Windows**: `%APPDATA%\Claude\config.json`

**Configuration Template:**
See `claude-config.example.json` in this directory for a template.

**Example Configuration:**
```json
{
  "mcpServers": {
    "devx360-dora-analytics": {
      "command": "npx",
      "args": [
        "-y",
        "@devx360/mcp-server"
      ],
      "env": {
        "DEVX360_MCP_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

**Environment Variables:**
- `DEVX360_MCP_API_TOKEN` - **Required**. Your personal MCP API token
- `DEVX360_API_BASE_URL` - **Optional**. Only needed for:
  - Local development (e.g., `http://localhost:5500`)
  - Self-hosted instances
  - Testing against staging environments
  - **Default**: Production API (automatically configured)

**Alternative: Local Development Setup**
For developers working on the MCP server itself:
```json
{
  "mcpServers": {
    "devx360-dora-analytics": {
      "command": "node",
      "args": [
        "/absolute/path/to/DevX360/mcp-server.js"
      ],
      "env": {
        "DEVX360_MCP_API_TOKEN": "your-token-here",
        "DEVX360_API_BASE_URL": "http://localhost:5500"
      }
    }
  }
}
```

### Step 3: Restart Claude Desktop
After updating the config.json, completely quit and restart Claude Desktop.

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

## 🔐 Private Repository Support - FULLY IMPLEMENTED! ✅

### How It Works Now
Claude Desktop now supports **multiple ways** to access private repositories:

1. **User-Provided Tokens**: You can provide your own GitHub token
2. **Stored User Tokens**: Use your connected GitHub account token
3. **System Tokens**: Fallback to system tokens (GITHUB_TOKEN_1, GITHUB_TOKEN_2)

### 🚀 New MCP Tools for Private Repos

#### `analyze_repository` (Enhanced)
- **Purpose**: Deep analysis of any repository (public or private)
- **Input**: 
  - `repositoryUrl` (required) - GitHub repository URL
  - `githubToken` (optional) - Your personal GitHub token
  - `userId` (optional) - Your user ID to use stored token
- **Output**: Complete analysis with token usage information

#### `check_github_auth` (New)
- **Purpose**: Check your GitHub authentication status
- **Input**: `userId` (required) - Your user ID
- **Output**: Authentication status, token validity, scopes, private access capability

### 🔑 Token Priority System
```
Priority 1: User-provided token (githubToken parameter)
Priority 2: Stored user token (userId parameter) 
Priority 3: System tokens (fallback)
```

### 💡 Usage Examples

**Check Your GitHub Authentication:**
```
"Check my GitHub authentication status"
```

**Analyze Private Repository with Stored Token:**
```
"Analyze my private repository: https://github.com/myusername/private-repo"
```

**Analyze Private Repository with Specific Token:**
```
"Analyze my private repository: https://github.com/myusername/private-repo with my token: ghp_abc123..."
```

### 🔧 Setup Requirements

**For Stored Token Access:**
1. Connect your GitHub account in the web interface
2. Ensure your token has `repo` scope for private access
3. Use your `userId` in MCP requests

**For Manual Token Access:**
1. Generate a GitHub Personal Access Token with `repo` scope
2. Provide the token directly in MCP requests
3. Token is used only for that specific request

### ✅ What's Working
- ✅ Private repository analysis with user tokens
- ✅ Automatic token validation and error handling
- ✅ Clear status messages about token usage
- ✅ Graceful fallbacks when tokens fail
- ✅ Integration with existing GitHub authentication system

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

### 3. Test Private Repository Access
Try analyzing a private repository (if system tokens have access):

```
"Analyze the repository https://github.com/your-org/private-repo"
```

**Note**: You'll see a warning if the repository is private and may not be accessible.

### 4. Verify MCP Tools Are Available
- In Claude Desktop, you should see the MCP tools available
- Look for indicators that the `devx360-dora-analytics` server is connected

## 🔍 Troubleshooting

### If MCP Server Fails to Start:

**Error: "DEVX360_MCP_API_TOKEN environment variable is not set"**
- You haven't configured the token in Claude Desktop's config.json
- Solution: Add the `env` section to your config.json (see Step 2 above)

**Error: "API 401 Unauthorized"**
- Your MCP API token is invalid or expired
- Solution: Contact your administrator for a new token

### If MCP Tools Don't Appear:
1. **Check Claude Desktop Logs**:
   - Look for MCP-related errors in Claude Desktop
   - Verify the server path is correct

2. **Manual Server Test**:
   ```bash
   cd /path/to/DevX360
   export DEVX360_MCP_API_TOKEN="your-token-here"
   node mcp-server.js
   ```
   You should see: "MCP Server starting..." and "MCP_API_TOKEN: SET"

3. **Check Configuration**:
   ```bash
   # macOS/Linux
   cat ~/Library/Application\ Support/Claude/config.json
   # Or
   cat ~/.config/Claude/config.json
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

### Custom API Endpoint
If you're running a local or custom deployment:

```json
{
  "mcpServers": {
    "devx360-dora-analytics": {
      "command": "node",
      "args": ["/path/to/DevX360/mcp-server.js"],
      "env": {
        "DEVX360_MCP_API_TOKEN": "your-token",
        "DEVX360_API_BASE_URL": "http://localhost:3000/dev"
      }
    }
  }
}
```

### Multiple MCP Servers
You can add additional MCP servers to the same configuration file.

### Deployment Checklist for Administrators

**When deploying DevX360 MCP for your organization:**

1. **Generate MCP API Tokens**
   - Create secure, unique tokens for each user/team
   - Store tokens securely (never commit to git)
   - Implement token rotation policy

2. **Backend Configuration**
   - Ensure `authenticateMCP` middleware validates tokens correctly
   - Set up proper CORS if needed
   - Configure GitHub tokens (GITHUB_TOKEN_1, GITHUB_TOKEN_2) in backend

3. **User Setup**
   - Provide users with their MCP API token
   - Share the configuration template
   - Document the API_BASE_URL for your deployment

4. **Security Best Practices**
   - Rotate tokens periodically
   - Monitor for suspicious API usage
   - Use HTTPS for all API communications
   - Implement rate limiting on MCP endpoints

---

## 🎉 You're All Set!

Your DevX360 DORA analytics tools are now integrated with Claude Desktop. You can now ask Claude to analyze GitHub repositories using your custom DORA metrics tools!

**Happy analyzing! 🚀**