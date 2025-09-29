import { jest } from '@jest/globals'

describe('Core Business Functions Tests', () => {
  describe('Token Management Logic', () => {
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

    test('should handle single token', () => {
      const tokenManager = {
        tokens: ['single-token'],
        currentIndex: 0,
        getNextToken: function() {
          return this.tokens[this.currentIndex]
        }
      }

      expect(tokenManager.getNextToken()).toBe('single-token')
      expect(tokenManager.getNextToken()).toBe('single-token') // Should return same token
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
  })

  describe('Data Processing Logic', () => {
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

    test('should process team data correctly', () => {
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

    test('should process repository data correctly', () => {
      const processRepositoryData = (repoData) => {
        return {
          id: repoData.id || generateId(),
          name: repoData.name?.trim(),
          description: repoData.description?.trim(),
          language: repoData.language || 'Unknown',
          size: Math.max(0, parseInt(repoData.size) || 0),
          languages: repoData.languages || {},
          files: Array.isArray(repoData.files) ? repoData.files.filter(f => f && f.name) : [],
          createdAt: repoData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
      expect(processed.createdAt).toBeDefined()
      expect(processed.updatedAt).toBeDefined()
    })
  })

  describe('Metrics Calculation Logic', () => {
    test('should calculate team health score', () => {
      const calculateTeamHealthScore = (team) => {
        const memberScore = (team.members?.length || 0) * 10
        const repoScore = (team.repositories?.length || 0) * 5
        const activityScore = team.recentActivity || 0
        
        return Math.min(memberScore + repoScore + activityScore, 100)
      }

      const team1 = {
        members: ['user1', 'user2', 'user3'],
        repositories: ['repo1', 'repo2'],
        recentActivity: 20
      }

      const team2 = {
        members: ['user1'],
        repositories: [],
        recentActivity: 5
      }

      const team3 = {
        members: [],
        repositories: [],
        recentActivity: 0
      }

      expect(calculateTeamHealthScore(team1)).toBe(60) // 3*10 + 2*5 + 20 = 60
      expect(calculateTeamHealthScore(team2)).toBe(15)
      expect(calculateTeamHealthScore(team3)).toBe(0)
    })

    test('should calculate repository complexity', () => {
      const calculateRepositoryComplexity = (repoData) => {
        const languageCount = Object.keys(repoData.languages || {}).length
        const fileCount = repoData.files?.length || 0
        const sizeFactor = Math.log10(repoData.size || 1)
        
        return Math.round(languageCount * 10 + fileCount + sizeFactor)
      }

      const repoData1 = {
        languages: { JavaScript: 800, TypeScript: 200, CSS: 100 },
        files: Array.from({ length: 25 }, (_, i) => ({ name: `file${i}.js` })),
        size: 10000
      }

      const repoData2 = {
        languages: { Python: 1000 },
        files: [{ name: 'main.py' }],
        size: 100
      }

      const complexity1 = calculateRepositoryComplexity(repoData1)
      const complexity2 = calculateRepositoryComplexity(repoData2)
      
      expect(complexity1).toBeGreaterThan(complexity2)
      expect(complexity1).toBe(59) // 3 languages * 10 + 25 files + log10(10000) ≈ 59
      expect(complexity2).toBe(13) // 1 language * 10 + 1 file + log10(100) ≈ 13
    })

    test('should calculate DORA metrics score', () => {
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

      const excellentMetrics = {
        deployment_frequency: { daily: 2 },
        lead_time: { average: 0.5 },
        mttr: { average: 0.5 },
        change_failure_rate: { percentage: 2 }
      }

      const poorMetrics = {
        deployment_frequency: { daily: 0, weekly: 0 },
        lead_time: { average: 30 },
        mttr: { average: 168 },
        change_failure_rate: { percentage: 30 }
      }

      expect(calculateDORAScore(excellentMetrics)).toBe(100)
      expect(calculateDORAScore(poorMetrics)).toBe(0)
    })
  })

  describe('Data Validation Logic', () => {
    test('should validate email format', () => {
      const validateEmail = (email) => {
        if (!email || typeof email !== 'string') return false
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      }

      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true)
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null)).toBe(false)
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
      expect(validateGitHubUsername('user123')).toBe(true)
      expect(validateGitHubUsername('invalid_username')).toBe(false)
      expect(validateGitHubUsername('-invalid')).toBe(false)
      expect(validateGitHubUsername('invalid-')).toBe(false)
      expect(validateGitHubUsername('')).toBe(false)
      expect(validateGitHubUsername(null)).toBe(false)
    })

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
  })

  describe('Error Handling Logic', () => {
    test('should categorize errors correctly', () => {
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
  })

  describe('Data Aggregation Logic', () => {
    test('should aggregate team statistics', () => {
      const aggregateTeamStats = (teams) => {
        const stats = {
          totalTeams: teams.length,
          totalMembers: 0,
          totalRepositories: 0,
          averageHealthScore: 0,
          teamsBySize: { small: 0, medium: 0, large: 0 }
        }

        let totalHealthScore = 0

        teams.forEach(team => {
          const memberCount = team.members?.length || 0
          const repoCount = team.repositories?.length || 0
          const healthScore = team.healthScore || 0

          stats.totalMembers += memberCount
          stats.totalRepositories += repoCount
          totalHealthScore += healthScore

          if (memberCount < 3) stats.teamsBySize.small++
          else if (memberCount < 7) stats.teamsBySize.medium++
          else stats.teamsBySize.large++
        })

        stats.averageHealthScore = teams.length > 0 ? Math.round((totalHealthScore / teams.length) * 100) / 100 : 0

        return stats
      }

      const teams = [
        { members: ['user1', 'user2'], repositories: ['repo1'], healthScore: 80 },
        { members: ['user3'], repositories: ['repo2', 'repo3'], healthScore: 90 },
        { members: ['user4', 'user5', 'user6', 'user7'], repositories: [], healthScore: 70 }
      ]

      const stats = aggregateTeamStats(teams)
      
      expect(stats.totalTeams).toBe(3)
      expect(stats.totalMembers).toBe(7)
      expect(stats.totalRepositories).toBe(3)
      expect(stats.averageHealthScore).toBe(80)
      expect(stats.teamsBySize.small).toBe(2)
      expect(stats.teamsBySize.medium).toBe(1)
      expect(stats.teamsBySize.large).toBe(0)
    })

    test('should aggregate repository statistics', () => {
      const aggregateRepositoryStats = (repositories) => {
        const stats = {
          totalRepositories: repositories.length,
          totalSize: 0,
          totalFiles: 0,
          languageDistribution: {},
          sizeDistribution: { small: 0, medium: 0, large: 0 }
        }

        repositories.forEach(repo => {
          const size = repo.size || 0
          const fileCount = repo.files?.length || 0

          stats.totalSize += size
          stats.totalFiles += fileCount

          // Language distribution
          Object.entries(repo.languages || {}).forEach(([lang, bytes]) => {
            stats.languageDistribution[lang] = (stats.languageDistribution[lang] || 0) + bytes
          })

          // Size distribution
          if (size < 1000) stats.sizeDistribution.small++
          else if (size < 10000) stats.sizeDistribution.medium++
          else stats.sizeDistribution.large++
        })

        return stats
      }

      const repositories = [
        { size: 500, languages: { JavaScript: 500 }, files: ['index.js'] },
        { size: 2000, languages: { JavaScript: 1500, CSS: 500 }, files: ['app.js', 'style.css'] },
        { size: 15000, languages: { Python: 15000 }, files: Array.from({ length: 10 }, (_, i) => `file${i}.py`) }
      ]

      const stats = aggregateRepositoryStats(repositories)
      
      expect(stats.totalRepositories).toBe(3)
      expect(stats.totalSize).toBe(17500)
      expect(stats.totalFiles).toBe(13)
      expect(stats.languageDistribution.JavaScript).toBe(2000)
      expect(stats.languageDistribution.CSS).toBe(500)
      expect(stats.languageDistribution.Python).toBe(15000)
      expect(stats.sizeDistribution.small).toBe(1)
      expect(stats.sizeDistribution.medium).toBe(1)
      expect(stats.sizeDistribution.large).toBe(1)
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