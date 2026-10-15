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
"@russell-marketing/brand-ui": "github:russell-marketing/rm-brand-ui#semver:^1.5.0"
```

- The range gets every fix and addition, and never a breaking 2.0 by surprise.
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

*Exception:* an app whose entire UI is MUI components may use the theme file
alone (rule 11).

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

Layout is the app's own: column widths, grid templates, max-widths.

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

Brand colours are for backgrounds, borders and fills. The one exception is
brand text **on a brand background**, such as Moon on Space in a nav bar or
a table header: both stay fixed, so the pair keeps its contrast in both
themes. The audit can't always see a parent's background, so it marks these
findings "check", not "fix".

## 7. Every app supports dark mode

Following rules 5 and 6 gives you dark mode for free; the stylesheet follows
the OS setting. Setting `data-theme="light"` on `<html>` to opt out is
allowed only as a temporary step, with a backlog item to remove it.

## 8. Choose components by meaning, not by look

| Choice | Rule |
|---|---|
| `.badge` or `.tag` | Badge = the **state** of a thing (new, ready, needs attention). Tag = its **kind** or source ("Updates", "Discord"). |
| Badge variant | `--new`, `--ready`, `--warn`, `--neutral` (present, not asking for attention). |
| Button | `.btn--primary`: the one main action in a view. `.btn`: other actions. `.btn--text`: low-emphasis or inline actions. |
| Alert | `--ok`, `--warn`, `--error` for status; `--accent` for a question to the person ("Did you send it?"). Add `--sm` inside rows. |
| Size | `.btn--sm`, `.input--sm`, `.select--sm` inside table rows only. Elsewhere, default size. |
| Table | `.table--compact` for tables people scan; default for tables people read. |

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
styles them to match. The theme has no dark scheme yet: that gap is this
system's to fix, not the app's.

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

