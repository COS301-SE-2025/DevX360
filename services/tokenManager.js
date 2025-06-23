import { Octokit } from 'octokit';

function getNextOctokit() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }

  return new Octokit({
    auth: token,
    request: { timeout: 30000 },
    throttle: {
      onRateLimit: (retryAfter, options) => {
        console.log(`Rate limit hit, waiting ${retryAfter}s...`);
        return true;
      },
      onSecondaryRateLimit: (retryAfter, options) => {
        console.log(`Secondary rate limit, waiting ${retryAfter}s...`);
        return true;
      }
    }
  });
}

export { getNextOctokit };