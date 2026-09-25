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

## What real alignment would take

Everything above says "output form, by design". That's a good answer only if a **source** form
exists somewhere. Right now it doesn't: `ui/tokens.css` and `ui/tokens.js` are both hand-written,
and each is the other's twin rather than either being authoritative.

That's why `npm test` has to check them against each other. The check is a workaround for a
structural gap.

Genuine alignment looks like this:

```
tokens.json  ← DTCG 2025.10 format, the single source
     │
     ├──→  tokens.css   (generated)
     ├──→  tokens.js    (generated)
     └──→  Figma        (imported directly — this is what the format is for)
```

This is worth doing at the same moment as the `brand-tokens` package, because it solves three
problems at once:

1. **Drift between `tokens.css` and `tokens.js`** stops being possible — they're built from one file rather than kept in step by a test.
2. **The `--fw-*` vs `--font-weight-*` split** is decided once, in the source, and both outputs follow.
3. **Figma can read the file directly**, so the brand guide and the code stop being separate artefacts maintained by hand.

Until then, `npm test` is the thing standing between us and silent drift, and it should keep
running on every change.

---

## Sources

- [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/) — the specification
- [First stable specification announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) — W3C DTCG, 28 Oct 2025
- [Design Tokens Community Group](https://www.w3.org/community/design-tokens/)
