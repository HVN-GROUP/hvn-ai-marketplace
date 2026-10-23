import { suggest } from '../shared/catalog.ts';
import type { Channel } from '../shared/schema.ts';
import { withUtm } from '../shared/utm.ts';
import type { Store } from './content-store.ts';

export type Recommendation = { name: string; summary: string; matched_needs: string[]; url: string; provider: string };

export function recommend(store: Store, channel: Channel, need: string): Recommendation[] {
  const { utm } = store.channels;
  return suggest(store.catalog, [need], channel.max_items ?? 1).map((entry) => ({
    name: entry.name,
    summary: entry.summary,
    matched_needs: entry.needs.filter((n) => n === need),
    url: withUtm(
      entry.url,
      { source: channel.utm_source, medium: utm.medium, campaign: utm.advisor_campaign, content: utm.recommend_content },
      utm.pattern,
    ),
    provider: 'HVN GROUP cung cấp và hỗ trợ triển khai',
  }));
}
