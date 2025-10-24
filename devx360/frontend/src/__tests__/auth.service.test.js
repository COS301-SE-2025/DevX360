import { loginUser, registerUser, getProfile } from '../services/auth';

describe('auth service', () => {
  const originalFetch = global.fetch;
  beforeEach(() => { global.fetch = jest.fn(); });
  afterEach(() => { global.fetch = originalFetch; jest.resetAllMocks(); });

  test('loginUser success', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ token: 't' }) });
    const out = await loginUser('a@b.com', 'p');
    expect(out.token).toBe('t');
    expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/login$/), expect.any(Object));
  });

  test('loginUser error', async () => {
    global.fetch.mockResolvedValue({ ok: false, json: async () => ({ message: 'bad' }) });
    await expect(loginUser('a', 'b')).rejects.toThrow('bad');
  });

  test('registerUser success', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ user: { id: 1 } }) });
    const out = await registerUser('n', 'r', 'e', 'p');
    expect(out.user.id).toBe(1);
  });

  test('registerUser error', async () => {
    global.fetch.mockResolvedValue({ ok: false, json: async () => ({ message: 'fail' }) });
    await expect(registerUser('n', 'r', 'e', 'p')).rejects.toThrow('fail');
  });

  test('getProfile success', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ user: { id: 'u1' } }) });
    const user = await getProfile();
    expect(user.id).toBe('u1');
  });

  test('getProfile error', async () => {
    global.fetch.mockResolvedValue({ ok: false, json: async () => ({ message: 'x' }) });
    await expect(getProfile()).rejects.toThrow('x');
  });
});


