import { Octokit } from 'octokit';

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
  
  // Default file extensions for common programming languages
  const defaultExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', 
    '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.html', 
    '.css', '.scss', '.sass', '.json', '.xml', '.yaml', '.yml', '.md',
    '.sh', '.bash', '.zsh', '.fish', '.sql', '.r', '.m', '.pl', '.lua'
  ];
  
  const extensions = fileExtensions || defaultExtensions;
  
  try {
    console.log(`Fetching files from ${owner}/${repo}${path ? '/' + path : ''}...`);
    
    const { data: contents } = await octokit.rest.repos.getContent({ 
      owner, 
      repo, 
      path 
    });
    
    await delay(1000); // Rate limiting
    
    for (const item of contents) {
      if (item.type === "file") {
        // Check if file extension matches our criteria
        const hasValidExtension = extensions.some(ext => 
          item.name.toLowerCase().endsWith(ext.toLowerCase())
        );
        
        if (hasValidExtension) {
          try {
            console.log(`Fetching content for: ${item.path}`);
            const fileContent = await octokit.rest.repos.getContent({ 
              owner, 
              repo, 
              path: item.path 
            });
            
            const content = Buffer.from(fileContent.data.content, 'base64').toString();
            
            results.push({ 
              path: item.path, 
              content,
              size: content.length,
              language: getLanguageFromExtension(item.name),
              fetched_at: new Date().toISOString()
            });
            
            await delay(500); // Small delay between file fetches
            
          } catch (error) {
            console.error(`Error fetching file ${item.path}:`, error.message);
            // Continue with other files even if one fails
          }
        }
      } else if (item.type === "dir" && depth > 0) {
        try {
          const subFiles = await fetchRepoCodeFiles(
            owner, 
            repo, 
            item.path, 
            depth - 1, 
            extensions
          );
          results.push(...subFiles);
        } catch (error) {
          console.error(`Error fetching directory ${item.path}:`, error.message);
          // Continue with other directories even if one fails
        }
      }
    }
    
    console.log(`Successfully fetched ${results.length} files from ${owner}/${repo}${path ? '/' + path : ''}`);
    return results;
    
  } catch (error) {
    if (error.status === 404) {
      console.error(`Path not found: ${path}`);
      return [];
    } else if (error.status === 403) {
      console.error(`Access denied: Repository may be private or authentication failed`);
      throw error;
    } else {
      console.error(`Error fetching repository contents:`, error.message);
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