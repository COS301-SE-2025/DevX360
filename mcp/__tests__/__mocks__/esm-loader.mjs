// ESM loader to mock specific imports in child process
export async function load(url, context, nextLoad) {
  if (url.endsWith('/Data%20Collection/universal-dora-service.js') || url.includes('/Data%20Collection/universal-dora-service.js')) {
    const source = `export async function getDORAMetrics(url){
      return {
        repository: { name: 'repo', owner: 'owner', full_name: 'owner/repo', url },
        analysis_period: { days_back: 30, start_date: '2025-08-01T00:00:00Z', end_date: '2025-08-30T00:00:00Z' },
        deployment_frequency: {
          total_deployments: 3,
          analysis_period_days: 30,
          perWeek: [1,1,1],
          perDay: [],
          perMonth: [3],
          months: ['2025-08'],
          frequency_per_day: '0.100',
          frequency_per_week: '1.000',
          frequency_per_month: '3.000'
        },
        lead_time: { average_days: '1.77', min_days: '0.10', max_days: '3.00', total_prs_analyzed: 10 },
        mttr: { average_days: '2.50', min_days: '0.20', max_days: '10.0', total_incidents_analyzed: 5 },
        change_failure_rate: { failure_rate: '0.10', confidence: 'high', total_deployments: 3, deployment_failures: 0 },
        data_summary: { releases_count: 3, commits_count: 10, pull_requests_count: 10, issues_count: 5, analysis_period_days: 30, fetched_at: '2025-08-30T00:00:00Z' }
      };
    }`;
    return { format: 'module', shortCircuit: true, source };
  }
  if (url.endsWith('/Data%20Collection/repository-info-service.js') || url.includes('/Data%20Collection/repository-info-service.js')) {
    const source = `export async function getRepositoryInfo(url){
      return { name: 'repo', full_name: 'owner/repo', description: '', primary_language: 'JS', stars: 1, forks: 0,
        contributors: [], languages: {}, created_at: '2020-01-01T00:00:00Z', updated_at: '2025-08-01T00:00:00Z', open_issues: 0 };
    }
    export function parseGitHubUrl(u){ return { owner: 'owner', repo: 'repo' }; }`;
    return { format: 'module', shortCircuit: true, source };
  }
  return nextLoad(url, context);
}
