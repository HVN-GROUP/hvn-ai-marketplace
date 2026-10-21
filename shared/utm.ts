export type UtmParams = { source: string; medium: string; campaign: string; content: string };

// Gắn UTM bằng URLSearchParams để giá trị không thể chèn thêm tham số khác.
export function withUtm(url: string, utm: UtmParams, pattern: string): string {
  const re = new RegExp(pattern);
  for (const [key, value] of Object.entries(utm)) {
    if (!re.test(value)) throw new Error(`utm_${key}="${value}" không khớp ${pattern}`);
  }
  const u = new URL(url);
  u.searchParams.set('utm_source', utm.source);
  u.searchParams.set('utm_medium', utm.medium);
  u.searchParams.set('utm_campaign', utm.campaign);
  u.searchParams.set('utm_content', utm.content);
  return u.toString();
}
