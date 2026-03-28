import axios from 'axios';

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,        // send refresh-token cookie
  timeout:         12000,
});

// ── Request — attach access token ─────────────────────────────
api.interceptors.request.use((config) => {
  try {
    // Zustand persist stores: { state: { accessToken, user, ... }, version: N }
    const raw = localStorage.getItem('vault-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // localStorage unavailable or corrupt — continue without token
  }
  return config;
});

// ── Response — silent token refresh on 401 ────────────────────
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Never retry the refresh endpoint itself — that causes an infinite loop
    const isRefreshCall = original?.url?.includes('/auth/refresh');

    if (err.response?.status === 401 && !original._retry && !isRefreshCall) {
      original._retry = true;
      if (!refreshing) {
        refreshing = api.post('/auth/refresh').finally(() => (refreshing = null));
      }
      try {
        const { data } = await refreshing;
        try {
          const raw = localStorage.getItem('vault-auth');
          const stored = raw ? JSON.parse(raw) : { state: {}, version: 0 };
          stored.state = { ...stored.state, accessToken: data.accessToken };
          localStorage.setItem('vault-auth', JSON.stringify(stored));
        } catch { /* storage unavailable */ }
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('vault-auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;