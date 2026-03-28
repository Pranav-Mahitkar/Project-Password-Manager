import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

const API = import.meta.env.VITE_API_URL || '/api';

const features = [
  { icon: Lock,        title: 'AES-256-GCM Encryption', desc: 'Every password encrypted with military-grade cryptography before storage.' },
  { icon: ShieldCheck, title: 'Zero-Knowledge Design',  desc: 'Your encryption keys never touch the database — only you can decrypt.' },
  { icon: Eye,         title: 'Ownership Isolation',    desc: 'Strict server-side guards ensure you can only ever see your own vault.' },
  { icon: RefreshCw,   title: 'Secure Session Tokens',  desc: 'Short-lived JWTs with silent refresh via httpOnly cookies.' },
];

export default function Login() {
  const { user } = useAuthStore();
  const navigate  = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-full flex flex-col lg:flex-row">
      {/* Left panel — branding */}
      <div className="lg:w-1/2 flex flex-col justify-center px-12 py-16 bg-surface-card border-r border-surface-border">
        <div className="max-w-md mx-auto w-full animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-brand/20 border border-brand/40 flex items-center justify-center">
              <ShieldCheck size={20} className="text-brand" />
            </div>
            <span className="text-xl font-semibold text-slate-100 tracking-tight">VaultLock</span>
          </div>

          <h1 className="text-4xl font-semibold text-slate-100 leading-tight mb-4">
            Your passwords,<br />
            <span className="text-brand">bulletproof.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-12">
            End-to-end encrypted password manager built on AES-256-GCM.
            Zero-knowledge architecture means your data is only ever readable by you.
          </p>

          <div className="space-y-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mt-0.5">
                  <Icon size={14} className="text-brand" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200 mb-0.5">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — sign in */}
      <div className="lg:w-1/2 flex flex-col justify-center items-center px-12 py-16">
        <div className="max-w-sm w-full animate-slide-up">
          <h2 className="text-2xl font-semibold text-slate-100 mb-2">Sign in</h2>
          <p className="text-sm text-slate-400 mb-8">
            Connect with Google to access your encrypted vault.
          </p>

          <a
            href={`${API}/auth/google`}
            className="flex items-center justify-center gap-3 w-full py-3 px-5 rounded-xl
                       bg-white text-gray-800 font-medium text-sm
                       hover:bg-gray-100 transition-all duration-200 active:scale-95 shadow-md"
          >
            {/* Google SVG icon */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
            </svg>
            Continue with Google
          </a>

          <p className="mt-6 text-center text-xs text-slate-600">
            By signing in, you agree to our Terms of Service.<br />
            Your data is encrypted and private.
          </p>
        </div>
      </div>
    </div>
  );
}
