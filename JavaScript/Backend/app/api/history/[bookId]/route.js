import { removeHistory } from '@/lib/history.js';
import { error, handle, json } from '@/lib/http.js';
import { isSlug } from '@/lib/library.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Remove um livro do histórico (botão "Excluir" do modal). */
export const DELETE = handle(async (_req, { params }) => {
  const { bookId } = await params;
  if (!isSlug(bookId)) return error(400, 'id inválido');
  return json(await removeHistory(bookId));
});

