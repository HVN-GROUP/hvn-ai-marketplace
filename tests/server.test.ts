import { readFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { join } from 'node:path';
import { serve, type ServerType } from '@hono/node-server';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { parse } from 'yaml';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildFromDisk } from '../scripts/build.ts';
import { loadConfig } from '../shared/load.ts';
import { createApp, type AppOptions } from '../server/app.ts';
import { createStore, search, type Store } from '../server/content-store.ts';
import { fold } from '../server/vietnamese.ts';

const ROOT = join(import.meta.dirname, '..');
const { index } = buildFromDisk(ROOT);
const config = loadConfig(ROOT);
const store = createStore(index, config.catalog, config.channels);

function appWith(overrides: Partial<AppOptions> = {}, s: Store = store) {
  const logs: Record<string, unknown>[] = [];
  const app = createApp(s, {
    requestsPerMinute: 600,
    maxConcurrent: 50,
    timeoutMs: 2000,
    maxBodyBytes: 64 * 1024,
    log: (line) => logs.push(line),
    ...overrides,
  });
  return { app, logs };
}

describe('tìm kiếm tiếng Việt', () => {
  it('bỏ dấu tiếng Việt', () => {
    expect(fold('Khôi phục Đường dẫn')).toBe('khoi phuc duong dan');
  });

  const golden = parse(readFileSync(join(ROOT, 'tests/search-golden.yaml'), 'utf8')) as { q: string; id: string }[];
  const all = { utm_source: 'chatgpt', mcp: true };
  it.each(golden)('"$q" có tài liệu kỳ vọng trong top 3', ({ q, id }) => {
    expect(search(store, all, q).slice(0, 3).map((r) => r.id)).toContain(id);
  });
});

describe('MCP qua HTTP', () => {
  let server: ServerType;
  let base: string;
  let client: Client;
  const { app, logs } = appWith();

  beforeAll(async () => {
    server = serve({ fetch: app.fetch, port: 0, hostname: '127.0.0.1' });
    await new Promise((r) => server.once('listening', r));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    client = new Client({ name: 'test', version: '1.0.0' });
    await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp/chatgpt`)));
  });
  afterAll(async () => {
    await client.close();
    server.close();
  });

  it('liệt kê 3 công cụ chỉ đọc với annotation tường minh', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(['fetch', 'recommend_solutions', 'search']);
    for (const t of tools) {
      expect(t.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false, openWorldHint: false });
    }
  });

  it('recommend_solutions trả tối đa 1 mục với UTM của ChatGPT', async () => {
    const res = await client.callTool({ name: 'recommend_solutions', arguments: { need: 'sao-luu-du-lieu' } });
    const items = (res.structuredContent as { items: { url: string; provider: string }[] }).items;
    expect(items).toHaveLength(1);
    const url = new URL(items[0].url);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      utm_source: 'chatgpt', utm_medium: 'ai-plugin', utm_campaign: 'hvn-advisor', utm_content: 'recommend',
    });
    expect(items[0].provider).toBe('Sản phẩm của HVN GROUP');
  });

  it('fetch không có khối gợi ý, không có chỉ dẫn cho model, link sản phẩm mang UTM ChatGPT', async () => {
    const res = await client.callTool({ name: 'fetch', arguments: { id: 'hvn-advisor.tu-van-giai-phap-hvn.quy-trinh-tu-van' } });
    const doc = res.structuredContent as { text: string };
    expect(doc.text).not.toMatch(/Giải pháp liên quan|hvn-goi-y|nguyên văn khối/);
    expect(doc.text).toContain('utm_source=chatgpt');
    expect(doc.text).not.toContain('utm_source=claude');
  });

  it('loại nội dung chon-goi khỏi search và fetch trên ChatGPT', async () => {
    const res = await client.callTool({ name: 'search', arguments: { query: 'chọn gói claude' } });
    const ids = (res.structuredContent as { results: { id: string }[] }).results.map((r) => r.id);
    expect(ids).not.toContain('hvn-claude.quan-tri-claude-team.chon-goi-claude');
    const fetched = await client.callTool({ name: 'fetch', arguments: { id: 'hvn-claude.quan-tri-claude-team.chon-goi-claude' } });
    expect(fetched.isError).toBe(true);
  });

  it('từ chối truy vấn quá dài', async () => {
    const res = await client.callTool({ name: 'search', arguments: { query: 'a'.repeat(10_000) } });
    expect(res.isError).toBe(true);
  });

  it('log không chứa truy vấn và không chứa IP', async () => {
    await client.callTool({ name: 'search', arguments: { query: 'chuoi-dinh-danh-thu-nghiem' } });
    const text = JSON.stringify(logs);
    expect(text).not.toContain('chuoi-dinh-danh-thu-nghiem');
    expect(text).not.toMatch(/\b\d{1,3}(?:\.\d{1,3}){3}\b/);
    expect(logs.some((l) => l.tool === 'search')).toBe(true);
  });

  it('kênh không phải MCP hoặc không tồn tại trả 404', async () => {
    expect((await fetch(`${base}/mcp/grok`, { method: 'POST' })).status).toBe(404);
    expect((await fetch(`${base}/mcp/claude`, { method: 'POST' })).status).toBe(404);
  });

  it('healthz trả 200', async () => {
    expect((await fetch(`${base}/healthz`)).status).toBe(200);
  });

  it('từ chối JSON-RPC batch để một request không chạy được nhiều lệnh tìm kiếm', async () => {
    const batch = Array.from({ length: 100 }, (_, i) => ({
      jsonrpc: '2.0', id: i, method: 'tools/call', params: { name: 'search', arguments: { query: 'claude' } },
    }));
    const res = await fetch(`${base}/mcp/chatgpt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify(batch),
    });
    expect(res.status).toBe(400);
  });

  it('fetch trên ChatGPT không nhắc mã tài liệu bị loại (chon-goi)', async () => {
    const res = await client.callTool({ name: 'fetch', arguments: { id: 'hvn-claude.bat-dau-voi-claude.lo-trinh-90-ngay' } });
    const text = (res.structuredContent as { text: string }).text;
    expect(text).toContain('mã tài liệu: hvn-claude.quan-tri-claude-team.them-thanh-vien-team');
    expect(text).not.toContain('chon-goi-claude');
  });

  // Đặt cuối nhóm: server đóng kết nối khi body vượt giới hạn, và client undici
  // có thể dùng lại socket đã đóng đó cho request kế tiếp.
  it('body quá 64 KB trả 413', async () => {
    const res = await fetch(`${base}/mcp/chatgpt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping', params: { pad: 'x'.repeat(1_000_000) } }),
    });
    expect(res.status).toBe(413);
  });
});

describe('kiểm tra Host', () => {
  it('chặn Host lạ ở /mcp nhưng healthcheck nội bộ vẫn chạy', async () => {
    const { app } = appWith({ allowedHosts: ['mcp.hvn.vn'] });
    expect((await app.request('http://127.0.0.1:3000/healthz')).status).toBe(200);
    expect((await app.request('http://evil.example/mcp/chatgpt', { method: 'POST' })).status).toBe(403);
  });
});

describe('cấu hình kênh', () => {
  it('tools_disabled bỏ công cụ khỏi tools/list', async () => {
    const channels = structuredClone(config.channels);
    channels.channels.chatgpt.tools_disabled = ['recommend_solutions'];
    const { app } = appWith({}, createStore(index, config.catalog, channels));
    const server = serve({ fetch: app.fetch, port: 0, hostname: '127.0.0.1' });
    await new Promise((r) => server.once('listening', r));
    const client = new Client({ name: 'test', version: '1.0.0' });
    await client.connect(
      new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${(server.address() as AddressInfo).port}/mcp/chatgpt`)),
    );
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(['fetch', 'search']);
    await client.close();
    server.close();
  });

  it('vượt trần request mỗi phút của kênh trả 429 và vẫn được ghi log', async () => {
    const { app, logs } = appWith({ requestsPerMinute: 2 });
    const statuses = [];
    for (let i = 0; i < 3; i++) statuses.push((await app.request('/mcp/chatgpt', { method: 'POST', body: '{}' })).status);
    expect(statuses[2]).toBe(429);
    expect(logs.some((l) => l.status === 429)).toBe(true);
  });
});
