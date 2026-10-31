import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Icon } from './Icons.jsx';

/** Leitor de livro simulado: paginação, tamanho de fonte e progresso salvo localmente. */
export function Reader({ book, onExit }) {
  const [pages, setPages] = useState(null);
  const [error, setError] = useState(null);
  const storageKey = `reader:${book.id}`;
  const [index, setIndex] = useState(() => Number(localStorage.getItem(storageKey)) || 0);
  const [font, setFont] = useState(() => Number(localStorage.getItem('reader:font')) || 19);

  useEffect(() => {
    api
      .read(book.id)
      .then((d) => setPages([{ cover: true }, ...d.pages.map((text) => ({ text })), { end: true }]))
      .catch((e) => setError(e.message));
    api.addHistory(book.id, 'read').catch(() => {});
  }, [book.id]);

  useEffect(() => localStorage.setItem(storageKey, String(index)), [index, storageKey]);
  useEffect(() => localStorage.setItem('reader:font', String(font)), [font]);

  const total = pages?.length ?? 0;
  const go = (d) => setIndex((i) => Math.max(0, Math.min(total - 1, i + d)));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); e.stopPropagation(); go(1); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); e.stopPropagation(); go(-1); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });

  const page = pages?.[Math.min(index, total - 1)];

  return (
    <div className="reader">
      <div className="reader__toolbar">
        <button className="btn btn--ghost" onClick={onExit} aria-label="Voltar aos detalhes do livro">
          <Icon.ChevronLeft width={16} height={16} /> Detalhes
        </button>
        <h2 id="modal-title" className="reader__title">{book.title}</h2>
        <div className="reader__font" role="group" aria-label="Tamanho da fonte">
          <button className="icon-btn icon-btn--sm" onClick={() => setFont((f) => Math.max(14, f - 2))} aria-label="Diminuir fonte">A−</button>
          <button className="icon-btn icon-btn--sm" onClick={() => setFont((f) => Math.min(30, f + 2))} aria-label="Aumentar fonte">A+</button>
        </div>
      </div>

      <div className="reader__page" style={{ fontSize: font }} aria-live="polite">
        {error && <p role="alert">{error}</p>}
        {!pages && !error && <div className="spinner spinner--lg" aria-label="Carregando" />}
        {page?.cover && (
          <div className="reader__cover-page">
            <p className="eyebrow">{book.genre.label} · {book.year}</p>
            <h3>{book.title}</h3>
            <p>{book.author.name}</p>
            <p className="reader__hint">Use ← → para virar as páginas</p>
          </div>
        )}
        {page?.text && <p className="reader__text">{page.text}</p>}
        {page?.end && (
          <div className="reader__cover-page">
            <h3>Fim da amostra</h3>
            <p>Este é um leitor simulado para demonstração do protótipo.</p>
            <button className="btn" onClick={() => setIndex(0)}>Recomeçar</button>
          </div>
        )}
      </div>

      <div className="reader__nav">
        <button className="icon-btn" onClick={() => go(-1)} disabled={index === 0} aria-label="Página anterior">
          <Icon.ChevronLeft />
        </button>
        <div className="reader__progress" role="progressbar" aria-label="Progresso de leitura" aria-valuemin={1} aria-valuemax={total || 1} aria-valuenow={index + 1}>
          <span style={{ width: total ? `${((index + 1) / total) * 100}%` : 0 }} />
        </div>
        <span className="reader__count">{total ? `${index + 1} / ${total}` : ''}</span>
        <button className="icon-btn" onClick={() => go(1)} disabled={index >= total - 1} aria-label="Próxima página">
          <Icon.ChevronRight />
        </button>
      </div>
    </div>
  );
}

