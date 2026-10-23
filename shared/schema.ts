import { z } from 'zod';

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CONTENT_TYPES = ['playbook', 'cau-hinh', 'chon-goi', 'tuan-thu', 'lo-trinh'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

const slug = z.string().regex(SLUG, 'phải là chữ thường, số và dấu "-"');
const httpsUrl = z.url({ protocol: /^https$/ });

export const catalogSchema = z.strictObject({
  needs: z.array(z.strictObject({ id: slug, label: z.string().min(1) })).min(1),
  brands: z.array(z.strictObject({ id: slug, name: z.string(), url: httpsUrl, summary: z.string() })).min(1),
  products: z.array(
    z.strictObject({
      id: slug,
      brand: slug,
      name: z.string(),
      summary: z.string(),
      url: httpsUrl.optional(),
      needs: z.array(slug).min(1),
    }),
  ),
  solutions: z.array(
    z.strictObject({
      id: z.string().regex(/^S\d{2}$/),
      name: z.string(),
      components: z.string(),
      url: httpsUrl.optional(),
      needs: z.array(slug).min(1),
    }),
  ),
});
export type Catalog = z.infer<typeof catalogSchema>;

const channelSchema = z.strictObject({
  upsell: z.enum(['strong', 'relevant']).optional(),
  max_items: z.number().int().min(1).max(5).optional(),
  utm_source: slug,
  utm_medium: slug.optional(),
  mcp: z.boolean().optional(),
  exclude_types: z.array(z.enum(CONTENT_TYPES)).optional(),
  tools_disabled: z.array(z.enum(['search', 'fetch', 'recommend_solutions'])).optional(),
});
export type Channel = z.infer<typeof channelSchema>;

export const channelsSchema = z.strictObject({
  channels: z.record(slug, channelSchema),
  utm: z.strictObject({
    medium: slug,
    source_enum: z.array(slug).min(1),
    medium_enum: z.array(slug).min(1),
    advisor_campaign: slug,
    recommend_content: slug,
    email_campaign: slug,
    pattern: z.string(),
  }),
});
export type ChannelsConfig = z.infer<typeof channelsSchema>;

export const allowlistSchema = z.strictObject({
  domains: z.array(z.string().min(3)),
  example_domains: z.array(z.string().min(3)),
});
export type Allowlist = z.infer<typeof allowlistSchema>;

// Plugin duy nhất phát hành trên Claude; mọi chủ đề trong content/ được gộp vào đây.
export const pluginConfigSchema = z.strictObject({
  name: z.string().max(64).regex(SLUG),
  displayName: z.string().min(1),
  description: z.string().min(1).max(1024),
  keywords: z.array(z.string()),
});
export type PluginConfig = z.infer<typeof pluginConfigSchema>;

// Một chủ đề = một thư mục content/<chủ-đề>/ (ví dụ hvn-claude). Mã chủ đề là utm_campaign và tiền tố mã tài liệu.
export const topicMetaSchema = z.strictObject({
  displayName: z.string().min(1),
  description: z.string().min(1).max(1024),
});
export type TopicMeta = z.infer<typeof topicMetaSchema>;

// Bộ trường hợp lệ trên claude.ai và chuẩn Agent Skills.
export const skillMetaSchema = z.strictObject({
  name: z.string().max(64).regex(SLUG),
  description: z.string().min(1).max(1024),
});
export type SkillMeta = z.infer<typeof skillMetaSchema>;

export const itemMetaSchema = z.strictObject({
  title: z.string().min(1).max(200),
  type: z.enum(CONTENT_TYPES),
  needs: z.array(slug).min(1),
  reviewed: z.iso.date(),
  review_sla_days: z.number().int().min(30).max(365),
  sources: z.array(httpsUrl).min(1),
});
export type ItemMeta = z.infer<typeof itemMetaSchema>;
