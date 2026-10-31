/** Validação básica dos dados recebidos da API: sinaliza campos ausentes no console. */
const REQUIRED = ['id', 'title', 'author', 'genre', 'synopsis', 'cover'];

export function validateBook(book) {
  const missing = REQUIRED.filter((k) => book?.[k] == null || book[k] === '');
  if (book?.author && !book.author.name) missing.push('author.name');
  if (book?.genre && !book.genre.label) missing.push('genre.label');
  if (!book?.audio?.url) missing.push('audio.url');
  if (missing.length) console.warn(`[dados] Livro "${book?.id ?? '?'}" com campos ausentes:`, missing.join(', '));
  return missing;
}

export function formatTime(sec = 0) {
  if (!Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function relativeTime(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  if (diff < 60) return rtf.format(-Math.round(diff), 'second');
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), 'minute');
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), 'hour');
  return rtf.format(-Math.round(diff / 86400), 'day');
}

