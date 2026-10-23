# Moving an app to 1.9

1.9 gives the MUI theme a dark colour scheme, so MUI apps can follow RULES.md
rule 7 like the others. **It is opt-in:** nothing changes for an app until it
turns it on. Apps on `#semver:^1.8.0` get 1.9 with
`npm update @russell-marketing/brand-ui`; then raise the floor to `^1.9.0`.

Plain-CSS apps (the full stylesheet) already follow dark mode: nothing to do.

## Turning dark mode on (MUI apps)

1. **Clear the colours first.** Anything still hard-coded (`'#fff'`,
   `rgba(…)`, a light-only `tokens.*` colour in `sx`) will stay light on a
   dark page. Run `npx rm-brand-audit`: rule-5 colour findings are the list.
2. **Load the dark tokens** next to the layout classes, in the root layout:

   ```js
   import '@russell-marketing/brand-ui/layout';
   import '@russell-marketing/brand-ui/dark';
   ```
3. **Build the theme with the option**, with `extendTheme` (or
   `createTheme`):

   ```js
   const theme = extendTheme(getRMThemeConfig({ dark: true }));
   ```

   Remove any `defaultMode="light"` on the provider, so it follows the device.
4. **Next.js:** add `<InitColorSchemeScript attribute="data-theme" />`
   (from `@mui/material/InitColorSchemeScript`) at the top of `<body>` in the
   root layout, so the page doesn't flash light before it goes dark.
5. **Check every screen at 1440 and 375, light and dark**, and put the
   screenshots in the pull request.

## What the dark scheme is

- The page and surfaces, text, borders, status colours, accent ramp, code
  colours and links come from `darkTokens`, the same values the stylesheet's
  dark mode uses.
- **Primary is the light accent (`#BCA7E0`) with dark text:** Galaxy itself
  is too dark to read as text or as a button on the dark page. Contained
  primary buttons are light purple with near-black text; text buttons, the
  selected tab and a focused field's label are light purple.
- **Secondary is Russell** (Moon text reads on it; Space would vanish into
  the dark page).
- Brand colours that are fixed in both themes stay fixed: Space table
  headers with Moon text, Galaxy outlines and slider tracks.
- The theme marks the page `data-theme="light"` or `"dark"`, so the layout
  classes (`.app-header`, `.filter-bar` …) and any `var(--…)` in `sx` switch
  with it.

## What looks different (apps that don't turn it on)

Nothing: measured, every component's computed colour is the same as 1.8.4
in light mode, and stays light on a device set to dark.

## The audit

An MUI app that imports `/dark` alongside the theme and `/layout` passes
rule 2.

## 1.9.1: pick lists, selected cards, connector lines

From the Category Map Viewer's candidates.

| If the app has its own… | Use |
|---|---|
| A grouped list someone picks one row from (`.tree`, `.tree__item--selected`) | `.pick-list` with `__group`, `__item`, `__label`, `__meta`; mark the picked row with `aria-selected="true"`, not a class |
| A dot saying a row has a value or none (`.tree__dot`) | `.pick-list__mark`, `.pick-list__mark--empty` |
| A highlighted card (`.surface--selected`) | `.surface--selected`: the selection colour (`--accent-600`), not `--accent-border`, which is 1.8:1 against white and too faint to show a state |
| An SVG line linking a row to its target | `<svg class="connector" aria-hidden="true">` over a `position: relative` parent; the page draws the path |

Per-item colours for many categories are not part of the system: 26 hues
can't be told apart or kept readable in both themes. Match items with their
names and the selection colour instead.

