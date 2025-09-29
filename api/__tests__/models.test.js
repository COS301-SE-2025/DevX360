/**
 * Unit Tests for Database Models
 * Tests: User, Team, RepoMetrics model validation and methods
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import Team from '../models/Team.js';
import RepoMetrics from '../models/RepoMetrics.js';

describe('Database Models', () => {
  beforeEach(() => {
    // Clear all collections before each test
    mongoose.connection.collections.users?.drop();
    mongoose.connection.collections.teams?.drop();
    mongoose.connection.collections.repometrics?.drop();
  });

  describe('User Model', () => {
    test('should create user with required fields', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'developer'
      };

      // Act
      const user = new User(userData);
      const savedUser = await user.save();

      // Assert
      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe('Test User');
      expect(savedUser.email).toBe('test@example.com');
      expect(savedUser.role).toBe('developer');
      expect(savedUser.isEmailVerified).toBe(false); // Default value
    });

    test('should validate required fields', async () => {
      // Arrange
      const userData = {
        // Missing required fields
      };

      // Act & Assert
      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should validate email format', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'hashed_password',
        role: 'developer'
      };

      // Act & Assert
      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should set default values', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'developer'
      };

      // Act
      const user = new User(userData);
      const savedUser = await user.save();

      // Assert
      expect(savedUser.isEmailVerified).toBe(false);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    test('should handle GitHub integration fields', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'developer',
        githubId: '12345',
        githubUsername: 'testuser'
      };

      // Act
      const user = new User(userData);
      const savedUser = await user.save();

      // Assert
      expect(savedUser.githubId).toBe('12345');
      expect(savedUser.githubUsername).toBe('testuser');
    });
  });

  describe('Team Model', () => {
    test('should create team with required fields', async () => {
      // Arrange
      const teamData = {
        name: 'Test Team',
        password: 'hashed_password',
        creator: new mongoose.Types.ObjectId(),
        members: [new mongoose.Types.ObjectId()]
      };

      // Act
      const team = new Team(teamData);
      const savedTeam = await team.save();

      // Assert
      expect(savedTeam._id).toBeDefined();
      expect(savedTeam.name).toBe('Test Team');
      expect(savedTeam.creator).toBeDefined();
      expect(savedTeam.members).toHaveLength(1);
    });

    test('should validate required fields', async () => {
      // Arrange
      const teamData = {
        // Missing required fields
      };

      // Act & Assert
      const team = new Team(teamData);
      await expect(team.save()).rejects.toThrow();
    });

    test('should enforce unique team names', async () => {
      // Arrange
      const teamData1 = {
        name: 'Unique Team',
        password: 'hashed_password',
        creator: new mongoose.Types.ObjectId(),
        members: [new mongoose.Types.ObjectId()]
      };

      const teamData2 = {
        name: 'Unique Team', // Same name
        password: 'hashed_password',
        creator: new mongoose.Types.ObjectId(),
        members: [new mongoose.Types.ObjectId()]
      };

      // Act
      const team1 = new Team(teamData1);
      await team1.save();

      const team2 = new Team(teamData2);
      await expect(team2.save()).rejects.toThrow();
    });

    test('should handle multiple members', async () => {
      // Arrange
      const teamData = {
        name: 'Multi Member Team',
        password: 'hashed_password',
        creator: new mongoose.Types.ObjectId(),
        members: [
          new mongoose.Types.ObjectId(),
          new mongoose.Types.ObjectId(),
          new mongoose.Types.ObjectId()
        ]
      };

      // Act
      const team = new Team(teamData);
      const savedTeam = await team.save();

      // Assert
      expect(savedTeam.members).toHaveLength(3);
    });

    test('should set default timestamps', async () => {
      // Arrange
      const teamData = {
        name: 'Test Team',
        password: 'hashed_password',
        creator: new mongoose.Types.ObjectId(),
        members: [new mongoose.Types.ObjectId()]
      };

      // Act
      const team = new Team(teamData);
      const savedTeam = await team.save();

      // Assert
      expect(savedTeam.createdAt).toBeDefined();
      expect(savedTeam.updatedAt).toBeDefined();
    });
  });

  describe('RepoMetrics Model', () => {
    test('should create repo metrics with required fields', async () => {
      // Arrange
      const metricsData = {
        teamId: new mongoose.Types.ObjectId(),
        metrics: {
          deployment_frequency: { total_deployments: 5 },
          lead_time: { average_days: '2.5' },
          mttr: { average_days: '1.2' },
          change_failure_rate: { failure_rate: '10%' }
        },
        repositoryInfo: {
          name: 'test-repo',
          url: 'https://github.com/owner/repo',
          description: 'Test repository'
        }
      };

      // Act
      const repoMetrics = new RepoMetrics(metricsData);
      const savedMetrics = await repoMetrics.save();

      // Assert
      expect(savedMetrics._id).toBeDefined();
      expect(savedMetrics.teamId).toBeDefined();
      expect(savedMetrics.metrics).toBeDefined();
      expect(savedMetrics.repositoryInfo).toBeDefined();
      expect(savedMetrics.lastUpdated).toBeDefined();
    });

    test('should validate required fields', async () => {
      // Arrange
      const metricsData = {
        // Missing required fields
      };

      // Act & Assert
      const repoMetrics = new RepoMetrics(metricsData);
      await expect(repoMetrics.save()).rejects.toThrow();
    });

    test('should handle member statistics', async () => {
      // Arrange
      const metricsData = {
        teamId: new mongoose.Types.ObjectId(),
        metrics: { deployment_frequency: { total_deployments: 5 } },
        repositoryInfo: { name: 'test-repo', url: 'https://github.com/owner/repo' },
        memberStats: new Map([
          ['user1', { commits: 10, prs: 5 }],
          ['user2', { commits: 8, prs: 3 }]
        ])
      };

      // Act
      const repoMetrics = new RepoMetrics(metricsData);
      const savedMetrics = await repoMetrics.save();

      // Assert
      expect(savedMetrics.memberStats).toBeDefined();
      expect(savedMetrics.memberStats.size).toBe(2);
    });

    test('should handle AI analysis data', async () => {
      // Arrange
      const metricsData = {
        teamId: new mongoose.Types.ObjectId(),
        metrics: { deployment_frequency: { total_deployments: 5 } },
        repositoryInfo: { name: 'test-repo', url: 'https://github.com/owner/repo' },
        aiAnalysis: {
          insights: ['Good deployment frequency', 'Low MTTR'],
          recommendations: ['Consider automated testing'],
          lastAnalyzed: new Date()
        },
        analysisStatus: 'completed'
      };

      // Act
      const repoMetrics = new RepoMetrics(metricsData);
      const savedMetrics = await repoMetrics.save();

      // Assert
      expect(savedMetrics.aiAnalysis).toBeDefined();
      expect(savedMetrics.aiAnalysis.insights).toHaveLength(2);
      expect(savedMetrics.analysisStatus).toBe('completed');
    });

    test('should update lastUpdated timestamp on save', async () => {
      // Arrange
      const metricsData = {
        teamId: new mongoose.Types.ObjectId(),
        metrics: { deployment_frequency: { total_deployments: 5 } },
        repositoryInfo: { name: 'test-repo', url: 'https://github.com/owner/repo' }
      };

      // Act
      const repoMetrics = new RepoMetrics(metricsData);
      const savedMetrics = await repoMetrics.save();

      // Assert
      expect(savedMetrics.lastUpdated).toBeDefined();
      expect(savedMetrics.lastUpdated).toBeInstanceOf(Date);
    });

    test('should handle complex metrics structure', async () => {
      // Arrange
      const complexMetrics = {
        '7d': {
          deployment_frequency: { total_deployments: 2, frequency_per_day: 0.29 },
          lead_time: { average_days: '1.5', min_days: '0.5', max_days: '3.0' },
          mttr: { average_days: '0.8', total_incidents: 5 },
          change_failure_rate: { failure_rate: '20%', total_deployments: 2 }
        },
        '30d': {
          deployment_frequency: { total_deployments: 8, frequency_per_day: 0.27 },
          lead_time: { average_days: '2.1', min_days: '0.3', max_days: '5.0' },
          mttr: { average_days: '1.2', total_incidents: 15 },
          change_failure_rate: { failure_rate: '15%', total_deployments: 8 }
        }
      };

      const metricsData = {
        teamId: new mongoose.Types.ObjectId(),
        metrics: complexMetrics,
        repositoryInfo: { name: 'test-repo', url: 'https://github.com/owner/repo' }
      };

      // Act
      const repoMetrics = new RepoMetrics(metricsData);
      const savedMetrics = await repoMetrics.save();

      // Assert
      expect(savedMetrics.metrics).toBeDefined();
      expect(savedMetrics.metrics['7d']).toBeDefined();
      expect(savedMetrics.metrics['30d']).toBeDefined();
      expect(savedMetrics.metrics['7d'].deployment_frequency.total_deployments).toBe(2);
      expect(savedMetrics.metrics['30d'].deployment_frequency.total_deployments).toBe(8);
    });
  });

  describe('Model Relationships', () => {
    test('should handle user-team relationships', async () => {
      // Arrange
      const userId = new mongoose.Types.ObjectId();
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'developer'
      };

      const teamData = {
        name: 'Test Team',
        password: 'hashed_password',
        creator: userId,
        members: [userId]
      };

      // Act
      const user = new User(userData);
      await user.save();

      const team = new Team(teamData);
      await team.save();

      // Assert
      expect(team.creator.toString()).toBe(userId.toString());
      expect(team.members[0].toString()).toBe(userId.toString());
    });

    test('should handle team-repo metrics relationships', async () => {
      // Arrange
      const teamId = new mongoose.Types.ObjectId();
      const teamData = {
        name: 'Test Team',
        password: 'hashed_password',
        creator: new mongoose.Types.ObjectId(),
        members: [new mongoose.Types.ObjectId()]
      };

      const metricsData = {
        teamId: teamId,
        metrics: { deployment_frequency: { total_deployments: 5 } },
        repositoryInfo: { name: 'test-repo', url: 'https://github.com/owner/repo' }
      };

      // Act
      const team = new Team(teamData);
      await team.save();

      const repoMetrics = new RepoMetrics(metricsData);
      await repoMetrics.save();

      // Assert
      expect(repoMetrics.teamId.toString()).toBe(teamId.toString());
    });
  });
});