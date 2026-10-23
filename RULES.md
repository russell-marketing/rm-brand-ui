# Rules for apps that use rm-brand-ui

This design system does the design thinking so each app doesn't have to.
That only works if apps follow it. These are rules, not suggestions. When an
app and this system disagree, the app changes.

Check an app against them with one command (rule numbers match):

```bash
npx rm-brand-audit            # report only
npx rm-brand-audit --strict   # exit 1 on any finding, for CI
```

---

## 1. Install with a version range

```json
"@russell-marketing/brand-ui": "github:russell-marketing/rm-brand-ui#semver:^1.9.0"
```

- The range gets every fix and addition, and never a breaking 2.0 by surprise.
- The number after `^` is the floor: the version this app was last checked
  against. Raise it whenever you update and check the app, so a fresh install
  can never land on something older than what was tested.
- Never `#main` (whatever happens to be newest, frozen by the lockfile), never
  a bare URL, never an exact commit.
- Never the old names `@russell-marketing/brand-styles`,
  `cd-space-dot-dot/rm-brand-styles` or `rm-internal-ui-styles`.
- The lockfile holds the installed version until someone runs
  `npm update @russell-marketing/brand-ui`. Do that when a release is announced.

## 2. Load the whole stylesheet, once, at the root

```js
import '@russell-marketing/brand-ui/styles';
```

Not `/tokens` + `/core` + `/components/table`. Picking pieces is how
components go missing without an error. The whole sheet is small, and it
includes dark mode (rule 7).

*Exception:* an app whose entire UI is MUI components uses the theme (rule
11) plus the layout classes, and no stylesheet:

```js
import '@russell-marketing/brand-ui/layout';
```

`/layout` is the tokens and the layout classes (rule 13) only, so nothing in
it restyles MUI. Apps that load `/styles` already have it.

## 3. Use the system before writing your own

Look in [`demo.html`](demo.html) first (`npm run dev` in this repo). If what
you need isn't there:

1. Write it in `src/styles/ds-candidates.css` **using this system's naming**
   (`.component__element--modifier`, tokens only), with the file it belongs
   in named above each block.
2. Ask for it to be added here.
3. When it ships, delete it from `ds-candidates.css` in the same commit that
   bumps the dependency.

App-specific names (`.reach-out-ask`, `.metric`) in shared-looking CSS are a
sign this step was skipped.

## 4. Never restyle a system class

No `.btn { … }`, `.table td { … }` or `.badge { … }` in app CSS, and no
redefining system tokens (`--control-h`, `--fs-sm`) except where a
documented modifier tells you to. If the system's version is wrong for you,
the system is wrong, and it is a candidate (rule 3), not a local override.

*Allowed:* pointing `--font-display` / `--font-body` at fonts the app loads
(e.g. `next/font`).

## 5. No hard-coded design values

Colours, font sizes, radii, spacing, shadows and durations come from tokens.
No hex, no `rgb()`, no `font-size: .8rem`, no `border-radius: 4px`.

Layout inside a page is the app's own: column widths, grid templates. The
page itself comes from `.page` (rule 8).

### Type scale

| Token | Size | For |
|---|---|---|
| `--fs-xs` | 12px | Labels, meta text, table sub-lines, badges. **The floor: nothing smaller.** |
| `--fs-sm` | 14px | Body text in dense UIs, small controls |
| `--fs-md` | 16px | Body text |
| `--fs-lg` | 18px | Lead text, rating stars |
| `--fs-xl` | 20px | Section headings |
| `--fs-2xl` | 24px | Stat values |
| `--fs-3xl` | 32px | Page titles |

Code, keys and IDs use `--font-mono` (the device's own monospace font) at
`--fs-sm`, or `--fs-xs` in dense tables and logs. MUI: Typography `code` /
`codeSm`.

### Icon sizes

| Token | Size | For | MUI |
|---|---|---|---|
| `--icon-sm` | 16px | Next to 14px text | `fontSize="small"` |
| `--icon-md` | 20px | The default UI icon | `fontSize="medium"` (the default) |
| `--icon-lg` | 24px | Stands alone or leads a row | `fontSize="large"` |

### Radius

`--radius-xs` (4px: icons, thumbnails, inline code), `--radius-s` (6px:
buttons, small controls), `--radius-m` (8px: inputs, cards). In MUI `sx`,
`borderRadius` 0.5, 0.75 and 1 are those three; or use the token itself,
`'var(--radius-xs)'`, which `/layout` provides.

## 6. Brand colours are never text colours

`--rm-space`, `--rm-galaxy` and the other `--rm-*` brand colours are fixed
values. They stay the same in dark mode, so as text they disappear: Space on
the dark page is 1.40:1.

For text use a role token, which flips with the theme:

| Want | Use |
|---|---|
| Normal / quiet text | `--text-primary` / `--text-secondary` |
| Brand-blue text (headings) | `--text-brand` |
| Purple text (eyebrows, tags, emphasis) | `--accent-ink` |
| Links | `--link` / `--link-hover` |
| Status text | `--success-text`, `--warning-text`, `--danger-text` |
| Text on a brand background | `--ink-on-space` (with `--ink-on-space-accent` for a title, `--ink-on-space-quiet` for quiet text), `--ink-on-russell`, `--ink-on-galaxy`, `--ink-on-dust`, `--ink-on-estrella` |

Brand colours are for backgrounds, borders and fills. Text **on** a brand
background, such as a Space nav bar or a Dust panel, uses that background's
ink token. The background is fixed in both themes, so its text must be
fixed too: a role token there would flip in dark mode and vanish (brand-blue
text on Dust is 1.43:1 in dark). The audit marks a brand colour used as text
"check", since it can't always see the parent's background; the ink tokens
are the answer it is asking for.

## 7. Every app supports dark mode

Following rules 5 and 6 gives you dark mode for free; the stylesheet follows
the OS setting. Setting `data-theme="light"` on `<html>` to opt out is
allowed only as a temporary step, with a backlog item to remove it.

**MUI apps** turn it on with the theme's dark scheme, once their own colours
come from the theme and tokens (rule 5 clear, or close):

```js
import '@russell-marketing/brand-ui/layout';
import '@russell-marketing/brand-ui/dark';
const theme = extendTheme(getRMThemeConfig({ dark: true }));
// <ThemeProvider theme={theme}> follows the device; Next.js apps add
// <InitColorSchemeScript attribute="data-theme" /> in the root layout.
```

The theme marks the page `data-theme="light"` or `"dark"`, so the layout
classes and any `var(--…)` in `sx` switch with MUI's own colours. Until an
app turns it on, it stays light, as before.

## 8. Choose components by meaning, not by look

| Choice | Rule |
|---|---|
| `.badge` or `.tag` | Badge = the **state** of a thing (new, ready, needs attention). Tag = its **kind** or source ("Updates", "Discord"). |
| Badge variant | `--new`, `--ready`, `--warn`, `--error` (broken or failed), `--neutral` (present, not asking for attention). |
| Checkbox or done tick | `.checkbox` (square) to choose an option or turn a setting on. `.task-list` and its round `__done` tick to complete a task. Never a round checkbox for looks (decision 0004). |
| Task list | `.task-list` for tasks someone ticks off: done tick, task, due date. Ticks and dates line up down the list. |
| Pick list | `.pick-list` for a grouped list someone picks one row from (`role="listbox"`, rows `role="option"` + `aria-selected`). Not a tree: nothing opens or closes. `__mark` / `__mark--empty`: has a value or not (say it in text too). |
| State or emphasis | A fill, a full border or ring, text weight, or a badge. Never a bar or thick border down one side (or both sides) of a row, card, alert or toast. |
| Selected | One colour marks a selection, `--accent-600`: `.pick-list`'s picked row, `.surface--selected` (the card it points at), `.connector` (the line between them), `.tag[aria-current="true"]` (the one tag the selection points at). |
| Code | `<code class="code">` inline; `<pre class="code-block">` for blocks (`--sm` for long logs). |
| Button | `.btn--primary`: the one main action in a view. `.btn`: other actions. `.btn--text`: low-emphasis or inline actions. `.btn--icon`: a button whose only content is an icon; it must have an `aria-label`. MUI: `<IconButton aria-label>`. `.btn--described` (with `.btn__sub`): an action with a line under it saying what it does, in a short list someone picks from. |
| Alert | `--ok`, `--warn`, `--error` for status; `--accent` for a question to the person ("Did you send it?"). Add `--sm` inside rows. |
| Size | `.btn--sm`, `.input--sm`, `.select--sm` inside table rows only. Elsewhere, default size. |
| Table | `.table--compact` for tables people scan; default for tables people read. Wide tables go inside `.table-scroll`. |
| Table cell | A number or date alone in a cell: `.table__cell--num` on its `th` and `td`s (centred, equal-width figures). Text stays left. |
| Page | `<main class="page">` for the page container, `.page-header` for its eyebrow, title and description. A page that is one short form (sign-in, passcode): `.page page--single`. |
| Card | `.surface`; add `.surface--padded` when content sits directly inside it. `.surface__title` for its small caps title. `.surface--brand` for the one panel a page highlights (navy, fixed inks). |
| Quiet text | `.muted`: colour only, so it fits any size of text it sits in. |
| Multi-line input | `.textarea` with a `rows` attribute. |
| App header | `.app-header` with `__title`, `__nav`, `__meta`: the app's name, main navigation and extras (environment badge, user). One per app. |
| Tabs | `.tabs` with `.tab` and `aria-selected`. `.tab--group-end` on the last tab of a group draws the divider (MUI `<Tab>` too). |
| Form | `.form-grid`; `__wide` for a field that needs the whole row, `__actions` for its buttons. |
| Filters | `.filter-bar` above the table or list it filters; `__range` for a from/to pair, `__group` for a set of checkboxes that filter together, `__actions` for Apply / Clear. |
| Section header | `.section-header` for a section's title, an optional line under it (`__sub`) and its actions (`__actions`). |
| Choices | `.choices` with `.btn`s and `aria-pressed` when exactly one is chosen and it changes the view (sort, period). Not for navigation (tabs) or filtering a list by several values (filter bar). MUI: `<ToggleButtonGroup exclusive>`. |

## 9. Accessibility comes with the markup; use the markup

- Sortable headers: `<th aria-sort="ascending|descending">` with
  `<button class="table__sort">`. The arrow is drawn from `aria-sort`, so no
  `aria-sort` means no arrow.
- Ratings: React's `<Rating>`, which handles keyboard and screen readers.
- Disabled: the `disabled` attribute, or `aria-disabled="true"` if it must
  stay focusable (then ignore its clicks yourself).
- Key/value pairs: `<dl class="kv">`, so labels pair with values.
- Accent prompts are questions, not alarms: never `role="alert"` on them.

## 10. Run the audit before every pull request

`npx rm-brand-audit`. A finding you think is wrong is a conversation about
this system, not a reason to ignore it.

## 11. Framework notes

**MUI apps:** build the theme from `getRMThemeConfig()`. Use MUI's own
controls (`size="small"` inside table rows, MUI's `<Rating>`); the theme
styles them to match. For page structure put the layout classes on a `Box`
(`<Box component="header" className="app-header">`) with MUI components
inside, and use the theme's Typography variants for text (`lead` for an
intro line, `stat` for a stat card's number, `appTitle` for the app's name
in the header). The palette carries the accent ramp
(`palette.accent[100]`) and code colours (`palette.code.bg`); icons size
with `fontSize="small|medium|large"`; MUI's own transitions use the
system's durations and easing. Dark mode: `getRMThemeConfig({ dark: true })`
(rule 7).

**React components** (`@russell-marketing/brand-ui/react/*`) depend on React
only, never MUI, so they work in every React app. Next.js 15 compiles them
with no configuration. With another bundler, make sure it compiles JSX from
`node_modules`. The older `SliderWithLabel` and `RateField` wrap MUI and are
for MUI apps only.

## 12. Interfaces that can't install the package

A Chrome extension popup or an Apps Script page can't load an npm package,
but the repo it lives in can. Copy the system's CSS in with the package's
own command, never by hand:

```bash
npx rm-brand-copy extension/vendor           # tokens.css + dark.css
npx rm-brand-copy extension/vendor core.css  # or name files under ui/
```

- Link the copies (`rm-brand-tokens.css`, `rm-brand-dark.css`) and use tokens
  as everywhere else. Rules 5–9 apply in full.
- Add `npx rm-brand-copy <dir> --check` to the app's checks. It fails when a
  copy is missing, edited, or older than the installed package, so after an
  update it tells you to re-copy.
- Never edit a copy. The audit skips copied files because they are the
  system's own CSS; an edit would hide from it.

## 13. Every screen works at phone width

People open these tools on their phones. A screen that works at 1440px and
breaks at 375px is broken.

- **Use the layout classes** (rule 8): `.app-header`, `.tabs`, `.form-grid`,
  `.filter-bar`. They rearrange themselves; nothing needs a breakpoint in the
  app.
- **Tabs scroll, never squeeze.** Labels stay on one line and the row
  scrolls sideways. In MUI, the theme makes every `<Tabs>` scrollable: never
  set `variant="fullWidth"`.
- **No fixed widths on fields.** The form grid or filter bar sets each
  field's width. `width: '100%'` is fine; `width: 150` is not.
- **Nothing wider than a phone.** No `width` or `min-width` over 320px
  unless a `max-width: 100%` caps it (a drawer, a dialog), and never
  `100vw`, which is wider than the page whenever there is a scrollbar.
- **Nothing positioned to sit on top of something else** in a header or
  toolbar (`position: absolute` to centre the tabs): it overlaps the moment
  the screen narrows. The header's grid centres its navigation.
- **Look at it.** Every pull request that changes a screen includes a
  screenshot of it at 375px wide as well as at desktop width.
