import React from 'react';
import { render, screen } from '@testing-library/react';
import StatCard from '../components/common/StatCard';

test('StatCard renders title, value and trend with type', () => {
  render(<StatCard title="Deployments" value="15" trend="+3 this week" trendType="up" />);
  expect(screen.getByText('Deployments')).toBeInTheDocument();
  expect(screen.getByText('15')).toBeInTheDocument();
  const trendEl = screen.getByText('+3 this week');
  expect(trendEl).toBeInTheDocument();
  expect(trendEl.className).toMatch(/up/);
});


