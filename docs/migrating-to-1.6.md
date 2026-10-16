# Moving an app to 1.6

Nothing is removed in 1.6. Apps on `#semver:^1.5.0` get it with
`npm update @russell-marketing/brand-ui`.

## New: replace local versions

| If the app has its own… | Use |
|---|---|
| Page container (max width, side padding) | `<main class="page">` (up to `--page-max`, 1240px) |
| Eyebrow + page title + one-line description | `.page-header` with `__eyebrow`, `__title`, `__sub` |
| Padding inside a `.surface` card | `.surface surface--padded` |
| Scroll wrapper around a wide table | `.table-scroll` (with `tabindex="0"`, `role="region"`, `aria-label`) |
| Centred number/date cell, tabular figures | `.table__cell--num` on the `th` and `td`s |
| Multi-line text box | `<textarea class="textarea" rows="…">` |
| Small error under a control in a table row | `.field-error field-error--sm` |
| Two numbers side by side in one stat | `.stat__value stat__value--row` |
| Highlighted gap to fill in template text | `.text-blank` |

Delete each one from `ds-candidates.css` in the same commit as the update.

## 1.6.1: the audit sees more

The audit now reads every line of a multi-line `sx={{ … }}` or `style={{ … }}`
object (and `sx: { … }` keys inside `slotProps`), and flags hard-coded font
families. Expect the count to rise on the first run after updating. These were
always rule breaks; the audit couldn't see them before.

It also understands MUI's radius units: in `sx`, `borderRadius: 1` is the
theme's 8px and passes, as do 0.5 (4px) and 0.75 (6px); 1.5 and up are past
the scale. A colour fallback inside `var(--a-real-token, …)` is no longer
flagged.

RULES.md rule 1 now says the `^` floor is the version the app was last checked
against: raise it when you update.

## What looks different

- **`.muted` is now a colour only.** It used to force 14px and remove
  margins. Now it takes the size and spacing of the element it is on: a
  quiet word in a 12px table line stays 12px, and a `<p class="muted">`
  keeps normal paragraph size and spacing. Look at every `.muted` after
  updating. If a quiet paragraph should be smaller, that is a size choice
  for the element (`font-size: var(--fs-sm)` on its own class), not
  something `.muted` does.
- **`.textarea` works.** It used to get the one-line control height; now it
  is as tall as its `rows`. No app used it before 1.6.
