import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { BookCard, BookCardSkeleton } from './components/BookCard.jsx';
import { BookModal } from './components/BookModal.jsx';
import { Header } from './components/Header.jsx';
import { HistoryPanel } from './components/HistoryPanel.jsx';
import { Icon } from './components/Icons.jsx';
import { PlayerBar } from './components/PlayerBar.jsx';
import { ShortcutsHelp } from './components/ShortcutsHelp.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { usePlayer } from './context/PlayerContext.jsx';
import { useTheme } from './hooks/useTheme.js';
import { api } from './lib/api.js';
import { validateBook } from './lib/utils.js';

const isTyping = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
const toggleIn = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

export default function App() {
  const [theme, cycleTheme] = useTheme();
  const player = usePlayer();
  const searchRef = useRef(null);

  const [authors, setAuthors] = useState(null);
  const [genres, setGenres] = useState(null);
  const [filters, setFilters] = useState({ authors: [], genres: [] });
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const [result, setResult] = useState({ books: null, sparql: '', warnings: [] });
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Facetas (SPARQL: authors.rq / genres.rq)
  useEffect(() => {
    Promise.all([api.authors(), api.genres()])
      .then(([a, g]) => { setAuthors(a); setGenres(g); })
      .catch((e) => setError(e.message));
    api.history().then(setHistory).catch(() => {});
  }, []);

  // Busca combinada (SPARQL: books-search.rq com filtros dct:creator / schema:genre)
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      api
        .books({ ...filters, q: deferredQuery }, ctrl.signal)
        .then((d) => {
          setError(null);
          setResult({ books: d.books, sparql: d.sparql, warnings: d.warnings ?? [] });
          d.warnings?.forEach((w) => console.warn('[dados]', w));
        })
        .catch((e) => e.name !== 'AbortError' && setError(e.message));
    }, 120);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [filters, deferredQuery]);

  const incomplete = useMemo(() => {
    const map = new Map();
    result.books?.forEach((b) => map.set(b.id, validateBook(b).length > 0));
    return map;
  }, [result.books]);

  const refreshHistory = useCallback(() => api.history().then(setHistory).catch(() => {}), []);

  const openBook = useCallback(
    (book) => {
      setSelected(book);
      setHistoryOpen(false);
      api.addHistory(book.id, 'view').then(setHistory).catch(() => {});
    },
    [],
  );

  const openById = useCallback(
    async (id) => {
      const book = result.books?.find((b) => b.id === id) ?? (await api.book(id).catch(() => null));
      if (book) openBook(book);
    },
    [result.books, openBook],
  );

  const removeFromHistory = useCallback(async (id) => setHistory(await api.removeHistory(id)), []);
  const clearHistory = useCallback(async () => setHistory(await api.clearHistory()), []);
  const closeModal = useCallback(() => { setSelected(null); refreshHistory(); }, [refreshHistory]);

  // Atalhos globais de teclado
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTyping(document.activeElement)) {
        if (e.key === 'Escape') document.activeElement.blur();
        return;
      }
      const overlay = selected || helpOpen || historyOpen;
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); return; }
      if (e.key === '?') { setHelpOpen(true); return; }
      if (e.key.toLowerCase() === 't') { cycleTheme(); return; }
      if (e.key.toLowerCase() === 'h' && !selected) { setHistoryOpen((v) => !v); return; }
      if (!player.book) return;
      if (e.key === ' ' && !(document.activeElement instanceof HTMLButtonElement)) { e.preventDefault(); player.toggle(); }
      if (overlay) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); player.skip(-15); }
      if (e.key === 'ArrowRight') { e.preventDefault(); player.skip(15); }
      if (e.key === ']') player.cycleRate(1);
      if (e.key === '[') player.cycleRate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, helpOpen, historyOpen, player, cycleTheme]);

  const activeLabels = [
    ...filters.authors.map((id) => authors?.find((a) => a.id === id)?.name),
    ...filters.genres.map((id) => genres?.find((g) => g.id === id)?.label),
  ].filter(Boolean);

  const activeFilterCount = filters.authors.length + filters.genres.length + (query.trim() ? 1 : 0);

  const books = result.books;

  return (
    <>
      <a className="skip-link" href="#catalog">Pular para o catálogo</a>
      <div className="ambient" aria-hidden="true"><span /><span /><span /></div>

      <div className={`app-window ${player.book ? 'has-player' : ''}`}>
        <Header
          theme={theme}
          onCycleTheme={cycleTheme}
          historyOpen={historyOpen}
          onToggleHistory={() => setHistoryOpen((v) => !v)}
          onShowShortcuts={() => setHelpOpen(true)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
          activeFilterCount={activeFilterCount}
        />

        <div className="app-body">
          <Sidebar
            ref={searchRef}
            query={query}
            onQuery={setQuery}
            authors={authors}
            genres={genres}
            filters={filters}
            onToggleAuthor={(id) => setFilters((f) => ({ ...f, authors: toggleIn(f.authors, id) }))}
            onToggleGenre={(id) => setFilters((f) => ({ ...f, genres: toggleIn(f.genres, id) }))}
            onClear={() => { setFilters({ authors: [], genres: [] }); setQuery(''); }}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <main id="catalog" className="catalog" tabIndex={-1} aria-labelledby="catalog-title">
            <div className="catalog__head">
              <div className="catalog__title-group">
                <h1 id="catalog-title" className="catalog__title">
                  {activeLabels.length ? activeLabels.join(' · ') : 'Todo o acervo'}
                </h1>
                <p className="catalog__count" aria-live="polite">
                  {books ? `${books.length} ${books.length === 1 ? 'livro encontrado' : 'livros encontrados'}` : 'Consultando o grafo…'}
                </p>
              </div>
              <div className="catalog__head-actions">
                <button
                  className="btn btn--ghost mobile-filter-btn"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Abrir filtros"
                >
                  <Icon.Filter width={15} height={15} />
                  <span>Filtros</span>
                  {activeFilterCount > 0 && <span className="chip__count">{activeFilterCount}</span>}
                </button>
                <details className="sparql-peek">
                  <summary><Icon.Code width={14} height={14} /> SPARQL</summary>
                  <pre><code>{result.sparql || '…'}</code></pre>
                </details>
              </div>
            </div>

            {error && <p className="alert" role="alert">⚠ {error}. Verifique se o backend está rodando em http://localhost:3001.</p>}
            {result.warnings.length > 0 && (
              <p className="alert alert--warn" role="status">{result.warnings.length} aviso(s) de validação nos dados — veja o console.</p>
            )}

            <div className="grid" role="list">
              {books === null
                ? Array.from({ length: 8 }, (_, i) => <BookCardSkeleton key={i} />)
                : books.map((b) => (
                    <div role="listitem" key={b.id}>
                      <BookCard
                        book={b}
                        incomplete={incomplete.get(b.id)}
                        isCurrent={player.book?.id === b.id}
                        isPlaying={player.playing}
                        isLoading={player.loading}
                        onOpen={openBook}
                        onPlay={player.play}
                      />
                    </div>
                  ))}
            </div>

            {books?.length === 0 && (
              <div className="empty-state">
                <p>Nenhum livro corresponde aos filtros.</p>
                <button className="btn" onClick={() => { setFilters({ authors: [], genres: [] }); setQuery(''); }}>Limpar filtros</button>
              </div>
            )}
          </main>
        </div>
      </div>

      <PlayerBar onOpenBook={openBook} />

      {historyOpen && (
        <HistoryPanel
          items={history}
          onClose={() => setHistoryOpen(false)}
          onOpen={openById}
          onClear={clearHistory}
          onRemove={removeFromHistory}
        />
      )}

      {selected && (
        <BookModal
          key={selected.id}
          book={selected}
          onClose={closeModal}
          inHistory={history.some((h) => h.bookId === selected.id)}
          onRemoveFromHistory={removeFromHistory}
        />
      )}

      {helpOpen && <ShortcutsHelp onClose={() => setHelpOpen(false)} />}
    </>
  );
}

