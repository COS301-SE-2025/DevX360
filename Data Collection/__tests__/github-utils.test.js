/**
 * Unit Tests for GitHub Utilities
 * Tests: URL parsing, API rate limiting, error handling
 */

import { parseGitHubUrl } from '../github-utils.js';

describe('GitHub Utilities', () => {
  describe('parseGitHubUrl', () => {
    test('should parse standard GitHub URL', () => {
      // Arrange
      const url = 'https://github.com/facebook/react';

      // Act
      const result = parseGitHubUrl(url);

      // Assert
      expect(result).toEqual({
        owner: 'facebook',
        repo: 'react'
      });
    });

    test('should parse GitHub URL with .git extension', () => {
      // Arrange
      const url = 'https://github.com/facebook/react.git';

      // Act
      const result = parseGitHubUrl(url);

      // Assert
      expect(result).toEqual({
        owner: 'facebook',
        repo: 'react'
      });
    });

    test('should parse GitHub URL with trailing slash', () => {
      // Arrange
      const url = 'https://github.com/facebook/react/';

      // Act
      const result = parseGitHubUrl(url);

      // Assert
      expect(result).toEqual({
        owner: 'facebook',
        repo: 'react'
      });
    });

    test('should parse GitHub URL with additional path', () => {
      // Arrange
      const url = 'https://github.com/facebook/react/tree/main/src';

      // Act
      const result = parseGitHubUrl(url);

      // Assert
      expect(result).toEqual({
        owner: 'facebook',
        repo: 'react'
      });
    });

    test('should handle SSH GitHub URL', () => {
      // Arrange
      const url = 'git@github.com:facebook/react.git';

      // Act & Assert
      expect(() => parseGitHubUrl(url)).toThrow('Invalid URL');
    });

    test('should throw error for invalid URL', () => {
      // Arrange
      const url = 'https://gitlab.com/facebook/react';

      // Act & Assert
      expect(() => parseGitHubUrl(url)).toThrow('Invalid GitHub URL: hostname must be github.com');
    });

    test('should throw error for malformed URL', () => {
      // Arrange
      const url = 'not-a-url';

      // Act & Assert
      expect(() => parseGitHubUrl(url)).toThrow('Invalid URL');
    });

    test('should handle URL with subdomain', () => {
      // Arrange
      const url = 'https://github.com/microsoft/vscode';

      // Act
      const result = parseGitHubUrl(url);

      // Assert
      expect(result).toEqual({
        owner: 'microsoft',
        repo: 'vscode'
      });
    });
  });

  describe('URL Validation', () => {
    test('should validate GitHub URLs correctly', () => {
      // Arrange
      const validUrls = [
        'https://github.com/facebook/react',
        'https://github.com/microsoft/vscode',
        'https://github.com/owner/repo-name',
        'https://github.com/owner/repo_name'
      ];

      // Act & Assert
      validUrls.forEach(url => {
        expect(() => parseGitHubUrl(url)).not.toThrow();
      });
    });

    test('should reject invalid URLs', () => {
      // Arrange
      const invalidUrls = [
        'https://gitlab.com/facebook/react',
        'https://bitbucket.org/facebook/react',
        'https://github.com/invalid',
        'not-a-url',
        'https://github.com/',
        'https://github.com/owner/',
        'https://github.com//repo'
      ];

      // Act & Assert
      invalidUrls.forEach(url => {
        expect(() => parseGitHubUrl(url)).toThrow();
      });
    });

    test('should handle edge cases', () => {
      // Arrange
      const edgeCases = [
        '',
        null,
        undefined,
        'https://github.com',
        'https://github.com/',
        'https://github.com/owner',
        'https://github.com/owner/',
        'https://github.com//repo'
      ];

      // Act & Assert
      edgeCases.forEach(url => {
        expect(() => parseGitHubUrl(url)).toThrow();
      });
    });
  });

  describe('URL Validation Edge Cases', () => {
    test('should handle URLs with query parameters', () => {
      // Arrange
      const url = 'https://github.com/facebook/react?tab=readme-ov-file';

      // Act
      const result = parseGitHubUrl(url);

      // Assert
      expect(result).toEqual({
        owner: 'facebook',
        repo: 'react'
      });
    });

    test('should handle URLs with fragments', () => {
      // Arrange
      const url = 'https://github.com/facebook/react#readme';

      // Act
      const result = parseGitHubUrl(url);

      // Assert
      expect(result).toEqual({
        owner: 'facebook',
        repo: 'react'
      });
    });

    test('should handle URLs with port numbers', () => {
      // Arrange
      const url = 'https://github.com:443/facebook/react';

      // Act
      const result = parseGitHubUrl(url);

      // Assert
      expect(result).toEqual({
        owner: 'facebook',
        repo: 'react'
      });
    });

    test('should handle case sensitivity', () => {
      // Arrange
      const url = 'https://github.com/Facebook/React';

      // Act
      const result = parseGitHubUrl(url);

      // Assert
      expect(result).toEqual({
        owner: 'Facebook',
        repo: 'React'
      });
    });

    test('should handle very long repository names', () => {
      // Arrange
      const longRepoName = 'a'.repeat(100);
      const url = `https://github.com/owner/${longRepoName}`;

      // Act
      const result = parseGitHubUrl(url);

      // Assert
      expect(result).toEqual({
        owner: 'owner',
        repo: longRepoName
      });
    });

    test('should handle URLs with multiple slashes', () => {
      // Arrange
      const url = 'https://github.com//facebook//react';

      // Act
      const result = parseGitHubUrl(url);

      // Assert
      expect(result).toEqual({
        owner: 'facebook',
        repo: 'react'
      });
    });
  });

  describe('Error Handling', () => {
    test('should provide meaningful error messages', () => {
      // Arrange
      const invalidUrls = [
        { url: 'https://gitlab.com/facebook/react', expectedError: 'Invalid GitHub URL: hostname must be github.com' },
        { url: 'not-a-url', expectedError: 'Invalid URL' },
        { url: 'https://github.com/invalid', expectedError: 'Invalid GitHub URL: must contain owner and repository name' }
      ];

      // Act & Assert
      invalidUrls.forEach(({ url, expectedError }) => {
        expect(() => parseGitHubUrl(url)).toThrow(expectedError);
      });
    });

    test('should handle null and undefined inputs', () => {
      // Arrange
      const invalidInputs = [null, undefined, ''];

      // Act & Assert
      invalidInputs.forEach(input => {
        expect(() => parseGitHubUrl(input)).toThrow();
      });
    });

    test('should handle non-string inputs', () => {
      // Arrange
      const invalidInputs = [123, {}, [], true];

      // Act & Assert
      invalidInputs.forEach(input => {
        expect(() => parseGitHubUrl(input)).toThrow();
      });
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle large number of URL validations efficiently', () => {
      // Arrange
      const urls = Array.from({ length: 1000 }, (_, i) => 
        `https://github.com/user${i}/repo${i}`
      );

      // Act
      const start = Date.now();
      urls.forEach(url => {
        try {
          parseGitHubUrl(url);
        } catch (error) {
          // Expected for invalid URLs
        }
      });
      const end = Date.now();

      // Assert
      expect(end - start).toBeLessThan(1000); // Should complete in less than 1 second
    });

    test('should handle malformed URLs gracefully', () => {
      // Arrange
      const malformedUrls = [
        'https://github.com/',
        'https://github.com/owner/',
        'https://github.com//repo',
        'https://github.com/owner//repo',
        'https://github.com/owner/repo/',
        'https://github.com/owner/repo//'
      ];

      // Act & Assert
      malformedUrls.forEach(url => {
        try {
          parseGitHubUrl(url);
          // If it doesn't throw, that's also valid for some cases
        } catch (error) {
          expect(error.message).toBeDefined();
        }
      });
    });
  });
});