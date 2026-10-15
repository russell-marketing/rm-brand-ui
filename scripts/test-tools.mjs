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
check(run('audit.mjs', '.', '--strict').status === 1, '--strict fails on a "fix" finding');

rmSync(app, { recursive: true, force: true });
console.log(failures ? `\n\x1b[31m${failures} failure(s)\x1b[0m\n` : '\n\x1b[32mAll tool checks passed.\x1b[0m\n');
process.exit(failures ? 1 : 0);
