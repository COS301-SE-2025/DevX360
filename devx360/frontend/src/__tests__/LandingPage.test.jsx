import React from 'react';
import { screen } from '@testing-library/react';
import LandingPage from '../components/LandingPage';
import { renderWithProviders } from '../test-utils';

it('renders landing page hero content', () => {
  renderWithProviders(<LandingPage />);
  const all = screen.getAllByText(/DevX360/i);
  expect(all.length).toBeGreaterThan(0);
});
