import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { serve } from '@hono/node-server';
import type { IndexRecord } from '../scripts/build.ts';
import { loadConfig } from '../shared/load.ts';
import { createApp } from './app.ts';
import { createStore } from './content-store.ts';

const root = process.env.APP_ROOT ?? process.cwd();
const indexPath = process.env.CONTENT_INDEX ?? join(root, 'dist', 'content-index.json');
const records = JSON.parse(readFileSync(indexPath, 'utf8')) as IndexRecord[];
const { catalog, channels } = loadConfig(root);
const store = createStore(records, catalog, channels);

const app = createApp(store, {
  allowedHosts: process.env.MCP_ALLOWED_HOSTS?.split(',').map((h) => h.trim()).filter(Boolean),
  requestsPerMinute: Number(process.env.MCP_REQUESTS_PER_MINUTE ?? 600),
  maxConcurrent: Number(process.env.MCP_MAX_CONCURRENT ?? 50),
  timeoutMs: 2000,
  maxBodyBytes: 64 * 1024,
  domainToken: process.env.OPENAI_DOMAIN_TOKEN,
  log: (line) => console.log(JSON.stringify(line)),
});

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port, hostname: '0.0.0.0' });
console.log(JSON.stringify({ ts: new Date().toISOString(), event: 'started', port, records: records.length }));
