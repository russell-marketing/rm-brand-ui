# 0005. The page scrolls, not its panels

**Status:** Accepted
**Date:** 2026-10-23

## Context

Nothing in the system said what scrolls: the page, or a column inside it.
The question came up in an app ("I think it's more natural if it's the
overall screen, not one column at a time"), and the answer was already
built that way there, but three apps could each have answered it
differently and all passed the audit.

At the same time, 1.10.1 made a long table with a sticky header scroll
inside its own box, so its header stays in view. That is a panel with its
own scrollbar, so the rule had to say when that is right.

## Decision

The page scrolls. A column or panel grows with its content and the page
grows with it.

A part of the page scrolls on its own only when it has to keep something in
view while its content moves:

- something floating over the page (a popover, menu, drawer or dialog),
  which can't grow the page it sits on;
- a long table whose header stays in view;
- two lists someone compares side by side, each filling the screen's
  height.

A long list shows more as the page scrolls, instead of sitting in a scroll
box. Sideways scrolling for a wide table is a separate matter (rule 13).

This is RULES.md rule 14. The audit lists every up-and-down scroll area as a
check, so each one is looked at; it can't tell the allowed cases apart from
code alone.

## Consequences

- Two scrollbars side by side, and short panels hiding content behind a
  scrollbar, are out.
- The show-more-as-you-scroll behaviour is a React hook in one app today.
  It moves into the system (as a React component, decision 0002) when a
  second app needs it, not before.
