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
  'kv', 'rating', 'surface', 'muted', 'page', 'page-header', 'table-scroll', 'textarea', 'text-blank', 'modal', 'tabs', 'tab',
  'app-header', 'form-grid', 'filter-bar', 'section-header', 'choices', 'checkbox', 'checkbox-field', 'task-list', 'code', 'code-block', 'rm-toast', 'rm-tooltip', 'skeleton'];
const ALLOWED_TOKEN_OVERRIDES = new Set(['--font-display', '--font-body']);
// The real token names, read from the copy of tokens.css that ships with
// this script, so a check never guesses at what counts as a system token.
const here = dirname(fileURLToPath(import.meta.url));
// The version of the package this audit ships in: the floor it suggests.
const SELF_VERSION = JSON.parse(readFileSync(join(here, '../package.json'), 'utf8')).version;
const SYSTEM_TOKENS = new Set([...readFileSync(join(here, '../ui/tokens.css'), 'utf8')
  .matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

const findings = [];
// 'fix' findings break a rule. 'check' findings may be fine in context the
// audit can't see (a parent's background); a person looks and decides.
// --strict fails on 'fix' only.
const CHECK_RULES = new Set([6]);
const add = (rule, file, line, msg, level) => findings.push({ rule, file, line, msg, level: level ?? (CHECK_RULES.has(rule) ? 'check' : 'fix') });

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
  if (!/#semver:\^1\./.test(spec)) add(1, 'package.json', 0, `"${spec}" is not a version range; use github:russell-marketing/rm-brand-ui#semver:^${SELF_VERSION.replace(/\.\d+$/, '.0')}`);
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

const braceDelta = (t) => (t.match(/\{/g) ?? []).length - (t.match(/\}/g) ?? []).length;
const SX_RADII_ON_SCALE = new Set([0, 0.5, 0.75, 1]);
// A value ends at a comma, a closing brace, or the end of the line (the last
// property in a multi-line object often has no comma).
const END = String.raw`\s*(?:[,}]|$)`;
const FONT_SIZE_RE = new RegExp(String.raw`font-size\s*:\s*[\d.]+(px|rem|em)|fontSize\s*:\s*['"]?[\d.]+(px|rem|em)?['"]?` + END);
const RADIUS_RE = new RegExp(String.raw`borderRadius\s*:\s*(['"]?)([\d.]+)(px)?\1` + END);
// JSX tags whose sizes rule 13 and the icon exception care about.
const isIconTag = (t) => !!t && /(Icon|\.icon)$|^SvgIcon$/.test(t);
const ICON_SIZES = new Set([16, 20, 24]);
const FIELD_TAGS = new Set(['TextField', 'Select', 'FormControl', 'Autocomplete', 'DatePicker', 'input', 'select', 'textarea']);
// A width, min-width or grid minimum over 320px: it can't fit on a phone.
// In JS a bare number is pixels (sx treats 1 and under as a fraction).
const PHONE_PX = 320;
function widerThanPhone(raw, css) {
  // A media or container query's (min-width: …) describes the screen, not an element.
  const line = raw.replace(/\(\s*(?:min-|max-)?width\s*[:<>=][^)]*\)/g, '');
  const px = (v, unit) => (unit === 'rem' || unit === 'em' ? Number(v) * 16 : Number(v));
  const re = css
    ? /(?:^|[^-\w])(?:min-)?width\s*:\s*([\d.]+)(px|rem|em)|minmax\(\s*([\d.]+)(px|rem|em)/g
    : /\b(?:min)?[wW]idth\s*:\s*['"]?([\d.]+)(px|rem|em)?['"]?\s*(?:[,}]|$)|minmax\(\s*([\d.]+)(px|rem|em)/g;
  for (const m of line.matchAll(re)) {
    const v = m[1] ?? m[3];
    const unit = m[1] !== undefined ? m[2] : m[4];
    if (px(v, unit ?? 'px') > PHONE_PX) return true;
  }
  return false;
}

// The last JSX tag opened on a line, and whether its opening tag is still
// open at the end of the line (attributes on the following lines).
function lastTag(line) {
  const all = [...line.matchAll(/<([A-Za-z][\w.]*)/g)];
  if (!all.length) return null;
  const m = all[all.length - 1];
  const rest = line.slice(m.index + m[0].length).replace(/=>/g, '');
  return { name: m[1], open: !rest.includes('>') };
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
let importsLayout = false;
const pieceImports = [];

for (const file of files) {
  const rel = relative(appRoot, file);
  if (/ds-candidates\.css$/.test(rel)) continue; // the sanctioned place for rule-3 work
  const text = readFileSync(file, 'utf8');
  // A copy made by rm-brand-copy is the system's own CSS, not the app's (rule 12).
  if (text.slice(0, 300).includes('rm-brand-copy:')) continue;
  const isCss = /\.s?css$/.test(file);
  // In a CSS Module a bare .badge is local to that file; only :global(.x)
  // reaches a system class.
  const isModule = /\.module\.s?css$/.test(file);
  const lines = text.split('\n');
  // In JS files only look inside CSS-ish text: <style> template blocks,
  // style={{...}} objects and sx props. Everything in a .css file counts.
  let inStyleBlock = false;
  // sx={{…}} and style={{…}} usually span several lines. Track them by brace
  // depth so every line inside counts, and remember which kind: in sx a bare
  // number for borderRadius is a multiple of the theme's 8px, in style it is
  // pixels.
  let objKind = null;
  let objDepth = 0;
  let objTag = null;
  // sx={…} on the tag itself, as opposed to sx: {…} / style: {…} inside
  // another prop (a menu's paper, a slot).
  let objOnTag = false;
  // A JSX opening tag that spans lines, so its attributes know their tag.
  let openTag = null;

  lines.forEach((raw, i) => {
    const n = i + 1;
    const line = raw.replace(/\/\/.*$|\/\*.*?\*\//g, '');

    if (/brand-(ui|styles)\/adapters\/mui-theme/.test(line)) usesTheme = true;
    if (/brand-ui\/styles['"]|rm-ui\.entry\.css/.test(line)) importsStyles = true;
    if (/brand-ui\/layout['"]|layout\.entry\.css/.test(line)) importsLayout = true;
    const piece = line.match(/brand-(?:ui|styles)\/(tokens|core|dark|utilities|a11y|components\/[\w-]+)['"]/);
    if (piece && !/tokens\.js/.test(line)) pieceImports.push([rel, n, piece[1]]);

    if (!isCss) {
      if (/<style[\s>]/.test(line)) inStyleBlock = true;
      if (/<\/style>/.test(line)) inStyleBlock = false;
    }
    let kindHere = objKind;
    let tagHere = null;
    if (!isCss) {
      const t = lastTag(line);
      tagHere = t ? t.name : openTag;
      if (t) openTag = t.open ? t.name : null;
      else if (openTag && line.replace(/=>/g, '').includes('>')) openTag = null;
      // sx={…} on a component, or sx: {…} as a key (e.g. inside slotProps).
      const start = objKind ? null : line.match(/\b(sx|style)\s*(?:=|:)\s*\{/);
      if (start) {
        kindHere = objKind = start[1];
        objDepth = braceDelta(line.slice(start.index + start[0].length - 1));
        const before = lastTag(line.slice(0, start.index));
        objTag = before ? before.name : tagHere;
        objOnTag = start[0].includes('=');
      } else if (objKind) {
        objDepth += braceDelta(line);
      }
      if (objKind) tagHere = objTag;
      if (objDepth <= 0) objKind = null;
    }
    const cssContext = isCss || inStyleBlock;
    const jsStyleContext = !isCss && (kindHere !== null || /:\s*\{?\s*['"`]?(#|\d|rgba?\()/.test(line));

    // rule 4: restyling system classes / redefining system tokens
    // :not(.btn) excludes a system class rather than restyling it.
    const selector = line.includes('{') ? line.split('{')[0].replace(/:not\([^)]*\)/g, '') : '';
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
      // A fallback inside var(--real-token, …) is the system's own advice for
      // JS, not a hard-coded colour. A fallback on a name that isn't a token
      // is: that var() never resolves, so the fallback is all you ever get.
      const colourText = line.replace(/var\(\s*(--[\w-]+)\s*,[^)]*\)/g,
        (m, name) => (SYSTEM_TOKENS.has(name) ? `var(${name})` : m));
      if (STYLE_PROP.test(line) && /#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(colourText)) add(5, rel, n, `hard-coded colour: ${line.trim()}`);
      // An icon's fontSize is its size, not a text size: it goes on the icon
      // scale (16 / 20 / 24px), not the type scale.
      if (FONT_SIZE_RE.test(line)) {
        if (!isIconTag(tagHere)) add(5, rel, n, `font size not from --fs-*: ${line.trim()}`);
        else {
          const m = line.match(/fontSize\s*:\s*['"]?([\d.]+)(px|rem|em)?['"]?/);
          const px = m ? (m[2] === 'rem' || m[2] === 'em' ? Number(m[1]) * 16 : Number(m[1])) : null;
          if (px !== null && !ICON_SIZES.has(px)) add(5, rel, n, `icon size ${px}px is off the icon scale; use fontSize="small" | "medium" | "large" (16 / 20 / 24px): ${line.trim()}`);
        }
      }
      const radius = line.match(RADIUS_RE);
      if (/border-radius\s*:\s*\d+px/.test(line)) {
        add(5, rel, n, `radius not from --radius-*: ${line.trim()}`);
      } else if (radius) {
        // In sx, 0.5 / 0.75 / 1 are the theme's 4 / 6 / 8px: on the scale.
        const sxMultiple = kindHere === 'sx' && !radius[1] && !radius[3];
        if (!(sxMultiple && SX_RADII_ON_SCALE.has(Number(radius[2])))) {
          add(5, rel, n, sxMultiple
            ? `radius ${radius[2]} in sx is ${Number(radius[2]) * 8}px, past the scale (1 = 8px is the largest): ${line.trim()}`
            : `radius not from --radius-*: ${line.trim()}`);
        }
      }
      if (/font-family\s*:\s*(?!var\(|inherit|initial|unset)['"]?[A-Za-z]/.test(line) || /fontFamily\s*:\s*['"`](?!inherit)/.test(line)) {
        add(5, rel, n, `font not from --font-* / tokens.fonts (monospace: var(--font-mono) / tokens.fonts.mono): ${line.trim()}`);
      }
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

    // rule 13: narrow screens
    if (!isCss && tagHere === 'Tabs' && /variant\s*=\s*["'{]*fullWidth/.test(line)) {
      add(13, rel, n, 'tabs squeezed to share the width; remove variant="fullWidth" so they scroll (the theme makes tabs scrollable)');
    }
    // A fixed size, not 0 and not a percentage.
    let fieldWidth = false;
    if (FIELD_TAGS.has(tagHere) && kindHere !== null && objOnTag
        && new RegExp(String.raw`\b(min)?[wW]idth\s*:\s*['"]?[1-9][\d.]*(px|rem|em)?['"]?` + END).test(line)) {
      add(13, rel, n, `fixed width on a field; let .form-grid or .filter-bar set it: ${line.trim()}`);
      fieldWidth = true;
    }
    if ((cssContext || jsStyleContext) && !fieldWidth) {
      if (/(^|[^-\w])(min-)?width\s*:\s*['"]?100vw|\b(min)?[wW]idth\s*:\s*['"]100vw/.test(line)) {
        add(13, rel, n, `100vw is wider than the page when there is a scrollbar; use 100%: ${line.trim()}`);
      } else if ((cssContext || kindHere !== null) && widerThanPhone(line, cssContext)) {
        // In JS, only inside sx/style objects: elsewhere a width is data (an image's size).
        add(13, rel, n, `wider than a 320px phone; fine only if a max-width: 100% caps it: ${line.trim()}`, 'check');
      }
    }

    // deprecated names
    if (/class(Name)?=["'{`][^"'}`]*\bpill\b/.test(line)) add(8, rel, n, '.pill is deprecated; use .badge');
  });
}

/* ---------- rule 2: how the stylesheet is loaded ---------- */
// An MUI app on the theme + /layout loads /dark too when it turns dark mode
// on: that is the one piece allowed.
if (usesTheme && importsLayout) pieceImports.splice(0, pieceImports.length, ...pieceImports.filter(([, , piece]) => piece !== 'dark'));
if (pieceImports.length) {
  for (const [rel, n, piece] of pieceImports) add(2, rel, n, `imports a piece (${piece}); import '@russell-marketing/brand-ui/styles' once instead`);
} else if (!importsStyles && !usesTheme) {
  add(2, 'package.json', 0, 'never loads the stylesheet or the MUI theme');
}
// /layout is for MUI-only apps, alongside the theme. With the full
// stylesheet it is already included.
if (importsLayout && importsStyles) add(2, 'package.json', 0, "imports /layout and /styles; /styles already includes the layout classes, so drop /layout");
if (importsLayout && !usesTheme && !importsStyles) add(2, 'package.json', 0, "imports /layout without the MUI theme; /layout is for MUI-only apps, so import '@russell-marketing/brand-ui/styles' instead");

/* ---------- report ---------- */
const byRule = new Map();
for (const f of findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]);
const TITLES = {
  1: 'Install with a version range', 2: 'Load the whole stylesheet', 4: 'Never restyle a system class',
  5: 'No hard-coded design values', 6: 'Brand colours are never text colours',
  7: 'Every app supports dark mode', 8: 'Deprecated names', 13: 'Every screen works at phone width',
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
  const fix = list.filter((f) => f.level === 'fix').length;
  const counts = [fix && `${fix} to fix`, list.length - fix && `${list.length - fix} to check`].filter(Boolean).join(', ');
  console.log(`\n\x1b[1mRule ${rule}. ${TITLES[rule]}\x1b[0m  (${counts})`);
  for (const f of list) console.log(`  ${f.file}${f.line ? `:${f.line}` : ''}  ${f.level === 'check' ? '[check] ' : ''}${f.msg}`);
}
console.log(`\nTotal: ${[...byRule].sort(([a], [b]) => a - b).map(([r, l]) => `rule ${r}: ${l.length}`).join(', ')}`);
console.log(`\n${findings.length} finding(s). Rules: node_modules/@russell-marketing/brand-ui/RULES.md · Upgrading: node_modules/@russell-marketing/brand-ui/docs/\n`);
process.exit(STRICT && findings.some((f) => f.level === 'fix') ? 1 : 0);
