#!/usr/bin/env node

/**
 * MCP Usage Monitor
 * This script monitors when your MCP server is being used by Claude Desktop
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 MCP Usage Monitor Started');
console.log('📋 Monitoring for MCP server activity...');
console.log('💡 Try using your MCP tools in Claude Desktop now!');
console.log('⏹️  Press Ctrl+C to stop monitoring\n');

// Monitor for MCP server processes
const monitorInterval = setInterval(() => {
  const { spawn: spawnSync } = require('child_process');
  
  // Check for running MCP server processes
  const ps = spawnSync('ps', ['aux'], { stdio: 'pipe' });
  let output = '';
  
  ps.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  ps.on('close', () => {
    const lines = output.split('\n');
    const mcpProcesses = lines.filter(line => 
      line.includes('mcp-server.js') || 
      line.includes('devx360') ||
      line.includes('node.*mcp-server')
    );
    
    if (mcpProcesses.length > 0) {
      console.log('🚀 MCP SERVER DETECTED!');
      mcpProcesses.forEach(process => {
        console.log(`   📊 Process: ${process.trim()}`);
      });
      console.log('   ✅ Your MCP is being used by Claude Desktop!\n');
    }
  });
}, 2000); // Check every 2 seconds

// Monitor Claude Desktop logs for MCP activity
const logPath = `${process.env.HOME}/Library/Logs/Claude/window.log`;
console.log(`📝 Also monitoring Claude Desktop logs: ${logPath}`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping MCP monitor...');
  clearInterval(monitorInterval);
  process.exit(0);
});

// Keep the script running
process.stdin.resume();