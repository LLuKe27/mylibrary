const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options) {
  const res = await fetch(BASE + path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erro ${res.status} em ${path}`);
  }
  return res.json();
}

const jsonBody = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const api = {
  books({ authors = [], genres = [], q = '' } = {}, signal) {
    const p = new URLSearchParams({ debug: '1' });
    if (authors.length) p.set('author', authors.join(','));
    if (genres.length) p.set('genre', genres.join(','));
    if (q.trim()) p.set('q', q.trim());
    return request(`/api/books?${p}`, { signal });
  },
  book: (id) => request(`/api/books/${encodeURIComponent(id)}`),
  read: (id) => request(`/api/books/${encodeURIComponent(id)}/read`),
  authors: () => request('/api/authors'),
  genres: () => request('/api/genres'),
  history: () => request('/api/history'),
  addHistory: (bookId, action) => request('/api/history', jsonBody('POST', { bookId, action })),
  removeHistory: (bookId) => request(`/api/history/${encodeURIComponent(bookId)}`, { method: 'DELETE' }),
  clearHistory: () => request('/api/history', { method: 'DELETE' }),
  audioUrl: (path) => BASE + path,
};

