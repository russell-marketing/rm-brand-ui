# rm-brand-ui: instructions for Claude

**rm-brand-ui** is Russell Marketing's design system for RM's own software:
internal dashboards, data-entry forms, the client portal. It ships tokens,
CSS, React components and an MUI theme as one package,
`@russell-marketing/brand-ui`. The repo is **public**: no client names, team
names, credentials or internal URLs in anything committed here.

## Two jobs

1. **Be the design authority.** Apps rely on this system to do their design
   thinking, so it sets rules and they follow (decision 0003). When an app
   asks for something, design it on this system's conventions, even if the
   app has to rename or adjust. Never adopt an app's local names or values
   because they already exist.
2. **Help apps comply.** [RULES.md](RULES.md) is the rulebook,
   `npx rm-brand-audit` ([scripts/audit.mjs](scripts/audit.mjs)) checks an
   app against it, `npx rm-brand-copy` ([scripts/copy.mjs](scripts/copy.mjs))
   brings the CSS to surfaces that can't install the package, and
   `docs/migrating-to-<version>.md` maps old patterns to new ones for each
   release. Both commands are tested in `scripts/test-tools.mjs`.

A change to the rules updates all three: RULES.md, the audit, the migration
guide.

## What ships, and where it lives

| Layer | Where | When |
|---|---|---|
| Tokens | `tokens/rm.tokens.json` (source, W3C DTCG) → generated `ui/tokens.css` + `ui/dark.css`; hand-written `ui/tokens.js` + `ui/tokens.d.ts` | Every value |
| CSS | `ui/core.css`, `ui/components/*.css`, imported by `ui/rm-ui.entry.css` | Every component, always |
| Layout entry | `ui/layout.entry.css` (`/layout`): tokens + `layout.css`, `tabs.css`, `task-list.css`, `code.css`; no base styles | For MUI-only apps; layout classes never fight a component's own styles (type styles inside `:where()`) |
| MUI theme | `adapters/mui-theme.js` (reads `tokens.js`) | When MUI has a matching control |
| React | `components/react/*.jsx` + `.d.ts` | Only when there is behaviour to share |

**React components depend on React only, never MUI** (decision 0002). They
render the CSS classes, ship a `.d.ts`, and have a behaviour test in
`scripts/test-components.mjs`. `SliderWithLabel` and `RateField` predate
this and wrap MUI; they are MUI-only.

## Adding or changing a component

1. **Tokens first.** Add to `tokens/rm.tokens.json` (with a
   `co.russellmarketing.css` name), run `npm run build:tokens`, mirror in
   `ui/tokens.js` and `ui/tokens.d.ts`, add the pair to the parity list and,
   for colours, a contrast check in `scripts/verify-tokens.mjs`. A new token
   group also needs a section in `scripts/build-tokens.mjs`, or it is not
   written out.
2. **CSS** in `ui/components/<name>.css`, BEM naming
   (`.block__element--modifier`), named by **meaning** (`--warn`, `--neutral`),
   never by look (`--ghost`, `--yellow`). Import it in `ui/rm-ui.entry.css`:
   a file not imported there ships to nobody.
3. **Sizes go through tokens.** A size modifier swaps tokens
   (`--control-h: var(--control-h-sm)`), never sets `height` directly, because
   `utilities.css` and density scopes set dimensions from the tokens.
4. **MUI theme** mapping, if MUI has the control.
5. **React component**, only if there is behaviour. Hooks before any early
   return. Export it in `package.json` with `types` and `default` conditions.
6. **demo.html** example. Fake, generic data only (public repo).
7. **RULES.md** if the component brings a usage rule (badge vs tag, which
   button). **The audit** if the rule can be checked. **The migration guide**
   if apps have local versions to replace.
8. `npm test` and look at demo.html in **both** themes, at desktop width
   and at 375px (RULES.md rule 13).

## Standards every component meets

- **No hard-coded design values.** Colours, sizes, radii, spacing from
  tokens. In JS, CSS variables carry a fallback:
  `var(--slider-label-gap, 1.5rem)`.
- **Brand colours are not text colours**, except on a brand background (Moon
  on Space). Text uses role tokens that flip in dark mode.
- **Contrast:** text 4.5:1, graphics (stars, icons, focus rings) 3:1, in
  both themes. `npm test` checks token pairs.
- **Hit targets:** at least `--hit-min` (24px).
- **No bars down one side.** State and emphasis are a fill, a full border
  or ring, weight or a badge, never a thick border or inset bar on the left
  (or left and right) of an element. Ruth's call, 2026-10-22.
- **Semantics carry the styling** where they can: the sort arrow is drawn
  from `aria-sort`, so correct markup is the only way to get the look.
- **Changing an existing class's look** is allowed in a minor release only
  to fix a bug or move a value onto a token. List it under "What looks
  different" in the migration guide. Anything bigger waits for 2.0.

## Releasing

- `package.json` version, then a tag `vX.Y.Z` on `main` after the PR merges.
  Apps depend on `#semver:^1.x`, so the tag is what they receive.
- Additions and fixes: minor. Removals or renames: 2.0 only, with
  deprecations announced in RULES.md or the migration guide first.
- Write `docs/migrating-to-X.Y.md` for every minor release; a patch gets a
  section in its minor's guide.
- On a minor release, raise the `#semver:^X.Y.0` examples in RULES.md and
  README.md to the new version.
- Never name a branch like a tag (`v1.6.0`): `git push` then can't tell
  which one you mean and the tag push fails. Use `release-1.6.0`.

## Testing

```bash
npm test            # tokens generated + parity + contrast, component behaviour, app commands
npm run dev         # demo.html: check light, dark and forced data-theme
node scripts/audit.mjs ../some-app   # run the audit against a local app
```

To try a change in an app before release: `npm pack`, then
`npm install /path/to/russell-marketing-brand-ui-X.Y.Z.tgz` in the app. This
installs what a git install delivers, unlike `npm link`.

## Peer dependencies

`react` and `@mui/material` are optional peer dependencies: pure-CSS apps
install neither. Test-only packages (esbuild, jsdom, react, react-dom) are
devDependencies and never reach apps.

## Planned for 2.0

- Remove `.pill` and the `badge.css` import inside `table.css`.
- Move app-specific selectors out of `ui/utilities.css`
  (`.template-controls-group`, `.action-section`, `.modal-container`).
- Put the table's 10px radius on the radius scale.
- Decide whether `core.css` keeps styling bare `label`, `h3` and `a`.
- Decide the future of the MUI-wrapped `SliderWithLabel` and `RateField`.

The MUI theme's dark scheme shipped in 1.9 as an opt-in
(`getRMThemeConfig({ dark: true })`). In the theme's component overrides,
colours that change with the theme are `v('--token', lightValue)` (a CSS
variable with the light value as fallback), never a bare `tokens.*` colour;
brand colours that stay fixed in both themes (Space table headers, Galaxy
outlines) stay bare. `ui/layout.entry.css` stays light-only: an app that
turns dark on also imports `/dark`. Making dark the default is a 2.0
decision.

A shape is allowed only when it carries a meaning users already know
(decision 0004): the round task tick, yes; a capsule button, no.

The page scrolls, not its panels (decision 0005, RULES.md rule 14): a
component never gives itself an up-and-down scroll area unless it floats,
keeps a table header in view, or is one of two lists compared side by side.
