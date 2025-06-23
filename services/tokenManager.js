import { Octokit } from 'octokit';

const tokens = [
  process.env.GITHUB_TOKEN_1,
  process.env.GITHUB_TOKEN_2,
];

let index = 0;

function getNextOctokit() {
  const token = tokens[index];
  index = (index + 1) % tokens.length;

  return new Octokit({
    auth: token,
    request: { timeout: 30000 },
    throttle: {
      onRateLimit: (retryAfter, options) => {
        console.log(`Rate limit hit for token ${index}, waiting ${retryAfter}s...`);
        return true;
      },
      onSecondaryRateLimit: (retryAfter, options) => {
        console.log(`Secondary rate limit for token ${index}, waiting ${retryAfter}s...`);
        return true;
      }
    }
  });
}

export { getNextOctokit };