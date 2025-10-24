import { Octokit } from 'octokit';
import User from '../api/models/User.js';

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

/**
 * Validates a GitHub token by making a simple API call
 * @param {string} token - GitHub OAuth token
 * @returns {Promise<Object>} { valid: boolean, error?: string, needsReauth?: boolean }
 */
async function validateToken(token) {
  if (!token) return { valid: false };

  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.rest.users.getAuthenticated();
    return {
      valid: true,
      login: data.login,
      id: data.id
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      needsReauth: error.status === 401 || error.message.includes('Bad credentials')
    };
  }
}

/**
 * NEW FUNCTION: Gets Octokit instance with user token support
 *
 * @param {string} userId - MongoDB user ID (optional)
 * @param {boolean} useSystemFallback - Fall back to system token if user token fails (default: true)
 * @returns {Promise<Object>} { octokit, tokenType, needsReauth, canAccessPrivate }
 *
 * Usage:
 *   const { octokit, tokenType } = await getOctokit(userId);
 *   const { data } = await octokit.rest.repos.get({ owner, repo });
 */
async function getOctokit(userId = null, useSystemFallback = true) {
  // If no userId provided, use system token
  if (!userId) {
    return {
      octokit: getNextOctokit(),
      tokenType: 'system',
      needsReauth: false,
      canAccessPrivate: false
    };
  }

  // Try to get user's personal token
  try {
    const user = await User.findById(userId).select('githubAccessToken githubUsername githubScopes githubTokenValid');

    if (user?.githubAccessToken && user.githubTokenValid !== false) {
      // Quick validation
      const validation = await validateToken(user.githubAccessToken);

      if (validation.valid) {
        console.error(`[TOKEN_MANAGER] Using user token for ${user.githubUsername || userId}`);
        console.log('User GitHub scopes:', user.githubScopes);


        const hasRepoScope = user.githubScopes?.includes('repo') || user.githubScopes?.includes('public_repo');

        return {
          octokit: new Octokit({
            auth: user.githubAccessToken,
            throttle: {
              onRateLimit: (retryAfter) => {
                console.error(`[TOKEN_MANAGER] Rate limit hit on user token for ${user.githubUsername}, retrying in ${retryAfter}s`);
                return true;
              },
              onSecondaryRateLimit: (retryAfter) => {
                console.error(`[TOKEN_MANAGER] Secondary rate limit hit on user token for ${user.githubUsername}, retrying in ${retryAfter}s`);
                return true;
              }
            }
          }),
          tokenType: 'user',
          needsReauth: false,
          canAccessPrivate: hasRepoScope
        };
      }

      // Token is invalid - mark it in database
      if (validation.needsReauth) {
        console.error(`[TOKEN_MANAGER] User token invalid for ${userId}, marking for reauth`);
        await User.findByIdAndUpdate(userId, { $set: { githubTokenValid: false } });
      }
    }
  } catch (error) {
    console.error('[TOKEN_MANAGER] Error fetching user token:', error.message);
  }

  // Fall back to system token if enabled
  if (useSystemFallback) {
    console.error(`[TOKEN_MANAGER] Falling back to system token for user ${userId}`);
    return {
      octokit: getNextOctokit(),
      tokenType: 'system',
      needsReauth: true,
      canAccessPrivate: false
    };
  }

  // No fallback - return null
  return {
    octokit: null,
    tokenType: 'none',
    needsReauth: true,
    canAccessPrivate: false
  };
}

/**
 * Check if user needs to reconnect GitHub
 * @param {string} userId - MongoDB user ID
 * @returns {Promise<boolean>}
 */
async function userNeedsReauth(userId) {
  if (!userId) return false;

  try {
    const user = await User.findById(userId).select('githubAccessToken githubTokenValid');

    if (!user?.githubAccessToken) return true;
    if (user.githubTokenValid === false) return true;

    // Quick validation
    const validation = await validateToken(user.githubAccessToken);

    if (!validation.valid && validation.needsReauth) {
      await User.findByIdAndUpdate(userId, { $set: { githubTokenValid: false } });
      return true;
    }

    return false;
  } catch (error) {
    console.error('[TOKEN_MANAGER] Error checking reauth status:', error);
    return true;
  }
}

// Export both old and new functions
export {
  getNextOctokit,      // EXISTING - don't break anything
  getOctokit,          // NEW - for user token support
  validateToken,       // NEW - helper function
  userNeedsReauth      // NEW - check if user needs to reconnect
};