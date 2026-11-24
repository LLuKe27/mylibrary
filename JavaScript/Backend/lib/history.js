import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { HISTORY_FILE, STATE_DIR } from './paths.js';

const MAX = 50;
let queue = Promise.resolve();
let memoryFallback = null;

export async function readHistory() {
  try {
    const data = JSON.parse(await readFile(HISTORY_FILE, 'utf8'));
    memoryFallback = data;
    return data;
  } catch {
    return memoryFallback ?? [];
  }
}

/** Serializa as escritas para evitar condições de corrida no arquivo JSON com fallback em memória. */
function mutate(fn) {
  queue = queue.then(async () => {
    const list = await readHistory();
    const next = fn(list).slice(0, MAX);
    memoryFallback = next;
    try {
      await mkdir(STATE_DIR, { recursive: true });
      await writeFile(HISTORY_FILE, JSON.stringify(next, null, 2), 'utf8');
    } catch {
      // Mantém apenas em memória caso a escrita em disco falhe.
    }
    return next;
  });
  return queue;
}

export const addHistory = (entry) =>
  mutate((list) => [{ ...entry, at: new Date().toISOString() }, ...list.filter((e) => !(e.bookId === entry.bookId && e.action === entry.action))]);

export const removeHistory = (bookId) => mutate((list) => list.filter((e) => e.bookId !== bookId));
export const clearHistory = () => mutate(() => []);

