import { getGraph } from '@/lib/graph.js';
import { handle, json } from '@/lib/http.js';
import { searchBooks } from '@/lib/library.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/books?author=slug[,slug]&genre=slug[,slug]&q=texto[&debug=1] */
export const GET = handle(async (req) => {
  const p = req.nextUrl.searchParams;
  const { books, sparql } = await searchBooks({ author: p.get('author'), genre: p.get('genre'), q: p.get('q') });
  const { warnings } = await getGraph();
  return json({ count: books.length, books, warnings, ...(p.get('debug') ? { sparql } : {}) });
});

