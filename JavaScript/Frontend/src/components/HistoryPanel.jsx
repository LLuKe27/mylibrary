import { useCallback } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { relativeTime } from '../lib/utils.js';
import { Icon } from './Icons.jsx';

const ACTION = {
  view: { label: 'Visualizado', icon: Icon.Eye },
  read: { label: 'Lido', icon: Icon.Book },
  listen: { label: 'Ouvido', icon: Icon.Headphones },
};

export function HistoryPanel({ items, onClose, onOpen, onClear, onRemove }) {
  const escape = useCallback(() => onClose(), [onClose]);
  const ref = useFocusTrap(true, escape);

  return (
    <>
      <div className="popover-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} id="history-panel" className="popover glass-strong" role="dialog" aria-label="Histórico">
        <div className="popover__head">
          <h2>Histórico</h2>
          <button className="btn btn--ghost btn--sm" onClick={onClear} disabled={!items.length}>Limpar</button>
        </div>
        {items.length === 0 ? (
          <p className="empty">Nada por aqui ainda. Abra, leia ou ouça um livro.</p>
        ) : (
          <ul className="history-list" role="list">
            {items.map((e) => {
              const A = ACTION[e.action] ?? ACTION.view;
              return (
                <li key={`${e.bookId}-${e.action}`} className="history-item">
                  <button className="history-item__main" onClick={() => onOpen(e.bookId)}>
                    <span className="history-item__icon"><A.icon width={16} height={16} /></span>
                    <span className="history-item__text">
                      <strong>{e.title}</strong>
                      <small>{A.label} · {relativeTime(e.at)}</small>
                    </span>
                  </button>
                  <button className="icon-btn icon-btn--sm" onClick={() => onRemove(e.bookId)} aria-label={`Excluir ${e.title} do histórico`}>
                    <Icon.Close width={14} height={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

