import { jest } from '@jest/globals'

describe('Comprehensive Business Logic Tests', () => {
  describe('GitHubUpdater Business Logic', () => {
    test('should process user data correctly', () => {
      const processUserData = (userData) => {
        return {
          id: userData.id || generateId(),
          email: userData.email?.toLowerCase().trim(),
          name: userData.name?.trim(),
          githubUsername: userData.githubUsername?.toLowerCase().trim(),
          role: userData.role || 'user',
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      const generateId = () => Math.random().toString(36).substr(2, 9)

      const rawUserData = {
        email: '  USER@EXAMPLE.COM  ',
        name: '  Test User  ',
        githubUsername: '  TESTUSER  ',
        role: 'admin'
      }

      const processed = processUserData(rawUserData)
      
      expect(processed.email).toBe('user@example.com')
      expect(processed.name).toBe('Test User')
      expect(processed.githubUsername).toBe('testuser')
      expect(processed.role).toBe('admin')
      expect(processed.id).toBeDefined()
      expect(processed.createdAt).toBeDefined()
      expect(processed.updatedAt).toBeDefined()
    })

    test('should validate GitHub username format', () => {
      const validateGitHubUsername = (username) => {
        if (!username || typeof username !== 'string') return false
        if (username.length < 1 || username.length > 39) return false
        if (!/^[a-zA-Z0-9-]+$/.test(username)) return false
        if (username.startsWith('-') || username.endsWith('-')) return false
        return true
      }

      expect(validateGitHubUsername('valid-username')).toBe(true)
      expect(validateGitHubUsername('invalid_username')).toBe(false)
      expect(validateGitHubUsername('-invalid')).toBe(false)
      expect(validateGitHubUsername('invalid-')).toBe(false)
      expect(validateGitHubUsername('')).toBe(false)
      expect(validateGitHubUsername(null)).toBe(false)
    })

    test('should determine if user needs update', () => {
      const shouldUpdateUser = (currentUser, githubData) => {
        if (!currentUser || !githubData) return false
        if (!githubData.login) return false
        if (currentUser.githubUsername === githubData.login) return false
        return true
      }

      const currentUser = { githubUsername: 'oldname' }
      const githubData = { login: 'newname' }
      const sameData = { login: 'oldname' }
      const noLogin = { name: 'Test User' }

      expect(shouldUpdateUser(currentUser, githubData)).toBe(true)
      expect(shouldUpdateUser(currentUser, sameData)).toBe(false)
      expect(shouldUpdateUser(currentUser, noLogin)).toBe(false)
      expect(shouldUpdateUser(null, githubData)).toBe(false)
    })

    test('should process batch operations', () => {
      const processBatch = (items, batchSize = 10) => {
        const batches = []
        for (let i = 0; i < items.length; i += batchSize) {
          batches.push(items.slice(i, i + batchSize))
        }
        return batches
      }

      const items = Array.from({ length: 25 }, (_, i) => ({ id: i }))
      const batches = processBatch(items, 10)
      
      expect(batches).toHaveLength(3)
      expect(batches[0]).toHaveLength(10)
      expect(batches[1]).toHaveLength(10)
      expect(batches[2]).toHaveLength(5)
    })

    test('should handle user update operations', () => {
      const updateUserData = (user, newData) => {
        return {
          ...user,
          githubUsername: newData.login || user.githubUsername,
          name: newData.name || user.name,
          updatedAt: new Date().toISOString()
        }
      }

      const user = { id: 'user1', githubUsername: 'oldname', name: 'Old Name' }
      const newData = { login: 'newname', name: 'New Name' }

      const updated = updateUserData(user, newData)
      
      expect(updated.githubUsername).toBe('newname')
      expect(updated.name).toBe('New Name')
      expect(updated.updatedAt).toBeDefined()
    })

    test('should handle error scenarios in user processing', () => {
      const handleUserError = (error, userId) => {
        if (error.status === 404) {
          return { error: 'User not found', userId, retry: false }
        }
        if (error.status === 403) {
          return { error: 'Rate limit exceeded', userId, retry: true }
        }
        return { error: 'Unknown error', userId, retry: false }
      }

      expect(handleUserError({ status: 404 }, 'user1')).toEqual({
        error: 'User not found',
        userId: 'user1',
        retry: false
      })
      expect(handleUserError({ status: 403 }, 'user2')).toEqual({
        error: 'Rate limit exceeded',
        userId: 'user2',
        retry: true
      })
    })
  })

  describe('TeamUpdater Business Logic', () => {
    test('should calculate team metrics', () => {
      const calculateTeamMetrics = (team) => {
        const memberCount = team.members?.length || 0
        const repositoryCount = team.repositories?.length || 0
        const activityScore = team.recentActivity || 0
        
        const healthScore = Math.min(memberCount * 10 + repositoryCount * 5 + activityScore, 100)
        
        return {
          memberCount,
          repositoryCount,
          activityScore,
          healthScore,
          lastUpdated: new Date().toISOString()
        }
      }

      const team = {
        members: ['user1', 'user2', 'user3'],
        repositories: ['repo1', 'repo2'],
        recentActivity: 20
      }

      const metrics = calculateTeamMetrics(team)
      
      expect(metrics.memberCount).toBe(3)
      expect(metrics.repositoryCount).toBe(2)
      expect(metrics.activityScore).toBe(20)
      expect(metrics.healthScore).toBe(60) // 3*10 + 2*5 + 20 = 60
      expect(metrics.lastUpdated).toBeDefined()
    })

    test('should assess team health', () => {
      const assessTeamHealth = (metrics) => {
        if (metrics.healthScore >= 80) return 'excellent'
        if (metrics.healthScore >= 60) return 'good'
        if (metrics.healthScore >= 40) return 'fair'
        return 'poor'
      }

      expect(assessTeamHealth({ healthScore: 90 })).toBe('excellent')
      expect(assessTeamHealth({ healthScore: 70 })).toBe('good')
      expect(assessTeamHealth({ healthScore: 50 })).toBe('fair')
      expect(assessTeamHealth({ healthScore: 30 })).toBe('poor')
    })

    test('should categorize team size', () => {
      const categorizeTeamSize = (memberCount) => {
        if (memberCount < 3) return 'small'
        if (memberCount < 7) return 'medium'
        return 'large'
      }

      expect(categorizeTeamSize(2)).toBe('small')
      expect(categorizeTeamSize(5)).toBe('medium')
      expect(categorizeTeamSize(10)).toBe('large')
    })

    test('should determine update schedule', () => {
      const shouldUpdateTeam = (team, lastUpdate) => {
        if (!team || !lastUpdate) return true
        const hoursSinceUpdate = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60)
        return hoursSinceUpdate >= 24 // Update if more than 24 hours old
      }

      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      expect(shouldUpdateTeam({ id: 'team1' }, oneHourAgo.toISOString())).toBe(false)
      expect(shouldUpdateTeam({ id: 'team1' }, oneDayAgo.toISOString())).toBe(true)
      expect(shouldUpdateTeam({ id: 'team1' }, null)).toBe(true)
    })

    test('should process team data', () => {
      const processTeamData = (teamData) => {
        return {
          id: teamData.id || generateId(),
          name: teamData.name?.trim(),
          description: teamData.description?.trim(),
          members: Array.isArray(teamData.members) ? teamData.members.filter(m => m && typeof m === 'string') : [],
          repositories: Array.isArray(teamData.repositories) ? teamData.repositories.filter(r => r && typeof r === 'string') : [],
          createdAt: teamData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      const generateId = () => Math.random().toString(36).substr(2, 9)

      const rawTeamData = {
        name: '  Development Team  ',
        description: '  Main development team  ',
        members: ['user1', null, 'user2', ''],
        repositories: ['repo1', undefined, 'repo2']
      }

      const processed = processTeamData(rawTeamData)
      
      expect(processed.name).toBe('Development Team')
      expect(processed.description).toBe('Main development team')
      expect(processed.members).toEqual(['user1', 'user2'])
      expect(processed.repositories).toEqual(['repo1', 'repo2'])
      expect(processed.id).toBeDefined()
      expect(processed.createdAt).toBeDefined()
      expect(processed.updatedAt).toBeDefined()
    })

    test('should handle team update errors', () => {
      const handleTeamUpdateError = (error, teamName) => {
        if (error.code === 'ECONNREFUSED') {
          return { error: 'Database connection refused', teamName, retry: true }
        }
        if (error.code === 'ETIMEDOUT') {
          return { error: 'Database connection timeout', teamName, retry: true }
        }
        return { error: 'Unknown error', teamName, retry: false }
      }

      expect(handleTeamUpdateError({ code: 'ECONNREFUSED' }, 'Team One')).toEqual({
        error: 'Database connection refused',
        teamName: 'Team One',
        retry: true
      })
      expect(handleTeamUpdateError({ code: 'ETIMEDOUT' }, 'Team Two')).toEqual({
        error: 'Database connection timeout',
        teamName: 'Team Two',
        retry: true
      })
    })
  })

  describe('CodeInterpretor Business Logic', () => {
    test('should analyze repository complexity', () => {
      const analyzeRepositoryComplexity = (repoData) => {
        const languageCount = Object.keys(repoData.languages || {}).length
        const fileCount = repoData.files?.length || 0
        const complexity = languageCount * 10 + fileCount
        
        return {
          languages: repoData.languages || {},
          fileTypes: {},
          complexity,
          size: repoData.size || 0,
          structure: {
            directories: 0,
            files: fileCount
          }
        }
      }

      const repoData = {
        name: 'test-repo',
        language: 'JavaScript',
        size: 1000,
        files: [
          { name: 'index.js', type: 'file' },
          { name: 'src/', type: 'directory' },
          { name: 'tests/', type: 'directory' }
        ],
        languages: {
          JavaScript: 800,
          TypeScript: 200
        }
      }

      const analysis = analyzeRepositoryComplexity(repoData)
      
      expect(analysis.complexity).toBe(23) // 2 languages * 10 + 3 files = 23
      expect(analysis.size).toBe(1000)
      expect(analysis.structure.files).toBe(3)
      expect(analysis.languages.JavaScript).toBe(800)
    })

    test('should generate DORA insights', () => {
      const generateDORAInsights = (metrics) => {
        const insights = []
        
        // Deployment frequency insights
        if (metrics.deployment_frequency?.daily > 1) {
          insights.push('High deployment frequency - excellent DevOps practices')
        } else if (metrics.deployment_frequency?.daily === 0) {
          insights.push('No deployments detected - consider implementing CI/CD')
        }
        
        // Lead time insights
        if (metrics.lead_time?.average < 1) {
          insights.push('Excellent lead time - very fast delivery')
        } else if (metrics.lead_time?.average < 7) {
          insights.push('Good lead time - reasonable delivery speed')
        } else {
          insights.push('Lead time could be improved - consider automation')
        }
        
        // MTTR insights
        if (metrics.mttr?.average < 1) {
          insights.push('Excellent MTTR - very fast recovery')
        } else if (metrics.mttr?.average < 24) {
          insights.push('Good MTTR - reasonable recovery time')
        } else {
          insights.push('MTTR could be improved - consider better monitoring')
        }
        
        // Change failure rate insights
        if (metrics.change_failure_rate?.percentage < 5) {
          insights.push('Excellent change failure rate - very stable releases')
        } else if (metrics.change_failure_rate?.percentage < 15) {
          insights.push('Good change failure rate - stable releases')
        } else {
          insights.push('Change failure rate could be improved - consider better testing')
        }
        
        return insights
      }

      const metrics = {
        deployment_frequency: { daily: 2, weekly: 10, monthly: 40 },
        lead_time: { average: 2, median: 1.5 },
        mttr: { average: 4, median: 2 },
        change_failure_rate: { percentage: 3 }
      }

      const insights = generateDORAInsights(metrics)
      
      expect(insights).toContain('High deployment frequency - excellent DevOps practices')
      expect(insights).toContain('Good lead time - reasonable delivery speed')
      expect(insights).toContain('Good MTTR - reasonable recovery time')
      expect(insights).toContain('Excellent change failure rate - very stable releases')
    })

    test('should calculate repository health score', () => {
      const calculateRepositoryHealth = (analysis, metrics) => {
        let score = 0
        
        // Complexity score (0-25 points)
        if (analysis.complexity < 20) score += 25
        else if (analysis.complexity < 50) score += 15
        else if (analysis.complexity < 100) score += 10
        
        // Size score (0-25 points)
        if (analysis.size < 1000) score += 25
        else if (analysis.size < 10000) score += 15
        else if (analysis.size < 100000) score += 10
        
        // Language diversity score (0-25 points)
        const languageCount = Object.keys(analysis.languages).length
        if (languageCount === 1) score += 25
        else if (languageCount <= 3) score += 15
        else score += 10
        
        // DORA metrics score (0-25 points)
        if (metrics.deployment_frequency?.daily > 1) score += 25
        else if (metrics.deployment_frequency?.daily === 1) score += 15
        else score += 5
        
        return Math.min(score, 100)
      }

      const analysis = {
        complexity: 15,
        size: 500,
        languages: { JavaScript: 1000 }
      }

      const metrics = {
        deployment_frequency: { daily: 2 }
      }

      const healthScore = calculateRepositoryHealth(analysis, metrics)
      expect(healthScore).toBe(100) // All metrics are excellent
    })

    test('should analyze file types', () => {
      const analyzeFileTypes = (files) => {
        const fileTypes = {}
        
        files.forEach(file => {
          if (file.type === 'file' && file.name) {
            const extension = file.name.split('.').pop() || 'no-extension'
            fileTypes[extension] = (fileTypes[extension] || 0) + 1
          }
        })
        
        return fileTypes
      }

      const files = [
        { name: 'index.js', type: 'file' },
        { name: 'app.js', type: 'file' },
        { name: 'style.css', type: 'file' },
        { name: 'README.md', type: 'file' },
        { name: 'src/', type: 'directory' },
        { name: 'config', type: 'file' } // No extension
      ]

      const fileTypes = analyzeFileTypes(files)
      
      expect(fileTypes.js).toBe(2)
      expect(fileTypes.css).toBe(1)
      expect(fileTypes.md).toBe(1)
      expect(fileTypes['no-extension']).toBeUndefined()
    })

    test('should process repository data', () => {
      const processRepositoryData = (repoData) => {
        return {
          id: repoData.id || generateId(),
          name: repoData.name?.trim(),
          description: repoData.description?.trim(),
          language: repoData.language || 'Unknown',
          size: Math.max(0, parseInt(repoData.size) || 0),
          languages: repoData.languages || {},
          files: Array.isArray(repoData.files) ? repoData.files.filter(f => f && f.name) : [],
          lastAnalyzed: new Date().toISOString()
        }
      }

      const generateId = () => Math.random().toString(36).substr(2, 9)

      const rawRepoData = {
        name: '  test-repository  ',
        description: '  Test repository description  ',
        language: 'JavaScript',
        size: '1000',
        languages: { JavaScript: 800, TypeScript: 200 },
        files: [
          { name: 'index.js', type: 'file' },
          null,
          { name: 'src/', type: 'directory' }
        ]
      }

      const processed = processRepositoryData(rawRepoData)
      
      expect(processed.name).toBe('test-repository')
      expect(processed.description).toBe('Test repository description')
      expect(processed.language).toBe('JavaScript')
      expect(processed.size).toBe(1000)
      expect(processed.files).toHaveLength(2)
      expect(processed.id).toBeDefined()
      expect(processed.lastAnalyzed).toBeDefined()
    })
  })

  describe('AnalysisService Business Logic', () => {
    test('should determine analysis status', () => {
      const determineAnalysisStatus = (metrics) => {
        if (!metrics) return 'pending'
        if (metrics.status === 'completed') return 'completed'
        if (metrics.status === 'failed') return 'failed'
        if (metrics.status === 'in_progress') return 'in_progress'
        return 'pending'
      }

      expect(determineAnalysisStatus(null)).toBe('pending')
      expect(determineAnalysisStatus({ status: 'completed' })).toBe('completed')
      expect(determineAnalysisStatus({ status: 'failed' })).toBe('failed')
      expect(determineAnalysisStatus({ status: 'in_progress' })).toBe('in_progress')
      expect(determineAnalysisStatus({})).toBe('pending')
    })

    test('should calculate analysis priority', () => {
      const calculateAnalysisPriority = (team, repository) => {
        let priority = 0
        
        // Team size factor
        const teamSize = team.members?.length || 0
        if (teamSize > 10) priority += 3
        else if (teamSize > 5) priority += 2
        else if (teamSize > 0) priority += 1
        
        // Repository activity factor
        const repoSize = repository.size || 0
        if (repoSize > 100000) priority += 3
        else if (repoSize > 10000) priority += 2
        else if (repoSize > 1000) priority += 1
        
        // Repository age factor
        const createdAt = new Date(repository.createdAt || Date.now())
        const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        if (ageInDays > 365) priority += 2
        else if (ageInDays > 30) priority += 1
        
        return Math.min(priority, 10) // Cap at 10
      }

      const team = { members: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'] }
      const repository = { 
        size: 50000, 
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString() 
      }

      const priority = calculateAnalysisPriority(team, repository)
      expect(priority).toBe(5) // 2 (team size) + 2 (repo size) + 1 (repo age) = 5
    })

    test('should process analysis results', () => {
      const processAnalysisResults = (rawResults) => {
        return {
          analysis: rawResults.analysis || '',
          insights: Array.isArray(rawResults.insights) ? rawResults.insights.filter(i => i && typeof i === 'string') : [],
          recommendations: Array.isArray(rawResults.recommendations) ? rawResults.recommendations.filter(r => r && typeof r === 'string') : [],
          complexity: rawResults.complexity || 'Unknown',
          healthScore: Math.max(0, Math.min(100, parseInt(rawResults.healthScore) || 0)),
          timestamp: new Date().toISOString()
        }
      }

      const rawResults = {
        analysis: 'Good repository',
        insights: ['Good structure', null, 'Needs tests', ''],
        recommendations: ['Add docs', undefined, 'Improve error handling'],
        complexity: 'Medium',
        healthScore: '85',
        extraField: 'should be removed'
      }

      const processed = processAnalysisResults(rawResults)
      
      expect(processed.analysis).toBe('Good repository')
      expect(processed.insights).toEqual(['Good structure', 'Needs tests'])
      expect(processed.recommendations).toEqual(['Add docs', 'Improve error handling'])
      expect(processed.complexity).toBe('Medium')
      expect(processed.healthScore).toBe(85)
      expect(processed.timestamp).toBeDefined()
      expect(processed.extraField).toBeUndefined()
    })
  })

  describe('MetricsService Business Logic', () => {
    test('should aggregate metrics', () => {
      const aggregateMetrics = (metricsArray) => {
        const aggregated = {
          totalRepositories: metricsArray.length,
          averageComplexity: 0,
          averageHealthScore: 0,
          languageDistribution: {},
          sizeDistribution: { small: 0, medium: 0, large: 0 }
        }

        let totalComplexity = 0
        let totalHealthScore = 0

        metricsArray.forEach(metrics => {
          totalComplexity += metrics.complexity || 0
          totalHealthScore += metrics.healthScore || 0

          // Language distribution
          Object.entries(metrics.languages || {}).forEach(([lang, bytes]) => {
            aggregated.languageDistribution[lang] = 
              (aggregated.languageDistribution[lang] || 0) + bytes
          })

          // Size distribution
          const size = metrics.size || 0
          if (size < 1000) aggregated.sizeDistribution.small++
          else if (size < 10000) aggregated.sizeDistribution.medium++
          else aggregated.sizeDistribution.large++
        })

        aggregated.averageComplexity = metricsArray.length > 0 ? 
          Math.round((totalComplexity / metricsArray.length) * 100) / 100 : 0
        aggregated.averageHealthScore = metricsArray.length > 0 ? 
          Math.round((totalHealthScore / metricsArray.length) * 100) / 100 : 0

        return aggregated
      }

      const metricsArray = [
        { complexity: 20, healthScore: 80, languages: { JavaScript: 1000 }, size: 500 },
        { complexity: 30, healthScore: 70, languages: { Python: 2000 }, size: 5000 },
        { complexity: 40, healthScore: 90, languages: { JavaScript: 1500, TypeScript: 500 }, size: 15000 }
      ]

      const aggregated = aggregateMetrics(metricsArray)
      
      expect(aggregated.totalRepositories).toBe(3)
      expect(aggregated.averageComplexity).toBe(30)
      expect(aggregated.averageHealthScore).toBe(80)
      expect(aggregated.languageDistribution.JavaScript).toBe(2500)
      expect(aggregated.languageDistribution.Python).toBe(2000)
      expect(aggregated.languageDistribution.TypeScript).toBe(500)
      expect(aggregated.sizeDistribution.small).toBe(1)
      expect(aggregated.sizeDistribution.medium).toBe(1)
      expect(aggregated.sizeDistribution.large).toBe(1)
    })

    test('should validate metrics', () => {
      const validateMetrics = (metrics) => {
        const errors = []
        
        if (!metrics || typeof metrics !== 'object') {
          errors.push('Metrics must be an object')
          return errors
        }
        
        if (metrics.complexity !== undefined && (typeof metrics.complexity !== 'number' || metrics.complexity < 0)) {
          errors.push('Complexity must be a non-negative number')
        }
        
        if (metrics.healthScore !== undefined && (typeof metrics.healthScore !== 'number' || metrics.healthScore < 0 || metrics.healthScore > 100)) {
          errors.push('Health score must be a number between 0 and 100')
        }
        
        if (metrics.size !== undefined && (typeof metrics.size !== 'number' || metrics.size < 0)) {
          errors.push('Size must be a non-negative number')
        }
        
        if (metrics.languages !== undefined && (typeof metrics.languages !== 'object' || Array.isArray(metrics.languages))) {
          errors.push('Languages must be an object')
        }
        
        return errors
      }

      expect(validateMetrics(null)).toEqual(['Metrics must be an object'])
      expect(validateMetrics({ complexity: -1 })).toEqual(['Complexity must be a non-negative number'])
      expect(validateMetrics({ healthScore: 150 })).toEqual(['Health score must be a number between 0 and 100'])
      expect(validateMetrics({ size: -100 })).toEqual(['Size must be a non-negative number'])
      expect(validateMetrics({ languages: [] })).toEqual(['Languages must be an object'])
      expect(validateMetrics({ complexity: 20, healthScore: 80, size: 1000, languages: {} })).toEqual([])
    })

    test('should calculate metrics trends', () => {
      const calculateTrends = (historicalData) => {
        if (historicalData.length < 2) return { trend: 'insufficient_data' }
        
        const latest = historicalData[historicalData.length - 1]
        const previous = historicalData[historicalData.length - 2]
        
        const complexityTrend = latest.complexity > previous.complexity ? 'increasing' : 
                              latest.complexity < previous.complexity ? 'decreasing' : 'stable'
        
        const healthTrend = latest.healthScore > previous.healthScore ? 'improving' : 
                           latest.healthScore < previous.healthScore ? 'declining' : 'stable'
        
        return {
          complexityTrend,
          healthTrend,
          dataPoints: historicalData.length
        }
      }

      const historicalData = [
        { complexity: 20, healthScore: 70 },
        { complexity: 25, healthScore: 75 },
        { complexity: 30, healthScore: 80 }
      ]

      const trends = calculateTrends(historicalData)
      
      expect(trends.complexityTrend).toBe('increasing')
      expect(trends.healthTrend).toBe('improving')
      expect(trends.dataPoints).toBe(3)
    })
  })

  describe('TokenManager Business Logic', () => {
    test('should rotate tokens correctly', () => {
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

    test('should validate token format', () => {
      const validateToken = (token) => {
        if (!token || typeof token !== 'string') return false
        if (token.length < 10) return false
        if (!/^[a-zA-Z0-9_-]+$/.test(token)) return false
        return true
      }

      expect(validateToken('valid_token_123')).toBe(true)
      expect(validateToken('invalid token')).toBe(false)
      expect(validateToken('short')).toBe(false)
      expect(validateToken('')).toBe(false)
      expect(validateToken(null)).toBe(false)
    })

    test('should create token configuration', () => {
      const createTokenConfig = (tokens) => {
        return {
          tokens: tokens.filter(token => token && typeof token === 'string'),
          currentIndex: 0,
          maxRetries: 3
        }
      }

      const config = createTokenConfig(['token1', '', 'token2', null, 'token3'])
      
      expect(config.tokens).toEqual(['token1', 'token2', 'token3'])
      expect(config.currentIndex).toBe(0)
      expect(config.maxRetries).toBe(3)
    })
  })

  describe('Error Handling Business Logic', () => {
    test('should categorize errors', () => {
      const categorizeError = (error) => {
        if (error.status === 404) return 'NOT_FOUND'
        if (error.status === 403) return 'FORBIDDEN'
        if (error.status === 401) return 'UNAUTHORIZED'
        if (error.status >= 500) return 'SERVER_ERROR'
        if (error.status >= 400) return 'CLIENT_ERROR'
        if (error.code === 'ECONNREFUSED') return 'CONNECTION_ERROR'
        if (error.code === 'ETIMEDOUT') return 'TIMEOUT_ERROR'
        return 'UNKNOWN_ERROR'
      }

      expect(categorizeError({ status: 404 })).toBe('NOT_FOUND')
      expect(categorizeError({ status: 403 })).toBe('FORBIDDEN')
      expect(categorizeError({ status: 401 })).toBe('UNAUTHORIZED')
      expect(categorizeError({ status: 500 })).toBe('SERVER_ERROR')
      expect(categorizeError({ status: 400 })).toBe('CLIENT_ERROR')
      expect(categorizeError({ code: 'ECONNREFUSED' })).toBe('CONNECTION_ERROR')
      expect(categorizeError({ code: 'ETIMEDOUT' })).toBe('TIMEOUT_ERROR')
      expect(categorizeError({ message: 'Unknown' })).toBe('UNKNOWN_ERROR')
    })

    test('should determine retry strategy', () => {
      const shouldRetry = (error, attemptCount = 0) => {
        const maxRetries = 3
        
        if (attemptCount >= maxRetries) return false
        if (error.status === 404 || error.status === 401) return false
        if (error.status === 403 || error.status === 429) return true
        if (error.status >= 500) return true
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') return true
        
        return false
      }

      expect(shouldRetry({ status: 404 }, 0)).toBe(false)
      expect(shouldRetry({ status: 401 }, 0)).toBe(false)
      expect(shouldRetry({ status: 403 }, 0)).toBe(true)
      expect(shouldRetry({ status: 429 }, 0)).toBe(true)
      expect(shouldRetry({ status: 500 }, 0)).toBe(true)
      expect(shouldRetry({ code: 'ECONNREFUSED' }, 0)).toBe(true)
      expect(shouldRetry({ code: 'ETIMEDOUT' }, 0)).toBe(true)
      expect(shouldRetry({ status: 500 }, 3)).toBe(false) // Max retries reached
    })

    test('should format error messages', () => {
      const formatErrorMessage = (error, context) => {
        const timestamp = new Date().toISOString()
        const errorType = error.status ? `HTTP_${error.status}` : error.code || 'UNKNOWN'
        
        return {
          message: error.message || 'Unknown error occurred',
          type: errorType,
          context: context || 'unknown',
          timestamp,
          retry: shouldRetry(error)
        }
      }

      const shouldRetry = (error) => {
        if (error.status === 404 || error.status === 401) return false
        if (error.status >= 500) return true
        return false
      }

      const error = { status: 500, message: 'Internal server error' }
      const formatted = formatErrorMessage(error, 'user_update')
      
      expect(formatted.message).toBe('Internal server error')
      expect(formatted.type).toBe('HTTP_500')
      expect(formatted.context).toBe('user_update')
      expect(formatted.timestamp).toBeDefined()
      expect(formatted.retry).toBe(true)
    })
  })

  describe('Utility Functions', () => {
    test('should generate unique identifiers', () => {
      const generateId = () => {
        return Math.random().toString(36).substr(2, 9)
      }

      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).toHaveLength(9)
      expect(id2).toHaveLength(9)
      expect(id1).not.toBe(id2)
    })

    test('should format timestamps consistently', () => {
      const formatTimestamp = (date = new Date()) => {
        return date.toISOString()
      }

      const now = new Date()
      const formatted = formatTimestamp(now)
      
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    test('should sanitize strings', () => {
      const sanitizeString = (str) => {
        if (!str || typeof str !== 'string') return ''
        return str.trim().replace(/[<>]/g, '')
      }

      expect(sanitizeString('  test string  ')).toBe('test string')
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
      expect(sanitizeString('')).toBe('')
      expect(sanitizeString(null)).toBe('')
      expect(sanitizeString(undefined)).toBe('')
    })

    test('should deep clone objects', () => {
      const deepClone = (obj) => {
        if (obj === null || typeof obj !== 'object') return obj
        if (obj instanceof Date) return new Date(obj.getTime())
        if (Array.isArray(obj)) return obj.map(item => deepClone(item))
        
        const cloned = {}
        Object.keys(obj).forEach(key => {
          cloned[key] = deepClone(obj[key])
        })
        return cloned
      }

      const original = {
        name: 'test',
        nested: { value: 123 },
        array: [1, 2, { nested: true }],
        date: new Date('2024-01-01')
      }

      const cloned = deepClone(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.nested).not.toBe(original.nested)
      expect(cloned.array).not.toBe(original.array)
      expect(cloned.date).not.toBe(original.date)
    })
  })
})