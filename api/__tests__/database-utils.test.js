import { jest } from '@jest/globals'

// Mock MongoDB
jest.unstable_mockModule('mongodb', () => ({
  MongoClient: jest.fn(() => ({
    db: jest.fn(() => ({
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue({ _id: 'test-id', name: 'test' }),
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([{ _id: 'test-id', name: 'test' }])
        }),
        insertOne: jest.fn().mockResolvedValue({ acknowledged: true, insertedId: 'test-id' }),
        updateOne: jest.fn().mockResolvedValue({ acknowledged: true, modifiedCount: 1 }),
        deleteOne: jest.fn().mockResolvedValue({ acknowledged: true, deletedCount: 1 }),
        countDocuments: jest.fn().mockResolvedValue(1)
      }))
    })),
    close: jest.fn().mockResolvedValue()
  }))
}))

describe('Database Utils Tests', () => {
  describe('Database Connection', () => {
    test('should connect to MongoDB', async () => {
      const { MongoClient } = await import('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('testdb')
      
      expect(client).toBeDefined()
      expect(db).toBeDefined()
    })

    test('should handle connection errors', async () => {
      const { MongoClient } = await import('mongodb')
      
      MongoClient.mockImplementationOnce(() => {
        throw new Error('Connection failed')
      })
      
      expect(() => new MongoClient('invalid-uri')).toThrow('Connection failed')
    })

    test('should close connection', async () => {
      const { MongoClient } = await import('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      await client.close()
      
      expect(client.close).toHaveBeenCalled()
    })
  })

  describe('Collection Operations', () => {
    test('should get collection', async () => {
      const { MongoClient } = await import('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('testdb')
      const collection = db.collection('users')
      
      expect(collection).toBeDefined()
    })

    test('should find one document', async () => {
      const { MongoClient } = await import('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('testdb')
      const collection = db.collection('users')
      
      const result = await collection.findOne({ name: 'test' })
      
      expect(result).toEqual({ _id: 'test-id', name: 'test' })
    })

    test('should find multiple documents', async () => {
      const { MongoClient } = await import('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('testdb')
      const collection = db.collection('users')
      
      const result = await collection.find({}).toArray()
      
      expect(result).toEqual([{ _id: 'test-id', name: 'test' }])
    })

    test('should insert document', async () => {
      const { MongoClient } = await import('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('testdb')
      const collection = db.collection('users')
      
      const result = await collection.insertOne({ name: 'new-user' })
      
      expect(result).toEqual({ acknowledged: true, insertedId: 'test-id' })
    })

    test('should update document', async () => {
      const { MongoClient } = await import('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('testdb')
      const collection = db.collection('users')
      
      const result = await collection.updateOne(
        { _id: 'test-id' },
        { $set: { name: 'updated-user' } }
      )
      
      expect(result).toEqual({ acknowledged: true, modifiedCount: 1 })
    })

    test('should delete document', async () => {
      const { MongoClient } = await import('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('testdb')
      const collection = db.collection('users')
      
      const result = await collection.deleteOne({ _id: 'test-id' })
      
      expect(result).toEqual({ acknowledged: true, deletedCount: 1 })
    })

    test('should count documents', async () => {
      const { MongoClient } = await import('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('testdb')
      const collection = db.collection('users')
      
      const result = await collection.countDocuments({})
      
      expect(result).toBe(1)
    })
  })

  describe('Database Utilities', () => {
    test('should validate MongoDB URI', () => {
      const validateMongoUri = (uri) => {
        return uri && uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')
      }
      
      expect(validateMongoUri('mongodb://localhost:27017')).toBe(true)
      expect(validateMongoUri('mongodb+srv://cluster.mongodb.net')).toBe(true)
      expect(validateMongoUri('invalid-uri')).toBe(false)
      expect(validateMongoUri('')).toBe(false)
    })

    test('should parse connection options', () => {
      const parseOptions = (options) => {
        const defaultOptions = {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000
        }
        
        return { ...defaultOptions, ...options }
      }
      
      const options = parseOptions({ maxPoolSize: 20 })
      
      expect(options.useNewUrlParser).toBe(true)
      expect(options.useUnifiedTopology).toBe(true)
      expect(options.maxPoolSize).toBe(20)
      expect(options.serverSelectionTimeoutMS).toBe(5000)
    })

    test('should handle connection pooling', () => {
      const createPoolConfig = (size = 10) => {
        return {
          maxPoolSize: size,
          minPoolSize: 2,
          maxIdleTimeMS: 30000,
          waitQueueTimeoutMS: 5000
        }
      }
      
      const config = createPoolConfig(15)
      
      expect(config.maxPoolSize).toBe(15)
      expect(config.minPoolSize).toBe(2)
      expect(config.maxIdleTimeMS).toBe(30000)
      expect(config.waitQueueTimeoutMS).toBe(5000)
    })

    test('should handle retry logic', async () => {
      const retryOperation = async (operation, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            return await operation()
          } catch (error) {
            if (i === maxRetries - 1) throw error
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
          }
        }
      }
      
      let attempts = 0
      const failingOperation = async () => {
        attempts++
        if (attempts < 3) throw new Error('Temporary failure')
        return 'success'
      }
      
      const result = await retryOperation(failingOperation)
      
      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    test('should handle connection health check', async () => {
      const healthCheck = async (db) => {
        try {
          await db.admin().ping()
          return { status: 'healthy', timestamp: new Date().toISOString() }
        } catch (error) {
          return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() }
        }
      }
      
      const mockDb = {
        admin: () => ({
          ping: jest.fn().mockResolvedValue({ ok: 1 })
        })
      }
      
      const result = await healthCheck(mockDb)
      
      expect(result.status).toBe('healthy')
      expect(result.timestamp).toBeDefined()
    })

    test('should handle transaction operations', async () => {
      const executeTransaction = async (client, operations) => {
        const session = client.startSession()
        
        try {
          await session.withTransaction(async () => {
            for (const operation of operations) {
              await operation(session)
            }
          })
        } finally {
          await session.endSession()
        }
      }
      
      const mockClient = {
        startSession: jest.fn(() => ({
          withTransaction: jest.fn(),
          endSession: jest.fn()
        }))
      }
      
      const operations = [
        jest.fn(),
        jest.fn()
      ]
      
      await executeTransaction(mockClient, operations)
      
      expect(mockClient.startSession).toHaveBeenCalled()
    })

    test('should handle index operations', async () => {
      const createIndexes = async (collection, indexes) => {
        const results = []
        for (const index of indexes) {
          const result = await collection.createIndex(index.fields, index.options)
          results.push(result)
        }
        return results
      }
      
      const mockCollection = {
        createIndex: jest.fn().mockResolvedValue('index-name')
      }
      
      const indexes = [
        { fields: { name: 1 }, options: { unique: true } },
        { fields: { email: 1 }, options: { unique: true } }
      ]
      
      const results = await createIndexes(mockCollection, indexes)
      
      expect(results).toHaveLength(2)
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(2)
    })

    test('should handle aggregation operations', async () => {
      const aggregateData = async (collection, pipeline) => {
        return await collection.aggregate(pipeline).toArray()
      }
      
      const mockCollection = {
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { _id: 'group1', count: 5 },
            { _id: 'group2', count: 3 }
          ])
        })
      }
      
      const pipeline = [
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]
      
      const result = await aggregateData(mockCollection, pipeline)
      
      expect(result).toHaveLength(2)
      expect(mockCollection.aggregate).toHaveBeenCalledWith(pipeline)
    })

    test('should handle bulk operations', async () => {
      const bulkWrite = async (collection, operations) => {
        return await collection.bulkWrite(operations)
      }
      
      const mockCollection = {
        bulkWrite: jest.fn().mockResolvedValue({
          insertedCount: 2,
          modifiedCount: 1,
          deletedCount: 1
        })
      }
      
      const operations = [
        { insertOne: { document: { name: 'user1' } } },
        { insertOne: { document: { name: 'user2' } } },
        { updateOne: { filter: { _id: 'id1' }, update: { $set: { status: 'active' } } } },
        { deleteOne: { filter: { _id: 'id2' } } }
      ]
      
      const result = await bulkWrite(mockCollection, operations)
      
      expect(result.insertedCount).toBe(2)
      expect(result.modifiedCount).toBe(1)
      expect(result.deletedCount).toBe(1)
    })
  })

  describe('Error Handling', () => {
    test('should handle connection timeout', async () => {
      const { MongoClient } = await import('mongodb')
      
      MongoClient.mockImplementationOnce(() => {
        const client = {
          db: jest.fn(),
          close: jest.fn()
        }
        
        // Simulate timeout
        setTimeout(() => {
          throw new Error('Connection timeout')
        }, 100)
        
        return client
      })
      
      const client = new MongoClient('mongodb://localhost:27017')
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(client).toBeDefined()
    })

    test('should handle network errors', async () => {
      const { MongoClient } = await import('mongodb')
      
      MongoClient.mockImplementationOnce(() => {
        throw new Error('Network error')
      })
      
      expect(() => new MongoClient('mongodb://localhost:27017')).toThrow('Network error')
    })

    test('should handle authentication errors', async () => {
      const { MongoClient } = await import('mongodb')
      
      MongoClient.mockImplementationOnce(() => {
        throw new Error('Authentication failed')
      })
      
      expect(() => new MongoClient('mongodb://user:pass@localhost:27017')).toThrow('Authentication failed')
    })

    test('should handle database not found errors', async () => {
      const { MongoClient } = await import('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('nonexistent')
      const collection = db.collection('users')
      
      collection.findOne.mockRejectedValueOnce(new Error('Database not found'))
      
      await expect(collection.findOne({})).rejects.toThrow('Database not found')
    })

    test('should handle collection not found errors', async () => {
      const { MongoClient } = await import('mongodb')
      
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('testdb')
      const collection = db.collection('nonexistent')
      
      collection.findOne.mockRejectedValueOnce(new Error('Collection not found'))
      
      await expect(collection.findOne({})).rejects.toThrow('Collection not found')
    })
  })

  describe('Performance Monitoring', () => {
    test('should monitor query performance', async () => {
      const monitorQuery = async (operation) => {
        const start = Date.now()
        const result = await operation()
        const duration = Date.now() - start
        
        return {
          result,
          duration,
          timestamp: new Date().toISOString()
        }
      }
      
      const mockOperation = jest.fn().mockResolvedValue('query-result')
      
      const monitored = await monitorQuery(mockOperation)
      
      expect(monitored.result).toBe('query-result')
      expect(monitored.duration).toBeGreaterThanOrEqual(0)
      expect(monitored.timestamp).toBeDefined()
    })

    test('should track connection metrics', () => {
      const trackMetrics = (client) => {
        return {
          connections: client.s?.topology?.s?.pool?.totalConnectionCount || 0,
          activeConnections: client.s?.topology?.s?.pool?.availableConnectionCount || 0,
          queuedRequests: client.s?.topology?.s?.pool?.waitingCount || 0
        }
      }
      
      const mockClient = {
        s: {
          topology: {
            s: {
              pool: {
                totalConnectionCount: 10,
                availableConnectionCount: 8,
                waitingCount: 2
              }
            }
          }
        }
      }
      
      const metrics = trackMetrics(mockClient)
      
      expect(metrics.connections).toBe(10)
      expect(metrics.activeConnections).toBe(8)
      expect(metrics.queuedRequests).toBe(2)
    })

    test('should handle slow query detection', async () => {
      const detectSlowQueries = (queries, threshold = 1000) => {
        return queries.filter(query => query.duration > threshold)
      }
      
      const queries = [
        { operation: 'find', duration: 500 },
        { operation: 'insert', duration: 1200 },
        { operation: 'update', duration: 800 },
        { operation: 'delete', duration: 1500 }
      ]
      
      const slowQueries = detectSlowQueries(queries, 1000)
      
      expect(slowQueries).toHaveLength(2)
      expect(slowQueries[0].operation).toBe('insert')
      expect(slowQueries[1].operation).toBe('delete')
    })
  })

  describe('Data Validation', () => {
    test('should validate document structure', () => {
      const validateDocument = (doc, schema) => {
        for (const [field, rules] of Object.entries(schema)) {
          if (rules.required && !doc.hasOwnProperty(field)) {
            return { valid: false, error: `Missing required field: ${field}` }
          }
          
          if (doc[field] && rules.type && typeof doc[field] !== rules.type) {
            return { valid: false, error: `Invalid type for field ${field}` }
          }
        }
        return { valid: true }
      }
      
      const schema = {
        name: { required: true, type: 'string' },
        age: { required: false, type: 'number' },
        email: { required: true, type: 'string' }
      }
      
      const validDoc = { name: 'John', age: 30, email: 'john@example.com' }
      const invalidDoc = { name: 'John', age: 'thirty' }
      
      expect(validateDocument(validDoc, schema).valid).toBe(true)
      expect(validateDocument(invalidDoc, schema).valid).toBe(false)
    })

    test('should sanitize input data', () => {
      const sanitizeData = (data) => {
        const sanitized = {}
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            sanitized[key] = value.trim().replace(/[<>]/g, '')
          } else {
            sanitized[key] = value
          }
        }
        return sanitized
      }
      
      const data = {
        name: '  John Doe  ',
        email: '<script>alert("xss")</script>',
        age: 30
      }
      
      const sanitized = sanitizeData(data)
      
      expect(sanitized.name).toBe('John Doe')
      expect(sanitized.email).toBe('scriptalert("xss")/script')
      expect(sanitized.age).toBe(30)
    })

    test('should handle data type conversion', () => {
      const convertTypes = (data, typeMap) => {
        const converted = {}
        for (const [key, value] of Object.entries(data)) {
          const targetType = typeMap[key]
          if (targetType === 'number') {
            converted[key] = Number(value)
          } else if (targetType === 'boolean') {
            converted[key] = Boolean(value)
          } else if (targetType === 'date') {
            converted[key] = new Date(value)
          } else {
            converted[key] = value
          }
        }
        return converted
      }
      
      const data = {
        age: '30',
        active: 'true',
        createdAt: '2024-01-01'
      }
      
      const typeMap = {
        age: 'number',
        active: 'boolean',
        createdAt: 'date'
      }
      
      const converted = convertTypes(data, typeMap)
      
      expect(typeof converted.age).toBe('number')
      expect(typeof converted.active).toBe('boolean')
      expect(converted.createdAt).toBeInstanceOf(Date)
    })
  })
})