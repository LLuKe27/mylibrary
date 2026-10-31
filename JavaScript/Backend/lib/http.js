import { NextResponse } from 'next/server';

export const json = (data, init) => NextResponse.json(data, init);
export const error = (status, message) => NextResponse.json({ error: message }, { status });

export function handle(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      console.error('[api]', e);
      return error(500, e?.message || 'Erro interno');
    }
  };
}

