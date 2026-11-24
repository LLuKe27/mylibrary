import { memo } from 'react';
import { Glass } from 'glisse';
import { Icon } from './Icons.jsx';

const THEME_META = {
  dark: { icon: Icon.Moon, next: 'claro' },
  light: { icon: Icon.Sun, next: 'alto contraste' },
  contrast: { icon: Icon.Contrast, next: 'escuro' },
};

const ANATOMY_GLASS_STYLE = {
  '--lg-glass-bend': 0.42,
  '--lg-glass-dispersion': 0.85,
  '--lg-blur': '12px',
  '--lg-rim-shine': 0.82,
};

const ANATOMY_ASSETS = [
  '/anatomy/javareactnextlogo.svg',
  '/anatomy/sparql-logo.svg',
  '/anatomy/apilogo.svg',
  '/anatomy/grafologo.svg',
  '/anatomy/api-title.svg',
  '/anatomy/grafos-title.svg',
];

let anatomyPreloaded = false;
function preloadAnatomyAssets() {
  if (anatomyPreloaded || typeof window === 'undefined') return;
  anatomyPreloaded = true;
  for (const src of ANATOMY_ASSETS) {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  }
}

export const Header = memo(function Header({
  theme,
  onCycleTheme,
  historyOpen,
  onToggleHistory,
  onShowShortcuts,
  anatomyOpen,
  onToggleAnatomy,
  tutorialOpen,
  onOpenTutorial,
}) {
  const ThemeIcon = THEME_META[theme].icon;
  return (
    <header className="app-header glass">
      <a className="brand" href="/" aria-label="My Library — início">
        <img src="/logo.svg" alt="" width="52" height="52" />
        <span className="brand__title">My Library</span>
      </a>
      <div className="header-actions">
        <Glass
          className="anatomy-btn"
          role="button"
          tabIndex={0}
          aria-label="Anatomy"
          aria-expanded={anatomyOpen}
          aria-haspopup="dialog"
          onMouseEnter={preloadAnatomyAssets}
          onFocus={preloadAnatomyAssets}
          onClick={onToggleAnatomy}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleAnatomy?.();
            }
          }}
          style={ANATOMY_GLASS_STYLE}
        >
          Anatomy
        </Glass>
        <a
          className="icon-btn"
          href="https://github.com/LLuKe27/mylibrary"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Repositório no GitHub"
          title="Repositório no GitHub"
        >
          <Icon.GitHub width={20} height={20} />
        </a>
        <button
          className="icon-btn"
          onClick={onOpenTutorial}
          aria-label="Vídeo tutorial do sistema"
          aria-expanded={tutorialOpen}
          title="Vídeo tutorial do sistema"
        >
          <Icon.Video width={20} height={20} />
        </button>
        <button className="icon-btn" onClick={onShowShortcuts} aria-label="Atalhos de teclado (?)" title="Atalhos de teclado (?)">
          <Icon.Keyboard />
        </button>
        <button
          id="history-trigger"
          className="icon-btn icon-btn--strong"
          onClick={onToggleHistory}
          aria-label="Histórico (H)"
          aria-expanded={historyOpen}
          aria-controls="history-panel"
          title="Histórico (H)"
        >
          <Icon.History width={24} height={24} />
        </button>
        <button
          className="icon-btn"
          onClick={onCycleTheme}
          aria-label={`Tema atual: ${theme === 'contrast' ? 'alto contraste' : theme === 'dark' ? 'escuro' : 'claro'}. Alternar para ${THEME_META[theme].next} (T)`}
          title="Alternar tema (T)"
        >
          <ThemeIcon />
        </button>
      </div>
    </header>
  );
});


