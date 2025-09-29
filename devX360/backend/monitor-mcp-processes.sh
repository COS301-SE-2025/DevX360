#!/bin/bash

echo "🔍 Monitoring for MCP processes..."
echo "💡 Now ask Claude Desktop: 'What tools do you have available?'"
echo "⏹️  Press Ctrl+C to stop monitoring"
echo ""

while true; do
    # Check for MCP server processes
    MCP_PROCESSES=$(ps aux | grep -E "(mcp-server|ultra-simple-mcp|devx360)" | grep -v grep)
    
    if [ ! -z "$MCP_PROCESSES" ]; then
        echo "🚀 MCP PROCESSES DETECTED!"
        echo "$MCP_PROCESSES"
        echo ""
    fi
    
    sleep 1
done