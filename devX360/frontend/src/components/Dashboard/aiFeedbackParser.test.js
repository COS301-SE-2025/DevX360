// Mock implementation of parseAiFeedback (copied from Metrics.jsx logic)
function parseAiFeedback(markdown) {
  const sections = {};
  const matches = [...markdown.matchAll(/## ([^\n]+)\n([\s\S]*?)(?=##|$)/g)];
  matches.forEach(([_, title, content]) => {
    sections[title.trim()] = content.trim();
  });
  return sections;
}

describe('AI Feedback Parsing', () => {
  test('parses AI feedback sections correctly', () => {
    const mockFeedback = `## Deployment Frequency\nAnalysis...\n## Lead Time\nRecommendations...`;
    const result = parseAiFeedback(mockFeedback);

    expect(result).toEqual({
      'Deployment Frequency': 'Analysis...',
      'Lead Time': 'Recommendations...'
    });
  });

  test('handles empty feedback gracefully', () => {
    expect(parseAiFeedback('')).toEqual({});
  });
});
