import type { Entry } from './catalog.ts';

export const REF = /\[\[hvn:([A-Za-z0-9-]+)\]\]/g;
const INTERNAL_LINK = /\]\((\.\.?\/[^)\s]+\.md)\)/g;

export function refIds(text: string): string[] {
  return [...text.matchAll(REF)].map((m) => m[1]);
}

export function renderRefs(text: string, render: (id: string) => string): string {
  return text.replace(REF, (_, id: string) => render(id));
}

export function internalLinks(text: string): string[] {
  return [...text.matchAll(INTERNAL_LINK)].map((m) => m[1]);
}

// Nguồn: "./item.md" (cùng skill) hoặc "../skill/item.md" (skill khác).
// Plugin: mọi item nằm ở skills/<skill>/references/<item>.md.
export function rewriteLinksForPlugin(text: string): string {
  return text.replace(INTERNAL_LINK, (_, link: string) => {
    const other = link.match(/^\.\.\/([^/]+)\/([^/]+\.md)$/);
    return other ? `](../../${other[1]}/references/${other[2]})` : `](${link})`;
  });
}

export const SUGGESTION_HEADING = 'Giải pháp liên quan từ HVN GROUP';

export function suggestionBlock(items: { entry: Entry; url: string }[]): string {
  const lines = items.map(
    ({ entry, url }) => `- **${entry.name}** (Sản phẩm của HVN GROUP): ${entry.summary}. [Xem chi tiết](${url})`,
  );
  return `\n---\n\n### ${SUGGESTION_HEADING}\n\n${lines.join('\n')}\n`;
}
