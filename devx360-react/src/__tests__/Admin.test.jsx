/* @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Admin from '../components/Dashboard/Admin';

// Mock AuthContext
const mockCurrentUser = { _id: 'u1', name: 'Alice', role: 'admin' };
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: mockCurrentUser }),
}));

// Mock ThemeContext
jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ toggleTheme: jest.fn(), theme: 'light' }),
}));

// Mock service functions used in Admin component
jest.mock('../services/admin', () => ({
  getUsers: jest.fn().mockResolvedValue([{ _id: 'u2', name: 'Bob', role: 'user' }]),
  getTeams: jest.fn().mockResolvedValue([{ id: 't1', name: 'Team Alpha' }]),
}));

describe('Admin dashboard', () => {
  test('renders users and teams tabs with data', async () => {
    render(<Admin />);

    // Wait for headings and tabs to appear
    expect(await screen.findByText(/admin dashboard/i)).toBeInTheDocument();
    expect(await screen.findByText(/users/i)).toBeInTheDocument();
    expect(await screen.findByText(/teams/i)).toBeInTheDocument();

    // Check that mock data is rendered
    expect(await screen.findByText(/Alice/i)).toBeInTheDocument();
    expect(await screen.findByText(/Bob/i)).toBeInTheDocument();
    expect(await screen.findByText(/Team Alpha/i)).toBeInTheDocument();
  });
});
