import { useEffect, useRef, useState } from 'react';
import { ANATOMY_SCRIPTS, IDE_FOLDER_NAME, tokenizeLine } from '../lib/anatomyScripts.js';
import { Icon } from './Icons.jsx';

const EXT_LABELS = {
  sparql: 'RQ',
  turtle: 'TTL',
  js: 'JS',
};

/**
 * Mini IDE simulada exibindo uma pasta fictícia com trechos demonstrativos
 * de SPARQL, Turtle (library.ttl) e conversão JSON -> RDF.
 */
export function ScriptsMiniIde() {
  const [activeId, setActiveId] = useState(ANATOMY_SCRIPTS[0].id);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);
  const mountedRef = useRef(false);
  const fileRefs = useRef({});

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
    };
  }, []);

  const active = ANATOMY_SCRIPTS.find((s) => s.id === activeId) ?? ANATOMY_SCRIPTS[0];
  const lines = active.code.split('\n');

  const handleSelect = (id) => {
    setActiveId(id);
    setCopied(false);
  };

  const handleFileKeyDown = (e, index) => {
    const total = ANATOMY_SCRIPTS.length;
    let nextIdx = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nextIdx = (index + 1) % total;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') nextIdx = (index - 1 + total) % total;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = total - 1;
    if (nextIdx === null) return;

    e.preventDefault();
    const nextId = ANATOMY_SCRIPTS[nextIdx].id;
    handleSelect(nextId);
    fileRefs.current[nextId]?.focus();
  };

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) return;
      await navigator.clipboard.writeText(active.code);
      if (!mountedRef.current) return;
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) setCopied(false);
      }, 1600);
    } catch {
      // Clipboard pode estar indisponível em contextos sem permissão
    }
  };

  return (
    <div className="mini-ide" aria-label="Mini IDE demonstrativa dos scripts semânticos">
      <div className="mini-ide__topbar">
        <div className="mini-ide__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="mini-ide__path">
          {IDE_FOLDER_NAME} / {active.filename}
        </span>
        <span className="mini-ide__badge">{active.badge}</span>
      </div>

      <div className="mini-ide__workspace">
        <aside className="mini-ide__sidebar" aria-label="Explorador de arquivos">
          <div className="mini-ide__folder">
            <Icon.Code width={13} height={13} />
            <span>{IDE_FOLDER_NAME}/</span>
          </div>
          <div className="mini-ide__files" role="tablist" aria-label="Arquivos demonstrativos">
            {ANATOMY_SCRIPTS.map((script, index) => {
              const isSelected = script.id === active.id;
              return (
                <button
                  key={script.id}
                  ref={(el) => {
                    fileRefs.current[script.id] = el;
                  }}
                  id={`ide-tab-${script.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="ide-tabpanel"
                  tabIndex={isSelected ? 0 : -1}
                  className={`mini-ide__file ${isSelected ? 'is-active' : ''}`}
                  onClick={() => handleSelect(script.id)}
                  onKeyDown={(e) => handleFileKeyDown(e, index)}
                >
                  <span className="mini-ide__ext">{EXT_LABELS[script.language] ?? 'FILE'}</span>
                  <span className="mini-ide__filename">{script.filename}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="mini-ide__editor">
          <div className="mini-ide__tabs">
            <span className="mini-ide__active-tab">
              <span className="mini-ide__ext">{EXT_LABELS[active.language] ?? 'FILE'}</span>
              {active.filename}
            </span>
            <button
              type="button"
              className="mini-ide__copy"
              onClick={handleCopy}
              aria-label={`Copiar código de ${active.filename}`}
            >
              {copied ? 'Copiado ✓' : 'Copiar'}
            </button>
          </div>

          <div
            id="ide-tabpanel"
            className="mini-ide__panel"
            role="tabpanel"
            aria-labelledby={`ide-tab-${active.id}`}
          >
            <p className="mini-ide__reason">{active.reason}</p>

            <div className="mini-ide__code" tabIndex={0} aria-label={`Código de ${active.filename}`}>
            <pre>
              <code>
                {lines.map((line, i) => (
                  <span key={i} className="mini-ide__line">
                    <span className="mini-ide__ln" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="mini-ide__lc">
                      {tokenizeLine(line, active.language).map((tok, j) =>
                        tok.type === 'plain' ? (
                          tok.text
                        ) : (
                          <span key={j} className={`tok-${tok.type}`}>
                            {tok.text}
                          </span>
                        ),
                      )}
                      {line === '' ? ' ' : null}
                    </span>
                  </span>
                ))}
              </code>
            </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
