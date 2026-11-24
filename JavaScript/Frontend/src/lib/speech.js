/**
 * Utilitários da Web Speech API (SpeechSynthesis + SpeechRecognition)
 * integrados ao player de audiobook.
 */

const DEMO_TAG_RE = /^\[Texto adaptado para demonstração\]\s*/i;

/** Divide um texto longo em sentenças curtas para evitar cortes do speechSynthesis (~15s no Chrome). */
function splitSentences(text, maxLen = 180) {
  const clean = String(text || '').replace(DEMO_TAG_RE, '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const raw = clean.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [clean];
  const out = [];
  let buf = '';
  for (const part of raw) {
    const piece = part.trim();
    if (!piece) continue;
    if (buf && buf.length + piece.length + 1 > maxLen) {
      out.push(buf);
      buf = piece;
    } else {
      buf = buf ? `${buf} ${piece}` : piece;
    }
  }
  if (buf) out.push(buf);
  return out;
}

/** Monta os segmentos de narração de um livro (cabeçalho, sinopse e páginas do trecho). */
export function buildNarrationSegments(book, pages = []) {
  if (!book) return [];
  const segments = [];
  const intro = [
    book.title,
    book.author?.name ? `de ${book.author.name}` : null,
    book.genre?.label ? `Gênero: ${book.genre.label}` : null,
  ]
    .filter(Boolean)
    .join('. ') + '.';

  segments.push({ label: 'Apresentação', text: intro });

  if (book.synopsis) {
    for (const sentence of splitSentences(book.synopsis)) {
      segments.push({ label: 'Sinopse', text: sentence });
    }
  }

  pages.forEach((pageText, pageIdx) => {
    for (const sentence of splitSentences(pageText)) {
      segments.push({ label: `Trecho · Pág. ${pageIdx + 1}`, text: sentence });
    }
  });

  return segments;
}

/** Seleciona a melhor voz em português disponível no navegador. */
export function pickPortugueseVoice(voices = [], preferredURI = '') {
  if (!Array.isArray(voices) || !voices.length) return null;
  if (preferredURI) {
    const match = voices.find((v) => v.voiceURI === preferredURI);
    if (match) return match;
  }
  const ptBr = voices.filter((v) => /^pt[-_]?br$/i.test(v.lang));
  if (ptBr.length) return ptBr.find((v) => v.localService) || ptBr[0];
  const ptAny = voices.filter((v) => /^pt\b/i.test(v.lang));
  if (ptAny.length) return ptAny[0];
  return null;
}

/** Interpreta comandos de voz em português para controlar o player de audiobook. */
export function parseVoiceCommand(transcript = '') {
  const norm = String(transcript)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (!norm) return null;
  if (/\b(pausar|pausa|parar|pare|silencio)\b/.test(norm)) return { action: 'pause', label: 'Pausar' };
  if (/\b(tocar|reproduzir|continuar|ouvir|play|retomar)\b/.test(norm)) return { action: 'play', label: 'Reproduzir' };
  if (/\b(avancar|proximo|proxima|frente|pular)\b/.test(norm)) return { action: 'forward', label: 'Avançar' };
  if (/\b(voltar|anterior|atras|retroceder)\b/.test(norm)) return { action: 'backward', label: 'Voltar' };
  if (/\b(mais rapido|acelerar|aumentar velocidade)\b/.test(norm)) return { action: 'faster', label: 'Mais rápido' };
  if (/\b(mais devagar|desacelerar|diminuir velocidade|lento)\b/.test(norm)) return { action: 'slower', label: 'Mais devagar' };
  if (/\b(fechar|encerrar|sair)\b/.test(norm)) return { action: 'stop', label: 'Fechar player' };
  return null;
}
