import { memo } from 'react';
import { BookCover } from './BookCover.jsx';
import { Icon } from './Icons.jsx';

function BookCardBase({ book, isCurrent, isPlaying, isLoading, onOpen, onPlay, incomplete }) {
  return (
    <article className={`book-card ${isCurrent ? 'is-current' : ''}`} aria-label={book.title}>
      <button className="book-card__open" onClick={() => onOpen(book)} aria-label={`Abrir detalhes de ${book.title}, de ${book.author.name}`}>
        <BookCover book={book} decorative />
      </button>
      <div className="book-card__meta">
        <div className="book-card__text">
          <h3 className="book-card__title">{book.title}</h3>
          <p className="book-card__author">{book.author.name}</p>
          {incomplete ? <p className="badge badge--warn">dados incompletos</p> : null}
        </div>
        <button
          className={`play-dot ${isCurrent && isPlaying ? 'is-playing' : ''}`}
          onClick={() => onPlay(book)}
          aria-label={isCurrent && isPlaying ? `Pausar audiobook de ${book.title}` : `Ouvir audiobook de ${book.title}`}
          aria-pressed={isCurrent && isPlaying}
          disabled={!book.audio}
        >
          {isCurrent && isLoading ? <span className="spinner" aria-hidden="true" /> : isCurrent && isPlaying ? <Icon.Pause width={14} height={14} /> : <Icon.Play width={14} height={14} />}
        </button>
      </div>
      {isCurrent && isPlaying ? (
        <span className="eq" aria-hidden="true"><i /><i /><i /></span>
      ) : null}
    </article>
  );
}

export const BookCard = memo(BookCardBase);

export function BookCardSkeleton() {
  return (
    <div className="book-card book-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--cover" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line short" />
    </div>
  );
}

