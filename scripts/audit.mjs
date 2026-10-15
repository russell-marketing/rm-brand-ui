#!/usr/bin/env node
/* scripts/audit.mjs — `npx rm-brand-audit` in an app that uses this system.
 *
 * Checks the app against RULES.md and lists every finding with its file,
 * line and rule number. Report only by default; --strict exits 1 on any
 * finding, for CI.
 *
 *   npx rm-brand-audit [dir] [--strict]
 *
 * It reads source text with patterns, so it can be wrong in both directions.
 * A false finding is worth raising: it means a rule or this check needs work.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const appRoot = args.find((a) => !a.startsWith('--')) ?? process.cwd();

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'out', 'coverage', '.vercel', 'public']);
const EXTS = new Set(['.css', '.scss', '.tsx', '.jsx', '.ts', '.js', '.html']);
const SYSTEM_CLASSES = ['btn', 'badge', 'pill', 'tag', 'table', 'alert', 'input', 'select', 'stat', 'stats',
  'kv', 'rating', 'surface', 'muted', 'modal', 'tabs', 'rm-toast', 'rm-tooltip', 'skeleton'];
const ALLOWED_TOKEN_OVERRIDES = new Set(['--font-display', '--font-body']);
// The real token names, read from the copy of tokens.css that ships with
// this script, so a check never guesses at what counts as a system token.
const here = dirname(fileURLToPath(import.meta.url));
const SYSTEM_TOKENS = new Set([...readFileSync(join(here, '../ui/tokens.css'), 'utf8')
  .matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

const findings = [];
// 'fix' findings break a rule. 'check' findings may be fine in context the
// audit can't see (a parent's background); a person looks and decides.
// --strict fails on 'fix' only.
const CHECK_RULES = new Set([6]);
const add = (rule, file, line, msg) => findings.push({ rule, file, line, msg, level: CHECK_RULES.has(rule) ? 'check' : 'fix' });

/* ---------- rule 1: the dependency ---------- */
const pkgPath = join(appRoot, 'package.json');
if (!existsSync(pkgPath)) {
  console.error(`No package.json in ${appRoot}`);
  process.exit(2);
}
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const depName = Object.keys(deps).find((n) => /^@russell-marketing\/brand-(ui|styles)$/.test(n));
if (!depName) {
  add(1, 'package.json', 0, 'does not depend on @russell-marketing/brand-ui');
} else {
  const spec = deps[depName];
  if (depName !== '@russell-marketing/brand-ui') add(1, 'package.json', 0, `old package name ${depName}; use @russell-marketing/brand-ui`);
  if (/cd-space-dot-dot|rm-internal-ui-styles|rm-brand-styles/.test(spec)) add(1, 'package.json', 0, `old repository in "${spec}"; use russell-marketing/rm-brand-ui`);
  if (!/#semver:\^1\./.test(spec)) add(1, 'package.json', 0, `"${spec}" is not a version range; use github:russell-marketing/rm-brand-ui#semver:^1.5.0`);
}

// The CSS rule block around line i: back to its '{', forward to its '}'.
function brandBackgroundInBlock(lines, i) {
  let a = i, b = i;
  while (a > 0 && !lines[a].includes('{') && i - a < 20) a--;
  while (b < lines.length - 1 && !lines[b].includes('}') && b - i < 20) b++;
  const block = lines.slice(a, b + 1).join('\n');
  const inner = block.slice(block.lastIndexOf('{', block.indexOf(lines[i])) + 1);
  return /background(-color)?\s*:\s*['"]?var\(--rm-/.test(inner.split('}')[0] + lines.slice(a, i + 1).join(''));
}

/* ---------- source files ---------- */
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (SKIP_DIRS.has(e) || e.startsWith('.')) continue;
    // Top-level _folders and docs/ hold prototypes, intake and notes, not the
    // app. Deeper _folders are real code (Next.js private folders).
    if (dir === appRoot && (e.startsWith('_') || e === 'docs')) continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (EXTS.has(extname(e)) && !e.endsWith('.d.ts') && !/\.(test|spec)\./.test(e)) files.push(p);
  }
})(appRoot);

const STYLE_PROP = /(color|background|border|outline|fill|stroke|shadow)/i;
const sysClassRe = new RegExp(`\\.(${SYSTEM_CLASSES.join('|')})(?![\\w-])`);
let usesTheme = false;
let importsStyles = false;
const pieceImports = [];

for (const file of files) {
  const rel = relative(appRoot, file);
  if (/ds-candidates\.css$/.test(rel)) continue; // the sanctioned place for rule-3 work
  const isCss = /\.s?css$/.test(file);
  // In a CSS Module a bare .badge is local to that file; only :global(.x)
  // reaches a system class.
  const isModule = /\.module\.s?css$/.test(file);
  const lines = readFileSync(file, 'utf8').split('\n');
  // In JS files only look inside CSS-ish text: <style> template blocks,
  // style={{...}} objects and sx props. Everything in a .css file counts.
  let inStyleBlock = false;

  lines.forEach((raw, i) => {
    const n = i + 1;
    const line = raw.replace(/\/\/.*$|\/\*.*?\*\//g, '');

    if (/brand-(ui|styles)\/adapters\/mui-theme/.test(line)) usesTheme = true;
    if (/brand-ui\/styles['"]|rm-ui\.entry\.css/.test(line)) importsStyles = true;
    const piece = line.match(/brand-(?:ui|styles)\/(tokens|core|dark|utilities|a11y|components\/[\w-]+)['"]/);
    if (piece && !/tokens\.js/.test(line)) pieceImports.push([rel, n, piece[1]]);

    if (!isCss) {
      if (/<style[\s>]/.test(line)) inStyleBlock = true;
      if (/<\/style>/.test(line)) inStyleBlock = false;
    }
    const cssContext = isCss || inStyleBlock;
    const jsStyleContext = !isCss && /(style=\{\{|sx=\{|:\s*\{?\s*['"`]?[#\d])/.test(line);

    // rule 4: restyling system classes / redefining system tokens
    const selector = line.includes('{') ? line.split('{')[0] : '';
    const hitsSystemClass = isModule
      ? [...selector.matchAll(/:global\(([^)]*)\)/g)].some((m) => sysClassRe.test(m[1]))
      : sysClassRe.test(selector);
    if (cssContext && hitsSystemClass) add(4, rel, n, `restyles a system class: ${selector.trim()}`);
    if (cssContext || jsStyleContext) {
      for (const m of line.matchAll(/['"]?(--[\w-]+)['"]?\s*:/g)) {
        if (SYSTEM_TOKENS.has(m[1]) && !ALLOWED_TOKEN_OVERRIDES.has(m[1])) add(4, rel, n, `redefines system token ${m[1]}`);
      }
    }

    // rule 5: hard-coded design values
    if (cssContext || jsStyleContext) {
      if (STYLE_PROP.test(line) && /#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(line)) add(5, rel, n, `hard-coded colour: ${line.trim()}`);
      if (/font-size\s*:\s*[\d.]+(px|rem|em)|fontSize\s*:\s*['"]?[\d.]+(px|rem|em)?['"]?\s*[,}]/.test(line)) add(5, rel, n, `font size not from --fs-*: ${line.trim()}`);
      if (/border-radius\s*:\s*\d+px|borderRadius\s*:\s*['"]?\d+(px)?['"]?\s*[,}]/.test(line)) add(5, rel, n, `radius not from --radius-*: ${line.trim()}`);
    }

    // rule 6: brand colour used as text
    // Fine when the same rule block sets a brand background (Moon on Space):
    // both stay fixed in dark mode, so the pair keeps its contrast.
    if ((cssContext || jsStyleContext) && /(^|[^-\w])color\s*:\s*['"]?var\(--rm-/.test(line)
        && !brandBackgroundInBlock(lines, i)) {
      add(6, rel, n, `brand colour as text: fine if a parent has a brand background (Moon on Space); otherwise use a role token (--text-brand, --accent-ink): ${line.trim()}`);
    }

    // rule 7: opted out of dark mode
    if (/data-theme=["']light["']|setAttribute\(\s*['"]data-theme['"]\s*,\s*['"]light['"]\)/.test(line)) {
      add(7, rel, n, 'forces the light theme; allowed only as a temporary step with a backlog item');
    }

    // deprecated names
    if (/class(Name)?=["'{`][^"'}`]*\bpill\b/.test(line)) add(8, rel, n, '.pill is deprecated; use .badge');
  });
}

/* ---------- rule 2: how the stylesheet is loaded ---------- */
if (pieceImports.length) {
  for (const [rel, n, piece] of pieceImports) add(2, rel, n, `imports a piece (${piece}); import '@russell-marketing/brand-ui/styles' once instead`);
} else if (!importsStyles && !usesTheme) {
  add(2, 'package.json', 0, 'never loads the stylesheet or the MUI theme');
}

/* ---------- report ---------- */
const byRule = new Map();
for (const f of findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]);
const TITLES = {
  1: 'Install with a version range', 2: 'Load the whole stylesheet', 4: 'Never restyle a system class',
  5: 'No hard-coded design values', 6: 'Brand colours are never text colours',
  7: 'Every app supports dark mode', 8: 'Deprecated names',
};
const ver = (() => {
  try { return JSON.parse(readFileSync(join(appRoot, 'node_modules/@russell-marketing/brand-ui/package.json'), 'utf8')).version; }
  catch { return 'not installed'; }
})();

console.log(`\nrm-brand-audit  ${relative(process.cwd(), appRoot) || '.'}  (installed brand-ui: ${ver})`);
if (!findings.length) {
  console.log('\n\x1b[32mNo findings.\x1b[0m\n');
  process.exit(0);
}
for (const rule of [...byRule.keys()].sort((a, b) => a - b)) {
  const list = byRule.get(rule);
  const tag = CHECK_RULES.has(rule) ? 'check' : 'fix';
  console.log(`\n\x1b[1mRule ${rule}. ${TITLES[rule]}\x1b[0m  (${list.length} to ${tag})`);
  for (const f of list) console.log(`  ${f.file}${f.line ? `:${f.line}` : ''}  ${f.msg}`);
}
console.log(`\nTotal: ${[...byRule].sort(([a], [b]) => a - b).map(([r, l]) => `rule ${r}: ${l.length}`).join(', ')}`);
console.log(`\n${findings.length} finding(s). Rules: node_modules/@russell-marketing/brand-ui/RULES.md\n`);
process.exit(STRICT && findings.some((f) => f.level === 'fix') ? 1 : 0);
