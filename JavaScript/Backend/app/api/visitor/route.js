import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { error, handle } from '@/lib/http.js';
import { completeTutorial, identifyVisitor, isValidVisitorId, VISITOR_COOKIE } from '@/lib/visitor.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function attachVisitorCookie(res, visitorId) {
  res.cookies.set(VISITOR_COOKIE, visitorId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: false,
  });
  return res;
}

/** GET /api/visitor — identifica ou cria um ID Único para o visitante e informa se é novo acesso. */
export const GET = handle(async (req) => {
  const cookieStore = await cookies();
  const qUid = req.nextUrl.searchParams.get('uid');
  const seen = req.nextUrl.searchParams.get('seen') === '1';
  const cookieUid = cookieStore.get(VISITOR_COOKIE)?.value;
  const candidate = isValidVisitorId(qUid) ? qUid : cookieUid;

  const visitor = await identifyVisitor(candidate, { clientSeenTutorial: seen });
  return attachVisitorCookie(NextResponse.json(visitor), visitor.visitorId);
});

/** POST /api/visitor — gera um novo ID Único (útil para simular novo usuário/acesso). */
export const POST = handle(async () => {
  const visitor = await identifyVisitor(null, { forceNew: true });
  return attachVisitorCookie(NextResponse.json(visitor, { status: 201 }), visitor.visitorId);
});

/** PATCH /api/visitor — marca o tutorial como concluído para este ID Único. */
export const PATCH = handle(async (req) => {
  const body = await req.json().catch(() => ({}));
  const cookieStore = await cookies();
  const candidate = isValidVisitorId(body.visitorId) ? body.visitorId : cookieStore.get(VISITOR_COOKIE)?.value;
  if (!isValidVisitorId(candidate)) return error(400, 'visitorId inválido');

  const visitor = await completeTutorial(candidate);
  return attachVisitorCookie(NextResponse.json(visitor), visitor.visitorId);
});
