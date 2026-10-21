// Chuẩn hóa tiếng Việt để "khoi phuc" khớp "khôi phục".
export function fold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase();
}

// Âm tiết đơn khớp quá rộng ("sao" có trong mọi thứ), nên thêm cụm 2 âm tiết để
// tài liệu chứa đúng cụm từ được xếp cao hơn.
export function tokenize(text: string): string[] {
  const words = fold(text).split(/[^a-z0-9]+/).filter(Boolean);
  const pairs = words.slice(1).map((w, i) => `${words[i]}_${w}`);
  return [...words, ...pairs];
}

const ABBREVIATIONS: Record<string, string> = {
  gg: 'google',
  gws: 'google workspace',
  m365: 'microsoft 365',
  o365: 'microsoft 365',
  ms: 'microsoft',
};

export function expandQuery(query: string): string {
  return fold(query)
    .split(/\s+/)
    .map((w) => ABBREVIATIONS[w] ?? w)
    .join(' ');
}
