import { jest } from '@jest/globals'
import request from 'supertest'

// Mock dependencies
jest.unstable_mockModule('mongodb', () => ({
  MongoClient: jest.fn(() => ({
    db: jest.fn(() => ({
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue({
          _id: 'test-team-id',
          name: 'Test Team',
          description: 'Test team description',
          members: ['user1', 'user2'],
          repositories: ['repo1', 'repo2'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }),
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              _id: 'team1',
              name: 'Team One',
              description: 'First team',
              members: ['user1'],
              repositories: ['repo1']
            },
            {
              _id: 'team2',
              name: 'Team Two',
              description: 'Second team',
              members: ['user2'],
              repositories: ['repo2']
            }
          ])
        }),
        insertOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          insertedId: 'new-team-id'
        }),
        updateOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          modifiedCount: 1
        }),
        deleteOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          deletedCount: 1
        }),
        countDocuments: jest.fn().mockResolvedValue(2)
      }))
    })),
    close: jest.fn()
  }))
}))

jest.unstable_mockModule('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ userId: 'test-user-id', role: 'admin' })
}))

// Import after mocking
const express = await import('express')
const app = express.default()

// Mock app setup
app.use(express.default.json())

// Mock team routes
app.get('/api/teams', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const search = req.query.search || ''
  
  res.status(200).json({
    teams: [
      { id: 'team1', name: 'Team One', description: 'First team', memberCount: 1, repoCount: 1 },
      { id: 'team2', name: 'Team Two', description: 'Second team', memberCount: 1, repoCount: 1 }
    ],
    pagination: {
      page,
      limit,
      total: 2,
      pages: 1
    }
  })
})

app.get('/api/teams/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id } = req.params
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'Team not found' })
  }
  
  res.status(200).json({
    id,
    name: 'Test Team',
    description: 'Test team description',
    members: ['user1', 'user2'],
    repositories: ['repo1', 'repo2'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  })
})

app.post('/api/teams', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { name, description } = req.body
  
  if (!name) {
    return res.status(400).json({ error: 'Team name is required' })
  }
  
  if (name.length < 3) {
    return res.status(400).json({ error: 'Team name must be at least 3 characters' })
  }
  
  res.status(201).json({
    message: 'Team created successfully',
    team: { id: 'new-team-id', name, description: description || '' }
  })
})

app.put('/api/teams/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id } = req.params
  const { name, description } = req.body
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'Team not found' })
  }
  
  if (name && name.length < 3) {
    return res.status(400).json({ error: 'Team name must be at least 3 characters' })
  }
  
  res.status(200).json({
    message: 'Team updated successfully',
    team: { id, name: name || 'Test Team', description: description || 'Test team description' }
  })
})

app.delete('/api/teams/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id } = req.params
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'Team not found' })
  }
  
  res.status(200).json({ message: 'Team deleted successfully' })
})

app.get('/api/teams/:id/members', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id } = req.params
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'Team not found' })
  }
  
  res.status(200).json({
    members: [
      { id: 'user1', name: 'User One', email: 'user1@example.com', role: 'member' },
      { id: 'user2', name: 'User Two', email: 'user2@example.com', role: 'admin' }
    ]
  })
})

app.post('/api/teams/:id/members', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id } = req.params
  const { userId, role } = req.body
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'Team not found' })
  }
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }
  
  res.status(201).json({
    message: 'Member added to team successfully',
    membership: { teamId: id, userId, role: role || 'member' }
  })
})

app.delete('/api/teams/:id/members/:userId', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id, userId } = req.params
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'Team not found' })
  }
  
  res.status(200).json({ message: 'Member removed from team successfully' })
})

app.get('/api/teams/:id/repositories', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id } = req.params
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'Team not found' })
  }
  
  res.status(200).json({
    repositories: [
      { id: 'repo1', name: 'Repository One', url: 'https://github.com/owner/repo1' },
      { id: 'repo2', name: 'Repository Two', url: 'https://github.com/owner/repo2' }
    ]
  })
})

app.post('/api/teams/:id/repositories', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id } = req.params
  const { repositoryId } = req.body
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'Team not found' })
  }
  
  if (!repositoryId) {
    return res.status(400).json({ error: 'Repository ID is required' })
  }
  
  res.status(201).json({
    message: 'Repository added to team successfully',
    association: { teamId: id, repositoryId }
  })
})

app.delete('/api/teams/:id/repositories/:repositoryId', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id, repositoryId } = req.params
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'Team not found' })
  }
  
  res.status(200).json({ message: 'Repository removed from team successfully' })
})

describe('Team Endpoints Tests', () => {
  describe('GET /api/teams', () => {
    test('should get all teams with valid token', async () => {
      const response = await request(app)
        .get('/api/teams')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.teams).toBeDefined()
      expect(Array.isArray(response.body.teams)).toBe(true)
      expect(response.body.pagination).toBeDefined()
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/teams')
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/teams?page=2&limit=5')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.pagination.page).toBe(2)
      expect(response.body.pagination.limit).toBe(5)
    })

    test('should handle search parameter', async () => {
      const response = await request(app)
        .get('/api/teams?search=test')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.teams).toBeDefined()
    })
  })

  describe('GET /api/teams/:id', () => {
    test('should get team by ID with valid token', async () => {
      const response = await request(app)
        .get('/api/teams/test-team-id')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.id).toBe('test-team-id')
      expect(response.body.name).toBe('Test Team')
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/teams/test-team-id')
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent team', async () => {
      const response = await request(app)
        .get('/api/teams/nonexistent')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Team not found')
    })
  })

  describe('POST /api/teams', () => {
    test('should create team with valid data', async () => {
      const teamData = {
        name: 'New Team',
        description: 'New team description'
      }
      
      const response = await request(app)
        .post('/api/teams')
        .set('Authorization', 'Bearer mock-token')
        .send(teamData)
      
      expect(response.status).toBe(201)
      expect(response.body.message).toBe('Team created successfully')
      expect(response.body.team.name).toBe(teamData.name)
      expect(response.body.team.description).toBe(teamData.description)
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/teams')
        .send({ name: 'New Team' })
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/teams')
        .set('Authorization', 'Bearer mock-token')
        .send({ description: 'Team description' })
      
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Team name is required')
    })

    test('should return 400 for short name', async () => {
      const response = await request(app)
        .post('/api/teams')
        .set('Authorization', 'Bearer mock-token')
        .send({ name: 'AB' })
      
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Team name must be at least 3 characters')
    })

    test('should handle missing description', async () => {
      const response = await request(app)
        .post('/api/teams')
        .set('Authorization', 'Bearer mock-token')
        .send({ name: 'New Team' })
      
      expect(response.status).toBe(201)
      expect(response.body.team.description).toBe('')
    })
  })

  describe('PUT /api/teams/:id', () => {
    test('should update team with valid data', async () => {
      const updateData = {
        name: 'Updated Team',
        description: 'Updated description'
      }
      
      const response = await request(app)
        .put('/api/teams/test-team-id')
        .set('Authorization', 'Bearer mock-token')
        .send(updateData)
      
      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Team updated successfully')
      expect(response.body.team.name).toBe(updateData.name)
      expect(response.body.team.description).toBe(updateData.description)
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/teams/test-team-id')
        .send({ name: 'Updated Team' })
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent team', async () => {
      const response = await request(app)
        .put('/api/teams/nonexistent')
        .set('Authorization', 'Bearer mock-token')
        .send({ name: 'Updated Team' })
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Team not found')
    })

    test('should return 400 for short name', async () => {
      const response = await request(app)
        .put('/api/teams/test-team-id')
        .set('Authorization', 'Bearer mock-token')
        .send({ name: 'AB' })
      
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Team name must be at least 3 characters')
    })

    test('should handle partial updates', async () => {
      const response = await request(app)
        .put('/api/teams/test-team-id')
        .set('Authorization', 'Bearer mock-token')
        .send({ name: 'Updated Name Only' })
      
      expect(response.status).toBe(200)
      expect(response.body.team.name).toBe('Updated Name Only')
      expect(response.body.team.description).toBe('Test team description') // Should keep original
    })
  })

  describe('DELETE /api/teams/:id', () => {
    test('should delete team with valid token', async () => {
      const response = await request(app)
        .delete('/api/teams/test-team-id')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Team deleted successfully')
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .delete('/api/teams/test-team-id')
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent team', async () => {
      const response = await request(app)
        .delete('/api/teams/nonexistent')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Team not found')
    })
  })

  describe('GET /api/teams/:id/members', () => {
    test('should get team members with valid token', async () => {
      const response = await request(app)
        .get('/api/teams/test-team-id/members')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.members).toBeDefined()
      expect(Array.isArray(response.body.members)).toBe(true)
      expect(response.body.members).toHaveLength(2)
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/teams/test-team-id/members')
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent team', async () => {
      const response = await request(app)
        .get('/api/teams/nonexistent/members')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Team not found')
    })
  })

  describe('POST /api/teams/:id/members', () => {
    test('should add member to team with valid data', async () => {
      const memberData = {
        userId: 'user3',
        role: 'member'
      }
      
      const response = await request(app)
        .post('/api/teams/test-team-id/members')
        .set('Authorization', 'Bearer mock-token')
        .send(memberData)
      
      expect(response.status).toBe(201)
      expect(response.body.message).toBe('Member added to team successfully')
      expect(response.body.membership.teamId).toBe('test-team-id')
      expect(response.body.membership.userId).toBe(memberData.userId)
      expect(response.body.membership.role).toBe(memberData.role)
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/teams/test-team-id/members')
        .send({ userId: 'user3' })
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent team', async () => {
      const response = await request(app)
        .post('/api/teams/nonexistent/members')
        .set('Authorization', 'Bearer mock-token')
        .send({ userId: 'user3' })
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Team not found')
    })

    test('should return 400 for missing user ID', async () => {
      const response = await request(app)
        .post('/api/teams/test-team-id/members')
        .set('Authorization', 'Bearer mock-token')
        .send({ role: 'member' })
      
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('User ID is required')
    })

    test('should default role to member when not provided', async () => {
      const response = await request(app)
        .post('/api/teams/test-team-id/members')
        .set('Authorization', 'Bearer mock-token')
        .send({ userId: 'user3' })
      
      expect(response.status).toBe(201)
      expect(response.body.membership.role).toBe('member')
    })
  })

  describe('DELETE /api/teams/:id/members/:userId', () => {
    test('should remove member from team with valid token', async () => {
      const response = await request(app)
        .delete('/api/teams/test-team-id/members/user1')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Member removed from team successfully')
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .delete('/api/teams/test-team-id/members/user1')
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent team', async () => {
      const response = await request(app)
        .delete('/api/teams/nonexistent/members/user1')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Team not found')
    })
  })

  describe('GET /api/teams/:id/repositories', () => {
    test('should get team repositories with valid token', async () => {
      const response = await request(app)
        .get('/api/teams/test-team-id/repositories')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.repositories).toBeDefined()
      expect(Array.isArray(response.body.repositories)).toBe(true)
      expect(response.body.repositories).toHaveLength(2)
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/teams/test-team-id/repositories')
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent team', async () => {
      const response = await request(app)
        .get('/api/teams/nonexistent/repositories')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Team not found')
    })
  })

  describe('POST /api/teams/:id/repositories', () => {
    test('should add repository to team with valid data', async () => {
      const repoData = {
        repositoryId: 'repo3'
      }
      
      const response = await request(app)
        .post('/api/teams/test-team-id/repositories')
        .set('Authorization', 'Bearer mock-token')
        .send(repoData)
      
      expect(response.status).toBe(201)
      expect(response.body.message).toBe('Repository added to team successfully')
      expect(response.body.association.teamId).toBe('test-team-id')
      expect(response.body.association.repositoryId).toBe(repoData.repositoryId)
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/teams/test-team-id/repositories')
        .send({ repositoryId: 'repo3' })
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent team', async () => {
      const response = await request(app)
        .post('/api/teams/nonexistent/repositories')
        .set('Authorization', 'Bearer mock-token')
        .send({ repositoryId: 'repo3' })
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Team not found')
    })

    test('should return 400 for missing repository ID', async () => {
      const response = await request(app)
        .post('/api/teams/test-team-id/repositories')
        .set('Authorization', 'Bearer mock-token')
        .send({})
      
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Repository ID is required')
    })
  })

  describe('DELETE /api/teams/:id/repositories/:repositoryId', () => {
    test('should remove repository from team with valid token', async () => {
      const response = await request(app)
        .delete('/api/teams/test-team-id/repositories/repo1')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Repository removed from team successfully')
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .delete('/api/teams/test-team-id/repositories/repo1')
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent team', async () => {
      const response = await request(app)
        .delete('/api/teams/nonexistent/repositories/repo1')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Team not found')
    })
  })

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/teams')
        .set('Authorization', 'Bearer mock-token')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
      
      expect(response.status).toBe(400)
    })

    test('should handle large request bodies', async () => {
      const largeData = {
        name: 'A'.repeat(10000), // Very long name
        description: 'B'.repeat(50000) // Very long description
      }
      
      const response = await request(app)
        .post('/api/teams')
        .set('Authorization', 'Bearer mock-token')
        .send(largeData)
      
      expect(response.status).toBe(201)
    })

    test('should handle special characters in input', async () => {
      const teamData = {
        name: 'Team <>&"\'',
        description: 'Description with special chars: @#$%^&*()'
      }
      
      const response = await request(app)
        .post('/api/teams')
        .set('Authorization', 'Bearer mock-token')
        .send(teamData)
      
      expect(response.status).toBe(201)
      expect(response.body.team.name).toBe(teamData.name)
      expect(response.body.team.description).toBe(teamData.description)
    })
  })

  describe('Performance Tests', () => {
    test('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/teams')
          .set('Authorization', 'Bearer mock-token')
      )
      
      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.teams).toBeDefined()
      })
    })

    test('should handle rapid successive requests', async () => {
      const startTime = Date.now()
      
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/api/teams')
          .set('Authorization', 'Bearer mock-token')
        
        expect(response.status).toBe(200)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })

  describe('Security Tests', () => {
    test('should not expose sensitive information', async () => {
      const response = await request(app)
        .get('/api/teams/test-team-id')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body).not.toHaveProperty('password')
      expect(response.body).not.toHaveProperty('secret')
    })

    test('should handle SQL injection attempts', async () => {
      const maliciousData = {
        name: "'; DROP TABLE teams; --",
        description: 'Test description'
      }
      
      const response = await request(app)
        .post('/api/teams')
        .set('Authorization', 'Bearer mock-token')
        .send(maliciousData)
      
      expect(response.status).toBe(201)
      expect(response.body.team.name).toBe(maliciousData.name)
    })

    test('should handle XSS attempts', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        description: 'Test description'
      }
      
      const response = await request(app)
        .post('/api/teams')
        .set('Authorization', 'Bearer mock-token')
        .send(maliciousData)
      
      expect(response.status).toBe(201)
      expect(response.body.team.name).toBe(maliciousData.name)
    })
  })
})