import { searchTeams, createTeam, joinTeam, checkMembership, deleteTeam } from '../services/teams';

describe('teams service', () => {
  const originalFetch = global.fetch;
  beforeEach(() => { global.fetch = jest.fn(); });
  afterEach(() => { global.fetch = originalFetch; jest.resetAllMocks(); });

  test('searchTeams returns results', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ results: [{ id: 't1' }] }) });
    const res = await searchTeams('x');
    expect(res).toHaveLength(1);
  });

  test('createTeam success', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ id: 't2' }) });
    const out = await createTeam('n', 'p', 'r');
    expect(out.id).toBe('t2');
  });

  test('joinTeam success', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    const out = await joinTeam('n', 'p');
    expect(out.ok).toBe(true);
  });

  test('checkMembership true', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ isMember: true }) });
    const out = await checkMembership('id');
    expect(out).toBe(true);
  });

  test('deleteTeam success', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ deleted: 1 }) });
    const out = await deleteTeam('name', 'id');
    expect(out.deleted).toBe(1);
  });
});


