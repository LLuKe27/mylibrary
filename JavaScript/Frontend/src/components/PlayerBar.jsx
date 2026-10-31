import { usePlayer } from '../context/PlayerContext.jsx';
import { formatTime } from '../lib/utils.js';
import { BookCover } from './BookCover.jsx';
import { Icon } from './Icons.jsx';

/** Barra do player de audiobook (layout da tela "player após clicar em ouvir"). */
export function PlayerBar({ onOpenBook }) {
  const p = usePlayer();
  if (!p.book) return null;
  const pct = p.duration ? (p.time / p.duration) * 100 : 0;

  return (
    <section className="player glass-strong" aria-label={`Player de audiobook: ${p.book.title}`}>
      <button className="player__thumb" onClick={() => onOpenBook(p.book)} aria-label={`Abrir detalhes de ${p.book.title}`}>
        <BookCover book={p.book} decorative />
      </button>

      <div className="player__info">
        <strong className="player__title">{p.book.title}</strong>
        <span className="player__author">{p.book.author.name}</span>
      </div>

      <div className="player__controls" role="group" aria-label="Controles de reprodução">
        <button className="icon-btn" onClick={() => p.skip(-15)} aria-label="Voltar 15 segundos (←)" title="Voltar 15s (←)">
          <Icon.Back15 width={22} height={22} />
        </button>
        <button
          className="icon-btn icon-btn--primary"
          onClick={p.toggle}
          aria-label={p.playing ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
          title={p.playing ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
          disabled={p.loading}
        >
          {p.loading ? <span className="spinner" aria-hidden="true" /> : p.playing ? <Icon.Pause width={22} height={22} /> : <Icon.Play width={22} height={22} />}
        </button>
        <button className="icon-btn" onClick={() => p.skip(15)} aria-label="Avançar 15 segundos (→)" title="Avançar 15s (→)">
          <Icon.Fwd15 width={22} height={22} />
        </button>
      </div>

      <button className="speed-pill" onClick={() => p.cycleRate(1)} aria-label={`Velocidade de leitura ${p.rate}x. Alterar (] ou [)`} title="Velocidade ( [ / ] )">
        {p.rate}×
      </button>

      <div className="player__progress">
        <span className="player__time" aria-hidden="true">{formatTime(p.time)}</span>
        <input
          type="range"
          min={0}
          max={p.duration || 0}
          step={0.1}
          value={p.time}
          onChange={(e) => p.seek(Number(e.target.value))}
          aria-label="Posição do audiobook"
          aria-valuetext={`${formatTime(p.time)} de ${formatTime(p.duration)}`}
          style={{ '--pct': `${pct}%` }}
        />
        <span className="player__time" aria-hidden="true">{formatTime(p.duration)}</span>
      </div>

      <button className="icon-btn icon-btn--sm player__close" onClick={p.stop} aria-label="Fechar player">
        <Icon.Close width={16} height={16} />
      </button>

      {p.error && <p className="player__error" role="alert">{p.error}</p>}
    </section>
  );
}

