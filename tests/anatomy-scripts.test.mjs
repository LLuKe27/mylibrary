import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { IDE_FOLDER_NAME, DEMO_ABOUT_BOOK, ANATOMY_SCRIPTS, tokenizeLine } from '../JavaScript/Frontend/src/lib/anatomyScripts.js';

const require = createRequire(new URL('../JavaScript/Backend/package.json', import.meta.url));
const oxigraph = require('oxigraph');

test('exporta pasta ficticia e os 3 scripts demonstrativos esperados', () => {
  assert.equal(IDE_FOLDER_NAME, 'my-library-semantic');
  assert.deepEqual(ANATOMY_SCRIPTS.map((s) => s.filename), ['query.rq', 'library.ttl', 'json-to-rdf.mjs']);
  for (const s of ANATOMY_SCRIPTS) {
    assert.ok(s.reason.length > 20);
    const lines = s.code.trim().split('\n');
    assert.ok(lines.length >= 10 && lines.length <= 22, `${s.filename} deve ter trecho enxuto (10-22 linhas)`);
  }
  assert.match(ANATOMY_SCRIPTS[0].code, /PREFIX\s+dct:/);
  assert.match(ANATOMY_SCRIPTS[0].code, /SELECT[\s\S]*WHERE/);
  assert.match(ANATOMY_SCRIPTS[1].code, /@prefix\s+book:/);
  assert.match(ANATOMY_SCRIPTS[1].code, /@prefix\s+author:/);
  assert.match(ANATOMY_SCRIPTS[2].code, /toTriples/);
  assert.match(ANATOMY_SCRIPTS[2].code, /rdf:\s*['"]http:\/\/www\.w3\.org\/1999\/02\/22-rdf-syntax-ns#['"]/);

  const store = new oxigraph.Store();
  store.load(ANATOMY_SCRIPTS[1].code, { format: 'text/turtle' });
  assert.ok(store.size >= 6, 'library.ttl deve gerar triplas Turtle 1.1 validas no Oxigraph');
  const rows = [...store.query(ANATOMY_SCRIPTS[0].code)];
  assert.equal(rows.length, 1, 'query.rq deve consultar corretamente os dados de library.ttl');
});

test('DEMO_ABOUT_BOOK possui metadados validos para BookCover e preview About book', () => {
  assert.equal(DEMO_ABOUT_BOOK.title, 'Dom Casmurro');
  assert.equal(DEMO_ABOUT_BOOK.cover.palette.length, 3);
  assert.ok(DEMO_ABOUT_BOOK.author.name && DEMO_ABOUT_BOOK.genre.label);
});

test('tokenizeLine preserva o texto exato da linha e classifica sintaxe SPARQL, Turtle e JS', () => {
  const cases = [
    ['sparql', 'PREFIX dct: <http://purl.org/dc/terms/> # vocab'],
    ['sparql', '  ?book dct:title ?title . FILTER(?author = res:machado)'],
    ['turtle', '@prefix res: <https://biblioteca.grupo9.example/resource/> .'],
    ['turtle', '@prefix lib: <https://biblioteca.grupo9.example/ontology#> . # ontology'],
    ['turtle', '  dct:title "Dom Casmurro"@pt ; # titulo'],
    ['js', "  if (b.title) add(s, NS.dct + 'title', lit(b.title, 'pt')); // RDF"],
    ['js', "  const url = 'https://example.com//path'; // url com barras"],
  ];
  for (const [lang, line] of cases) {
    const tokens = tokenizeLine(line, lang);
    assert.equal(tokens.map((t) => t.text).join(''), line);
    assert.ok(tokens.some((t) => t.type !== 'plain'));
  }
  const iriHashTokens = tokenizeLine('PREFIX lib: <https://biblioteca.grupo9.example/ontology#>', 'sparql');
  assert.equal(iriHashTokens.find((t) => t.type === 'iri')?.text, '<https://biblioteca.grupo9.example/ontology#>');
  assert.equal(iriHashTokens.some((t) => t.type === 'comment'), false);

  const qnameTokens = tokenizeLine('  a:foo a rdf:type .', 'turtle');
  assert.equal(qnameTokens.find((t) => t.text === 'a:foo')?.type, 'prefix');
  assert.equal(qnameTokens.find((t) => t.text === 'a')?.type, 'keyword');
});
