import { forwardRef } from 'react';
import { Icon } from './Icons.jsx';

function FacetList({ title, items, selected, onToggle, labelKey }) {
  return (
    <section className="facet glass-soft" aria-labelledby={`facet-${title}`}>
      <h2 id={`facet-${title}`} className="facet__title">{title}</h2>
      <ul className="facet__list" role="list">
        {items === null
          ? Array.from({ length: 4 }, (_, i) => <li key={i} className="skeleton skeleton--chip" />)
          : items.map((item) => {
              const active = selected.includes(item.id);
              return (
                <li key={item.id}>
                  <button className={`chip ${active ? 'is-active' : ''}`} aria-pressed={active} onClick={() => onToggle(item.id)}>
                    <span className="chip__label">{item[labelKey]}</span>
                    <span className="chip__count" aria-label={`${item.books} livros`}>{item.books}</span>
                  </button>
                </li>
              );
            })}
      </ul>
    </section>
  );
}

export const Sidebar = forwardRef(function Sidebar({ query, onQuery, authors, genres, filters, onToggleAuthor, onToggleGenre, onClear }, searchRef) {
  const hasFilters = filters.authors.length || filters.genres.length || query;
  return (
    <aside className="sidebar" aria-label="Filtros de busca">
      <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="search-input" className="sr-only">Buscar por título, autor ou gênero</label>
        <Icon.Search className="search__icon" />
        <input
          ref={searchRef}
          id="search-input"
          type="search"
          placeholder="Search"
          autoComplete="off"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
        <kbd className="search__kbd" aria-hidden="true">/</kbd>
      </form>

      <FacetList title="Autores" items={authors} selected={filters.authors} onToggle={onToggleAuthor} labelKey="name" />
      <FacetList title="Gêneros" items={genres} selected={filters.genres} onToggle={onToggleGenre} labelKey="label" />

      {hasFilters ? (
        <button className="btn btn--ghost btn--block" onClick={onClear}>Limpar filtros</button>
      ) : null}
    </aside>
  );
});

