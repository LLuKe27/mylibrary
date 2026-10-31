import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import oxigraph from 'oxigraph';
import { DATA_DIR, MAPPING_FILE, QUERIES_DIR } from './paths.js';

const FILES = ['books.json', 'authors.json', 'genres.json'];

let cache = null; // { signature, store, db, warnings, mapping }
let mappingModule = null;

async function loadMapping() {
  if (!mappingModule) {
    // Import nativo do Node (fora do bundler) do módulo compartilhado em /SparQL.
    mappingModule = await import(/* webpackIgnore: true */ pathToFileURL(MAPPING_FILE).href);
  }
  return mappingModule;
}

async function signature() {
  const stats = await Promise.all(FILES.map((f) => stat(path.join(DATA_DIR, f))));
  return stats.map((s) => s.mtimeMs).join('|');
}

function toTerm(o) {
  if (o.iri) return oxigraph.namedNode(o.iri);
  if (o.lang) return oxigraph.literal(o.value, o.lang);
  if (o.datatype) return oxigraph.literal(o.value, oxigraph.namedNode(o.datatype));
  return oxigraph.literal(o.value);
}

/**
 * Retorna o store RDF em memória. É reconstruído automaticamente quando
 * algum JSON do "banco de dados" é modificado (comparação de mtime).
 */
export async function getGraph() {
  const sig = await signature();
  if (cache && cache.signature === sig) return cache;

  const mapping = await loadMapping();
  const read = async (f) => JSON.parse(await readFile(path.join(DATA_DIR, f), 'utf8'));
  const [books, authors, genres] = await Promise.all(FILES.map(read));
  const db = { books, authors, genres };

  const warnings = mapping.validateDb(db);
  warnings.forEach((w) => console.warn('[dados] ⚠', w));

  const store = new oxigraph.Store();
  const triples = mapping.toTriples(db);
  for (const [s, p, o] of triples) {
    store.add(oxigraph.quad(oxigraph.namedNode(s), oxigraph.namedNode(p), toTerm(o), oxigraph.defaultGraph()));
  }
  console.log(`[sparql] grafo carregado: ${triples.length} triplas`);
  cache = { signature: sig, store, db, warnings, mapping, triples };
  return cache;
}

const queryCache = new Map();
export async function loadQuery(name) {
  if (!queryCache.has(name)) {
    queryCache.set(name, await readFile(path.join(QUERIES_DIR, `${name}.rq`), 'utf8'));
  }
  return queryCache.get(name);
}

/** Converte resultados do oxigraph para o formato SPARQL 1.1 Query Results JSON simplificado. */
export function rowsToJson(result) {
  if (typeof result === 'boolean') return { boolean: result };
  if (!Array.isArray(result)) return { result: String(result) };
  return result.map((row) => {
    const obj = {};
    if (row instanceof Map) {
      for (const [k, term] of row) obj[k] = term?.value;
    } else {
      // quads (CONSTRUCT/DESCRIBE)
      return { subject: row.subject?.value, predicate: row.predicate?.value, object: row.object?.value };
    }
    return obj;
  });
}

export async function runSelect(sparql) {
  const { store } = await getGraph();
  return rowsToJson(store.query(sparql));
}

/** Escapa uma string para literal SPARQL. */
export function sparqlString(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\n\r]/g, ' ')}"`;
}

