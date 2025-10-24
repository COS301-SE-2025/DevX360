import { jest } from '@jest/globals'

describe('Business Logic Tests (No External APIs)', () => {
  describe('Data Processing Functions', () => {
    test('should process GitHub username validation', () => {
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

    test('should process team metrics calculation', () => {
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

    test('should process repository complexity analysis', () => {
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

    test('should process DORA insights generation', () => {
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
  })

  describe('Data Validation Functions', () => {
    test('should validate team structure', () => {
      const validateTeam = (team) => {
        if (!team || typeof team !== 'object') return false
        if (!team.id || typeof team.id !== 'string') return false
        if (!team.name || typeof team.name !== 'string') return false
        if (team.members && !Array.isArray(team.members)) return false
        if (team.repositories && !Array.isArray(team.repositories)) return false
        return true
      }

      expect(validateTeam({
        id: 'team1',
        name: 'Team One',
        members: ['user1'],
        repositories: ['repo1']
      })).toBe(true)

      expect(validateTeam({
        id: 'team1',
        name: 'Team One'
        // Missing optional fields
      })).toBe(true)

      expect(validateTeam({
        name: 'Team One'
        // Missing id
      })).toBe(false)

      expect(validateTeam(null)).toBe(false)
      expect(validateTeam('not-an-object')).toBe(false)
    })

    test('should validate repository data', () => {
      const validateRepository = (repo) => {
        if (!repo || typeof repo !== 'object') return false
        if (!repo.name || typeof repo.name !== 'string') return false
        if (repo.languages && typeof repo.languages !== 'object') return false
        if (repo.files && !Array.isArray(repo.files)) return false
        return true
      }

      expect(validateRepository({
        name: 'test-repo',
        language: 'JavaScript',
        languages: { JavaScript: 1000 },
        files: [{ name: 'index.js' }]
      })).toBe(true)

      expect(validateRepository({
        name: 'test-repo'
        // Missing optional fields
      })).toBe(true)

      expect(validateRepository({
        language: 'JavaScript'
        // Missing name
      })).toBe(false)

      expect(validateRepository(null)).toBe(false)
      expect(validateRepository('not-an-object')).toBe(false)
    })

    test('should validate user data', () => {
      const validateUser = (user) => {
        if (!user || typeof user !== 'object') return false
        if (!user.email || typeof user.email !== 'string') return false
        if (!user.name || typeof user.name !== 'string') return false
        if (user.githubUsername && typeof user.githubUsername !== 'string') return false
        return true
      }

      expect(validateUser({
        email: 'user@example.com',
        name: 'Test User',
        githubUsername: 'testuser'
      })).toBe(true)

      expect(validateUser({
        email: 'user@example.com',
        name: 'Test User'
        // Missing optional githubUsername
      })).toBe(true)

      expect(validateUser({
        name: 'Test User'
        // Missing email
      })).toBe(false)

      expect(validateUser(null)).toBe(false)
      expect(validateUser('not-an-object')).toBe(false)
    })
  })

  describe('Data Transformation Functions', () => {
    test('should sanitize team data', () => {
      const sanitizeTeam = (team) => {
        return {
          id: team.id || '',
          name: (team.name || '').trim(),
          members: Array.isArray(team.members) ? team.members.filter(m => m && typeof m === 'string') : [],
          repositories: Array.isArray(team.repositories) ? team.repositories.filter(r => r && typeof r === 'string') : [],
          createdAt: team.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      const rawTeam = {
        id: 'team1',
        name: '  Team One  ',
        members: ['user1', null, 'user2', ''],
        repositories: ['repo1', undefined, 'repo2']
      }

      const sanitized = sanitizeTeam(rawTeam)
      
      expect(sanitized.name).toBe('Team One')
      expect(sanitized.members).toEqual(['user1', 'user2'])
      expect(sanitized.repositories).toEqual(['repo1', 'repo2'])
      expect(sanitized.createdAt).toBeDefined()
      expect(sanitized.updatedAt).toBeDefined()
    })

    test('should sanitize repository data', () => {
      const sanitizeRepository = (repo) => {
        return {
          name: (repo.name || '').trim(),
          language: repo.language || 'Unknown',
          size: Math.max(0, parseInt(repo.size) || 0),
          languages: repo.languages || {},
          files: Array.isArray(repo.files) ? repo.files.filter(f => f && f.name) : [],
          lastAnalyzed: new Date().toISOString()
        }
      }

      const rawRepo = {
        name: '  test-repo  ',
        language: 'JavaScript',
        size: '1000',
        languages: { JavaScript: 800, TypeScript: 200 },
        files: [
          { name: 'index.js', type: 'file' },
          null,
          { name: 'src/', type: 'directory' }
        ]
      }

      const sanitized = sanitizeRepository(rawRepo)
      
      expect(sanitized.name).toBe('test-repo')
      expect(sanitized.language).toBe('JavaScript')
      expect(sanitized.size).toBe(1000)
      expect(sanitized.files).toHaveLength(2)
      expect(sanitized.lastAnalyzed).toBeDefined()
    })

    test('should sanitize user data', () => {
      const sanitizeUser = (user) => {
        return {
          email: (user.email || '').toLowerCase().trim(),
          name: (user.name || '').trim(),
          githubUsername: user.githubUsername ? user.githubUsername.toLowerCase().trim() : '',
          role: user.role || 'user',
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      const rawUser = {
        email: '  USER@EXAMPLE.COM  ',
        name: '  Test User  ',
        githubUsername: '  TESTUSER  ',
        role: 'admin'
      }

      const sanitized = sanitizeUser(rawUser)
      
      expect(sanitized.email).toBe('user@example.com')
      expect(sanitized.name).toBe('Test User')
      expect(sanitized.githubUsername).toBe('testuser')
      expect(sanitized.role).toBe('admin')
      expect(sanitized.createdAt).toBeDefined()
      expect(sanitized.updatedAt).toBeDefined()
    })
  })

  describe('Business Logic Calculations', () => {
    test('should calculate team health score', () => {
      const calculateHealthScore = (team) => {
        const memberScore = (team.members?.length || 0) * 10
        const repoScore = (team.repositories?.length || 0) * 5
        const activityScore = team.recentActivity || 0
        
        return Math.min(memberScore + repoScore + activityScore, 100)
      }

      const team = {
        members: ['user1', 'user2', 'user3'],
        repositories: ['repo1', 'repo2'],
        recentActivity: 20
      }

      const healthScore = calculateHealthScore(team)
      expect(healthScore).toBe(60) // 3*10 + 2*5 + 20 = 60
    })

    test('should calculate repository complexity score', () => {
      const calculateComplexityScore = (repoData) => {
        const languageCount = Object.keys(repoData.languages || {}).length
        const fileCount = repoData.files?.length || 0
        const sizeFactor = Math.log10(repoData.size || 1)
        
        return Math.round(languageCount * 10 + fileCount + sizeFactor)
      }

      const repoData = {
        languages: { JavaScript: 800, TypeScript: 200, CSS: 100 },
        files: Array.from({ length: 25 }, (_, i) => ({ name: `file${i}.js` })),
        size: 10000
      }

      const complexityScore = calculateComplexityScore(repoData)
      expect(complexityScore).toBe(59) // 3 languages * 10 + 25 files + log10(10000) ≈ 59
    })

    test('should calculate DORA score', () => {
      const calculateDORAScore = (metrics) => {
        let score = 0
        
        // Deployment frequency score (0-25 points)
        if (metrics.deployment_frequency?.daily > 1) score += 25
        else if (metrics.deployment_frequency?.daily === 1) score += 15
        else if (metrics.deployment_frequency?.weekly > 0) score += 10
        
        // Lead time score (0-25 points)
        if (metrics.lead_time?.average < 1) score += 25
        else if (metrics.lead_time?.average < 7) score += 15
        else if (metrics.lead_time?.average < 30) score += 10
        
        // MTTR score (0-25 points)
        if (metrics.mttr?.average < 1) score += 25
        else if (metrics.mttr?.average < 24) score += 15
        else if (metrics.mttr?.average < 168) score += 10
        
        // Change failure rate score (0-25 points)
        if (metrics.change_failure_rate?.percentage < 5) score += 25
        else if (metrics.change_failure_rate?.percentage < 15) score += 15
        else if (metrics.change_failure_rate?.percentage < 30) score += 10
        
        return score
      }

      const metrics = {
        deployment_frequency: { daily: 2 },
        lead_time: { average: 2 },
        mttr: { average: 4 },
        change_failure_rate: { percentage: 3 }
      }

      const doraScore = calculateDORAScore(metrics)
      expect(doraScore).toBe(80) // Most metrics are excellent, lead time is good
    })
  })

  describe('Error Handling Functions', () => {
    test('should handle GitHub API errors', () => {
      const handleGitHubError = (error) => {
        if (error.status === 404) {
          return { error: 'User not found', retry: false, code: 'USER_NOT_FOUND' }
        }
        if (error.status === 403) {
          return { error: 'Rate limit exceeded', retry: true, code: 'RATE_LIMIT' }
        }
        if (error.status === 401) {
          return { error: 'Authentication failed', retry: false, code: 'AUTH_FAILED' }
        }
        return { error: 'Unknown error', retry: false, code: 'UNKNOWN' }
      }

      expect(handleGitHubError({ status: 404 })).toEqual({ 
        error: 'User not found', 
        retry: false, 
        code: 'USER_NOT_FOUND' 
      })
      expect(handleGitHubError({ status: 403 })).toEqual({ 
        error: 'Rate limit exceeded', 
        retry: true, 
        code: 'RATE_LIMIT' 
      })
      expect(handleGitHubError({ status: 401 })).toEqual({ 
        error: 'Authentication failed', 
        retry: false, 
        code: 'AUTH_FAILED' 
      })
      expect(handleGitHubError({ status: 500 })).toEqual({ 
        error: 'Unknown error', 
        retry: false, 
        code: 'UNKNOWN' 
      })
    })

    test('should handle database errors', () => {
      const handleDatabaseError = (error) => {
        if (error.code === 'ECONNREFUSED') {
          return { error: 'Database connection refused', retry: true, code: 'CONNECTION_REFUSED' }
        }
        if (error.code === 'ETIMEDOUT') {
          return { error: 'Database connection timeout', retry: true, code: 'CONNECTION_TIMEOUT' }
        }
        if (error.code === 'ENOTFOUND') {
          return { error: 'Database host not found', retry: false, code: 'HOST_NOT_FOUND' }
        }
        return { error: 'Database error', retry: false, code: 'DATABASE_ERROR' }
      }

      expect(handleDatabaseError({ code: 'ECONNREFUSED' })).toEqual({ 
        error: 'Database connection refused', 
        retry: true, 
        code: 'CONNECTION_REFUSED' 
      })
      expect(handleDatabaseError({ code: 'ETIMEDOUT' })).toEqual({ 
        error: 'Database connection timeout', 
        retry: true, 
        code: 'CONNECTION_TIMEOUT' 
      })
      expect(handleDatabaseError({ code: 'ENOTFOUND' })).toEqual({ 
        error: 'Database host not found', 
        retry: false, 
        code: 'HOST_NOT_FOUND' 
      })
      expect(handleDatabaseError({ code: 'UNKNOWN' })).toEqual({ 
        error: 'Database error', 
        retry: false, 
        code: 'DATABASE_ERROR' 
      })
    })

    test('should handle OpenAI API errors', () => {
      const handleOpenAIError = (error) => {
        if (error.code === 'insufficient_quota') {
          return { error: 'API quota exceeded', retry: false, code: 'QUOTA_EXCEEDED' }
        }
        if (error.code === 'rate_limit_exceeded') {
          return { error: 'Rate limit exceeded', retry: true, code: 'RATE_LIMIT' }
        }
        if (error.code === 'invalid_api_key') {
          return { error: 'Invalid API key', retry: false, code: 'INVALID_KEY' }
        }
        return { error: 'OpenAI API error', retry: false, code: 'API_ERROR' }
      }

      expect(handleOpenAIError({ code: 'insufficient_quota' })).toEqual({ 
        error: 'API quota exceeded', 
        retry: false, 
        code: 'QUOTA_EXCEEDED' 
      })
      expect(handleOpenAIError({ code: 'rate_limit_exceeded' })).toEqual({ 
        error: 'Rate limit exceeded', 
        retry: true, 
        code: 'RATE_LIMIT' 
      })
      expect(handleOpenAIError({ code: 'invalid_api_key' })).toEqual({ 
        error: 'Invalid API key', 
        retry: false, 
        code: 'INVALID_KEY' 
      })
      expect(handleOpenAIError({ code: 'unknown' })).toEqual({ 
        error: 'OpenAI API error', 
        retry: false, 
        code: 'API_ERROR' 
      })
    })
  })

  describe('Utility Functions', () => {
    test('should format dates consistently', () => {
      const formatDate = (date) => {
        if (!date) return null
        const d = new Date(date)
        return d.toISOString()
      }

      const now = new Date()
      const formatted = formatDate(now)
      
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      expect(formatDate(null)).toBe(null)
      expect(formatDate(undefined)).toBe(null)
    })

    test('should generate unique IDs', () => {
      const generateId = () => {
        return Math.random().toString(36).substr(2, 9)
      }

      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).toHaveLength(9)
      expect(id2).toHaveLength(9)
      expect(id1).not.toBe(id2)
    })

    test('should debounce function calls', () => {
      const debounce = (func, delay) => {
        let timeoutId
        return (...args) => {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => func.apply(null, args), delay)
        }
      }

      let callCount = 0
      const debouncedFunc = debounce(() => callCount++, 100)
      
      debouncedFunc()
      debouncedFunc()
      debouncedFunc()
      
      expect(callCount).toBe(0) // Should not have been called yet
    })

    test('should throttle function calls', () => {
      const throttle = (func, delay) => {
        let lastCall = 0
        return (...args) => {
          const now = Date.now()
          if (now - lastCall >= delay) {
            lastCall = now
            return func.apply(null, args)
          }
        }
      }

      let callCount = 0
      const throttledFunc = throttle(() => callCount++, 100)
      
      throttledFunc()
      throttledFunc()
      throttledFunc()
      
      expect(callCount).toBe(1) // Should only be called once
    })
  })

  describe('Data Aggregation Functions', () => {
    test('should aggregate team metrics', () => {
      const aggregateTeamMetrics = (teams) => {
        const totalMembers = teams.reduce((sum, team) => sum + (team.members?.length || 0), 0)
        const totalRepositories = teams.reduce((sum, team) => sum + (team.repositories?.length || 0), 0)
        const averageHealthScore = teams.reduce((sum, team) => sum + (team.healthScore || 0), 0) / teams.length
        
        return {
          totalTeams: teams.length,
          totalMembers,
          totalRepositories,
          averageHealthScore: Math.round(averageHealthScore * 100) / 100
        }
      }

      const teams = [
        { members: ['user1', 'user2'], repositories: ['repo1'], healthScore: 80 },
        { members: ['user3'], repositories: ['repo2', 'repo3'], healthScore: 90 },
        { members: ['user4', 'user5', 'user6'], repositories: [], healthScore: 70 }
      ]

      const aggregated = aggregateTeamMetrics(teams)
      
      expect(aggregated.totalTeams).toBe(3)
      expect(aggregated.totalMembers).toBe(6)
      expect(aggregated.totalRepositories).toBe(3)
      expect(aggregated.averageHealthScore).toBe(80)
    })

    test('should aggregate repository metrics', () => {
      const aggregateRepositoryMetrics = (repositories) => {
        const totalSize = repositories.reduce((sum, repo) => sum + (repo.size || 0), 0)
        const languageCounts = {}
        const totalFiles = repositories.reduce((sum, repo) => sum + (repo.files?.length || 0), 0)
        
        repositories.forEach(repo => {
          Object.entries(repo.languages || {}).forEach(([lang, bytes]) => {
            languageCounts[lang] = (languageCounts[lang] || 0) + bytes
          })
        })
        
        return {
          totalRepositories: repositories.length,
          totalSize,
          totalFiles,
          languageDistribution: languageCounts
        }
      }

      const repositories = [
        { size: 1000, languages: { JavaScript: 800, TypeScript: 200 }, files: ['index.js', 'app.js'] },
        { size: 2000, languages: { JavaScript: 1500, CSS: 500 }, files: ['style.css'] },
        { size: 500, languages: { Python: 500 }, files: ['main.py', 'utils.py', 'test.py'] }
      ]

      const aggregated = aggregateRepositoryMetrics(repositories)
      
      expect(aggregated.totalRepositories).toBe(3)
      expect(aggregated.totalSize).toBe(3500)
      expect(aggregated.totalFiles).toBe(6)
      expect(aggregated.languageDistribution.JavaScript).toBe(2300)
      expect(aggregated.languageDistribution.TypeScript).toBe(200)
      expect(aggregated.languageDistribution.CSS).toBe(500)
      expect(aggregated.languageDistribution.Python).toBe(500)
    })
  })
})