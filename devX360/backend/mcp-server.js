import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import existing services (NO CHANGES NEEDED)
import { getDORAMetrics } from './Data Collection/universal-dora-service.js';
import { getRepositoryInfo } from './Data Collection/repository-info-service.js';
import { analyzeRepository } from './services/metricsService.js';
import { runAIAnalysis } from './services/analysisService.js';

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

      console.log(`🔍 Analyzing DORA metrics for: ${repositoryUrl}`);
      
      const metrics = await getDORAMetrics(repositoryUrl);
      const repoInfo = await getRepositoryInfo(repositoryUrl);
      
      // Calculate trends
      const deploymentTrend = this.calculateTrend(metrics.deployment_frequency.perWeek);
      const leadTimeTrend = this.calculateTrend([metrics.lead_time.average_days]);
      const mttrTrend = this.calculateTrend([metrics.mttr.average_days]);
      
      // Scalar deployment frequencies (prefer Data Collection fields; fallback to computed)
      const df = metrics.deployment_frequency || {};
      const avgPerDay = df.frequency_per_day ?? (
        (df.total_deployments / (df.analysis_period_days || (df.perDay?.length || 1))).toFixed(2)
      );
      const avgPerWeek = df.frequency_per_week ?? (
        df.perWeek?.length ? (df.total_deployments / df.perWeek.length).toFixed(2) : '0.00'
      );
      const avgPerMonth = df.frequency_per_month ?? (
        df.perMonth?.length ? (df.total_deployments / df.perMonth.length).toFixed(2) : '0.00'
      );

      // Generate insights
      const insights = this.generateInsights(metrics, repoInfo);
      
      return {
        content: [
          {
            type: 'text',
            text: `📊 **DORA Analysis for ${repoInfo.name}**\n\n` +
                  `🚀 **Deployment Frequency:**\n` +
                  `   • Total: ${df.total_deployments} deployments\n` +
                  `   • Weekly Trend: ${deploymentTrend}\n` +
                  `   • Freq: ${avgPerDay}/day | ${avgPerWeek}/week | ${avgPerMonth}/month\n` +
                  `   • Per Week: [${(df.perWeek || []).join(', ')}]\n\n` +
                  `⏱️ **Lead Time for Changes:**\n` +
                  `   • Average: ${metrics.lead_time.average_days} days\n` +
                  `   • Trend: ${leadTimeTrend}\n` +
                  `   • PRs Analyzed: ${metrics.lead_time.total_prs_analyzed}\n\n` +
                  `🔄 **Mean Time to Recovery (MTTR):**\n` +
                  `   • Average: ${metrics.mttr.average_days} days\n` +
                  `   • Trend: ${mttrTrend}\n` +
                  `   • Incidents: ${metrics.mttr.total_incidents_analyzed}\n\n` +
                  `❌ **Change Failure Rate:**\n` +
                  `   • Rate: ${metrics.change_failure_rate.failure_rate}\n` +
                  `   • Confidence: ${metrics.change_failure_rate.confidence}\n` +
                  `   • Failures: ${metrics.change_failure_rate.deployment_failures}/${metrics.change_failure_rate.total_deployments}\n\n` +
                  `💡 **AI Insights:**\n${insights}\n\n` +
                  `📈 **Repository Stats:**\n` +
                  `   • Language: ${repoInfo.primary_language}\n` +
                  `   • Stars: ${repoInfo.stars}\n` +
                  `   • Contributors: ${repoInfo.total_contributors}\n` +
                  `   • Analysis Period: ${metrics.analysis_period.days_back} days`
          }
        ],
        isError: false
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error analyzing DORA metrics: ${error.message}`
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

      const repoInfo = await getRepositoryInfo(repositoryUrl);
      
      return {
        content: [
          {
            type: 'text',
            text: `🔍 **Repository Insights for ${repoInfo.name}**\n\n` +
                  `📁 **Overview:**\n` +
                  `   • Full Name: ${repoInfo.full_name}\n` +
                  `   • Description: ${repoInfo.description || 'No description'}\n` +
                  `   • Primary Language: ${repoInfo.primary_language}\n` +
                  `   • Stars: ${repoInfo.stars} | Forks: ${repoInfo.forks}\n\n` +
                  `👥 **Top Contributors:**\n` +
                  repoInfo.contributors.slice(0, 5).map((contributor, index) => 
                    `   ${index + 1}. ${contributor.username} (${contributor.contributions} contributions)`
                  ).join('\n') + `\n\n` +
                  `💻 **Languages:**\n` +
                  Object.entries(repoInfo.languages)
                    .slice(0, 5)
                    .map(([lang, bytes]) => `   • ${lang}: ${bytes} bytes`)
                    .join('\n') + `\n\n` +
                  `📅 **Activity:**\n` +
                  `   • Created: ${new Date(repoInfo.created_at).toLocaleDateString()}\n` +
                  `   • Last Updated: ${new Date(repoInfo.updated_at).toLocaleDateString()}\n` +
                  `   • Open Issues: ${repoInfo.open_issues}`
          }
        ],
        isError: false
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error getting repository insights: ${error.message}`
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

      const analysis = await analyzeRepository(repositoryUrl);
      
      return {
        content: [
          {
            type: 'text',
            text: `🔍 **Repository Analysis for ${repositoryUrl}**\n\n` +
                  `📊 **Analysis Results:**\n` +
                  `   • Status: ${analysis.status}\n` +
                  `   • Processing Time: ${analysis.processingTime}ms\n` +
                  `   • Files Analyzed: ${analysis.filesAnalyzed}\n` +
                  `   • DORA Indicators Found: ${analysis.doraIndicatorsFound}\n\n` +
                  `💡 **Insights:**\n` +
                  (analysis.insights ? analysis.insights : 'No insights available')
          }
        ],
        isError: false
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error analyzing repository: ${error.message}`
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

      const aiAnalysis = await runAIAnalysis(teamId);
      
      return {
        content: [
          {
            type: 'text',
            text: `🤖 **AI Analysis for Team ${teamId}**\n\n` +
                  `💡 **AI Insights:**\n` +
                  (aiAnalysis.insights || 'No AI insights available') + `\n\n` +
                  `📈 **Analysis Metadata:**\n` +
                  `   • Repository: ${aiAnalysis.metadata?.repo || 'Unknown'}\n` +
                  `   • Primary Language: ${aiAnalysis.metadata?.primaryLanguage || 'Unknown'}\n` +
                  `   • DORA Indicators: ${aiAnalysis.metadata?.doraIndicatorsFound || 0}\n` +
                  `   • Files Analyzed: ${aiAnalysis.metadata?.filesAnalyzed || 0}\n` +
                  `   • Processing Time: ${aiAnalysis.metadata?.processingTimeMs || 0}ms`
          }
        ],
        isError: false
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error getting AI analysis: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  calculateTrend(data) {
    if (data.length < 2) return 'Insufficient data';
    
    const recent = data.slice(-3).reduce((a, b) => a + b, 0);
    const previous = data.slice(-6, -3).reduce((a, b) => a + b, 0);
    
    if (recent > previous * 1.2) return '📈 Increasing';
    if (recent < previous * 0.8) return '📉 Decreasing';
    return '➡️ Stable';
  }

  generateInsights(metrics, repoInfo) {
    const insights = [];
    
    if (metrics.deployment_frequency.total_deployments === 0) {
      insights.push('⚠️ No deployments found - consider setting up CI/CD pipeline');
    } else if (metrics.deployment_frequency.total_deployments < 5) {
      insights.push('💡 Low deployment frequency - consider more frequent releases');
    } else {
      insights.push('✅ Good deployment frequency - maintaining regular releases');
    }
    
    if (metrics.lead_time.average_days > 7) {
      insights.push('⚠️ High lead time - consider automating more processes');
    } else if (metrics.lead_time.average_days < 2) {
      insights.push('🚀 Excellent lead time - efficient development process');
    }
    
    if (metrics.mttr.average_days > 4) {
      insights.push('⚠️ Slow recovery time - improve monitoring and alerting');
    } else {
      insights.push('✅ Good recovery time - effective incident response');
    }
    
    const failureRate = parseFloat(metrics.change_failure_rate.failure_rate);
    if (failureRate > 0.15) {
      insights.push('🚨 High failure rate - review testing and deployment processes');
    } else if (failureRate < 0.05) {
      insights.push('🎉 Excellent reliability - maintain current practices');
    }
    
    return insights.map(insight => `   ${insight}`).join('\n');
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('🚀 DevX360 MCP Server running on stdio');
  }
}

// Run the server
const server = new DevX360MCPServer();
server.run().catch(console.error); 