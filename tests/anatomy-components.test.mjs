import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');

test('FeaturesBento renderiza os 5 elementos visuais isolados e sem mutacao de estado', () => {
  const src = read('JavaScript/Frontend/src/components/FeaturesBento.jsx');
  assert.match(src, /export function FeaturesBento/);
  assert.match(src, /BookCover/);
  for (const label of ['About book', 'Ler & Ouvir', 'Theme', 'Recents', 'Filter']) {
    assert.ok(src.includes(label), `FeaturesBento deve rotular ${label}`);
  }
  assert.match(src, /aria-hidden="true"/);
  assert.doesNotMatch(src, /<button/);
  assert.doesNotMatch(src, /usePlayer|useTheme|onCycleTheme|onToggleHistory/);
});

test('ScriptsMiniIde exibe pasta ficticia, abas acessiveis, motivo e copia segura', () => {
  const src = read('JavaScript/Frontend/src/components/ScriptsMiniIde.jsx');
  assert.match(src, /import \{ use[\s\S]*from 'react'/);
  assert.match(src, /IDE_FOLDER_NAME/);
  assert.match(src, /ANATOMY_SCRIPTS/);
  assert.match(src, /tokenizeLine/);
  assert.match(src, /role="tablist"/);
  assert.match(src, /role="tab"/);
  assert.match(src, /aria-selected=/);
  assert.match(src, /aria-controls="ide-tabpanel"/);
  assert.match(src, /id="ide-tabpanel"[\s\S]*aria-labelledby=/);
  assert.match(src, /role="tabpanel"[\s\S]*mini-ide__reason[\s\S]*mini-ide__code/);
  assert.match(src, /mini-ide__code"[\s\S]*tabIndex=\{0\}/);
  assert.match(src, /ArrowDown|ArrowRight/);
  assert.match(src, /mountedRef/);
  assert.match(src, /navigator\.clipboard\?\.writeText/);
  assert.match(src, /try\s*\{[\s\S]*catch/);
});

test('AnatomyModal integra sub-tela Features & Scripts com switch, foco estavel e WAI-ARIA', () => {
  const src = read('JavaScript/Frontend/src/components/AnatomyModal.jsx');
  const appSrc = read('JavaScript/Frontend/src/App.jsx');
  assert.match(src, /FeaturesBento/);
  assert.match(src, /ScriptsMiniIde/);
  assert.match(src, /useState\(['"]overview['"]\)/);
  assert.match(src, /useState\(['"]features['"]\)/);
  assert.match(src, /escapeRef/);
  assert.match(src, /useCallback\(\(\)\s*=>\s*escapeRef\.current\?\.\(\),\s*\[\]\)/);
  assert.match(src, /backBtnRef/);
  assert.match(src, /scriptsCardRef/);
  assert.match(src, /<button[\s\S]*anatomy-card--interactive/);
  assert.match(src, /role="tablist"/);
  assert.match(src, /aria-controls="panel-features-scripts"/);
  assert.match(src, /role="tabpanel"[\s\S]*aria-labelledby=/);
  assert.match(src, /ArrowLeft|ArrowRight/);
  assert.ok(src.includes('Features') && src.includes('Scripts'));
  assert.match(appSrc, /<AnatomyModal onClose=\{handleCloseAnatomy\}/);
});

test('global.css define estilos de switch, Bento e Mini IDE responsivos e sem backdrop-filter aninhado', () => {
  const css = read('JavaScript/Frontend/src/styles/global.css');
  for (const cls of ['.anatomy-card--interactive', '.anatomy-switch', '.features-bento', '.mini-ide', '.tok-keyword']) {
    assert.ok(css.includes(cls), `global.css deve definir ${cls}`);
  }
  const subCssStart = css.indexOf('/* ---------- Anatomy Subview');
  assert.ok(subCssStart !== -1, 'global.css deve conter secao dedicada Anatomy Subview');
  const subCss = css.slice(subCssStart);
  assert.doesNotMatch(subCss, /backdrop-filter/i);
  assert.doesNotMatch(subCss, /transition:[^;]*(?:width|height)/i);
  assert.match(subCss, /\.features-bento \.segmented\s*\{[\s\S]*max-width:\s*100%/);
  assert.match(subCss, /\.features-bento \.segmented__btn\s*\{[\s\S]*min-width:\s*0/);
  assert.match(subCss, /\.features-about__meta\s*\{[\s\S]*auto-fit/);
  assert.match(subCss, /\.features-about__meta dd\s*\{[\s\S]*overflow-wrap:\s*break-word/);
  assert.match(subCss, /\.mini-ide__line\s*\{[\s\S]*min-width:\s*max-content/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.features-bento[\s\S]*\.mini-ide/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.anatomy-switch\s*\{[\s\S]*margin-left:\s*0/);
});
