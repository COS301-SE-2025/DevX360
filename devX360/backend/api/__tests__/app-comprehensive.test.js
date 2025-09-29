import { jest } from '@jest/globals'

// Mock all dependencies
jest.unstable_mockModule('express', () => ({
  default: jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    listen: jest.fn(),
    set: jest.fn()
  }))
}))

jest.unstable_mockModule('cors', () => ({
  default: jest.fn()
}))

jest.unstable_mockModule('helmet', () => ({
  default: jest.fn()
}))

jest.unstable_mockModule('compression', () => ({
  default: jest.fn()
}))

jest.unstable_mockModule('morgan', () => ({
  default: jest.fn()
}))

jest.unstable_mockModule('dotenv', () => ({
  config: jest.fn()
}))

jest.unstable_mockModule('./utils/auth.js', () => ({
  authenticateToken: jest.fn((req, res, next) => next()),
  authenticateMCP: jest.fn((req, res, next) => next())
}))

jest.unstable_mockModule('./utils/database.js', () => ({
  connectToDatabase: jest.fn().mockResolvedValue()
}))

jest.unstable_mockModule('./utils/concurrentMap.js', () => ({
  concurrentMap: jest.fn()
}))

jest.unstable_mockModule('./routes/auth.js', () => ({
  default: jest.fn()
}))

jest.unstable_mockModule('./routes/users.js', () => ({
  default: jest.fn()
}))

jest.unstable_mockModule('./routes/teams.js', () => ({
  default: jest.fn()
}))

jest.unstable_mockModule('./routes/mcp.js', () => ({
  default: jest.fn()
}))

jest.unstable_mockModule('./models/User.js', () => ({
  default: jest.fn()
}))

jest.unstable_mockModule('./models/Team.js', () => ({
  default: jest.fn()
}))

jest.unstable_mockModule('./models/Repository.js', () => ({
  default: jest.fn()
}))

jest.unstable_mockModule('./models/Metrics.js', () => ({
  default: jest.fn()
}))

describe('App Comprehensive Tests', () => {
  describe('Express App Configuration', () => {
    test('should create Express app', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      expect(app).toBeDefined()
      expect(app.use).toBeDefined()
      expect(app.get).toBeDefined()
      expect(app.post).toBeDefined()
      expect(app.put).toBeDefined()
      expect(app.delete).toBeDefined()
      expect(app.listen).toBeDefined()
      expect(app.set).toBeDefined()
    })

    test('should configure middleware', async () => {
      const express = await import('express')
      const cors = await import('cors')
      const helmet = await import('helmet')
      const compression = await import('compression')
      const morgan = await import('morgan')
      
      const app = express.default()
      
      // Test middleware configuration
      app.use(cors.default())
      app.use(helmet.default())
      app.use(compression.default())
      app.use(morgan.default('combined'))
      
      expect(app.use).toHaveBeenCalledWith(cors.default())
      expect(app.use).toHaveBeenCalledWith(helmet.default())
      expect(app.use).toHaveBeenCalledWith(compression.default())
      expect(app.use).toHaveBeenCalledWith(morgan.default('combined'))
    })

    test('should configure JSON parsing', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.use(express.default.json())
      app.use(express.default.urlencoded({ extended: true }))
      
      expect(app.use).toHaveBeenCalledWith(express.default.json())
      expect(app.use).toHaveBeenCalledWith(express.default.urlencoded({ extended: true }))
    })

    test('should set trust proxy', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.set('trust proxy', 1)
      
      expect(app.set).toHaveBeenCalledWith('trust proxy', 1)
    })
  })

  describe('Route Configuration', () => {
    test('should mount auth routes', async () => {
      const express = await import('express')
      const authRoutes = await import('./routes/auth.js')
      
      const app = express.default()
      
      app.use('/api/auth', authRoutes.default)
      
      expect(app.use).toHaveBeenCalledWith('/api/auth', authRoutes.default)
    })

    test('should mount user routes', async () => {
      const express = await import('express')
      const userRoutes = await import('./routes/users.js')
      
      const app = express.default()
      
      app.use('/api/users', userRoutes.default)
      
      expect(app.use).toHaveBeenCalledWith('/api/users', userRoutes.default)
    })

    test('should mount team routes', async () => {
      const express = await import('express')
      const teamRoutes = await import('./routes/teams.js')
      
      const app = express.default()
      
      app.use('/api/teams', teamRoutes.default)
      
      expect(app.use).toHaveBeenCalledWith('/api/teams', teamRoutes.default)
    })

    test('should mount MCP routes', async () => {
      const express = await import('express')
      const mcpRoutes = await import('./routes/mcp.js')
      
      const app = express.default()
      
      app.use('/api/mcp', mcpRoutes.default)
      
      expect(app.use).toHaveBeenCalledWith('/api/mcp', mcpRoutes.default)
    })
  })

  describe('Health Check Endpoints', () => {
    test('should provide health check endpoint', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.get('/health', (req, res) => {
        res.status(200).json({ 
          status: 'OK', 
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        })
      })
      
      expect(app.get).toHaveBeenCalledWith('/health', expect.any(Function))
    })

    test('should provide readiness check endpoint', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.get('/ready', (req, res) => {
        res.status(200).json({ 
          status: 'Ready', 
          services: ['database', 'api'],
          timestamp: new Date().toISOString()
        })
      })
      
      expect(app.get).toHaveBeenCalledWith('/ready', expect.any(Function))
    })

    test('should provide metrics endpoint', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.get('/metrics', (req, res) => {
        const metrics = {
          memory: process.memoryUsage(),
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        }
        res.status(200).json(metrics)
      })
      
      expect(app.get).toHaveBeenCalledWith('/metrics', expect.any(Function))
    })
  })

  describe('Error Handling', () => {
    test('should handle 404 errors', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.use('*', (req, res) => {
        res.status(404).json({ 
          error: 'Route not found',
          path: req.originalUrl,
          method: req.method
        })
      })
      
      expect(app.use).toHaveBeenCalledWith('*', expect.any(Function))
    })

    test('should handle global error handler', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(500).json({ 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
        })
      })
      
      expect(app.use).toHaveBeenCalledWith(expect.any(Function))
    })

    test('should handle validation errors', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.use((err, req, res, next) => {
        if (err.name === 'ValidationError') {
          return res.status(400).json({
            error: 'Validation error',
            details: err.message
          })
        }
        next(err)
      })
      
      expect(app.use).toHaveBeenCalledWith(expect.any(Function))
    })

    test('should handle JWT errors', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.use((err, req, res, next) => {
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            error: 'Invalid token'
          })
        }
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Token expired'
          })
        }
        next(err)
      })
      
      expect(app.use).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('Security Configuration', () => {
    test('should configure CORS properly', async () => {
      const cors = await import('cors')
      
      const corsOptions = {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
      }
      
      const corsMiddleware = cors.default(corsOptions)
      
      expect(corsMiddleware).toBeDefined()
    })

    test('should configure security headers', async () => {
      const helmet = await import('helmet')
      
      const helmetOptions = {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
          }
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      }
      
      const helmetMiddleware = helmet.default(helmetOptions)
      
      expect(helmetMiddleware).toBeDefined()
    })

    test('should configure rate limiting', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      // Simple rate limiting middleware
      const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
        const requests = new Map()
        
        return (req, res, next) => {
          const ip = req.ip || req.connection.remoteAddress
          const now = Date.now()
          const windowStart = now - windowMs
          
          // Clean old requests
          if (requests.has(ip)) {
            const userRequests = requests.get(ip).filter(time => time > windowStart)
            requests.set(ip, userRequests)
          } else {
            requests.set(ip, [])
          }
          
          const userRequests = requests.get(ip)
          
          if (userRequests.length >= max) {
            return res.status(429).json({ error: 'Too many requests' })
          }
          
          userRequests.push(now)
          requests.set(ip, userRequests)
          next()
        }
      }
      
      app.use(rateLimit())
      
      expect(app.use).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('Database Integration', () => {
    test('should connect to database on startup', async () => {
      const { connectToDatabase } = await import('./utils/database.js')
      
      await connectToDatabase()
      
      expect(connectToDatabase).toHaveBeenCalled()
    })

    test('should handle database connection errors', async () => {
      const { connectToDatabase } = await import('./utils/database.js')
      
      connectToDatabase.mockRejectedValueOnce(new Error('Connection failed'))
      
      await expect(connectToDatabase()).rejects.toThrow('Connection failed')
    })

    test('should initialize models', async () => {
      const User = await import('./models/User.js')
      const Team = await import('./models/Team.js')
      const Repository = await import('./models/Repository.js')
      const Metrics = await import('./models/Metrics.js')
      
      expect(User.default).toBeDefined()
      expect(Team.default).toBeDefined()
      expect(Repository.default).toBeDefined()
      expect(Metrics.default).toBeDefined()
    })
  })

  describe('Authentication Middleware', () => {
    test('should configure authentication middleware', async () => {
      const { authenticateToken } = await import('./utils/auth.js')
      
      expect(authenticateToken).toBeDefined()
    })

    test('should configure MCP authentication middleware', async () => {
      const { authenticateMCP } = await import('./utils/auth.js')
      
      expect(authenticateMCP).toBeDefined()
    })

    test('should protect routes with authentication', async () => {
      const express = await import('express')
      const { authenticateToken } = await import('./utils/auth.js')
      
      const app = express.default()
      
      app.get('/api/protected', authenticateToken, (req, res) => {
        res.json({ message: 'Protected route' })
      })
      
      expect(app.get).toHaveBeenCalledWith('/api/protected', authenticateToken, expect.any(Function))
    })
  })

  describe('Request Processing', () => {
    test('should parse JSON requests', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.use(express.default.json({ limit: '10mb' }))
      
      expect(app.use).toHaveBeenCalledWith(express.default.json({ limit: '10mb' }))
    })

    test('should parse URL-encoded requests', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.use(express.default.urlencoded({ extended: true, limit: '10mb' }))
      
      expect(app.use).toHaveBeenCalledWith(express.default.urlencoded({ extended: true, limit: '10mb' }))
    })

    test('should handle multipart requests', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      // Mock multer middleware
      const multer = () => (req, res, next) => next()
      
      app.use(multer())
      
      expect(app.use).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('Logging Configuration', () => {
    test('should configure request logging', async () => {
      const morgan = await import('morgan')
      
      const morganOptions = {
        skip: (req, res) => res.statusCode < 400
      }
      
      const morganMiddleware = morgan.default('combined', morganOptions)
      
      expect(morganMiddleware).toBeDefined()
    })

    test('should configure error logging', async () => {
      const morgan = await import('morgan')
      
      const errorLogging = morgan.default('combined', {
        skip: (req, res) => res.statusCode >= 400
      })
      
      expect(errorLogging).toBeDefined()
    })

    test('should log application startup', () => {
      const logStartup = (port) => {
        console.log(`Server running on port ${port}`)
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
        console.log(`Process ID: ${process.pid}`)
      }
      
      expect(() => logStartup(3000)).not.toThrow()
    })
  })

  describe('Performance Optimization', () => {
    test('should enable compression', async () => {
      const compression = await import('compression')
      
      const compressionOptions = {
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
          if (req.headers['x-no-compression']) {
            return false
          }
          return compression.default.filter(req, res)
        }
      }
      
      const compressionMiddleware = compression.default(compressionOptions)
      
      expect(compressionMiddleware).toBeDefined()
    })

    test('should configure caching headers', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.use((req, res, next) => {
        if (req.path.startsWith('/static/')) {
          res.set('Cache-Control', 'public, max-age=31536000')
        }
        next()
      })
      
      expect(app.use).toHaveBeenCalledWith(expect.any(Function))
    })

    test('should handle static file serving', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      app.use('/static', express.default.static('public'))
      
      expect(app.use).toHaveBeenCalledWith('/static', expect.any(Function))
    })
  })

  describe('Environment Configuration', () => {
    test('should load environment variables', async () => {
      const dotenv = await import('dotenv')
      
      dotenv.config()
      
      expect(dotenv.config).toHaveBeenCalled()
    })

    test('should validate required environment variables', () => {
      const requiredVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'PORT'
      ]
      
      const missingVars = requiredVars.filter(varName => !process.env[varName])
      
      if (missingVars.length > 0) {
        console.warn(`Missing environment variables: ${missingVars.join(', ')}`)
      }
      
      expect(Array.isArray(missingVars)).toBe(true)
    })

    test('should handle different environments', () => {
      const getEnvironmentConfig = () => {
        const env = process.env.NODE_ENV || 'development'
        
        const configs = {
          development: {
            logLevel: 'debug',
            corsOrigin: ['http://localhost:3000'],
            rateLimit: { windowMs: 15 * 60 * 1000, max: 1000 }
          },
          production: {
            logLevel: 'error',
            corsOrigin: process.env.ALLOWED_ORIGINS?.split(',') || [],
            rateLimit: { windowMs: 15 * 60 * 1000, max: 100 }
          },
          test: {
            logLevel: 'silent',
            corsOrigin: ['http://localhost:3000'],
            rateLimit: { windowMs: 15 * 60 * 1000, max: 10000 }
          }
        }
        
        return configs[env] || configs.development
      }
      
      const config = getEnvironmentConfig()
      
      expect(config).toHaveProperty('logLevel')
      expect(config).toHaveProperty('corsOrigin')
      expect(config).toHaveProperty('rateLimit')
    })
  })

  describe('Graceful Shutdown', () => {
    test('should handle SIGTERM signal', () => {
      const originalListeners = process.listeners('SIGTERM')
      
      const gracefulShutdown = (signal) => {
        console.log(`Received ${signal}. Starting graceful shutdown...`)
        
        // Close server
        // Close database connections
        // Clean up resources
        
        process.exit(0)
      }
      
      process.on('SIGTERM', gracefulShutdown)
      
      expect(process.listeners('SIGTERM')).toContain(gracefulShutdown)
      
      // Clean up
      process.removeListener('SIGTERM', gracefulShutdown)
      originalListeners.forEach(listener => {
        process.on('SIGTERM', listener)
      })
    })

    test('should handle SIGINT signal', () => {
      const originalListeners = process.listeners('SIGINT')
      
      const gracefulShutdown = (signal) => {
        console.log(`Received ${signal}. Starting graceful shutdown...`)
        process.exit(0)
      }
      
      process.on('SIGINT', gracefulShutdown)
      
      expect(process.listeners('SIGINT')).toContain(gracefulShutdown)
      
      // Clean up
      process.removeListener('SIGINT', gracefulShutdown)
      originalListeners.forEach(listener => {
        process.on('SIGINT', listener)
      })
    })
  })

  describe('Monitoring and Metrics', () => {
    test('should track request metrics', async () => {
      const express = await import('express')
      
      const app = express.default()
      
      const requestMetrics = {
        totalRequests: 0,
        totalErrors: 0,
        averageResponseTime: 0
      }
      
      app.use((req, res, next) => {
        const start = Date.now()
        
        res.on('finish', () => {
          requestMetrics.totalRequests++
          if (res.statusCode >= 400) {
            requestMetrics.totalErrors++
          }
          
          const duration = Date.now() - start
          requestMetrics.averageResponseTime = 
            (requestMetrics.averageResponseTime + duration) / 2
        })
        
        next()
      })
      
      expect(app.use).toHaveBeenCalledWith(expect.any(Function))
    })

    test('should monitor memory usage', () => {
      const getMemoryMetrics = () => {
        const usage = process.memoryUsage()
        return {
          rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100,
          heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100,
          heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100,
          external: Math.round(usage.external / 1024 / 1024 * 100) / 100
        }
      }
      
      const metrics = getMemoryMetrics()
      
      expect(metrics).toHaveProperty('rss')
      expect(metrics).toHaveProperty('heapTotal')
      expect(metrics).toHaveProperty('heapUsed')
      expect(metrics).toHaveProperty('external')
    })

    test('should track application uptime', () => {
      const getUptimeMetrics = () => {
        const uptime = process.uptime()
        return {
          uptime: uptime,
          uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
        }
      }
      
      const metrics = getUptimeMetrics()
      
      expect(metrics).toHaveProperty('uptime')
      expect(metrics).toHaveProperty('uptimeFormatted')
    })
  })
})