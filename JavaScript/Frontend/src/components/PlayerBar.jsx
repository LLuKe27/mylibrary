import { memo } from 'react';
import { usePlayer, usePlayerTime } from '../context/PlayerContext.jsx';
import { formatTime } from '../lib/utils.js';
import { BookCover } from './BookCover.jsx';
import { Icon } from './Icons.jsx';

const PlayerProgress = memo(function PlayerProgress({ duration, onSeek }) {
  const time = usePlayerTime();
  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div className="player__progress">
      <span className="player__time" aria-hidden="true">{formatTime(time)}</span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={time}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Posição do audiobook"
        aria-valuetext={`${formatTime(time)} de ${formatTime(duration)}`}
        style={{ '--pct': `${pct}%` }}
      />
      <span className="player__time" aria-hidden="true">{formatTime(duration)}</span>
    </div>
  );
});

/** Barra do player de audiobook integrada com Web Speech API (SpeechSynthesis + comandos de voz). */
export const PlayerBar = memo(function PlayerBar({ onOpenBook }) {
  const p = usePlayer();
  if (!p.book) return null;

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

      <PlayerProgress duration={p.duration} onSeek={p.seek} />

      {p.speechSupported && (
        <div className="player__speech" role="group" aria-label="Narração via Web Speech API">
          <button
            type="button"
            className={`speech-pill ${p.narration ? 'is-active' : ''}`}
            onClick={p.toggleNarration}
            aria-pressed={p.narration}
            title="Ativar/desativar narração do texto via Web Speech API"
          >
            {p.narration ? <Icon.Volume width={14} height={14} /> : <Icon.VolumeOff width={14} height={14} />}
            <span>Voz {p.narration ? (p.speaking ? 'lendo' : 'ativa') : 'off'}</span>
          </button>

          {p.narration && p.voices.length > 0 && (
            <label className="speech-voice">
              <span className="sr-only">Troca de voz</span>
              <select
                value={p.selectedVoiceURI}
                onChange={(e) => p.setVoice(e.target.value)}
                aria-label="Selecionar voz da narração"
              >
                {p.voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name.replace(/Microsoft |Google /g, '')} ({v.lang})
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      <button className="icon-btn icon-btn--sm player__close" onClick={p.stop} aria-label="Fechar player">
        <Icon.Close width={16} height={16} />
      </button>

      {p.error && <p className="player__error" role="alert">{p.error}</p>}
    </section>
  );
});
