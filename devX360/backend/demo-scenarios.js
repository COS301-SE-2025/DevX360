import { getDORAMetrics } from './Data Collection/universal-dora-service.js';
import { getRepositoryInfo } from './Data Collection/repository-info-service.js';

class DevX360Demo {
  constructor() {
    this.demoRepositories = [
      'https://github.com/facebook/react',
      'https://github.com/microsoft/vscode',
      'https://github.com/vercel/next.js'
    ];
  }

  async runCopilotDemo() {
    console.log('🎬 Demo Scenario 1: AI Copilot Integration\n');
    
    const repoUrl = this.demoRepositories[0];
    console.log(`🤖 Copilot: "I'll analyze the DORA metrics for this repository..."\n`);
    
    try {
      const metrics = await getDORAMetrics(repoUrl);
      const repoInfo = await getRepositoryInfo(repoUrl);
      
      const deploymentTrend = this.calculateTrend(metrics.deployment_frequency.perWeek);
      const leadTimeTrend = this.calculateTrend([metrics.lead_time.average_days]);
      const mttrTrend = this.calculateTrend([metrics.mttr.average_days]);
      
      const insights = this.generateInsights(metrics, repoInfo);
      
      console.log(`📊 **DORA Analysis Results for ${repoInfo.name}:**\n`);
      console.log(`🚀 **Deployment Frequency:**`);
      console.log(`   • Total: ${metrics.deployment_frequency.total_deployments} deployments`);
      console.log(`   • Weekly Trend: ${deploymentTrend}`);
      console.log(`   • Per Week: [${metrics.deployment_frequency.perWeek.join(', ')}]\n`);
      
      console.log(`⏱️ **Lead Time for Changes:**`);
      console.log(`   • Average: ${metrics.lead_time.average_days} days`);
      console.log(`   • Trend: ${leadTimeTrend}`);
      console.log(`   • PRs Analyzed: ${metrics.lead_time.total_prs_analyzed}\n`);
      
      console.log(`🔄 **Mean Time to Recovery (MTTR):**`);
      console.log(`   • Average: ${metrics.mttr.average_days} days`);
      console.log(`   • Trend: ${mttrTrend}`);
      console.log(`   • Incidents: ${metrics.mttr.total_incidents_analyzed}\n`);
      
      console.log(`❌ **Change Failure Rate:**`);
      console.log(`   • Rate: ${metrics.change_failure_rate.failure_rate}`);
      console.log(`   • Confidence: ${metrics.change_failure_rate.confidence}`);
      console.log(`   • Failures: ${metrics.change_failure_rate.deployment_failures}/${metrics.change_failure_rate.total_deployments}\n`);
      
      console.log(`💡 **AI Insights:**`);
      insights.forEach(insight => console.log(`   ${insight}`));
      console.log();
      
      console.log(`📈 **Repository Stats:**`);
      console.log(`   • Language: ${repoInfo.primary_language}`);
      console.log(`   • Stars: ${repoInfo.stars}`);
      console.log(`   • Contributors: ${repoInfo.total_contributors}`);
      console.log(`   • Analysis Period: ${metrics.analysis_period.days_back} days\n`);
      
      console.log(`🤖 Copilot: "Based on the DORA analysis, here are my recommendations:"\n`);
      
      const recommendations = this.generateRecommendations(metrics, repoInfo);
      recommendations.forEach(rec => console.log(`   ${rec}`));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
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
    
    return insights;
  }

  generateRecommendations(metrics, repoInfo) {
    const recommendations = [];
    
    if (metrics.deployment_frequency.total_deployments < 5) {
      recommendations.push('🚀 **Increase deployment frequency:** Set up automated CI/CD pipeline');
    }
    
    if (metrics.lead_time.average_days > 7) {
      recommendations.push('⏱️ **Reduce lead time:** Automate testing and code review processes');
    }
    
    if (metrics.mttr.average_days > 4) {
      recommendations.push('🔄 **Improve MTTR:** Enhance monitoring and incident response procedures');
    }
    
    const failureRate = parseFloat(metrics.change_failure_rate.failure_rate);
    if (failureRate > 0.15) {
      recommendations.push('🛡️ **Reduce failure rate:** Implement better testing and rollback strategies');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('🎉 **Excellent performance:** Keep up the great work!');
    }
    
    return recommendations;
  }
}

// Run the demo
const demo = new DevX360Demo();
demo.runCopilotDemo().catch(console.error); 