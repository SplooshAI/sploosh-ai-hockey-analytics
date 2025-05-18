# Windsurf Rules for Sploosh AI Hockey Analytics

This directory contains configuration files for Windsurf, a code quality and standards enforcement tool. These rules help maintain consistency and quality across the codebase.

## Configuration Files

- `windsurf.json`: Main configuration file with basic project settings and general rules
- `rules.json`: Detailed rules for code quality, accessibility, and performance

## Rule Categories

### Commit and Branch Rules

- **Commit Messages**: Must follow the [Conventional Commits](https://www.conventionalcommits.org/) format
- **Branch Names**: Must follow the pattern `type/description-in-kebab-case`

### Code Quality Rules

#### TypeScript

- No use of `any` type
- Functions should have explicit return types
- No unused variables
- No console.log in production code

#### React

- Hooks must be called in the same order
- No direct state mutations
- Elements in iterators require keys
- Prefer functional components

### Accessibility Rules

- Images must have alt text
- ARIA properties must be valid
- Interactive elements should be focusable
- Elements with ARIA roles must have required attributes

### Performance Rules

- Bundle size limits
- Image optimization requirements
- Lazy loading recommendations

## Usage

Windsurf rules are automatically enforced during the development process. You may see warnings or errors in your IDE or during CI/CD pipelines if rules are violated.

To manually check your code against these rules, you can use the Windsurf CLI:

```bash
npx windsurf check
```

## Customizing Rules

To modify these rules, edit the appropriate configuration file and commit your changes. Rule changes should be discussed with the team to ensure everyone agrees with the standards being enforced.
