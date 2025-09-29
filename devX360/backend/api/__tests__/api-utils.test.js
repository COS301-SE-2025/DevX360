import { jest } from '@jest/globals'

// Mock dependencies
jest.unstable_mockModule('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt')
}))

jest.unstable_mockModule('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'test-user-id', role: 'user' }),
  decode: jest.fn().mockReturnValue({ userId: 'test-user-id', role: 'user' })
}))

jest.unstable_mockModule('mongodb', () => ({
  MongoClient: jest.fn(() => ({
    db: jest.fn(() => ({
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue({
          _id: 'test-user-id',
          email: 'test@example.com',
          password: 'hashed-password',
          name: 'Test User'
        }),
        insertOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          insertedId: 'test-user-id'
        }),
        updateOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          modifiedCount: 1
        }),
        deleteOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          deletedCount: 1
        })
      }))
    })),
    close: jest.fn()
  }))
}))

// Import after mocking
const bcrypt = await import('bcrypt')
const jwt = await import('jsonwebtoken')

describe('API Utils Tests', () => {
  describe('Password Hashing', () => {
    test('should hash password successfully', async () => {
      const password = 'testpassword123'
      const hashedPassword = await bcrypt.hash(password, 10)
      
      expect(hashedPassword).toBe('hashed-password')
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10)
    })

    test('should compare password successfully', async () => {
      const password = 'testpassword123'
      const hashedPassword = 'hashed-password'
      const result = await bcrypt.compare(password, hashedPassword)
      
      expect(result).toBe(true)
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword)
    })

    test('should generate salt successfully', async () => {
      const salt = await bcrypt.genSalt(10)
      
      expect(salt).toBe('salt')
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10)
    })

    test('should handle password hashing errors', async () => {
      bcrypt.hash.mockRejectedValueOnce(new Error('Hashing failed'))
      
      await expect(bcrypt.hash('password', 10)).rejects.toThrow('Hashing failed')
    })

    test('should handle password comparison errors', async () => {
      bcrypt.compare.mockRejectedValueOnce(new Error('Comparison failed'))
      
      await expect(bcrypt.compare('password', 'hash')).rejects.toThrow('Comparison failed')
    })

    test('should handle salt generation errors', async () => {
      bcrypt.genSalt.mockRejectedValueOnce(new Error('Salt generation failed'))
      
      await expect(bcrypt.genSalt(10)).rejects.toThrow('Salt generation failed')
    })
  })

  describe('JWT Token Operations', () => {
    test('should sign token successfully', () => {
      const payload = { userId: 'test-user-id', role: 'user' }
      const secret = 'test-secret'
      const options = { expiresIn: '1h' }
      
      const token = jwt.sign(payload, secret, options)
      
      expect(token).toBe('mock-jwt-token')
      expect(jwt.sign).toHaveBeenCalledWith(payload, secret, options)
    })

    test('should verify token successfully', () => {
      const token = 'mock-jwt-token'
      const secret = 'test-secret'
      
      const decoded = jwt.verify(token, secret)
      
      expect(decoded).toEqual({ userId: 'test-user-id', role: 'user' })
      expect(jwt.verify).toHaveBeenCalledWith(token, secret)
    })

    test('should decode token successfully', () => {
      const token = 'mock-jwt-token'
      
      const decoded = jwt.decode(token)
      
      expect(decoded).toEqual({ userId: 'test-user-id', role: 'user' })
      expect(jwt.decode).toHaveBeenCalledWith(token)
    })

    test('should handle token signing errors', () => {
      jwt.sign.mockImplementationOnce(() => {
        throw new Error('Signing failed')
      })
      
      expect(() => jwt.sign({}, 'secret')).toThrow('Signing failed')
    })

    test('should handle token verification errors', () => {
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Verification failed')
      })
      
      expect(() => jwt.verify('invalid-token', 'secret')).toThrow('Verification failed')
    })

    test('should handle token decoding errors', () => {
      jwt.decode.mockImplementationOnce(() => {
        throw new Error('Decoding failed')
      })
      
      expect(() => jwt.decode('invalid-token')).toThrow('Decoding failed')
    })

    test('should handle expired tokens', () => {
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Token expired')
      })
      
      expect(() => jwt.verify('expired-token', 'secret')).toThrow('Token expired')
    })

    test('should handle invalid token format', () => {
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token format')
      })
      
      expect(() => jwt.verify('invalid-format', 'secret')).toThrow('Invalid token format')
    })
  })

  describe('Database Connection', () => {
    test('should create MongoDB client', () => {
      const { MongoClient } = require('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      
      expect(client).toBeDefined()
      expect(MongoClient).toHaveBeenCalledWith('mongodb://localhost:27017')
    })

    test('should connect to database', async () => {
      const { MongoClient } = require('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('testdb')
      
      expect(db).toBeDefined()
      expect(client.db).toHaveBeenCalledWith('testdb')
    })

    test('should get collection', async () => {
      const { MongoClient } = require('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('testdb')
      const collection = db.collection('users')
      
      expect(collection).toBeDefined()
      expect(db.collection).toHaveBeenCalledWith('users')
    })

    test('should close connection', async () => {
      const { MongoClient } = require('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      await client.close()
      
      expect(client.close).toHaveBeenCalled()
    })
  })

  describe('Data Validation', () => {
    test('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      expect(emailRegex.test('test@example.com')).toBe(true)
      expect(emailRegex.test('user.name@domain.co.uk')).toBe(true)
      expect(emailRegex.test('invalid-email')).toBe(false)
      expect(emailRegex.test('@example.com')).toBe(false)
      expect(emailRegex.test('test@')).toBe(false)
    })

    test('should validate password strength', () => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      
      expect(passwordRegex.test('Password123!')).toBe(true)
      expect(passwordRegex.test('StrongPass1@')).toBe(true)
      expect(passwordRegex.test('weak')).toBe(false)
      expect(passwordRegex.test('password')).toBe(false)
      expect(passwordRegex.test('PASSWORD123')).toBe(false)
    })

    test('should validate UUID format', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      
      expect(uuidRegex.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(uuidRegex.test('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
      expect(uuidRegex.test('invalid-uuid')).toBe(false)
      expect(uuidRegex.test('123')).toBe(false)
    })

    test('should validate URL format', () => {
      const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
      
      expect(urlRegex.test('https://example.com')).toBe(true)
      expect(urlRegex.test('http://www.example.com/path')).toBe(true)
      expect(urlRegex.test('ftp://example.com')).toBe(false)
      expect(urlRegex.test('invalid-url')).toBe(false)
    })

    test('should validate phone number format', () => {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
      
      expect(phoneRegex.test('+1234567890')).toBe(true)
      expect(phoneRegex.test('(123) 456-7890')).toBe(true)
      expect(phoneRegex.test('123-456-7890')).toBe(true)
      expect(phoneRegex.test('123')).toBe(false)
      expect(phoneRegex.test('invalid')).toBe(false)
    })
  })

  describe('Data Sanitization', () => {
    test('should sanitize HTML input', () => {
      const sanitizeHtml = (input) => {
        return input
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;')
      }
      
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
      expect(sanitizeHtml('Normal text')).toBe('Normal text')
      expect(sanitizeHtml('Text with <b>bold</b>')).toBe('Text with &lt;b&gt;bold&lt;&#x2F;b&gt;')
    })

    test('should sanitize SQL input', () => {
      const sanitizeSql = (input) => {
        return input
          .replace(/'/g, "''")
          .replace(/--/g, '')
          .replace(/;/g, '')
      }
      
      expect(sanitizeSql("'; DROP TABLE users; --")).toBe("''; DROP TABLE users; ")
      expect(sanitizeSql("Normal text")).toBe("Normal text")
      expect(sanitizeSql("O'Reilly")).toBe("O''Reilly")
    })

    test('should trim whitespace', () => {
      const trimInput = (input) => input.trim()
      
      expect(trimInput('  test  ')).toBe('test')
      expect(trimInput('\n\ttest\n\t')).toBe('test')
      expect(trimInput('test')).toBe('test')
    })

    test('should normalize case', () => {
      const normalizeCase = (input) => input.toLowerCase()
      
      expect(normalizeCase('TEST')).toBe('test')
      expect(normalizeCase('Test')).toBe('test')
      expect(normalizeCase('test')).toBe('test')
    })
  })

  describe('Error Handling', () => {
    test('should create custom error objects', () => {
      class CustomError extends Error {
        constructor(message, code, statusCode) {
          super(message)
          this.name = 'CustomError'
          this.code = code
          this.statusCode = statusCode
        }
      }
      
      const error = new CustomError('Test error', 'TEST_ERROR', 400)
      
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('CustomError')
    })

    test('should handle async errors', async () => {
      const asyncFunction = async () => {
        throw new Error('Async error')
      }
      
      await expect(asyncFunction()).rejects.toThrow('Async error')
    })

    test('should handle promise rejections', () => {
      const promiseFunction = () => {
        return new Promise((resolve, reject) => {
          reject(new Error('Promise rejection'))
        })
      }
      
      expect(promiseFunction()).rejects.toThrow('Promise rejection')
    })

    test('should handle timeout errors', () => {
      const timeoutFunction = () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100)
        })
      }
      
      expect(timeoutFunction()).rejects.toThrow('Timeout')
    })
  })

  describe('Data Transformation', () => {
    test('should transform data to JSON', () => {
      const data = { name: 'Test', value: 123 }
      const json = JSON.stringify(data)
      
      expect(json).toBe('{"name":"Test","value":123}')
    })

    test('should parse JSON data', () => {
      const json = '{"name":"Test","value":123}'
      const data = JSON.parse(json)
      
      expect(data).toEqual({ name: 'Test', value: 123 })
    })

    test('should handle invalid JSON', () => {
      const invalidJson = '{"name":"Test","value":123'
      
      expect(() => JSON.parse(invalidJson)).toThrow()
    })

    test('should transform array data', () => {
      const numbers = [1, 2, 3, 4, 5]
      const doubled = numbers.map(n => n * 2)
      
      expect(doubled).toEqual([2, 4, 6, 8, 10])
    })

    test('should filter array data', () => {
      const numbers = [1, 2, 3, 4, 5]
      const even = numbers.filter(n => n % 2 === 0)
      
      expect(even).toEqual([2, 4])
    })

    test('should reduce array data', () => {
      const numbers = [1, 2, 3, 4, 5]
      const sum = numbers.reduce((acc, n) => acc + n, 0)
      
      expect(sum).toBe(15)
    })
  })

  describe('Performance Utilities', () => {
    test('should measure execution time', async () => {
      const measureTime = async (fn) => {
        const start = Date.now()
        await fn()
        const end = Date.now()
        return end - start
      }
      
      const duration = await measureTime(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      expect(duration).toBeGreaterThanOrEqual(100)
      expect(duration).toBeLessThan(200)
    })

    test('should debounce function calls', () => {
      const debounce = (fn, delay) => {
        let timeoutId
        return (...args) => {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => fn.apply(this, args), delay)
        }
      }
      
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')
      
      expect(mockFn).not.toHaveBeenCalled()
    })

    test('should throttle function calls', () => {
      const throttle = (fn, delay) => {
        let lastCall = 0
        return (...args) => {
          const now = Date.now()
          if (now - lastCall >= delay) {
            lastCall = now
            return fn.apply(this, args)
          }
        }
      }
      
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)
      
      throttledFn('arg1')
      throttledFn('arg2')
      
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('should cache function results', () => {
      const cache = new Map()
      const cachedFunction = (key, fn) => {
        if (cache.has(key)) {
          return cache.get(key)
        }
        const result = fn()
        cache.set(key, result)
        return result
      }
      
      const expensiveFunction = () => {
        return Math.random()
      }
      
      const result1 = cachedFunction('key1', expensiveFunction)
      const result2 = cachedFunction('key1', expensiveFunction)
      
      expect(result1).toBe(result2)
    })
  })

  describe('Security Utilities', () => {
    test('should generate random tokens', () => {
      const generateToken = (length = 32) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
      }
      
      const token1 = generateToken(16)
      const token2 = generateToken(16)
      
      expect(token1).toHaveLength(16)
      expect(token2).toHaveLength(16)
      expect(token1).not.toBe(token2)
    })

    test('should hash sensitive data', () => {
      const hashData = (data) => {
        // Simple hash function for testing
        let hash = 0
        for (let i = 0; i < data.length; i++) {
          const char = data.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash // Convert to 32-bit integer
        }
        return hash.toString()
      }
      
      const hash1 = hashData('sensitive-data')
      const hash2 = hashData('sensitive-data')
      
      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe('sensitive-data')
    })

    test('should validate input length', () => {
      const validateLength = (input, min, max) => {
        return input.length >= min && input.length <= max
      }
      
      expect(validateLength('test', 3, 10)).toBe(true)
      expect(validateLength('ab', 3, 10)).toBe(false)
      expect(validateLength('verylongstring', 3, 10)).toBe(false)
    })

    test('should escape special characters', () => {
      const escapeSpecialChars = (input) => {
        return input
          .replace(/\\/g, '\\\\')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
      }
      
      expect(escapeSpecialChars('test\nline')).toBe('test\\nline')
      expect(escapeSpecialChars('test\tindent')).toBe('test\\tindent')
      expect(escapeSpecialChars('test\\backslash')).toBe('test\\\\backslash')
    })
  })

  describe('Concurrency Utilities', () => {
    test('should handle concurrent operations', async () => {
      const concurrentOperations = async (operations) => {
        return Promise.all(operations.map(op => op()))
      }
      
      const operations = [
        () => Promise.resolve('result1'),
        () => Promise.resolve('result2'),
        () => Promise.resolve('result3')
      ]
      
      const results = await concurrentOperations(operations)
      
      expect(results).toEqual(['result1', 'result2', 'result3'])
    })

    test('should handle race conditions', async () => {
      const raceOperations = async (operations) => {
        return Promise.race(operations.map(op => op()))
      }
      
      const operations = [
        () => new Promise(resolve => setTimeout(() => resolve('slow'), 100)),
        () => new Promise(resolve => setTimeout(() => resolve('fast'), 50))
      ]
      
      const result = await raceOperations(operations)
      
      expect(result).toBe('fast')
    })

    test('should handle batch processing', async () => {
      const batchProcess = async (items, batchSize, processor) => {
        const results = []
        for (let i = 0; i < items.length; i += batchSize) {
          const batch = items.slice(i, i + batchSize)
          const batchResults = await Promise.all(batch.map(processor))
          results.push(...batchResults)
        }
        return results
      }
      
      const items = [1, 2, 3, 4, 5]
      const processor = (item) => Promise.resolve(item * 2)
      
      const results = await batchProcess(items, 2, processor)
      
      expect(results).toEqual([2, 4, 6, 8, 10])
    })
  })
})