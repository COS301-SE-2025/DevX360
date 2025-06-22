const fetch = require("node-fetch");

// Helper function to add delay between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Interprets code files using local Ollama API
 * 
 * @param {Array} files - Array of file objects with path and content
 * @param {string} model - Ollama model to use (default: 'codellama')
 * @param {number} delayMs - Delay between requests in milliseconds (default: 1000)
 * @returns {Promise<Array>} Array of interpretation objects
 */
async function interpretCodeLocally(files, model = "codellama", delayMs = 1000) {
  const interpretations = [];
  
  console.log(`Starting code interpretation for ${files.length} files using model: ${model}`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      console.log(`Interpreting file ${i + 1}/${files.length}: ${file.path}`);
      
      const language = file.language || getLanguageFromExtension(file.path);
      
      const prompt = `
You are a senior software engineer analyzing code. Please provide a comprehensive analysis of this ${language} file.

File: ${file.path}
Language: ${language}
File Size: ${file.content.length} characters

Please analyze and summarize:
1. **Purpose**: What is the main purpose of this file?
2. **Key Functions/Classes**: What are the main functions, classes, or components?
3. **Logic Flow**: How does the code work? Describe the main logic flow.
4. **Dependencies**: What external libraries or modules does it use?
5. **Complexity**: Rate the complexity (Low/Medium/High) and explain why.
6. **Potential Issues**: Any obvious problems or areas for improvement?

Code:
\`\`\`${language.toLowerCase()}
${file.content}
\`\`\`

Provide a clear, structured analysis that would be useful for a code review or documentation.
`.trim();

      const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3, // Lower temperature for more consistent analysis
            top_p: 0.9,
            max_tokens: 2000
          }
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      interpretations.push({
        file: file.path,
        language: language,
        size: file.content.length,
        interpretation: data.response,
        model_used: model,
        interpreted_at: new Date().toISOString()
      });

      console.log(`✅ Successfully interpreted: ${file.path}`);
      
      // Add delay between requests to prevent overwhelming the API
      if (i < files.length - 1) {
        await delay(delayMs);
      }
      
    } catch (error) {
      console.error(`❌ Error interpreting ${file.path}:`, error.message);
      
      interpretations.push({
        file: file.path,
        language: file.language || 'Unknown',
        size: file.content.length,
        interpretation: `Error: ${error.message}`,
        model_used: model,
        interpreted_at: new Date().toISOString(),
        error: true
      });
    }
  }

  console.log(`🎉 Code interpretation completed. Processed ${interpretations.length} files.`);
  return interpretations;
}

/**
 * Interprets specific file types
 * 
 * @param {Array} files - Array of file objects
 * @param {Array<string>} languages - Array of programming languages to focus on
 * @param {string} model - Ollama model to use
 * @returns {Promise<Array>} Array of interpretation objects
 */
async function interpretSpecificLanguages(files, languages = ['JavaScript', 'Python', 'Java'], model = "codellama") {
  const filteredFiles = files.filter(file => {
    const fileLanguage = file.language || getLanguageFromExtension(file.path);
    return languages.includes(fileLanguage);
  });
  
  console.log(`Filtering to ${languages.join(', ')} files. Found ${filteredFiles.length} files.`);
  
  return interpretCodeLocally(filteredFiles, model);
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
 * Creates a summary report of all interpretations
 * 
 * @param {Array} interpretations - Array of interpretation objects
 * @returns {Object} Summary report
 */
function createInterpretationSummary(interpretations) {
  const summary = {
    total_files: interpretations.length,
    languages: {},
    average_file_size: 0,
    successful_interpretations: 0,
    failed_interpretations: 0,
    model_used: interpretations[0]?.model_used || 'Unknown',
    generated_at: new Date().toISOString()
  };

  let totalSize = 0;
  let successfulCount = 0;
  let failedCount = 0;

  interpretations.forEach(interpretation => {
    // Count languages
    const lang = interpretation.language;
    summary.languages[lang] = (summary.languages[lang] || 0) + 1;
    
    // Count sizes
    totalSize += interpretation.size;
    
    // Count success/failure
    if (interpretation.error) {
      failedCount++;
    } else {
      successfulCount++;
    }
  });

  summary.average_file_size = Math.round(totalSize / interpretations.length);
  summary.successful_interpretations = successfulCount;
  summary.failed_interpretations = failedCount;

  return summary;
}

module.exports = { 
  interpretCodeLocally,
  interpretSpecificLanguages,
  getLanguageFromExtension,
  createInterpretationSummary
};