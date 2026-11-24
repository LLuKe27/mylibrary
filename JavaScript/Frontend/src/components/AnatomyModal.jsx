import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { FeaturesBento } from './FeaturesBento.jsx';
import { Icon } from './Icons.jsx';
import { ScriptsMiniIde } from './ScriptsMiniIde.jsx';

export function AnatomyModal({ onClose }) {
  const [view, setView] = useState('overview');
  const [activePage, setActivePage] = useState('features');

  const escapeRef = useRef(null);
  escapeRef.current = () => (view === 'features-scripts' ? setView('overview') : onClose());
  const handleEscape = useCallback(() => escapeRef.current?.(), []);
  const trapRef = useFocusTrap(true, handleEscape);

  const backBtnRef = useRef(null);
  const scriptsCardRef = useRef(null);
  const featuresTabRef = useRef(null);
  const scriptsTabRef = useRef(null);
  const prevViewRef = useRef(view);

  useEffect(() => {
    if (prevViewRef.current === view) return;
    prevViewRef.current = view;
    if (view === 'features-scripts') {
      backBtnRef.current?.focus();
    } else {
      scriptsCardRef.current?.focus();
    }
  }, [view]);

  const openFeaturesAndScripts = () => {
    setActivePage('features');
    setView('features-scripts');
  };

  const handleSwitchKeyDown = (e) => {
    let next = null;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      next = activePage === 'features' ? 'scripts' : 'features';
    } else if (e.key === 'Home') {
      next = 'features';
    } else if (e.key === 'End') {
      next = 'scripts';
    }
    if (!next) return;
    e.preventDefault();
    setActivePage(next);
    (next === 'features' ? featuresTabRef : scriptsTabRef).current?.focus();
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={trapRef}
        className="anatomy-modal"
        role="dialog"
        aria-modal="true"
        aria-label={view === 'features-scripts' ? 'Features & Scripts — Arquitetura do Projeto' : 'Anatomy — Arquitetura do Projeto'}
      >
        <div className={`anatomy-modal__top ${view === 'features-scripts' ? 'anatomy-modal__top--subview' : ''}`}>
          <button
            className="anatomy-modal__close"
            onClick={onClose}
            aria-label="Fechar janela Anatomy (Esc)"
            title="Fechar (Esc)"
            data-autofocus=""
          />
          {view === 'features-scripts' && (
            <>
              <button
                ref={backBtnRef}
                type="button"
                className="anatomy-back-btn"
                onClick={() => setView('overview')}
                aria-label="Voltar para Anatomy"
              >
                <Icon.ChevronLeft width={15} height={15} />
                <span>Anatomy</span>
              </button>
              <span className="anatomy-subview-title">Features &amp; Scripts</span>
              <div
                className="anatomy-switch"
                role="tablist"
                aria-label="Alternar entre Features e Scripts"
                onKeyDown={handleSwitchKeyDown}
              >
                <button
                  ref={featuresTabRef}
                  id="tab-features"
                  type="button"
                  role="tab"
                  aria-selected={activePage === 'features'}
                  aria-controls="panel-features-scripts"
                  tabIndex={activePage === 'features' ? 0 : -1}
                  className={`anatomy-switch__btn ${activePage === 'features' ? 'is-active' : ''}`}
                  onClick={() => setActivePage('features')}
                >
                  Features
                </button>
                <button
                  ref={scriptsTabRef}
                  id="tab-scripts"
                  type="button"
                  role="tab"
                  aria-selected={activePage === 'scripts'}
                  aria-controls="panel-features-scripts"
                  tabIndex={activePage === 'scripts' ? 0 : -1}
                  className={`anatomy-switch__btn ${activePage === 'scripts' ? 'is-active' : ''}`}
                  onClick={() => setActivePage('scripts')}
                >
                  Scripts
                </button>
              </div>
            </>
          )}
        </div>

        {view === 'overview' ? (
          <div className="anatomy-bento">
            <div className="anatomy-bento__col anatomy-bento__col--left">
              <button
                ref={scriptsCardRef}
                type="button"
                className="anatomy-card anatomy-card--scripts anatomy-card--interactive"
                onClick={openFeaturesAndScripts}
                aria-label="Abrir Features & Scripts"
              >
                <span className="anatomy-card__scripts-title">&lt;/&gt; Features &amp; Scripts</span>
                <span className="anatomy-card__scripts-hint">Explorar interface e código →</span>
              </button>
              <div className="anatomy-card--stack">
                <img src="/anatomy/javareactnextlogo.svg" alt="JavaScript, React JS e Next.js" width="406" height="222" decoding="async" />
              </div>
            </div>

            <div className="anatomy-bento__col anatomy-bento__col--center">
              <div className="anatomy-card--sparql">
                <div className="anatomy-card__sparql-top">
                  <img src="/anatomy/sparql-logo.svg" alt="SparQL" width="359" height="238" decoding="async" />
                </div>
                <div className="anatomy-card__sparql-body">
                  <p>
                    É uma linguagem de consulta padronizada pela <u>W3C</u> para recuperar e manipular dados
                    armazenados no formato <u>RDF</u> (Resource Description Framework) em bancos de dados de
                    grafos e na Web Semântica
                  </p>
                </div>
              </div>
            </div>

            <div className="anatomy-bento__col anatomy-bento__col--right">
              <div className="anatomy-card anatomy-card--feature">
                <img className="anatomy-card__icon" src="/anatomy/apilogo.svg" alt="" width="110" height="111" decoding="async" />
                <img className="anatomy-card__label anatomy-card__label--api" src="/anatomy/api-title.svg" alt="API" width="67" height="35" decoding="async" />
              </div>
              <div className="anatomy-card anatomy-card--feature">
                <img className="anatomy-card__icon" src="/anatomy/grafologo.svg" alt="" width="110" height="110" decoding="async" />
                <img className="anatomy-card__label anatomy-card__label--grafos" src="/anatomy/grafos-title.svg" alt="Grafos" width="107" height="28" decoding="async" />
              </div>
            </div>
          </div>
        ) : (
          <div
            id="panel-features-scripts"
            className="anatomy-subview"
            role="tabpanel"
            aria-labelledby={activePage === 'features' ? 'tab-features' : 'tab-scripts'}
          >
            {activePage === 'features' ? <FeaturesBento /> : <ScriptsMiniIde />}
          </div>
        )}
      </div>
    </div>
  );
}
