#!/usr/bin/env node
/* scripts/test-tools.mjs
 *
 * Tests for the commands apps run: rm-brand-copy and rm-brand-audit. Builds
 * a throwaway app folder, runs each command the way an app would, and checks
 * what comes back.
 *
 * Run: node scripts/test-tools.mjs   (also `npm test`)
 */
import { mkdirSync, mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cache = join(root, 'node_modules/.cache');
mkdirSync(cache, { recursive: true });
const app = mkdtempSync(join(cache, 'rm-ui-app-'));

let failures = 0;
const check = (ok, msg) => {
  if (!ok) failures++;
  console.log(`  ${ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${msg}`);
};
const run = (script, ...args) => spawnSync(process.execPath, [join(root, 'scripts', script), ...args],
  { cwd: app, encoding: 'utf8' });

writeFileSync(join(app, 'package.json'), JSON.stringify({
  name: 'test-app', private: true,
  dependencies: { '@russell-marketing/brand-ui': 'github:russell-marketing/rm-brand-ui#semver:^1.5.0' },
}));
mkdirSync(join(app, 'src'));
writeFileSync(join(app, 'src/layout.js'), "import '@russell-marketing/brand-ui/styles';\n");
mkdirSync(join(app, 'extension'));
writeFileSync(join(app, 'extension/popup.css'), '.title{ color: #123456; }\n');
// MUI-style objects that span lines, sx radius multiples, and font families.
writeFileSync(join(app, 'src/Panel.jsx'), [
  'export const Panel = () => (',
  '  <Box sx={{',
  "    bgcolor: 'rgba(122, 100, 160, 0.1)',",
  '    borderRadius: 1,',
  "    fontFamily: 'monospace',",
  '  }}>',
  '    <span style={{ borderRadius: 4 }} />',
  '    <Box sx={{ borderRadius: 3 }} />',
  '    <Box sx={{ fontFamily: tokens.fonts.mono, borderRadius: 0.5 }} />',
  "    <Box sx={{ color: 'var(--text-primary, #18191E)' }} />",
  "    <Box sx={{ background: 'var(--not-a-token, #fff)' }} />",
  '    <Popover slotProps={{ paper: {',
  '      sx: {',
  '        borderRadius: 1.5,',
  '      },',
  '    } }} />',
  '  </Box>',
  ');',
].join('\n'));
// Phone-width rule, icon sizes, and a last property with no comma.
writeFileSync(join(app, 'src/Nav.jsx'), [
  'export const Nav = () => (',
  '  <Tabs',
  '    onChange={(_, v) => set(v)}',
  '    variant="fullWidth"',
  '  >',
  '    <Tab icon={<HomeIcon sx={{ fontSize: 20 }} />} />',
  '    <FormControl size="small" sx={{ minWidth: 140 }}>',
  '    <TextField',
  '      sx={{ width: 150 }}',
  '    />',
  "    <TextField sx={{ width: '100%', minWidth: 0 }} />",
  '    <Typography sx={{',
  "      fontSize: '1rem'",
  '    }} />',
  '    <Box sx={{ mr: 3, borderRadius: 3',
  '    }} />',
  '  </Tabs>',
  ');',
].join('\n'));
// Widths a phone can't fit, in CSS and in JS.
writeFileSync(join(app, 'src/wide.css'), [
  '.panel{ min-width: 400px; }',
  '.side{ max-width: 600px; }',
  '.grid{ grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }',
  '.cards{ grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr)); }',
  '.shell{ width: 100vw; }',
  '@container panel (min-width: 40rem) { .x{ display:grid; } }',
].join('\n'));
writeFileSync(join(app, 'src/images.js'), "export const hero = { src: 'a.png', width: 640, height: 480 };\n");
writeFileSync(join(app, 'src/Wide.jsx'), [
  'export const W = () => (',
  "  <Box sx={{ minWidth: '340px', width: 0.5 }}>",
  "    <Box sx={{ width: 300, maxWidth: 900 }} />",
  '  </Box>',
  ');',
].join('\n'));
writeFileSync(join(app, 'src/fonts.css'), '.a{ font-family: "Roboto Mono", monospace; }\n.b{ font-family: var(--font-body); }\n');

/* ---------- rm-brand-copy ---------- */
console.log('\n\x1b[1mrm-brand-copy\x1b[0m');
const vendor = join(app, 'extension/vendor');
check(run('copy.mjs', 'extension/vendor', '--check').status === 1, '--check fails before anything is copied');
check(run('copy.mjs', 'extension/vendor').status === 0, 'copies the default files');
const copied = join(vendor, 'rm-brand-tokens.css');
check(existsSync(copied) && existsSync(join(vendor, 'rm-brand-dark.css')), 'writes rm-brand-tokens.css and rm-brand-dark.css');
check(readFileSync(copied, 'utf8').startsWith('/* rm-brand-copy: ui/tokens.css from @russell-marketing/brand-ui@'),
  'each copy starts with the marker naming the version');
check(run('copy.mjs', 'extension/vendor', '--check').status === 0, '--check passes on fresh copies');
writeFileSync(copied, readFileSync(copied, 'utf8').replace('--space-1: .25rem;', '--space-1: .3rem;'));
check(run('copy.mjs', 'extension/vendor', '--check').status === 1, '--check fails on a hand-edited copy');
run('copy.mjs', 'extension/vendor');
check(run('copy.mjs', 'extension/vendor', 'nope.css').status === 1, 'refuses a file the package does not have');

/* ---------- rm-brand-audit ---------- */
console.log('\n\x1b[1mrm-brand-audit\x1b[0m');
const audit = run('audit.mjs', '.');
check(!/rm-brand-(tokens|dark)\.css/.test(audit.stdout), 'skips files copied by rm-brand-copy');
check(/extension\/popup\.css:1 {2}hard-coded colour/.test(audit.stdout), 'still flags the app\'s own hard-coded colour');
check(!/Rule 1\./.test(audit.stdout) && !/Rule 2\./.test(audit.stdout), 'a version range and one stylesheet import pass rules 1 and 2');
const flagged = (file, line) => new RegExp(`${file.replace('.', '\\.')}:${line} `).test(audit.stdout);
check(flagged('src/Panel.jsx', 3), 'flags a colour on a later line of a multi-line sx object');
check(!flagged('src/Panel.jsx', 4), 'sx borderRadius: 1 (8px) is on the scale');
check(flagged('src/Panel.jsx', 5), "flags fontFamily: 'monospace'");
check(flagged('src/Panel.jsx', 7), 'style borderRadius: 4 is pixels, so it is flagged');
check(flagged('src/Panel.jsx', 8) && /3 in sx is 24px/.test(audit.stdout), 'sx borderRadius: 3 is flagged as 24px');
check(!flagged('src/Panel.jsx', 9), 'tokens.fonts and sx radius 0.5 pass');
check(flagged('src/fonts.css', 1) && !flagged('src/fonts.css', 2), 'flags a literal font-family, not var(--font-body)');
check(!flagged('src/Panel.jsx', 10), 'a fallback inside var(--real-token, …) is not a hard-coded colour');
check(flagged('src/Panel.jsx', 11), 'a fallback on a name that is not a token is');
check(flagged('src/Panel.jsx', 14) && /1\.5 in sx is 12px/.test(audit.stdout), 'sx: { … } as a key is tracked too (1.5 = 12px)');
check(flagged('src/Nav.jsx', 4) && /Rule 13\./.test(audit.stdout), 'flags Tabs variant="fullWidth" on a later line of the tag (rule 13)');
check(!flagged('src/Nav.jsx', 3), 'an arrow function inside a tag does not end it');
check(!flagged('src/Nav.jsx', 6), "an icon's fontSize is not a text size");
check(flagged('src/Nav.jsx', 7), 'flags a fixed minWidth on a FormControl');
check(flagged('src/Nav.jsx', 9), 'flags a fixed width on a TextField from inside its tag');
check(!flagged('src/Nav.jsx', 11), "width: '100%' and minWidth: 0 are not fixed widths");
check(flagged('src/Nav.jsx', 13), 'flags the last property of an object when it has no comma');
check(flagged('src/Nav.jsx', 15), 'flags borderRadius at the end of a line with no comma');
check(flagged('src/wide.css', 1) && /\[check\] wider than a 320px phone/.test(audit.stdout), 'min-width: 400px is a "check" (rule 13)');
check(!flagged('src/wide.css', 2), 'max-width is never wider than a phone');
check(!flagged('src/wide.css', 3) && flagged('src/wide.css', 4), 'minmax(300px) fits a phone, minmax(24rem) = 384px does not');
check(flagged('src/wide.css', 5) && /100vw is wider than the page/.test(audit.stdout), 'flags width: 100vw');
check(!flagged('src/wide.css', 6), 'a container query (min-width: 40rem) is not an element width');
check(!flagged('src/images.js', 1), "an image's width in a data object is not a style");
check(flagged('src/Wide.jsx', 2) && !flagged('src/Wide.jsx', 3), "sx minWidth '340px' is flagged; width: 300 and maxWidth are not");
check(run('audit.mjs', '.', '--strict').status === 1, '--strict fails on a "fix" finding');

/* ---------- /layout import (rule 2) ---------- */
writeFileSync(join(app, 'src/layout.js'), "import '@russell-marketing/brand-ui/styles';\nimport '@russell-marketing/brand-ui/layout';\n");
check(/drop \/layout/.test(run('audit.mjs', '.').stdout), '/layout with /styles is flagged as a double import');
writeFileSync(join(app, 'src/layout.js'), "import '@russell-marketing/brand-ui/layout';\nimport { getRMThemeConfig } from '@russell-marketing/brand-ui/adapters/mui-theme';\n");
check(!/Rule 2\./.test(run('audit.mjs', '.').stdout), 'an MUI app with the theme and /layout passes rule 2');

rmSync(app, { recursive: true, force: true });
console.log(failures ? `\n\x1b[31m${failures} failure(s)\x1b[0m\n` : '\n\x1b[32mAll tool checks passed.\x1b[0m\n');
process.exit(failures ? 1 : 0);
