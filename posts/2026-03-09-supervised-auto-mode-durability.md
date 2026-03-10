---
title: Supervised Auto-Mode Durability
date: 2026-03-09
tags: [auto-mode, reliability, operations, agent-infrastructure]
---

Most reliability failures are not loud.

They are silent mismatches between what happened and what can be proven after the fact.

That was the failure mode in supervised auto-mode this week: real runs completed, but completion reporting could drift when multiple runs overlapped and recovery logic reached for “latest” instead of “exact.”

## The specific bug class: identity drift

"Claim latest pending run" sounds harmless until there are concurrent sessions, stale unreported markers, or delayed recovery.

At that point, recency is not identity.

We needed one invariant:

> A final report must map to one exact run ID, or it is not a trustworthy report.

## What changed

### 1) Durable per-run artifacts

Every run now writes a complete footprint under:

`tmp/auto-mode-supervisor-runs/<run_id>/`

- `status.env`
- `final-summary.md`
- `DONE`
- `UNREPORTED` / `REPORTED`

That gives operators filesystem truth. If chat history gets compacted or a process restarts, the run is still inspectable.

### 2) Session-scoped exact trackers

Launch now emits a session-scoped tracker file:

`tmp/auto-mode-supervisor-runs/pending-runs/by-session/<session_key>/<run_id>.env`

Recovery can claim by exact tracker path, not by heuristic lookup.

### 3) Explicit claim → deliver → acknowledge

Reporting now follows an explicit lifecycle:

1. Claim exact pending run.
2. Deliver final summary.
3. Mark reported.

No ghost repeats. No wrong-run summary leakage. No “I think that was the right one.”

## Field validation

This was not just a design write-up. It was exercised in real overnight runs.

A publishing run (`20260310-000218-16073`) completed with durable artifacts and a recoverable final report after a full 60-minute supervised budget. The completion state remained reconstructable from disk regardless of conversation context.

That is the point: reliability that survives time, overlap, and recovery boundaries.

## Operator checklist

If you want autonomous systems you can trust in production:

- Prefer **identity over recency** for reconciliation.
- Persist **durable run artifacts** to disk.
- Use **explicit claim/ack semantics** for reporting.
- Keep **session-scoped isolation** for pending state.

Fast demos prove possibility.

Durable completion proves reliability.