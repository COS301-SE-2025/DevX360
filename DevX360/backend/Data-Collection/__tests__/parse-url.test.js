/* @jest-environment node */
import { jest } from '@jest/globals';
import { parseGitHubUrl } from '../universal-dora-service.js';

describe('parseGitHubUrl()', () => {

  test('valid URL', () => {
    const { owner, repo } = parseGitHubUrl('https://github.com/owner/repo');
    expect(owner).toBe('owner');
    expect(repo).toBe('repo');
  });

  test('invalid host', () => {
    expect(() => parseGitHubUrl('https://gitlab.com/owner/repo')).toThrow('hostname must be github.com');
  });

  test('missing parts', () => {
    expect(() => parseGitHubUrl('https://github.com/owner')).toThrow('must contain owner and repository name');
  });

  test('.git suffix removed', () => {
    const { repo } = parseGitHubUrl('https://github.com/owner/repo.git');
    expect(repo).toBe('repo');
  });
});
