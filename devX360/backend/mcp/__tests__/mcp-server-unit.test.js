/**
 * Unit Tests for MCP Server
 * Tests: Tool registration, request handling, error responses
 */

// Mock dependencies
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    setRequestHandler: jest.fn(),
    connect: jest.fn()
  }))
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn()
}));

jest.mock('@modelcontextprotocol/sdk/types.js', () => ({
  CallToolRequestSchema: 'CallToolRequestSchema',
  ListToolsRequestSchema: 'ListToolsRequestSchema'
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('MCP Server Unit Tests', () => {
  let DevX360MCPServer;
  let mockServer;
  let mockTransport;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment variables
    process.env.API_BASE_URL = 'http://localhost:5500';
    process.env.MCP_API_TOKEN = 'test-token';
    
    // Mock fetch responses
    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: 'test' })
    });
    
    // Import the server class
    const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
    mockServer = {
      setRequestHandler: jest.fn(),
      connect: jest.fn()
    };
    Server.mockImplementation(() => mockServer);
    
    const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
    mockTransport = {};
    StdioServerTransport.mockImplementation(() => mockTransport);
    
    // Import after mocking
    DevX360MCPServer = require('../../mcp-server.js').default;
  });

  afterEach(() => {
    delete process.env.API_BASE_URL;
    delete process.env.MCP_API_TOKEN;
  });

  describe('Server Initialization', () => {
    test('should initialize server with correct configuration', () => {
      // Act
      const server = new DevX360MCPServer();

      // Assert
      expect(mockServer.setRequestHandler).toHaveBeenCalledWith('ListToolsRequestSchema', expect.any(Function));
      expect(mockServer.setRequestHandler).toHaveBeenCalledWith('CallToolRequestSchema', expect.any(Function));
    });

    test('should register all required tools', () => {
      // Arrange
      let toolsHandler;
      mockServer.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'ListToolsRequestSchema') {
          toolsHandler = handler;
        }
      });

      // Act
      new DevX360MCPServer();
      const result = toolsHandler();

      // Assert
      expect(result.tools).toHaveLength(4);
      expect(result.tools.map(t => t.name)).toEqual([
        'analyze_dora_metrics',
        'get_repository_insights',
        'analyze_repository',
        'get_ai_analysis'
      ]);
    });
  });

  describe('Tool Descriptions', () => {
    test('should have correct tool descriptions', () => {
      // Arrange
      let toolsHandler;
      mockServer.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'ListToolsRequestSchema') {
          toolsHandler = handler;
        }
      });

      // Act
      new DevX360MCPServer();
      const result = toolsHandler();

      // Assert
      const doraTool = result.tools.find(t => t.name === 'analyze_dora_metrics');
      expect(doraTool.description).toContain('DORA metrics');
      expect(doraTool.description).toContain('Deployment Frequency');
      expect(doraTool.description).toContain('Lead Time');
      expect(doraTool.description).toContain('MTTR');
      expect(doraTool.description).toContain('Change Failure Rate');
    });

    test('should have correct input schemas', () => {
      // Arrange
      let toolsHandler;
      mockServer.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'ListToolsRequestSchema') {
          toolsHandler = handler;
        }
      });

      // Act
      new DevX360MCPServer();
      const result = toolsHandler();

      // Assert
      result.tools.forEach(tool => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
        expect(tool.inputSchema.required).toBeDefined();
      });
    });
  });

  describe('Tool Call Handling', () => {
    test('should handle analyze_dora_metrics tool call', async () => {
      // Arrange
      let callHandler;
      mockServer.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'CallToolRequestSchema') {
          callHandler = handler;
        }
      });

      const mockRepoData = { name: 'test-repo', full_name: 'owner/test-repo' };
      const mockMetrics = { '7d': { deployment_frequency: { total_deployments: 5 } } };

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockRepoData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockMetrics)
        });

      // Act
      new DevX360MCPServer();
      const result = await callHandler({
        params: {
          name: 'analyze_dora_metrics',
          arguments: { repositoryUrl: 'https://github.com/owner/repo' }
        }
      });

      // Assert
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('DORA metrics');
      expect(result.content[0].text).toContain('test-repo');
      expect(result.isError).toBe(false);
    });

    test('should handle get_repository_insights tool call', async () => {
      // Arrange
      let callHandler;
      mockServer.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'CallToolRequestSchema') {
          callHandler = handler;
        }
      });

      const mockRepoData = { name: 'test-repo', stars: 100, forks: 50 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRepoData)
      });

      // Act
      new DevX360MCPServer();
      const result = await callHandler({
        params: {
          name: 'get_repository_insights',
          arguments: { repositoryUrl: 'https://github.com/owner/repo' }
        }
      });

      // Assert
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Repository insights');
      expect(result.content[0].text).toContain('test-repo');
      expect(result.isError).toBe(false);
    });

    test('should handle analyze_repository tool call', async () => {
      // Arrange
      let callHandler;
      mockServer.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'CallToolRequestSchema') {
          callHandler = handler;
        }
      });

      const mockAnalysis = { metadata: { name: 'test-repo' }, insights: ['Good practices'] };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAnalysis)
      });

      // Act
      new DevX360MCPServer();
      const result = await callHandler({
        params: {
          name: 'analyze_repository',
          arguments: { repositoryUrl: 'https://github.com/owner/repo' }
        }
      });

      // Assert
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Repository analysis');
      expect(result.content[0].text).toContain('test-repo');
      expect(result.isError).toBe(false);
    });

    test('should handle get_ai_analysis tool call', async () => {
      // Arrange
      let callHandler;
      mockServer.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'CallToolRequestSchema') {
          callHandler = handler;
        }
      });

      const mockTeamData = { team: { name: 'test-team' }, insights: ['Team performance good'] };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTeamData)
      });

      // Act
      new DevX360MCPServer();
      const result = await callHandler({
        params: {
          name: 'get_ai_analysis',
          arguments: { teamId: 'team123' }
        }
      });

      // Assert
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Team analysis');
      expect(result.content[0].text).toContain('test-team');
      expect(result.isError).toBe(false);
    });

    test('should handle unknown tool calls', async () => {
      // Arrange
      let callHandler;
      mockServer.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'CallToolRequestSchema') {
          callHandler = handler;
        }
      });

      // Act & Assert
      new DevX360MCPServer();
      await expect(callHandler({
        params: {
          name: 'unknown_tool',
          arguments: {}
        }
      })).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      // Arrange
      let callHandler;
      mockServer.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'CallToolRequestSchema') {
          callHandler = handler;
        }
      });

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({ message: 'API Error' })
      });

      // Act
      new DevX360MCPServer();
      const result = await callHandler({
        params: {
          name: 'analyze_dora_metrics',
          arguments: { repositoryUrl: 'https://github.com/owner/repo' }
        }
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error analyzing DORA metrics');
      expect(result.content[0].text).toContain('API Error');
    });

    test('should handle missing required parameters', async () => {
      // Arrange
      let callHandler;
      mockServer.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'CallToolRequestSchema') {
          callHandler = handler;
        }
      });

      // Act
      new DevX360MCPServer();
      const result = await callHandler({
        params: {
          name: 'analyze_dora_metrics',
          arguments: {} // Missing repositoryUrl
        }
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('repositoryUrl is required');
    });

    test('should handle network errors', async () => {
      // Arrange
      let callHandler;
      mockServer.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'CallToolRequestSchema') {
          callHandler = handler;
        }
      });

      fetch.mockRejectedValueOnce(new Error('Network error'));

      // Act
      new DevX360MCPServer();
      const result = await callHandler({
        params: {
          name: 'analyze_dora_metrics',
          arguments: { repositoryUrl: 'https://github.com/owner/repo' }
        }
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error analyzing DORA metrics');
      expect(result.content[0].text).toContain('Network error');
    });
  });

  describe('Server Connection', () => {
    test('should connect to stdio transport', async () => {
      // Act
      const server = new DevX360MCPServer();
      await server.run();

      // Assert
      expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
    });
  });
});