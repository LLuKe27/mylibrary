import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildBookJsonLd, buildCatalogJsonLd, buildLibraryJsonLd, safeJsonLd } from '../JavaScript/Frontend/src/lib/jsonld.js';
import { buildNarrationSegments, parseVoiceCommand, pickPortugueseVoice } from '../JavaScript/Frontend/src/lib/speech.js';
import { completeTutorial, identifyVisitor, isValidVisitorId } from '../JavaScript/Backend/lib/visitor.js';

const read = (p) => fs.readFileSync(p, 'utf8');

test('JSON-LD Schema.org gera estruturas válidas para Biblioteca, Livro e Catálogo', () => {
  const lib = buildLibraryJsonLd();
  assert.equal(lib['@context'], 'https://schema.org');
  assert.ok(lib['@type'].includes('Library'));
  assert.equal(lib.potentialAction['@type'], 'SearchAction');

  const book = {
    id: 'dom-casmurro',
    iri: 'https://biblioteca.grupo9.example/resource/book/dom-casmurro',
    title: 'Dom Casmurro',
    year: 1899,
    pages: 256,
    synopsis: 'Sinopse </script> teste',
    author: { id: 'machado-de-assis', iri: 'https://biblioteca.grupo9.example/resource/author/machado-de-assis', name: 'Machado de Assis' },
    genre: { id: 'realismo', label: 'Realismo' },
    audio: { url: '/api/audio/dom-casmurro', duration: 120 },
  };
  const bJson = buildBookJsonLd(book);
  assert.equal(bJson['@type'], 'Book');
  assert.equal(bJson.author['@type'], 'Person');
  assert.equal(bJson.associatedMedia['@type'], 'AudioObject');
  assert.equal(bJson.associatedMedia.duration, 'PT120S');

  const serialized = safeJsonLd(bJson);
  assert.doesNotMatch(serialized, /<\/script>/i);

  const cat = buildCatalogJsonLd([book]);
  assert.equal(cat['@type'], 'CollectionPage');
  assert.equal(cat.mainEntity['@type'], 'ItemList');
  assert.equal(cat.mainEntity.numberOfItems, 1);
  assert.equal(cat.mainEntity.itemListElement[0].position, 1);
});

test('Microdados e JSON-LD estão integrados no index.html, App, BookCard e BookModal', () => {
  const indexHtml = read('JavaScript/Frontend/index.html');
  const app = read('JavaScript/Frontend/src/App.jsx');
  const card = read('JavaScript/Frontend/src/components/BookCard.jsx');
  const modal = read('JavaScript/Frontend/src/components/BookModal.jsx');

  assert.match(indexHtml, /application\/ld\+json/);
  assert.match(indexHtml, /library-jsonld/);
  assert.match(app, /itemType="https:\/\/schema\.org\/CollectionPage"/);
  assert.match(app, /catalog-jsonld/);

  for (const src of [card, modal]) {
    assert.match(src, /itemScope/);
    assert.match(src, /itemType="https:\/\/schema\.org\/Book"/);
    assert.match(src, /itemProp="name"/);
    assert.match(src, /itemProp="author"/);
  }
  assert.match(modal, /book-jsonld/);
  assert.match(modal, /itemProp="abstract"/);
});

test('Web Speech API helper segmenta narração, escolhe voz pt-BR e interpreta comandos de voz', () => {
  const book = {
    title: 'Dom Casmurro',
    author: { name: 'Machado de Assis' },
    genre: { label: 'Realismo' },
    synopsis: 'Primeira frase. Segunda frase.',
  };
  const segs = buildNarrationSegments(book, ['[Texto adaptado para demonstração] Era uma vez no trem.']);
  assert.ok(segs.length >= 3);
  assert.doesNotMatch(segs.map((s) => s.text).join(' '), /\[Texto adaptado/);

  const voice = pickPortugueseVoice([
    { name: 'English', lang: 'en-US', voiceURI: 'en' },
    { name: 'Maria', lang: 'pt-BR', voiceURI: 'ptbr', localService: true },
  ]);
  assert.equal(voice?.voiceURI, 'ptbr');

  assert.equal(parseVoiceCommand('pausar leitura')?.action, 'pause');
  assert.equal(parseVoiceCommand('continuar livro')?.action, 'play');
  assert.equal(parseVoiceCommand('avançar')?.action, 'forward');
  assert.equal(parseVoiceCommand('voltar')?.action, 'backward');
  assert.equal(parseVoiceCommand('mais rápido')?.action, 'faster');
  assert.equal(parseVoiceCommand('fechar')?.action, 'stop');
});

test('Identificação de novo usuário por ID Único e conclusão do vídeo tutorial', async () => {
  const visitorsPath = 'JavaScript/Backend/data/visitors.json';
  const hadFile = fs.existsSync(visitorsPath);
  const prevContent = hadFile ? fs.readFileSync(visitorsPath, 'utf8') : null;
  try {
    const first = await identifyVisitor(null, { forceNew: true });
    assert.ok(isValidVisitorId(first.visitorId));
    assert.equal(first.isNewUser, true);
    assert.equal(first.shouldShowTutorial, true);
    assert.equal(first.visitCount, 1);

    const second = await identifyVisitor(first.visitorId);
    assert.equal(second.visitorId, first.visitorId);
    assert.equal(second.isNewUser, false);
    assert.equal(second.visitCount, 2);
    assert.equal(second.shouldShowTutorial, true);

    const done = await completeTutorial(first.visitorId);
    assert.equal(done.tutorialCompleted, true);
    assert.equal(done.shouldShowTutorial, false);

    const third = await identifyVisitor(first.visitorId);
    assert.equal(third.visitCount, 3);
    assert.equal(third.shouldShowTutorial, false);
  } finally {
    if (hadFile) fs.writeFileSync(visitorsPath, prevContent, 'utf8');
    else if (fs.existsSync(visitorsPath)) fs.unlinkSync(visitorsPath);
  }
});

test('Assets do vídeo tutorial (<video> + <track>) e TutorialModal estão presentes e configurados', () => {
  assert.ok(fs.existsSync('JavaScript/Frontend/public/tutorial/tutorial.webm'));
  assert.ok(fs.statSync('JavaScript/Frontend/public/tutorial/tutorial.webm').size > 50_000);
  assert.ok(fs.existsSync('JavaScript/Frontend/public/tutorial/poster.png'));
  const vtt = read('JavaScript/Frontend/public/tutorial/tutorial.vtt');
  assert.match(vtt, /^WEBVTT/);

  const tutModal = read('JavaScript/Frontend/src/components/TutorialModal.jsx');
  assert.match(tutModal, /<video/);
  assert.match(tutModal, /<track/);
  assert.match(tutModal, /tutorial\.webm/);
  assert.match(tutModal, /tutorial\.vtt/);
  assert.match(tutModal, /ID Único/);
});
