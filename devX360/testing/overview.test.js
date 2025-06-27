// src/components/Dashboard/Overview.test.js
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Overview from './Overview';

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { name: 'Alice', role: 'Dev', avatar: '/a.png' } })
}));

beforeEach(() => {
  process.env.REACT_APP_API_URL = 'http://localhost:5500';
});

test('renders user info and static cards', () => {
  render(<Overview />);
  expect(screen.getByText('Alice')).toBeInTheDocument();
  expect(screen.getByText('Dev')).toBeInTheDocument();
  expect(screen.getByText('Welcome to DevX360')).toBeInTheDocument();
  expect(screen.getByText('Deployment Frequency')).toBeInTheDocument();
});
