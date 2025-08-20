# DevX360 MCP Agent Guide

## Overview

This guide demonstrates how AI agents can use your DevX360 DORA solution through the Model Context Protocol (MCP). Your MCP server provides powerful tools for automated DevOps analysis, DORA metrics calculation, and intelligent recommendations.

## 🚀 Quick Start

### 1. Start the MCP Server
```bash
npm run mcp
```

### 2. Test Agent Functionality
```bash
# Run comprehensive tests
npm run test:mcp

# Run interactive agent simulation
npm run test:mcp:interactive

# Run real-world scenario demo
npm run demo:mcp
```

## 🛠️ Available MCP Tools

### 1. `analyze_dora_metrics`
**Purpose**: Get comprehensive DORA metrics for any GitHub repository
**Input**: `repositoryUrl` (GitHub repository URL)
**Output**: Deployment frequency, lead time, MTTR, change failure rate with trends and insights

**Example Agent Usage**:
```javascript
// Agent wants to assess DevOps maturity
const response = await mcp.callTool('analyze_dora_metrics', {
  repositoryUrl: 'https://github.com/owner/repo'
});

// Agent can now analyze:
// - Deployment patterns and frequency
// - Development efficiency (lead time)
// - Incident response capability (MTTR)
// - Deployment reliability (failure rate)
```

### 2. `get_repository_insights`
**Purpose**: Get comprehensive repository information and team structure
**Input**: `repositoryUrl` (GitHub repository URL)
**Output**: Contributors, languages, statistics, activity metrics

**Example Agent Usage**:
```javascript
// Agent needs to understand team context
const insights = await mcp.callTool('get_repository_insights', {
  repositoryUrl: 'https://github.com/owner/repo'
});

// Agent can now assess:
// - Team size and collaboration patterns
// - Technology stack complexity
// - Development velocity and engagement
// - Community health indicators
```

### 3. `analyze_repository`
**Purpose**: Perform deep analysis of repository structure and patterns
**Input**: `repositoryUrl` (GitHub repository URL)
**Output**: Code structure analysis, DORA indicators, development patterns

**Example Agent Usage**:
```javascript
// Agent performs comprehensive analysis
const analysis = await mcp.callTool('analyze_repository', {
  repositoryUrl: 'https://github.com/owner/repo'
});

// Agent can now identify:
// - Code quality patterns
// - Development workflow efficiency
// - Specific improvement opportunities
// - Risk areas and optimization potential
```

### 4. `get_ai_analysis`
**Purpose**: Get AI-generated analysis and recommendations for teams
**Input**: `teamId` (Team identifier)
**Output**: AI insights, recommendations, and improvement suggestions

**Example Agent Usage**:
```javascript
// Agent generates AI-powered recommendations
const aiAnalysis = await mcp.callTool('get_ai_analysis', {
  teamId: 'team-identifier'
});

// Agent can now provide:
// - Data-driven insights
// - Pattern recognition results
// - Risk assessments
// - Best practice recommendations
```

## 🤖 Agent Workflow Examples

### Scenario 1: DevOps Maturity Assessment

```javascript
// Agent workflow for assessing a team's DevOps maturity
async function assessDevOpsMaturity(repositoryUrl) {
  // Step 1: Get DORA metrics baseline
  const doraMetrics = await mcp.callTool('analyze_dora_metrics', {
    repositoryUrl
  });
  
  // Step 2: Understand team structure
  const teamInsights = await mcp.callTool('get_repository_insights', {
    repositoryUrl
  });
  
  // Step 3: Deep analysis for specific insights
  const deepAnalysis = await mcp.callTool('analyze_repository', {
    repositoryUrl
  });
  
  // Step 4: Generate AI recommendations
  const aiRecommendations = await mcp.callTool('get_ai_analysis', {
    teamId: 'team-123'
  });
  
  // Step 5: Synthesize findings and create roadmap
  return createImprovementRoadmap({
    doraMetrics,
    teamInsights,
    deepAnalysis,
    aiRecommendations
  });
}
```

### Scenario 2: Continuous Monitoring Agent

```javascript
// Agent that continuously monitors multiple repositories
async function continuousMonitoringAgent(repositories) {
  const results = [];
  
  for (const repo of repositories) {
    // Monitor DORA metrics
    const metrics = await mcp.callTool('analyze_dora_metrics', {
      repositoryUrl: repo.url
    });
    
    // Check for anomalies
    if (detectAnomalies(metrics)) {
      // Get deeper insights
      const insights = await mcp.callTool('get_repository_insights', {
        repositoryUrl: repo.url
      });
      
      // Generate alerts and recommendations
      results.push({
        repository: repo.name,
        alert: generateAlert(metrics, insights),
        recommendations: generateRecommendations(metrics, insights)
      });
    }
  }
  
  return results;
}
```

### Scenario 3: Team Performance Optimization

```javascript
// Agent that optimizes team performance based on data
async function optimizeTeamPerformance(teamId, repositoryUrl) {
  // Get current performance baseline
  const currentMetrics = await mcp.callTool('analyze_dora_metrics', {
    repositoryUrl
  });
  
  // Analyze team structure
  const teamStructure = await mcp.callTool('get_repository_insights', {
    repositoryUrl
  });
  
  // Get AI recommendations
  const aiRecommendations = await mcp.callTool('get_ai_analysis', {
    teamId
  });
  
  // Create optimization plan
  return {
    currentPerformance: currentMetrics,
    optimizationAreas: identifyOptimizationAreas(currentMetrics, teamStructure),
    recommendations: aiRecommendations,
    implementationPlan: createImplementationPlan(aiRecommendations),
    successMetrics: defineSuccessMetrics(currentMetrics)
  };
}
```

## 🔧 Integration Patterns

### 1. CI/CD Pipeline Integration
```javascript
// Agent integrated into CI/CD pipeline
async function ciCdAgent(pipelineData) {
  // Analyze deployment performance
  const metrics = await mcp.callTool('analyze_dora_metrics', {
    repositoryUrl: pipelineData.repositoryUrl
  });
  
  // Provide real-time feedback
  if (metrics.change_failure_rate.failure_rate > 0.15) {
    return {
      status: 'warning',
      message: 'High failure rate detected',
      recommendations: await getFailureReductionRecommendations(metrics)
    };
  }
  
  return { status: 'success', metrics };
}
```

### 2. Slack/Discord Bot Integration
```javascript
// Agent as a chat bot providing DevOps insights
async function chatBotAgent(message, repositoryUrl) {
  if (message.includes('DORA metrics')) {
    const metrics = await mcp.callTool('analyze_dora_metrics', {
      repositoryUrl
    });
    
    return formatMetricsForChat(metrics);
  }
  
  if (message.includes('team insights')) {
    const insights = await mcp.callTool('get_repository_insights', {
      repositoryUrl
    });
    
    return formatInsightsForChat(insights);
  }
  
  return 'I can help you with DORA metrics, team insights, and repository analysis. What would you like to know?';
}
```

### 3. Dashboard Integration
```javascript
// Agent providing real-time dashboard data
async function dashboardAgent(repositories) {
  const dashboardData = [];
  
  for (const repo of repositories) {
    const [metrics, insights] = await Promise.all([
      mcp.callTool('analyze_dora_metrics', { repositoryUrl: repo.url }),
      mcp.callTool('get_repository_insights', { repositoryUrl: repo.url })
    ]);
    
    dashboardData.push({
      repository: repo.name,
      doraMetrics: metrics,
      teamInsights: insights,
      healthScore: calculateHealthScore(metrics, insights),
      lastUpdated: new Date().toISOString()
    });
  }
  
  return dashboardData;
}
```

## 📊 Data Output Formats

### DORA Metrics Response
```json
{
  "deployment_frequency": {
    "total_deployments": 15,
    "perWeek": [2, 3, 1, 4, 2, 3],
    "trend": "increasing"
  },
  "lead_time": {
    "average_days": 2.5,
    "total_prs_analyzed": 45,
    "trend": "stable"
  },
  "mttr": {
    "average_days": 1.2,
    "total_incidents_analyzed": 8,
    "trend": "improving"
  },
  "change_failure_rate": {
    "failure_rate": "0.08",
    "confidence": "high",
    "deployment_failures": 1,
    "total_deployments": 15
  }
}
```

### Repository Insights Response
```json
{
  "name": "project-name",
  "full_name": "owner/project-name",
  "description": "Project description",
  "primary_language": "JavaScript",
  "stars": 1250,
  "forks": 89,
  "contributors": [
    {"username": "user1", "contributions": 45},
    {"username": "user2", "contributions": 32}
  ],
  "languages": {
    "JavaScript": 1250000,
    "TypeScript": 450000
  },
  "open_issues": 23,
  "created_at": "2023-01-15T10:00:00Z",
  "updated_at": "2024-01-15T15:30:00Z"
}
```

## 🚀 Best Practices for Agents

### 1. Error Handling
```javascript
async function robustAgentCall(toolName, arguments) {
  try {
    const result = await mcp.callTool(toolName, arguments);
    return { success: true, data: result };
  } catch (error) {
    console.error(`Tool call failed: ${toolName}`, error);
    return { 
      success: false, 
      error: error.message,
      fallback: await getFallbackData(toolName, arguments)
    };
  }
}
```

### 2. Rate Limiting
```javascript
class RateLimitedAgent {
  constructor() {
    this.requestQueue = [];
    this.processing = false;
  }
  
  async callTool(toolName, arguments) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ toolName, arguments, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    const request = this.requestQueue.shift();
    
    try {
      const result = await this.executeTool(request.toolName, request.arguments);
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.processing = false;
      // Add delay between requests
      setTimeout(() => this.processQueue(), 1000);
    }
  }
}
```

### 3. Caching
```javascript
class CachedAgent {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }
  
  async callTool(toolName, arguments, useCache = true) {
    const cacheKey = `${toolName}:${JSON.stringify(arguments)}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }
    
    const result = await mcp.callTool(toolName, arguments);
    
    if (useCache) {
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **MCP Server Not Starting**
   - Check if port is available
   - Verify environment variables
   - Check server logs

2. **Tool Calls Failing**
   - Verify tool names match exactly
   - Check argument schemas
   - Ensure proper authentication

3. **Performance Issues**
   - Implement caching
   - Add rate limiting
   - Use async/await properly

### Debug Mode
```javascript
// Enable debug logging
const debugAgent = {
  async callTool(toolName, arguments) {
    console.log(`🔍 Calling tool: ${toolName}`);
    console.log(`📥 Arguments:`, arguments);
    
    const start = Date.now();
    const result = await mcp.callTool(toolName, arguments);
    const duration = Date.now() - start;
    
    console.log(`✅ Tool completed in ${duration}ms`);
    console.log(`📤 Result:`, result);
    
    return result;
  }
};
```

## 🎯 Next Steps

1. **Customize Tools**: Modify existing tools or add new ones
2. **Extend Functionality**: Add more analysis capabilities
3. **Integration**: Connect with your existing DevOps tools
4. **Scaling**: Implement multi-repository analysis
5. **AI Enhancement**: Improve recommendation algorithms

## 📚 Additional Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [DevX360 DORA Implementation](README.md)
- [API Documentation](api/README.md)
- [Test Examples](__tests__/)

---

**Your MCP tools are now ready to power intelligent DevOps agents! 🚀**
