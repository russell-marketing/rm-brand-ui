# 0004. A shape is allowed only when it carries a meaning

**Status:** Accepted
**Date:** 2026-10-20

## Context

This system names things by what they mean (`--warn`, `.choices`), never by
how they look. An app asked for a capsule-shaped button because a wireframe
drew one; the system refused, because the shape said nothing a standard
button didn't, and gave the meaning (one chosen option) its own component,
`.choices`.

Then the client portal's task list drew round ticks beside each task, and
the same question came up for checkboxes. A round box could be a look, like
the capsule. It can also be a convention people already read: in Asana,
which RM works in every day, and in Apple Reminders, a circle means "mark
this task done", and a square means "choose this option".

## Decision

A shape is allowed when it carries a meaning users already know, and is
refused when it is only a look.

For checkboxes that means two controls, each named for its job:

- `.checkbox`, square: choose an option or turn a setting on.
- `.task-list__done`, round: complete a task. It exists only inside
  `.task-list`, so it can't be borrowed for its look.

There is no general round-checkbox modifier.

## Consequences

- An app asking for a shape gets one question first: does this shape mean
  something users already know? If yes, the system adds a component named
  for that meaning; if no, the app uses the standard shape.
- The client portal's staged `.checkbox--round` is replaced by the task
  list; its `.checkbox` becomes the system's.
