---
title: Curb Replay-State Resurrection (Draft Field Notes)
date: 2026-03-09
tags: [curb, debugging, state-machines, field-notes]
---

A "gone" vehicle ticket kept reappearing after replay.

It looked random at first. It wasn't.

What actually moved the bug:

1. **Ticket-scoped instrumentation** at every mutation boundary (ingest, replay apply, correction pass).
2. **Deterministic tie handling** for equal timestamps in replay ordering.
3. **Narrow correction scope** so reconciliation cannot overreach live state.
4. **Rename/edit guards** that preserve pull-state precedence.

The pattern is boring and repeatable:

- If a replay bug feels random, assume ordering ambiguity until proven otherwise.
- If correction logic is broad, assume it is rewriting valid live state.
- If edits can re-key entities, verify precedence rules at the key boundary.

This draft is intentionally concise; before publication it needs one concrete before/after trace (single ticket timeline) to anchor the lesson in observable evidence.