import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import OAuthCallback from './components/auth/OAuthCallback.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <FullPageSpinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function FullPageSpinner() {
  return (
    <div className="flex h-full items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        <p className="text-sm text-slate-400">Starting up server…</p>
        <p className="text-xs text-slate-600">Free tier may take up to 50 seconds on first load</p>
      </div>
    </div>
  );
}

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => { init(); }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"         element={<Login />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
