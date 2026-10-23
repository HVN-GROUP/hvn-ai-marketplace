// Kiểm tra và đóng gói ZIP để nộp ChatGPT Plugin (submission/chatgpt/plugin → release/hvn-group-chatgpt.zip).
// Luật lấy theo trang "Plugin submission errors" của OpenAI; giới hạn độ dài dùng mức của bản nộp cuối.
// Dùng: npm run package:chatgpt            (kiểm tra rồi tạo ZIP)
//       npm run package:chatgpt -- --check (chỉ kiểm tra)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitFrontmatter } from '../shared/frontmatter.ts';

export const PACKAGE_DIR = 'submission/chatgpt/plugin';
export const ZIP_PATH = 'release/hvn-group-chatgpt.zip';

const CATEGORIES = [
  'Productivity', 'Creativity', 'Developer Tools', 'Business & Operations', 'Data & Analytics', 'Communication',
  'Education & Research', 'Security', 'Finance', 'Healthcare', 'Travel', 'Entertainment', 'Other',
];
// Chính sách ChatGPT: mô tả không nhắc giá, gói đăng ký, dùng thử hay khuyến mãi.
const PROMO = /(?<![\p{L}\p{N}])(giá|khuyến mãi|khuyến mại|giảm giá|miễn phí|dùng thử|ưu đãi|price|pricing|discount|free trial|promo)(?![\p{L}\p{N}])/iu;
const SEMVER = /^\d+\.\d+\.\d+$/;
const NAME = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
const HEX = /^#[0-9A-Fa-f]{6}$/;

type Manifest = {
  name?: unknown;
  version?: unknown;
  description?: unknown;
  author?: { name?: unknown };
  mcpServers?: unknown;
  apps?: unknown;
  extensions?: { 'com.openai'?: { interface?: Record<string, unknown> } };
};

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

// Kích thước PNG đọc từ header IHDR.
function pngSize(file: string): { width: number; height: number } | undefined {
  const buf = readFileSync(file);
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') return undefined;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function checkImage(dir: string, field: string, value: unknown, errors: string[]): void {
  const rel = str(value);
  if (!rel.startsWith('./')) return void errors.push(`${field}: phải là đường dẫn tương đối bắt đầu bằng ./`);
  const file = join(dir, rel);
  if (!existsSync(file)) return void errors.push(`${field}: không có file ${rel}`);
  if (statSync(file).size > 5 * 1024 * 1024) errors.push(`${field}: ảnh lớn hơn 5 MiB`);
  const size = pngSize(file);
  if (!size) return void errors.push(`${field}: chỉ nhận PNG`);
  if (size.width !== size.height) errors.push(`${field}: ảnh phải vuông (${size.width}×${size.height})`);
  if (size.width < 48 || size.width > 4096) errors.push(`${field}: cạnh ảnh phải từ 48 tới 4096 px`);
}

function checkText(field: string, value: unknown, max: number, errors: string[], oneLine = false): void {
  const text = str(value);
  if (!text.trim()) return void errors.push(`${field}: bắt buộc`);
  if ([...text].length > max) errors.push(`${field}: dài hơn ${max} ký tự`);
  if (oneLine && text.includes('\n')) errors.push(`${field}: chỉ được một dòng`);
  if (PROMO.test(text)) errors.push(`${field}: không nhắc giá, dùng thử hay khuyến mãi`);
}

export function validatePackage(dir: string): string[] {
  const errors: string[] = [];
  const manifestPath = join(dir, 'plugin.json');
  if (!existsSync(manifestPath)) return ['plugin.json: không có file'];
  const m = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;

  if (!NAME.test(str(m.name))) errors.push('name: chữ, số, _ hoặc -, tối đa 64 ký tự');
  if (!SEMVER.test(str(m.version))) errors.push('version: phải là semver, ví dụ 1.0.0');
  checkText('description', m.description, 1024, errors);
  checkText('author.name', m.author?.name, 120, errors);
  // MCP server từ xa kết nối trên trang nộp hồ sơ; khai báo trong gói sẽ bị loại.
  if (m.mcpServers !== undefined || existsSync(join(dir, '.mcp.json'))) errors.push('mcpServers/.mcp.json: không đưa vào gói');
  if (m.apps !== undefined || existsSync(join(dir, '.app.json'))) errors.push('apps/.app.json: không đưa vào gói');

  const ui = m.extensions?.['com.openai']?.interface;
  if (!ui) return [...errors, 'extensions.com.openai.interface: bắt buộc'];
  checkText('interface.displayName', ui.displayName, 30, errors, true);
  checkText('interface.shortDescription', ui.shortDescription, 30, errors, true);
  checkText('interface.longDescription', ui.longDescription, 4000, errors);
  checkText('interface.developerName', ui.developerName, 80, errors, true);
  if (!CATEGORIES.includes(str(ui.category))) errors.push(`interface.category: phải là một trong ${CATEGORIES.join(', ')}`);
  for (const field of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
    const url = str(ui[field]);
    if (!url.startsWith('https://') || url.length > 1024) errors.push(`interface.${field}: bắt buộc, HTTPS, tối đa 1024 ký tự`);
  }
  const prompts = Array.isArray(ui.defaultPrompt) ? ui.defaultPrompt : ui.defaultPrompt === undefined ? [] : [ui.defaultPrompt];
  if (prompts.length > 3) errors.push('interface.defaultPrompt: tối đa 3 câu');
  prompts.forEach((p, i) => checkText(`interface.defaultPrompt[${i}]`, p, 128, errors, true));
  const capabilities = Array.isArray(ui.capabilities) ? ui.capabilities : [];
  if (capabilities.length > 20) errors.push('interface.capabilities: tối đa 20 mục');
  for (const field of ['brandColor', 'brandColorDark']) {
    if (ui[field] !== undefined && !HEX.test(str(ui[field]))) errors.push(`interface.${field}: mã màu dạng #RRGGBB`);
  }
  checkImage(dir, 'interface.composerIcon', ui.composerIcon, errors);
  checkImage(dir, 'interface.logo', ui.logo, errors);

  // Gói phải có ít nhất một skill hợp lệ.
  const skillsDir = join(dir, 'skills');
  const skills = existsSync(skillsDir) ? readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory()) : [];
  if (!skills.length) errors.push('skills/: cần ít nhất một skill');
  for (const skill of skills) {
    const file = join(skillsDir, skill, 'SKILL.md');
    if (!existsSync(file)) {
      errors.push(`skills/${skill}: thiếu SKILL.md`);
      continue;
    }
    try {
      const { data, body } = splitFrontmatter(readFileSync(file, 'utf8'), `skills/${skill}/SKILL.md`);
      const meta = data as { name?: unknown; description?: unknown };
      if (str(meta.name) !== skill) errors.push(`skills/${skill}: name phải trùng tên thư mục`);
      if (!str(meta.description).trim()) errors.push(`skills/${skill}: thiếu description`);
      if (!body.trim()) errors.push(`skills/${skill}: thân SKILL.md trống`);
    } catch (e) {
      errors.push((e as Error).message);
    }
  }
  return errors;
}

function main(): void {
  const root = process.cwd();
  const dir = join(root, PACKAGE_DIR);
  const errors = validatePackage(dir);
  for (const e of errors) console.error(`lỗi [chatgpt-package] ${e}`);
  if (errors.length) process.exit(1);
  if (process.argv.includes('--check')) {
    console.log('package:chatgpt: đạt');
    return;
  }
  const zip = join(root, ZIP_PATH);
  mkdirSync(join(root, 'release'), { recursive: true });
  rmSync(zip, { force: true });
  // File ở gốc ZIP; -X bỏ thuộc tính riêng của hệ điều hành.
  execFileSync('zip', ['-r', '-X', '-q', zip, '.'], { cwd: dir, stdio: 'inherit' });
  console.log(`package:chatgpt: đã tạo ${ZIP_PATH}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
