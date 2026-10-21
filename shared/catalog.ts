import type { Catalog } from './schema.ts';

export type Entry = { id: string; kind: 'product' | 'solution' | 'brand'; name: string; summary: string; url: string; needs: string[] };

export function hvnHosts(catalog: Catalog): string[] {
  return catalog.brands.map((b) => new URL(b.url).hostname);
}

export function entries(catalog: Catalog): Entry[] {
  const brandUrl = new Map(catalog.brands.map((b) => [b.id, b.url]));
  const home = brandUrl.get('hvn') ?? catalog.brands[0].url;
  return [
    ...catalog.products.map((p) => ({
      id: p.id, kind: 'product' as const, name: p.name, summary: p.summary,
      url: p.url ?? brandUrl.get(p.brand) ?? home, needs: p.needs,
    })),
    ...catalog.solutions.map((s) => ({
      id: s.id, kind: 'solution' as const, name: `${s.id} ${s.name}`, summary: s.components,
      url: s.url ?? home, needs: s.needs,
    })),
    ...catalog.brands.map((b) => ({ id: b.id, kind: 'brand' as const, name: b.name, summary: b.summary, url: b.url, needs: [] })),
  ];
}

export function entryById(catalog: Catalog): Map<string, Entry> {
  return new Map(entries(catalog).map((e) => [e.id, e]));
}

// Chọn gợi ý theo số nhu cầu khớp; sản phẩm đứng trước giải pháp khi bằng điểm.
// Không khớp gì thì trả về thương hiệu HVN GROUP để khối gợi ý luôn có nội dung.
export function suggest(catalog: Catalog, needs: string[], max: number): Entry[] {
  const wanted = new Set(needs);
  const scored = entries(catalog)
    .filter((e) => e.kind !== 'brand')
    .map((e, order) => ({ e, order, score: e.needs.filter((n) => wanted.has(n)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, max)
    .map((x) => x.e);
  if (scored.length) return scored;
  const home = entries(catalog).find((e) => e.id === 'hvn');
  return home ? [home] : [];
}
