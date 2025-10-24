#!/usr/bin/env node

/**
 * Simple MCP Test Server
 * This is a minimal MCP server to test if Claude Desktop can connect to MCP at all
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

console.log('🚀 Simple MCP Test Server starting...');

const server = new Server(
  {
    name: 'simple-test',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  console.log(`🔧 Tool called: ${name}`, args);
  
  if (name === 'test_tool') {
    return {
      content: [
        {
          type: 'text',
          text: `✅ SUCCESS! MCP is working! Tool called: ${name} with args: ${JSON.stringify(args)}`
        }
      ],
      isError: false
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.log('🚀 Simple MCP Test Server running on stdio');