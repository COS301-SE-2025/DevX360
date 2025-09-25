import { Octokit } from 'octokit';

const tokens = [
  process.env.GITHUB_TOKEN_1,
  process.env.GITHUB_TOKEN_2
];

let index = 0;

function getNextOctokit() {
  const token = tokens[index];
  const tokenIndex = index + 1;
  index = (index + 1) % tokens.length;

  // Log token usage and validation
  if (!token) {
    console.error(`[TOKEN_MANAGER] Token ${tokenIndex} is missing or empty`);
  } else {
    console.error(`[TOKEN_MANAGER] Using token ${tokenIndex}: ${token.substring(0, 8)}...`);
  }

  return new Octokit({
    auth: token,
    throttle: {
      onRateLimit: (retryAfter) => {
        console.error(`[TOKEN_MANAGER] Rate limit hit on token ${tokenIndex}, retrying in ${retryAfter} seconds...`);
        return true;
      },
      onSecondaryRateLimit: (retryAfter) => {
        console.error(`[TOKEN_MANAGER] Secondary rate limit hit on token ${tokenIndex}, retrying in ${retryAfter} seconds...`);
        return true;
      }
    }
  });
}

export { getNextOctokit };