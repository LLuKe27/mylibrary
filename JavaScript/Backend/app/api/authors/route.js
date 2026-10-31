import { handle, json } from '@/lib/http.js';
import { listAuthors } from '@/lib/library.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async () => json(await listAuthors()));

