import crypto from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { STATE_DIR } from './paths.js';

export const VISITOR_COOKIE = 'mylibrary_uid';
const VISITORS_FILE = path.join(STATE_DIR, 'visitors.json');
const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_VISITORS = 500;

let queue = Promise.resolve();
let memoryVisitors = null;

export const isValidVisitorId = (id) => typeof id === 'string' && UUID_V4_RE.test(id);

async function readVisitors() {
  try {
    const data = JSON.parse(await readFile(VISITORS_FILE, 'utf8'));
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      memoryVisitors = data;
      return data;
    }
  } catch {
    // Fallback em memória caso o arquivo de visitantes ainda não exista ou falhe ao ler
  }
  return memoryVisitors ?? {};
}

function mutateVisitors(fn) {
  queue = queue.then(async () => {
    const map = { ...(await readVisitors()) };
    const result = await fn(map);
    const entries = Object.entries(map);
    if (entries.length > MAX_VISITORS) {
      entries.sort((a, b) => String(b[1].lastSeenAt).localeCompare(String(a[1].lastSeenAt)));
      const trimmed = Object.fromEntries(entries.slice(0, MAX_VISITORS));
      memoryVisitors = trimmed;
    } else {
      memoryVisitors = map;
    }
    try {
      await mkdir(STATE_DIR, { recursive: true });
      await writeFile(VISITORS_FILE, JSON.stringify(memoryVisitors, null, 2), 'utf8');
    } catch {
      // Ignora erro de escrita se o filesystem for somente leitura.
    }
    return result;
  });
  return queue;
}

/**
 * Identifica um usuário pelo seu ID Único (UUID v4).
 * Se não houver ID válido ou ainda não existir no registro, cria um novo ID e marca como novo acesso.
 */
export function identifyVisitor(existingId, { clientSeenTutorial = false, forceNew = false } = {}) {
  return mutateVisitors((map) => {
    const now = new Date().toISOString();
    const valid = !forceNew && isValidVisitorId(existingId);

    if (valid && map[existingId]) {
      const current = map[existingId];
      const updated = {
        ...current,
        lastSeenAt: now,
        visitCount: (current.visitCount || 1) + 1,
        tutorialCompleted: Boolean(current.tutorialCompleted || clientSeenTutorial),
      };
      map[existingId] = updated;
      return {
        ...updated,
        isNewUser: false,
        shouldShowTutorial: !updated.tutorialCompleted,
      };
    }

    const visitorId = valid ? existingId : crypto.randomUUID();
    const isNewUser = !valid || !clientSeenTutorial;
    const record = {
      visitorId,
      createdAt: now,
      lastSeenAt: now,
      visitCount: 1,
      tutorialCompleted: Boolean(clientSeenTutorial && valid),
    };
    map[visitorId] = record;
    return {
      ...record,
      isNewUser,
      shouldShowTutorial: !record.tutorialCompleted,
    };
  });
}

/** Marca que o visitante com este ID Único já concluiu/fechou o vídeo tutorial. */
export function completeTutorial(visitorId) {
  return mutateVisitors((map) => {
    const now = new Date().toISOString();
    const id = isValidVisitorId(visitorId) ? visitorId : crypto.randomUUID();
    const prev = map[id] ?? { visitorId: id, createdAt: now, visitCount: 1 };
    const updated = {
      ...prev,
      lastSeenAt: now,
      tutorialCompleted: true,
      tutorialCompletedAt: now,
    };
    map[id] = updated;
    return {
      ...updated,
      isNewUser: false,
      shouldShowTutorial: false,
    };
  });
}
