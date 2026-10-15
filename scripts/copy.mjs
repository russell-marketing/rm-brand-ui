#!/usr/bin/env node
/* scripts/copy.mjs — `npx rm-brand-copy <dir> [file …] [--check]`
 *
 * For an interface that can't install the package itself (a Chrome
 * extension, an Apps Script page), but lives in a repo that can. Copies the
 * system's CSS from the installed package into that interface's folder, so
 * the copy comes from the package, never from a hand edit.
 *
 *   npx rm-brand-copy extension/vendor              tokens.css + dark.css
 *   npx rm-brand-copy extension/vendor core.css     specific files from ui/
 *   npx rm-brand-copy extension/vendor --check      exit 1 if a copy is
 *                                                   missing or out of date
 *
 * Each copy is named rm-brand-<file> and starts with a marker line that names
 * the version. rm-brand-audit skips marked files: they are the system's own
 * CSS, not the app's. After `npm update @russell-marketing/brand-ui`, --check
 * fails until the copies are refreshed, which is the point.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MARKER = 'rm-brand-copy:';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'));

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const [dest, ...requested] = args.filter((a) => !a.startsWith('--'));
if (!dest) {
  console.error('Usage: npx rm-brand-copy <dir> [file …] [--check]   (files are paths under ui/, default tokens.css dark.css)');
  process.exit(2);
}
const files = requested.length ? requested : ['tokens.css', 'dark.css'];

const header = (file) =>
  `/* ${MARKER} ui/${file} from @russell-marketing/brand-ui@${version}. Do not edit; run npx rm-brand-copy. */\n`;

let problems = 0;
for (const file of files) {
  const src = join(pkgRoot, 'ui', file);
  if (!existsSync(src)) {
    console.error(`  no such file in the package: ui/${file}`);
    problems++;
    continue;
  }
  const out = join(resolve(dest), `rm-brand-${basename(file)}`);
  const content = header(file) + readFileSync(src, 'utf8');
  const current = existsSync(out) ? readFileSync(out, 'utf8') : null;

  if (current === content) { console.log(`  up to date  ${out}`); continue; }
  if (CHECK) {
    console.log(`  \x1b[31m${current === null ? 'MISSING' : 'STALE'}\x1b[0m       ${out}`);
    problems++;
    continue;
  }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, content);
  console.log(`  ${current === null ? 'created' : 'updated'}     ${out}`);
}

if (CHECK && problems) {
  console.log(`\nCopies do not match @russell-marketing/brand-ui@${version}. Run: npx rm-brand-copy ${[dest, ...requested].join(' ')}\n`);
}
process.exit(problems ? 1 : 0);
