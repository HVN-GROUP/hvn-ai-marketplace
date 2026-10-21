import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { isIP } from 'node:net';
import { join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { entryById, hvnHosts } from '../shared/catalog.ts';
import { loadRepo, type Repo } from '../shared/load.ts';
import { internalLinks, refIds } from '../shared/render.ts';
import { CONTENT_TYPES, SLUG as SLUG_RE } from '../shared/schema.ts';
import { GENERATED_ROOTS, generate } from './build.ts';

export type Finding = { file: string; rule: string; message: string };

type TextContext = { allowed: string[]; examples: string[]; hvn: string[] };

const URL_RE = /https?:\/\/[^\s)<>\]"'`]+/gi;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,})/g;
// Mọi tên miền cấp cao, trừ đuôi file thường gặp trong hướng dẫn (SKILL.md, cau-hinh.json...).
const FQDN_RE = /\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+([a-z]{2,24})\b/gi;
const FILE_EXTENSIONS = new Set([
  'md', 'json', 'js', 'mjs', 'ts', 'sh', 'ps1', 'yaml', 'yml', 'txt', 'csv', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'pdf',
  'html', 'htm', 'css', 'py', 'exe', 'msi', 'zip', 'log', 'conf', 'env', 'xml', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'pem', 'crt', 'key', 'csr', 'pfx', 'ini', 'php', 'bak', 'tar', 'gz', 'dmg', 'pkg', 'apk', 'mp4', 'mp3', 'eml', 'ics',
]);
// Ứng viên số điện thoại; được xác nhận khi đủ 10–11 chữ số sau chuẩn hóa.
const PHONE_RE = /(?<![\w.])(?:\+84|\(?0)[\d ().-]{7,16}\d(?!\d)/g;
const IPV4_RE = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const IPV6_RE = /(?<![\w:])(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}(?![\w:])/gi;
const HOTLINE = '02499997777';
const CHECKOUT_RE = /cart\.php|\/checkout|\/cart\b|[?&]a=add\b/i;

const SECRET_PATTERNS: [string, RegExp][] = [
  ['khóa API', /\bsk-[A-Za-z0-9_-]{20,}/],
  ['khóa AWS', /\bAKIA[0-9A-Z]{16}\b/],
  ['token GitHub', /\bgh[pousr]_[A-Za-z0-9]{30,}/],
  ['token Slack', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['khóa Google API', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['khóa riêng', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];
const WHMCS_PATTERNS: [string, RegExp][] = [
  ['mã dịch vụ hoặc ticket', /#\d{4,}\b/],
  ['mã dịch vụ', /\b(?:id|mã)\s*dịch\s*vụ\s*[:#]?\s*\d+/i],
  ['số hóa đơn', /\b(?:invoice|hóa\s*đơn)\s*(?:số\s*)?#?\d{4,}/i],
];
const SH = String.raw`(?:sudo\s+)?(?:ba|z|da)?sh\b`;
const DANGEROUS_PATTERNS: [string, RegExp][] = [
  ['tải và chạy script từ xa', new RegExp(String.raw`\b(?:curl|wget)\b[^\n]*\|\s*${SH}`, 'i')],
  ['tải và chạy script từ xa', new RegExp(String.raw`\b${SH}\s*(?:-c\s*["']?\$\(|<\()\s*(?:curl|wget)\b`, 'i')],
  ['tải script rồi chạy', new RegExp(String.raw`\b(?:curl|wget)\b[^\n]*\s(?:-o|-O|--output)\b[^\n]*(?:&&|;)\s*${SH}`, 'i')],
  ['chạy chuỗi lệnh PowerShell', /\b(?:iex|Invoke-Expression)\b/i],
  ['tải script PowerShell', /\bDownload(?:String|File)\s*\(/i],
  ['lệnh PowerShell mã hóa', /\bpowershell\b[^\n]*\s-e(?:nc(?:odedcommand)?)?\s/i],
];

// Đường dẫn duy nhất được phép trong plugin; chặn hooks/, bin/, .mcp.json, commands/, agents/...
const PLUGIN_FILE_ALLOW = [
  /^plugins\/[^/]+\/\.claude-plugin\/plugin\.json$/,
  /^plugins\/[^/]+\/README\.md$/,
  /^plugins\/[^/]+\/LICENSE$/,
  /^plugins\/[^/]+\/skills\/[^/]+\/SKILL\.md$/,
  /^plugins\/[^/]+\/skills\/[^/]+\/references\/[^/]+\.md$/,
  /^\.claude-plugin\/marketplace\.json$/,
];

function hostMatches(host: string, domains: string[]): boolean {
  const h = host.toLowerCase();
  return domains.some((d) => h === d || h.endsWith(`.${d}`));
}

function isAllowedIp(ip: string): boolean {
  if (isIP(ip) === 6) return /^(?:2001:db8:|fe80:|::1$)/i.test(ip);
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 10 || a === 127 || ip === '0.0.0.0' ||
    (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) ||
    ip.startsWith('192.0.2.') || ip.startsWith('198.51.100.') || ip.startsWith('203.0.113.')
  );
}

export function textContext(repo: Repo): TextContext {
  return { allowed: repo.allowlist.domains, examples: repo.allowlist.example_domains, hvn: hvnHosts(repo.catalog) };
}

// Kiểm tra nội dung nguồn: link, PII, bí mật, lệnh nguy hiểm.
export function checkText(file: string, text: string, ctx: TextContext): Finding[] {
  const out: Finding[] = [];
  const add = (rule: string, message: string) => out.push({ file, rule, message });

  for (const url of text.match(URL_RE) ?? []) {
    let host: string;
    try {
      host = new URL(url).hostname;
    } catch {
      add('link', `URL không hợp lệ: ${url}`);
      continue;
    }
    if (!url.toLowerCase().startsWith('https://')) add('link', `chỉ dùng https: ${url}`);
    if (hostMatches(host, ctx.hvn)) add('link', `link HVN viết tay ${url}; dùng [[hvn:<id>]]`);
    else if (!hostMatches(host, [...ctx.allowed, ...ctx.examples])) add('link', `domain ngoài allowlist: ${host}`);
  }

  const withoutUrls = text.replace(URL_RE, ' ');
  for (const m of withoutUrls.matchAll(EMAIL_RE)) {
    if (!hostMatches(m[1], ['hvn.vn', ...ctx.examples])) add('pii', `email ${m[0]}`);
  }
  const withoutEmails = withoutUrls.replace(EMAIL_RE, ' ');
  for (const m of withoutEmails.matchAll(FQDN_RE)) {
    if (FILE_EXTENSIONS.has(m[1].toLowerCase())) continue;
    if (!hostMatches(m[0], [...ctx.allowed, ...ctx.examples, ...ctx.hvn])) add('pii', `tên miền ngoài allowlist: ${m[0]}`);
  }
  for (const phone of withoutEmails.match(PHONE_RE) ?? []) {
    const digits = phone.replace(/\D/g, '').replace(/^84/, '0');
    if ((digits.length === 10 || digits.length === 11) && digits !== HOTLINE) add('pii', `số điện thoại ${phone.trim()}`);
  }
  for (const ip of [...(withoutEmails.match(IPV4_RE) ?? []), ...(withoutEmails.match(IPV6_RE) ?? [])]) {
    if (isIP(ip) && !isAllowedIp(ip)) add('pii', `địa chỉ IP ${ip}`);
  }
  for (const [label, re] of [...WHMCS_PATTERNS, ...SECRET_PATTERNS]) {
    if (re.test(text)) add('pii', `có dấu hiệu ${label}`);
  }
  for (const [label, re] of DANGEROUS_PATTERNS) {
    if (re.test(text)) add('lenh-nguy-hiem', label);
  }
  return out;
}

// Kiểm tra quan hệ giữa catalog, cấu hình và nội dung.
export function checkRepo(repo: Repo): Finding[] {
  const out: Finding[] = [];
  const add = (file: string, rule: string, message: string) => out.push({ file, rule, message });
  const { catalog, channels } = repo;
  const needIds = new Set(catalog.needs.map((n) => n.id));
  const brandIds = new Set(catalog.brands.map((b) => b.id));
  const hvn = hvnHosts(catalog);
  const byId = entryById(catalog);
  const ctx = textContext(repo);

  const allIds = [...catalog.brands, ...catalog.products, ...catalog.solutions].map((e) => e.id);
  for (const id of allIds.filter((id, i) => allIds.indexOf(id) !== i)) add('catalog/products.yaml', 'catalog', `id trùng: ${id}`);
  for (const p of catalog.products) {
    if (!brandIds.has(p.brand)) add('catalog/products.yaml', 'catalog', `${p.id}: brand "${p.brand}" không tồn tại`);
  }
  for (const e of [...catalog.products, ...catalog.solutions]) {
    for (const n of e.needs) if (!needIds.has(n)) add('catalog/products.yaml', 'catalog', `${e.id}: need "${n}" không có trong needs`);
  }
  for (const e of byId.values()) {
    if (!hostMatches(new URL(e.url).hostname, hvn)) add('catalog/products.yaml', 'catalog', `${e.id}: URL phải thuộc domain HVN`);
    if (CHECKOUT_RE.test(e.url)) add('catalog/products.yaml', 'catalog', `${e.id}: URL trỏ tới giỏ hàng hoặc thanh toán`);
  }

  for (const ch of Object.values(channels.channels)) {
    if (!channels.utm.source_enum.includes(ch.utm_source)) add('config/channels.yaml', 'utm', `utm_source "${ch.utm_source}" thiếu trong source_enum`);
    if (ch.utm_medium && !channels.utm.medium_enum.includes(ch.utm_medium)) add('config/channels.yaml', 'utm', `utm_medium "${ch.utm_medium}" thiếu trong medium_enum`);
  }
  if (!channels.utm.medium_enum.includes(channels.utm.medium)) add('config/channels.yaml', 'utm', 'utm.medium thiếu trong medium_enum');
  if (!channels.channels.claude) add('config/channels.yaml', 'utm', 'thiếu kênh claude dùng để build plugin');

  // Mọi chuỗi được phát hành đều phải qua cùng bộ quét, không chỉ thân tài liệu.
  for (const e of [...catalog.brands, ...catalog.products, ...catalog.solutions]) {
    const texts = [e.name, 'summary' in e ? e.summary : '', 'components' in e ? e.components : ''];
    for (const t of texts) out.push(...checkText('catalog/products.yaml', t, ctx).filter((f) => !f.message.includes('link HVN')));
  }
  for (const n of catalog.needs) out.push(...checkText('catalog/products.yaml', n.label, ctx));

  for (const plugin of repo.plugins) {
    const pluginFile = `content/${plugin.id}/plugin.yaml`;
    if (!SLUG_RE.test(plugin.id)) add(pluginFile, 'schema', `tên plugin "${plugin.id}" phải là chữ thường, số và "-"`);
    for (const t of [plugin.meta.displayName, plugin.meta.description, ...(plugin.meta.keywords ?? [])]) {
      out.push(...checkText(pluginFile, t, ctx));
    }
    const itemFiles = new Set(plugin.skills.flatMap((s) => s.items.map((i) => i.file)));
    for (const skill of plugin.skills) {
      if (skill.meta.name !== skill.id) add(skill.file, 'skill', `name "${skill.meta.name}" phải trùng tên thư mục "${skill.id}"`);
      out.push(...checkText(skill.file, skill.intro, ctx), ...checkText(skill.file, skill.meta.description, ctx));
      for (const item of skill.items) {
        if (!SLUG_RE.test(item.id)) add(item.file, 'schema', 'tên file phải là chữ thường, số và "-" (ví dụ cau-hinh-dns.md)');
        out.push(...checkText(item.file, item.body, ctx));
        out.push(...checkText(item.file, item.meta.title, ctx));
        for (const src of item.meta.sources) {
          if (!hostMatches(new URL(src).hostname, [...ctx.allowed, ...hvn])) add(item.file, 'link', `nguồn ngoài allowlist: ${src}`);
        }
        for (const n of item.meta.needs) if (!needIds.has(n)) add(item.file, 'catalog', `need "${n}" không có trong catalog`);
        for (const id of refIds(item.body)) if (!byId.has(id)) add(item.file, 'catalog', `[[hvn:${id}]] không có trong catalog`);
        if (item.meta.type === 'tuan-thu' && !skill.id.startsWith('tuan-thu-')) {
          add(item.file, 'tuan-thu', 'item tuan-thu phải nằm trong skill có tiền tố "tuan-thu-" để CODEOWNERS bắt HVN Security duyệt');
        }
        for (const link of internalLinks(item.body)) {
          const target = posix.normalize(posix.join(posix.dirname(item.file), link));
          if (!itemFiles.has(target)) add(item.file, 'link-noi-bo', `liên kết tới tài liệu không tồn tại: ${link}`);
        }
      }
    }
  }
  return out;
}

function walk(root: string, rel: string, out: string[]): void {
  const abs = join(root, rel);
  if (!existsSync(abs)) return;
  for (const name of readdirSync(abs)) {
    const child = posix.join(rel, name);
    const st = lstatSync(join(root, child));
    if (st.isDirectory()) walk(root, child, out);
    else out.push(child);
  }
}

// So cây plugins/ trên đĩa với kết quả build: whitelist file, symlink, drift.
export function checkGenerated(root: string, expected: Map<string, string>): Finding[] {
  const out: Finding[] = [];
  const onDisk: string[] = [];
  for (const dir of GENERATED_ROOTS) walk(root, dir, onDisk);
  for (const file of onDisk) {
    if (lstatSync(join(root, file)).isSymbolicLink()) out.push({ file, rule: 'plugin-file', message: 'không được dùng symlink' });
    if (!PLUGIN_FILE_ALLOW.some((re) => re.test(file))) out.push({ file, rule: 'plugin-file', message: 'file không thuộc whitelist của plugin' });
    else if (!expected.has(file)) out.push({ file, rule: 'drift', message: 'file thừa so với build; chạy npm run build' });
    else if (readFileSync(join(root, file), 'utf8') !== expected.get(file)) out.push({ file, rule: 'drift', message: 'khác kết quả build; chạy npm run build' });
  }
  for (const file of expected.keys()) {
    if (!onDisk.includes(file)) out.push({ file, rule: 'drift', message: 'thiếu file sinh tự động; chạy npm run build' });
  }
  return out;
}

export function checkUtm(files: Map<string, string>, repo: Repo): Finding[] {
  const out: Finding[] = [];
  const pattern = new RegExp(repo.channels.utm.pattern);
  for (const [file, text] of files) {
    for (const url of text.match(URL_RE) ?? []) {
      const params = new URL(url).searchParams;
      for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
        const value = params.get(key);
        if (value !== null && !pattern.test(value)) out.push({ file, rule: 'utm', message: `${key}="${value}" sai pattern` });
      }
      const source = params.get('utm_source');
      if (source && !repo.channels.utm.source_enum.includes(source)) out.push({ file, rule: 'utm', message: `utm_source "${source}" ngoài source_enum` });
    }
  }
  return out;
}

export function checkFreshness(repo: Repo, today: Date): Finding[] {
  const out: Finding[] = [];
  for (const plugin of repo.plugins) {
    for (const skill of plugin.skills) {
      for (const item of skill.items) {
        const due = new Date(`${item.meta.reviewed}T00:00:00Z`);
        due.setUTCDate(due.getUTCDate() + item.meta.review_sla_days);
        if (due < today) out.push({ file: item.file, rule: 'freshness', message: `quá hạn duyệt lại từ ${due.toISOString().slice(0, 10)}` });
      }
    }
  }
  return out;
}

export function summarize(repo: Repo): string {
  const header = `| Plugin | ${CONTENT_TYPES.join(' | ')} | Tổng |`;
  const rows = repo.plugins.map((p) => {
    const items = p.skills.flatMap((s) => s.items);
    const counts = CONTENT_TYPES.map((t) => items.filter((i) => i.meta.type === t).length);
    return `| ${p.id} | ${counts.join(' | ')} | ${items.length} |`;
  });
  return [header, `|${'---|'.repeat(CONTENT_TYPES.length + 2)}`, ...rows].join('\n');
}

export function runChecks(root: string, opts: { today: Date }): { errors: Finding[]; warnings: Finding[]; repo?: Repo } {
  const { repo, errors: loadErrors } = loadRepo(root);
  if (loadErrors.length) {
    return { errors: loadErrors.map((m) => ({ file: m.split(':')[0], rule: 'schema', message: m })), warnings: [] };
  }
  const errors = checkRepo(repo);
  // Không sinh plugin khi nội dung còn lỗi tham chiếu; build sẽ ném lỗi ngay.
  if (!errors.length) {
    const { files } = generate(repo, readFileSync(join(root, 'LICENSE-CONTENT.md'), 'utf8'));
    errors.push(...checkGenerated(root, files), ...checkUtm(files, repo));
  }
  return { errors, warnings: checkFreshness(repo, opts.today), repo };
}

function main(): void {
  const args = process.argv.slice(2);
  const { errors, warnings, repo } = runChecks(process.cwd(), { today: new Date() });
  if (args.includes('--freshness')) errors.push(...warnings.splice(0));
  if (args.includes('--summary') && repo) console.log(summarize(repo));
  for (const w of warnings) console.warn(`cảnh báo [${w.rule}] ${w.file}: ${w.message}`);
  for (const e of errors) console.error(`lỗi [${e.rule}] ${e.file}: ${e.message}`);
  if (errors.length) {
    console.error(`check: ${errors.length} lỗi`);
    process.exit(1);
  }
  console.log(`check: đạt (${warnings.length} cảnh báo)`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
