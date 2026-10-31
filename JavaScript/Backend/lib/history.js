import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { HISTORY_FILE, STATE_DIR } from './paths.js';

const MAX = 50;
let queue = Promise.resolve();

export async function readHistory() {
  try {
    return JSON.parse(await readFile(HISTORY_FILE, 'utf8'));
  } catch {
    return [];
  }
}

/** Serializa as escritas para evitar condições de corrida no arquivo JSON. */
function mutate(fn) {
  queue = queue.then(async () => {
    const list = await readHistory();
    const next = fn(list).slice(0, MAX);
    await mkdir(STATE_DIR, { recursive: true });
    await writeFile(HISTORY_FILE, JSON.stringify(next, null, 2), 'utf8');
    return next;
  });
  return queue;
}

export const addHistory = (entry) =>
  mutate((list) => [{ ...entry, at: new Date().toISOString() }, ...list.filter((e) => !(e.bookId === entry.bookId && e.action === entry.action))]);

export const removeHistory = (bookId) => mutate((list) => list.filter((e) => e.bookId !== bookId));
export const clearHistory = () => mutate(() => []);

