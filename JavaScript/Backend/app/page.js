const routes = [
  ['GET', '/api/books?author=&genre=&q=', 'Busca combinada (dct:creator + schema:genre) via SPARQL'],
  ['GET', '/api/books/:id', 'Detalhes de um livro'],
  ['GET', '/api/books/:id/read', 'Páginas do leitor simulado'],
  ['GET', '/api/authors', 'Faceta de autores (SPARQL)'],
  ['GET', '/api/genres', 'Faceta de gêneros (SPARQL)'],
  ['GET', '/api/audio/:id', 'Audiobook simulado (WAV)'],
  ['GET|POST|DELETE', '/api/history', 'Histórico em JSON'],
  ['DELETE', '/api/history/:bookId', 'Remove um livro do histórico'],
  ['GET|POST', '/api/sparql', 'Endpoint SPARQL 1.1 somente leitura'],
  ['GET', '/api/export', 'Grafo RDF em Turtle'],
];

export default function Home() {
  return (
    <main style={{ maxWidth: 760, margin: '64px auto', padding: 24 }}>
      <h1 style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>Biblioteca Digital Semântica — BFF</h1>
      <p style={{ color: '#a1a1a6' }}>Backend Next.js/Node.js. A interface React roda em http://localhost:5173.</p>
      <ul style={{ lineHeight: 1.9, paddingLeft: 18 }}>
        {routes.map(([m, path, desc]) => (
          <li key={path}>
            <code style={{ color: '#0a84ff' }}>{m}</code> <code>{path}</code> — {desc}
          </li>
        ))}
      </ul>
    </main>
  );
}

