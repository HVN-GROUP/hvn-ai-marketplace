import { parse } from 'yaml';

export type Parsed = { data: unknown; body: string };

// Chỉ chấp nhận fence "---" thuần. Mọi biến thể như "---js" bị từ chối để
// không parser nào có cơ hội thực thi frontmatter.
export function splitFrontmatter(source: string, file: string): Parsed {
  const text = source.replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) {
    throw new Error(`${file}: file phải bắt đầu bằng dòng "---"`);
  }
  const end = text.indexOf('\n---\n', 3);
  const endAtEof = text.endsWith('\n---') ? text.length - 4 : -1;
  const close = end !== -1 ? end : endAtEof;
  if (close === -1) throw new Error(`${file}: thiếu dòng "---" đóng frontmatter`);
  const data = parse(text.slice(4, close), { schema: 'core' }) ?? {};
  const body = text.slice(close + 5).replace(/^\n+/, '');
  return { data, body };
}
