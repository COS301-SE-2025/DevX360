import { createTeam, joinTeam, searchTeams } from '../services/teams';
import { getUsers, getTeams, deleteUser } from '../services/admin';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5500';

describe('service layer', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn(async (url, opts) => {
      if (url === `${API}/api/teams`) return { ok: true, json: async () => ({ message: 'ok', team: { id:'t1' }, repositoryInfo: { url: 'u' } }) };
      if (url === `${API}/api/teams/join`) return { ok: true, json: async () => ({ message: 'ok', teamId:'t1' }) };
      const asString = typeof url === 'string' ? url : (url && url.href ? url.href : '');
      if (asString.startsWith(`${API}/api/teams/search`)) return { ok: true, json: async () => ({ results: [] }) };
      if (url === `${API}/api/users`) return { ok: true, json: async () => ({ users: [] }) };
      if (url === `${API}/api/teams`) return { ok: true, json: async () => ({ teams: [] }) };
      if (typeof url === 'string' && url.startsWith(`${API}/api/users/`)) return { ok: true, json: async () => ({ message: 'Deleted' }) };
      return { ok: true, json: async () => ({}) };
    });
  });
  afterEach(() => { global.fetch = originalFetch; });

  test('createTeam', async () => {
    const res = await createTeam('A','p','https://github.com/x/y');
    expect(res.team.id).toBe('t1');
  });
  test('joinTeam', async () => {
    const res = await joinTeam('A','p');
    expect(res.teamId).toBe('t1');
  });
  test('searchTeams', async () => {
    const res = await searchTeams('A');
    expect(Array.isArray(res)).toBe(true);
  });
  test('getUsers/getTeams/deleteUser', async () => {
    await getUsers();
    await getTeams();
    await deleteUser('u1');
  });
});
