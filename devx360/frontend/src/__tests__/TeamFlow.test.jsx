import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import CreateTeam from '../components/Dashboard/modal/CreateTeam';
import JoinTeam from '../components/Dashboard/modal/JoinTeam';

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn((url, opts) => {
    if (url.endsWith('/api/teams/search')) {
      return Promise.resolve({ ok: true, json: async () => ({ results: [{ name: 'Alpha' }] }) });
    }
    if (url.endsWith('/api/teams')) {
      return Promise.resolve({ ok: true, json: async () => ({ message: 'Team created successfully', team: { id: 't1', name: 'Alpha' }, repositoryInfo: { url: 'https://github.com/x/y' } }) });
    }
    if (url.endsWith('/api/teams/join')) {
      return Promise.resolve({ ok: true, json: async () => ({ message: 'Joined team', teamId: 't1' }) });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
});

afterEach(() => {
  global.fetch = originalFetch;
});

it('creates a team', async () => {
  renderWithProviders(<CreateTeam onCloseCreate={() => {}} onTeamCreated={() => {}} />);
  // Use placeholders per component markup
  await userEvent.type(screen.getByPlaceholderText(/enter team name/i), 'Alpha');
  await userEvent.type(screen.getByPlaceholderText(/https:\/\/github\.com\//i), 'https://github.com/x/y');
  await userEvent.type(screen.getByPlaceholderText(/create a secure password/i), 'pw');
  await userEvent.click(screen.getByRole('button', { name: /create team/i }));
});

it('joins a team', async () => {
  renderWithProviders(<JoinTeam onClose={() => {}} />);
  await userEvent.type(screen.getByPlaceholderText(/enter team name/i), 'Alpha');
  // The join modal triggers search first; then join button (if present)
  const joinBtn = screen.queryByRole('button', { name: /join team/i });
  if (joinBtn) await userEvent.click(joinBtn);
});
