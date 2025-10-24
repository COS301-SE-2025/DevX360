/* @jest-environment node */
import { jest } from '@jest/globals';
import { spawn } from 'child_process';
import path from 'path';

function rpc(method, params = {}) {
  return (
    JSON.stringify({ jsonrpc: '2.0', id: Math.floor(Math.random() * 1e6), method, params }) + '\n'
  );
}

describe('MCP server e2e', () => {
  jest.setTimeout(30000);

  test('analyze_dora_metrics prints frequencies and per week', async () => {
    const loader = path.resolve(process.cwd(), 'mcp/__tests__/__mocks__/esm-loader.mjs');
    const proc = spawn('node', ['--experimental-loader', loader, 'mcp-server.js'], {
      cwd: path.resolve(process.cwd()),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const outputs = [];
    proc.stdout.on('data', (buf) => outputs.push(buf.toString('utf8')));
    proc.stderr.on('data', (buf) => outputs.push(buf.toString('utf8')));

    proc.stdin.write(rpc('initialize', { capabilities: {} }));
    proc.stdin.write(
      rpc('tools/call', {
        name: 'analyze_dora_metrics',
        arguments: { repositoryUrl: 'https://github.com/owner/repo' },
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));
    proc.kill('SIGTERM');

    const text = outputs.join('');
    expect(text).toMatch(/Freq:\s*0\.100\/day\s*\|\s*1\.000\/week\s*\|\s*3\.000\/month/);
    expect(text).toMatch(/Per Week:\s*\[1, 1, 1\]/);
  });
});
