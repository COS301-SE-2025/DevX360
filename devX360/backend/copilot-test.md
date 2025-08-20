# DevX360 Copilot Test

This file is for testing the DevX360 MCP integration with VS Code Copilot.

## Test Scenarios

### 1. DORA Metrics Analysis
Ask Copilot: "Can you analyze the DORA metrics for the React repository?"

### 2. Repository Insights
Ask Copilot: "What are the insights for the React repository?"

### 3. AI Analysis
Ask Copilot: "Can you provide AI analysis for a team's repository?"

## Instructions

1. Make sure your MCP server is running: `npm run mcp`
2. Open this file in VS Code
3. Use Cmd+I (Mac) or Ctrl+I (Windows/Linux) to chat with Copilot
4. Ask the questions above to test the MCP integration

## Expected Responses

Copilot should be able to:
- Analyze DORA metrics (Deployment Frequency, Lead Time, MTTR, Change Failure Rate)
- Provide repository insights (contributors, languages, statistics)
- Generate AI-powered recommendations
- Show trend analysis and confidence scores

## Troubleshooting

If Copilot doesn't respond with DevX360 data:
1. Check that the MCP server is running
2. Verify VS Code settings are correct
3. Restart VS Code
4. Check the VS Code output panel for MCP errors 