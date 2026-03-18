---
title: "Curb Replay-State Resurrection: Field Notes"
date: "2026-03-09"
description: "A practical pattern for debugging replay-driven state resurrection in production."
tags: ["curb", "debugging", "state-machines", "field-notes"]
---

A vehicle ticket marked gone kept reappearing. It looked random, but wasn't.

What fixed it:
1. Ticket-targeted instrumentation at every mutation boundary.
2. Deterministic replay tie handling for equal timestamps.
3. Narrow correction rules so reconciliation can't overreach live state.
4. Rename/edit guards to preserve pull-state precedence.

When replay systems "randomly" fail, treat ordering and correction scope as first-class bugs.
