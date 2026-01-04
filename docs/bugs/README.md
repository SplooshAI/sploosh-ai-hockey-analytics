# Bug Fix Documentation

This folder contains detailed documentation for bug fixes in the Sploosh.AI
Hockey Analytics project.

## Purpose

Document bug fixes to:

- Preserve root cause analysis for future reference
- Track what was tried and why certain approaches were chosen
- Provide regression test context
- Help future engineers understand the fix

## When to Create Documentation

Create a bug fix document when:

- The bug is non-trivial or has subtle root causes
- Multiple approaches were attempted
- The fix has implications for other parts of the system
- Future engineers would benefit from understanding the context

Simple, obvious fixes may not need dedicated documentation.

## What to Include

Use `/docs/TEMPLATE.md` as a starting point. Key sections:

- **Problem Statement**: What was broken? How did it manifest?
- **Root Cause**: Why did the bug occur?
- **Reproduction Steps**: How to reproduce the bug
- **Fix Approach**: What was changed and why
- **Alternatives Considered**: What else was tried or considered
- **Test Coverage**: Regression tests added to prevent recurrence
- **Related Issues**: Links to similar bugs or affected features

## File Naming

- `YYYY-MM-DD-short-description.md`
- Example: `2026-01-05-fix-goalie-pulled-ppg-bug.md`

## Linking

Reference bug documentation from:

- Strategic planning documents
- PR descriptions
- Code comments (for complex fixes)
- Related feature documentation
