# 0003. Apps conform to the system, not the other way round

**Status:** Accepted
**Date:** 2026-10-14

## Context

Apps built their own versions of things this system lacked, under their own
names and off its scales. When those requests came here, the easy path was to
adopt each app's names and values. App-level styling choices are rarely the
product of a design process: the apps rely on this system to do that
thinking.

## Decision

This system sets the rules, in [RULES.md](../../RULES.md), and apps follow
them. A request from an app is designed on this system's conventions:
meaning-based names, on-scale tokens, accessible markup. The app renames
and adjusts to fit.

Alongside the rules, the system helps apps comply:

- `npx rm-brand-audit` checks an app against the rules.
- A migration guide per release maps old local patterns to system ones.
- `ds-candidates.css` is the one sanctioned place for an app to hold styles
  waiting to land here.

Also settled here:

- Apps load the whole stylesheet, once.
- Apps depend on a version range (`#semver:^1.x`), never `#main`.
- Every app supports dark mode. Forcing light is a temporary step only.

## Consequences

- Upgrading costs an app real work: renames, snapping to the type scale,
  fixing brand-colour text for dark mode.
- The system must be complete enough to be strict about. When an app can't
  comply because the system lacks something, that is the system's backlog,
  not the app's exception.
