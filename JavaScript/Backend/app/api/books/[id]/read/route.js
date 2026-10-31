import { error, handle, json } from '@/lib/http.js';
import { getExcerpt, isSlug } from '@/lib/library.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Páginas do leitor simulado. */
export const GET = handle(async (_req, { params }) => {
  const { id } = await params;
  if (!isSlug(id)) return error(400, 'id inválido');
  const pages = await getExcerpt(id);
  return pages ? json({ id, pages }) : error(404, 'Livro não encontrado');
});

