# Project Rules for Sploosh AI Hockey Analytics

## Semantic Versioning

- Follow semantic versioning for all changes
- Use appropriate prefixes in PR titles and commit messages:
  - `feat:` for new features (minor version bump)
  - `feat!:` for breaking changes (major version bump)
  - `fix:` for bug fixes (patch version bump)
  - Other valid prefixes: `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`, `revert:`
- Ensure PR titles match the semantic versioning pattern required by CI checks

## Hockey Data Visualization

<data_visualization>
- Use consistent color schemes for all hockey visualizations:
  - Home team: #0066cc (blue)
  - Away team: #cc0000 (red)
  - Neutral events: #333333 (dark gray)
- Include clear legends for all visualizations
- Ensure all visualizations are responsive and work on mobile devices
- Provide appropriate tooltips for interactive elements
- Use colorblind-friendly palettes for important data distinctions
</data_visualization>

## Performance Standards

<performance>
- All animations should maintain 60fps on modern devices
- Page load time should be under 2 seconds for initial render
- Lazy load large data sets and visualizations
- Implement proper caching for API responses
- Use pagination for large data sets
- Optimize images and assets for web delivery
</performance>

## Accessibility Requirements

<accessibility>
- All interactive elements must be keyboard accessible
- Maintain WCAG 2.1 AA compliance for all features
- Provide appropriate alt text for all images and visualizations
- Ensure sufficient color contrast (minimum 4.5:1 for normal text)
- Support screen readers with proper ARIA attributes
- Test all features with keyboard-only navigation
</accessibility>
