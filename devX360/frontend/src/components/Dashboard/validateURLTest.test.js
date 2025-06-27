//Team.jsx
//Re-implemented version of the URL validator
function isValidRepoUrl(url) {
  return /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(url);
}

describe('GitHub URL Validation', () => {
  test('rejects invalid GitHub URLs', () => {
    expect(isValidRepoUrl('http://github.com/user/repo')).toBe(false);
    expect(isValidRepoUrl('https://gitlab.com/user/repo')).toBe(false);
    expect(isValidRepoUrl('https://github.com/')).toBe(false);
  });

  test('accepts valid GitHub URLs', () => {
    expect(isValidRepoUrl('https://github.com/user/repo')).toBe(true);
    expect(isValidRepoUrl('https://github.com/user/repo/')).toBe(true);
  });
});
