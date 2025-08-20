/* @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Admin from '../components/Dashboard/Admin';

const mockCurrentUser = { _id: 'u1', name: 'Alice', role: 'admin' };
const mockUsers = [
  { _id: 'u1', name: 'Alice' },
  { _id: 'u2', name: 'Bob' },
];
const mockTeams = [
  { id: 't1', name: 'Team Alpha' },
  { id: 't2', name: 'Team Beta' },
];

describe('Admin dashboard', () => {
  test('renders users and teams tabs with data', async () => {
    render(<Admin currentUser={mockCurrentUser} users={mockUsers} teams={mockTeams} />);

    // Check dashboard header
    expect(await screen.findByText(/admin dashboard/i)).toBeInTheDocument();

    // Check manage users and teams section
    expect(await screen.findByText(/manage users and teams/i)).toBeInTheDocument();

    // Verify all users are rendered
    for (const user of mockUsers) {
      expect(await screen.findByText(user.name)).toBeInTheDocument();
    }

    // Verify all teams are rendered
    for (const team of mockTeams) {
      expect(await screen.findByText(team.name)).toBeInTheDocument();
    }
  });
});
