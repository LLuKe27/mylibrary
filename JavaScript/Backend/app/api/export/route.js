import { getGraph } from '@/lib/graph.js';
import { handle } from '@/lib/http.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Exporta o grafo RDF atual em Turtle. */
export const GET = handle(async () => {
  const { mapping, triples } = await getGraph();
  return new Response(mapping.toTurtle(triples), {
    headers: { 'Content-Type': 'text/turtle; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
  });
});

