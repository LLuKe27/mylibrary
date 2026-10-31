import { Icon } from './Icons.jsx';

const THEME_META = {
  dark: { icon: Icon.Moon, next: 'claro' },
  light: { icon: Icon.Sun, next: 'alto contraste' },
  contrast: { icon: Icon.Contrast, next: 'escuro' },
};

export function Header({ theme, onCycleTheme, historyOpen, onToggleHistory, onShowShortcuts }) {
  const ThemeIcon = THEME_META[theme].icon;
  return (
    <header className="app-header glass">
      <a className="brand" href="/" aria-label="My Library — início">
        <img src="/logo.svg" alt="" width="52" height="52" />
        <span className="brand__title">My Library</span>
      </a>
      <div className="header-actions">
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
}

