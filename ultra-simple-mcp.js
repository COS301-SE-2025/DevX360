#!/usr/bin/env node

/**
 * Ultra Simple MCP Test
 * Minimal possible MCP server
 */

console.log('🚀 Ultra Simple MCP starting...');

// Minimal MCP server setup
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'ultra-simple-test',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  
  if (name === 'hello') {
    return {
      content: [
        {
          type: 'text',
          text: 'Hello from MCP! This proves MCP is working!'
        }
      ],
      isError: false
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.log('🚀 Ultra Simple MCP running on stdio');