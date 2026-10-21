import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { z } from 'zod';

// Eval chạy tay trên claude.ai (cần tài khoản thật):
//   npm run eval:sheet -- evals/hvn-claude.yaml > evals/results/2026-10-21-hvn-claude.csv
// Người chạy điền cột actual_skill (skill Claude dùng) và has_block (1/0), rồi:
//   npm run eval:score -- evals/results/2026-10-21-hvn-claude.csv
export const THRESHOLDS = { skill: 0.8, block: 0.9 };

const evalSchema = z.strictObject({
  plugin: z.string(),
  questions: z.array(z.strictObject({ q: z.string(), skill: z.string() })).min(1),
});

const csvCell = (s: string) => `"${s.replace(/"/g, '""')}"`;

export function sheet(yamlText: string): string {
  const { plugin, questions } = evalSchema.parse(parse(yamlText));
  const rows = questions.map((x) => [plugin, x.q, x.skill, '', ''].map(csvCell).join(','));
  return ['plugin,question,expected_skill,actual_skill,has_block', ...rows].join('\n');
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.replace(/\r\n/g, '\n').trim().split('\n').slice(1)) {
    const cells: string[] = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted && ch === '"' && line[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = !quoted;
      else if (ch === ',' && !quoted) { cells.push(cell); cell = ''; }
      else cell += ch;
    }
    cells.push(cell);
    rows.push(cells.map((c) => c.trim()));
  }
  return rows;
}

export function score(csvText: string): { skillRate: number; blockRate: number; passed: boolean } {
  const rows = parseCsv(csvText);
  const missing = rows.filter((r) => !r[3] || !['0', '1'].includes(r[4] ?? ''));
  if (!rows.length || missing.length) {
    throw new Error(`còn ${missing.length} dòng chưa điền đủ actual_skill và has_block (0/1)`);
  }
  const correct = rows.filter((r) => r[3] === r[2]);
  const withBlock = correct.filter((r) => r[4] === '1');
  const skillRate = correct.length / rows.length;
  const blockRate = correct.length ? withBlock.length / correct.length : 0;
  return { skillRate, blockRate, passed: skillRate >= THRESHOLDS.skill && blockRate >= THRESHOLDS.block };
}

const [mode, file] = process.argv.slice(2);
if (mode === 'sheet' && file) console.log(sheet(readFileSync(file, 'utf8')));
else if (mode === 'score' && file) {
  const r = score(readFileSync(file, 'utf8'));
  console.log(`chọn đúng skill: ${(r.skillRate * 100).toFixed(0)}% (ngưỡng ${THRESHOLDS.skill * 100}%)`);
  console.log(`có khối gợi ý: ${(r.blockRate * 100).toFixed(0)}% (ngưỡng ${THRESHOLDS.block * 100}%)`);
  process.exit(r.passed ? 0 : 1);
} else if (mode) {
  console.error('cách dùng: node scripts/eval.ts sheet|score <file>');
  process.exit(2);
}
