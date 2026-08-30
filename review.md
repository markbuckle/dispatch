# Review instructions

## What Important means here

This is a portfolio project, not production infrastructure, so calibrate
for that. Important means:

- Violates a stated architecture decision: SES called synchronously from
  a Hono route handler instead of through the Inngest data plane, webhook
  signing routed through a vendor SDK instead of the hand-rolled HMAC
  implementation in packages/core, or packages/compat importing React or
  Next
- A real correctness bug: unscoped queries, unvalidated input reaching
  the database, secrets in logs
- A comment that is multi-line, uses JSDoc-style blocks, narrates
  structure ("// Helpers"), or contains an em dash or "--" in prose

Naming preferences, minor duplication, and missing handling for cases
that cannot occur are Nit at most.

## Always check

- New API routes follow the control plane / data plane split: Hono
  validates and queues, Inngest performs the send
- packages/compat has no React or Next dependency
- Exported function signatures are annotated, no `any`, no `as` casts
  used to silence a type error
- Comments are single-line `//` only and explain why, not what

## Do not report

- Missing test coverage on UI-only changes
- Anything CI already enforces: lint, formatting, type errors
- Generated files and lockfiles

## Summary shape

Open with a one-line tally, like "1 architecture violation, 2 style."
Lead with "No blocking issues" when that's true.