import { getNextOctokit } from './tokenManager.js';
import { concurrentMap } from '../api/utils/concurrentMap.js';

// Helper function to add delay between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches code files from a GitHub repository
 * 
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - Directory path (default: root)
 * @param {number} depth - Recursion depth (default: 2)
 * @param {Array<string>} fileExtensions - File extensions to fetch (default: common code files)
 * @returns {Promise<Array>} Array of file objects with path and content
 */
async function fetchRepoCodeFiles(owner, repo, path = "", depth = 2, fileExtensions = null) {
  const results = [];

  const defaultExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', 
    '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.html', 
    '.css', '.scss', '.sass', '.json', '.xml', '.yaml', '.yml', '.md',
    '.sh', '.bash', '.zsh', '.fish', '.sql', '.r', '.m', '.pl', '.lua'
  ];
  const extensions = fileExtensions || defaultExtensions;

  try {
    const octokit = getNextOctokit();
    console.log(`Fetching files from ${owner}/${repo}${path ? '/' + path : ''}...`);
    
    const { data: contents } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path
    });

    // Filter only files matching extensions
    const validFiles = contents.filter(item =>
      item.type === "file" &&
      extensions.some(ext => item.name.toLowerCase().endsWith(ext))
    );

    // Concurrently fetch content of valid files
    const fileResults = await concurrentMap(validFiles, 5, async (item) => {
      const client = getNextOctokit();
      try {
        const fileContent = await client.rest.repos.getContent({
          owner,
          repo,
          path: item.path
        });

        const content = Buffer.from(fileContent.data.content, 'base64').toString();

        return {
          path: item.path,
          content,
          size: content.length,
          language: getLanguageFromExtension(item.name),
          fetched_at: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error fetching file ${item.path}:`, error.message);
        return null;
      }
    });

    results.push(...fileResults.filter(Boolean));

    // Recursively fetch directories
    const directories = contents.filter(item => item.type === "dir");
    for (const dir of directories) {
      if (depth > 0) {
        try {
          const subResults = await fetchRepoCodeFiles(
            owner,
            repo,
            dir.path,
            depth - 1,
            extensions
          );
          results.push(...subResults);
        } catch (err) {
          console.error(`Error fetching directory ${dir.path}:`, err.message);
        }
      }
    }

    console.log(`Finished fetching ${results.length} files from ${owner}/${repo}${path ? '/' + path : ''}`);
    return results;

  } catch (error) {
    if (error.status === 404) {
      console.error(`Path not found: ${path}`);
      return [];
    } else if (error.status === 403) {
      const resetTime = new Date(error.headers["x-ratelimit-reset"] * 1000);
      const waitTime = resetTime - Date.now() + 5000;
      console.warn(`Rate limited. Waiting ${Math.round(waitTime/1000)} seconds...`);
      await delay(waitTime);
      return fetchRepoCodeFiles(owner, repo, path, depth, extensions);
    } else {
      console.error(`Error:`, error.message);
      throw error;
    }
  }
}

/**
 * Determines programming language from file extension
 * 
 * @param {string} filename - The filename
 * @returns {string} Programming language name
 */
function getLanguageFromExtension(filename) {
  const extension = filename.toLowerCase().split('.').pop();
  
  const languageMap = {
    'js': 'JavaScript',
    'jsx': 'React JSX',
    'ts': 'TypeScript',
    'tsx': 'TypeScript React',
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'go': 'Go',
    'rs': 'Rust',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'scala': 'Scala',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'json': 'JSON',
    'xml': 'XML',
    'yaml': 'YAML',
    'yml': 'YAML',
    'md': 'Markdown',
    'sh': 'Shell',
    'bash': 'Bash',
    'zsh': 'Zsh',
    'fish': 'Fish',
    'sql': 'SQL',
    'r': 'R',
    'm': 'MATLAB',
    'pl': 'Perl',
    'lua': 'Lua'
  };
  
  return languageMap[extension] || 'Unknown';
}

/**
 * Fetches only specific file types
 * 
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {Array<string>} extensions - Array of file extensions (e.g., ['.js', '.py'])
 * @param {string} path - Directory path (default: root)
 * @param {number} depth - Recursion depth (default: 2)
 * @returns {Promise<Array>} Array of file objects
 */
async function fetchSpecificFileTypes(owner, repo, extensions, path = "", depth = 2) {
  return fetchRepoCodeFiles(owner, repo, path, depth, extensions);
}

/**
 * Fetches all code files (common programming languages)
 * 
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - Directory path (default: root)
 * @param {number} depth - Recursion depth (default: 2)
 * @returns {Promise<Array>} Array of file objects
 */
async function fetchAllCodeFiles(owner, repo, path = "", depth = 2) {
  return fetchRepoCodeFiles(owner, repo, path, depth);
}

export { 
  fetchRepoCodeFiles,
  fetchSpecificFileTypes,
  fetchAllCodeFiles,
  getLanguageFromExtension
};