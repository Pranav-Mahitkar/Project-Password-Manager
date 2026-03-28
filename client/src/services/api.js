import axios from 'axios';

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,        // send refresh-token cookie
  timeout:         12000,
});

// ── Request — attach access token ─────────────────────────────
api.interceptors.request.use((config) => {
  // Import store lazily to avoid circular module graph
  const { accessToken } = JSON.parse(
    localStorage.getItem('vault-auth') || '{}'
  );
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Response — silent token refresh on 401 ────────────────────
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) {
        refreshing = api.post('/auth/refresh').finally(() => (refreshing = null));
      }
      try {
        const { data } = await refreshing;
        // Update persisted token
        const stored = JSON.parse(localStorage.getItem('vault-auth') || '{}');
        localStorage.setItem(
          'vault-auth',
          JSON.stringify({ ...stored, state: { ...stored.state, accessToken: data.accessToken } })
        );
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        // Refresh failed — clear auth and redirect
        localStorage.removeItem('vault-auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
