import { error, handle, json } from '@/lib/http.js';
import { getBook } from '@/lib/library.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async (_req, { params }) => {
  const { id } = await params;
  const book = await getBook(id);
  return book ? json(book) : error(404, 'Livro não encontrado');
});

