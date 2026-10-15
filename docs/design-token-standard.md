# Design tokens: where we stand against the W3C standard

**Audited 25 Sep 2026 against [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/).**

There is now an actual standard for design tokens. The W3C Design Tokens Community Group
published its [first stable specification](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
in October 2025, backed by Adobe, Figma, Google, Microsoft, Shopify and Salesforce. Before
that, every team invented its own conventions.

This document records every token we ship, whether it matches the standard, and where it
doesn't, **why not**. Most of the mismatches are deliberate, and the reason is the same one
each time — so that reason is worth reading first.

---

## The one thing to understand

**The standard governs a file format for *exchanging* tokens between tools. It does not
govern CSS custom properties or JavaScript objects.**

The spec describes a JSON format so that Figma, a build tool and a codebase can pass the same
values around without anyone retyping them. In that JSON, a spacing value looks like this:

```json
{ "space-4": { "$type": "dimension", "$value": { "value": 1, "unit": "rem" } } }
```

That is not something a browser can read. Our `ui/tokens.css` and `ui/tokens.js` are
**outputs** — the CSS-ready and JS-ready forms that browsers and MUI actually consume:

```css
--space-4: 1rem;
```

So "our tokens don't match the spec's shape" is mostly not a defect. It's the difference
between a shipping container and what's inside it. The question that matters is whether we
have a container at all — see [What real alignment would take](#what-real-alignment-would-take).

---

## The audit

76 tokens in `ui/tokens.css`, grouped by the spec's type system.

| Spec type | Ours | Our form | Spec form | Aligned? |
|---|---:|---|---|---|
| `color` | 34 | `#7A64A0`, `rgba(0,0,0,.25)` | object with `colorSpace`, `components`, `alpha` | **Partly** — see below |
| `dimension` | 24 | `1rem`, `40px` | `{ value: 1, unit: "rem" }` | Output form, by design |
| `fontWeight` | 5 | `400`, `500`, `600`, `700`, `800` | number 1–1000, or a keyword | **Yes** |
| `number` | 4 | `--z-modal: 1100` | JSON number | **Yes** |
| `fontFamily` | 2 | `"Raleway", "Roboto", sans-serif` | string **or array of strings** | Output form, by design |
| `cubicBezier` | 1 | `cubic-bezier(0.2, 0, 0, 1)` | `[0.2, 0, 0, 1]` | Output form, by design |
| `shadow` | 1 | `0 1px 2px rgba(0,0,0,.04), …` | array of `{color, offsetX, offsetY, blur, spread}` | Output form, by design |
| `duration` | 3 | `150ms` | `{ value: 150, unit: "ms" }` | Output form, **newly added** |
| *(alias)* | 6 | `var(--rm-infinite)` | `"{color.infinite}"` | Equivalent mechanism |

### Font weights — we pass

Worth stating plainly, because this is where the question started. The spec restricts
`fontWeight` to a number 1–1000 **or** one of a fixed keyword list, and says anything else
"*MUST* be rejected by tools". Our values are plain numbers, so they're conformant.

The keyword list matters only if we ever emit **strings** instead of numbers. If we do, note
the spec's spellings are hyphenated:

| Our key name | Value | Spec keyword for that value |
|---|---:|---|
| `regular` | 400 | `normal` · `regular` · `book` |
| `medium` | 500 | `medium` |
| `semibold` | 600 | **`semi-bold`** · `demi-bold` |
| `bold` | 700 | `bold` |
| `extrabold` | 800 | **`extra-bold`** · `ultra-bold` |

`semibold` and `extrabold` are *our key names*, which the spec does not govern — it explicitly
says tools "*SHOULD NOT*" infer meaning from names. They'd only need hyphenating if they became
values. Flagged so nobody trips on it later.

### Colours — the one real gap

The spec models opacity as a **separate `alpha` property**, not baked into the value. Four of
our tokens bake it in:

| Token | Value | What the spec wants |
|---|---|---|
| `--tooltip-border` | `rgba(0,0,0,.25)` | colour `#000000` + `alpha: 0.25` |
| `--skeleton-sheen` | `rgba(255,255,255,.60)` | colour `#FFFFFF` + `alpha: 0.6` |
| `--table-row-alt` | `rgba(219,230,227,.30)` | Dust `#DBE6E3` + `alpha: 0.3` |
| `--table-row-hover` | `rgba(224,193,105,.20)` | Estrella tint `#E0C169` + `alpha: 0.2` |

This one isn't purely cosmetic. Written as `rgba(219,230,227,.30)`, nothing connects that
value back to `--rm-dust` — as the comments admit by saying "RM Dust at 30%" in prose. If Dust
changed, these four wouldn't follow. **Not fixed here** (it needs `color-mix()` or a build
step, and touches the MUI adapter's two hardcoded `rgba()` values), but it's the token work
most worth doing next.

---

## Changed in this pass

| Change | Reason | Risk |
|---|---|---|
| Added `--duration-instant` `20ms`, `--duration-fast` `150ms`, `--duration-base` `200ms` | Transition timings were hardcoded in 4 places across 3 files, at 3 values, one written two ways (`.15s` and `150ms`). `duration` is a spec type; we had none. | None — tokens take the values already in use, and the 4 call sites now point at them. |
| Added `--fw-medium: 500` | The brand guide sets body copy in **Roboto Medium**, and the website handoff has the token. Ours skipped from 400 to 600. | None — additive. |

---

## Deliberately not changed

| Not doing | Why |
|---|---|
| Converting `fontFamily` to an array | `adapters/mui-theme.js` passes `tokens.fonts.display` straight into MUI's `fontFamily`, which needs a CSS string. An array breaks it. The array form belongs in the JSON source, not the output. |
| Converting `shadow` to an object | Same — `tokens.shadow.soft` goes straight into `boxShadow`. |
| Converting `dimension` to `{value, unit}` | Same. `1rem` is what CSS needs. |
| Converting `cubicBezier` to `[0.2, 0, 0, 1]` | Same. CSS needs `cubic-bezier(…)`. |
| Renaming `--fw-*` → `--font-weight-*` | Worth doing, but **not here**. `ui/tokens.css` says `--fw-bold`; the website handoff says `--font-weight-bold`. One has to give, and the right time is when `brand-tokens` is created and both packages point at it — not in a release that only moves one side. See below. |

---

## The source now exists

Everything above says "output form, by design". That's only a good answer if a **source** form
exists. As of this release it does:

```
tokens/rm.tokens.json     ← DTCG 2025.10. The single source. Edit this.
        │
        ├──→ ui/tokens.css   (generated)
        ├──→ ui/dark.css     (generated)
        └──→ Figma           (readable directly — this is what the format is for)
```

```bash
npm run build:tokens     # regenerate
npm test                 # fails if the generated files are stale
```

`ui/tokens.css` and `ui/dark.css` carry a `GENERATED — do not edit` banner. Editing one and
running `npm test` fails with `STALE`, naming the file.

### What that fixed immediately

Writing the source surfaced three bugs that were invisible while the values were hand-copied:

| Bug | Effect |
|---|---|
| `--rm-dark-text-primary` resolved to `var(--text-primary)` | A circular reference. Both would have been invalid. |
| `--rm-dark-accent-on` pointed at `--bg-page`, which `dark.css` reassigns | Fragile by luck rather than correct. |
| Dark `--skeleton-base` resolved to Dust rather than the dust tint | A light sage skeleton on a near-black page. |

### Colour alpha: fixed

The four overlay tokens no longer store a second copy of their base colour. Each records
**which token it derives from and at what alpha**, and the generator resolves it:

```jsonc
"tableRowAlt": {
  "$type": "color",
  "$value": { "alpha": 0.3 },
  "$extensions": {
    "co.russellmarketing.derivedFrom": { "base": "color.brand.dust", "alpha": 0.3 }
  }
}
```

Change Dust in the source and rebuild, and `--table-row-alt` **and** its dark counterpart both
follow — one edit, four outputs. Previously `rgba(219,230,227,.30)` was connected to `--rm-dust`
by nothing but a comment.

DTCG colour values have no "reference plus an alpha override", so the relationship lives in
`$extensions`, which is exactly what the spec provides extensions for.

## Still to do

- **`ui/tokens.js` is still hand-written.** It carries JS-only groups the CSS has no equivalent
  for — the chart palettes, score colours and slider detail. Until it is generated too,
  `npm test`'s parity check is what keeps it honest.
- **`--fw-*` vs `--font-weight-*`** is still unresolved between this package and the website
  handoff. Decide it in the source when `brand-tokens` is created, and both outputs follow.
- **Names that describe the value rather than the brand.** The website handoff has `--bg-sage`,
  which is Dust under a second name. Brand colours should travel under their brand names
  everywhere; a token called `sage` makes a second vocabulary for the same palette.

---

## Sources

- [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/) — the specification
- [First stable specification announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) — W3C DTCG, 28 Oct 2025
- [Design Tokens Community Group](https://www.w3.org/community/design-tokens/)
