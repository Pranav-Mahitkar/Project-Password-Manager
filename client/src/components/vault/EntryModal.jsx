import { useState, useEffect, useCallback } from 'react';
import {
  X, Eye, EyeOff, Copy, Check, RefreshCw, Trash2,
  Globe, User, Lock, FileText, Tag, Star,
} from 'lucide-react';
import PasswordStrengthMeter from '../ui/PasswordStrengthMeter.jsx';
import CopyButton from '../ui/CopyButton.jsx';

const CATEGORIES = ['login', 'card', 'note', 'identity', 'other'];

const EMPTY = {
  siteName:   '',
  siteUrl:    '',
  username:   '',
  password:   '',
  notes:      '',
  category:   'login',
  isFavorite: false,
};

function generatePassword(length = 20) {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}';
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join('');
}

export default function EntryModal({ mode, initialData, onSave, onDelete, onClose }) {
  const [form,        setForm]        = useState(EMPTY);
  const [showPass,    setShowPass]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const [errors,      setErrors]      = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        siteName:   initialData.siteName   ?? '',
        siteUrl:    initialData.siteUrl    ?? '',
        username:   initialData.username   ?? '',
        password:   initialData.password   ?? '',
        notes:      initialData.notes      ?? '',
        category:   initialData.category   ?? 'login',
        isFavorite: initialData.isFavorite ?? false,
      });
    }
  }, [initialData]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.siteName.trim()) errs.siteName = 'Site name is required.';
    if (!form.username.trim()) errs.username = 'Username is required.';
    if (!form.password)        errs.password = 'Password is required.';
    if (form.siteUrl && !/^https?:\/\/.+/.test(form.siteUrl))
      errs.siteUrl = 'Must be a valid URL (https://…)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    try { await onDelete(); } finally { setDeleting(false); }
  };

  const genPassword = () => {
    const pwd = generatePassword();
    setForm((f) => ({ ...f, password: pwd }));
    setShowPass(true);
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-100">
            {mode === 'create' ? 'New vault entry' : 'Edit entry'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isFavorite: !f.isFavorite }))}
              className={`p-2 rounded-lg transition-colors ${
                form.isFavorite
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-slate-500 hover:text-amber-400 hover:bg-amber-400/10'
              }`}
              title="Toggle favorite"
            >
              <Star size={16} fill={form.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-surface-hover transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Category tabs */}
          <div>
            <label className="label">Category</label>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: cat }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    form.category === cat
                      ? 'bg-brand text-white'
                      : 'bg-surface border border-surface-border text-slate-400 hover:border-brand/40 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Site name */}
          <div>
            <label className="label">Site name *</label>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className={`input pl-9 ${errors.siteName ? 'border-danger focus:border-danger focus:ring-danger/40' : ''}`}
                placeholder="e.g. GitHub"
                value={form.siteName}
                onChange={set('siteName')}
              />
            </div>
            {errors.siteName && <p className="mt-1 text-xs text-danger">{errors.siteName}</p>}
          </div>

          {/* URL */}
          <div>
            <label className="label">Website URL</label>
            <input
              className={`input ${errors.siteUrl ? 'border-danger focus:border-danger focus:ring-danger/40' : ''}`}
              placeholder="https://github.com"
              value={form.siteUrl}
              onChange={set('siteUrl')}
            />
            {errors.siteUrl && <p className="mt-1 text-xs text-danger">{errors.siteUrl}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="label">Username / Email *</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className={`input pl-9 ${errors.username ? 'border-danger focus:border-danger focus:ring-danger/40' : ''}`}
                placeholder="you@example.com"
                value={form.username}
                onChange={set('username')}
                autoComplete="off"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <CopyButton text={form.username} />
              </div>
            </div>
            {errors.username && <p className="mt-1 text-xs text-danger">{errors.username}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Password *</label>
              <button
                type="button"
                onClick={genPassword}
                className="flex items-center gap-1.5 text-[11px] text-brand hover:text-brand-hover transition-colors"
              >
                <RefreshCw size={11} />
                Generate strong
              </button>
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPass ? 'text' : 'password'}
                className={`input pl-9 pr-20 font-mono tracking-wider ${
                  errors.password ? 'border-danger focus:border-danger focus:ring-danger/40' : ''
                }`}
                placeholder="••••••••••••"
                value={form.password}
                onChange={set('password')}
                autoComplete="new-password"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <CopyButton text={form.password} />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
            {form.password && <PasswordStrengthMeter password={form.password} />}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Optional notes…"
              value={form.notes}
              onChange={set('notes')}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border flex-shrink-0">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger text-xs"
              >
                <Trash2 size={13} />
                {confirmDel ? 'Confirm delete' : 'Delete'}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-ghost text-xs">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn-primary text-xs"
            >
              {saving
                ? <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : null}
              {mode === 'create' ? 'Save entry' : 'Update entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
