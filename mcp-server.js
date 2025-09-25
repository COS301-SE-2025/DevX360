import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// NOTE: Per mentor guidance, avoid calling backend modules directly from MCP.
// Prefer calling the deployed API via API_BASE_URL. Fallbacks remain only for
// local development if the API endpoints are not yet available.

const API_BASE_URL = process.env.API_BASE_URL || '';
const MCP_API_TOKEN = process.env.MCP_API_TOKEN || 'testtoken';

function buildApiUrl(path, params = {}) {
  if (!API_BASE_URL) return '';
  const url = new URL(path, API_BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  return url.toString();
}

async function getJson(path, params) {
  const url = buildApiUrl(path, params);
  if (!url) throw new Error('API_BASE_URL is not set for MCP server');
  const res = await fetch(url, {
    credentials: 'omit',
    headers: {
      'x-mcp-token': MCP_API_TOKEN,
    }
  });
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
            description: "Perform deep analysis of a repository including code structure, DORA indicators, and development patterns",
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

  async handleAnalyzeRepository(args) {
    try {
      const { repositoryUrl } = args;
      
      if (!repositoryUrl) {
        throw new Error('repositoryUrl is required');
      }

      const analysis = await getJson('/api/mcp/analyze', { url: repositoryUrl });
      
      return {
        content: [
          {
            type: 'text',
            text: `Repository analysis (raw API data):\n\n` + JSON.stringify(analysis, null, 2)
          }
        ],
        isError: false
      };
    } catch (error) {
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