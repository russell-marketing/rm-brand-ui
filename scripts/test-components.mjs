#!/usr/bin/env node
/* scripts/test-components.mjs
 *
 * Behaviour tests for the React components that own behaviour (not just
 * styling). Each component is compiled the way an app's bundler would, then
 * rendered into a jsdom page and driven with real events.
 *
 * Run: node scripts/test-components.mjs   (also `npm test`)
 */
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dom = new JSDOM('<!doctype html><div id="root"></div>', { pretendToBeVisual: true });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document,
  HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true,
});

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { act } = React;

let failures = 0;
const check = (ok, msg) => {
  if (!ok) failures++;
  console.log(`  ${ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${msg}`);
};

async function load(rel) {
  // Inside node_modules so the compiled file resolves 'react' from this repo.
  const cache = join(root, 'node_modules/.cache');
  mkdirSync(cache, { recursive: true });
  const dir = mkdtempSync(join(cache, 'rm-ui-test-'));
  const out = join(dir, 'out.mjs');
  await build({ entryPoints: [join(root, rel)], outfile: out, format: 'esm', bundle: true,
    external: ['react'], platform: 'node', logLevel: 'error' });
  const mod = await import(pathToFileURL(out).href);
  rmSync(dir, { recursive: true, force: true });
  return mod;
}

/* ---------- Rating ---------- */
console.log('\n\x1b[1mRating\x1b[0m');
const { Rating } = await load('components/react/Rating.jsx');

// A controlled wrapper, the way an app uses it.
const calls = [];
function Harness({ initial = 0, disabled = false }) {
  const [v, setV] = React.useState(initial);
  return React.createElement(Rating, {
    label: 'Fit', value: v, disabled, itemLabels: ['Low', 'Medium', 'High'],
    onChange: (n) => { calls.push(n); setV(n); },
  });
}
const container = document.getElementById('root');
const rootEl = createRoot(container);
const render = (props) => act(() => rootEl.render(React.createElement(Harness, props)));
const stars = () => [...container.querySelectorAll('.rating__star')];
const litCount = () => stars().filter((s) => s.classList.contains('rating__star--on')).length;
const fire = (el, type, init = {}) => act(() => {
  const E = type.startsWith('key') ? dom.window.KeyboardEvent : dom.window.MouseEvent;
  el.dispatchEvent(new E(type, { bubbles: true, cancelable: true, ...init }));
});

await render({});
const group = container.querySelector('[role="radiogroup"]');
check(group?.getAttribute('aria-label') === 'Fit', 'group is a labelled radiogroup');
check(stars().length === 3, 'renders max (3) stars');
check(litCount() === 0, 'starts unrated');
check(stars()[0].tabIndex === 0 && stars()[1].tabIndex === -1, 'unrated: only the first star is tabbable');
check(stars()[2].getAttribute('aria-label') === 'High (3 of 3)', 'star names come from itemLabels');

fire(stars()[1], 'mouseover');
check(litCount() === 2, 'hover previews two stars');
fire(group, 'mouseout', { relatedTarget: document.body });
check(litCount() === 0, 'leaving clears the preview');

fire(stars()[1], 'click');
check(calls.at(-1) === 2 && litCount() === 2, 'click chooses 2');
check(stars()[1].getAttribute('aria-checked') === 'true', 'chosen star is aria-checked');
check(stars()[1].tabIndex === 0 && stars()[0].tabIndex === -1, 'tab stop moves to the chosen star');

fire(stars()[1], 'click');
check(calls.at(-1) === 0 && litCount() === 0, 'clicking the chosen star again clears');

fire(stars()[0], 'keydown', { key: 'End' });
check(calls.at(-1) === 3 && document.activeElement === stars()[2], 'End chooses and focuses the last star');
fire(stars()[2], 'keydown', { key: 'ArrowLeft' });
check(calls.at(-1) === 2 && document.activeElement === stars()[1], 'ArrowLeft moves down one');
fire(stars()[1], 'keydown', { key: 'Home' });
check(calls.at(-1) === 1, 'Home chooses the first');
const before = calls.length;
fire(stars()[0], 'keydown', { key: 'ArrowLeft' });
check(calls.length === before, 'ArrowLeft at the first star does nothing');

await render({ initial: 2, disabled: true });
const n = calls.length;
fire(stars()[2], 'click');
check(calls.length === n && stars().every((s) => s.disabled), 'disabled: clicks do nothing');

act(() => rootEl.unmount());
console.log(failures ? `\n\x1b[31m${failures} failure(s)\x1b[0m\n` : '\n\x1b[32mAll component checks passed.\x1b[0m\n');
process.exit(failures ? 1 : 0);
