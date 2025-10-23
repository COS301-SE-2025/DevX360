#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// NOTE: Per mentor guidance, avoid calling backend modules directly from MCP.
// Prefer calling the deployed API via API_BASE_URL. Fallbacks remain only for
// local development if the API endpoints are not yet available.

// Configuration from environment variables (set in Claude Desktop config.json)
const API_BASE_URL = process.env.DEVX360_API_BASE_URL || 'https://qii20qjkfi.execute-api.us-east-1.amazonaws.com/dev';
const MCP_API_TOKEN = process.env.DEVX360_MCP_API_TOKEN;

// Validation
if (!MCP_API_TOKEN) {
  console.error('ERROR: DEVX360_MCP_API_TOKEN environment variable is not set!');
  console.error('Please configure it in your Claude Desktop config.json:');
  console.error(JSON.stringify({
    "mcpServers": {
      "devx360-dora-analytics": {
        "command": "node",
        "args": ["path/to/mcp-server.js"],
        "env": {
          "DEVX360_MCP_API_TOKEN": "your-token-here",
          "DEVX360_API_BASE_URL": "your-api-url (optional)"
        }
      }
    }
  }, null, 2));
  process.exit(1);
}

// Debug logging
console.error('MCP Server starting...');
console.error('API_BASE_URL:', API_BASE_URL);
console.error('MCP_API_TOKEN:', MCP_API_TOKEN ? 'SET (length: ' + MCP_API_TOKEN.length + ')' : 'NOT SET');

function buildApiUrl(path, params = {}) {
  if (!API_BASE_URL) return '';
  // Ensure the path starts with /dev for API Gateway stage
  const fullPath = path.startsWith('/dev') ? path : `/dev${path}`;
  const url = new URL(fullPath, API_BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  return url.toString();
}

async function getJson(path, params) {
  const url = buildApiUrl(path, params);
  console.error('Making API call to:', url);
  if (!url) throw new Error('API_BASE_URL is not set for MCP server');
  const res = await fetch(url, {
    credentials: 'omit',
    headers: {
      'x-mcp-token': MCP_API_TOKEN,
    }
  });
  console.error('API response status:', res.status, res.statusText);
  if (!res.ok) {
    let body;
    try { body = await res.json(); } catch {}
    const msg = body?.message ? `: ${body.message}` : '';
    throw new Error(`API ${res.status} ${res.statusText}${msg}`);
  }
  return res.json();
}


class DevX360MCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'devx360-dora-analytics',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Handle tools/list request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "analyze_dora_metrics",
            description: "Get comprehensive DORA metrics (Deployment Frequency, Lead Time, MTTR, Change Failure Rate) for any GitHub repository with trend analysis and insights",
            inputSchema: {
              type: "object",
              properties: {
                repositoryUrl: {
                  type: "string",
                  description: "GitHub repository URL (e.g., https://github.com/owner/repo)"
                }
              },
              required: ["repositoryUrl"]
            }
          },
          {
            name: "get_repository_insights",
            description: "Get comprehensive repository information including contributors, languages, statistics, and activity metrics",
            inputSchema: {
              type: "object",
              properties: {
                repositoryUrl: {
                  type: "string",
                  description: "GitHub repository URL"
                }
              },
              required: ["repositoryUrl"]
            }
          },
          {
            name: "analyze_repository",
            description: "Perform deep analysis of a repository including code structure, DORA indicators, and development patterns. When authenticated with a personal MCP token, automatically uses your stored GitHub token for private repository access.",
            inputSchema: {
              type: "object",
              properties: {
                repositoryUrl: {
                  type: "string",
                  description: "GitHub repository URL (public or private)"
                },
                githubToken: {
                  type: "string",
                  description: "Optional: Explicit GitHub token to use. If not provided, uses your stored GitHub token automatically."
                },
                userId: {
                  type: "string", 
                  description: "Optional: Specific user ID. If not provided, uses your authenticated user ID from MCP token."
                }
              },
              required: ["repositoryUrl"]
            }
          },
          {
            name: "check_github_auth",
            description: "Check your GitHub authentication status and token validity for private repository access. When authenticated with a personal MCP token, your user ID is automatically detected.",
            inputSchema: {
              type: "object",
              properties: {
                userId: {
                  type: "string",
                  description: "Optional: Specific user ID to check. If not provided, uses your authenticated user ID from MCP token."
                }
              },
              required: []
            }
          },
          {
            name: "get_ai_analysis",
            description: "Get AI-generated analysis and insights for a team's repository with recommendations",
            inputSchema: {
              type: "object",
              properties: {
                teamId: {
                  type: "string",
                  description: "Team ID for analysis"
                }
              },
              required: ["teamId"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'analyze_dora_metrics':
          return await this.handleAnalyzeDORAMetrics(args);
        
        case 'get_repository_insights':
          return await this.handleGetRepositoryInsights(args);
        
        case 'analyze_repository':
          return await this.handleAnalyzeRepository(args);
        
        case 'check_github_auth':
          return await this.handleCheckGitHubAuth(args);
        
        case 'get_ai_analysis':
          return await this.handleGetAIAnalysis(args);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async handleAnalyzeDORAMetrics(args) {
    try {
      const { repositoryUrl } = args;
      
      if (!repositoryUrl) {
        throw new Error('repositoryUrl is required');
      }

      
      // Call API (no local computation)
      const metrics = await getJson('/api/mcp/metrics', { repositoryUrl });
      const repoInfo = await getJson('/api/mcp/repo', { url: repositoryUrl });

      return {
        content: [
          {
            type: 'text',
            text: `DORA metrics (raw API data) for ${repoInfo?.name || repositoryUrl}:\n\n` +
                  JSON.stringify({ repo: repoInfo, metrics }, null, 2)
          }
        ],
        isError: false
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing DORA metrics: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async handleGetRepositoryInsights(args) {
    try {
      const { repositoryUrl } = args;
      
      if (!repositoryUrl) {
        throw new Error('repositoryUrl is required');
      }

      const repoInfo = await getJson('/api/mcp/repo', { url: repositoryUrl });
      
      return {
        content: [
          {
            type: 'text',
            text: `Repository insights (raw API data):\n\n` + JSON.stringify(repoInfo, null, 2)
          }
        ],
        isError: false
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting repository insights: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async handleCheckGitHubAuth(args) {
    try {
      const { userId } = args;

      const authStatus = await getJson('/api/mcp/user-token', userId ? { userId } : {});
      
      const detectionNote = authStatus.autoDetected 
        ? '🔍 User automatically detected from your MCP token\n\n'
        : '';
      
      return {
        content: [
          {
            type: 'text',
            text: `GitHub Authentication Status:\n\n` +
                  detectionNote +
                  `✅ Connected: ${authStatus.hasToken ? 'Yes' : 'No'}\n` +
                  `👤 Username: ${authStatus.username || 'Not available'}\n` +
                  `🔑 Token Valid: ${authStatus.tokenValid ? 'Yes' : 'No'}\n` +
                  `🔒 Private Access: ${authStatus.hasPrivateAccess ? 'Yes' : 'No'}\n` +
                  `📋 Scopes: ${authStatus.scopes?.join(', ') || 'None'}\n\n` +
                  (authStatus.hasPrivateAccess 
                    ? '✅ You can analyze private repositories! Your GitHub token is automatically used when you make requests.'
                    : '⚠️  You need to connect your GitHub account with "repo" scope to access private repositories.')
          }
        ],
        isError: false
      };
    } catch (error) {
      if (error.message.includes('404')) {
        return {
          content: [{
            type: 'text',
            text: `❌ GitHub Authentication Error\n\n` +
                  `User not found or no GitHub account connected.\n\n` +
                  `💡 To connect your GitHub account:\n` +
                  `1. Go to your profile settings\n` +
                  `2. Click "Connect GitHub"\n` +
                  `3. Authorize with "repo" scope for private repository access`
          }],
          isError: true
        };
      }
      
      if (error.message.includes('401')) {
        return {
          content: [{
            type: 'text',
            text: `⚠️  GitHub Token Expired\n\n` +
                  `Your stored GitHub token has expired or is invalid.\n\n` +
                  `💡 Please reconnect your GitHub account:\n` +
                  `1. Go to your profile settings\n` +
                  `2. Click "Reconnect GitHub"\n` +
                  `3. Authorize with "repo" scope for private repository access`
          }],
          isError: true
        };
      }
      
      throw error;
    }
  }

  async handleAnalyzeRepository(args) {
    try {
      const { repositoryUrl, githubToken, userId } = args;
      
      if (!repositoryUrl) {
        throw new Error('repositoryUrl is required');
      }

      // Build query parameters
      const queryParams = { url: repositoryUrl };
      if (githubToken) {
        queryParams.githubToken = githubToken;
      }
      if (userId) {
        queryParams.userId = userId;
      }

      const analysis = await getJson('/api/mcp/analyze', queryParams);
      
      // Enhanced status messages based on token type
      let statusMessage = '';
      switch (analysis._meta?.tokenType) {
        case 'user_provided':
          statusMessage = '✅ Using your provided GitHub token. Private repositories should be accessible.';
          break;
        case 'user_stored':
          statusMessage = '✅ Using your stored GitHub token. Private repositories should be accessible.';
          break;
        case 'system':
          statusMessage = '⚠️  Using system tokens. Private repositories may not be accessible unless the system tokens have access.';
          if (analysis._meta?.warning) {
            statusMessage += `\n\n⚠️  Warning: ${analysis._meta.warning}`;
          }
          break;
        default:
          statusMessage = '';
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `Repository Analysis Results:\n\n${JSON.stringify(analysis, null, 2)}\n\n${statusMessage}`
          }
        ],
        isError: false
      };
    } catch (error) {
      // Enhanced error handling for private repos
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return {
          content: [{
            type: 'text',
            text: `❌ Repository Access Error\n\n` +
                  `The repository "${args.repositoryUrl}" could not be accessed.\n\n` +
                  `Possible reasons:\n` +
                  `1. Repository doesn't exist\n` +
                  `2. Repository is private and system tokens don't have access\n` +
                  `3. Repository URL is incorrect\n\n` +
                  `💡 Tip: For private repositories, ensure the system GitHub tokens have access to the repo.`
          }],
          isError: true
        };
      }
      
      // If API returns 500 error, provide fallback analysis
      if (error.message.includes('500 Internal Server Error')) {
        console.error('API returned 500, providing fallback analysis for:', args.repositoryUrl);
        
        const fallbackAnalysis = {
          metadata: {
            url: args.repositoryUrl,
            name: "demo-repo",
            owner: "demo-owner",
            description: "Demo repository analysis (API temporarily unavailable)",
            stars: 0,
            forks: 0,
            language: "Unknown",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          metrics: {
            deploymentFrequency: "daily",
            leadTimeForChanges: "2h",
            changeFailureRate: "5%",
            timeToRestoreService: "1h"
          },
          analysis: {
            health_score: 85,
            recommendations: [
              "API temporarily unavailable - using demo data",
              "Consider implementing CI/CD pipeline",
              "Monitor deployment frequency",
              "Track lead time for changes"
            ],
            status: "demo_mode"
          },
          error: "API temporarily unavailable - showing demo analysis",
          mock: true
        };
        
        return {
          content: [
            {
              type: 'text',
              text: `Repository analysis (demo data - API temporarily unavailable):\n\n` + JSON.stringify(fallbackAnalysis, null, 2)
            }
          ],
          isError: false
        };
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing repository: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async handleGetAIAnalysis(args) {
    try {
      const { teamId } = args;
      
      if (!teamId) {
        throw new Error('teamId is required');
      }
      
      // Route through API for team-based analysis bundle (no local computation)
      const teamBundle = await getJson(`/api/mcp/team/${encodeURIComponent(teamId)}`);
      return {
        content: [
          {
            type: 'text',
            text: `Team analysis (raw API data):\n\n` + JSON.stringify(teamBundle, null, 2)
          }
        ],
        isError: false
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting AI analysis: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  // No local analytics helpers; MCP stays as a thin API client

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('DevX360 MCP Server running on stdio');
  }
}

// Run the server
const server = new DevX360MCPServer();
server.run().catch(console.error); 