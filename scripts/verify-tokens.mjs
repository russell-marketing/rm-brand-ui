#!/usr/bin/env node
/* scripts/verify-tokens.mjs
 *
 * Three things that used to be done by hand, or not at all:
 *   1. Every var(--x) with no fallback resolves to a real definition.
 *      An undefined one with no fallback is invalid at computed-value time,
 *      so the WHOLE declaration is dropped -- not just that one value.
 *   2. ui/tokens.css and ui/tokens.js agree. The JS copy feeds the MUI
 *      adapter, so drift between them ships as two different brands.
 *   3. Text/background pairs clear WCAG AA, in BOTH themes.
 *
 * Run: node scripts/verify-tokens.mjs   (also `npm test`)
 *
 * Note ui/a11y/verify-contrast.js is browser-only -- it reads
 * getComputedStyle, so under node it defines a function and exits 0
 * without checking anything. This is the runnable equivalent.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { tokens, darkTokens } = await import(join(root, 'ui/tokens.js'));

let failures = 0;
const fail = (m) => { failures++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}`); };
const pass = (m) => console.log(`  \x1b[32mPASS\x1b[0m  ${m}`);
const head = (m) => console.log(`\n\x1b[1m${m}\x1b[0m`);

/* ---------- collect css ---------- */
const cssFiles = [];
(function walk(d){
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith('.css')) cssFiles.push(p);
  }
})(join(root, 'ui'));

const css = Object.fromEntries(cssFiles.map(f => [f.slice(root.length + 1), readFileSync(f, 'utf8')]));
const allCss = Object.values(css).join('\n');

/* ---------- 1. undefined custom properties ---------- */
head('1. Custom properties referenced with no fallback and no definition');
const defined = new Set([...allCss.matchAll(/(?:^|[;{\s])(--[A-Za-z0-9-]+)\s*:/gm)].map(m => m[1]));
const bare = new Set([...allCss.matchAll(/var\(\s*(--[A-Za-z0-9-]+)\s*\)/g)].map(m => m[1]));
const undef = [...bare].filter(n => !defined.has(n)).sort();
if (!undef.length) pass(`ui/: all ${bare.size} unguarded references resolve (${defined.size} properties defined)`);
else for (const n of undef) {
  const where = Object.entries(css)
    .filter(([, c]) => new RegExp(`var\\(\\s*${n}\\s*\\)`).test(c)).map(([f]) => f).join(', ');
  fail(`${n} is undefined -- declarations are dropped in: ${where}`);
}

// Consumers of the tokens that live outside ui/. demo.html is the design
// system's own shop window; a dropped declaration there is a real bug.
for (const rel of ['demo.html', 'components/react/SliderWithLabel.jsx', 'components/react/RateField.jsx']) {
  let txt; try { txt = readFileSync(join(root, rel), 'utf8'); } catch { continue; }
  const local = new Set([...txt.matchAll(/(?:^|[;{\s])(--[A-Za-z0-9-]+)\s*:/gm)].map(m => m[1]));
  const miss = [...new Set([...txt.matchAll(/var\(\s*(--[A-Za-z0-9-]+)\s*\)/g)].map(m => m[1]))]
    .filter(n => !defined.has(n) && !local.has(n)).sort();
  miss.length ? miss.forEach(n => fail(`${rel}: ${n} is undefined -- declaration dropped`))
              : pass(`${rel}: all unguarded references resolve`);
}

/* ---------- 2. tokens.css <-> tokens.js parity ---------- */
head('2. ui/tokens.css <-> ui/tokens.js parity');
const lightVals = {};
for (const m of css['ui/tokens.css'].matchAll(/(--[A-Za-z0-9-]+)\s*:\s*([^;}]+)/g)) {
  lightVals[m[1]] = m[2].trim();
}
const darkVals = {};
for (const m of css['ui/dark.css'].matchAll(/(--rm-dark-[A-Za-z0-9-]+)\s*:\s*([^;}]+)/g)) {
  darkVals[m[1]] = m[2].trim();
}

// .25rem and 0.25rem are the same computed value; compare accordingly.
const norm = (v) => String(v).trim().toLowerCase()
  .replace(/\s+/g, '').replace(/;$/, '')
  .replace(/(^|[^0-9a-z.])0+\.(?=[0-9])/g, '$1.')
  .replace(/(\.[0-9]*?)0+(?=[a-z%,)]|$)/g, '$1')
  .replace(/\.(?=[a-z%,)]|$)/g, '');
const cmp = (label, cssVal, jsVal) => {
  if (cssVal === undefined) return fail(`${label}: not found in CSS`);
  if (jsVal === undefined)  return fail(`${label}: not found in JS`);
  norm(cssVal) === norm(jsVal)
    ? pass(`${label} = ${cssVal}`)
    : fail(`${label}: CSS ${cssVal}  !=  JS ${jsVal}`);
};

const lightMap = [
  ['--rm-infinite', tokens.colors.infinite], ['--rm-moon', tokens.colors.moon],
  ['--rm-space', tokens.colors.space], ['--rm-galaxy', tokens.colors.galaxy],
  ['--rm-dust', tokens.colors.dust], ['--rm-estrella', tokens.colors.estrella],
  ['--rm-space-70', tokens.colors.space70],
  ['--text-secondary', tokens.text.secondary],
  ['--space-1', tokens.spacing[1]], ['--space-2', tokens.spacing[2]],
  ['--space-3', tokens.spacing[3]], ['--space-4', tokens.spacing[4]],
  ['--space-5', tokens.spacing[5]], ['--space-6', tokens.spacing[6]],
  ['--space-7', tokens.spacing[7]], ['--space-8', tokens.spacing[8]],
  ['--fs-xs', tokens.fontSize.xs], ['--fs-sm', tokens.fontSize.sm],
  ['--fs-md', tokens.fontSize.md], ['--fs-lg', tokens.fontSize.lg],
  ['--fs-xl', tokens.fontSize.xl],
  ['--link', tokens.link.default], ['--link-hover', tokens.link.hover],
  ['--bg-page', tokens.background.page], ['--bg-surface', tokens.background.surface],
  ['--border-subtle', tokens.border.subtle],
  ['--radius-s', tokens.radius.s], ['--radius-m', tokens.radius.m],
  ['--control-h', tokens.control.height], ['--control-pad-x', tokens.control.paddingX],
  ['--success-bg', tokens.status.success.bg], ['--success-text', tokens.status.success.text],
  ['--success-border', tokens.status.success.border],
  ['--warn-bg', tokens.status.warning.bg], ['--warn-text', tokens.status.warning.text],
  ['--warn-border', tokens.status.warning.border],
  ['--danger-bg', tokens.status.danger.bg], ['--danger-text', tokens.status.danger.text],
  ['--danger-border', tokens.status.danger.border],
  ['--accent-50', tokens.accent[50]], ['--accent-100', tokens.accent[100]],
  ['--accent-200', tokens.accent[200]], ['--accent-300', tokens.accent[300]],
  ['--accent-600', tokens.accent[600]], ['--accent-700', tokens.accent[700]],
  ['--t-dust-12', tokens.tint.dust12],
  ['--hit-min', tokens.hitTarget.min], ['--hit-ideal', tokens.hitTarget.ideal],
  ['--ease', tokens.motion.ease],
  ['--z-dropdown', tokens.zIndex.dropdown], ['--z-modal', tokens.zIndex.modal],
  ['--z-toast', tokens.zIndex.toast],
  ['--tooltip-border', tokens.surfaces.tooltipBorder],
  ['--skeleton-sheen', tokens.surfaces.skeletonSheen],
  ['--table-row-alt', tokens.surfaces.tableRowAlt],
  ['--table-row-hover', tokens.surfaces.tableRowHover],
];
console.log('  -- light --');
for (const [k, v] of lightMap) cmp(k, lightVals[k], v);

const darkMap = [
  ['--rm-dark-bg-page', darkTokens.background.page],
  ['--rm-dark-bg-surface', darkTokens.background.surface],
  ['--rm-dark-text-primary', darkTokens.text.primary],
  ['--rm-dark-text-secondary', darkTokens.text.secondary],
  ['--rm-dark-border-subtle', darkTokens.border.subtle],
  ['--rm-dark-accent-50', darkTokens.accent[50]], ['--rm-dark-accent-100', darkTokens.accent[100]],
  ['--rm-dark-accent-200', darkTokens.accent[200]], ['--rm-dark-accent-300', darkTokens.accent[300]],
  ['--rm-dark-accent-600', darkTokens.accent[600]], ['--rm-dark-accent-700', darkTokens.accent[700]],
  ['--rm-dark-link', darkTokens.link.default], ['--rm-dark-link-hover', darkTokens.link.hover],
  ['--rm-dark-t-dust-12', darkTokens.tint.dust12],
  ['--rm-dark-success-bg', darkTokens.status.success.bg],
  ['--rm-dark-success-text', darkTokens.status.success.text],
  ['--rm-dark-success-border', darkTokens.status.success.border],
  ['--rm-dark-warn-bg', darkTokens.status.warning.bg],
  ['--rm-dark-warn-text', darkTokens.status.warning.text],
  ['--rm-dark-warn-border', darkTokens.status.warning.border],
  ['--rm-dark-danger-bg', darkTokens.status.danger.bg],
  ['--rm-dark-danger-text', darkTokens.status.danger.text],
  ['--rm-dark-danger-border', darkTokens.status.danger.border],
  ['--rm-dark-tooltip-border', darkTokens.surfaces.tooltipBorder],
  ['--rm-dark-skeleton-sheen', darkTokens.surfaces.skeletonSheen],
  ['--rm-dark-table-row-alt', darkTokens.surfaces.tableRowAlt],
  ['--rm-dark-table-row-hover', darkTokens.surfaces.tableRowHover],
];
console.log('  -- dark --');
for (const [k, v] of darkMap) cmp(k, darkVals[k], v);

/* ---------- 2b. the two dark selectors must assign the same list ---------- */
head('3. ui/dark.css: OS-preference and manual-override blocks assign the same tokens');
const blocks = [...css['ui/dark.css'].matchAll(/\{([^{}]*--bg-page[^{}]*)\}/g)]
  .map(m => [...m[1].matchAll(/(--[A-Za-z0-9-]+)\s*:\s*([^;}]+)/g)]
    .map(x => `${x[1]}:${norm(x[2])}`).sort().join('|'));
if (blocks.length !== 2) fail(`expected 2 theme blocks, found ${blocks.length}`);
else if (blocks[0] !== blocks[1]) fail('the two dark blocks have drifted');
else pass(`both blocks assign the same ${blocks[0].split('|').length} tokens`);

/* ---------- 4. contrast, both themes ---------- */
const hexToRgb = (h) => { const x = h.replace('#',''); const s = x.length===3?x.replace(/(.)/g,'$1$1'):x; const b=parseInt(s,16); return [(b>>16)&255,(b>>8)&255,b&255]; };
const relL = ([r,g,b]) => { const s=[r,g,b].map(v=>{v/=255; return v<=.03928?v/12.92:((v+.055)/1.055)**2.4;}); return .2126*s[0]+.7152*s[1]+.0722*s[2]; };
const ratio = (fg,bg) => { const a=relL(hexToRgb(fg)), b=relL(hexToRgb(bg)); const [hi,lo]=[Math.max(a,b),Math.min(a,b)]; return (hi+.05)/(lo+.05); };

const themes = {
  light: { page: tokens.background.page, surface: tokens.background.surface,
    textPrimary: tokens.text.primary, textSecondary: tokens.text.secondary,
    link: tokens.link.default, linkHover: tokens.link.hover, hover: tokens.tint.dust12,
    status: tokens.status },
  dark: { page: darkTokens.background.page, surface: darkTokens.background.surface,
    textPrimary: darkTokens.text.primary, textSecondary: darkTokens.text.secondary,
    link: darkTokens.link.default, linkHover: darkTokens.link.hover, hover: darkTokens.tint.dust12,
    status: darkTokens.status },
};
for (const [name, t] of Object.entries(themes)) {
  head(`4. Contrast -- ${name} theme (AA: 4.5 text, 3.0 large/secondary)`);
  const checks = [
    ['body text on page', t.textPrimary, t.page, 4.5],
    ['body text on surface', t.textPrimary, t.surface, 4.5],
    ['secondary text on page', t.textSecondary, t.page, 4.5],
    ['link on page', t.link, t.page, 4.5],
    ['link-hover on page', t.linkHover, t.page, 4.5],
    ['text on .btn hover tint', t.textPrimary, t.hover, 4.5],
    ['success text on success bg', t.status.success.text, t.status.success.bg, 4.5],
    ['warn text on warn bg', t.status.warning.text, t.status.warning.bg, 4.5],
    ['danger text on danger bg', t.status.danger.text, t.status.danger.bg, 4.5],
    ['button primary', tokens.colors.moon, tokens.colors.space, 4.5],
  ];
  for (const [label, fg, bg, min] of checks) {
    const r = ratio(fg, bg);
    r >= min ? pass(`${r.toFixed(2).padStart(5)}:1  ${label}`)
             : fail(`${r.toFixed(2)}:1 (need ${min})  ${label}  [${fg} on ${bg}]`);
  }
}

console.log(failures
  ? `\n\x1b[31m${failures} failure(s)\x1b[0m\n`
  : '\n\x1b[32mAll token checks passed.\x1b[0m\n');
process.exit(failures ? 1 : 0);
