import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      className={`p-1.5 rounded-md transition-colors ${
        copied
          ? 'text-emerald-400 bg-emerald-400/10'
          : 'text-slate-500 hover:text-slate-300 hover:bg-surface-hover'
      } ${className}`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}
