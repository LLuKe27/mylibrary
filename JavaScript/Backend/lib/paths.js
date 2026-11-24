import { existsSync } from 'node:fs';
import path from 'node:path';

const BACKEND_DIR = existsSync(path.join(process.cwd(), 'JavaScript', 'Backend'))
  ? path.join(process.cwd(), 'JavaScript', 'Backend')
  : process.cwd();

/** Pasta da camada semântica (dados JSON, mapeamento e consultas .rq). */
export const SPARQL_DIR = process.env.SPARQL_DIR || path.resolve(BACKEND_DIR, '..', '..', 'SparQL');
export const DATA_DIR = path.join(SPARQL_DIR, 'data');
export const QUERIES_DIR = path.join(SPARQL_DIR, 'queries');
export const MAPPING_FILE = path.join(SPARQL_DIR, 'mapping', 'json-to-rdf.mjs');

/** Estado mutável do backend (histórico e visitantes) — também em JSON. */
export const STATE_DIR = path.resolve(BACKEND_DIR, 'data');
export const HISTORY_FILE = path.join(STATE_DIR, 'history.json');

