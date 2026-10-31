// Ícones SVG funcionais (os decorativos usam aria-hidden).
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false };

export const Icon = {
  Play: (p) => (
    <svg {...base} {...p} fill="currentColor" stroke="none"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" /></svg>
  ),
  Pause: (p) => (
    <svg {...base} {...p} fill="currentColor" stroke="none"><rect x="6" y="4" width="4.5" height="16" rx="1.2" /><rect x="13.5" y="4" width="4.5" height="16" rx="1.2" /></svg>
  ),
  Back15: (p) => (
    <svg {...base} {...p}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 3v5h5" /><text x="12" y="15.5" fontSize="7.5" textAnchor="middle" fill="currentColor" stroke="none" fontWeight="700">15</text></svg>
  ),
  Fwd15: (p) => (
    <svg {...base} {...p}><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v5h-5" /><text x="12" y="15.5" fontSize="7.5" textAnchor="middle" fill="currentColor" stroke="none" fontWeight="700">15</text></svg>
  ),
  History: (p) => (
    <svg {...base} {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 3" /></svg>
  ),
  Moon: (p) => (
    <svg {...base} {...p} fill="currentColor" stroke="none"><path d="M21 13.2A9 9 0 1 1 10.8 3a7 7 0 0 0 10.2 10.2z" /></svg>
  ),
  Sun: (p) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
  ),
  Contrast: (p) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" /></svg>
  ),
  Search: (p) => (
    <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
  ),
  Close: (p) => (
    <svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
  ),
  Book: (p) => (
    <svg {...base} {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></svg>
  ),
  Headphones: (p) => (
    <svg {...base} {...p}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z" /></svg>
  ),
  Eye: (p) => (
    <svg {...base} {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
  ),
  ChevronLeft: (p) => (
    <svg {...base} {...p}><path d="m15 18-6-6 6-6" /></svg>
  ),
  ChevronRight: (p) => (
    <svg {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>
  ),
  Keyboard: (p) => (
    <svg {...base} {...p}><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></svg>
  ),
  Code: (p) => (
    <svg {...base} {...p}><path d="m16 18 6-6-6-6M8 6l-6 6 6 6" /></svg>
  ),
};

