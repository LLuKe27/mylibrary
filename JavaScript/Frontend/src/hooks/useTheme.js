import { useCallback, useEffect, useState } from 'react';

const ORDER = ['dark', 'light', 'contrast'];

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('theme');
    if (ORDER.includes(saved)) return saved;
    if (window.matchMedia('(prefers-contrast: more)').matches) return 'contrast';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const cycle = useCallback(() => setTheme((t) => ORDER[(ORDER.indexOf(t) + 1) % ORDER.length]), []);
  return [theme, cycle];
}
