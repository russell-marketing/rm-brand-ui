# Moving an app to 1.10

1.10 adds grouped tables, a table header that stays in view, a floating
panel and a dense card, and two audit fixes. **Nothing changes for an app
until it uses them**, apart from the one change under "What looks
different". Apps on `#semver:^1.9.0` get 1.10 with
`npm update @russell-marketing/brand-ui`; then raise the floor to `^1.10.0`.

## New

### Grouped rows in a table

For a table where a cell names a group of rows and spans them. The markup
does it, with no modifier:

```html
<table class="table table--compact table--sticky-head">
  <thead><tr><th>Category</th><th>Subcategory</th><th>Item</th></tr></thead>
  <tbody>                                  <!-- one per top-level group -->
    <tr>
      <th scope="rowgroup" rowspan="3"><span class="table__group-name">Gadgets</span></th>
      <th scope="rowgroup" rowspan="2"><span class="table__group-name">Audio</span></th>
      <td>Headphones</td>
    </tr>
    <tr><td>Speakers</td></tr>
    <tr><th scope="rowgroup">Phones</th><td>Chargers</td></tr>
  </tbody>
  <tbody>…</tbody>
</table>
```

- A line darker than the row lines shows where each group starts and ends,
  in the columns it spans; between top-level groups (`<tbody>`s) it is 2px.
- Zebra rows turn off in a table with `th[scope="rowgroup"]`.
- Group names are left-aligned at the top of their cell, semibold, in their
  own case.
- `.table__group-name` (optional) keeps a long group's name in view while
  its rows scroll past. It leaves with its group.

**Replace:** a group name in a `<td rowspan>`, local zebra or alignment
overrides for it, and a local `.table--grouped` candidate.

### A header that stays in view: `.table--sticky-head`

The header row stays at the top while a long table scrolls, in the page or
in a scrolling box around the table. Its labels stay on one line. A table
too wide for a phone goes inside `.table-scroll`, as before.

**Replace:** a local `position: sticky` on `thead th` and any `overflow: clip`
override on `.table`.

### A floating panel: `.popover`

A panel that hangs from the control that opened it and covers the page, so
results don't push the page down as someone types:

```html
<div class="popover-anchor">
  <input class="input" aria-expanded="true" aria-controls="results">
  <div class="popover" id="results">…</div>
</div>
```

`.popover--end` hangs it from the control's right edge. Hide it with
`hidden` while it's closed. It is never narrower than its control and
never wider than 30rem or the screen.

**Replace:** a staged `.popover` / `.popover-anchor` in `ds-candidates.css`
(delete it there in the same commit as the version bump).

### A dense card: `.surface--dense`

For a card people scan rather than read, such as the entries beside a pick
list: its text is 14px, like a pick-list row and MUI's `body2`. Buttons and
fields inside keep their size.

**Replace:** a local `font-size` on a card's content.

### Already there: `.visually-hidden`

Text that screen readers read and the screen doesn't show, for a field
whose design has no visible label. It has shipped since 1.0 and is now in
RULES.md rule 8. Prefer a `<label class="visually-hidden">` to an
`aria-label` when the text could be a real element.

## What looks different

- **`.table` clips its corners with `overflow: clip`** instead of
  `overflow: hidden`. It looks the same; the difference is that a sticky
  header inside it now works.

## The audit

- **`.rm-brand-auditignore`** at the app root lists folders or files that
  aren't the app, one path per line from the root (saved snapshots,
  fixtures). They are skipped, and the report names them.
- **Rule 2 names the file** that loads the stylesheet, not `package.json`,
  so a static page with no `package.json` gets a finding that points
  somewhere real.

## Rules

- **Rule 8** gains Grouped rows, Dense card, Screen-reader text and Floating
  panel, and the Table row mentions `.table--sticky-head`.
- **Rule 13** says a floating panel can't use `max-width: 100%` (use
  `.popover`), and that a panel meant to cover the page is not the header
  layout the "nothing on top" bullet is about.
