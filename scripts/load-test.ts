// Load test cho MCP server: N phiên đồng thời, mỗi phiên search → fetch → recommend.
// Dùng: node scripts/load-test.ts https://staging-mcp.hvn.vn 50
const [base, sessionsArg] = process.argv.slice(2);
if (!base) {
  console.error('cách dùng: node scripts/load-test.ts <base-url> [số phiên=50]');
  process.exit(2);
}
const sessions = Number(sessionsArg ?? 50);
if (!Number.isInteger(sessions) || sessions < 1) {
  console.error('số phiên phải là số nguyên ≥ 1');
  process.exit(2);
}
const headers = {
  'content-type': 'application/json',
  accept: 'application/json, text/event-stream',
  'mcp-protocol-version': '2025-06-18',
};
const calls = [
  { name: 'search', arguments: { query: 'lộ trình dùng claude' } },
  { name: 'fetch', arguments: { id: 'hvn-claude.bat-dau-voi-claude.lo-trinh-90-ngay' } },
  { name: 'recommend_solutions', arguments: { need: 'sao-luu-du-lieu' } },
];

const timings: number[] = [];
const statuses = new Map<number, number>();
let toolErrors = 0;

async function session(n: number): Promise<void> {
  for (const [i, params] of calls.entries()) {
    const started = performance.now();
    const res = await fetch(`${base}/mcp/chatgpt`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', id: n * 10 + i, method: 'tools/call', params }),
    });
    // Lỗi JSON-RPC hoặc isError vẫn trả HTTP 200, nên phải đọc nội dung.
    const body = await res.text();
    if (/"error"\s*:|"isError"\s*:\s*true/.test(body)) toolErrors++;
    timings.push(performance.now() - started);
    statuses.set(res.status, (statuses.get(res.status) ?? 0) + 1);
  }
}

await Promise.all(Array.from({ length: sessions }, (_, n) => session(n)));
timings.sort((a, b) => a - b);
const p95 = timings[Math.max(0, Math.ceil(timings.length * 0.95) - 1)];
console.log(
  `requests: ${timings.length}, status: ${JSON.stringify(Object.fromEntries(statuses))}, lỗi công cụ: ${toolErrors}, p95: ${p95.toFixed(0)} ms`,
);
const ok = (statuses.get(200) ?? 0) === timings.length && toolErrors === 0 && p95 < 500;
console.log(ok ? 'load-test: đạt (toàn bộ 200, không lỗi công cụ, p95 < 500 ms)' : 'load-test: KHÔNG đạt');
process.exit(ok ? 0 : 1);
