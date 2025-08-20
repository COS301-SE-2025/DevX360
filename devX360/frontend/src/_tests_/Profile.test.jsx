import React from 'react';
import { renderWithProviders } from '../test-utils';
import { screen } from '@testing-library/react';
import Profile from '../components/Dashboard/Profile';

jest.mock('../services/profile', () => ({
  updateProfile: jest.fn(async () => ({ user: { name: 'New Name', email: 'new@example.com' } })),
  updateAvatar: jest.fn(async () => ({ avatarUrl: '/uploads/new.png' })),
}));

describe('Profile', () => {
  it('renders headings and basic fields', () => {
    renderWithProviders(<Profile />);
    const headings = screen.getAllByText(/your profile/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getByText(/manage your profile/i)).toBeInTheDocument();
  });
});
