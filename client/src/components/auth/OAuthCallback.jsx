import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../services/api.js';

export default function OAuthCallback() {
  const [params]    = useSearchParams();
  const navigate    = useNavigate();
  const { setAuth } = useAuthStore();
  const ran         = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get('token');
    if (!token) { navigate('/login?error=no_token', { replace: true }); return; }

    // Store token then immediately fetch the user profile
    (async () => {
      try {
        // Temporarily set token so the /me request is authenticated
        localStorage.setItem(
          'vault-auth',
          JSON.stringify({ state: { accessToken: token }, version: 0 })
        );
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuth(data.user, token);
        navigate('/', { replace: true });
      } catch {
        navigate('/login?error=auth_failed', { replace: true });
      }
    })();
  }, []);

  return (
    <div className="flex h-full items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        <p className="text-sm text-slate-400">Completing sign-in…</p>
      </div>
    </div>
  );
}
