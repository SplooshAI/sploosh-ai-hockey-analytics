---
trigger: always_on
---

# Git Workflow Rules

These global rules define standardized Git workflow practices to be applied across all projects.

<branch_creation>

- Always create feature branches from the main branch
- **CRITICAL: Before creating a branch, you MUST run `date +%Y.%m.%d` to get the current date**
- **NEVER hardcode or guess the date - always execute the date command first**
- Use descriptive branch names with the following format: `YYYY.MM.DD/description-in-kebab-case`
  - Date format: Current date in YYYY.MM.DD format (e.g., 2025.10.19)
  - Examples: `2025.10.19/add-player-statistics`, `2025.10.19/fix-animation-slider-bug`
  - The date prefix MUST be obtained by running: `date +%Y.%m.%d`
- Push new branches to the remote repository immediately after creation
- Set up upstream tracking when pushing a new branch

**Branch Creation Process:**
1. Run `date +%Y.%m.%d` to get today's date
2. Use the output to create the branch name: `YYYY.MM.DD/description`
3. Create the branch: `git checkout -b YYYY.MM.DD/description`
4. Push and set upstream: `git push -u origin YYYY.MM.DD/description`

</branch_creation>

<pull_request_workflow>

- When asked to create a pull request for a branch, follow this process:
  1. Review the work and commits completed in the branch
  2. Review GitHub Workflows to check for any PR title naming conventions
  3. Use the contents of .github/pull_request_template.md as the template for the PR body
  4. Use the GitHub CLI (gh) to create the pull request with a properly formatted body:

     ```bash
     gh pr create --title "TITLE" --body "## Description
     
     Detailed description of changes...
     
     ### Changes Made
     - Item 1
     - Item 2
     
     ### Type of Change
     
     ```bash
     version: [feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert]
     ```

- **PR Template Requirements**:
  - All PRs must use the provided template with the following sections:
    - Description
    - Related Issues
    - Testing
    - Screenshots (if applicable)
    - Item 1
    - Item 2

    **Type of Change**

    ```bash
    version: [feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert]
    ```

- **PR Description Guidelines**:
  - Use proper markdown formatting with clear section headers
  - Escape special characters in shell commands
  - Use code blocks with language specification (e.g., \`\`\`bash, \`\`\`javascript)
  - Keep the description concise but informative
  - Include testing verification steps
  - Note any breaking changes or important considerations

- **Code Formatting Rules**:
  - Never automatically commit code changes without explicit approval
  - Verify all changes work as expected before suggesting commits
  - Provide clear explanations of changes before implementing them
  - Use proper escaping for multiline strings in shell commands
  - Always verify the output format before submitting

- If a PR has already been created but needs modification:
  1. NEVER close and recreate a PR - this loses PR history and creates confusion
  2. Always use `gh pr edit PR-NUMBER` to modify an existing PR
  3. For body changes: `gh pr edit PR-NUMBER --body "NEW-BODY"`
  4. For title changes: `gh pr edit PR-NUMBER --title "NEW-TITLE"`

</pull_request_workflow>

<commit_messages>

- Follow the Conventional Commits format for all commit messages
- Format: `type(scope): description`
  - type: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
  - scope: optional component or module affected (in parentheses)
  - description: concise description of the change in present tense
- Examples:
  - `feat: add player statistics visualization`
  - `fix(animation): prevent slider from being cut off on mobile`
  - `docs: update README with new deployment instructions`
- For breaking changes, add an exclamation mark after the type/scope:
  - `feat!: change API response format`

</commit_messages>

<code_review>

- All PRs must be reviewed by at least one team member before merging
- Address all review comments before merging
- Use the GitHub review system to request changes or approve PRs
- When addressing review comments, reference the comment in your commit message

</code_review>
