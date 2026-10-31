import { memo, useId } from 'react';

/**
 * Sintetiza uma capa vetorial (SVG) a partir dos metadados RDF do livro:
 * paleta (lib:coverPalette), motivo (lib:coverMotif), título, autor, gênero e ano.
 * Cada capa é determinística (mesmo livro => mesma arte).
 */

function hash(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rng(seed) {
  let s = seed || 1;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

function wrap(text, max) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max && line) {
      lines.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function Motif({ type, accent, ink, rand }) {
  const a = accent;
  switch (type) {
    case 'eyes':
      return (
        <g opacity=".9">
          <path d="M40 150 Q100 100 160 150 Q100 200 40 150Z" fill="none" stroke={a} strokeWidth="3" />
          <circle cx="100" cy="150" r="22" fill={a} />
          <circle cx="100" cy="150" r="9" fill={ink} opacity=".9" />
          <path d="M30 150 Q100 80 170 150" fill="none" stroke={a} strokeWidth="1" opacity=".5" />
        </g>
      );
    case 'circles':
      return (
        <g fill="none" stroke={a}>
          {Array.from({ length: 7 }, (_, i) => (
            <circle key={i} cx="100" cy="150" r={12 + i * 11} strokeWidth={i % 2 ? 1 : 2.5} opacity={1 - i * 0.11} />
          ))}
        </g>
      );
    case 'leaves':
      return (
        <g fill={a}>
          {Array.from({ length: 9 }, (_, i) => {
            const ang = -70 + i * 17;
            return <path key={i} d="M100 210 Q112 170 100 120 Q88 170 100 210Z" transform={`rotate(${ang} 100 210)`} opacity={0.45 + rand() * 0.5} />;
          })}
        </g>
      );
    case 'waves':
      return (
        <g fill="none" stroke={a} strokeWidth="2.5">
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M0 ${110 + i * 14} q25 -14 50 0 t50 0 t50 0 t50 0`} opacity={1 - i * 0.12} />
          ))}
        </g>
      );
    case 'grid':
      return (
        <g>
          {Array.from({ length: 30 }, (_, i) => {
            const x = 30 + (i % 6) * 24;
            const y = 95 + Math.floor(i / 6) * 24;
            return <rect key={i} x={x} y={y} width="18" height="18" rx="2" fill={a} opacity={0.15 + rand() * 0.85} />;
          })}
        </g>
      );
    case 'lines':
      return (
        <g stroke={a} strokeLinecap="round">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={20 + i * 16} y1={210} x2={20 + i * 16} y2={210 - 30 - rand() * 90} strokeWidth="6" opacity=".85" />
          ))}
        </g>
      );
    case 'flowers':
      return (
        <g>
          {[[70, 130, 1], [130, 165, 0.8], [95, 195, 0.6]].map(([cx, cy, s], k) => (
            <g key={k} transform={`translate(${cx} ${cy}) scale(${s})`}>
              {Array.from({ length: 6 }, (_, i) => (
                <ellipse key={i} cx="0" cy="-16" rx="9" ry="16" fill={a} opacity=".75" transform={`rotate(${i * 60})`} />
              ))}
              <circle r="7" fill={ink} />
            </g>
          ))}
        </g>
      );
    case 'bolt':
      return (
        <g>
          <circle cx="100" cy="150" r="58" fill="none" stroke={a} strokeWidth="1.5" opacity=".5" />
          <path d="M112 92 L76 158 L100 158 L88 210 L128 138 L104 138 Z" fill={a} />
        </g>
      );
    case 'clock':
      return (
        <g fill="none" stroke={a}>
          <circle cx="100" cy="150" r="56" strokeWidth="3" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="100" y1="100" x2="100" y2={i % 3 ? 106 : 112} strokeWidth="3" transform={`rotate(${i * 30} 100 150)`} />
          ))}
          <line x1="100" y1="150" x2="100" y2="115" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="150" x2="128" y2="160" strokeWidth="3" strokeLinecap="round" />
          <path d="M30 150 A70 70 0 0 1 100 80" strokeWidth="1.5" strokeDasharray="4 6" />
        </g>
      );
    case 'moon':
      return (
        <g>
          <circle cx="118" cy="128" r="38" fill={a} />
          <circle cx="134" cy="118" r="34" fill="currentColor" style={{ color: 'var(--cover-bg)' }} />
          <path d="M0 215 L40 180 L70 200 L110 165 L150 195 L200 170 L200 230 L0 230Z" fill={ink} opacity=".12" />
        </g>
      );
    case 'feather':
      return (
        <g stroke={a} fill="none" strokeLinecap="round">
          <path d="M60 215 Q100 150 145 90" strokeWidth="3" />
          {Array.from({ length: 12 }, (_, i) => {
            const t = 0.15 + i * 0.065;
            const x = 60 + t * 85;
            const y = 215 - t * 125;
            return (
              <g key={i}>
                <path d={`M${x} ${y} q-26 -6 -34 -24`} strokeWidth="1.6" />
                <path d={`M${x} ${y} q20 8 34 2`} strokeWidth="1.6" />
              </g>
            );
          })}
        </g>
      );
    case 'bubbles':
      return (
        <g fill="none" stroke={a}>
          {Array.from({ length: 16 }, (_, i) => (
            <circle key={i} cx={20 + rand() * 160} cy={95 + rand() * 120} r={3 + rand() * 16} strokeWidth="2" opacity={0.4 + rand() * 0.6} />
          ))}
        </g>
      );
    default:
      return <circle cx="100" cy="150" r="50" fill={a} opacity=".7" />;
  }
}

function BookCoverBase({ book, className = '', decorative = false }) {
  const uid = useId().replace(/:/g, '');
  const [bg, accent, ink] = book?.cover?.palette?.length === 3 ? book.cover.palette : ['#2c2c2e', '#0a84ff', '#f5f5f7'];
  const rand = rng(hash(book?.id));
  const titleLines = wrap(book?.title ?? 'Sem título', 15);
  const fontSize = titleLines.length > 2 ? 15 : 19;
  const label = `Capa de “${book?.title}”, de ${book?.author?.name ?? 'autor desconhecido'}`;

  return (
    <svg
      className={`cover ${className}`}
      viewBox="0 0 200 300"
      preserveAspectRatio="xMidYMid slice"
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-labelledby': `t-${uid}` })}
      style={{ '--cover-bg': bg }}
    >
      {!decorative && <title id={`t-${uid}`}>{label}</title>}
      <defs>
        <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg} />
          <stop offset="1" stopColor={bg} stopOpacity=".82" />
        </linearGradient>
        <linearGradient id={`s-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".18" />
          <stop offset=".35" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="200" height="300" fill={bg} />
      <rect width="200" height="300" fill={`url(#g-${uid})`} />
      <Motif type={book?.cover?.motif} accent={accent} ink={ink} rand={rand} />
      <g fill={ink} fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif">
        <text x="16" y="30" fontSize="8.5" letterSpacing="1.6" opacity=".75">
          {(book?.genre?.label ?? '').toUpperCase()}
        </text>
        {titleLines.map((l, i) => (
          <text key={i} x="16" y={242 - (titleLines.length - 1 - i) * (fontSize + 2)} fontSize={fontSize} fontWeight="700" letterSpacing="-.3">
            {l}
          </text>
        ))}
        <text x="16" y="270" fontSize="10" opacity=".85">{book?.author?.name}</text>
        {book?.year && <text x="184" y="30" fontSize="8.5" textAnchor="end" opacity=".6">{book.year}</text>}
      </g>
      <rect width="7" height="300" fill="#000" opacity=".18" />
      <rect width="200" height="300" fill={`url(#s-${uid})`} />
    </svg>
  );
}

export const BookCover = memo(BookCoverBase);

