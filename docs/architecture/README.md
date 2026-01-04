# Architecture Documentation

This folder contains architectural decision records (ADRs) and system design
documentation for the Sploosh.AI Hockey Analytics project.

## Purpose

Document architectural decisions to:

- Preserve context for why systems were designed a certain way
- Track evolution of architecture over time
- Help future engineers understand design trade-offs
- Provide reference for similar decisions
- Enable informed refactoring and improvements

## When to Create Documentation

Create architecture documentation when:

- Making significant architectural decisions
- Introducing new patterns or approaches
- Changing existing architectural patterns
- Evaluating technology choices
- Planning major refactoring efforts
- Documenting current state for reference

## What to Include

Use `/docs/TEMPLATE.md` as a starting point. Key sections for architecture docs:

- **Problem Statement**: What architectural challenge are we addressing?
- **Context**: Current state, constraints, requirements
- **Options Considered**: Different approaches evaluated
- **Decision**: What was chosen and why
- **Rationale**: Trade-offs, benefits, drawbacks
- **Consequences**: Implications for the system
- **Migration Path**: How to transition (if applicable)
- **Related Decisions**: Links to related architectural choices

## Current Architecture

See `ARCHITECTURE.md` for the canonical, living architecture document that is
always kept up-to-date with the current system state.

## Historical Snapshots

See `2026-01-03-initial-state.md` for a comprehensive snapshot of the system
architecture as of January 3, 2026 (initial state). This document captures:

- Technology stack
- Project structure
- Architecture patterns
- Data models
- Testing strategy
- CI/CD pipeline
- Performance characteristics
- Known issues and technical debt
- Future considerations

## File Naming

- `YYYY-MM-DD-short-description.md`
- Example: `2026-01-03-current-state-architecture.md`
- Example: `2026-02-01-api-abstraction-layer-design.md`
- Example: `2026-03-15-neo4j-data-model.md`

## Linking

Reference architecture documentation from:

- Strategic planning documents
- Feature documentation
- Bug fix documentation
- PR descriptions
- Code comments (for architectural patterns)
- README files

## Architecture Evolution

As the system evolves, create new architecture documents that reference
previous decisions. This creates a historical record of architectural evolution
and the reasoning behind changes.

**Example progression:**

1. `2026-01-03-current-state-architecture.md` - Initial state
2. `2026-02-01-api-abstraction-layer-design.md` - New pattern introduced
3. `2026-03-15-neo4j-integration.md` - Data persistence added
4. `2026-06-01-multi-league-architecture.md` - System expansion

Each document should reference related decisions and explain how the
architecture evolved.
