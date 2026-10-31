import { addHistory, clearHistory, readHistory } from '@/lib/history.js';
import { error, handle, json } from '@/lib/http.js';
import { getBook } from '@/lib/library.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ACTIONS = new Set(['view', 'read', 'listen']);

export const GET = handle(async () => json(await readHistory()));

/** POST { bookId, action: 'view' | 'read' | 'listen' } */
export const POST = handle(async (req) => {
  const body = await req.json().catch(() => ({}));
  if (!ACTIONS.has(body.action)) return error(400, 'ação inválida');
  const book = await getBook(body.bookId);
  if (!book) return error(404, 'Livro não encontrado');
  const list = await addHistory({ bookId: book.id, title: book.title, author: book.author.name, action: body.action });
  return json(list, { status: 201 });
});

export const DELETE = handle(async () => json(await clearHistory()));

