import { setupServer } from 'msw/node';
import { rest } from 'msw';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5500';

export const handlers = [
  rest.post(`${API}/api/login`, (req, res, ctx) => {
    return res(ctx.json({ user: { name: 'Alice', email: 'alice@example.com' } }));
  }),
  rest.post(`${API}/api/register`, (req, res, ctx) => {
    return res(ctx.json({ user: { name: 'Bob', email: 'bob@example.com' } }));
  }),
  rest.get(`${API}/api/profile`, (req, res, ctx) => {
    return res(ctx.json({ user: { name: 'Alice' } }));
  }),
  rest.get(`${API}/api/teams/search`, (req, res, ctx) => {
    return res(ctx.json({ results: [{ name: 'Alpha', members: [] }] }));
  }),
  rest.post(`${API}/api/teams`, (req, res, ctx) => {
    return res(ctx.json({ message: 'Team created successfully', team: { id: 't1', name: 'Alpha' }, repositoryInfo: { url: 'https://github.com/x/y' } }));
  }),
  rest.post(`${API}/api/teams/join`, (req, res, ctx) => {
    return res(ctx.json({ message: 'Joined team', teamId: 't1' }));
  }),
  rest.delete(`${API}/api/teams/:name`, (req, res, ctx) => {
    return res(ctx.json({ message: 'Deleted' }));
  }),
];

export const server = setupServer(...handlers);
