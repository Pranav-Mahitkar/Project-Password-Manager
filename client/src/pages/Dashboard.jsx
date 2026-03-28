import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, LogOut, ShieldCheck, Star, Grid3X3, List,
  Key, CreditCard, FileText, User, MoreHorizontal, AlertCircle,
} from 'lucide-react';
import { useAuthStore }  from '../store/authStore.js';
import { useVault }      from '../hooks/useVault.js';
import VaultItem         from '../components/vault/VaultItem.jsx';
import EntryModal        from '../components/vault/EntryModal.jsx';

const CATEGORIES = [
  { key: 'all',      label: 'All items' },
  { key: 'login',    label: 'Logins',    icon: Key },
  { key: 'card',     label: 'Cards',     icon: CreditCard },
  { key: 'note',     label: 'Notes',     icon: FileText },
  { key: 'identity', label: 'Identities',icon: User },
  { key: 'other',    label: 'Other',     icon: MoreHorizontal },
];

export default function Dashboard() {
  const { user, logout }  = useAuthStore();
  const {
    entries, loading, error,
    fetchAll, fetchOne, createEntry, updateEntry, deleteEntry, toggleFavorite,
  } = useVault();

  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [view,     setView]     = useState('list');   // 'list' | 'grid'
  const [modal,    setModal]    = useState(null);     // null | { mode: 'create'|'edit', entry? }
  const [decrypted,setDecrypted]= useState(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    let list = entries;
    if (category === 'favorites') list = list.filter((e) => e.isFavorite);
    else if (category !== 'all')  list = list.filter((e) => e.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.siteName.toLowerCase().includes(q) ||
          e.siteUrl?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, category, search]);

  const openCreate = () => { setDecrypted(null); setModal({ mode: 'create' }); };
  const openEdit   = async (entry) => {
    const full = await fetchOne(entry._id);
    setDecrypted(full);
    setModal({ mode: 'edit', entry: full });
  };
  const closeModal = () => { setModal(null); setDecrypted(null); };

  const handleSave = async (payload) => {
    if (modal.mode === 'create') await createEntry(payload);
    else await updateEntry(modal.entry.id, payload);
    closeModal();
  };

  const handleDelete = async (id) => {
    await deleteEntry(id);
    closeModal();
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-surface-card border-r border-surface-border">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-surface-border">
          <ShieldCheck size={18} className="text-brand" />
          <span className="font-semibold text-slate-100 tracking-tight">VaultLock</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <button
            onClick={() => setCategory('favorites')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
              ${category === 'favorites'
                ? 'bg-brand/15 text-brand font-medium'
                : 'text-slate-400 hover:bg-surface-hover hover:text-slate-200'}`}
          >
            <Star size={15} />
            Favorites
          </button>

          <div className="pt-3 pb-1 px-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Categories
            </span>
          </div>

          {CATEGORIES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                ${category === key
                  ? 'bg-brand/15 text-brand font-medium'
                  : 'text-slate-400 hover:bg-surface-hover hover:text-slate-200'}`}
            >
              {Icon && <Icon size={15} />}
              {label}
              <span className="ml-auto text-[11px] text-slate-600">
                {key === 'all'
                  ? entries.length
                  : entries.filter((e) => e.category === key).length}
              </span>
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-surface-border p-3">
          <div className="flex items-center gap-2.5 px-2 py-2">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
              : <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-semibold">
                  {user?.displayName?.[0] ?? '?'}
                </div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{user?.displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg
                       text-xs text-slate-500 hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-6 py-4 border-b border-surface-border bg-surface-card">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vault…"
              className="input pl-9 h-9"
            />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-surface text-brand' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-surface text-brand' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Grid3X3 size={15} />
            </button>
          </div>
          <button onClick={openCreate} className="btn-primary h-9">
            <Plus size={15} />
            Add entry
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Counts */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm mb-4">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-surface-card border border-surface-border animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
                <ShieldCheck size={24} className="text-brand" />
              </div>
              <p className="text-slate-300 font-medium mb-1">
                {search ? 'No results found' : 'Your vault is empty'}
              </p>
              <p className="text-sm text-slate-500 mb-6 max-w-xs">
                {search
                  ? 'Try a different search term.'
                  : 'Add your first password entry to get started.'}
              </p>
              {!search && (
                <button onClick={openCreate} className="btn-primary">
                  <Plus size={15} /> Add your first entry
                </button>
              )}
            </div>
          )}

          {/* Grid / List */}
          {!loading && filtered.length > 0 && (
            <div className={view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3'
              : 'flex flex-col gap-2'
            }>
              {filtered.map((entry) => (
                <VaultItem
                  key={entry._id}
                  entry={entry}
                  view={view}
                  onOpen={() => openEdit(entry)}
                  onToggleFavorite={() => toggleFavorite(entry._id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Modal ─────────────────────────────────────────── */}
      {modal && (
        <EntryModal
          mode={modal.mode}
          initialData={decrypted}
          onSave={handleSave}
          onDelete={modal.mode === 'edit' ? () => handleDelete(modal.entry.id) : null}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
