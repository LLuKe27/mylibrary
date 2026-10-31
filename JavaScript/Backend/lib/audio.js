/**
 * Gerador de "audiobook" simulado: sintetiza um WAV (PCM 16-bit mono)
 * determinístico por livro — um pad ambiente com melodia suave.
 * Permite demonstrar o player HTML5 (play, pause, avanço e velocidade)
 * sem depender de arquivos de áudio externos.
 */

const SAMPLE_RATE = 16000;
const cache = new Map();

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed) {
  let s = seed || 1;
  return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296;
}

const midi = (n) => 440 * 2 ** ((n - 69) / 12);

export function synthesizeWav(id, seconds = 90) {
  const key = `${id}:${seconds}`;
  if (cache.has(key)) return cache.get(key);

  const rand = rng(hash(id));
  const root = 45 + Math.floor(rand() * 10); // A2..F#3
  const minor = rand() > 0.5;
  const scale = minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const progressions = [[0, 5, 3, 4], [0, 3, 4, 3], [0, 4, 5, 3], [0, 2, 5, 4]];
  const prog = progressions[Math.floor(rand() * progressions.length)];
  const chordLen = 4; // segundos
  const total = Math.floor(seconds * SAMPLE_RATE);
  const pcm = new Int16Array(total);

  const degree = (d) => root + scale[d % 7] + 12 * Math.floor(d / 7);
  // melodia: uma nota a cada 0,5–1s
  const notes = [];
  for (let t = 0.5; t < seconds - 1; t += rand() > 0.5 ? 1 : 0.5) {
    if (rand() < 0.35) continue;
    const chord = prog[Math.floor(t / chordLen) % prog.length];
    const d = chord + [0, 2, 4, 7][Math.floor(rand() * 4)];
    notes.push({ start: t, freq: midi(degree(d) + 24) });
  }

  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    const ci = Math.floor(t / chordLen);
    const chord = prog[ci % prog.length];
    const local = t - ci * chordLen;
    const env = Math.min(1, local / 0.8) * Math.min(1, (chordLen - local) / 0.8);
    let v = 0;
    for (const off of [0, 2, 4]) {
      const f = midi(degree(chord + off) + 12);
      v += Math.sin(2 * Math.PI * f * t) * 0.09 + Math.sin(2 * Math.PI * f * 1.003 * t) * 0.05;
    }
    v += Math.sin(2 * Math.PI * midi(degree(chord)) * t) * 0.1; // baixo
    v *= env;
    pcm[i] = v * 32767;
  }

  // sinos da melodia (decaimento exponencial)
  const bellLen = Math.floor(1.6 * SAMPLE_RATE);
  for (const n of notes) {
    const start = Math.floor(n.start * SAMPLE_RATE);
    for (let j = 0; j < bellLen && start + j < total; j++) {
      const tt = j / SAMPLE_RATE;
      const s = Math.sin(2 * Math.PI * n.freq * tt) * Math.exp(-3 * tt) * 0.12 * Math.min(1, tt * 200);
      pcm[start + j] = Math.max(-32767, Math.min(32767, pcm[start + j] + s * 32767));
    }
  }

  // fade in/out global
  const fade = SAMPLE_RATE * 2;
  for (let i = 0; i < fade; i++) {
    pcm[i] = pcm[i] * (i / fade);
    pcm[total - 1 - i] = pcm[total - 1 - i] * (i / fade);
  }

  const dataSize = pcm.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataSize, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SAMPLE_RATE, 24); buf.writeUInt32LE(SAMPLE_RATE * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(dataSize, 40);
  Buffer.from(pcm.buffer).copy(buf, 44);

  cache.set(key, buf);
  return buf;
}

