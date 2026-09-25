# 0001. The guard checks are copied here, not shared

**Status:** Accepted
**Date:** 2026-09-25

## Context

Every other Russell Marketing repo gets its CI guards by calling one shared
workflow:

```yaml
uses: russell-marketing/rm-engineering/.github/workflows/guards.yml@v1
```

That is the whole point of the arrangement — the rules live in one place and
cannot drift between repos.

This repo cannot do it. What was observed:

- `rm-brand-ui` is **public**. It is the only public repo RM has.
- `rm-engineering`, which holds the shared workflow, is **private**.
- GitHub does not allow a public repository to call a reusable workflow
  stored in a private repository. A public caller can only use public
  reusable workflows.
- This was not a guess. The call was added, pushed, and the run failed
  immediately with no jobs started — the same signature as an unresolvable
  workflow reference. `rm-engineering`'s Actions access is already set to
  `organization`, so the setting is not the problem; the visibility
  combination is.

Every other repo in the rollout went green with the shared call. This one
was the only failure.

## Decision

Copy the three checks from `rm-engineering`'s `guards.yml` at tag `v1`
directly into this repo's workflow, and say clearly at the top of the file
that it is a copy, why it is a copy, and that changes must be made in both
places.

The copied checks were diffed against `v1` and are identical.

## Consequences

This repo is actually guarded, rather than being the one repo excused from
the rules because of a packaging detail. It is RM's only public repo, so it
is the one where a committed secret would do the most damage — leaving it
unchecked would have been the worst possible place to make an exception.

**And what it costs us.** There are now two copies of the guard logic, and
the second one will drift. The whole design was "the rules live in one place
and can't drift between repos," and this repo is now outside that guarantee.
When someone updates the shared guards and cuts a v2, nothing will remind
them this file exists. The comment at the top of the workflow is the only
safeguard, and a comment is not a mechanism.

## The alternative we did not take

Making `rm-engineering` public would let this repo use the shared workflow
like everything else, and would remove the duplication entirely.

That was not done here because it is Ruth's call, not a technical
tidy-up — publishing the handbook also publishes RM's internal practices,
including `practices/05-secrets.md`, which describes a real credential that
sat in a repo for eleven months. That is a disclosure decision, not an
engineering one.

If Ruth does make `rm-engineering` public, this ADR should be superseded and
this workflow replaced with the one-line shared call.
