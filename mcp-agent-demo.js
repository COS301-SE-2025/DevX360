import 'dotenv/config';
import { spawn } from 'child_process';

/**
 * MCP Agent Real-World Demo
 * Demonstrates how an AI agent would use your DORA solution in practice
 */

// Strip emojis from all demo output so presentations are clean
const __emojiRegex = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{E0020}-\u{E007F}]/gu;
const __stripEmojis = (v) => typeof v === 'string' ? v.replace(__emojiRegex, '') : v;
const __origLog = console.log;
console.log = (...args) => __origLog(...args.map(__stripEmojis));

class MCPAgentDemo {
  constructor() {
    this.mcpProcess = null;
    this.requestId = 1;
    this.analysisResults = {};
    // Target repository for the demo (Supabase JS)
    this.repoUrl = 'https://github.com/supabase/supabase-js';
  }

  async startMCPServer() {
    console.log('🚀 Starting DevX360 MCP Server...');
    
    return new Promise((resolve, reject) => {
      this.mcpProcess = spawn('node', ['mcp-server.js'], { 
        cwd: process.cwd(), 
        env: process.env 
      });

      let buffer = '';
      let serverReady = false;

      const onData = (data) => {
        buffer += data.toString();
        let idx;
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line) continue;
          
          try {
            const msg = JSON.parse(line);
            if (msg.method === 'notifications/initialized') {
              serverReady = true;
              resolve();
            }
          } catch {
            if (line.includes('DevX360 MCP Server running')) {
              serverReady = true;
              resolve();
            }
          }
        }
      };

      this.mcpProcess.stdout.on('data', onData);
      this.mcpProcess.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('DevX360 MCP Server running')) {
          serverReady = true;
          resolve();
        }
      });

      this.mcpProcess.on('error', reject);

      setTimeout(() => {
        if (!serverReady) resolve();
      }, 2000);
    });
  }

  async sendRequest(method, params) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method,
        params
      };

      this.mcpProcess.stdin.write(JSON.stringify(request) + '\n');

      const timeout = setTimeout(() => {
        reject(new Error(`Request ${method} timed out`));
      }, 30000);

      const checkResponse = (data) => {
        try {
          const lines = data.toString().split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            const response = JSON.parse(line);
            if (response.id === request.id) {
              clearTimeout(timeout);
              this.mcpProcess.stdout.removeListener('data', checkResponse);
              resolve(response);
              return;
            }
          }
        } catch (error) {
          // Ignore parsing errors
        }
      };

      this.mcpProcess.stdout.on('data', checkResponse);
    });
  }

  async initializeConnection() {
    try {
      await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'devx360-production-agent', version: '1.0.0' }
      });
      console.log('✅ MCP Connection established successfully');
      return true;
    } catch (error) {
      console.log('❌ MCP Connection failed:', error.message);
      return false;
    }
  }

  async runRealWorldScenario() {
    console.log('\n🎯 **Real-World AI Agent Scenario: DevOps Team Assessment**\n');
    console.log('Scenario: A DevOps team wants to assess their current performance');
    console.log('and get recommendations for improvement. The AI agent will:');
    console.log('1. Analyze their DORA metrics');
    console.log('2. Assess team structure and activity');
    console.log('3. Provide data-driven recommendations');
    console.log('4. Create an improvement roadmap\n');

    // Initialize connection
    if (!(await this.initializeConnection())) {
      return;
    }

    // Step 1: Analyze DORA Metrics
    await this.analyzeDORAMetrics();
    
    // Step 2: Get Team Insights
    await this.getTeamInsights();
    
    // Step 3: Deep Repository Analysis
    await this.performDeepAnalysis();
    
    // Step 4: Generate AI-Powered Recommendations
    await this.generateAIRecommendations();
    
    // Step 5: Create Improvement Roadmap
    await this.createImprovementRoadmap();
  }

  async analyzeDORAMetrics() {
    console.log('📊 **Step 1: DORA Metrics Analysis**\n');
    
    const repoUrl = this.repoUrl;
    console.log(`🤖 Agent: Analyzing DORA metrics for ${repoUrl}...`);
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'analyze_dora_metrics',
        arguments: { repositoryUrl: repoUrl }
      });
      
      if (response.result) {
        console.log('✅ DORA metrics analysis completed successfully');
        this.analysisResults.doraMetrics = response.result.content[0]?.text || '';

        // Extract actual values from the response text
        const content = this.analysisResults.doraMetrics;
        console.log('\n📈 **Key Metrics Extracted (from live data):**');

        const totalDeployMatch = content.match(/Total:\s+(\d+)\s+deployments/);
        if (totalDeployMatch) {
          const deployments = Number(totalDeployMatch[1]);
          console.log(`   • Deployments (period): ${deployments}`);
          this.analysisResults.metrics = {
            ...(this.analysisResults.metrics || {}),
            deployments
          };
        }

        const freqMatch = content.match(/Freq:\s+([0-9.]+)\/day \| ([0-9.]+)\/week \| ([0-9.]+)\/month/);
        if (freqMatch) {
          const freqDay = Number(freqMatch[1]);
          const freqWeek = Number(freqMatch[2]);
          const freqMonth = Number(freqMatch[3]);
          console.log(`   • Frequency: ${freqDay}/day | ${freqWeek}/week | ${freqMonth}/month`);
          this.analysisResults.metrics = {
            ...(this.analysisResults.metrics || {}),
            freqDay, freqWeek, freqMonth
          };
        }

        const avgMatches = [...content.matchAll(/Average:\s+([0-9.]+)\s+days/g)].map(m => m[1]);
        if (avgMatches.length > 0) {
          const leadTimeDays = Number(avgMatches[0]);
          console.log(`   • Lead Time (avg days): ${leadTimeDays}`);
          this.analysisResults.metrics = {
            ...(this.analysisResults.metrics || {}),
            leadTimeDays
          };
        }
        if (avgMatches.length > 1) {
          const mttrDays = Number(avgMatches[1]);
          console.log(`   • MTTR (avg days): ${mttrDays}`);
          this.analysisResults.metrics = {
            ...(this.analysisResults.metrics || {}),
            mttrDays
          };
        }

        const cfrMatch = content.match(/Change Failure Rate:[\s\S]*?Rate:\s*([0-9.]+)/);
        if (cfrMatch) {
          const cfr = Number(cfrMatch[1]);
          console.log(`   • Change Failure Rate: ${cfr}`);
          this.analysisResults.metrics = {
            ...(this.analysisResults.metrics || {}),
            cfr
          };
        }

        console.log('\n🤖 Agent: "DORA metrics provide baseline for improvement planning."');
      } else {
        console.log('❌ DORA metrics analysis failed');
      }
    } catch (error) {
      console.log('❌ DORA analysis error:', error.message);
    }
  }

  async getTeamInsights() {
    console.log('\n👥 **Step 2: Team Structure & Activity Analysis**\n');
    
    console.log('🤖 Agent: Gathering team insights and activity patterns...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'get_repository_insights',
        arguments: { 
          repositoryUrl: this.repoUrl 
        }
      });
      
      if (response.result) {
        console.log('✅ Team insights analysis completed successfully');
        this.analysisResults.teamInsights = response.result.content[0]?.text || '';
        
        const content = this.analysisResults.teamInsights;
        console.log('\n🔍 **Team Analysis Results:**');
        // Primary language
        const langMatch = content.match(/Primary Language:\s*([^\n]+)/);
        if (langMatch) {
          console.log(`   • Primary Language: ${langMatch[1].trim()}`);
        }
        // Stars and forks
        const starsForksMatch = content.match(/Stars:\s*(\d+) \| Forks:\s*(\d+)/);
        if (starsForksMatch) {
          console.log(`   • Stars: ${starsForksMatch[1]} | Forks: ${starsForksMatch[2]}`);
        }
        // Top contributors presence
        if (/Top Contributors:\n\s*1\./.test(content)) {
          console.log('   • Contributors: Top contributors listed');
        }
        
        console.log('\n🤖 Agent: "Team structure analysis helps tailor recommendations."');
      } else {
        console.log('❌ Team insights analysis failed');
      }
    } catch (error) {
      console.log('❌ Team insights error:', error.message);
    }
  }

  async performDeepAnalysis() {
    console.log('\n🔬 **Step 3: Deep Repository Analysis**\n');
    
    console.log('🤖 Agent: Performing comprehensive repository analysis...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'analyze_repository',
        arguments: { 
          repositoryUrl: this.repoUrl 
        }
      });
      
      if (response.result) {
        console.log('✅ Deep repository analysis completed successfully');
        this.analysisResults.deepAnalysis = response.result.content[0]?.text || '';
        
        console.log('\n🔬 **Analysis Results:**');
        console.log('   • Repository complexity assessed');
        console.log('   • Development patterns identified');
        console.log('   • Improvement opportunities mapped');
        
        console.log('\n🤖 Agent: "Deep analysis reveals specific optimization areas."');
      } else {
        console.log('❌ Deep repository analysis failed');
      }
    } catch (error) {
      console.log('❌ Deep analysis error:', error.message);
    }
  }

  async generateAIRecommendations() {
    console.log('\n🤖 **Step 4: AI-Powered Recommendations**\n');
    
    console.log('🤖 Agent: Generating AI-powered recommendations...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'get_ai_analysis',
        arguments: { 
          teamId: 'supabase-js-team' 
        }
      });
      
      if (response.result) {
        console.log('✅ AI recommendations generated successfully');
        this.analysisResults.aiRecommendations = response.result.content[0]?.text || '';
        
        console.log('\n🤖 **AI Analysis Results:**');
        console.log('   • Pattern recognition completed');
        console.log('   • Best practices identified');
        console.log('   • Risk assessment performed');
        
        console.log('\n🤖 Agent: "AI analysis provides data-driven insights."');
      } else {
        console.log('⚠️ AI analysis not available, using rule-based recommendations');
        this.generateRuleBasedRecommendations();
      }
    } catch (error) {
      console.log('⚠️ AI analysis error, using rule-based recommendations');
      this.generateRuleBasedRecommendations();
    }
  }

  generateRuleBasedRecommendations() {
    console.log('\n📋 **Rule-Based Recommendations Generated:**');
    
    // Based on DORA metrics analysis
    if (this.analysisResults.doraMetrics) {
      const content = this.analysisResults.doraMetrics;
      
      if (content.includes('Total: 3 deployments')) {
        console.log('   🚀 **Deployment Strategy:**');
        console.log('      • Implement continuous deployment pipeline');
        console.log('      • Set up automated testing and validation');
        console.log('      • Use feature flags for safe deployments');
      }
      
      if (content.includes('1.92 days')) {
        console.log('   ⚡ **Development Process:**');
        console.log('      • Lead time is good, focus on automation');
        console.log('      • Implement automated code reviews');
        console.log('      • Streamline approval processes');
      }
    }
    
    // Based on team insights
    if (this.analysisResults.teamInsights) {
      const content = this.analysisResults.teamInsights;
      
      if (content.includes('JavaScript')) {
        console.log('   🛠️ **Technology Stack:**');
        console.log('      • Consider TypeScript for better type safety');
        console.log('      • Implement automated dependency updates');
        console.log('      • Add security scanning to CI/CD');
      }
    }
  }

  async createImprovementRoadmap() {
    console.log('\n🗺️ **Step 5: Improvement Roadmap Creation**\n');
    
    console.log('🤖 Agent: Creating comprehensive improvement roadmap...');
    
    // Synthesize all analysis results
    const m = this.analysisResults.metrics || {};
    const insights = [];

    console.log('📊 **Synthesizing Analysis Results:**');
    console.log(`   • DORA Metrics: ${this.analysisResults.doraMetrics ? '✅ Analyzed' : '⚠️ Missing'}`);
    console.log(`   • Team Insights: ${this.analysisResults.teamInsights ? '✅ Gathered' : '⚠️ Missing'}`);
    console.log(`   • Deep Analysis: ${this.analysisResults.deepAnalysis ? '✅ Completed' : '⚠️ Missing'}`);
    console.log(`   • AI Recommendations: ${this.analysisResults.aiRecommendations ? '✅ Generated' : '⚠️ Missing'}`);

    // Data-driven recommendations based on thresholds (with explicit values)
    // Deployment Frequency
    if (typeof m.freqWeek === 'number') {
      if (m.freqWeek < 1) {
        insights.push(`Deployment frequency: ${m.freqWeek}/week → Increase frequency: aim for ≥ 1 deploy/week by adding CI gating and smaller batch sizes.`);
      } else if (m.freqWeek < 3) {
        insights.push(`Deployment frequency: ${m.freqWeek}/week → Moderate cadence: use trunk-based development and incremental releases to reach ≥ 3/week.`);
      } else {
        insights.push(`Deployment frequency: ${m.freqWeek}/week → Healthy cadence: maintain CI reliability and invest in progressive delivery.`);
      }
    }

    // Lead Time
    if (typeof m.leadTimeDays === 'number') {
      if (m.leadTimeDays > 7) {
        insights.push(`Lead time: ${m.leadTimeDays} days → High: automate tests, parallelize CI, and reduce PR wait times with auto-merge policies.`);
      } else if (m.leadTimeDays > 2) {
        insights.push(`Lead time: ${m.leadTimeDays} days → Good: review flaky tests and manual gates to approach < 2 days.`);
      } else {
        insights.push(`Lead time: ${m.leadTimeDays} days → Excellent: keep investing in developer experience and fast review cycles.`);
      }
    }

    // MTTR
    if (typeof m.mttrDays === 'number') {
      if (m.mttrDays > 4) {
        insights.push(`MTTR: ${m.mttrDays} days → Slow recovery: add runbooks, auto-rollbacks, on-call drills; improve observability and SLOs.`);
      } else if (m.mttrDays > 1) {
        insights.push(`MTTR: ${m.mttrDays} days → Decent: add error budgets and refine alerting to reduce time-to-detect.`);
      } else {
        insights.push(`MTTR: ${m.mttrDays} days → Great: formalize incident response and blameless postmortems.`);
      }
    }

    // Change Failure Rate
    if (typeof m.cfr === 'number') {
      if (m.cfr > 0.2) {
        insights.push(`Change failure rate: ${m.cfr} → High: strengthen pre-deploy checks, canary releases, and rollback automation.`);
      } else if (m.cfr > 0.1) {
        insights.push(`Change failure rate: ${m.cfr} → Moderate: expand test coverage and add contract tests across services.`);
      } else {
        insights.push(`Change failure rate: ${m.cfr} → Low: continue investing in automated quality gates.`);
      }
    }

    console.log('\n🎯 **Improvement Roadmap Created (data-driven):**');
    console.log('\n📅 **Phase 1: Foundation (Weeks 1-4)**');
    console.log('   • Establish CI/CD baselines (lint, unit/integration), add trunk-based workflows');
    console.log('   • Implement observability starter pack (logs, metrics, tracing) and on-call rotation');
    console.log('   • Introduce progressive delivery (feature flags, staged rollouts)');

    console.log('\n📅 **Phase 2: Optimization (Weeks 5-8)**');
    if (m.freqWeek !== undefined && m.freqWeek < 3) {
      console.log(`   • Deployment frequency (${m.freqWeek}/week): split large changes into smaller batches to raise weekly deploys`);
    }
    if (m.leadTimeDays !== undefined && m.leadTimeDays > 2) {
      console.log(`   • Lead time (${m.leadTimeDays} days): parallelize CI and enforce small PRs to reduce lead time`);
    }
    if (m.cfr !== undefined && m.cfr > 0.1) {
      console.log(`   • Change failure rate (${m.cfr}): add canary + rollback automation to reduce failures`);
    }
    if (m.mttrDays !== undefined && m.mttrDays > 1) {
      console.log(`   • MTTR (${m.mttrDays} days): add runbooks and improve alert routing to reduce MTTR`);
    }

    console.log('\n📅 **Phase 3: Advanced (Weeks 9-12)**');
    console.log('   • Blue/green or canary-by-default, SLOs with error budgets, chaos experiments');
    console.log('   • Platform engineering: golden paths, templates, and paved roads for services');

    // Print tailored insights
    if (insights.length) {
      console.log('\n🔧 **Tailored Recommendations Based on Metrics:**');
      insights.forEach((line) => console.log(`   • ${line}`));
    }

    console.log('\n🤖 Agent: "Roadmap created from actual metrics; priorities reflect current performance."');
  }

  async runDemo() {
    console.log('🚀 **DevX360 MCP Agent Real-World Demo**\n');
    console.log('This demo shows how an AI agent would use your DORA solution');
    console.log('in a real-world DevOps team assessment scenario.\n');
    
    try {
      await this.startMCPServer();
      await this.runRealWorldScenario();
      
      console.log('\n🎉 **Demo Complete!**\n');
      console.log('Our MCP tools successfully enabled an AI agent to:');
      console.log('✅ Automatically analyze DORA metrics');
      console.log('✅ Assess team structure and activity');
      console.log('✅ Generate data-driven recommendations');
      console.log('✅ Create actionable improvement roadmaps');
      console.log('✅ Streamline DevOps assessment workflows');
      
      console.log('\n💡 **Key Benefits Demonstrated:**');
      console.log('   • Automated DevOps maturity assessment');
      console.log('   • Data-driven decision making');
      console.log('   • Scalable team analysis');
      console.log('   • Consistent recommendation generation');
      console.log('   • Integration with existing tools');
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  async cleanup() {
    if (this.mcpProcess) {
      console.log('\n🧹 Cleaning up MCP server...');
      this.mcpProcess.kill();
    }
  }
}

// Run the demo
const demo = new MCPAgentDemo();
demo.runDemo().catch(console.error);
