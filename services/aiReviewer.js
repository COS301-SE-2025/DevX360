import fetch from "node-fetch";

// Cache for processed summaries to avoid reprocessing
const summaryCache = new Map();

// Maximum summary size to prevent oversized prompts
const MAX_SUMMARY_SIZE = 15000; // characters

/**
 * Truncates summary if it's too large for AI processing
 * @param {string} summary - The summary content
 * @param {number} maxSize - Maximum size in characters
 * @returns {string} - Truncated summary with indicator
 */
function truncateSummary(summary, maxSize = MAX_SUMMARY_SIZE) {
  if (summary.length <= maxSize) {
  return summary;
  }
  
  const truncated = summary.substring(0, maxSize);
  return `${truncated}\n\n... [Summary truncated - too large for full analysis]`;
}

/**
 * Generates optimized prompt for DORA analysis
 * @param {Array} interpretedFiles - Array of interpreted file objects
 * @param {Object} doraMetrics - DORA metrics object
 * @returns {string} - Generated prompt
 */
function generateDORAPrompt(interpretedFiles, doraMetrics) {
  // Create a cache key for this analysis
  const cacheKey = JSON.stringify({
    files: interpretedFiles.map(f => ({ path: f.file, size: f.size })),
    metrics: doraMetrics
  });
  
  // Check cache first
  if (summaryCache.has(cacheKey)) {
    return summaryCache.get(cacheKey);
  }
  
  // Optimize summary generation
  const summary = interpretedFiles
    .map(f => `File: ${f.file}\n${f.interpretation}`)
    .join("\n\n");
  
  const truncatedSummary = truncateSummary(summary);
  
  const prompt = `You are a Senior DevOps Engineer and DORA Metrics Expert with 15+ years of experience in enterprise software delivery, CI/CD optimization, and performance engineering. You specialize in transforming development practices and achieving elite DORA performance levels.

**TASK**: Provide an expert-level DORA metrics analysis and strategic improvement roadmap for this codebase.

**CURRENT DORA METRICS ASSESSMENT**:
- **Lead Time for Changes**: ${JSON.stringify(doraMetrics.lead_time)} (Target: <1 day for Elite)
- **Deployment Frequency**: ${JSON.stringify(doraMetrics.deployment_frequency)} (Target: Multiple per day for Elite)
- **Mean Time to Recovery (MTTR)**: ${JSON.stringify(doraMetrics.mttr)} (Target: <1 hour for Elite)
- **Change Failure Rate (CFR)**: ${JSON.stringify(doraMetrics.change_failure_rate)} (Target: 0-15% for Elite)

**CODEBASE ANALYSIS**:
${truncatedSummary}

**REQUIRED EXPERT ANALYSIS**:

## 1. **DORA MATURITY ASSESSMENT**
- **Current Performance Tier**: Elite/High/Medium/Low with specific metric breakdown
- **Gap Analysis**: Precise gaps between current and elite DORA performance
- **Benchmarking**: Compare against industry standards and similar organizations
- **Trend Analysis**: Identify patterns and trajectory of current metrics

## 2. **CODE QUALITY IMPACT ON DORA METRICS**
- **Deployment Frequency Blockers**: Code quality issues preventing frequent deployments
- **Lead Time Bottlenecks**: Development practices extending cycle times
- **MTTR Risk Factors**: Code complexity and technical debt affecting recovery time
- **CFR Contributors**: Code quality issues likely causing production failures

## 3. **TECHNICAL DEBT & DORA CORRELATION**
- **High-Impact Technical Debt**: Specific debt items with highest DORA impact
- **Architectural Constraints**: System design limitations affecting delivery velocity
- **Testing Coverage Gaps**: Areas where insufficient testing impacts CFR and MTTR
- **Monitoring & Observability**: Gaps affecting incident detection and resolution

## 4. **STRATEGIC IMPROVEMENT ROADMAP**
- **Immediate Actions (0-30 days)**: Quick wins for immediate DORA improvement
- **Short-term Initiatives (1-3 months)**: Structural improvements for sustainable gains
- **Long-term Strategy (3-12 months)**: Architectural and cultural transformations
- **Success Metrics**: Specific KPIs to measure improvement progress

## 5. **BUSINESS IMPACT ANALYSIS**
- **Cost Implications**: Financial impact of current vs. improved DORA performance
- **Competitive Advantage**: How DORA improvements create market differentiation
- **Risk Mitigation**: How improved metrics reduce operational and business risks
- **ROI Projections**: Expected return on investment for improvement initiatives

## 6. **IMPLEMENTATION STRATEGY**
- **Team Structure**: Recommended organizational changes for DORA optimization
- **Tooling Recommendations**: Specific tools and technologies for metric improvement
- **Process Changes**: CI/CD and development workflow optimizations
- **Cultural Transformation**: Leadership and team behavior changes needed

**EXPECTED OUTPUT FORMAT**:
Provide an executive-level analysis suitable for CTO/VP Engineering review. Include specific metrics, actionable recommendations, and business justification. Use data-driven insights and industry benchmarks.

**ANALYSIS QUALITY STANDARD**: This analysis will inform strategic technology decisions and resource allocation. Ensure expert-level depth, actionable insights, and measurable outcomes.`.trim();
  
  // Cache the result
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
        model: "mistral",
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 2000
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

export { analyzeWithMistral };