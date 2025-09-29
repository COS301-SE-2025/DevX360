import { updateAvatar, updateProfile, getMyTeams } from '../services/profile';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

describe('profile service', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  test('updateAvatar success', async () => {
    const resp = { ok: true, json: async () => ({ message: 'Avatar uploaded' }) };
    global.fetch.mockResolvedValue(resp);
    const file = new Blob(['x'], { type: 'image/png' });
    const out = await updateAvatar(file, {});
    expect(out.message).toBe('Avatar uploaded');
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/avatar`, expect.any(Object));
  });

  test('updateAvatar error path', async () => {
    const resp = { ok: false, json: async () => ({ message: 'bad' }) };
    global.fetch.mockResolvedValue(resp);
    await expect(updateAvatar(new Blob(['x']), {})).rejects.toThrow('bad');
  });

  test('updateProfile success', async () => {
    const resp = { ok: true, json: async () => ({ user: { name: 'n' } }) };
    global.fetch.mockResolvedValue(resp);
    const out = await updateProfile({ name: 'n' });
    expect(out.user.name).toBe('n');
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/profile`, expect.any(Object));
  });

  test('updateProfile error path', async () => {
    const resp = { ok: false, json: async () => ({ message: 'fail' }) };
    global.fetch.mockResolvedValue(resp);
    await expect(updateProfile({})).rejects.toThrow('fail');
  });

  test('getMyTeams success structure', async () => {
    const resp = { ok: true, json: async () => ({ user: { teams: [{ id: 1 }] } }) };
    global.fetch.mockResolvedValue(resp);
    const teams = await getMyTeams();
    expect(teams).toEqual([{ id: 1 }]);
  });

  test('getMyTeams returns [] on bad shape', async () => {
    const resp = { ok: true, json: async () => ({ nope: true }) };
    global.fetch.mockResolvedValue(resp);
    const teams = await getMyTeams();
    expect(teams).toEqual([]);
  });

  test('getMyTeams returns [] on fetch error', async () => {
    const resp = { ok: false, json: async () => ({ message: 'x' }) };
    global.fetch.mockResolvedValue(resp);
    const teams = await getMyTeams();
    expect(teams).toEqual([]);
  });
});


