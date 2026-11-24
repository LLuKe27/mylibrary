/**
 * Geradores de dados estruturados Schema.org em JSON-LD.
 * Complementa a camada RDF/SPARQL e os Microdados HTML5 nos componentes.
 */

const BASE = 'https://biblioteca.grupo9.example/resource/';

/** Serializa JSON-LD escapando '<' para evitar fechamento acidental de </script>. */
export function safeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildLibraryJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Library', 'WebApplication'],
    '@id': `${BASE}library`,
    name: 'My Library — Biblioteca Digital Semântica',
    description:
      'Biblioteca Digital Semântica com motor RDF/SPARQL (Oxigraph), capas SVG, leitor digital, audiobook com Web Speech API e acessibilidade.',
    inLanguage: 'pt-BR',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    publisher: {
      '@type': 'Organization',
      name: 'Grupo 09 — My Library',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: '/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBookJsonLd(book) {
  if (!book) return null;
  const duration = book.audio?.duration ? `PT${book.audio.duration}S` : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': book.iri || `${BASE}book/${book.id}`,
    identifier: book.id,
    name: book.title,
    inLanguage: 'pt-BR',
    author: book.author
      ? {
          '@type': 'Person',
          '@id': book.author.iri || `${BASE}author/${book.author.id}`,
          name: book.author.name,
        }
      : undefined,
    genre: book.genre?.label,
    ...(book.year ? { datePublished: String(book.year) } : {}),
    ...(book.pages ? { numberOfPages: Number(book.pages) } : {}),
    ...(book.synopsis ? { abstract: book.synopsis, description: book.synopsis } : {}),
    ...(book.audio?.url
      ? {
          associatedMedia: {
            '@type': 'AudioObject',
            '@id': `${BASE}audio/${book.id}`,
            name: `Audiobook: ${book.title}`,
            contentUrl: book.audio.url,
            encodingFormat: 'audio/wav',
            ...(duration ? { duration } : {}),
          },
        }
      : {}),
  };
}

export function buildCatalogJsonLd(books = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${BASE}catalog`,
    name: 'Catálogo — My Library',
    inLanguage: 'pt-BR',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: books.length,
      itemListElement: books.map((book, index) => {
        const item = buildBookJsonLd(book);
        if (item) delete item['@context'];
        return {
          '@type': 'ListItem',
          position: index + 1,
          item,
        };
      }),
    },
  };
}
