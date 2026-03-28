import { useMemo } from 'react';

function score(pwd) {
  let s = 0;
  if (pwd.length >= 8)  s++;
  if (pwd.length >= 14) s++;
  if (pwd.length >= 20) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return Math.min(s, 4);   // 0-4
}

const LEVELS = [
  { label: 'Very weak', color: 'bg-red-500',    text: 'text-red-400' },
  { label: 'Weak',      color: 'bg-orange-500', text: 'text-orange-400' },
  { label: 'Fair',      color: 'bg-amber-400',  text: 'text-amber-400' },
  { label: 'Strong',    color: 'bg-emerald-500',text: 'text-emerald-400' },
  { label: 'Very strong',color:'bg-brand',      text: 'text-brand' },
];

export default function PasswordStrengthMeter({ password }) {
  const lvl = useMemo(() => score(password), [password]);
  const { label, color, text } = LEVELS[lvl];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < lvl ? color : 'bg-surface-border'
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-medium ${text}`}>{label}</p>
    </div>
  );
}
