import { readFileSync, readdirSync, existsSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { z } from 'zod';
import { splitFrontmatter } from './frontmatter.ts';
import {
  allowlistSchema,
  catalogSchema,
  channelsSchema,
  itemMetaSchema,
  pluginConfigSchema,
  skillMetaSchema,
  topicMetaSchema,
  type Allowlist,
  type Catalog,
  type ChannelsConfig,
  type ItemMeta,
  type PluginConfig,
  type SkillMeta,
  type TopicMeta,
} from './schema.ts';

export type Item = { id: string; file: string; meta: ItemMeta; body: string };
export type Skill = { id: string; file: string; meta: SkillMeta; intro: string; items: Item[] };
export type Topic = { id: string; meta: TopicMeta; skills: Skill[] };
export type Repo = {
  root: string;
  catalog: Catalog;
  channels: ChannelsConfig;
  allowlist: Allowlist;
  plugin: PluginConfig;
  topics: Topic[];
};

// Lỗi được gom lại thay vì ném ngay, để check.ts báo tất cả trong một lần chạy.
export type LoadResult = { repo: Repo; errors: string[] };

function formatIssues(file: string, error: z.ZodError): string[] {
  return error.issues.map((i) => `${file}: ${i.path.join('.') || '(gốc)'} — ${i.message}`);
}

function readYaml<T>(root: string, rel: string, schema: z.ZodType<T>, errors: string[]): T | undefined {
  const raw = parse(readFileSync(join(root, rel), 'utf8'), { schema: 'core' });
  const result = schema.safeParse(raw);
  if (!result.success) {
    errors.push(...formatIssues(rel, result.error));
    return undefined;
  }
  return result.data;
}

function readMarkdown<T>(
  root: string,
  rel: string,
  schema: z.ZodType<T>,
  errors: string[],
): { meta: T; body: string } | undefined {
  let parsed;
  try {
    parsed = splitFrontmatter(readFileSync(join(root, rel), 'utf8'), rel);
  } catch (e) {
    errors.push((e as Error).message);
    return undefined;
  }
  const result = schema.safeParse(parsed.data);
  if (!result.success) {
    errors.push(...formatIssues(rel, result.error));
    return undefined;
  }
  return { meta: result.data, body: parsed.body };
}

function dirs(path: string): string[] {
  if (!existsSync(path)) return [];
  return readdirSync(path)
    .filter((name) => lstatSync(join(path, name)).isDirectory())
    .sort();
}

export function loadRepo(root: string): LoadResult {
  const errors: string[] = [];
  const catalog = readYaml(root, 'catalog/products.yaml', catalogSchema, errors);
  const channels = readYaml(root, 'config/channels.yaml', channelsSchema, errors);
  const allowlist = readYaml(root, 'config/link-allowlist.yaml', allowlistSchema, errors);
  const plugin = readYaml(root, 'config/plugin.yaml', pluginConfigSchema, errors);

  const topics: Topic[] = [];
  for (const topicId of dirs(join(root, 'content'))) {
    const topicRel = `content/${topicId}`;
    if (!existsSync(join(root, topicRel, 'topic.yaml'))) {
      errors.push(`${topicRel}: thiếu topic.yaml`);
      continue;
    }
    const meta = readYaml(root, `${topicRel}/topic.yaml`, topicMetaSchema, errors);
    const skills: Skill[] = [];
    for (const skillId of dirs(join(root, topicRel))) {
      const skillRel = `${topicRel}/${skillId}`;
      const skillFile = `${skillRel}/SKILL.md`;
      if (!existsSync(join(root, skillFile))) {
        errors.push(`${skillRel}: thiếu SKILL.md`);
        continue;
      }
      const skill = readMarkdown(root, skillFile, skillMetaSchema, errors);
      const items: Item[] = [];
      for (const name of readdirSync(join(root, skillRel)).sort()) {
        if (name === 'SKILL.md' || !name.endsWith('.md')) continue;
        const itemFile = `${skillRel}/${name}`;
        const item = readMarkdown(root, itemFile, itemMetaSchema, errors);
        if (item) items.push({ id: name.slice(0, -3), file: itemFile, meta: item.meta, body: item.body });
      }
      if (skill) skills.push({ id: skillId, file: skillFile, meta: skill.meta, intro: skill.body, items });
    }
    if (meta) topics.push({ id: topicId, meta, skills });
  }

  // Khi cấu hình gốc hỏng, `errors` khác rỗng và mọi nơi gọi đều dừng trước khi dùng repo.
  return { repo: { root, catalog: catalog!, channels: channels!, allowlist: allowlist!, plugin: plugin!, topics }, errors };
}

// Server MCP chỉ cần catalog và cấu hình kênh, không cần nội dung nguồn.
export function loadConfig(root: string): { catalog: Catalog; channels: ChannelsConfig } {
  const errors: string[] = [];
  const catalog = readYaml(root, 'catalog/products.yaml', catalogSchema, errors);
  const channels = readYaml(root, 'config/channels.yaml', channelsSchema, errors);
  if (errors.length || !catalog || !channels) throw new Error(`Cấu hình không hợp lệ:\n${errors.join('\n')}`);
  return { catalog, channels };
}

export function loadRepoOrThrow(root: string): Repo {
  const { repo, errors } = loadRepo(root);
  if (errors.length) throw new Error(`Nội dung nguồn không hợp lệ:\n${errors.join('\n')}`);
  return repo;
}
