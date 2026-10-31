import { getGraph, loadQuery, runSelect, sparqlString } from './graph.js';

const BASE = 'https://biblioteca.grupo9.example/resource/';
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const isSlug = (s) => typeof s === 'string' && SLUG_RE.test(s);

function normalize(text = '') {
  if (text == null) return '';
  return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function shapeBook(r) {
  const palette = r.palette ? r.palette.split(',') : null;
  const duration = r.duration ? Number(/PT(\d+)S/.exec(r.duration)?.[1] ?? 0) : null;
  return {
    id: r.id,
    iri: r.book,
    title: r.title,
    year: r.year ? Number(r.year) : null,
    pages: r.pages ? Number(r.pages) : null,
    synopsis: r.synopsis ?? null,
    author: { id: r.authorId, iri: r.author, name: r.authorName },
    genre: { id: r.genreId, iri: r.genre, label: r.genreLabel },
    audio: r.audioUrl ? { url: r.audioUrl, duration } : null,
    cover: { palette, motif: r.motif ?? null },
  };
}

/**
 * Busca combinada por autoria (dct:creator), gênero (schema:genre) e texto livre.
 * Os filtros são injetados no ponto "#@FILTERS" do arquivo books-search.rq.
 */
export async function searchBooks({ author, genre, q, id } = {}) {
  const filters = [];
  if (id && isSlug(id)) {
    filters.push(`FILTER(?id = ${sparqlString(id)})`);
  }
  if (author && typeof author === 'string') {
    const ids = author.split(',').filter(isSlug);
    if (ids.length) filters.push(`FILTER(?author IN (${ids.map((a) => `<${BASE}author/${a}>`).join(', ')}))`);
  }
  if (genre && typeof genre === 'string') {
    const ids = genre.split(',').filter(isSlug);
    if (ids.length) filters.push(`FILTER(?genre IN (${ids.map((g) => `<${BASE}genre/${g}>`).join(', ')}))`);
  }
  if (q && typeof q === 'string') {
    const term = normalize(q);
    if (term) {
      for (const word of term.split(/\s+/).slice(0, 6)) {
        filters.push(`FILTER(CONTAINS(?searchText, ${sparqlString(word)}))`);
      }
    }
  }
  const template = await loadQuery('books-search');
  // Substitui apenas a linha marcadora (não as menções em comentários).
  const sparql = template.replace(/^[ \t]*#@FILTERS[ \t]*$/m, () => '  ' + filters.join('\n  '));
  const rows = await runSelect(sparql);
  return { books: rows.map(shapeBook), sparql };
}

export async function getBook(id) {
  const { books } = await searchBooks({ id });
  return books[0] ?? null;
}

export async function listAuthors() {
  const rows = await runSelect(await loadQuery('authors'));
  return rows.map((r) => ({ id: r.id, iri: r.author, name: r.name, nationality: r.nationality ?? null, books: Number(r.books) }));
}

export async function listGenres() {
  const rows = await runSelect(await loadQuery('genres'));
  return rows.map((r) => ({ id: r.id, iri: r.genre, label: r.label, description: r.description ?? null, books: Number(r.books) }));
}

/** Trechos para o leitor simulado (vêm direto do JSON, não fazem parte do grafo). */
export async function getExcerpt(id) {
  const { db } = await getGraph();
  const book = db.books.find((b) => b.id === id);
  return book ? book.excerpt ?? [] : null;
}
