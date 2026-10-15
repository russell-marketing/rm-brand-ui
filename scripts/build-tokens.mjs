#!/usr/bin/env node
/* scripts/build-tokens.mjs
 *
 * Generates ui/tokens.css and the palette block of ui/dark.css from
 * tokens/rm.tokens.json, which is the single source of truth and is written
 * in the W3C Design Tokens Format (DTCG 2025.10).
 *
 *   node scripts/build-tokens.mjs            write the files
 *   node scripts/build-tokens.mjs --check    fail if they are out of date
 *
 * Why a source file at all: ui/tokens.css and ui/tokens.js used to be two
 * hand-written copies of the same values, kept in step by a test. One source
 * with generated outputs means they cannot disagree in the first place, and
 * the same file can be read directly by Figma.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(readFileSync(join(root, 'tokens/rm.tokens.json'), 'utf8'));
const CHECK = process.argv.includes('--check');
const CSS_KEY = 'co.russellmarketing.css';
const DERIVED_KEY = 'co.russellmarketing.derivedFrom';

/* ---------- value rendering ---------- */

const trimNum = (n) => String(+n.toFixed(4)).replace(/^0\./, '.');

function renderColor(v) {
  if (typeof v === 'string') {                       // {alias.path}
    return `var(${cssNameFor(v)})`;
  }
  if (v.alpha !== undefined && v.alpha < 1) {
    const [r, g, b] = v.components.map((c) => Math.round(c * 255));
    return `rgba(${r},${g},${b},${trimNum(v.alpha)})`;
  }
  return v.hex;
}
const renderDimension = (v) => `${trimNum(v.value)}${v.unit}`;
const renderDuration  = (v) => `${v.value}${v.unit}`;
const renderNumber    = (v) => String(v);
const renderFontWeight= (v) => String(v);
const renderFontFamily= (v) => v.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
const renderCubic     = (v) => `cubic-bezier(${v.join(', ')})`;
const renderShadow    = (v) => v.map((s) =>
  [renderDimension(s.offsetX), renderDimension(s.offsetY), renderDimension(s.blur),
   ...(s.spread && s.spread.value ? [renderDimension(s.spread)] : []),
   renderColor(s.color)].join(' ')).join(',');

const RENDER = {
  color: renderColor, dimension: renderDimension, duration: renderDuration,
  number: renderNumber, fontWeight: renderFontWeight, fontFamily: renderFontFamily,
  cubicBezier: renderCubic, shadow: renderShadow,
};

/* ---------- walking ---------- */

// Collect every token as {path, cssName, type, value}. $type may be inherited
// from an ancestor group, which the spec allows.
// An overlay records its base token and an alpha rather than a second copy of
// the base's components. DTCG colour values have no "reference plus alpha
// override", so this rides in $extensions, which is what extensions are for.
// `bases` is where derivedFrom paths are looked up. Dark overlays derive from
// the same brand colours as light ones, so both themes resolve against light.
function resolveDerived(tokens, bases = tokens) {
  const byPath = new Map(bases.map((t) => [t.path, t]));
  for (const t of tokens) {
    const d = t.derivedFrom;
    if (!d) continue;
    const base = byPath.get(d.base);
    if (!base) throw new Error(`${t.path} derives from ${d.base}, which does not exist`);
    if (typeof base.value === 'string') throw new Error(`${t.path} cannot derive from an alias`);
    t.value = { ...base.value, alpha: d.alpha, hex: base.value.hex };
  }
  return tokens;
}

function collect(node, path = [], inheritedType = null, out = []) {
  const type = node.$type ?? inheritedType;
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object') {
      if (v.$value !== undefined) {
        out.push({
          path: [...path, k].join('.'),
          cssName: v.$extensions?.[CSS_KEY] ?? null,
          type: v.$type ?? type,
          value: v.$value,
          derivedFrom: v.$extensions?.[DERIVED_KEY] ?? null,
          description: v.$description ?? null,
        });
      } else {
        collect(v, [...path, k], v.$type ?? type, out);
      }
    }
  }
  return out;
}

const light = resolveDerived(collect(src));
const darkSrc = src.$themes?.dark ?? {};
// dark overlays derive from the SAME brand bases as light ones
const dark = resolveDerived(collect(darkSrc), light);

// alias {a.b.c} -> the css name that token was given
const byPath = new Map(light.map((t) => [t.path, t]));
function cssNameFor(ref) {
  const p = ref.replace(/^\{|\}$/g, '').replace(/^\$themes\.dark\./, '');
  const hit = byPath.get(p);
  if (!hit?.cssName) throw new Error(`alias ${ref} does not resolve to a token with a CSS name`);
  return hit.cssName;
}

const render = (t) => {
  const fn = RENDER[t.type];
  if (!fn) throw new Error(`no renderer for type "${t.type}" (${t.path})`);
  return fn(t.value);
};

/* ---------- emit ---------- */

const BANNER = (file, srcPath) =>
`/* ${file}
 * GENERATED — do not edit.
 * Source: ${srcPath} (W3C Design Tokens Format, DTCG 2025.10)
 * Rebuild: npm run build:tokens
 */`;

// Group tokens for output by the first two path segments, so the file keeps
// readable sections rather than one flat wall.
function section(title, tokens) {
  if (!tokens.length) return '';
  const lines = tokens.map((t) => {
    const decl = `  ${t.cssName}: ${render(t)};`;
    return t.description ? `${decl.padEnd(46)} /* ${t.description} */` : decl;
  });
  return `\n  /* ${title} */\n${lines.join('\n')}\n`;
}
const pick = (tokens, prefix) =>
  tokens.filter((t) => t.cssName && t.path.startsWith(prefix) && !t.path.startsWith('color.__'));

function buildTokensCss() {
  const S = [
    ['Brand base colours', pick(light, 'color.brand')],
    ['Text', pick(light, 'color.text')],
    ['Links', pick(light, 'color.link')],
    ['Surfaces & borders', pick(light, 'color.surface')],
    ['Status families', pick(light, 'color.status')],
    ['Accent ramp', pick(light, 'color.accent')],
    ['Overlays — a base colour plus an alpha, so they follow their base', pick(light, 'color.overlay')],
    ['Elevation', pick(light, 'shadow')],
    ['Spacing', pick(light, 'dimension.space')],
    ['Type scale', pick(light, 'dimension.fontSize')],
    ['Radius & controls', [...pick(light, 'dimension.radius'), ...pick(light, 'dimension.control')]],
    ['Hit targets', pick(light, 'dimension.hitTarget')],
    ['Slider', pick(light, 'dimension.slider')],
    ['Tracking', pick(light, 'dimension.tracking')],
    ['Font families', pick(light, 'fontFamily')],
    ['Font weights', pick(light, 'fontWeight')],
    ['Motion', [...pick(light, 'cubicBezier'), ...pick(light, 'duration')]],
    ['Stacking order — toasts above modals so alerts are never buried', pick(light, 'zIndex')],
  ];
  return `${BANNER('ui/tokens.css', 'tokens/rm.tokens.json')}\n:root{${S.map(([t, x]) => section(t, x)).join('')}}\n`;
}

function buildDarkCss() {
  const defs = dark.filter((t) => t.cssName).map((t) => {
    const name = t.cssName.replace(/^--/, '--rm-dark-');
    const decl = `  ${name}: ${render(t)};`;
    return t.description ? `${decl.padEnd(46)} /* ${t.description} */` : decl;
  });
  // every dark token reassigns its light-named counterpart
  const assigns = dark.filter((t) => t.cssName)
    .map((t) => `    ${t.cssName}:${' '.repeat(Math.max(1, 20 - t.cssName.length))}var(${t.cssName.replace(/^--/, '--rm-dark-')});`);
  // structural reassignments: which ramp step each role points at in dark
  const structural = [
    '    --accent-surface:  var(--accent-200);',
    '    --accent-border:   var(--accent-300);',
    '    --accent-ink:      var(--accent-600);',
  ];
  const body = [...assigns, ...structural].join('\n');
  const bodyOuter = body.replace(/^ {4}/gm, '  ');

  return `${BANNER('ui/dark.css', 'tokens/rm.tokens.json')}
/*
 * Two selectors must carry the same palette:
 *   1. OS preference   -> :root:not([data-theme])  (only when unforced)
 *   2. Manual override -> [data-theme="dark"]      (a product theme toggle)
 * Both reference the --rm-dark-* block, so the values exist exactly once.
 */

/* ---- Dark palette: definitions only, inert in light mode ---- */
:root{
${defs.join('\n')}
}

/* ---- 1. Follow the OS, unless a theme has been forced ---- */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
${body}
  }
}

/* ---- 2. Manual override, for a product theme toggle ---- */
[data-theme="dark"]{
${bodyOuter}
}
`;
}

/* ---------- write or check ---------- */

const outputs = [
  ['ui/tokens.css', buildTokensCss()],
  ['ui/dark.css', buildDarkCss()],
];

let stale = 0;
for (const [rel, content] of outputs) {
  const path = join(root, rel);
  const current = (() => { try { return readFileSync(path, 'utf8'); } catch { return null; } })();
  if (current === content) { console.log(`  up to date  ${rel}`); continue; }
  if (CHECK) { stale++; console.log(`  \x1b[31mSTALE\x1b[0m       ${rel}`); continue; }
  writeFileSync(path, content);
  console.log(`  ${current === null ? 'created' : 'written'}     ${rel}`);
}

if (CHECK && stale) {
  console.log(`\n\x1b[31m${stale} generated file(s) do not match tokens/rm.tokens.json.\x1b[0m`);
  console.log('Edit the source, then run: npm run build:tokens\n');
  process.exit(1);
}
if (CHECK) console.log('\n\x1b[32mGenerated files match the source.\x1b[0m\n');
