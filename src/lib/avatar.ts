const PASTELS = [
  "bg-rose-200 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-sky-200 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  "bg-amber-200 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-violet-200 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-fuchsia-200 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",
];

/** Deterministic pastel avatar background classes from a seed string. */
export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return PASTELS[Math.abs(h) % PASTELS.length];
}

/** Up to two-letter initials from a name (falling back to email). */
export function initials(name: string | null, email: string): string {
  const src = name?.trim() || email;
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}
