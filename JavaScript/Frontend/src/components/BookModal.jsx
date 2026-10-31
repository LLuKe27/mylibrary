import { useCallback, useState } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { BookCover } from './BookCover.jsx';
import { Icon } from './Icons.jsx';
import { Reader } from './Reader.jsx';

export function BookModal({ book, onClose, onRemoveFromHistory, inHistory }) {
  const [expanded, setExpanded] = useState(false);
  const [reading, setReading] = useState(false);
  const player = usePlayer();

  const handleEscape = useCallback(() => (reading ? setReading(false) : onClose()), [reading, onClose]);
  const trapRef = useFocusTrap(true, handleEscape);

  const listen = () => {
    player.play(book);
    onClose();
  };

  const isThisPlaying = player.book?.id === book.id && player.playing;

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={trapRef}
        className={`modal glass-strong ${expanded ? 'is-expanded' : ''} ${reading ? 'is-reading' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="traffic" role="toolbar" aria-label="Controles da janela">
          <button className="traffic__btn traffic__btn--close" onClick={onClose} aria-label="Fechar (Esc)" title="Fechar">
            <span>Fechar</span>
          </button>
          <button
            className="traffic__btn traffic__btn--delete"
            onClick={() => onRemoveFromHistory(book.id)}
            aria-label="Excluir do histórico"
            title={inHistory ? 'Excluir do histórico' : 'Este livro não está no histórico'}
            disabled={!inHistory}
          >
            <span>Excluir</span>
          </button>
          <button
            className="traffic__btn traffic__btn--expand"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Restaurar tamanho' : 'Expandir janela'}
            aria-pressed={expanded}
            title={expanded ? 'Restaurar' : 'Expandir'}
          />
        </div>

        {reading ? (
          <Reader book={book} onExit={() => setReading(false)} />
        ) : (
          <div className="modal__body">
            <div className="modal__cover">
              <BookCover book={book} />
            </div>
            <div className="modal__info">
              <section className="info-card" aria-label="Dados do livro">
                <p className="eyebrow">{book.genre.label}</p>
                <h2 id="modal-title" className="modal__title">{book.title}</h2>
                <dl className="meta-list">
                  <div><dt>Autoria</dt><dd>{book.author.name}</dd></div>
                  {book.year && <div><dt>Ano</dt><dd>{book.year}</dd></div>}
                  {book.pages && <div><dt>Páginas</dt><dd>{book.pages}</dd></div>}
                  {book.audio && <div><dt>Audiobook</dt><dd>{Math.round(book.audio.duration / 60)} min (demo)</dd></div>}
                </dl>
              </section>
              <section className="info-card info-card--synopsis" aria-labelledby="synopsis-title">
                <h3 id="synopsis-title" className="sr-only">Sinopse</h3>
                <p>{book.synopsis ?? 'Sinopse indisponível.'}</p>
                <details className="rdf-details">
                  <summary><Icon.Code width={14} height={14} /> Recurso RDF</summary>
                  <code>{book.iri}</code>
                  <code>dct:creator → {book.author.iri}</code>
                  <code>schema:genre → {book.genre.iri}</code>
                </details>
              </section>
              <div className="segmented" role="group" aria-label="Ações do livro">
                <button className="segmented__btn" onClick={() => setReading(true)} data-autofocus>
                  <Icon.Book width={16} height={16} /> LER
                </button>
                <button className="segmented__btn" onClick={listen} disabled={!book.audio}>
                  {isThisPlaying ? <Icon.Pause width={16} height={16} /> : <Icon.Headphones width={16} height={16} />}
                  {isThisPlaying ? 'PAUSAR' : 'OUVIR'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

