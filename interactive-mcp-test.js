import readline from 'readline';
import { getDORAMetrics } from './Data Collection/universal-dora-service.js';
import { getRepositoryInfo } from './Data Collection/repository-info-service.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function interactiveMCPTest() {
  console.log('🚀 **DevX360 MCP Tools Interactive Test**\n');
  console.log('Available commands:');
  console.log('1. "dora <repo-url>" - Get DORA metrics');
  console.log('2. "insights <repo-url>" - Get repository insights');
  console.log('3. "help" - Show this help');
  console.log('4. "quit" - Exit\n');
  
  const askQuestion = () => {
    rl.question('🤖 MCP Tool > ', async (input) => {
      const [command, ...args] = input.trim().split(' ');
      
      if (command === 'quit') {
        console.log('👋 Goodbye!');
        rl.close();
        return;
      }
      
      if (command === 'help') {
        console.log('\nAvailable commands:');
        console.log('1. "dora <repo-url>" - Get DORA metrics');
        console.log('2. "insights <repo-url>" - Get repository insights');
        console.log('3. "help" - Show this help');
        console.log('4. "quit" - Exit\n');
        askQuestion();
        return;
      }
      
      if (command === 'dora' && args.length > 0) {
        const repoUrl = args.join(' ');
        console.log(`\n📊 Analyzing DORA metrics for: ${repoUrl}`);
        try {
          const metrics = await getDORAMetrics(repoUrl);
          console.log(`\n🚀 **DORA Results:**`);
          console.log(`   • Deployments: ${metrics.deployment_frequency.total_deployments}`);
          console.log(`   • Lead Time: ${metrics.lead_time.average_days} days`);
          console.log(`   • MTTR: ${metrics.mttr.average_days} days`);
          console.log(`   • Failure Rate: ${metrics.change_failure_rate.failure_rate}\n`);
        } catch (error) {
          console.log(`❌ Error: ${error.message}\n`);
        }
        askQuestion();
        return;
      }
      
      if (command === 'insights' && args.length > 0) {
        const repoUrl = args.join(' ');
        console.log(`\n🔍 Getting insights for: ${repoUrl}`);
        try {
          const repoInfo = await getRepositoryInfo(repoUrl);
          console.log(`\n📈 **Repository Insights:**`);
          console.log(`   • Name: ${repoInfo.name}`);
          console.log(`   • Language: ${repoInfo.primary_language}`);
          console.log(`   • Stars: ${repoInfo.stars}`);
          console.log(`   • Contributors: ${repoInfo.total_contributors}`);
          console.log(`   • Open Issues: ${repoInfo.open_issues}\n`);
        } catch (error) {
          console.log(`❌ Error: ${error.message}\n`);
        }
        askQuestion();
        return;
      }
      
      console.log('❌ Unknown command. Type "help" for available commands.\n');
      askQuestion();
    });
  };
  
  askQuestion();
}

interactiveMCPTest().catch(console.error);
