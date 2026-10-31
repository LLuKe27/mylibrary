import { useFocusTrap } from '../hooks/useFocusTrap.js';

const SHORTCUTS = [
  ['/', 'Focar a busca'],
  ['Espaço', 'Reproduzir / pausar audiobook'],
  ['← / →', 'Voltar / avançar 15s (ou virar página no leitor)'],
  ['[ / ]', 'Diminuir / aumentar velocidade'],
  ['H', 'Abrir histórico'],
  ['T', 'Alternar tema (escuro / claro / alto contraste)'],
  ['Esc', 'Fechar janela ou painel'],
  ['?', 'Mostrar esta ajuda'],
];

export function ShortcutsHelp({ onClose }) {
  const ref = useFocusTrap(true, onClose);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="sheet glass-strong" role="dialog" aria-modal="true" aria-labelledby="sc-title">
        <h2 id="sc-title">Atalhos de teclado</h2>
        <dl className="shortcuts">
          {SHORTCUTS.map(([k, d]) => (
            <div key={k}><dt><kbd>{k}</kbd></dt><dd>{d}</dd></div>
          ))}
        </dl>
        <button className="btn btn--block" onClick={onClose} data-autofocus>Entendi</button>
      </div>
    </div>
  );
}

