import { hostHeaderValidation } from '@modelcontextprotocol/hono';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { HTTPException } from 'hono/http-exception';
import { timeout } from 'hono/timeout';
import { buildServer, type ToolLog } from './build-mcp-server.ts';
import { mcpChannel, type Store } from './content-store.ts';

export type AppOptions = {
  allowedHosts?: string[];
  requestsPerMinute: number; // trần cho mỗi kênh, không theo IP
  maxConcurrent: number;
  timeoutMs: number;
  maxBodyBytes: number;
  domainToken?: string;
  log: (line: Record<string, unknown>) => void;
};

export function createApp(store: Store, opts: AppOptions): Hono {
  const app = new Hono();
  const toolLog: ToolLog = (e) => opts.log({ ts: new Date().toISOString(), ...e });
  const handlers = new Map<string, ReturnType<typeof createMcpHandler>>();
  const windows = new Map<string, { start: number; count: number }>();
  let inFlight = 0;

  // Chỉ kiểm tra Host cho endpoint MCP, để healthcheck nội bộ (Host 127.0.0.1) vẫn chạy.
  if (opts.allowedHosts?.length) app.use('/mcp/*', hostHeaderValidation(opts.allowedHosts));

  app.get('/healthz', (c) => c.text('ok'));
  app.get('/.well-known/openai-apps-challenge', (c) =>
    opts.domainToken ? c.text(opts.domainToken) : c.notFound(),
  );

  app.use('/mcp/:channel', async (c, next) => {
    const name = c.req.param('channel');
    if (!mcpChannel(store, name)) return c.notFound();

    // Không ghi IP, không ghi nội dung truy vấn.
    const started = Date.now();
    const reject = (status: 429 | 503, error: string) => {
      opts.log({ ts: new Date().toISOString(), channel: name, status, ms: 0 });
      return c.json({ error }, status);
    };
    const w = windows.get(name);
    if (!w || started - w.start >= 60_000) windows.set(name, { start: started, count: 1 });
    else if (++w.count > opts.requestsPerMinute) return reject(429, 'rate_limited');
    if (inFlight >= opts.maxConcurrent) return reject(503, 'busy');

    inFlight++;
    try {
      await next();
    } finally {
      inFlight--;
      opts.log({ ts: new Date().toISOString(), channel: name, status: c.res.status, ms: Date.now() - started });
    }
  });
  app.use(
    '/mcp/:channel',
    bodyLimit({ maxSize: opts.maxBodyBytes, onError: (c) => c.json({ error: 'payload_too_large' }, 413) }),
  );
  app.use('/mcp/:channel', timeout(opts.timeoutMs, new HTTPException(504, { message: 'timeout' })));

  app.all('/mcp/:channel', async (c) => {
    const name = c.req.param('channel');
    // Một request chỉ được chứa một thông điệp JSON-RPC: batch sẽ nhân số lần tìm kiếm
    // lên trong khi rate limit chỉ đếm một request (ChatGPT và spec mới không dùng batch).
    let request = c.req.raw;
    if (c.req.method === 'POST') {
      const body = await c.req.text();
      if (body.trimStart().startsWith('[')) return c.json({ error: 'batch_not_supported' }, 400);
      request = new Request(c.req.raw.url, { method: 'POST', headers: c.req.raw.headers, body });
    }
    let handler = handlers.get(name);
    if (!handler) {
      const channel = mcpChannel(store, name)!;
      handler = createMcpHandler(() => buildServer(store, name, channel, toolLog));
      handlers.set(name, handler);
    }
    return handler.fetch(request);
  });
  return app;
}
