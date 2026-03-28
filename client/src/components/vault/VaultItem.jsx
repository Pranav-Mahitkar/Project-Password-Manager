import { Star, Globe, Key, CreditCard, FileText, User, MoreHorizontal } from 'lucide-react';

const CATEGORY_META = {
  login:    { icon: Key,         color: 'text-brand',   bg: 'bg-brand/10' },
  card:     { icon: CreditCard,  color: 'text-amber-400',bg: 'bg-amber-400/10' },
  note:     { icon: FileText,    color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  identity: { icon: User,        color: 'text-purple-400',  bg: 'bg-purple-400/10' },
  other:    { icon: MoreHorizontal, color: 'text-slate-400', bg: 'bg-slate-400/10' },
};

function Favicon({ url, name }) {
  const domain = (() => {
    try { return new URL(url || '').hostname; } catch { return null; }
  })();

  if (domain) {
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
        alt=""
        className="w-5 h-5 rounded"
        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
      />
    );
  }
  return null;
}

function CategoryIcon({ category }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.other;
  const Icon = meta.icon;
  return (
    <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={15} className={meta.color} />
    </div>
  );
}

export default function VaultItem({ entry, view, onOpen, onToggleFavorite }) {
  const domain = (() => {
    try { return new URL(entry.siteUrl || '').hostname; } catch { return entry.siteUrl || ''; }
  })();

  const handleFavorite = (e) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  if (view === 'grid') {
    return (
      <button
        onClick={onOpen}
        className="card p-4 text-left hover:border-brand/40 hover:bg-surface-hover
                   transition-all duration-200 animate-fade-in group"
      >
        <div className="flex items-start justify-between mb-3">
          <CategoryIcon category={entry.category} />
          <button
            onClick={handleFavorite}
            className={`p-1.5 rounded-lg transition-colors ${
              entry.isFavorite
                ? 'text-amber-400'
                : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-400'
            }`}
          >
            <Star size={13} fill={entry.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p className="text-sm font-medium text-slate-100 truncate mb-1">{entry.siteName}</p>
        <p className="text-xs text-slate-500 truncate">{domain || '—'}</p>
        <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between">
          <span className="text-[10px] text-slate-600 uppercase tracking-wide">{entry.category}</span>
          <span className="text-[10px] text-slate-600">
            {new Date(entry.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="card px-4 py-3 flex items-center gap-3 text-left w-full
                 hover:border-brand/40 hover:bg-surface-hover
                 transition-all duration-200 animate-fade-in group"
    >
      <CategoryIcon category={entry.category} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100 truncate">{entry.siteName}</p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{domain || '—'}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {entry.isFavorite && <Star size={12} className="text-amber-400" fill="currentColor" />}
        <span className="text-[10px] text-slate-600 hidden sm:block">
          {new Date(entry.updatedAt).toLocaleDateString()}
        </span>
        <button
          onClick={handleFavorite}
          className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
            entry.isFavorite
              ? 'text-amber-400 opacity-100'
              : 'text-slate-600 hover:text-amber-400'
          }`}
        >
          <Star size={13} fill={entry.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    </button>
  );
}
