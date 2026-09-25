# rm-brand-ui

Russell Marketing style guidance — design tokens, components and accessibility
utilities, usable from plain HTML, React/MUI, or any other framework.

Published as `@russell-marketing/brand-ui`.

## Using it

```js
// 1. Plain CSS — everything, including the dark theme
import "@russell-marketing/brand-ui/styles";

// 2. MUI apps — map the tokens onto a theme
import { getRMThemeConfig } from "@russell-marketing/brand-ui/adapters/mui-theme";

// 3. Tokens as JS, for charts and anything CSS cannot reach
import { tokens, darkTokens } from "@russell-marketing/brand-ui/tokens.js";
```

## Dark mode

Two paths, and both carry the same palette:

| Path | Selector | When it applies |
|---|---|---|
| Follow the OS | `:root:not([data-theme])` | `prefers-color-scheme: dark`, and no theme forced |
| Product toggle | `[data-theme="dark"]` | Set `data-theme="dark"` or `"light"` on `<html>` |

Setting `data-theme` to anything opts out of the OS media query, so a toggle
always wins. The values themselves live exactly once, in the `--rm-dark-*`
block at the top of [`ui/dark.css`](ui/dark.css); both selectors reference
them, so a colour changes in one place. `npm test` fails if the two blocks
ever stop assigning the same list.

## Verifying your changes

**`npm test` is the one to run.** It is
[`scripts/verify-tokens.mjs`](scripts/verify-tokens.mjs), and it checks:

1. **Every `var(--x)` with no fallback resolves to a real definition.** This is
   the big one. A `var()` pointing at an undefined custom property with no
   fallback is invalid at computed-value time, so the browser drops the
   *entire declaration* — not just that one value. A missing `--z-modal` does
   not give the modal a default z-index; it gives it none at all. Twelve
   properties were in this state before 1.4.0, which is why the modal had no
   shadow, toasts could paint under page content, and `.btn` had no minimum
   hit target.
2. **`ui/tokens.css` and `ui/tokens.js` agree.** The JS copy feeds
   `adapters/mui-theme.js`, so drift between the two ships as two different
   brands in the same product. Change one, change the other.
3. **The two dark-theme blocks assign the same tokens.**
4. **Text and background pairs clear WCAG AA**, in both themes.

### `npm test` vs `ui/a11y/verify-contrast.js`

They are not alternatives; only one of them runs at a command line.

| | `npm test` | `ui/a11y/verify-contrast.js` |
|---|---|---|
| Runs in | Node, CI, your terminal | A browser only |
| Reads | The source files | `getComputedStyle` on a live page |
| Use it | Before every commit | In devtools, to check a real rendered page |

`ui/a11y/verify-contrast.js` calls `getComputedStyle(document.documentElement)`,
so it needs a DOM. **Running `node ui/a11y/verify-contrast.js` silently does
nothing** — it defines a function, never calls it, and exits 0. That looks like
a pass and is not one. It is meant to be imported into a page:

```js
import { verifyContrast } from "@russell-marketing/brand-ui";
verifyContrast();  // console.table of the live values
```

`demo.html` wires it to the "Verify Contrast" button.

## Demo

```bash
npm run dev   # opens demo.html
```

Every component is on that page, with density and light/dark/auto toggles.
Check both themes *and* both paths to dark — OS preference and forced
`data-theme` — since they are different selectors.

## Adding a component

See [`claude.md`](claude.md) for the full pattern. In short: CSS in
`ui/components/`, React in `components/react/`, framework mapping in
`adapters/`, tokens in **both** `ui/tokens.css` and `ui/tokens.js`, an example
in `demo.html`, and an entry in `ui/rm-ui.entry.css` — a component stylesheet
that is not imported there ships to nobody using the bundle.

Then run `npm test`.
