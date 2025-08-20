import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

export function renderWithProviders(ui, { route = '/', authValue = null, ...options } = {}) {
  window.history.pushState({}, 'Test page', route);

  const Wrapper = ({ children }) => (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}
