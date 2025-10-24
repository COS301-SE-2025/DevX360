import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';

jest.mock('../components/Dashboard/Sidebar', () => () => <div>MockSidebar</div>);
jest.mock('react-router-dom', () => ({
  Outlet: () => <div>MockOutlet</div>,
}));

test('DashboardLayout renders Sidebar and Outlet', () => {
  render(<DashboardLayout />);
  expect(screen.getByText('MockSidebar')).toBeInTheDocument();
  expect(screen.getByText('MockOutlet')).toBeInTheDocument();
});


