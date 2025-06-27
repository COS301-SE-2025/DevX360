import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Overview from './Overview';

// Mock AuthContext globally for all tests in this file
jest.mock('../../context/AuthContext', () => {
  const actual = jest.requireActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: jest.fn(),
  };
});

const { useAuth } = require('../../context/AuthContext');

describe('Overview component', () => {
  beforeEach(() => {
    // Default mock for all tests
    useAuth.mockReturnValue({
      currentUser: {
        name: 'Alice',
        role: 'Developer',
        avatar: '/avatars/alice.png',
      },
    });

    // Mock environment variable
    process.env.REACT_APP_API_URL = 'http://localhost:5500';
  });

  test('renders user name and role', () => {
    render(<Overview />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });

  test('renders user avatar with full URL', () => {
    render(<Overview />);
    const avatar = screen.getByAltText('User Avatar');
    expect(avatar).toHaveAttribute('src', 'http://localhost:5500/avatars/alice.png');
  });

  test('renders default avatar if no user avatar is set', () => {
    // Override mock just for this test
    useAuth.mockReturnValueOnce({
      currentUser: {
        name: 'Bob',
        role: 'Manager',
        avatar: '',
      },
    });

    render(<Overview />);
    const avatar = screen.getByAltText('User Avatar');
    expect(avatar).toHaveAttribute('src', '/default-avatar.png');
  });

  test('renders welcome and about sections', () => {
    render(<Overview />);
    expect(screen.getByText('Welcome to DevX360')).toBeInTheDocument();
    expect(screen.getByText('About DevX360')).toBeInTheDocument();
    expect(screen.getByText(/Real-time DORA metrics tracking/i)).toBeInTheDocument();
  });

  test('renders all stat cards with placeholders', () => {
    render(<Overview />);
    expect(screen.getByText('Deployment Frequency')).toBeInTheDocument();
    expect(screen.getByText('Lead Time')).toBeInTheDocument();
    expect(screen.getByText('Change Fail Rate')).toBeInTheDocument();
    expect(screen.getByText('MTTR')).toBeInTheDocument();
  });
});
