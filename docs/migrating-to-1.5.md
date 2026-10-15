# Moving an app to 1.5

Nothing in 1.5 breaks an app on 1.4. This guide is about bringing an app
in line with [RULES.md](../RULES.md), which 1.5 introduces.

## 1. The dependency (rule 1)

```json
"@russell-marketing/brand-ui": "github:russell-marketing/rm-brand-ui#semver:^1.5.0"
```

If the app still uses the old package name `@russell-marketing/brand-styles`,
every import path changes with it: `@russell-marketing/brand-styles/…`
becomes `@russell-marketing/brand-ui/…`.

```bash
npm uninstall @russell-marketing/brand-styles   # only if present
npm install "github:russell-marketing/rm-brand-ui#semver:^1.5.0"
```

## 2. One stylesheet import (rule 2)

Replace any piece imports (`/tokens`, `/core`, `/components/table` …) with:

```js
import '@russell-marketing/brand-ui/styles';
```

This also turns on dark mode. Before shipping, look at the app with the OS in
dark mode and fix what rule 6 flags.

## 3. Replace local versions with system ones

| If the app has its own… | Use |
|---|---|
| Small buttons / dropdowns / inputs in table rows | `.btn--sm`, `.select--sm`, `.input--sm` |
| Disabled button styling | Nothing: `.btn:disabled` is styled. Remove the local rule. |
| Link-style button | `.btn btn--text` |
| Grey outline badge | `.badge badge--neutral` |
| Small purple outline label | `.tag` (uses `--accent-ink`, which flips in dark) |
| Star rating | React: `import { Rating } from '@russell-marketing/brand-ui/react/Rating'` |
| Warning colours (hex, or danger standing in) | `--warning-bg`, `--warning-text`, `--warning-border`; `.alert--warn`, `.badge--warn` |
| Error box | `.alert alert--error` |
| Sort buttons in table headers | `<th aria-sort="…"><button class="table__sort">`, `--active` on the one in use. Remove local arrow glyphs: the system draws them. |
| Table cell padding overrides | `.table--compact` |
| Stat / metric card | `.stats` > `.stat` > `.stat__label`, `.stat__value`, `.stat__sub` |
| Label/value list | `<dl class="kv">` |
| Small boxed question in a row | `.alert alert--accent alert--sm` |
| 4px radius | `--radius-xs` |
| `.pill` | `.badge` |
| Brand colour as text | `--text-brand`, `--accent-ink` (rule 6) |
| Font sizes between scale steps | Nearest step: see the type scale in rule 5. Nothing below `--fs-xs`. |

## 4. Run the audit

```bash
npx rm-brand-audit
```

Work through the "fix" findings; look at each "check" finding. Anything the
system lacks goes in `ds-candidates.css` (rule 3), not a local workaround.

## What looks different after upgrading

Small changes to classes that already existed:

- `.btn--primary` on hover now turns Russell blue. Before, hover put
  near-white text on a near-white tint, so the label vanished.
- `.btn` has a visible focus ring (Galaxy, 2px).
- Badges: side padding 10px → 8px (`--space-2`), letter spacing .3px → .5px
  (`--ls-caps`). Both now come from tokens.
- MUI apps: disabled controls fade to 60% (was 70%), the same as the CSS.
