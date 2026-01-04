# Documentation

This folder contains all project documentation including:

- Strategic planning documents
- Bug fix documentation
- Feature documentation
- Architectural decision records

## Purpose

Centralize all project documentation to:

- Track implementation details and design decisions
- Preserve context for future engineers (including ourselves)
- Document strategic planning and roadmaps
- Record architectural decisions and rationale

## Structure

### `/planning`

Strategic planning documents and roadmaps:

- Quarterly planning (e.g., `2026-q1-strategic-planning/`)
- Project milestones and phases
- Resource allocation and priorities
- Progress tracking

### `/bugs`

Detailed documentation for bug fixes:

- Root cause analysis
- Reproduction steps
- Fix approach and rationale
- Test coverage added
- Related issues or side effects

### `/features`

Detailed documentation for new features:

- Requirements and user stories
- Design decisions and alternatives considered
- Implementation approach
- Test coverage
- Usage examples

### `/architecture`

Architectural decision records (ADRs):

- Problem statement
- Options considered
- Decision rationale
- Trade-offs and implications
- Migration path (if applicable)

## Document Naming Convention

Keep it simple - use descriptive names with dates:

- `YYYY-MM-DD-short-description.md`
- Example: `/docs/bugs/2026-01-05-fix-goalie-pulled-ppg.md`
- Example: `/docs/features/2026-01-15-analytics-events.md`
- Example: `/docs/architecture/2026-02-01-api-abstraction.md`

**Note:** If directories become too large in the future, we can reorganize
into subdirectories as needed. Start simple.

## Template

See `TEMPLATE.md` for a starting template for work documentation.

## Linking Between Documents

Strategic plans should link to detailed documentation as work progresses:

- From planning docs to bug/feature/architecture docs
- From code to relevant documentation
- Cross-reference related decisions and implementations

This keeps strategic plans concise while preserving detailed context.
