import {
  formatDate,
  formatRelativeTime,
  formatNumber,
  formatPercentage,
  truncateText,
  capitalize,
  generateId,
  debounce,
  throttle,
  isValidEmail,
  validatePassword,
  formatBytes,
  sleep
} from '@/utils'

describe('Utils Comprehensive Tests', () => {
  describe('formatDate', () => {
    test('formats valid date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).toMatch(/Jan 15, 2024/)
    })

    test('handles different date formats', () => {
      const result1 = formatDate('2024-12-25')
      const result2 = formatDate('2024-06-01T00:00:00.000Z')
      
      expect(result1).toMatch(/Dec 25, 2024/)
      expect(result2).toMatch(/Jun 1, 2024/)
    })

    test('handles invalid date gracefully', () => {
      const result = formatDate('invalid-date')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('formatRelativeTime', () => {
    test('formats recent time as "just now"', () => {
      const now = new Date()
      const result = formatRelativeTime(now.toISOString())
      expect(result).toBe('just now')
    })

    test('formats minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const result = formatRelativeTime(fiveMinutesAgo.toISOString())
      expect(result).toBe('5 minutes ago')
    })

    test('formats hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      const result = formatRelativeTime(twoHoursAgo.toISOString())
      expect(result).toBe('2 hours ago')
    })

    test('formats days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(threeDaysAgo.toISOString())
      expect(result).toBe('3 days ago')
    })

    test('formats old dates as absolute date', () => {
      const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(oldDate.toISOString())
      expect(result).toMatch(/Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov/)
    })
  })

  describe('formatNumber', () => {
    test('formats small numbers', () => {
      expect(formatNumber(123)).toBe('123')
    })

    test('formats large numbers with locale-specific separators', () => {
      const result = formatNumber(1234567)
      expect(result).toMatch(/1[,\s]234[,\s]567/)
    })

    test('formats decimal numbers', () => {
      const result = formatNumber(1234.56)
      expect(result).toMatch(/1[,\s]234[.,]56/)
    })

    test('handles zero', () => {
      expect(formatNumber(0)).toBe('0')
    })

    test('handles negative numbers', () => {
      const result = formatNumber(-1234)
      expect(result).toMatch(/-1[,\s]234/)
    })
  })

  describe('formatPercentage', () => {
    test('formats percentage with default decimals', () => {
      expect(formatPercentage(85.678)).toBe('85.7%')
    })

    test('formats percentage with custom decimals', () => {
      expect(formatPercentage(85.678, 2)).toBe('85.68%')
    })

    test('handles zero percentage', () => {
      expect(formatPercentage(0)).toBe('0.0%')
    })

    test('handles 100 percentage', () => {
      expect(formatPercentage(100)).toBe('100.0%')
    })
  })

  describe('truncateText', () => {
    test('truncates long text', () => {
      const text = 'This is a very long text that should be truncated'
      const result = truncateText(text, 20)
      expect(result).toBe('This is a very long...')
    })

    test('leaves short text unchanged', () => {
      const text = 'Short text'
      const result = truncateText(text, 20)
      expect(result).toBe('Short text')
    })

    test('handles empty string', () => {
      expect(truncateText('', 10)).toBe('')
    })

    test('handles exact length', () => {
      const text = 'Exactly twenty chars'
      const result = truncateText(text, 20)
      expect(result).toBe('Exactly twenty chars')
    })
  })

  describe('capitalize', () => {
    test('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    test('handles already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello')
    })

    test('handles all caps', () => {
      expect(capitalize('HELLO')).toBe('Hello')
    })

    test('handles empty string', () => {
      expect(capitalize('')).toBe('')
    })

    test('handles single character', () => {
      expect(capitalize('a')).toBe('A')
    })
  })

  describe('generateId', () => {
    test('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).toHaveLength(9)
      expect(id2).toHaveLength(9)
      expect(id1).not.toBe(id2)
    })

    test('generates alphanumeric IDs', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z0-9]+$/)
    })
  })

  describe('debounce', () => {
    test('debounces function calls', (done) => {
      let callCount = 0
      const debouncedFn = debounce(() => {
        callCount++
      }, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      setTimeout(() => {
        expect(callCount).toBe(1)
        done()
      }, 150)
    })

    test('debounce with immediate execution', (done) => {
      let callCount = 0
      const debouncedFn = debounce(() => {
        callCount++
      }, 100)

      debouncedFn()
      
      setTimeout(() => {
        debouncedFn()
        setTimeout(() => {
          expect(callCount).toBe(2)
          done()
        }, 150)
      }, 150)
    })
  })

  describe('throttle', () => {
    test('throttles function calls', (done) => {
      let callCount = 0
      const throttledFn = throttle(() => {
        callCount++
      }, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      setTimeout(() => {
        expect(callCount).toBe(1)
        done()
      }, 50)
    })

    test('allows calls after throttle period', (done) => {
      let callCount = 0
      const throttledFn = throttle(() => {
        callCount++
      }, 100)

      throttledFn()
      
      setTimeout(() => {
        throttledFn()
        expect(callCount).toBe(2)
        done()
      }, 150)
    })
  })

  describe('isValidEmail', () => {
    test('validates correct email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.email+tag@domain.co.uk')).toBe(true)
      expect(isValidEmail('user123@test-domain.com')).toBe(true)
    })

    test('rejects invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user@domain')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    test('validates strong password', () => {
      const result = validatePassword('StrongPass123!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('rejects short password', () => {
      const result = validatePassword('Short1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    test('rejects password without uppercase', () => {
      const result = validatePassword('lowercase123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    test('rejects password without lowercase', () => {
      const result = validatePassword('UPPERCASE123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    test('rejects password without number', () => {
      const result = validatePassword('NoNumbers!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    test('rejects password without special character', () => {
      const result = validatePassword('NoSpecial123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })
  })

  describe('formatBytes', () => {
    test('formats bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(500)).toBe('500 Bytes')
    })

    test('formats kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1536)).toBe('1.5 KB')
    })

    test('formats megabytes', () => {
      expect(formatBytes(1024 * 1024)).toBe('1 MB')
      expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB')
    })

    test('formats gigabytes', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
    })

    test('formats with custom decimals', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB')
      expect(formatBytes(1536, 3)).toBe('1.500 KB')
    })
  })

  describe('sleep', () => {
    test('sleeps for specified time', async () => {
      const start = Date.now()
      await sleep(100)
      const end = Date.now()
      
      expect(end - start).toBeGreaterThanOrEqual(100)
    })

    test('sleeps for zero time', async () => {
      const start = Date.now()
      await sleep(0)
      const end = Date.now()
      
      expect(end - start).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Edge Cases', () => {
    test('handles null and undefined inputs gracefully', () => {
      expect(() => formatDate(null as any)).not.toThrow()
      expect(() => formatDate(undefined as any)).not.toThrow()
    })

    test('handles extreme values', () => {
      expect(formatNumber(Number.MAX_SAFE_INTEGER)).toBeDefined()
      expect(formatNumber(Number.MIN_SAFE_INTEGER)).toBeDefined()
    })

    test('handles special characters in text', () => {
      const text = 'Text with émojis 🚀 and spëcial chars'
      const result = truncateText(text, 20)
      expect(result).toBeDefined()
    })
  })
})