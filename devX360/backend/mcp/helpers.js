// Extracted pure helpers from mcp-server.js for unit testing
export function calculateTrend(data) {
  if (data.length < 2) return 'Insufficient data';
  const recent = data.slice(-3).reduce((a, b) => a + b, 0);
  const previous = data.slice(-6, -3).reduce((a, b) => a + b, 0);
  if (recent > previous * 1.2) return 'Increasing';
  if (recent < previous * 0.8) return 'Decreasing';
  return 'Stable';
}

export function generateInsights(metrics, repoInfo) {
  const insights = [];
  if (metrics.deployment_frequency.total_deployments === 0) {
    insights.push('No deployments found');
  } else if (metrics.deployment_frequency.total_deployments < 5) {
    insights.push('Low deployment frequency');
  } else {
    insights.push('Good deployment frequency');
  }
  if (metrics.lead_time.average_days > 7) {
    insights.push('High lead time');
  } else if (metrics.lead_time.average_days < 2) {
    insights.push('Excellent lead time');
  }
  if (metrics.mttr.average_days > 4) {
    insights.push('Slow recovery time');
  } else {
    insights.push('Good recovery time');
  }
  const failureRate = parseFloat(metrics.change_failure_rate.failure_rate);
  if (failureRate > 0.15) {
    insights.push('High failure rate');
  } else if (failureRate < 0.05) {
    insights.push('Excellent reliability');
  }
  return insights.join('\n');
}
