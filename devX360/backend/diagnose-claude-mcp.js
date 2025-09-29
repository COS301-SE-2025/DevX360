#!/usr/bin/env node

/**
 * Claude Desktop MCP Diagnostic Script
 * This script helps diagnose why MCP isn't working
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔍 Claude Desktop MCP Diagnostic\n');

// Check 1: Configuration file exists and is readable
console.log('1️⃣ Checking configuration file...');
const configPath = `${process.env.HOME}/Library/Application Support/Claude/config.json`;

if (existsSync(configPath)) {
  console.log('   ✅ Config file exists');
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    console.log('   ✅ Config file is valid JSON');
    
    if (config.mcpServers) {
      console.log('   ✅ mcpServers section exists');
      console.log(`   📋 Found ${Object.keys(config.mcpServers).length} MCP server(s):`);
      
      for (const [name, server] of Object.entries(config.mcpServers)) {
        console.log(`      • ${name}:`);
        console.log(`        Command: ${server.command}`);
        console.log(`        Args: ${server.args?.join(' ') || 'none'}`);
        console.log(`        Env: ${server.env ? 'set' : 'not set'}`);
      }
    } else {
      console.log('   ❌ No mcpServers section found');
    }
  } catch (error) {
    console.log('   ❌ Config file is not valid JSON:', error.message);
  }
} else {
  console.log('   ❌ Config file does not exist');
}

// Check 2: MCP server file exists
console.log('\n2️⃣ Checking MCP server file...');
const serverPath = '/Users/sbudx/Documents/GitHub/DevX360/simple-mcp-test.js';
if (existsSync(serverPath)) {
  console.log('   ✅ MCP server file exists');
} else {
  console.log('   ❌ MCP server file does not exist');
}

// Check 3: Node.js availability
console.log('\n3️⃣ Checking Node.js...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`   ✅ Node.js available: ${nodeVersion}`);
} catch (error) {
  console.log('   ❌ Node.js not available:', error.message);
}

// Check 4: Test MCP server directly
console.log('\n4️⃣ Testing MCP server directly...');
try {
  const testOutput = execSync('node /Users/sbudx/Documents/GitHub/DevX360/simple-mcp-test.js --test', { 
    encoding: 'utf8',
    timeout: 5000 
  });
  console.log('   ✅ MCP server starts successfully');
  console.log(`   📤 Output: ${testOutput.trim()}`);
} catch (error) {
  console.log('   ❌ MCP server failed to start:', error.message);
}

// Check 5: Claude Desktop version
console.log('\n5️⃣ Checking Claude Desktop version...');
try {
  const version = execSync('plutil -p "/Applications/Claude.app/Contents/Info.plist" | grep CFBundleShortVersionString', { 
    encoding: 'utf8' 
  });
  console.log(`   ✅ Claude Desktop version: ${version.trim()}`);
} catch (error) {
  console.log('   ❌ Could not determine Claude Desktop version:', error.message);
}

// Check 6: Claude Desktop processes
console.log('\n6️⃣ Checking Claude Desktop processes...');
try {
  const processes = execSync('ps aux | grep -i claude | grep -v grep | wc -l', { encoding: 'utf8' });
  const count = parseInt(processes.trim());
  console.log(`   ✅ Claude Desktop processes running: ${count}`);
  if (count > 0) {
    console.log('   💡 Claude Desktop is running - restart may be needed for config changes');
  } else {
    console.log('   ⚠️ Claude Desktop is not running');
  }
} catch (error) {
  console.log('   ❌ Could not check Claude Desktop processes:', error.message);
}

console.log('\n🎯 Recommendations:');
console.log('1. Make sure Claude Desktop is completely restarted (quit and reopen)');
console.log('2. Try asking: "What tools do you have available?"');
console.log('3. If still not working, try updating Claude Desktop');
console.log('4. Check Claude Desktop logs for MCP-related errors');

console.log('\n📋 Current Configuration:');
try {
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  console.log(JSON.stringify(config.mcpServers, null, 2));
} catch (error) {
  console.log('Could not read configuration');
}