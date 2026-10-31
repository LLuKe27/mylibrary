import path from 'node:path';

/** Pasta da camada semântica (dados JSON, mapeamento e consultas .rq). */
export const SPARQL_DIR = process.env.SPARQL_DIR || path.resolve(process.cwd(), '..', '..', 'SparQL');
export const DATA_DIR = path.join(SPARQL_DIR, 'data');
export const QUERIES_DIR = path.join(SPARQL_DIR, 'queries');
export const MAPPING_FILE = path.join(SPARQL_DIR, 'mapping', 'json-to-rdf.mjs');

/** Estado mutável do backend (histórico) — também em JSON. */
export const STATE_DIR = path.resolve(process.cwd(), 'data');
export const HISTORY_FILE = path.join(STATE_DIR, 'history.json');

