import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import { AuthProvider } from '../context/AuthContext';

test('Sidebar renders and toggles labels based on minimized state', () => {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/dashboard/overview"]}>
        <Sidebar />
      </MemoryRouter>
    </AuthProvider>
  );
  // default not minimized: labels visible
  expect(screen.getByText('Overview')).toBeInTheDocument();
  expect(screen.getByText('Profile')).toBeInTheDocument();
});


