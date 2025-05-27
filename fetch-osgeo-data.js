const { Octokit } = require('octokit');

// Initialize Octokit with proper rate limit handling
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  throttle: {
    onRateLimit: (retryAfter, options) => {
      console.log(`Rate limit hit, waiting ${retryAfter} seconds...`);
      return true;
    },
    onSecondaryRateLimit: (retryAfter, options) => {
      console.log(`Secondary rate limit hit, waiting ${retryAfter} seconds...`);
      return true;
    }
  }
});

// Helper function to add delay between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchRepositoryMetrics(owner, repo) {
  try {
    console.log(`Fetching data for ${repo}...`);
    
    // Get releases for deployment frequency
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner,
      repo,
      per_page: 100
    });
    await delay(1000); // 1 second delay

    // Get tags as alternative deployment indicators
    const { data: tags } = await octokit.rest.repos.listTags({
      owner,
      repo,
      per_page: 100
    });
    await delay(1000);

    // Get commits for lead time calculation
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 100
    });
    await delay(1000);

    // Get pull requests for better lead time calculation
    const { data: pullRequests } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'closed',
      per_page: 100
    });
    await delay(1000);

    // Get issues with labels for better MTTR calculation
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'closed',
      per_page: 100,
      labels: 'bug'
    });
    await delay(1000);

    // Calculate metrics
    const metrics = {
      name: repo,
      deployment_frequency: calculateDeploymentFrequency(releases, tags),
      lead_time: calculateLeadTime(pullRequests, commits),
      mttr: calculateMTTR(issues),
      change_failure_rate: calculateChangeFailureRate(releases, issues)
    };

    console.log(`Successfully processed ${repo}`);
    return metrics;
  } catch (error) {
    if (error.status === 403) {
      console.error(`Rate limit exceeded for ${repo}. Waiting 60 seconds...`);
      await delay(60000); // Wait 1 minute
      return fetchRepositoryMetrics(owner, repo); // Retry
    }
    console.error(`Error fetching metrics for ${repo}:`, error.message);
    return null;
  }
}

function calculateDeploymentFrequency(releases, tags) {
  const allDeployments = [
    ...releases.map(r => new Date(r.created_at)),
    ...tags
      .map(t => {
        // Safely check for commit and author date
        if (t.commit && t.commit.commit && t.commit.commit.author && t.commit.commit.author.date) {
          return new Date(t.commit.commit.author.date);
        }
        return null;
      })
      .filter(date => date !== null)
  ].sort((a, b) => a - b);

  if (allDeployments.length === 0) return 'No deployments found';
  if (allDeployments.length === 1) return {
    total_deployments: 1,
    time_span_days: 0,
    frequency_per_day: 'N/A (single deployment)'
  };
  
  const timeSpan = allDeployments[allDeployments.length - 1] - allDeployments[0];
  const days = timeSpan / (1000 * 60 * 60 * 24);
  
  return {
    total_deployments: allDeployments.length,
    time_span_days: Math.round(days),
    frequency_per_day: (allDeployments.length / days).toFixed(2)
  };
}

function calculateLeadTime(pullRequests, commits) {
  if (!pullRequests || pullRequests.length === 0) return 'No pull requests found';

  const leadTimes = pullRequests.map(pr => {
    const created = new Date(pr.created_at);
    const merged = new Date(pr.merged_at);
    if (!merged) return null;
    return (merged - created) / (1000 * 60 * 60 * 24); // Convert to days
  }).filter(time => time !== null);

  if (leadTimes.length === 0) return 'No valid lead times found';

  return {
    average_days: (leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length).toFixed(2),
    min_days: Math.min(...leadTimes).toFixed(2),
    max_days: Math.max(...leadTimes).toFixed(2),
    total_prs_analyzed: leadTimes.length
  };
}

function calculateMTTR(issues) {
  if (!issues || issues.length === 0) return 'No bug issues found';

  const resolutionTimes = issues
    .filter(issue => issue.closed_at && issue.created_at)
    .map(issue => {
      const created = new Date(issue.created_at);
      const closed = new Date(issue.closed_at);
      return (closed - created) / (1000 * 60 * 60 * 24); // Convert to days
    });

  if (resolutionTimes.length === 0) return 'No valid resolution times found';

  return {
    average_days: (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(2),
    min_days: Math.min(...resolutionTimes).toFixed(2),
    max_days: Math.max(...resolutionTimes).toFixed(2),
    total_bugs_analyzed: resolutionTimes.length
  };
}

function calculateChangeFailureRate(releases, issues) {
  if (!releases || releases.length === 0) return 'No releases found';

  // Count releases that were followed by bug fixes
  const releaseDates = releases.map(r => new Date(r.created_at));
  const bugFixes = issues.filter(issue => {
    const issueDate = new Date(issue.closed_at);
    // Check if bug was fixed within 7 days of a release
    return releaseDates.some(releaseDate => 
      Math.abs(issueDate - releaseDate) <= 7 * 24 * 60 * 60 * 1000
    );
  });

  return {
    total_releases: releases.length,
    releases_with_bugs: bugFixes.length,
    failure_rate: ((bugFixes.length / releases.length) * 100).toFixed(2) + '%'
  };
}

async function fetchOSGeoRepositories() {
  try {
    console.log('Fetching OSGeo repositories...');
    const { data: repos } = await octokit.rest.repos.listForOrg({
      org: 'OSGeo',
      per_page: 100
    });

    console.log(`Found ${repos.length} repositories. Starting to fetch metrics...`);
    
    // Process repositories in smaller batches
    const batchSize = 5;
    const validMetrics = [];
    
    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize);
      console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(repos.length/batchSize)}...`);
      
      const batchPromises = batch.map(repo => 
        fetchRepositoryMetrics('OSGeo', repo.name)
      );
      
      const batchResults = await Promise.all(batchPromises);
      validMetrics.push(...batchResults.filter(m => m !== null));
      
      // Add delay between batches
      if (i + batchSize < repos.length) {
        console.log('Waiting 5 seconds before next batch...');
        await delay(5000);
      }
    }

    // Save to a JSON file
    const fs = require('fs');
    fs.writeFileSync('osgeo-metrics.json', JSON.stringify(validMetrics, null, 2));
    
    console.log(`Successfully fetched metrics for ${validMetrics.length} repositories`);
    console.log('Data has been saved to osgeo-metrics.json');
  } catch (error) {
    console.error('Error fetching repository data:', error.message);
  }
}

// Run the function
fetchOSGeoRepositories(); 