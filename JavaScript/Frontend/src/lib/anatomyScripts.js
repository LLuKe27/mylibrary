/**
 * Dados estáticos demonstrativos e tokenizador leve de sintaxe
 * para a sub-tela Features & Scripts do modal Anatomy.
 */

export const IDE_FOLDER_NAME = 'my-library-semantic';

export const DEMO_ABOUT_BOOK = {
  id: 'dom-casmurro',
  title: 'Dom Casmurro',
  year: 1899,
  pages: 256,
  iri: 'https://biblioteca.grupo9.example/resource/book/dom-casmurro',
  synopsis:
    'Bento Santiago revisita a juventude para tentar unir as pontas da vida, narrando o amor por Capitu e a dúvida que atravessa o romance.',
  author: {
    id: 'machado-de-assis',
    name: 'Machado de Assis',
    iri: 'https://biblioteca.grupo9.example/resource/author/machado-de-assis',
  },
  genre: {
    id: 'realismo',
    label: 'Realismo',
    iri: 'https://biblioteca.grupo9.example/resource/genre/realismo',
  },
  cover: {
    palette: ['#1d2a44', '#e9b44c', '#f5efe0'],
    motif: 'eyes',
  },
};

export const ANATOMY_SCRIPTS = [
  {
    id: 'query',
    filename: 'query.rq',
    language: 'sparql',
    badge: 'SPARQL 1.1',
    reason:
      'Motivo: mostra como utilizar SPARQL para consultar livros e filtros por autoria ou gênero diretamente no grafo RDF.',
    code: [
      '# Consulta livros por autoria e gênero no store RDF',
      'PREFIX dct:    <http://purl.org/dc/terms/>',
      'PREFIX schema: <https://schema.org/>',
      'PREFIX foaf:   <http://xmlns.com/foaf/0.1/>',
      'PREFIX lib:    <https://biblioteca.grupo9.example/ontology#>',
      '',
      'SELECT ?book ?title ?authorName ?year',
      'WHERE {',
      '  ?book a schema:Book ;',
      '        dct:title ?title ;',
      '        dct:creator ?author .',
      '  ?author foaf:name ?authorName .',
      '  OPTIONAL { ?book dct:issued ?year }',
      '  FILTER(?author = <https://biblioteca.grupo9.example/resource/author/machado-de-assis>)',
      '}',
      'ORDER BY ?title',
    ].join('\n'),
  },
  {
    id: 'turtle',
    filename: 'library.ttl',
    language: 'turtle',
    badge: 'Turtle (RDF)',
    reason:
      'Motivo: mostra como usar Turtle para criar e armazenar os dados do catálogo usando @prefix para abreviar URLs longas.',
    code: [
      '# Prefixos abreviam IRIs extensas de vocabulários e recursos',
      '@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .',
      '@prefix dct:    <http://purl.org/dc/terms/> .',
      '@prefix schema: <https://schema.org/> .',
      '@prefix foaf:   <http://xmlns.com/foaf/0.1/> .',
      '@prefix lib:    <https://biblioteca.grupo9.example/ontology#> .',
      '@prefix author: <https://biblioteca.grupo9.example/resource/author/> .',
      '@prefix book:   <https://biblioteca.grupo9.example/resource/book/> .',
      '',
      'author:machado-de-assis',
      '    a foaf:Person ;',
      '    foaf:name "Machado de Assis" .',
      '',
      'book:dom-casmurro',
      '    a schema:Book ;',
      '    dct:title "Dom Casmurro"@pt ;',
      '    dct:creator author:machado-de-assis ;',
      '    dct:issued "1899"^^xsd:gYear ;',
      '    lib:coverMotif "eyes" .',
    ].join('\n'),
  },
  {
    id: 'mapping',
    filename: 'json-to-rdf.mjs',
    language: 'js',
    badge: 'JSON → RDF',
    reason:
      'Motivo: mostra como os objetos JSON editáveis são convertidos em triplas [sujeito, predicado, objeto] para o grafo RDF.',
    code: [
      "// Mapeamento de JSON para triplas RDF (SparQL/mapping/json-to-rdf.mjs)",
      'export const NS = {',
      "  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',",
      "  dct: 'http://purl.org/dc/terms/',",
      "  schema: 'https://schema.org/',",
      "  res: 'https://biblioteca.grupo9.example/resource/',",
      '};',
      '',
      'export function toTriples({ books = [], authorById }) {',
      '  const triples = [];',
      '  const add = (s, p, o) => triples.push([s, p, o]);',
      '  for (const b of books) {',
      '    const s = `${NS.res}book/${b.id}`;',
      "    add(s, NS.rdf + 'type', { iri: NS.schema + 'Book' });",
      "    if (b.title) add(s, NS.dct + 'title', { value: b.title, lang: 'pt' });",
      "    if (authorById.has(b.authorId)) {",
      "      add(s, NS.dct + 'creator', { iri: `${NS.res}author/${b.authorId}` });",
      '    }',
      '  }',
      '  return triples;',
      '}',
    ].join('\n'),
  },
];

const PATTERNS = {
  sparql:
    /(?<iri><[^>\s]+>)|(?<string>"(?:\\.|[^"\\])*"(?:@[a-z-]+|\^\^[A-Za-z_][\w-]*:[A-Za-z_][\w-]*)?)|(?<comment>#.*$)|(?<prefix>\b[A-Za-z_][\w-]*:[A-Za-z_][\w.-]*|\b[A-Za-z_][\w-]*:(?=\s))|(?<keyword>\b(?:PREFIX|SELECT|WHERE|OPTIONAL|FILTER|ORDER|BY|ASC|DESC|ASK|CONSTRUCT|DISTINCT|AS)\b|\ba\b)|(?<var>\?[A-Za-z_]\w*)/g,
  turtle:
    /(?<iri><[^>\s]+>)|(?<string>"(?:\\.|[^"\\])*"(?:@[a-z-]+|\^\^[A-Za-z_][\w-]*:[A-Za-z_][\w-]*)?)|(?<comment>#.*$)|(?<prefix>\b[A-Za-z_][\w-]*:[A-Za-z_][\w.-]*|\b[A-Za-z_][\w-]*:(?=\s))|(?<keyword>@prefix|@base|\ba\b)/g,
  js:
    /(?<comment>\/\/.*$)|(?<string>'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(?<keyword>\b(?:export|function|const|let|if|return|for|of|in|new)\b)|(?<prefix>\bNS\.[A-Za-z_]\w*\b)/g,
};

/**
 * Converte uma linha de código em tokens semânticos mantendo concatenação exata.
 */
export function tokenizeLine(line, language) {
  const regex = PATTERNS[language];
  if (!regex || !line) return [{ type: 'plain', text: line }];

  regex.lastIndex = 0;
  const tokens = [];
  let cursor = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > cursor) {
      tokens.push({ type: 'plain', text: line.slice(cursor, match.index) });
    }
    const type = Object.entries(match.groups || {}).find(([, v]) => v !== undefined)?.[0] ?? 'plain';
    tokens.push({ type, text: match[0] });
    cursor = match.index + match[0].length;
  }

  if (cursor < line.length) {
    tokens.push({ type: 'plain', text: line.slice(cursor) });
  }

  return tokens.length ? tokens : [{ type: 'plain', text: '' }];
}
