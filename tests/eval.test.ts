import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCsv, score, sheet } from '../scripts/eval.ts';
import { loadRepoOrThrow } from '../shared/load.ts';

const ROOT = join(import.meta.dirname, '..');

describe('eval', () => {
  it('mỗi bộ eval có 30 câu và chỉ trỏ tới skill có thật', () => {
    const repo = loadRepoOrThrow(ROOT);
    for (const topic of ['hvn-claude', 'hvn-advisor']) {
      const csv = sheet(readFileSync(join(ROOT, `evals/${topic}.yaml`), 'utf8'));
      const rows = parseCsv(csv);
      expect(rows).toHaveLength(30);
      const skills = new Set(repo.topics.find((t) => t.id === topic)!.skills.map((s) => s.id));
      if (topic === 'hvn-advisor') skills.add('danh-muc-giai-phap-hvn');
      for (const row of rows) expect(skills).toContain(row[2]);
    }
  });

  it('tính tỷ lệ và áp ngưỡng', () => {
    const csv = [
      'topic,question,expected_skill,actual_skill,has_block',
      ...Array.from({ length: 9 }, (_, i) => `"p","q${i}, có dấu phẩy","a","a","1"`),
      '"p","q9","a","b","0"',
    ].join('\n');
    expect(score(csv)).toEqual({ skillRate: 0.9, blockRate: 1, passed: true });
  });

  it('từ chối bảng chưa điền đủ và chấp nhận xuống dòng CRLF', () => {
    const header = 'topic,question,expected_skill,actual_skill,has_block';
    expect(() => score([header, '"p","q1","a","a","1"', '"p","q2","a","",""'].join('\n'))).toThrow(/chưa điền/);
    expect(score([header, '"p","q1","a","a","1"'].join('\r\n') + '\r\n').passed).toBe(true);
  });
});
