const TOKEN_KEY = 'apex-er-token';

const request = async (method, url, body) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
};

export const api = {
  hasSession: () => !!localStorage.getItem(TOKEN_KEY),
  logout: () => localStorage.removeItem(TOKEN_KEY),
  async login(name, pin, role) {
    const data = await request('POST', '/api/login', { name, pin, role });
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },
  me: () => request('GET', '/api/me'),
  save: (progress) => request('PUT', '/api/progress', progress),
  clear: () => request('DELETE', '/api/progress'),
};