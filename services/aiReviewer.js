import fetch from "node-fetch";

const summaryCache = new Map();
const MAX_SUMMARY_SIZE = 1500; // Reduced significantly
const MAX_FILES_IN_SUMMARY = 6; // Reduced for speed

function truncateSummary(summary, maxSize = MAX_SUMMARY_SIZE) {
  if (summary.length <= maxSize) {
    return summary;
  }
  
  const truncated = summary.substring(0, maxSize);
  return `${truncated}\n... [truncated]`;
}

function generateDORAPrompt(interpretedFiles, doraMetrics) {
  const cacheKey = JSON.stringify({
    files: interpretedFiles.map(f => ({ path: f.file, metric: f.dora_metric })),
    metricsKeys: Object.keys(doraMetrics)
  });
  
  if (summaryCache.has(cacheKey)) {
    return summaryCache.get(cacheKey);
  }
  
  // Group files by DORA metric for focused analysis
  const filesByMetric = {
    deployment_frequency: [],
    lead_time: [],
    mttr: [],
    change_failure_rate: []
  };
  
  interpretedFiles.forEach(f => {
    const metric = f.dora_metric || 'lead_time';
    if (filesByMetric[metric]) {
      filesByMetric[metric].push(f);
    }
  });

  // Create focused summaries for each metric
  let summary = "Code Analysis Summary:\n";
  
  Object.keys(filesByMetric).forEach(metric => {
    const files = filesByMetric[metric].slice(0, 2); // Max 2 files per metric
    if (files.length > 0) {
      summary += `\n${metric.toUpperCase()}:\n`;
      files.forEach(f => {
        summary += `- ${f.file}: ${truncateInsight(f.interpretation, 80)}\n`;
      });
    }
  });

  const prompt = `DORA Analysis for Repository

Current Performance:
- Deployment Frequency: ${doraMetrics.deployment_frequency?.frequency || 'Unknown'}
- Lead Time: ${doraMetrics.lead_time?.days || 'Unknown'} days  
- MTTR: ${doraMetrics.mttr?.hours || 'Unknown'} hours
- Change Failure Rate: ${doraMetrics.change_failure_rate?.percentage || 'Unknown'}%

${truncateSummary(summary)}

Provide 2 specific recommendations for each DORA metric (max 50 words each):

1. DEPLOYMENT FREQUENCY:
   - Issue:
   - Fix:

2. LEAD TIME:
   - Issue:
   - Fix:

3. MTTR:  
   - Issue:
   - Fix:

4. CHANGE FAILURE RATE:
   - Issue:
   - Fix:`;
  
  summaryCache.set(cacheKey, prompt);
  return prompt;
}

async function analyzeWithMistral(interpretedFiles, doraMetrics) {
  try {
    const prompt = generateDORAPrompt(interpretedFiles, doraMetrics);
    
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral:instruct",
        prompt,
        stream: false,
        options: {
          temperature: 0.2,  // More focused responses
          top_p: 0.8,
          num_predict: 400,  // Shorter responses
          num_ctx: 1024     // Smaller context
        }
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.response;
  } catch (error) {
    console.error('Error in DORA analysis:', error.message);
    return `Error analyzing DORA metrics: ${error.message}`;
  }
}

function truncateInsight(interpretation, maxLength = 80) {
  if (interpretation.length <= maxLength) return interpretation;
  return interpretation.substring(0, maxLength) + '...';
}

export { analyzeWithMistral };