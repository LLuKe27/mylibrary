import { synthesizeWav } from '@/lib/audio.js';
import { error, handle } from '@/lib/http.js';
import { getBook } from '@/lib/library.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Audiobook simulado (WAV gerado e mantido em cache em memória). */
export const GET = handle(async (_req, { params }) => {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) return error(404, 'Livro não encontrado');
  const wav = synthesizeWav(id, book.audio?.duration || 90);
  return new Response(wav, {
    headers: {
      'Content-Type': 'audio/wav',
      'Content-Length': String(wav.length),
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

