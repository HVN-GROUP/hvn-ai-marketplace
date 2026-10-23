import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { PACKAGE_DIR, validatePackage } from '../scripts/package-chatgpt.ts';

const ROOT = join(import.meta.dirname, '..');

const copies: string[] = [];
afterEach(() => {
  for (const dir of copies.splice(0)) rmSync(dir, { recursive: true, force: true });
});

// Bản sao gói thật để sửa từng trường mà không đụng repo.
function copy(): string {
  const dir = mkdtempSync(join(tmpdir(), 'hvn-chatgpt-'));
  copies.push(dir);
  cpSync(join(ROOT, PACKAGE_DIR), dir, { recursive: true });
  return dir;
}

function editManifest(dir: string, edit: (m: Record<string, any>) => void): void {
  const path = join(dir, 'plugin.json');
  const m = JSON.parse(readFileSync(path, 'utf8'));
  edit(m);
  writeFileSync(path, JSON.stringify(m));
}

const ui = (m: Record<string, any>) => m.extensions['com.openai'].interface;

describe('gói ChatGPT', () => {
  it('gói thật đạt mọi luật', () => {
    expect(validatePackage(join(ROOT, PACKAGE_DIR))).toEqual([]);
  });

  it('chặn mô tả ngắn quá 30 ký tự và tên hiển thị nhiều dòng', () => {
    const dir = copy();
    editManifest(dir, (m) => {
      ui(m).shortDescription = 'Hướng dẫn số cho doanh nghiệp Việt Nam';
      ui(m).displayName = 'HVN\nGROUP';
    });
    const errors = validatePackage(dir).join('\n');
    expect(errors).toMatch(/shortDescription: dài hơn 30/);
    expect(errors).toMatch(/displayName: chỉ được một dòng/);
  });

  it('chặn nhắc giá hoặc khuyến mãi trong mô tả', () => {
    const dir = copy();
    editManifest(dir, (m) => {
      ui(m).longDescription = 'Đăng ký ngay để nhận ưu đãi giá tốt.';
    });
    expect(validatePackage(dir).join('\n')).toMatch(/longDescription: không nhắc giá/);
  });

  it('chặn khai báo MCP server và danh mục lạ', () => {
    const dir = copy();
    editManifest(dir, (m) => {
      m.mcpServers = './.mcp.json';
      ui(m).category = 'Business';
    });
    const errors = validatePackage(dir).join('\n');
    expect(errors).toMatch(/mcpServers/);
    expect(errors).toMatch(/interface.category/);
  });

  it('chặn ảnh không vuông và gói không có skill', () => {
    const dir = copy();
    // Logo vuông được thay bằng icon có header sửa thành 512×256.
    const png = readFileSync(join(dir, 'assets/icon.png'));
    png.writeUInt32BE(256, 20);
    writeFileSync(join(dir, 'assets/logo.png'), png);
    rmSync(join(dir, 'skills'), { recursive: true });
    const errors = validatePackage(dir).join('\n');
    expect(errors).toMatch(/interface.logo: ảnh phải vuông/);
    expect(errors).toMatch(/skills\/: cần ít nhất một skill/);
  });
});
