import { render, screen } from '@testing-library/react';
import Admin from '../components/Dashboard/Admin';
import React from 'react';

const mockCurrentUser = { _id: 'u1', name: 'Alice', role: 'admin' };
const mockUsers = [{ _id: 'u1', name: 'Alice' }, { _id: 'u2', name: 'Bob' }];
const mockTeams = [{ id: 't1', name: 'Team Alpha' }];

jest.mock('../contexts/UserContext', () => ({
  useUser: () => ({ currentUser: mockCurrentUser }),
}));

jest.mock('../api/adminApi', () => ({
  fetchUsers: jest.fn().mockResolvedValue(mockUsers),
  fetchTeams: jest.fn().mockResolvedValue(mockTeams),
}));

describe('Admin dashboard', () => {
  test('renders users and teams tabs with data', async () => {
    render(<Admin />);

    // Wait for static texts and buttons to appear
    expect(await screen.findByText(/admin dashboard/i)).toBeInTheDocument();
    expect(await screen.findByText(/manage users and teams/i)).toBeInTheDocument();

    // Check users
    for (const user of mockUsers) {
      expect(await screen.findByText(user.name)).toBeInTheDocument();
    }

    // Check teams
    for (const team of mockTeams) {
      expect(await screen.findByText(team.name)).toBeInTheDocument();
    }
  });
});
