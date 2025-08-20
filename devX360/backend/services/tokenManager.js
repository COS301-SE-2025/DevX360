import { Octokit } from 'octokit';

const tokens = [
  process.env.GITHUB_TOKEN_1,
  process.env.GITHUB_TOKEN_2
];

let index = 0;

function getNextOctokit() {
  const token = tokens[index];
  index = (index + 1) % tokens.length;

  return new Octokit({
    auth: token,
    throttle: {
      onRateLimit: (retryAfter) => {
        console.log(`Rate limit hit, retrying in ${retryAfter} seconds...`);
        return true;
      },
      onSecondaryRateLimit: (retryAfter) => {
        console.log(`Secondary rate limit hit, retrying in ${retryAfter} seconds...`);
        return true;
      }
    }
  });
}

export { getNextOctokit };