// services/codeFetcher.js

import { getNextOctokit } from './tokenManager.js';
import { concurrentMap } from '../api/utils/concurrentMap.js';
import { classifyFileForDORA } from './codeInterpretor.js';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Focus on DORA-relevant extensions only
const defaultExtensions = [
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
  '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.html', '.css',
  '.json', '.yaml', '.yml', '.sh', '.bash', '.sql', '.dockerfile', 
  '.tf', '.hcl', '.conf'
];

function getLanguageFromExtension(filename) {
  const extension = filename.toLowerCase().split('.').pop();
  const languageMap = {
    'js': 'JavaScript', 'jsx': 'React JSX', 'ts': 'TypeScript', 'tsx': 'TypeScript React',
    'py': 'Python', 'java': 'Java', 'cpp': 'C++', 'c': 'C', 'cs': 'C#', 'php': 'PHP',
    'rb': 'Ruby', 'go': 'Go', 'rs': 'Rust', 'swift': 'Swift', 'kt': 'Kotlin',
    'html': 'HTML', 'css': 'CSS', 'json': 'JSON', 'yaml': 'YAML', 'yml': 'YAML', 
    'sh': 'Shell', 'bash': 'Bash', 'sql': 'SQL'
  };
  return languageMap[extension] || 'Unknown';
}

// Enhanced DORA-specific filtering
function isDORARelevant(item) {
  const path = item.path.toLowerCase();
  const name = item.name.toLowerCase();
  
  // High priority DORA files
  const highPriorityPatterns = [
    // CI/CD and Deployment
    /ci\//, /\.github\/workflows/, /deploy/, /dockerfile/, /jenkins/, /pipeline/,
    /build\./, /webpack/, /gulpfile/, /package\.json/, /requirements\.txt/,
    
    // Core business logic
    /auth/, /payment/, /order/, /user/, /admin/, /api/, /controller/, /service/,
    /handler/, /processor/, /router/, /middleware/,
    
    // Error handling and monitoring
    /error/, /exception/, /log/, /monitor/, /alert/, /health/, /metric/,
    
    // Configuration and infrastructure
    /config/, /env/, /settings/, /terraform/, /ansible/,
    
    // Tests (for quality metrics)
    /test/, /spec/, /\.test\./, /\.spec\./
  ];
  
  // Skip common non-relevant files
  const skipPatterns = [
    /node_modules/, /\.git/, /dist/, /build/, /coverage/, /\.min\./,
    /vendor/, /assets/, /static/, /public/, /images/, /fonts/
  ];
  
  // Check if should skip
  if (skipPatterns.some(pattern => pattern.test(path))) {
    return false;
  }
  
  // Check if high priority
  if (highPriorityPatterns.some(pattern => pattern.test(path))) {
    return true;
  }
  
  // Include files with relevant extensions in important directories
  const relevantDirs = ['src/', 'lib/', 'app/', 'server/', 'api/', 'services/'];
  if (relevantDirs.some(dir => path.includes(dir))) {
    return defaultExtensions.some(ext => name.endsWith(ext));
  }
  
  return false;
}

async function fetchRepoCodeFiles(owner, repo, path = "", depth = 3, fileExtensions = null) {
  const results = [];
  const categoryCounts = {};
  const maxFilesPerCategory = {
    'ci_cd': 5,
    'core_logic': 8,
    'potential_risk': 5,
    'test_code': 3,
    'configuration': 4
  };

  try {
    const octokit = getNextOctokit();
    console.log(`📁 Scanning ${owner}/${repo}${path ? '/' + path : ''}...`);

    const { data: contents } = await octokit.rest.repos.getContent({ owner, repo, path });

    // Filter for DORA-relevant files only
    const relevantFiles = contents.filter(item =>
      item.type === "file" && isDORARelevant(item)
    );

    console.log(`🎯 Found ${relevantFiles.length} DORA-relevant files in ${contents.length} total files`);

    const fileResults = await concurrentMap(relevantFiles, 8, async (item) => {
      const client = getNextOctokit();
      try {
        const fileContent = await client.rest.repos.getContent({ owner, repo, path: item.path });
        const content = Buffer.from(fileContent.data.content, 'base64').toString();

        // Skip very large files
        if (content.length > 5000) {
          console.log(`⏩ Skipping large file: ${item.path} (${content.length} chars)`);
          return null;
        }

        const file = {
          path: item.path,
          content,
          size: content.length,
          language: getLanguageFromExtension(item.name),
          fetched_at: new Date().toISOString()
        };

        const category = classifyFileForDORA(file);
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;

        // Apply category limits
        if (maxFilesPerCategory[category] && categoryCounts[category] > maxFilesPerCategory[category]) {
          console.log(`📊 Category limit reached for ${category}, skipping ${file.path}`);
          return null;
        }

        console.log(`✅ Including: ${file.path} [${category}]`);
        return file;
        
      } catch (error) {
        console.error(`❌ Error fetching ${item.path}: ${error.message}`);
        return null;
      }
    });

    results.push(...fileResults.filter(Boolean));

    // Recursively scan directories (but limit depth)
    const directories = contents.filter(item => item.type === "dir");
    const relevantDirs = directories.filter(dir => {
      const dirName = dir.name.toLowerCase();
      // Skip irrelevant directories
      const skipDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', 'vendor', 'assets', 'static', 'public'];
      return !skipDirs.includes(dirName);
    });

    for (const dir of relevantDirs.slice(0, 10)) { // Limit directory traversal
      if (depth > 0) {
        const subResults = await fetchRepoCodeFiles(owner, repo, dir.path, depth - 1, fileExtensions);
        results.push(...subResults);
      }
    }

    console.log(`📊 Final category counts:`, categoryCounts);
    console.log(`✅ Fetched ${results.length} DORA-relevant files from ${owner}/${repo}${path ? '/' + path : ''}`);
    return results;

  } catch (error) {
    if (error.status === 404) {
      console.warn(`⚠️ Path not found: ${path}`);
      return [];
    } else if (error.status === 403) {
      const resetTime = new Date(error.headers["x-ratelimit-reset"] * 1000);
      const waitTime = resetTime - Date.now() + 5000;
      console.warn(`⏳ Rate limited. Waiting ${Math.round(waitTime / 1000)}s...`);
      await delay(waitTime);
      return fetchRepoCodeFiles(owner, repo, path, depth, fileExtensions);
    } else {
      console.error(`❌ Fetch error:`, error.message);
      throw error;
    }
  }
}

export {
  fetchRepoCodeFiles,
  getLanguageFromExtension
};