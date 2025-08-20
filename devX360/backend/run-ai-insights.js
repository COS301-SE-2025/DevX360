import 'dotenv/config';
import { performDORAAnalysis } from './services/codeInterpretor.js';
import { extractOwnerAndRepo } from './Data Collection/repository-info-service.js';

async function main() {
  const repoUrl = process.argv[2] || 'https://github.com/facebook/react';
  const [owner, repo] = extractOwnerAndRepo(repoUrl);

  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY in environment. Please set it before running.');
    process.exit(1);
  }

  console.log(`🤖 Generating AI DORA insights for ${owner}/${repo}...`);
  try {
    const result = await performDORAAnalysis(owner, repo, {});
    console.log('\n===== AI Insights =====\n');
    console.log(result.insights);
    console.log('\n=======================\n');
  } catch (err) {
    console.error('❌ AI insights failed:', err.message);
    process.exit(1);
  }
}

main();
