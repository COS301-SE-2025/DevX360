// Use native fetch if available, otherwise fallback to node-fetch
typeof fetch === 'function' ? null : global.fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Helper function to add delay between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Cache for language detection to avoid repeated lookups
const languageCache = new Map();

// Pre-compiled prompt template for better performance
const PROMPT_TEMPLATE = `You are a Senior Software Architect and Technical Lead with 15+ years of experience in enterprise software development, code quality analysis, and performance optimization. You specialize in DORA metrics, technical debt assessment, and architectural decision-making.

**TASK**: Provide an expert-level technical analysis of this {language} file for a high-stakes code review or architectural assessment.

**CONTEXT**:
- File: {filePath}
- Language: {language}
- File Size: {fileSize} characters
- Analysis Level: Expert/Architectural

**REQUIRED EXPERT ANALYSIS**:

## 1. **ARCHITECTURAL ASSESSMENT**
- **Purpose & Role**: What is this file's architectural purpose and how does it fit into the system?
- **Design Patterns**: Identify and evaluate design patterns used (SOLID principles, Gang of Four patterns, etc.)
- **Coupling & Cohesion**: Assess module coupling and internal cohesion levels
- **Scalability Impact**: How does this code affect system scalability and performance?

## 2. **TECHNICAL METRICS & QUALITY INDICATORS**
- **Cyclomatic Complexity**: Estimate and categorize (Low: 1-5, Medium: 6-10, High: 11+)
- **Maintainability Index**: Rate from 1-100 with justification
- **Technical Debt**: Identify specific technical debt items with impact assessment
- **Code Smells**: Detect and categorize code smells (Long Method, Large Class, etc.)

## 3. **PERFORMANCE & EFFICIENCY ANALYSIS**
- **Time Complexity**: Analyze algorithmic efficiency and Big O notation
- **Memory Usage**: Assess memory footprint and potential memory leaks
- **I/O Operations**: Evaluate database queries, API calls, and file operations
- **Bottlenecks**: Identify performance bottlenecks and optimization opportunities

## 4. **SECURITY & RELIABILITY**
- **Security Vulnerabilities**: Identify potential security issues (injection, XSS, etc.)
- **Error Handling**: Assess robustness of error handling and edge cases
- **Input Validation**: Evaluate data validation and sanitization
- **Failure Modes**: Analyze potential failure scenarios and recovery mechanisms

## 5. **DORA METRICS IMPACT**
- **Deployment Frequency**: How does this code affect deployment velocity?
- **Lead Time**: Impact on development-to-production cycle time
- **Change Failure Rate**: Risk assessment for production deployments
- **MTTR**: How quickly can issues in this code be resolved?

## 6. **EXPERT RECOMMENDATIONS**
- **Immediate Actions**: Critical issues requiring immediate attention
- **Short-term Improvements**: Quick wins for code quality enhancement
- **Long-term Strategy**: Architectural improvements for future scalability
- **Risk Mitigation**: Specific steps to reduce technical and operational risks

**CODE TO ANALYZE**:
\`\`\`{languageLower}
{codeContent}
\`\`\`

**EXPECTED OUTPUT FORMAT**:
Provide a structured, professional analysis suitable for executive review. Use clear metrics, specific examples, and actionable recommendations. Focus on business impact and technical excellence.

**ANALYSIS QUALITY STANDARD**: This analysis will be used for critical architectural decisions and executive reporting. Ensure expert-level depth, accuracy, and actionable insights.`;

// Maximum content size to send to AI (to avoid token limits)
const MAX_CONTENT_SIZE = 8000; // characters

/**
 * Truncates content if it's too large for AI processing
 * @param {string} content - The file content
 * @param {number} maxSize - Maximum size in characters
 * @returns {string} - Truncated content with indicator
 */
function truncateContent(content, maxSize = MAX_CONTENT_SIZE) {
  if (content.length <= maxSize) {
    return content;
  }
  
  const truncated = content.substring(0, maxSize);
  return `${truncated}\n\n... [Content truncated - file too large for full analysis]`;
}

/**
 * Generates optimized prompt for code analysis
 * @param {Object} file - File object with path and content
 * @param {string} language - Programming language
 * @returns {string} - Generated prompt
 */
function generateOptimizedPrompt(file, language) {
  const languageLower = language.toLowerCase();
  const truncatedContent = truncateContent(file.content);
  
  return PROMPT_TEMPLATE
    .replace(/{language}/g, language)
    .replace(/{filePath}/g, file.path)
    .replace(/{fileSize}/g, file.content.length)
    .replace(/{languageLower}/g, languageLower)
    .replace(/{codeContent}/g, truncatedContent);
}

/**
 * Optimized language detection with caching
 * @param {string} filename - The filename
 * @returns {string} Programming language name
 */
function getLanguageFromExtensionOptimized(filename) {
  // Check cache first
  if (languageCache.has(filename)) {
    return languageCache.get(filename);
  }
  
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
  
  const language = languageMap[extension] || 'Unknown';
  
  // Cache the result
  languageCache.set(filename, language);
  
  return language;
}

/**
 * Interprets code files using local Ollama API with batch processing
 * 
 * @param {Array} files - Array of file objects with path and content
 * @param {string} model - Ollama model to use (default: 'codellama')
 * @param {number} delayMs - Delay between requests in milliseconds (default: 1000)
 * @param {number} batchSize - Number of files to process in parallel (default: 1)
 * @returns {Promise<Array>} Array of interpretation objects
 */
async function interpretCodeLocally(files, model = "codellama", delayMs = 1000, batchSize = 1) {
  const interpretations = [];
  
  console.log(`Starting code interpretation for ${files.length} files using model: ${model} (batch size: ${batchSize})`);

  if (batchSize === 1) {
    // Original sequential processing
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        console.log(`Interpreting file ${i + 1}/${files.length}: ${file.path}`);
        
        const language = file.language || getLanguageFromExtensionOptimized(file.path);
        
        const prompt = generateOptimizedPrompt(file, language);

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
  } else {
    // Batch processing
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(files.length / batchSize);
      
      console.log(`\n--- Processing Batch ${batchNumber}/${totalBatches} (${batch.length} files) ---`);
      
      const batchPromises = batch.map(async (file, batchIndex) => {
        const globalIndex = i + batchIndex;
        
        try {
          console.log(`Interpreting file ${globalIndex + 1}/${files.length}: ${file.path}`);
          
          const language = file.language || getLanguageFromExtensionOptimized(file.path);
          
          const prompt = generateOptimizedPrompt(file, language);

          const res = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: model,
              prompt: prompt,
              stream: false,
              options: {
                temperature: 0.3,
                top_p: 0.9,
                max_tokens: 2000
              }
            })
          });

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const data = await res.json();

          return {
            file: file.path,
            language: language,
            size: file.content.length,
            interpretation: data.response,
            model_used: model,
            interpreted_at: new Date().toISOString()
          };

        } catch (error) {
          console.error(`❌ Error interpreting ${file.path}:`, error.message);
          
          return {
            file: file.path,
            language: file.language || 'Unknown',
            size: file.content.length,
            interpretation: `Error: ${error.message}`,
            model_used: model,
            interpreted_at: new Date().toISOString(),
            error: true
          };
        }
      });

      // Wait for all files in the batch to complete
      const batchResults = await Promise.all(batchPromises);
      interpretations.push(...batchResults);
      
      // Log batch completion
      const successfulInBatch = batchResults.filter(r => !r.error).length;
      console.log(`✅ Batch ${batchNumber} completed: ${successfulInBatch}/${batch.length} successful`);
      
      // Add delay between batches
      if (i + batchSize < files.length) {
        console.log(`⏳ Waiting ${delayMs}ms before next batch...`);
        await delay(delayMs);
      }
    }
  }

  console.log(`\n🎉 Code interpretation completed. Processed ${interpretations.length} files.`);
  return interpretations;
}

/**
 * Interprets code files in batches with custom batch size
 * 
 * @param {Array} files - Array of file objects
 * @param {number} batchSize - Number of files to process in parallel (default: 3)
 * @param {string} model - Ollama model to use
 * @param {number} delayMs - Delay between batches in milliseconds
 * @returns {Promise<Array>} Array of interpretation objects
 */
async function interpretCodeInBatches(files, batchSize = 3, model = "codellama", delayMs = 2000) {
  console.log(`Starting batch processing with batch size: ${batchSize}`);
  return interpretCodeLocally(files, model, delayMs, batchSize);
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
    const fileLanguage = file.language || getLanguageFromExtensionOptimized(file.path);
    return languages.includes(fileLanguage);
  });
  
  console.log(`Filtering to ${languages.join(', ')} files. Found ${filteredFiles.length} files.`);
  
  return interpretCodeLocally(filteredFiles, model);
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

export { 
  interpretCodeLocally,
  interpretCodeInBatches,
  interpretSpecificLanguages,
  getLanguageFromExtensionOptimized,
  createInterpretationSummary
};