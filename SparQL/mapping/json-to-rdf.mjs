/**
 * Mapeamento JSON -> RDF da Biblioteca Digital Semântica.
 *
 * Os arquivos JSON em ../data funcionam como "banco de dados" editável.
 * Este módulo os converte em triplas RDF (vocabulários Dublin Core, Schema.org,
 * FOAF e SKOS) que são carregadas em um store SPARQL 1.1 pelo backend Next.js
 * e também serializadas em Turtle pelo script ../scripts/build-ttl.mjs.
 *
 * Formato de tripla: [sujeitoIRI, predicadoIRI, objeto]
 *   objeto = { iri: string } | { value: string, lang?: string, datatype?: string }
 */

export const NS = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  dct: 'http://purl.org/dc/terms/',
  schema: 'https://schema.org/',
  foaf: 'http://xmlns.com/foaf/0.1/',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  lib: 'https://biblioteca.grupo9.example/ontology#',
  res: 'https://biblioteca.grupo9.example/resource/',
};

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const iri = {
  book: (slug) => `${NS.res}book/${slug}`,
  author: (slug) => `${NS.res}author/${slug}`,
  genre: (slug) => `${NS.res}genre/${slug}`,
  audio: (slug) => `${NS.res}audio/${slug}`,
};

/** Remove acentos e converte para minúsculas (busca tolerante). */
export function normalize(text = '') {
  return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

const lit = (value, lang) => ({ value: String(value), ...(lang ? { lang } : {}) });
const typed = (value, xsdType) => ({ value: String(value), datatype: NS.xsd + xsdType });
const ref = (value) => ({ iri: value });

/**
 * Valida o banco JSON. Retorna lista de avisos (não interrompe a carga),
 * para que campos ausentes sejam sinalizados em vez de falharem em silêncio.
 */
export function validateDb({ books = [], authors = [], genres = [] }) {
  const warnings = [];
  const authorIds = new Set(authors.map((a) => a.id));
  const genreIds = new Set(genres.map((g) => g.id));
  for (const a of authors) {
    if (!a.id || !SLUG_RE.test(a.id)) warnings.push(`Autor com id inválido: ${JSON.stringify(a.id)}`);
    if (!a.name) warnings.push(`Autor ${a.id}: campo "name" ausente`);
  }
  for (const g of genres) {
    if (!g.id || !SLUG_RE.test(g.id)) warnings.push(`Gênero com id inválido: ${JSON.stringify(g.id)}`);
    if (!g.label) warnings.push(`Gênero ${g.id}: campo "label" ausente`);
  }
  for (const b of books) {
    if (!b.id || !SLUG_RE.test(b.id)) warnings.push(`Livro com id inválido: ${JSON.stringify(b.id)}`);
    for (const field of ['title', 'authorId', 'genreId', 'synopsis']) {
      if (!b[field]) warnings.push(`Livro ${b.id}: campo essencial "${field}" ausente`);
    }
    if (b.authorId && !authorIds.has(b.authorId)) warnings.push(`Livro ${b.id}: autor "${b.authorId}" não existe`);
    if (b.genreId && !genreIds.has(b.genreId)) warnings.push(`Livro ${b.id}: gênero "${b.genreId}" não existe`);
  }
  return warnings;
}

export function toTriples({ books = [], authors = [], genres = [] }) {
  const t = [];
  const add = (s, p, o) => t.push([s, p, o]);
  const authorById = new Map(authors.map((a) => [a.id, a]));
  const genreById = new Map(genres.map((g) => [g.id, g]));

  for (const a of authors) {
    if (!a.id || !SLUG_RE.test(a.id)) continue;
    const s = iri.author(a.id);
    add(s, NS.rdf + 'type', ref(NS.foaf + 'Person'));
    add(s, NS.rdf + 'type', ref(NS.schema + 'Person'));
    add(s, NS.lib + 'slug', lit(a.id));
    if (a.name) add(s, NS.foaf + 'name', lit(a.name));
    if (a.nationality) add(s, NS.schema + 'nationality', lit(a.nationality, 'pt'));
    if (a.birthYear) add(s, NS.schema + 'birthDate', typed(a.birthYear, 'gYear'));
    if (a.deathYear) add(s, NS.schema + 'deathDate', typed(a.deathYear, 'gYear'));
  }

  for (const g of genres) {
    if (!g.id || !SLUG_RE.test(g.id)) continue;
    const s = iri.genre(g.id);
    add(s, NS.rdf + 'type', ref(NS.skos + 'Concept'));
    add(s, NS.lib + 'slug', lit(g.id));
    if (g.label) add(s, NS.skos + 'prefLabel', lit(g.label, 'pt'));
    if (g.description) add(s, NS.skos + 'definition', lit(g.description, 'pt'));
  }

  for (const b of books) {
    if (!b.id || !SLUG_RE.test(b.id)) continue;
    const s = iri.book(b.id);
    add(s, NS.rdf + 'type', ref(NS.schema + 'Book'));
    add(s, NS.lib + 'slug', lit(b.id));
    if (b.title) add(s, NS.dct + 'title', lit(b.title, 'pt'));
    if (b.authorId && authorById.has(b.authorId)) add(s, NS.dct + 'creator', ref(iri.author(b.authorId)));
    if (b.genreId && genreById.has(b.genreId)) add(s, NS.schema + 'genre', ref(iri.genre(b.genreId)));
    if (b.year) add(s, NS.dct + 'issued', typed(b.year, 'gYear'));
    if (b.pages) add(s, NS.schema + 'numberOfPages', typed(b.pages, 'integer'));
    if (b.synopsis) add(s, NS.schema + 'abstract', lit(b.synopsis, 'pt'));
    if (b.cover?.palette?.length) add(s, NS.lib + 'coverPalette', lit(b.cover.palette.join(',')));
    if (b.cover?.motif) add(s, NS.lib + 'coverMotif', lit(b.cover.motif));

    // Texto normalizado para busca tolerante a acentos.
    const author = authorById.get(b.authorId);
    const genre = genreById.get(b.genreId);
    add(s, NS.lib + 'searchText', lit(normalize([b.title, author?.name, genre?.label].filter(Boolean).join(' '))));

    // Audiobook (schema:AudioObject)
    const audio = iri.audio(b.id);
    add(s, NS.schema + 'audio', ref(audio));
    add(audio, NS.rdf + 'type', ref(NS.schema + 'AudioObject'));
    add(audio, NS.schema + 'contentUrl', lit(`/api/audio/${b.id}`));
    add(audio, NS.schema + 'encodingFormat', lit('audio/wav'));
    add(audio, NS.schema + 'duration', typed(`PT${b.durationSeconds || 90}S`, 'duration'));
  }
  return t;
}

/* ---------- Serialização Turtle ---------- */

const PREFIX_ORDER = ['rdf', 'rdfs', 'xsd', 'dct', 'schema', 'foaf', 'skos', 'lib', 'res'];

function compact(value) {
  for (const p of PREFIX_ORDER) {
    const base = NS[p];
    if (value.startsWith(base)) {
      const local = value.slice(base.length);
      if (/^[A-Za-z_][\w-]*$/.test(local)) return `${p}:${local}`;
    }
  }
  return `<${value}>`;
}

function escapeLiteral(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

function termToTurtle(o) {
  if (o.iri) return compact(o.iri);
  const body = `"${escapeLiteral(o.value)}"`;
  if (o.lang) return `${body}@${o.lang}`;
  if (o.datatype) return `${body}^^${compact(o.datatype)}`;
  return body;
}

export function toTurtle(triples) {
  const lines = PREFIX_ORDER.map((p) => `@prefix ${p}: <${NS[p]}> .`);
  lines.push('');
  const bySubject = new Map();
  for (const [s, p, o] of triples) {
    if (!bySubject.has(s)) bySubject.set(s, []);
    bySubject.get(s).push([p, o]);
  }
  for (const [s, pos] of bySubject) {
    const body = pos.map(([p, o]) => {
      const pred = p === NS.rdf + 'type' ? 'a' : compact(p);
      return `    ${pred} ${termToTurtle(o)}`;
    });
    lines.push(`${compact(s)}\n${body.join(' ;\n')} .\n`);
  }
  return lines.join('\n');
}

