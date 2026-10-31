// Gera data/library.ttl a partir dos arquivos JSON (banco de dados).
// Uso: npm run build:ttl
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { toTriples, toTurtle, validateDb } from '../mapping/json-to-rdf.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = async (f) => JSON.parse(await readFile(path.join(root, 'data', f), 'utf8'));

const db = { books: await read('books.json'), authors: await read('authors.json'), genres: await read('genres.json') };
for (const w of validateDb(db)) console.warn('⚠', w);

const triples = toTriples(db);
const header = '# ARQUIVO GERADO — edite os JSON em data/ e rode "npm run build:ttl".\n';
await writeFile(path.join(root, 'data', 'library.ttl'), header + toTurtle(triples), 'utf8');
console.log(`library.ttl gerado com ${triples.length} triplas.`);

