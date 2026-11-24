import { DEMO_ABOUT_BOOK } from '../lib/anatomyScripts.js';
import { BookCover } from './BookCover.jsx';
import { Icon } from './Icons.jsx';

/**
 * Vitrine em Bento Grid com 5 elementos visuais demonstrativos da biblioteca.
 * Todos os controles internos são puramente ilustrativos e não alteram estado real.
 */
export function FeaturesBento() {
  return (
    <div className="features-bento" aria-label="Elementos visuais da biblioteca">
      <section className="features-card features-card--about" aria-label="Screen: About book">
        <span className="features-card__tag">Screen · About book</span>
        <div className="features-card__preview features-about" aria-hidden="true">
          <div className="features-about__chrome">
            <span className="features-dot features-dot--red" />
            <span className="features-dot features-dot--amber" />
            <span className="features-dot features-dot--green" />
          </div>
          <div className="features-about__body">
            <div className="features-about__cover">
              <BookCover book={DEMO_ABOUT_BOOK} decorative />
            </div>
            <div className="features-about__info">
              <div className="features-about__panel">
                <p className="eyebrow">{DEMO_ABOUT_BOOK.genre.label}</p>
                <h3 className="features-about__title">{DEMO_ABOUT_BOOK.title}</h3>
                <dl className="features-about__meta">
                  <div>
                    <dt>Autoria</dt>
                    <dd>{DEMO_ABOUT_BOOK.author.name}</dd>
                  </div>
                  <div>
                    <dt>Ano</dt>
                    <dd>{DEMO_ABOUT_BOOK.year}</dd>
                  </div>
                  <div>
                    <dt>Páginas</dt>
                    <dd>{DEMO_ABOUT_BOOK.pages}</dd>
                  </div>
                </dl>
              </div>
              <div className="features-about__panel">
                <p className="features-about__synopsis">{DEMO_ABOUT_BOOK.synopsis}</p>
                <span className="features-about__rdf">
                  <Icon.Code width={12} height={12} /> Recurso RDF
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-card features-card--segmented" aria-label="Container: Ler e Ouvir">
        <span className="features-card__tag">Ler & Ouvir</span>
        <div className="features-card__preview features-card__center" aria-hidden="true">
          <div className="segmented">
            <span className="segmented__btn">
              <Icon.Book width={15} height={15} /> LER
            </span>
            <span className="segmented__btn">
              <Icon.Headphones width={15} height={15} /> OUVIR
            </span>
          </div>
        </div>
      </section>

      <section className="features-card features-card--theme" aria-label="Button: Theme">
        <span className="features-card__tag">Theme</span>
        <div className="features-card__preview features-card__center features-theme-preview" aria-hidden="true">
          <span className="icon-btn">
            <Icon.Moon width={18} height={18} />
          </span>
          <span className="features-mini-pills">
            <span><Icon.Moon width={12} height={12} /> Escuro</span>
            <span><Icon.Sun width={12} height={12} /> Claro</span>
            <span><Icon.Contrast width={12} height={12} /> Contraste</span>
          </span>
        </div>
      </section>

      <section className="features-card features-card--recents" aria-label="Button: Recents">
        <span className="features-card__tag">Recents</span>
        <div className="features-card__preview features-card__center features-recents-preview" aria-hidden="true">
          <span className="icon-btn icon-btn--strong">
            <Icon.History width={22} height={22} />
          </span>
          <span className="features-recent-pill">
            <strong>Dom Casmurro</strong>
            <small>Visualizado · recente</small>
          </span>
        </div>
      </section>

      <section className="features-card features-card--filter" aria-label="Button: Filter">
        <span className="features-card__tag">Filter</span>
        <div className="features-card__preview features-card__center" aria-hidden="true">
          <span className="filter-toggle-btn">
            <Icon.Filter width={14} height={14} />
            <span>Filtros</span>
            <span className="chip__count">2</span>
          </span>
        </div>
      </section>
    </div>
  );
}
