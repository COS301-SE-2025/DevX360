import React from 'react';
import { render, screen } from '@testing-library/react';
import Overview from '../components/Dashboard/Overview';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

test('Overview renders header and stat cards', () => {
  render(
    <ThemeProvider>
      <AuthProvider>
        <Overview />
      </AuthProvider>
    </ThemeProvider>
  );
  expect(screen.getByText('DevX360')).toBeInTheDocument();
  expect(screen.getByText('Overview')).toBeInTheDocument();
  expect(screen.getByText(/Deployment Frequency/)).toBeInTheDocument();
  expect(screen.getByText(/Lead Time/)).toBeInTheDocument();
  expect(screen.getByText(/Change Fail Rate/)).toBeInTheDocument();
  expect(screen.getByText(/MTTR/)).toBeInTheDocument();
});


