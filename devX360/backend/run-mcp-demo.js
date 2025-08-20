import 'dotenv/config';
import { spawn } from 'child_process';

function sendJson(proc, message) {
  proc.stdin.write(JSON.stringify(message) + '\n');
}

function runDemo(repositoryUrl) {
  return new Promise((resolve, reject) => {
    const mcp = spawn('node', ['mcp-server.js'], { cwd: process.cwd(), env: process.env });

    let buffer = '';
    const outputs = [];

    const onData = (data) => {
      buffer += data.toString();
      let idx;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line) continue;
        try {
          const msg = JSON.parse(line);
          outputs.push(msg);
        } catch {
          // non-JSON log line; ignore
        }
      }
    };

    mcp.stdout.on('data', onData);
    mcp.stderr.on('data', (d) => {
      // capture but don't fail on server logs
      // console.error(d.toString());
    });

    mcp.on('error', reject);

    // After short delay, send initialize then tool call
    const start = Date.now();
    const handshake = setTimeout(() => {
      // 1) initialize
      sendJson(mcp, {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          clientInfo: { name: 'devx360-school-demo', version: '1.0.0' }
        }
      });

      // 2) call analyze_dora_metrics
      setTimeout(() => {
        sendJson(mcp, {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'analyze_dora_metrics',
            arguments: { repositoryUrl }
          }
        });
      }, 300);
    }, 300);

    // Finish when we receive response id 2 or after timeout
    const timeout = setTimeout(() => {
      try { mcp.kill(); } catch {}
      reject(new Error('MCP demo timed out'));
    }, 60000);

    const checkInterval = setInterval(() => {
      const resp = outputs.find(o => o.id === 2 && (o.result || o.error));
      if (resp) {
        clearInterval(checkInterval);
        clearTimeout(timeout);
        clearTimeout(handshake);
        try { mcp.kill(); } catch {}
        resolve(resp);
      }
    }, 200);
  });
}

const repo = process.argv[2] || 'https://github.com/facebook/react';
runDemo(repo)
  .then((resp) => {
    if (resp.error) {
      console.log('❌ Demo error:', resp.error);
    } else {
      const content = resp.result?.content || [];
      const text = content.find(c => c.type === 'text')?.text || '(no content)';
      console.log('\n===== MCP Demo Output =====\n');
      console.log(text);
      console.log('\n===========================\n');
    }
  })
  .catch((err) => {
    console.error('❌ MCP demo failed:', err.message);
    process.exit(1);
  });
