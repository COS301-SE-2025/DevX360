// src/components/Dashboard/DashboardLayout.test.js
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

jest.mock('./Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);

test('renders sidebar and nested content', () => {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<div data-testid="outlet">Home</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  expect(screen.getByTestId('outlet')).toBeInTheDocument();
});
