import MiniSearch from 'minisearch';
import type { IndexRecord } from '../scripts/build.ts';
import { entryById } from '../shared/catalog.ts';
import { renderRefs } from '../shared/render.ts';
import type { Catalog, Channel, ChannelsConfig } from '../shared/schema.ts';
import { withUtm } from '../shared/utm.ts';
import { expandQuery, tokenize } from './vietnamese.ts';

export type Store = {
  catalog: Catalog;
  channels: ChannelsConfig;
  byId: Map<string, IndexRecord>;
  index: MiniSearch<IndexRecord>;
};

export type SearchResult = { id: string; title: string; url: string; snippet: string };

export function createStore(records: IndexRecord[], catalog: Catalog, channels: ChannelsConfig): Store {
  const index = new MiniSearch<IndexRecord>({
    fields: ['title', 'text'],
    storeFields: [],
    tokenize,
    processTerm: (term) => term,
    searchOptions: { boost: { title: 3 }, combineWith: 'OR' },
  });
  index.addAll(records);
  return { catalog, channels, byId: new Map(records.map((r) => [r.id, r])), index };
}

// Chỉ kênh có `mcp: true` mới được phục vụ qua server.
export function mcpChannel(store: Store, name: string): Channel | undefined {
  const channel = store.channels.channels[name];
  return channel?.mcp ? channel : undefined;
}

function visible(record: IndexRecord, channel: Channel): boolean {
  return !(channel.exclude_types ?? []).includes(record.type as never);
}

function snippet(text: string): string {
  const plain = text.replace(/^#.*$/gm, '').replace(/\[\[hvn:[^\]]+\]\]/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > 200 ? `${plain.slice(0, 197)}...` : plain;
}

export function search(store: Store, channel: Channel, query: string, limit = 8): SearchResult[] {
  return store.index
    .search(expandQuery(query))
    .map((hit) => store.byId.get(hit.id as string)!)
    .filter((r) => visible(r, channel))
    .slice(0, limit)
    .map((r) => ({ id: r.id, title: r.title, url: r.url, snippet: snippet(r.text) }));
}

// Văn bản trả cho model: tham chiếu sản phẩm thành link trang thông tin có UTM của kênh.
// Không chèn khối gợi ý và không có chỉ dẫn nào cho model.
export function fetchRecord(store: Store, channel: Channel, id: string) {
  const record = store.byId.get(id);
  if (!record || !visible(record, channel)) return undefined;
  const entries = entryById(store.catalog);
  // Không nhắc tới tài liệu mà kênh này không phục vụ (ví dụ chon-goi trên ChatGPT).
  const linked = record.text.replace(/ \(mã tài liệu: ([a-z0-9.-]+)\)/g, (all, id: string) => {
    const target = store.byId.get(id);
    return target && visible(target, channel) ? all : '';
  });
  const text = renderRefs(linked, (refId) => {
    const entry = entries.get(refId);
    if (!entry) return refId;
    const url = withUtm(
      entry.url,
      { source: channel.utm_source, medium: store.channels.utm.medium, campaign: record.plugin, content: record.id },
      store.channels.utm.pattern,
    );
    return `[${entry.name}](${url})`;
  });
  return {
    id: record.id,
    title: record.title,
    text,
    url: record.url,
    metadata: { plugin: record.plugin, type: record.type, reviewed: record.reviewed },
  };
}
