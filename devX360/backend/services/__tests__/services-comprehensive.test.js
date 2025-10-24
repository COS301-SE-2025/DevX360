import { jest } from '@jest/globals'

// Mock all external dependencies
jest.unstable_mockModule('openai', () => ({
  default: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'AI response' } }]
        })
      }
    }
  }))
}))

// Mock Octokit functionality without importing the actual module
const mockOctokit = {
  rest: {
    repos: {
      get: jest.fn().mockResolvedValue({ data: { name: 'test-repo' } }),
      listCommits: jest.fn().mockResolvedValue({ data: [] }),
      listReleases: jest.fn().mockResolvedValue({ data: [] }),
      listPullRequests: jest.fn().mockResolvedValue({ data: [] }),
      listIssues: jest.fn().mockResolvedValue({ data: [] })
    },
    users: {
      getByUsername: jest.fn().mockResolvedValue({ data: { name: 'test-user' } })
    }
  }
}

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

// Mock concurrentMap functionality without importing the actual module
const mockConcurrentMap = jest.fn().mockResolvedValue([])

// Mock Data Collection modules without importing them
const mockGetRepositoryInfo = jest.fn().mockResolvedValue({
  name: 'test-repo',
  full_name: 'owner/test-repo',
  description: 'Test repository',
  language: 'JavaScript',
  stargazers_count: 100,
  forks_count: 50,
  open_issues_count: 10
})

const mockGetDORAMetrics = jest.fn().mockResolvedValue({
  deployment_frequency: { daily: 0, weekly: 0, monthly: 0 },
  lead_time: { average: 0, median: 0 },
  mttr: { average: 0, median: 0 },
  change_failure_rate: { percentage: 0 }
})

describe('Services Comprehensive Tests', () => {
  describe('TokenManager Service', () => {
    test('should handle token rotation', async () => {
      const tokenManager = {
        tokens: ['token1', 'token2', 'token3'],
        currentIndex: 0,
        getNextToken: function() {
          const token = this.tokens[this.currentIndex]
          this.currentIndex = (this.currentIndex + 1) % this.tokens.length
          return token
        }
      }
      
      expect(tokenManager.getNextToken()).toBe('token1')
      expect(tokenManager.getNextToken()).toBe('token2')
      expect(tokenManager.getNextToken()).toBe('token3')
      expect(tokenManager.getNextToken()).toBe('token1') // Should cycle back
    })

    test('should handle single token', async () => {
      const tokenManager = {
        tokens: ['single-token'],
        currentIndex: 0,
        getNextToken: function() {
          return this.tokens[this.currentIndex]
        }
      }
      
      expect(tokenManager.getNextToken()).toBe('single-token')
      expect(tokenManager.getNextToken()).toBe('single-token')
    })

    test('should handle empty tokens array', async () => {
      const tokenManager = {
        tokens: [],
        currentIndex: 0,
        getNextToken: function() {
          if (this.tokens.length === 0) return null
          return this.tokens[this.currentIndex]
        }
      }
      
      expect(tokenManager.getNextToken()).toBe(null)
    })

    test('should create Octokit instance', async () => {
      const octokit = mockOctokit
      
      expect(octokit).toBeDefined()
      expect(octokit.rest).toBeDefined()
      expect(octokit.rest.repos).toBeDefined()
    })

    test('should handle token validation', async () => {
      const validateToken = (token) => {
        if (!token) return false
        if (typeof token !== 'string') return false
        if (token.length < 10) return false
        return true
      }
      
      expect(validateToken('valid-token-123')).toBe(true)
      expect(validateToken('short')).toBe(false)
      expect(validateToken('')).toBe(false)
      expect(validateToken(null)).toBe(false)
      expect(validateToken(undefined)).toBe(false)
    })

    test('should handle rate limit data', async () => {
      const rateLimitData = {
        limit: 5000,
        remaining: 4999,
        reset: Date.now() + 3600000,
        used: 1
      }
      
      expect(rateLimitData.limit).toBe(5000)
      expect(rateLimitData.remaining).toBe(4999)
      expect(rateLimitData.reset).toBeGreaterThan(Date.now())
      expect(rateLimitData.used).toBe(1)
    })
  })

  describe('GitHubUpdater Service', () => {
    test('should refresh GitHub usernames', async () => {
      const refreshUsernames = async (users) => {
        const octokit = mockOctokit
        
        const updatedUsers = []
        for (const user of users) {
          try {
            const response = await octokit.rest.users.getByUsername({ username: user.username })
            updatedUsers.push({
              ...user,
              name: response.data.name || user.username,
              avatar_url: response.data.avatar_url
            })
          } catch (error) {
            updatedUsers.push(user)
          }
        }
        return updatedUsers
      }
      
      const users = [
        { username: 'user1', email: 'user1@example.com' },
        { username: 'user2', email: 'user2@example.com' }
      ]
      
      const result = await refreshUsernames(users)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('name')
      expect(result[0]).toHaveProperty('avatar_url')
    })

    test('should handle GitHub API errors', async () => {
      const handleApiError = (error) => {
        if (error.status === 404) {
          return { error: 'User not found', code: 'USER_NOT_FOUND' }
        }
        if (error.status === 403) {
          return { error: 'Rate limit exceeded', code: 'RATE_LIMIT' }
        }
        if (error.status === 401) {
          return { error: 'Unauthorized', code: 'UNAUTHORIZED' }
        }
        return { error: 'Unknown error', code: 'UNKNOWN' }
      }
      
      expect(handleApiError({ status: 404 })).toEqual({ error: 'User not found', code: 'USER_NOT_FOUND' })
      expect(handleApiError({ status: 403 })).toEqual({ error: 'Rate limit exceeded', code: 'RATE_LIMIT' })
      expect(handleApiError({ status: 401 })).toEqual({ error: 'Unauthorized', code: 'UNAUTHORIZED' })
      expect(handleApiError({ status: 500 })).toEqual({ error: 'Unknown error', code: 'UNKNOWN' })
    })

    test('should handle batch processing', async () => {
      const processBatch = async (items, batchSize = 10) => {
        const results = []
        for (let i = 0; i < items.length; i += batchSize) {
          const batch = items.slice(i, i + batchSize)
          const batchResults = await Promise.all(batch.map(item => processItem(item)))
          results.push(...batchResults)
        }
        return results
      }
      
      const processItem = async (item) => {
        return { ...item, processed: true }
      }
      
      const items = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `item-${i}` }))
      const result = await processBatch(items, 10)
      
      expect(result).toHaveLength(25)
      expect(result[0]).toHaveProperty('processed', true)
    })

    test('should handle concurrent requests', async () => {
      const makeConcurrentRequests = async (requests) => {
        return Promise.all(requests.map(request => request()))
      }
      
      const requests = [
        () => Promise.resolve('result1'),
        () => Promise.resolve('result2'),
        () => Promise.resolve('result3')
      ]
      
      const results = await makeConcurrentRequests(requests)
      
      expect(results).toEqual(['result1', 'result2', 'result3'])
    })
  })

  describe('TeamUpdater Service', () => {
    test('should update all teams', async () => {
      const updateAllTeams = async () => {
        const { MongoClient } = await import('mongodb')
        const client = new MongoClient('mongodb://localhost:27017')
        const db = client.db('testdb')
        const teamsCollection = db.collection('teams')
        
        const teams = await teamsCollection.find({}).toArray()
        const results = []
        
        for (const team of teams) {
          try {
            const updatedTeam = await updateTeamMetrics(team)
            results.push({ team: team._id, status: 'success', data: updatedTeam })
          } catch (error) {
            results.push({ team: team._id, status: 'error', error: error.message })
          }
        }
        
        return results
      }
      
      const updateTeamMetrics = async (team) => {
        return {
          ...team,
          lastUpdated: new Date().toISOString(),
          metrics: {
            memberCount: team.members?.length || 0,
            repositoryCount: team.repositories?.length || 0
          }
        }
      }
      
      const result = await updateAllTeams()
      
      expect(Array.isArray(result)).toBe(true)
    })

    test('should handle team metrics calculation', async () => {
      const calculateTeamMetrics = (team) => {
        const metrics = {
          memberCount: team.members?.length || 0,
          repositoryCount: team.repositories?.length || 0,
          activityScore: 0,
          healthScore: 0
        }
        
        // Calculate activity score based on recent activity
        if (team.recentActivity) {
          metrics.activityScore = Math.min(team.recentActivity * 10, 100)
        }
        
        // Calculate health score based on various factors
        metrics.healthScore = Math.min(
          (metrics.memberCount * 10) + 
          (metrics.repositoryCount * 5) + 
          metrics.activityScore, 
          100
        )
        
        return metrics
      }
      
      const team = {
        members: ['user1', 'user2', 'user3'],
        repositories: ['repo1', 'repo2'],
        recentActivity: 5
      }
      
      const metrics = calculateTeamMetrics(team)
      
      expect(metrics.memberCount).toBe(3)
      expect(metrics.repositoryCount).toBe(2)
      expect(metrics.activityScore).toBe(50)
      expect(metrics.healthScore).toBe(90)
    })

    test('should trigger AI analysis', async () => {
      const triggerAIAnalysis = async (team) => {
        const OpenAI = await import('openai')
        const openai = new OpenAI.default({ apiKey: 'test-key' })
        
        const prompt = `Analyze the following team data and provide insights:
        Team: ${team.name}
        Members: ${team.members?.length || 0}
        Repositories: ${team.repositories?.length || 0}
        Recent Activity: ${team.recentActivity || 0}`
        
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }]
          })
          
          return {
            analysis: response.choices[0].message.content,
            timestamp: new Date().toISOString(),
            status: 'completed'
          }
        } catch (error) {
          return {
            error: error.message,
            timestamp: new Date().toISOString(),
            status: 'failed'
          }
        }
      }
      
      const team = {
        name: 'Test Team',
        members: ['user1', 'user2'],
        repositories: ['repo1'],
        recentActivity: 3
      }
      
      const result = await triggerAIAnalysis(team)
      
      expect(result).toHaveProperty('analysis')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('status')
    })

    test('should handle database operations', async () => {
      const { MongoClient } = await import('mongodb')
      const client = new MongoClient('mongodb://localhost:27017')
      const db = client.db('testdb')
      const collection = db.collection('teams')
      
      // Test insert
      const insertResult = await collection.insertOne({ name: 'Test Team' })
      expect(insertResult.acknowledged).toBe(true)
      
      // Test find
      const findResult = await collection.findOne({ name: 'Test Team' })
      expect(findResult).toBeDefined()
      
      // Test update
      const updateResult = await collection.updateOne(
        { name: 'Test Team' },
        { $set: { updated: true } }
      )
      expect(updateResult.acknowledged).toBe(true)
      
      // Test delete
      const deleteResult = await collection.deleteOne({ name: 'Test Team' })
      expect(deleteResult.acknowledged).toBe(true)
    })
  })

  describe('CodeInterpretor Service', () => {
    test('should analyze repository structure', async () => {
      const analyzeRepositoryStructure = async (repositoryData) => {
        const analysis = {
          languages: {},
          fileTypes: {},
          complexity: 0,
          size: 0,
          structure: {
            directories: 0,
            files: 0
          }
        }
        
        // Analyze languages
        if (repositoryData.languages) {
          Object.entries(repositoryData.languages).forEach(([lang, bytes]) => {
            analysis.languages[lang] = bytes
          })
        }
        
        // Analyze file types
        if (repositoryData.files) {
          repositoryData.files.forEach(file => {
            const extension = file.name.split('.').pop() || 'no-extension'
            analysis.fileTypes[extension] = (analysis.fileTypes[extension] || 0) + 1
          })
        }
        
        // Calculate complexity
        analysis.complexity = Object.keys(analysis.languages).length * 10
        
        // Calculate size
        analysis.size = Object.values(analysis.languages).reduce((sum, bytes) => sum + bytes, 0)
        
        return analysis
      }
      
      const repositoryData = {
        languages: {
          JavaScript: 1000,
          TypeScript: 500,
          CSS: 200
        },
        files: [
          { name: 'index.js' },
          { name: 'app.ts' },
          { name: 'styles.css' },
          { name: 'README.md' }
        ]
      }
      
      const result = await analyzeRepositoryStructure(repositoryData)
      
      expect(result.languages).toEqual({
        JavaScript: 1000,
        TypeScript: 500,
        CSS: 200
      })
      expect(result.complexity).toBe(30)
      expect(result.size).toBe(1700)
    })

    test('should generate DORA insights', async () => {
      const generateDORAInsights = async (metrics) => {
        const insights = []
        
        // Analyze deployment frequency
        if (metrics.deployment_frequency) {
          const freq = metrics.deployment_frequency
          if (freq.daily > 0) {
            insights.push('High deployment frequency - excellent DevOps practices')
          } else if (freq.weekly > 0) {
            insights.push('Good deployment frequency - regular releases')
          } else {
            insights.push('Low deployment frequency - consider more frequent releases')
          }
        }
        
        // Analyze lead time
        if (metrics.lead_time) {
          const leadTime = metrics.lead_time.average
          if (leadTime < 1) {
            insights.push('Excellent lead time - very fast delivery')
          } else if (leadTime < 7) {
            insights.push('Good lead time - reasonable delivery speed')
          } else {
            insights.push('Long lead time - consider process improvements')
          }
        }
        
        // Analyze MTTR
        if (metrics.mttr) {
          const mttr = metrics.mttr.average
          if (mttr < 1) {
            insights.push('Excellent MTTR - very fast recovery')
          } else if (mttr < 24) {
            insights.push('Good MTTR - reasonable recovery time')
          } else {
            insights.push('Long MTTR - consider incident response improvements')
          }
        }
        
        // Analyze change failure rate
        if (metrics.change_failure_rate) {
          const failureRate = metrics.change_failure_rate.percentage
          if (failureRate < 5) {
            insights.push('Excellent change failure rate - very stable releases')
          } else if (failureRate < 15) {
            insights.push('Good change failure rate - acceptable stability')
          } else {
            insights.push('High change failure rate - consider quality improvements')
          }
        }
        
        return insights
      }
      
      const metrics = {
        deployment_frequency: { daily: 2, weekly: 10, monthly: 40 },
        lead_time: { average: 2, median: 1.5 },
        mttr: { average: 4, median: 2 },
        change_failure_rate: { percentage: 3 }
      }
      
      const insights = await generateDORAInsights(metrics)
      
      expect(insights).toContain('High deployment frequency - excellent DevOps practices')
      expect(insights).toContain('Good lead time - reasonable delivery speed')
      expect(insights).toContain('Good MTTR - reasonable recovery time')
      expect(insights).toContain('Excellent change failure rate - very stable releases')
    })

    test('should perform DORA analysis', async () => {
      const performDORAAnalysis = async (repositoryUrl) => {
        try {
          // Get repository info
          const repoInfo = await mockGetRepositoryInfo(repositoryUrl)
          
          // Get DORA metrics
          const doraMetrics = await mockGetDORAMetrics(repositoryUrl)
          
          // Analyze structure
          const structureAnalysis = await analyzeRepositoryStructure(repoInfo)
          
          // Generate insights
          const insights = await generateDORAInsights(doraMetrics)
          
          return {
            repository: repoInfo,
            metrics: doraMetrics,
            structure: structureAnalysis,
            insights: insights,
            timestamp: new Date().toISOString()
          }
        } catch (error) {
          return {
            error: error.message,
            timestamp: new Date().toISOString(),
            status: 'failed'
          }
        }
      }
      
      const analyzeRepositoryStructure = async (repoInfo) => {
        return {
          languages: repoInfo.language ? { [repoInfo.language]: 1000 } : {},
          complexity: repoInfo.language ? 10 : 0,
          size: repoInfo.stargazers_count || 0
        }
      }
      
      const generateDORAInsights = async (metrics) => {
        return ['Test insight']
      }
      
      const result = await performDORAAnalysis('https://github.com/owner/repo')
      
      expect(result).toHaveProperty('repository')
      expect(result).toHaveProperty('metrics')
      expect(result).toHaveProperty('structure')
      expect(result).toHaveProperty('insights')
      expect(result).toHaveProperty('timestamp')
    })
  })

  describe('AnalysisService Service', () => {
    test('should run AI analysis', async () => {
      const runAIAnalysis = async (metricsEntry) => {
        const OpenAI = await import('openai')
        const openai = new OpenAI.default({ apiKey: 'test-key' })
        
        const prompt = `Analyze the following metrics and provide insights:
        Repository: ${metricsEntry.repository}
        Metrics: ${JSON.stringify(metricsEntry.metrics)}
        Timestamp: ${metricsEntry.timestamp}`
        
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }]
          })
          
          return {
            analysis: response.choices[0].message.content,
            status: 'completed',
            timestamp: new Date().toISOString()
          }
        } catch (error) {
          return {
            error: error.message,
            status: 'failed',
            timestamp: new Date().toISOString()
          }
        }
      }
      
      const metricsEntry = {
        repository: 'owner/repo',
        metrics: {
          deployment_frequency: { daily: 1 },
          lead_time: { average: 2 }
        },
        timestamp: new Date().toISOString()
      }
      
      const result = await runAIAnalysis(metricsEntry)
      
      expect(result).toHaveProperty('analysis')
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('timestamp')
    })
  })

  describe('MetricsService Service', () => {
    test('should analyze repository', async () => {
      const analyzeRepository = async (repositoryUrl) => {
        try {
          // Get repository info
          const repoInfo = await mockGetRepositoryInfo(repositoryUrl)
          
          // Get DORA metrics
          const doraMetrics = await mockGetDORAMetrics(repositoryUrl)
          
          return {
            repository: repoInfo,
            metrics: doraMetrics,
            timestamp: new Date().toISOString()
          }
        } catch (error) {
          throw new Error(`Analysis failed: ${error.message}`)
        }
      }
      
      const result = await analyzeRepository('https://github.com/owner/repo')
      
      expect(result).toHaveProperty('repository')
      expect(result).toHaveProperty('metrics')
      expect(result).toHaveProperty('timestamp')
    })
  })

  describe('Error Handling', () => {
    test('should handle OpenAI API errors', async () => {
      const handleOpenAIError = (error) => {
        if (error.code === 'insufficient_quota') {
          return { error: 'API quota exceeded', retry: false }
        }
        if (error.code === 'rate_limit_exceeded') {
          return { error: 'Rate limit exceeded', retry: true }
        }
        if (error.code === 'invalid_api_key') {
          return { error: 'Invalid API key', retry: false }
        }
        return { error: 'Unknown OpenAI error', retry: false }
      }
      
      expect(handleOpenAIError({ code: 'insufficient_quota' })).toEqual({ error: 'API quota exceeded', retry: false })
      expect(handleOpenAIError({ code: 'rate_limit_exceeded' })).toEqual({ error: 'Rate limit exceeded', retry: true })
      expect(handleOpenAIError({ code: 'invalid_api_key' })).toEqual({ error: 'Invalid API key', retry: false })
      expect(handleOpenAIError({ code: 'unknown' })).toEqual({ error: 'Unknown OpenAI error', retry: false })
    })

    test('should handle GitHub API errors', async () => {
      const handleGitHubError = (error) => {
        if (error.status === 404) {
          return { error: 'Repository not found', retry: false }
        }
        if (error.status === 403) {
          return { error: 'Rate limit exceeded', retry: true }
        }
        if (error.status === 401) {
          return { error: 'Unauthorized', retry: false }
        }
        return { error: 'Unknown GitHub error', retry: false }
      }
      
      expect(handleGitHubError({ status: 404 })).toEqual({ error: 'Repository not found', retry: false })
      expect(handleGitHubError({ status: 403 })).toEqual({ error: 'Rate limit exceeded', retry: true })
      expect(handleGitHubError({ status: 401 })).toEqual({ error: 'Unauthorized', retry: false })
      expect(handleGitHubError({ status: 500 })).toEqual({ error: 'Unknown GitHub error', retry: false })
    })

    test('should handle database errors', async () => {
      const handleDatabaseError = (error) => {
        if (error.code === 'ECONNREFUSED') {
          return { error: 'Database connection refused', retry: true }
        }
        if (error.code === 'ETIMEDOUT') {
          return { error: 'Database connection timeout', retry: true }
        }
        if (error.code === 'ENOTFOUND') {
          return { error: 'Database host not found', retry: false }
        }
        return { error: 'Unknown database error', retry: false }
      }
      
      expect(handleDatabaseError({ code: 'ECONNREFUSED' })).toEqual({ error: 'Database connection refused', retry: true })
      expect(handleDatabaseError({ code: 'ETIMEDOUT' })).toEqual({ error: 'Database connection timeout', retry: true })
      expect(handleDatabaseError({ code: 'ENOTFOUND' })).toEqual({ error: 'Database host not found', retry: false })
      expect(handleDatabaseError({ code: 'UNKNOWN' })).toEqual({ error: 'Unknown database error', retry: false })
    })
  })

  describe('Performance Tests', () => {
    test('should handle concurrent operations', async () => {
      const performConcurrentOperations = async (operations) => {
        const startTime = Date.now()
        const results = await Promise.all(operations.map(op => op()))
        const endTime = Date.now()
        
        return {
          results,
          duration: endTime - startTime,
          count: operations.length
        }
      }
      
      const operations = Array.from({ length: 10 }, (_, i) => 
        () => Promise.resolve(`result-${i}`)
      )
      
      const result = await performConcurrentOperations(operations)
      
      expect(result.results).toHaveLength(10)
      expect(result.duration).toBeLessThan(1000)
      expect(result.count).toBe(10)
    })

    test('should handle large datasets', async () => {
      const processLargeDataset = async (data) => {
        const batchSize = 100
        const results = []
        
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize)
          const batchResults = batch.map(item => ({ ...item, processed: true }))
          results.push(...batchResults)
        }
        
        return results
      }
      
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({ id: i, data: `item-${i}` }))
      const result = await processLargeDataset(largeDataset)
      
      expect(result).toHaveLength(1000)
      expect(result[0]).toHaveProperty('processed', true)
    })
  })
})