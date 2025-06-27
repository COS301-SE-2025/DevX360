import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

const mockPerformDORAAnalysis = jest.fn();
jest.unstable_mockModule('../codeInterpretor.js', () => ({
  performDORAAnalysis: mockPerformDORAAnalysis,
}));

const mockFindOne = jest.fn();
const mockSave = jest.fn();
jest.unstable_mockModule('../../api/models/RepoMetrics.js', () => ({
  default: {
    findOne: mockFindOne,
  },
}));

const mockParseGitHubUrl = jest.fn();
jest.unstable_mockModule('../../Data Collection/repository-info-service.js', () => ({
  parseGitHubUrl: mockParseGitHubUrl,
}));

const { runAIAnalysis } = await import('../analysisService.js');

describe('runAIAnalysis', () => {
  let mockMetricsEntry;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock RepoMetrics.findOne to return a mock entry
    mockMetricsEntry = {
      teamId: 'test-team',
      repoUrl: 'https://github.com/owner/repo',
      metrics: { deployment_frequency: {} },
      analysisStatus: 'idle',
      aiAnalysis: null,
      save: mockSave.mockResolvedValue(true),
    };
    mockFindOne.mockResolvedValue(mockMetricsEntry);

    // Mock parseGitHubUrl
    mockParseGitHubUrl.mockReturnValue({ owner: 'owner', repo: 'repo' });

    // Mock performDORAAnalysis
    mockPerformDORAAnalysis.mockResolvedValue({
      insights: 'Test insights',
      repositoryAnalysis: {
        repository: { name: 'repo', language: 'JavaScript' },
        doraIndicators: { deployment_frequency: ['indicator1'] },
      },
      performance: {
        doraIndicatorsFound: 1,
        filesAnalyzed: 10,
        totalTimeMs: 1000,
      },
    });

    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore(); // Restore console.error
  });

  test('should run AI analysis and update metrics entry successfully', async () => {
    // Arrange
    const teamId = 'test-team';

    // Act
    await runAIAnalysis(teamId);

    // Assert
    expect(mockFindOne).toHaveBeenCalledWith({ teamId });
    expect(mockMetricsEntry.analysisStatus).toBe('completed');
    expect(mockMetricsEntry.aiAnalysis.insights).toBe('Test insights');
    expect(mockSave).toHaveBeenCalledTimes(2); // Initial save for pending, final save for completed
  });

  test('should handle cases where metrics entry is not found', async () => {
    // Arrange
    mockFindOne.mockResolvedValue(null);
    const teamId = 'non-existent-team';

    // Act
    await runAIAnalysis(teamId);

    // Assert
    expect(mockFindOne).toHaveBeenCalledWith({ teamId });
    expect(mockPerformDORAAnalysis).not.toHaveBeenCalled();
    expect(mockSave).not.toHaveBeenCalled();
  });

  test('should handle errors during analysis and set status to failed', async () => {
    // Arrange
    const teamId = 'test-team';
    const error = new Error('Analysis failed');
    mockPerformDORAAnalysis.mockRejectedValue(error);

    // Act
    await runAIAnalysis(teamId);

    // Assert
    expect(mockMetricsEntry.analysisStatus).toBe('failed');
    expect(mockSave).toHaveBeenCalledTimes(2); // Initial save for pending, final save for failed
  });
});