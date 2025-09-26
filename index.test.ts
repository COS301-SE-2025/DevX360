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

describe('Utility Functions', () => {
  describe('formatDate', () => {
    test('formats date string correctly', () => {
      const dateString = '2024-01-15T10:30:00Z'
      const result = formatDate(dateString)
      expect(result).toBe('Jan 15, 2024')
    })

    test('handles invalid date string', () => {
      const invalidDate = 'invalid-date'
      const result = formatDate(invalidDate)
      expect(result).toBe('Invalid Date')
    })
  })

  describe('formatRelativeTime', () => {
    test('returns "just now" for recent times', () => {
      const now = new Date().toISOString()
      const result = formatRelativeTime(now)
      expect(result).toBe('just now')
    })

    test('returns minutes ago for recent times', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const result = formatRelativeTime(fiveMinutesAgo)
      expect(result).toBe('5 minutes ago')
    })

    test('returns hours ago for older times', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const result = formatRelativeTime(twoHoursAgo)
      expect(result).toBe('2 hours ago')
    })

    test('returns days ago for older times', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      const result = formatRelativeTime(threeDaysAgo)
      expect(result).toBe('3 days ago')
    })

    test('returns formatted date for very old times', () => {
      const oldDate = '2023-01-01T00:00:00Z'
      const result = formatRelativeTime(oldDate)
      expect(result).toBe('Jan 1, 2023')
    })
  })

  describe('formatNumber', () => {
    test('formats small numbers without commas', () => {
      expect(formatNumber(123)).toBe('123')
    })

    test('formats large numbers with commas', () => {
      const result = formatNumber(1234567)
      expect(result).toMatch(/1[,\s]234[,\s]567/)
    })

    test('formats decimal numbers', () => {
      const result = formatNumber(1234.56)
      expect(result).toMatch(/1[,\s]234[.,]56/)
    })
  })

  describe('formatPercentage', () => {
    test('formats percentage with default decimals', () => {
      expect(formatPercentage(85.678)).toBe('85.7%')
    })

    test('formats percentage with custom decimals', () => {
      expect(formatPercentage(85.678, 2)).toBe('85.68%')
    })

    test('formats percentage with zero decimals', () => {
      expect(formatPercentage(85.678, 0)).toBe('86%')
    })
  })

  describe('truncateText', () => {
    test('returns original text if shorter than max length', () => {
      const text = 'Short text'
      const result = truncateText(text, 20)
      expect(result).toBe('Short text')
    })

    test('truncates text longer than max length', () => {
      const text = 'This is a very long text that should be truncated'
      const result = truncateText(text, 20)
      expect(result).toBe('This is a very long...')
    })

    test('handles empty string', () => {
      const result = truncateText('', 10)
      expect(result).toBe('')
    })
  })

  describe('capitalize', () => {
    test('capitalizes first letter and lowercases rest', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    test('handles already capitalized text', () => {
      expect(capitalize('HELLO')).toBe('Hello')
    })

    test('handles single character', () => {
      expect(capitalize('a')).toBe('A')
    })

    test('handles empty string', () => {
      expect(capitalize('')).toBe('')
    })
  })

  describe('generateId', () => {
    test('generates a string', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
    })

    test('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    test('generates IDs of consistent length', () => {
      const id = generateId()
      expect(id.length).toBe(9)
    })
  })

  describe('debounce', () => {
    test('delays function execution', async () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      await new Promise(resolve => setTimeout(resolve, 150))
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('cancels previous calls', async () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      await new Promise(resolve => setTimeout(resolve, 150))
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle', () => {
    test('limits function execution frequency', async () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(mockFn).toHaveBeenCalledTimes(1)

      await new Promise(resolve => setTimeout(resolve, 150))
      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('isValidEmail', () => {
    test('validates correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('test+tag@example.org')).toBe(true)
    })

    test('rejects invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test.example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    test('validates strong passwords', () => {
      const result = validatePassword('StrongPass123!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('rejects passwords that are too short', () => {
      const result = validatePassword('Short1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    test('rejects passwords without uppercase letters', () => {
      const result = validatePassword('lowercase123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    test('rejects passwords without lowercase letters', () => {
      const result = validatePassword('UPPERCASE123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    test('rejects passwords without numbers', () => {
      const result = validatePassword('NoNumbers!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    test('rejects passwords without special characters', () => {
      const result = validatePassword('NoSpecial123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })

    test('returns multiple errors for weak passwords', () => {
      const result = validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('formatBytes', () => {
    test('formats bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(1073741824)).toBe('1 GB')
    })

    test('formats bytes with custom decimals', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB')
      expect(formatBytes(1536, 0)).toBe('2 KB')
    })

    test('handles large numbers', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB')
    })
  })

  describe('sleep', () => {
    test('sleeps for specified milliseconds', async () => {
      const start = Date.now()
      await sleep(100)
      const end = Date.now()
      expect(end - start).toBeGreaterThanOrEqual(100)
    })

    test('returns a promise', () => {
      const result = sleep(100)
      expect(result).toBeInstanceOf(Promise)
    })
  })
})