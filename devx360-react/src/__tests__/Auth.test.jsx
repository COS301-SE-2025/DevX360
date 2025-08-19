import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';

// Use msw-like manual mocks of fetch
const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn((url, opts) => {
    if (url.endsWith('/api/login')) {
      return Promise.resolve({ ok: true, json: async () => ({ user: { name: 'Alice' } }) });
    }
    if (url.endsWith('/api/register')) {
      return Promise.resolve({ ok: true, json: async () => ({ user: { name: 'Bob' } }) });
    }
    if (url.endsWith('/api/profile')) {
      return Promise.resolve({ ok: true, json: async () => ({ user: { name: 'Alice' } }) });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
});

afterEach(() => {
  global.fetch = originalFetch;
});

it('logs in via form', async () => {
  renderWithProviders(<Login />);
  const email = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
  const password = screen.getByLabelText(/password/i) || screen.getByPlaceholderText(/password/i);
  await userEvent.type(email, 'a@b.com');
  await userEvent.type(password, 'secret');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
});

it('registers with optional invite code flow', async () => {
  renderWithProviders(<Register />);
  const name = screen.getByLabelText(/full name/i) || screen.getByPlaceholderText(/full name/i);
  const email = screen.getByLabelText(/^email/i) || screen.getByPlaceholderText(/email/i);
  const password = screen.getByLabelText(/^password$/i) || screen.getByPlaceholderText(/password/i);
  const confirm = screen.getByLabelText(/confirm password/i) || screen.getByPlaceholderText(/confirm/i);
  await userEvent.type(name, 'Bob');
  await userEvent.type(email, 'b@b.com');
  await userEvent.type(password, 'secret');
  if (confirm) await userEvent.type(confirm, 'secret');
  const toggle = screen.queryByRole('button', { name: /invite code/i });
  if (toggle) await userEvent.click(toggle);
  const invite = screen.queryByLabelText(/invite code/i) || screen.queryByPlaceholderText(/invite code/i);
  if (invite) await userEvent.type(invite, 'INV123');
  const submit = screen.getByRole('button', { name: /create/i });
  await userEvent.click(submit);
});
