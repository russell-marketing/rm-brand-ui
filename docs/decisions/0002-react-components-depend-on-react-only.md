# 0002. React components depend on React only, not MUI

**Status:** Accepted
**Date:** 2026-10-14

## Context

The rule until now: every component ships as CSS, a React component that
wraps MUI, and an MUI theme mapping. The two React components that existed,
`SliderWithLabel` and `RateField`, both wrap MUI.

Of RM's eight React apps, three use MUI and five do not, including the two
newest apps that use this system. An MUI-wrapped component is unusable in
those five unless they install MUI for it. In practice they write their own
version instead, which is the drift this system exists to stop: a star
rating was hand-built in an app for exactly this reason.

## Decision

- **CSS** defines every component's look. Always.
- **The MUI theme** (`adapters/mui-theme.js`) styles MUI's own control
  wherever MUI has one. MUI apps use that control, not ours.
- **A React component** ships only when there is behaviour worth sharing:
  keyboard handling, screen-reader semantics, state. It depends on React
  alone, renders the CSS classes, ships a `.d.ts`, and has a behaviour test
  in `scripts/test-components.mjs`.

`SliderWithLabel` and `RateField` stay as they are, documented as MUI-only.
Whether to rewrite them is a 2.0 question.

## Consequences

- One component works in every React app. The look is defined once, in CSS,
  so React and plain-HTML apps cannot drift apart.
- This repo now owns behaviour code that MUI used to own. Every React
  component needs a behaviour test; `npm test` runs them.
- An MUI app has two ways to render some things. RULES.md settles it: MUI
  apps use MUI's control.
- Verified: Next.js 15 compiles the raw `.jsx` from `node_modules` with no
  configuration, and TypeScript resolves the `.d.ts` through the `types`
  export condition.
