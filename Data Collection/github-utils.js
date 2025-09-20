/**
 * Shared GitHub helpers for Data Collection services
 */

/**
 * Parses a GitHub repository URL and returns owner/repo with basic validation.
 * @param {string} repositoryUrl
 * @returns {{ owner: string, repo: string }}
 * @throws {Error}
 */
export function parseGitHubUrl(repositoryUrl) {
  try {
    const url = new URL(repositoryUrl);

    if (url.hostname !== 'github.com') {
      throw new Error('Invalid GitHub URL: hostname must be github.com');
    }

    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub URL: must contain owner and repository name');
    }

    const owner = pathParts[0];
    const repo = pathParts[1].replace(/\.git$/, '');
    return { owner, repo };
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Invalid URL format');
    }
    throw error;
  }
}

/**
 * Convenience tuple extractor from URL.
 * @param {string} url
 * @returns {[string, string]}
 */
export function extractOwnerAndRepo(url) {
  const parsed = parseGitHubUrl(url);
  return [parsed.owner, parsed.repo];
}


