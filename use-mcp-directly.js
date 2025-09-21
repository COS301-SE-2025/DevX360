#!/usr/bin/env node

/**
 * Direct MCP Usage Script
 * Use your MCP server directly without Claude Desktop
 */

import { spawn } from 'child_process';

console.log('🚀 Using MCP Server Directly\n');

// Start your MCP server
const mcpServer = spawn('node', ['/Users/sbudx/Documents/GitHub/DevX360/mcp-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverReady = false;

mcpServer.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('DevX360 MCP Server running')) {
    serverReady = true;
    console.log('✅ MCP Server is ready!');
    console.log('\n📋 Available tools:');
    console.log('   • analyze_dora_metrics');
    console.log('   • get_repository_insights');
    console.log('   • analyze_repository');
    console.log('   • get_ai_analysis');
    console.log('\n💡 Example usage:');
    console.log('   node use-mcp-directly.js analyze_dora_metrics "https://github.com/facebook/react"');
  }
});

mcpServer.stderr.on('data', (data) => {
  console.log('⚠️ Server Error:', data.toString().trim());
});

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length >= 2) {
  const [toolName, repositoryUrl] = args;
  
  setTimeout(() => {
    if (serverReady) {
      console.log(`\n🔧 Calling tool: ${toolName}`);
      console.log(`📥 Repository: ${repositoryUrl}`);
      
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: {
            repositoryUrl: repositoryUrl
          }
        }
      };
      
      mcpServer.stdin.write(JSON.stringify(request) + '\n');
      
      // Wait for response
      setTimeout(() => {
        console.log('\n⏰ Analysis completed');
        mcpServer.kill();
      }, 15000);
    }
  }, 2000);
} else {
  console.log('\n📖 Usage:');
  console.log('   node use-mcp-directly.js <tool_name> <repository_url>');
  console.log('\n📋 Examples:');
  console.log('   node use-mcp-directly.js analyze_dora_metrics "https://github.com/facebook/react"');
  console.log('   node use-mcp-directly.js get_repository_insights "https://github.com/microsoft/vscode"');
  console.log('   node use-mcp-directly.js analyze_repository "https://github.com/nodejs/node"');
  
  // Keep server running for interactive use
  process.stdin.resume();
}

mcpServer.on('close', (code) => {
  console.log(`\n🏁 MCP Server exited with code: ${code}`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Stopping MCP server...');
  mcpServer.kill();
  process.exit(0);
});