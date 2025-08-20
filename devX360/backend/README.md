# DORA Metrics Repository Analyzer

This project provides a GitHub repository analysis tool that evaluates a codebase for DevOps performance using **DORA Metrics**. It scans the structure and metadata of the repository to identify process strengths and weaknesses, and then generates detailed, actionable recommendations using a local LLM.

---

## Features

- **DORA Metric Detection**: Evaluates repositories for the four DORA metrics:
  - Deployment Frequency
  - Lead Time for Changes
  - Mean Time to Recovery (MTTR)
  - Change Failure Rate (CFR)
- **Parallel Processing**: Uses `concurrentMap` to concurrently fetch and analyze files/directories while respecting API limits.
- **Token Management**: Leverages `tokenManager.js` to cycle GitHub tokens for rate limit handling.
- **AI-Powered Insight Generation**: Prompts a local LLM to generate suggestions and improvement opportunities for each DORA metric.
- **Critical File Detection**: Identifies files relevant to CI/CD, testing, monitoring, security, and more.

---

---

## File Structure

- `codeInterpretor.js`: Main orchestrator module that runs the full analysis.
- `tokenManager.js`: Manages and rotates GitHub API tokens.
- `../api/utils/concurrentMap.js`: Processes tasks concurrently with a configurable concurrency limit.

---

## Requirements

- Node.js (v16+)
- GitHub Personal Access Tokens (PATs)
- Local LLM API via Ollama running at `http://localhost:11434/api/generate`

---

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/your-org/repo-analyzer.git
   cd repo-analyzer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your `tokenManager.js` to provide GitHub access tokens.

4. Ensure Ollama is running locally:
   ```bash
   ollama run mistral:instruct
   ```

---

## Example Usage

```js
import { performDORAAnalysis } from "./codeInterpretor.js";

const result = await performDORAAnalysis("facebook", "react", {
  deployment_frequency: {},
  lead_time: {},
  mttr: {},
  change_failure_rate: {},
});

console.log(result.insights);
```

---

## Output Structure

```json
{
  "insights": "## DEPLOYMENT FREQUENCY\n**Opportunity:** ...",
  "repositoryAnalysis": {
    "repository": { "name": "...", "language": "...", ... },
    "structure": {...},
    "doraIndicators": {...},
    "fileStats": {...},
    "patterns": {...},
    "allFiles": [...]
  },
  "performance": {
    "totalTimeMs": 9435,
    "filesAnalyzed": 88,
    "doraIndicatorsFound": 23
  }
}
```

---

## Metrics and Analysis

### Deployment Frequency

- Detected from workflows, release patterns, and deploy-related commits.

### Lead Time for Changes

- Derived from pull request open-to-merge durations and test/review files.

### MTTR

- Inferred via log, monitoring, alert, and rollback-related files.

### Change Failure Rate

- Estimated using fix-to-feature commit ratios and PR merge rates.

---

## Additional Notes

- The `concurrentMap` utility is essential for efficient processing of large repositories without overloading the GitHub API.
- `tokenManager.js` must supply rotating Octokit clients with valid GitHub PATs.
- The AI prompt used is dynamically constructed based on detected repo patterns.

---

## LLM Prompt

A custom prompt is sent to a local LLM like so:

```
POST http://localhost:11434/api/generate
Content-Type: application/json

{
  "model": "mistral:instruct",
  "prompt": "You are a senior DevOps engineer analyzing ...",
  ...
}
```
