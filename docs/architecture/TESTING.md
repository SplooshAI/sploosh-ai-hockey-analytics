# Testing Strategy

## Overview

This document outlines the testing approach for the Sploosh AI Hockey
Analytics project.

## Test File Organization

### Colocated Tests

**All test files should be colocated with the code they test.**

This approach:

- Makes tests easier to find and maintain
- Keeps related code together
- Avoids replicating directory structures in a separate `__tests__` folder
- Makes it clear what each test file is testing

**Naming Convention:**

- Test files should be named `{filename}.test.{ext}` or
  `{filename}.{description}.test.{ext}`
- Example: `page.tsx` → `page.test.tsx`
- Example: `utils.ts` → `utils.test.ts`
- Multiple test files per component are encouraged when focusing on specific
  functionality, features, or bug fixes
- Example: `game-header.tsx` could have:
  - `game-header.test.tsx` (general tests)
  - `game-header.accessibility.test.tsx` (accessibility-specific tests)
  - `game-header.performance.test.tsx` (performance tests)

**Why Multiple Test Files?**

Large test files become unwieldy and expensive to manage. Breaking tests
into focused files:

- Makes tests easier to navigate and understand
- Allows parallel test execution
- Reduces cognitive load when working on specific features
- Makes it clear what aspect of the code is being tested

**Example Structure:**

```text
app/
  page.tsx
  page.test.tsx                    # General page tests
  page.loading.test.tsx            # Loading state regression tests
  layout.tsx
  layout.test.tsx
components/
  features/
    game-header/
      game-header.tsx
      game-header.test.tsx         # General component tests
      game-header.accessibility.test.tsx  # Accessibility tests
      game-header.styles.ts
lib/
  utils/
    shot-chart-utils.ts
    shot-chart-utils.test.ts       # Unit tests
    shot-chart-utils.integration.test.ts  # Integration tests
```

### Test Discovery

Vitest automatically discovers all `*.test.ts` and `*.test.tsx` files
throughout the project, regardless of location. This means:

- No need to maintain a separate test directory structure
- New tests are automatically included in test runs
- Tests live next to the code they verify

## Test Types

### Unit Tests

Test individual functions, components, and modules in isolation.

**Location:** Colocated with the code being tested
**Tool:** Vitest + React Testing Library
**Example:** `app/page.test.tsx`

### Integration Tests

Test interactions between multiple components or modules.

**Location:** Colocated with the primary component/module being tested
**Tool:** Vitest + React Testing Library
**Naming:** May include `.integration.test.tsx` suffix for clarity (optional)

### End-to-End (E2E) Tests

Test complete user workflows and scenarios.

**Location:** TBD - May warrant a dedicated `e2e/` folder at project root
**Tool:** TBD (Playwright, Cypress, etc.)
**Status:** Not yet implemented

## Running Tests

### All Tests

```bash
npm test
```

Runs all unit and integration tests across the project, plus GitHub
workflow tests.

### Watch Mode (Development)

```bash
npm run test:ui
```

Opens Vitest UI for interactive test development and debugging.

### From App Directory

```bash
cd apps/sploosh-ai-hockey-analytics
npm test
```

Runs only the app's unit/integration tests (excludes workflow tests).

## Writing Tests

### Test Structure

Follow the Arrange-Act-Assert pattern:

```typescript
it('should do something specific', () => {
  // Arrange - Set up test data and mocks
  const mockData = { ... }
  
  // Act - Execute the code being tested
  const result = functionUnderTest(mockData)
  
  // Assert - Verify the expected outcome
  expect(result).toBe(expectedValue)
})
```

### Regression Tests

When fixing bugs, write a test that:

1. Reproduces the bug (test fails)
2. Verifies the fix (test passes after fix)
3. Prevents the bug from returning

Document the original bug in test comments for context.

**Example:** `app/page.test.tsx` includes regression tests for the race
condition bug that was fixed by removing `loading` from useEffect
dependencies.

## Test Coverage

### Current Status

- Basic test infrastructure established
- Regression tests for critical bugs
- Coverage goal: >30% initially, >80% long-term

### Coverage Goals (Phase 1)

- Critical user paths (game loading, navigation)
- Data transformation and validation
- Error states and loading states
- Special event handling (Winter Classic, etc.)

## Best Practices

1. **Keep tests focused** - One test should verify one behavior
2. **Use descriptive names** - Test names should explain what's being
   tested
3. **Avoid test interdependencies** - Each test should run independently
4. **Mock external dependencies** - API calls, timers, etc.
5. **Test behavior, not implementation** - Focus on what the code does,
   not how
6. **Keep tests maintainable** - Colocate with code, use clear naming

## Future Considerations

### Integration Test Organization

As the project grows, we may need to establish patterns for:

- Multi-component integration tests
- API integration tests
- State management tests

These will be documented as patterns emerge during Phase 1 testing
setup.

### E2E Test Organization

E2E tests may warrant a dedicated folder structure:

```text
e2e/
  game-loading.spec.ts
  navigation.spec.ts
  shot-chart.spec.ts
```

This will be determined during Phase 1 E2E test implementation.

## References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Strategic Plan - Phase 1 Testing](
  ../planning/2026-q1-strategic-planning/README.md#phase-1-critical-fixes--lightweight-testing-q1-2026---weeks-1-3)
