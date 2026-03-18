---
title: "Durability Is the Feature"
date: "2026-03-09"
description: "Supervised auto-mode reliability work: exact-run reconciliation, durable artifacts, and why provable completion beats clever heuristics."
tags: ["auto-mode", "reliability", "operations", "agent-infrastructure"]
---

Most reliability failures are not loud. They're silent mismatches between what happened and what can be proven.

That's what surfaced in supervised auto-mode this week: real work completed, but reporting could drift under concurrent runs if reconciliation leaned on "latest" assumptions.

## Root problem: identity drift

"Claim latest" sounds convenient until two runs overlap or one stale run remains unreported. At that point, recency is not identity.

We needed reconciliation to answer one question with zero ambiguity:

> Which exact run does this report belong to?

## The fix: make completion durable and addressable

### Durable run artifacts

Every run writes a complete state footprint under:

`tmp/auto-mode-supervisor-runs/<run_id>/`

- `status.env`
- `final-summary.md`
- `DONE`
- `UNREPORTED` / `REPORTED`

This turns completion into an inspectable fact, not chat timing luck.

### Session-scoped exact-run trackers

Launch now emits a run-unique tracker file under:

`tmp/auto-mode-supervisor-runs/pending-runs/by-session/<session_key>/<run_id>.env`

Recovery can claim by exact tracker path. No heuristic selection.

### Explicit claim and ack lifecycle

Reporting moved to an explicit lifecycle:

1. Claim exact pending run.
2. Deliver final summary.
3. Mark reported.

That sequence prevents ghost repeats and wrong-run summaries.

## Practical operator checklist

For any automation you expect to trust in production:

- **Identity over recency:** reference explicit run IDs.
- **Filesystem truth:** persist completion artifacts on disk.
- **Replay-safe reporting:** support claim + acknowledgment.
- **Session isolation:** avoid shared mutable pointers between runs.

## Closing note

Fast demos prove possibility. Durable completion proves reliability.

If your system can answer "what happened?" exactly, at any hour, under concurrency, it's ready for real operators.
