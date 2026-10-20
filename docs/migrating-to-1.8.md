# Moving an app to 1.8

1.8 fills the gaps the 1.7 app updates ran into, and the MUI theme's own.
Nothing is removed. Apps on `#semver:^1.7.0` get it with
`npm update @russell-marketing/brand-ui`; then raise the floor to `^1.8.0`.

## New: replace local versions

| If the app has its own… | Use |
|---|---|
| A red "failing" / "broken" badge | `.badge badge--error` |
| Checkbox styling (`accent-color`, a size) | `.checkbox`, and `<label class="checkbox-field">` around it and its text |
| A list of tasks with a tick and a due date | `.task-list` with `__item`, `__done` (the round tick), `__label`, `__date` |
| A round checkbox (`.checkbox--round`) | `.task-list__done` if it completes a task; otherwise `.checkbox` (decision 0004) |
| Monospace text (`'monospace'`, `'Roboto Mono'`) | `var(--font-mono)` / `tokens.fonts.mono`; MUI Typography `code` (14px) or `codeSm` (12px) |
| Code blocks or inline code with their own colours | `<pre class="code-block">`, `<code class="code">`; MUI `palette.code` |
| Icon sizes (`sx={{ fontSize: 14 }}` on an icon) | `fontSize="small"` / `"medium"` / `"large"` (16 / 20 / 24px); in CSS `var(--icon-sm)` … `var(--icon-lg)` |
| Purple tints as `rgba(122, 100, 160, …)` | MUI `palette.accent[50]` … `[700]`; CSS `var(--accent-50)` … |
| Text on a brand background set with a role token or a brand colour | `--ink-on-space`, `--ink-on-dust`, `--ink-on-russell`, `--ink-on-galaxy`, `--ink-on-estrella` |
| A row of filter checkboxes that wraps badly in a `.filter-bar` cell | `.filter-bar__group` (a `fieldset` works): two columns wide when there is room |
| Corner radii as numbers (`'4px'`, `borderRadius: 3`) | `var(--radius-xs|s|m)`; in MUI `sx`, 0.5 / 0.75 / 1 |

Delete each one from `ds-candidates.css` in the same commit as the update.

## The task list

```html
<ul class="task-list">
  <li class="task-list__item">
    <input type="checkbox" class="task-list__done" id="t1">
    <label class="task-list__label" for="t1">Licensor approval expected</label>
    <time class="task-list__date" datetime="2026-07-28">Jul 28</time>
  </li>
</ul>
```

Every row shares the list's columns, so ticks and dates line up down the
list whatever each date says. The tick comes first, before the task's name,
as in Asana. It is round only here: a round box means "complete this task"
(decision 0004).

## What looks different

- **MUI icons:** `fontSize="medium"` (the default) is 20px; `"small"` 16px;
  `"large"` 24px. They were larger than MUI's usual 24 / 20 / 35px: the
  theme's 16px base font scales MUI's sizes by 16/14, so they measured
  about 27 / 23 / 40px. Checkbox and switch rows get shorter to match.
- **MUI tabs with an icon** are 48px tall, were 72px.
- **MUI selected tab and DataGrid rows** use the token tints (same colours,
  now from tokens, so dark mode can change them).
- **MUI slider touch area** is 24px, was 42px, so it no longer reaches past
  a phone's edge.
- **MUI transitions** (ripples, small fades) use the system's 150 / 200ms
  and its easing.
- **`.filter-bar__actions`**: in a bar four columns wide or more, they take
  the last two columns, at the end of the last row of filters when those
  cells are free (1.8.3; 1.8.0 used one column, which wrapped a switch and
  a button). In narrower bars, a row of their own, as before.
- **`.app-header__title`** keeps its colour on hover (a link title used to
  turn link purple).
- **`tokens.fonts.mono`** is the device's monospace font instead of Roboto
  Mono, which no app loaded.

## The audit sees more

- **Icon sizes** are checked against the icon scale (16 / 20 / 24px).
  1.7 skipped them; expect a few findings on icons sized 14 or 18.
- New system class names: `.checkbox`, `.checkbox-field`, `.task-list`,
  `.code`, `.code-block`. An app with its own class of the same name now
  gets a rule-4 finding.

## Check it

Run `npx rm-brand-audit`, then look at every changed screen at 375px wide
and at desktop width, light and dark, and put the screenshots in the pull
request.

## 1.8.1: icon buttons

| If the app has its own… | Use |
|---|---|
| A button holding only an icon (`button.icon`, a close or menu button) | `.btn btn--icon` with an `aria-label`; add `.btn--text` for no box, `.btn--sm` for a small one. `aria-expanded` / `aria-pressed` "true" colours it as open or on |

Icons inside it size themselves (20px, or 16px with `.btn--sm`), so the
SVG needs no `width` or `height`.

## 1.8.2: card titles and the brand panel

| If the app has its own… | Use |
|---|---|
| A small caps title at the top of a card | `.surface__title` |
| A navy panel that highlights one thing, with gold or Dust text in it | `.surface surface--brand`: its `.surface__title` turns Estrella and `.muted` turns Dust |
| Estrella or Dust text on a Space background set with `--rm-*` | `--ink-on-space-accent`, `--ink-on-space-quiet` |

TypeScript: `variant="code"` (14px mono) now type-checks, as `codeSm` did.

## 1.8.3: fixes from the 1.8 updates

- **Filter-bar actions** take two columns at the end of a wide bar, not
  one: one wrapped "Use Sample Data" and Search and pushed the filters down.
- **`.code-block`** no longer widens its container: a long line scrolls
  inside the block instead of making a table column or a flex row as wide
  as the line. Delete any local `width: 0; min-width: 100%` workaround.
- **The audit** no longer reports `button:not(.btn)` as restyling `.btn`.
- The 1.8 note on MUI icon sizes is corrected (they were about 27px, not
  24px, before 1.8).

