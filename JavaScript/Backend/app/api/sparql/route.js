import { getGraph, rowsToJson } from '@/lib/graph.js';
import { error, handle, json } from '@/lib/http.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const READ_ONLY = /^\s*(?:(?:PREFIX|BASE)\s[^\n]*\n|#[^\n]*\n|\s)*(SELECT|ASK|CONSTRUCT|DESCRIBE)\b/i;

/**
 * Endpoint SPARQL 1.1 somente leitura.
 * POST body: texto da consulta (Content-Type: application/sparql-query)
 *        ou JSON { "query": "..." }.
 * GET  ?query=...
 */
async function execute(query) {
  if (!query || typeof query !== 'string') return error(400, 'Informe a consulta SPARQL');
  if (query.length > 10_000) return error(413, 'Consulta muito longa');
  if (!READ_ONLY.test(query)) return error(400, 'Apenas SELECT, ASK, CONSTRUCT e DESCRIBE são permitidos');
  const { store } = await getGraph();
  const started = performance.now();
  try {
    const results = rowsToJson(store.query(query));
    return json({ ms: +(performance.now() - started).toFixed(2), results });
  } catch (e) {
    return error(400, `Erro de sintaxe SPARQL: ${e.message || e}`);
  }
}

export const GET = handle(async (req) => execute(req.nextUrl.searchParams.get('query')));

export const POST = handle(async (req) => {
  const type = req.headers.get('content-type') || '';
  const query = type.includes('application/json') ? (await req.json().catch(() => ({}))).query : await req.text();
  return execute(query);
});

