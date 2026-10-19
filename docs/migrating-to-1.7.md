# Moving an app to 1.7

1.7 makes every screen work at phone width. Nothing is removed. Apps on
`#semver:^1.6.0` get it with `npm update @russell-marketing/brand-ui`; then
raise the floor to `^1.7.0`.

New rule: [RULES.md rule 13](../RULES.md#13-every-screen-works-at-phone-width).
The audit checks it.

## New: replace local versions

| If the app has its own… | Use |
|---|---|
| Top bar with the app's name, navigation, an environment badge | `.app-header` with `__title` (and `__logo`), `__nav`, `__meta` |
| Navigation centred with `position: absolute` | `.app-header__nav`: the header's grid centres it and it can never overlap |
| Divider between groups of tabs (`::after` on the nth tab) | `className="tab--group-end"` on the last tab of the group |
| Row of form fields with fixed widths, or a two-column form | `.form-grid`; `__wide` for a full-row field, `__actions` for its buttons |
| Row of filters above a table (`Stack direction="row"`, `flexWrap`, `minWidth`s) | `.filter-bar`; `__range` for from/to, `__actions` for Apply / Clear |
| Big page titles from `clamp()` sizes | The theme's `h1` (32px) and `h2` (24px) |
| An 18px intro line, a stat number, the app's name in the header | Typography variants `lead`, `stat`, `appTitle` |

Delete each one from `ds-candidates.css` in the same commit as the update.

## MUI apps

**Load the layout classes.** An app whose whole UI is MUI adds one import
next to the theme, in the root layout:

```js
import '@russell-marketing/brand-ui/layout';
```

It holds the tokens and the layout classes, nothing that restyles MUI. Put
the classes on a `Box` and keep MUI components inside:

```jsx
<Box component="header" className="app-header">
  <Typography variant="appTitle" className="app-header__title" component={Link} href="/">Admin</Typography>
  <Box component="nav" className="app-header__nav" aria-label="Main">
    <Tabs value={current}>…</Tabs>
  </Box>
  <Box className="app-header__meta"><Chip label="Live" size="small" variant="outlined" /></Box>
</Box>

<Box className="filter-bar">
  <FormControl size="small">…</FormControl>
  <Box className="filter-bar__range">
    <TextField label="From" type="date" size="small" />
    <TextField label="To" type="date" size="small" />
  </Box>
  <Box className="filter-bar__actions"><Button>Clear</Button><Button variant="contained">Apply</Button></Box>
</Box>
```

**Remove fixed widths from fields** (`sx={{ minWidth: 140 }}`, `width: 150`):
the grid sets them now. Grid cells stretch MUI's `FormControl` and
`TextField` to fill them.

**Remove `variant="fullWidth"` from `<Tabs>`.** The theme makes every
`<Tabs>` scrollable, with scroll buttons on phones too. A `variant` set in
the app overrides that, so the audit flags it.

## What looks different

- **Focused MUI text fields:** the extra ring around a focused outlined
  field is gone; the 2px Galaxy border stays. The ring ignored the gap MUI
  leaves for the floating label, so it drew a line through the label.
- **MUI `h1` and `h2`** are 32px and 24px at every width. They used to grow
  with the screen, up to 40px and 28px.
- **MUI tabs** keep their labels on one line and scroll sideways when they
  don't fit, instead of wrapping or squeezing.
- **`.tabs` / `.tab`** scroll sideways when they don't fit, instead of
  overflowing their container, and labels stay on one line.
  `aria-selected="true"` now marks the current tab, as `.is-active` does.

## The audit sees more

- **Rule 13** (new): `<Tabs variant="fullWidth">`, and fixed `width` or
  `minWidth` in a field's own `sx` (`TextField`, `Select`, `FormControl`,
  `Autocomplete`, `DatePicker`, `input`, `select`, `textarea`).
  `width: '100%'` and `minWidth: 0` pass.
- **The last property of an object** is checked even with no comma after it
  (`fontSize: '1rem'` on its own line before the `}`). Expect a few new
  rule-5 findings.
- **Icon sizes are not text sizes:** `<HomeIcon sx={{ fontSize: 20 }} />` is
  no longer reported as a font size. Icon sizes get their own scale in a
  later release.
- **Rule 2:** importing `/layout` together with `/styles` is flagged
  (`/styles` already includes it), as is `/layout` without the MUI theme.

## Check it

Run `npx rm-brand-audit`, then look at every changed screen at 375px wide
and at desktop width, and put both screenshots in the pull request.

## 1.7.1: what the apps found

Built from the four apps' 1.7 plans. Nothing is removed.

| If the app has its own… | Use |
|---|---|
| Page frame in an MUI app (padding, `100vw`, a `Container`) | `<Box component="main" className="page">`: `.page` is now in `/layout` |
| Centred page for one short form (sign-in, passcode) | `.page page--single` (up to `--page-single-max`, 448px) |
| Row with a section title and buttons or a toggle on the right | `.section-header` with `__title`, `__sub`, `__actions` |
| Buttons where one is chosen (sort order, period, which list) | `.choices` + `.btn` + `aria-pressed`; in MUI, `<ToggleButtonGroup exclusive>` (the theme styles it to match) |
| A capsule- or pill-shaped "selected" button | `.choices`: the system marks the chosen one with the accent tint, not a shape |
| Its own TypeScript declarations for `@russell-marketing/brand-ui/adapters/mui-theme` | Delete them: the package ships types, including the `lead`, `stat` and `appTitle` variants. A local `declare module` for that path overrides the package's types. |

**What looks different:** on screens under 48rem, `.page` has 16px side
padding instead of 24px.

**The audit (rule 13):** `width: 100vw` is flagged, and any `width`,
`min-width` or grid `minmax()` minimum over 320px is marked "check" (fine
when a `max-width: 100%` caps it). Media and container query conditions are
not widths and are ignored. In JS, only `sx` and `style` objects count.
