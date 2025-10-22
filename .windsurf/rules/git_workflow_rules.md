---
trigger: always_on
---

# Git Workflow Rules

These global rules define standardized Git workflow practices to be applied across all projects.

<branch_creation>

- Always create feature branches from the main branch
- **CRITICAL: Extract the current date from the metadata timestamp in the user's request**
- **The metadata shows the date like "Oct 19, 2025 at 9:31pm" - convert this to YYYY.MM.DD format (2025.10.19)**
- **NEVER hardcode dates like 2025.01.19 or guess the date - ALWAYS use the actual current date from metadata**
- Use descriptive branch names with the following format: `YYYY.MM.DD/description-in-kebab-case`
  - Date format: Current date in YYYY.MM.DD format extracted from metadata (e.g., 2025.10.19)
  - Examples: `2025.10.19/add-player-statistics`, `2025.10.19/fix-animation-slider-bug`
- Push new branches to the remote repository immediately after creation
- Set up upstream tracking when pushing a new branch

**Branch Creation Process:**
For manual branch creation or in shell scripts, use the `date` command to automatically generate the correct date prefix:

```bash
# Create branch with today's date
git checkout -b $(date +%Y.%m.%d)/feature-description

# Complete workflow
git checkout main && \
git pull origin main && \
git checkout -b $(date +%Y.%m.%d)/feature-description && \
git push -u origin $(git branch --show-current)
```

The `date +%Y.%m.%d` format produces:

- %Y = 4-digit year (e.g., 2025)
- %m = 2-digit month (e.g., 10 for October)  
- %d = 2-digit day (e.g., 22)
- Result: 2025.10.22

**When to use each method:**

- AI Assistants (Cascade): Extract date from metadata timestamp
- Manual CLI: Use `date` command
- Scripts/Automation: Use `date` command

**WRONG EXAMPLES TO AVOID:**
- ❌ 2025.01.19/feature (wrong month - January instead of October)
- ❌ 2025.05.17/feature (wrong date entirely)
- ✅ 2025.10.19/feature (correct - matches Oct 19, 2025)

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