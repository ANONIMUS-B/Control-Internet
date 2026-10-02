---
name: code-review
description: Perform comprehensive, senior-level code reviews on changes, pull requests, and modified files before committing or merging, focusing on correctness, maintainability, edge cases, performance, and clean code. Trigger before commits, PR submissions, or upon user request to audit recent changes.
---

# Senior Code Review Guide

Conduct high-impact code reviews that catch subtle bugs, enforce architectural consistency, and elevate codebase quality before merging.

## Core Principle

**A good review doesn't just ask "Does it work?" It asks "What happens when it breaks, scales, or changes six months from now?"**

---

## The 5 Review Pillars

### 1. Correctness & Edge Cases (CRITICAL)
* **Null & Undefined handling**: Are optional relationships, missing parameters, or empty arrays properly handled without runtime crashes?
* **Off-by-one & Boundary conditions**: Check loop bounds, date range filters (inclusive vs. exclusive), and pagination limits.
* **Race Conditions & Concurrency**: Are financial balances, inventory counts, or status transitions protected against concurrent double-submissions (e.g., using DB transactions and row locks)?

### 2. Architecture & Design Patterns
* **Single Responsibility (SRP)**: Does each class or function do one thing well? Flag controllers that handle business logic, email formatting, and database queries all at once.
* **DRY with Discretion**: Avoid duplicated business rules, but do not create premature abstractions for coincidental duplication.
* **Convention Compliance**: Does the code match the existing project conventions (naming conventions, folder structure, coding style)?

### 3. Performance & Resource Consumption
* **N+1 Queries**: Are database relationships eagerly loaded (`with(['relation'])`) when iterating collections?
* **Memory Leaks & Heavy Collections**: Avoid loading thousands of records into memory with `all()`. Use chunking (`chunkById`), lazy collections, or database pagination.
* **Frontend Re-renders**: Are expensive calculations memoized where necessary? Are dependencies arrays in React hooks accurate?

### 4. Readability & Maintainability
* **Intent-Revealing Names**: Names should explain *why* something exists, not just *what* it is. (`isActiveSubscription` instead of `subCheck`).
* **Guard Clauses**: Prefer early returns to deeply nested `if/else` structures.
* **Self-Documenting Code**: Keep inline comments to a minimum, reserving them for explaining non-obvious *why* business decisions rather than *what* the code does.

### 5. Security & Error Handling
* **Input Validation**: Is all external input strictly validated and sanitized?
* **Defensive Error Handling**: Are external API calls (payment gateways, third-party services) wrapped in proper try/catch blocks with fallback states?
* **Secret Leakage**: Are tokens, API keys, or test credentials hardcoded?

---

## Feedback Format

When reviewing code, organize feedback by severity:

```markdown
### 🚨 Blocker (Must fix before merge)
* **File & Line**: Description of bug, security risk, or regression.
  * **Suggested fix**: Code snippet.

### ⚠️ Improvement (Should fix for quality/performance)
* **File & Line**: Architectural concern, N+1 query risk, or readability issue.

### 💡 Nitpick (Optional suggestion / Polish)
* Minor naming or styling polish that doesn't block progress.
```
