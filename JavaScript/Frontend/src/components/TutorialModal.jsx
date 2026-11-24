import { useCallback, useRef, useState } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { Icon } from './Icons.jsx';

const CHAPTERS = [
  { time: 0, label: '1. Busca & SPARQL' },
  { time: 6.1, label: '2. RDF, JSON-LD & Leitor' },
  { time: 12.3, label: '3. Audiobook + Web Speech' },
  { time: 18.3, label: '4. Temas & Histórico' },
];

/**
 * Screen centralizada com vídeo-tutorial do sistema (<video> + <track>)
 * exibida automaticamente para novos usuários identificados via ID Único.
 */
export function TutorialModal({ visitor, onClose, onComplete, onSimulateNewUser }) {
  const videoRef = useRef(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const handleEscape = useCallback(() => onClose(), [onClose]);
  const trapRef = useFocusTrap(true, handleEscape);

  const jumpTo = (time, idx) => {
    setActiveChapter(idx);
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = time;
    v.play().catch(() => {});
  };

  const handleTimeUpdate = () => {
    const t = videoRef.current?.currentTime ?? 0;
    let current = 0;
    for (let i = 0; i < CHAPTERS.length; i++) {
      if (t >= CHAPTERS[i].time) current = i;
    }
    setActiveChapter(current);
  };

  const shortId = visitor?.visitorId ? `${visitor.visitorId.slice(0, 8)}…${visitor.visitorId.slice(-4)}` : 'local';

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={trapRef}
        className="tutorial-modal glass-strong"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
      >
        <div className="tutorial-modal__head">
          <div className="tutorial-modal__title-wrap">
            <span className="eyebrow">
              {visitor?.isNewUser ? 'Bem-vindo · Primeiro acesso' : `Guia do sistema · Acesso #${visitor?.visitCount ?? 1}`}
            </span>
            <h2 id="tutorial-title" className="tutorial-modal__title">Como usar a My Library</h2>
          </div>

          <div className="tutorial-modal__head-right">
            <span
              className="visitor-badge"
              title={visitor?.visitorId ? `ID Único do visitante: ${visitor.visitorId}` : 'Visitante local'}
            >
              ID Único: <code>{shortId}</code>
            </span>
            <button
              type="button"
              className="icon-btn icon-btn--sm"
              onClick={onClose}
              aria-label="Fechar tutorial (Esc)"
              title="Fechar (Esc)"
            >
              <Icon.Close width={16} height={16} />
            </button>
          </div>
        </div>

        <div className="tutorial-stage">
          <video
            ref={videoRef}
            className="tutorial-video"
            controls
            playsInline
            preload="metadata"
            poster="/tutorial/poster.png"
            onTimeUpdate={handleTimeUpdate}
            aria-label="Vídeo tutorial mostrando como utilizar a My Library"
          >
            <source src="/tutorial/tutorial.webm" type="video/webm" />
            <track
              kind="captions"
              src="/tutorial/tutorial.vtt"
              srcLang="pt-BR"
              label="Português (Brasil)"
              default
            />
            Seu navegador não suporta a reprodução de vídeo HTML5.
          </video>
        </div>

        <div className="tutorial-chapters" role="group" aria-label="Capítulos do tutorial">
          {CHAPTERS.map((ch, idx) => (
            <button
              key={ch.label}
              type="button"
              className={`chip ${activeChapter === idx ? 'is-active' : ''}`}
              onClick={() => jumpTo(ch.time, idx)}
            >
              {ch.label}
            </button>
          ))}
        </div>

        <div className="tutorial-modal__foot">
          <p className="tutorial-modal__note">
            Este guia é exibido automaticamente no primeiro acesso (identificado pelo seu ID Único). Você pode reabri-lo a qualquer momento pelo botão <strong>Tutorial</strong> no topo.
          </p>
          <div className="tutorial-modal__actions">
            {onSimulateNewUser && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={onSimulateNewUser}
                title="Gerar um novo ID Único de visitante para demonstrar o fluxo de primeiro acesso"
              >
                Novo ID de teste
              </button>
            )}
            <button
              type="button"
              className="btn"
              onClick={onComplete}
              data-autofocus=""
            >
              Entendi, começar a explorar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
