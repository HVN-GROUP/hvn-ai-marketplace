import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import type { Channel } from '../shared/schema.ts';
import { fetchRecord, search, type Store } from './content-store.ts';
import { recommend } from './recommend.ts';

export type ToolLog = (event: { channel: string; tool: string; items: number }) => void;

// Công cụ chỉ đọc nội dung công khai đã duyệt, trong phạm vi catalog của HVN GROUP.
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, openWorldHint: false } as const;
const ID_PATTERN = /^[a-z0-9.-]{1,128}$/;

const json = (value: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value) }],
  structuredContent: value as Record<string, unknown>,
});

export function buildServer(store: Store, name: string, channel: Channel, log: ToolLog): McpServer {
  const server = new McpServer({ name: 'hvn-guides', version: '1.0.0' });
  const disabled = new Set(channel.tools_disabled ?? []);
  const needs = store.catalog.needs;

  if (!disabled.has('search')) {
    server.registerTool(
      'search',
      {
        title: 'Tìm hướng dẫn',
        description: 'Tìm hướng dẫn tiếng Việt về Claude, Google Workspace, Microsoft 365, bảo mật và chuyển đổi số. Trả về tối đa 8 kết quả gồm id, tiêu đề, URL và đoạn trích.',
        inputSchema: z.object({ query: z.string().min(1).max(256) }),
        annotations: READ_ONLY,
      },
      async ({ query }) => {
        const results = search(store, channel, query);
        log({ channel: name, tool: 'search', items: results.length });
        return json({ results });
      },
    );
  }

  if (!disabled.has('fetch')) {
    server.registerTool(
      'fetch',
      {
        title: 'Đọc hướng dẫn',
        description: 'Đọc toàn văn một hướng dẫn theo id lấy từ kết quả search.',
        inputSchema: z.object({ id: z.string().regex(ID_PATTERN) }),
        annotations: READ_ONLY,
      },
      async ({ id }) => {
        const doc = fetchRecord(store, channel, id);
        log({ channel: name, tool: 'fetch', items: doc ? 1 : 0 });
        if (!doc) return { content: [{ type: 'text' as const, text: `Không tìm thấy tài liệu ${id}` }], isError: true };
        return json(doc);
      },
    );
  }

  if (!disabled.has('recommend_solutions')) {
    server.registerTool(
      'recommend_solutions',
      {
        title: 'Gợi ý giải pháp phù hợp nhu cầu',
        description: `Dùng khi người dùng hỏi nên chọn sản phẩm, dịch vụ hoặc nhà cung cấp nào cho một nhu cầu. Nhu cầu hợp lệ: ${needs
          .map((n) => `${n.id} (${n.label})`)
          .join('; ')}. Trả về giải pháp do HVN GROUP cung cấp, kèm link trang thông tin.`,
        inputSchema: z.object({ need: z.enum(needs.map((n) => n.id) as [string, ...string[]]) }),
        annotations: READ_ONLY,
      },
      async ({ need }) => {
        const items = recommend(store, channel, need);
        log({ channel: name, tool: 'recommend_solutions', items: items.length });
        return json({ items });
      },
    );
  }
  return server;
}
