import React from 'react';
import { renderWithProviders } from '../test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Admin from '../components/Dashboard/Admin';

const originalFetch = global.fetch;

describe('Admin dashboard', () => {
  beforeEach(() => {
    global.fetch = jest.fn(async (url) => {
      if (String(url).endsWith('/api/users')) return { ok: true, json: async () => ({ users: [{ _id:'u1', name:'Alice', email:'a@b.com', role:'admin' }] }) };
      if (String(url).endsWith('/api/teams')) return { ok: true, json: async () => ({ teams: [{ _id:'t1', name:'Alpha', creator:{ name:'Owner', email:'owner@x.com' }, members: [] }] }) };
      return { ok: true, json: async () => ({}) };
    });
  });
  afterEach(() => { global.fetch = originalFetch; });

  it('renders users and teams tabs with data', async () => {
    renderWithProviders(<Admin />);
    // Wait for loader to disappear and data to render
    await screen.findByText(/admin dashboard/i);
    await screen.findByText(/Manage users and teams/i);
    await screen.findByText(/Alice/i);
    // Switch to Teams tab before asserting teams data
    const teamsTab = await screen.findByRole('button', { name: /teams/i });
    await userEvent.click(teamsTab);
    await screen.findByText(/Alpha/i);
  });
});
