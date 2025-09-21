#!/usr/bin/env node

/**
 * Quick MCP Test - Simulates Claude Desktop calling your MCP tools
 */

import { spawn } from 'child_process';

console.log('🧪 Quick MCP Test Starting...\n');

// Test the exact command Claude Desktop will use
const mcpProcess = spawn('/Users/sbudx/.nvm/versions/node/v22.14.0/bin/node', [
  '/Users/sbudx/Documents/GitHub/DevX360/mcp-server.js'
], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

mcpProcess.stdout.on('data', (data) => {
  output += data.toString();
  console.log('📤 Server Output:', data.toString().trim());
});

mcpProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('⚠️ Server Error:', data.toString().trim());
});

mcpProcess.on('close', (code) => {
  console.log(`\n🏁 MCP Server exited with code: ${code}`);
  if (code === 0) {
    console.log('✅ MCP Server started successfully!');
  } else {
    console.log('❌ MCP Server failed to start');
  }
});

// Send a test tool call after a short delay
setTimeout(() => {
  console.log('\n🔧 Testing tool call...');
  
  const testRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'get_repository_insights',
      arguments: {
        repositoryUrl: 'https://github.com/facebook/react'
      }
    }
  };
  
  console.log('📤 Sending test request:', JSON.stringify(testRequest, null, 2));
  mcpProcess.stdin.write(JSON.stringify(testRequest) + '\n');
  
  // Close after 10 seconds
  setTimeout(() => {
    console.log('\n⏰ Test completed - closing MCP server');
    mcpProcess.kill();
  }, 10000);
  
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping test...');
  mcpProcess.kill();
  process.exit(0);
});