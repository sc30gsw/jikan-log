import { Elysia, t } from 'elysia';

const app = new Elysia({ prefix: '/api' })
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .get('/hello', () => ({ message: 'Hello from Elysia!' }))
  .post('/echo', ({ body }) => body, {
    body: t.Object({
      message: t.String(),
    }),
  });

export const GET = app.fetch;
export const POST = app.fetch;
