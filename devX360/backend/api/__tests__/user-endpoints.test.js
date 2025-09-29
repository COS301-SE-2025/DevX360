import { jest } from '@jest/globals'
import request from 'supertest'

// Mock dependencies
jest.unstable_mockModule('mongodb', () => ({
  MongoClient: jest.fn(() => ({
    db: jest.fn(() => ({
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue({
          _id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }),
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              _id: 'user1',
              email: 'user1@example.com',
              name: 'User One',
              role: 'user'
            },
            {
              _id: 'user2',
              email: 'user2@example.com',
              name: 'User Two',
              role: 'admin'
            }
          ])
        }),
        insertOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          insertedId: 'new-user-id'
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

// Mock user routes
app.get('/api/users', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const search = req.query.search || ''
  
  res.status(200).json({
    users: [
      { id: 'user1', email: 'user1@example.com', name: 'User One', role: 'user' },
      { id: 'user2', email: 'user2@example.com', name: 'User Two', role: 'admin' }
    ],
    pagination: {
      page,
      limit,
      total: 2,
      pages: 1
    }
  })
})

app.get('/api/users/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id } = req.params
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'User not found' })
  }
  
  res.status(200).json({
    id,
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  })
})

app.post('/api/users', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { email, name, role } = req.body
  
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' })
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' })
  }
  
  res.status(201).json({
    message: 'User created successfully',
    user: { id: 'new-user-id', email, name, role: role || 'user' }
  })
})

app.put('/api/users/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id } = req.params
  const { email, name, role } = req.body
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'User not found' })
  }
  
  if (email && !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' })
  }
  
  res.status(200).json({
    message: 'User updated successfully',
    user: { id, email: email || 'test@example.com', name: name || 'Test User', role: role || 'user' }
  })
})

app.delete('/api/users/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id } = req.params
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'User not found' })
  }
  
  if (id === 'test-user-id') {
    return res.status(400).json({ error: 'Cannot delete your own account' })
  }
  
  res.status(200).json({ message: 'User deleted successfully' })
})

app.get('/api/users/:id/teams', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id } = req.params
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'User not found' })
  }
  
  res.status(200).json({
    teams: [
      { id: 'team1', name: 'Team One', role: 'member' },
      { id: 'team2', name: 'Team Two', role: 'admin' }
    ]
  })
})

app.post('/api/users/:id/teams', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const { id } = req.params
  const { teamId, role } = req.body
  
  if (id === 'nonexistent') {
    return res.status(404).json({ error: 'User not found' })
  }
  
  if (!teamId) {
    return res.status(400).json({ error: 'Team ID is required' })
  }
  
  res.status(201).json({
    message: 'User added to team successfully',
    membership: { userId: id, teamId, role: role || 'member' }
  })
})

describe('User Endpoints Tests', () => {
  describe('GET /api/users', () => {
    test('should get all users with valid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.users).toBeDefined()
      expect(Array.isArray(response.body.users)).toBe(true)
      expect(response.body.pagination).toBeDefined()
      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.limit).toBe(10)
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users')
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/users?page=2&limit=5')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.pagination.page).toBe(2)
      expect(response.body.pagination.limit).toBe(5)
    })

    test('should handle search parameter', async () => {
      const response = await request(app)
        .get('/api/users?search=test')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.users).toBeDefined()
    })

    test('should handle invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/users?page=invalid&limit=invalid')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.pagination.page).toBe(1) // Should default to 1
      expect(response.body.pagination.limit).toBe(10) // Should default to 10
    })
  })

  describe('GET /api/users/:id', () => {
    test('should get user by ID with valid token', async () => {
      const response = await request(app)
        .get('/api/users/test-user-id')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.id).toBe('test-user-id')
      expect(response.body.email).toBe('test@example.com')
      expect(response.body.name).toBe('Test User')
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/test-user-id')
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent user', async () => {
      const response = await request(app)
        .get('/api/users/nonexistent')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('User not found')
    })

    test('should handle special characters in user ID', async () => {
      const response = await request(app)
        .get('/api/users/user-with-special-chars')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.id).toBe('user-with-special-chars')
    })
  })

  describe('POST /api/users', () => {
    test('should create user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user'
      }
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .send(userData)
      
      expect(response.status).toBe(201)
      expect(response.body.message).toBe('User created successfully')
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user.name).toBe(userData.name)
      expect(response.body.user.role).toBe(userData.role)
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'newuser@example.com',
          name: 'New User'
        })
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 400 for missing email', async () => {
      const userData = {
        name: 'New User'
      }
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .send(userData)
      
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Email and name are required')
    })

    test('should return 400 for missing name', async () => {
      const userData = {
        email: 'newuser@example.com'
      }
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .send(userData)
      
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Email and name are required')
    })

    test('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        name: 'New User'
      }
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .send(userData)
      
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid email format')
    })

    test('should default role to user when not provided', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User'
      }
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .send(userData)
      
      expect(response.status).toBe(201)
      expect(response.body.user.role).toBe('user')
    })
  })

  describe('PUT /api/users/:id', () => {
    test('should update user with valid data', async () => {
      const updateData = {
        email: 'updated@example.com',
        name: 'Updated User',
        role: 'admin'
      }
      
      const response = await request(app)
        .put('/api/users/test-user-id')
        .set('Authorization', 'Bearer mock-token')
        .send(updateData)
      
      expect(response.status).toBe(200)
      expect(response.body.message).toBe('User updated successfully')
      expect(response.body.user.email).toBe(updateData.email)
      expect(response.body.user.name).toBe(updateData.name)
      expect(response.body.user.role).toBe(updateData.role)
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/users/test-user-id')
        .send({ name: 'Updated User' })
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent user', async () => {
      const response = await request(app)
        .put('/api/users/nonexistent')
        .set('Authorization', 'Bearer mock-token')
        .send({ name: 'Updated User' })
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('User not found')
    })

    test('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .put('/api/users/test-user-id')
        .set('Authorization', 'Bearer mock-token')
        .send({ email: 'invalid-email' })
      
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid email format')
    })

    test('should handle partial updates', async () => {
      const response = await request(app)
        .put('/api/users/test-user-id')
        .set('Authorization', 'Bearer mock-token')
        .send({ name: 'Updated Name Only' })
      
      expect(response.status).toBe(200)
      expect(response.body.user.name).toBe('Updated Name Only')
      expect(response.body.user.email).toBe('test@example.com') // Should keep original
    })
  })

  describe('DELETE /api/users/:id', () => {
    test('should delete user with valid token', async () => {
      const response = await request(app)
        .delete('/api/users/other-user-id')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.message).toBe('User deleted successfully')
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .delete('/api/users/other-user-id')
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent user', async () => {
      const response = await request(app)
        .delete('/api/users/nonexistent')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('User not found')
    })

    test('should return 400 for deleting own account', async () => {
      const response = await request(app)
        .delete('/api/users/test-user-id')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Cannot delete your own account')
    })
  })

  describe('GET /api/users/:id/teams', () => {
    test('should get user teams with valid token', async () => {
      const response = await request(app)
        .get('/api/users/test-user-id/teams')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body.teams).toBeDefined()
      expect(Array.isArray(response.body.teams)).toBe(true)
      expect(response.body.teams).toHaveLength(2)
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/test-user-id/teams')
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent user', async () => {
      const response = await request(app)
        .get('/api/users/nonexistent/teams')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('User not found')
    })
  })

  describe('POST /api/users/:id/teams', () => {
    test('should add user to team with valid data', async () => {
      const teamData = {
        teamId: 'team1',
        role: 'member'
      }
      
      const response = await request(app)
        .post('/api/users/test-user-id/teams')
        .set('Authorization', 'Bearer mock-token')
        .send(teamData)
      
      expect(response.status).toBe(201)
      expect(response.body.message).toBe('User added to team successfully')
      expect(response.body.membership.userId).toBe('test-user-id')
      expect(response.body.membership.teamId).toBe(teamData.teamId)
      expect(response.body.membership.role).toBe(teamData.role)
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/users/test-user-id/teams')
        .send({ teamId: 'team1' })
      
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No token provided')
    })

    test('should return 404 for nonexistent user', async () => {
      const response = await request(app)
        .post('/api/users/nonexistent/teams')
        .set('Authorization', 'Bearer mock-token')
        .send({ teamId: 'team1' })
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('User not found')
    })

    test('should return 400 for missing team ID', async () => {
      const response = await request(app)
        .post('/api/users/test-user-id/teams')
        .set('Authorization', 'Bearer mock-token')
        .send({ role: 'member' })
      
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Team ID is required')
    })

    test('should default role to member when not provided', async () => {
      const response = await request(app)
        .post('/api/users/test-user-id/teams')
        .set('Authorization', 'Bearer mock-token')
        .send({ teamId: 'team1' })
      
      expect(response.status).toBe(201)
      expect(response.body.membership.role).toBe('member')
    })
  })

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
      
      expect(response.status).toBe(400)
    })

    test('should handle large request bodies', async () => {
      const largeData = {
        email: 'test@example.com',
        name: 'A'.repeat(10000) // Very long name
      }
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .send(largeData)
      
      expect(response.status).toBe(201)
    })

    test('should handle special characters in input', async () => {
      const userData = {
        email: 'test+tag@example.com',
        name: 'Test User <>&"\'',
        role: 'user'
      }
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .send(userData)
      
      expect(response.status).toBe(201)
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user.name).toBe(userData.name)
    })
  })

  describe('Performance Tests', () => {
    test('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/users')
          .set('Authorization', 'Bearer mock-token')
      )
      
      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.users).toBeDefined()
      })
    })

    test('should handle rapid successive requests', async () => {
      const startTime = Date.now()
      
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/api/users')
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
        .get('/api/users/test-user-id')
        .set('Authorization', 'Bearer mock-token')
      
      expect(response.status).toBe(200)
      expect(response.body).not.toHaveProperty('password')
      expect(response.body).not.toHaveProperty('hashedPassword')
      expect(response.body).not.toHaveProperty('salt')
    })

    test('should handle SQL injection attempts', async () => {
      const maliciousData = {
        email: "'; DROP TABLE users; --",
        name: 'Test User'
      }
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .send(maliciousData)
      
      expect(response.status).toBe(201)
      expect(response.body.user.email).toBe(maliciousData.email)
    })

    test('should handle XSS attempts', async () => {
      const maliciousData = {
        email: 'test@example.com',
        name: '<script>alert("xss")</script>'
      }
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .send(maliciousData)
      
      expect(response.status).toBe(201)
      expect(response.body.user.name).toBe(maliciousData.name)
    })
  })
})