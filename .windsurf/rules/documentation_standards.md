---
trigger: always_on
---

# Documentation Standards

## README Maintenance

### Package.json Scripts

- When adding or modifying scripts in `package.json`:
  1. Update the README's "Available Scripts" section to reflect the changes
  2. Document the purpose of each script
  3. Group related scripts under appropriate headings (e.g., "Docker Management", "Testing")
  4. Include any important notes or warnings for potentially destructive commands

### Prerequisites

- List all required software and tools in the Prerequisites section
- Include version requirements where applicable
- Provide installation links for all dependencies

### Quick Start Guide

- Keep the quick start guide up-to-date with the current setup process
- Include all necessary steps to get started
- Use code blocks with proper syntax highlighting
- Add any environment variables or configuration needed

## Component Documentation

<component_documentation>

- Each React component should include:
  - JSDoc comments describing the component's purpose
  - Props interface with descriptions for each prop
  - Example usage in a code comment
  - Any important notes about dependencies or side effects

Example:

```tsx
/**
 * RinkControlPanel - Provides controls for hockey rink animation
 * 
 * @example
 * <RinkControlPanel
 *   plays={plays}
 *   speed={1}
 *   setSpeed={setSpeed}
 *   showTrail={true}
 *   setShowTrail={setShowTrail}
 * />
 */
interface RinkControlPanelProps {
  /** Array of play events to animate */
  plays: NHLEdgePlay[];
  /** Animation speed multiplier */
  speed: number;
  /** Function to update animation speed */
  setSpeed: (speed: number) => void;
  // ... other props
}
```

</component_documentation>

## API Documentation

<api_documentation>

- Document all API endpoints in a consistent format
- Include:
  - Endpoint URL and HTTP method
  - Request parameters and their types
  - Response format with example
  - Error codes and their meanings
  - Authentication requirements
  - Rate limiting information if applicable

</api_documentation>

## Style Guidelines

- Use consistent heading levels
- Include blank lines around headings and lists
- Use backticks for file names, directory names, and commands
- Include descriptive alt text for images
- Keep line lengths under 100 characters where possible
- Use proper indentation (2 spaces) in code examples
